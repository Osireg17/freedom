import { db } from '@/lib/db';
import { interviewAnswers, users, interviewQuestions, interviews } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { schemaTask, configure, logger, batch } from '@trigger.dev/sdk/v3';
import { createClient as createDeepgramClient } from '@deepgram/sdk';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase/supabaseAdmin';
import { analyseSTARTask } from './analyse-star-task';
import { analyseCultureTask } from './analyse-culture-task';
import { getOrResearchCompanyProfile } from '@/lib/analysis/company-research';

// Configure Trigger.dev
configure({
  secretKey: process.env.TRIGGER_SECRET_KEY,
});


// Define schema for payload validation
const RecordInterviewPayloadSchema = z.object({
  responseId: z.string(),
  interviewId: z.string(),
  questionId: z.string(),
  userId: z.string(),
  audioPath: z.string(),
});

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

      // 1. Get audio from storage
      const { data: audioData, error: downloadError } = await supabaseAdmin.storage
        .from('interview-responses')
        .download(payload.audioPath);

      if (downloadError || !audioData) {
        throw new Error(`Failed to download audio: ${downloadError?.message || 'No data returned'}`);
      }

      logger.info('Audio downloaded for transcription', { audioPath: payload.audioPath });

      // 2. Transcribe audio with Deepgram using v3 SDK
      const audioBuffer = await audioData.arrayBuffer();
      const nodeBuffer = Buffer.from(audioBuffer);

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

      // 6. Delete audio file from storage
      const { error: deleteError } = await supabaseAdmin.storage
        .from('interview-responses')
        .remove([payload.audioPath]);

      if (deleteError) {
        logger.warn('Failed to delete audio file', {
          audioPath: payload.audioPath,
          error: deleteError.message,
        });
      } else {
        logger.info('Audio file deleted successfully', { audioPath: payload.audioPath });
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
