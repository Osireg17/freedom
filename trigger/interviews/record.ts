import { db } from '@/lib/db';
import { interviewAnswers, users, interviewQuestions, interviews } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { schemaTask, configure, logger, batch } from '@trigger.dev/sdk/v3';
import { createClient as createDeepgramClient } from '@deepgram/sdk';
import { z } from 'zod';
import { S3Client, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { analyseSTARTask } from './analyse-star-task';
import { analyseCultureTask } from './analyse-culture-task';
import { getOrResearchCompanyProfile } from '@/lib/analysis/company-research';

// Configure Trigger.dev
configure({
  // this is the default and if the `TRIGGER_SECRET_KEY` environment variable is set, can omit calling configure
  secretKey: process.env["TRIGGER_SECRET_KEY"],
});

// Configure AWS S3 Client for Railway Bucket
const bucketAccessKeyId = process.env.BUCKET_ACCESS_KEY_ID;
const bucketSecretAccessKey = process.env.BUCKET_SECRET_ACCESS_KEY;
const bucketEndpoint = process.env.BUCKET_ENDPOINT;
const bucketRegion = process.env.BUCKET_REGION || 'auto';
const bucketName = process.env.BUCKET_NAME;

if (!bucketAccessKeyId || !bucketSecretAccessKey || !bucketEndpoint || !bucketName) {
  throw new Error(
    'Missing S3 Bucket configuration environment variables. Please check BUCKET_ACCESS_KEY_ID, BUCKET_SECRET_ACCESS_KEY, BUCKET_ENDPOINT, and BUCKET_NAME.'
  );
}

const s3Client = new S3Client({
  region: bucketRegion,
  endpoint: bucketEndpoint,
  credentials: {
    accessKeyId: bucketAccessKeyId,
    secretAccessKey: bucketSecretAccessKey,
  },
  forcePathStyle: true,
});

const BUCKET_NAME = bucketName;


// Define schema for payload validation
const RecordInterviewPayloadSchema = z.object({
  responseId: z.string(),
  interviewId: z.string(),
  questionId: z.string(),
  userId: z.string(),
  audioPath: z.string(),
});

/**
 * Processes an interview recording: downloads the raw video/audio file from the S3-compatible Railway bucket,
 * transcribes it using Deepgram, performs AI evaluation on STAR, communication, culture, and job alignment metrics,
 * writes the transcription and scores to the database, and deletes the raw file from bucket storage.
 *
 * Preconditions:
 * - The interview response record must exist in the database.
 * - The raw video/audio file must exist in the Railway bucket.
 *
 * Constraints:
 * - audioPath must be a valid path pointing to the object in the bucket.
 *
 * Side effects:
 * - Downloads the audio file from S3.
 * - Updates the database record with the transcript, evaluation, and score metrics.
 * - Deletes the raw audio file from the S3 bucket to clean up storage.
 *
 * Signals:
 * - S3 download failure -> Error
 * - Transcription failure -> Error
 * - Analysis tasks failures -> Error
 */
export const recordInterviewTask = schemaTask({
  id: 'record-interview-task',
  maxDuration: 300, // 5 minutes maximum duration
  schema: RecordInterviewPayloadSchema,

  async run(payload) {
    logger.info('Starting interview recording process', {
      responseId: payload.responseId,
      interviewId: payload.interviewId,
      questionId: payload.questionId,
    });

    // Initialize Deepgram with v3 SDK
    const deepgram = createDeepgramClient(process.env.NEXT_PUBLIC_DEEPGRAM_API_KEY as string);

    let nodeBuffer: Buffer;
    const isLocalDev = !process.env.TRIGGER_SECRET_KEY?.startsWith('tr_prod');

    if (isLocalDev) {
      logger.info('Local development mode: downloading file from local Encore responses API', { audioPath: payload.audioPath });
      const res = await fetch(`http://localhost:4000/internal/responses/file/${encodeURIComponent(payload.audioPath)}`);
      if (!res.ok) {
        throw new Error(`Failed to download from local Encore: status ${res.status}`);
      }
      const arrayBuffer = await res.arrayBuffer();
      nodeBuffer = Buffer.from(arrayBuffer);
    } else {
      const command = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: payload.audioPath,
      });

      const s3Response = await s3Client.send(command);
      if (!s3Response.Body) {
        throw new Error('Empty body returned from S3');
      }

      const audioBytes = await s3Response.Body.transformToByteArray();
      nodeBuffer = Buffer.from(audioBytes);
    }

    if (nodeBuffer.length === 0) {
      throw new Error('Empty buffer returned from storage');
    }

    logger.info('Audio downloaded for transcription', { audioPath: payload.audioPath });

    // 2. Transcribe audio with Deepgram using v3 SDK

    const { result, error } = await deepgram.listen.prerecorded.transcribeFile(
      nodeBuffer, // Pass the Node.js Buffer
      {
        model: "nova-3",
        smart_format: true,
        language: "en-US",
        detect_language: true
      }
    );

    if (error || !result) {
      throw new Error(`Transcription failed: ${error?.message || 'No result returned'}`);
    }

    // Extract the transcript from the result
    const transcript = result.results?.channels[0]?.alternatives[0]?.transcript || '';

    logger.info('Transcription completed', {
      responseId: payload.responseId,
      transcriptLength: transcript.length,
      transcriptSnippet: transcript.substring(0, 100), // Log first 100 characters
    });

    // 3. Get user subscription tier, question data, and interview data for analysis
    const [userData, questionData, interviewData] = await Promise.all([
      db.select({
        subscriptionTier: users.subscriptionTier,
      })
        .from(users)
        .where(eq(users.id, payload.userId))
        .limit(1),

      db.select({
        questionText: interviewQuestions.questionText,
        questionType: interviewQuestions.questionType,
      })
        .from(interviewQuestions)
        .where(eq(interviewQuestions.id, payload.questionId))
        .limit(1),

      db.select({
        companyName: interviews.companyName,
      })
        .from(interviewQuestions)
        .innerJoin(interviews, eq(interviewQuestions.interviewId, interviews.id))
        .where(eq(interviewQuestions.id, payload.questionId))
        .limit(1)
    ]);

    const userTier = userData[0]?.subscriptionTier || 'free';
    const question = questionData[0];

    if (!question) {
      throw new Error(`Question not found: ${payload.questionId}`);
    }

    // 4. Get company profile for culture analysis (if applicable)
    const companyName = interviewData[0]?.companyName;
    let companyProfile = null;

    if (userTier !== 'free' && companyName) {
      logger.info('Fetching company profile for culture analysis', {
        responseId: payload.responseId,
        companyName,
        userTier,
      });

      companyProfile = await getOrResearchCompanyProfile(companyName);

      if (companyProfile && companyProfile.coreValues) {
        logger.info('Company profile retrieved', {
          responseId: payload.responseId,
          company: companyProfile.companyName,
          valuesCount: companyProfile.coreValues.length,
        });
      } else {
        logger.info('No company profile available for culture analysis', {
          responseId: payload.responseId,
          companyName,
        });
      }
    }

    // 5. Fan-out: Run analysis tasks in parallel using batch.triggerByTaskAndWait
    logger.info('Starting parallel analysis tasks', {
      responseId: payload.responseId,
      userTier,
      questionType: question.questionType,
      hasCultureAnalysis: !!(companyProfile && companyProfile.coreValues),
    });

    // Trigger all tasks in parallel and wait for results
    // Note: We conditionally include culture analysis based on company profile availability
    const analysisResults = companyProfile && companyProfile.coreValues
      ? await batch.triggerByTaskAndWait([
        {
          task: analyseSTARTask,
          payload: {
            transcription: transcript,
            questionText: question.questionText,
            questionType: question.questionType,
            userTier: userTier,
            answerId: payload.responseId,
          }
        },
        {
          task: analyseCultureTask,
          payload: {
            transcription: transcript,
            questionText: question.questionText,
            companyProfile,
            userTier,
            answerId: payload.responseId,
          }
        }
      ])
      : await batch.triggerByTaskAndWait([
        {
          task: analyseSTARTask,
          payload: {
            transcription: transcript,
            questionText: question.questionText,
            questionType: question.questionType,
            userTier: userTier,
            answerId: payload.responseId,
          }
        }
      ]);

    const { runs } = analysisResults;

    // 6. Process STAR results (first task, always present)
    const starRun = runs[0];
    if (!starRun.ok) {
      logger.error("STAR analysis failed", {
        error: starRun.error,
        responseId: payload.responseId,
      });
      throw new Error(`STAR analysis failed: ${starRun.error}`);
    }

    const starAnalysisResult = starRun.output;
    const overallScore = starRun.output.overallScore;

    logger.info("STAR analysis completed successfully", {
      responseId: payload.responseId,
      overallScore: starRun.output.overallScore,
      starCompleteness: starRun.output.starCompleteness,
    });

    // 7. Process Culture results (second task, conditional)
    let cultureAnalysisResult = null;

    if (runs.length > 1 && runs[1]) {
      const cultureRun = runs[1];

      if (cultureRun.ok) {
        cultureAnalysisResult = cultureRun.output;
        logger.info('Culture alignment analysis completed successfully', {
          responseId: payload.responseId,
          overallAlignment: cultureAnalysisResult?.overall_alignment,
        });
      } else {
        logger.warn('Culture alignment analysis failed - continuing without it', {
          responseId: payload.responseId,
          error: cultureRun.error,
        });
        // Don't throw - culture analysis failure shouldn't break the pipeline
      }
    }

    // 6. Update database with transcription and analysis results
    await db.update(interviewAnswers)
      .set({
        transcription: transcript,
        overallScore: overallScore,
        starScores: starAnalysisResult,
        evaluation: starAnalysisResult.evaluation,
        companyAlignmentScores: cultureAnalysisResult,
        analyzedAt: new Date(),
        updatedAt: new Date(),
        audioUrl: payload.audioPath
      })
      .where(eq(interviewAnswers.id, payload.responseId));

    logger.info('Database updated with transcription and analysis', {
      responseId: payload.responseId,
      overallScore,
    });

    if (isLocalDev) {
      logger.info('Local development mode: deleting file from local Encore responses API', { audioPath: payload.audioPath });
      try {
        const res = await fetch(`http://localhost:4000/internal/responses/file/${encodeURIComponent(payload.audioPath)}`, {
          method: 'DELETE'
        });
        if (!res.ok) {
          throw new Error(`Failed to delete from local Encore: status ${res.status}`);
        }
        logger.info('Audio file deleted successfully from local Encore', {
          responseId: payload.responseId,
          audioPath: payload.audioPath,
        });
      } catch (error) {
        logger.error('Failed to delete raw response file from local Encore during task cleanup', { error });
      }
    } else {
      try {
        const deleteCommand = new DeleteObjectCommand({
          Bucket: BUCKET_NAME,
          Key: payload.audioPath,
        });

        await s3Client.send(deleteCommand);
        logger.info('Audio file deleted successfully from S3', {
          responseId: payload.responseId,
          audioPath: payload.audioPath,
        });
      } catch (error) {
        logger.error('Failed to delete audio file from S3', {
          error,
          responseId: payload.responseId,
          audioPath: payload.audioPath,
        });
      }
    }

    logger.info('Interview recording process completed successfully', {
      responseId: payload.responseId,
    });

    return {
      success: true,
      responseId: payload.responseId,
      interviewId: payload.interviewId,
      transcript,
      analysis: {
        overallScore,
        starAnalysis: starAnalysisResult,
        cultureAlignment: cultureAnalysisResult,
      },
    };

  },
});
