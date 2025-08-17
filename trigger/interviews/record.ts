import { db } from '@/lib/db';
import { interviewAnswers, users, interviewQuestions } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { schemaTask, configure, logger } from '@trigger.dev/sdk/v3';
import { createClient as createDeepgramClient } from '@deepgram/sdk';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase/supabaseAdmin';
import { analyseSTARTask } from './analyse-star-task';

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

    try {
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

      // 3. Get user subscription tier and question data for analysis
      const [userData, questionData] = await Promise.all([
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
        .limit(1)
      ]);

      const userTier = userData[0]?.subscriptionTier || 'free';
      const question = questionData[0];

      if (!question) {
        throw new Error(`Question not found: ${payload.questionId}`);
      }

      logger.info('Starting STAR analysis with batch.triggerAndWait', {
        responseId: payload.responseId,
        userTier,
        questionType: question.questionType,
      });

      // 4. Run STAR analysis using the task directly
      let starAnalysisResult = null;
      let overallScore = null;
      const errors: string[] = [];

      try {
        const taskResult = await analyseSTARTask.triggerAndWait({
          transcription: transcript,
          questionText: question.questionText,
          questionType: question.questionType,
          userTier: userTier,
          answerId: payload.responseId,
        });

        if (taskResult.ok) {
          starAnalysisResult = taskResult.output;
          overallScore = taskResult.output.overallScore;

          logger.info("STAR analysis successful", {
            responseId: payload.responseId,
            overallScore: taskResult.output.overallScore,
            starCompleteness: taskResult.output.starCompleteness,
          });

          // 5. Update database with transcription and analysis results
          await db.update(interviewAnswers)
            .set({
              transcription: transcript,
              overallScore: overallScore,
              starScores: starAnalysisResult,
              evaluation: starAnalysisResult.evaluation,
              analyzedAt: new Date(),
              updatedAt: new Date(),
              audioUrl: payload.audioPath
            })
            .where(eq(interviewAnswers.id, payload.responseId));

          logger.info('Database updated with transcription and analysis', {
            responseId: payload.responseId,
            overallScore,
          });

        } else {
          throw new Error(`Task failed: ${taskResult.error}`);
        }

      } catch (analysisError) {
        const errorMsg = `STAR analysis failed: ${analysisError instanceof Error ? analysisError.message : 'Unknown error'}`;
        errors.push(errorMsg);
        logger.error("STAR analysis failed", {
          error: analysisError instanceof Error ? analysisError.message : 'Unknown error',
          responseId: payload.responseId,
        });

        // If analysis fails, only store transcription without scores
        await db.update(interviewAnswers)
          .set({
            transcription: transcript,
            updatedAt: new Date(),
            audioUrl: payload.audioPath
          })
          .where(eq(interviewAnswers.id, payload.responseId));

        logger.info('Database updated with transcription only (analysis failed)', {
          responseId: payload.responseId,
        });
      }

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

      return {
        success: true,
        responseId: payload.responseId,
        interviewId: payload.interviewId,
        transcript,
        analysis: {
          overallScore,
          starAnalysis: starAnalysisResult,
          errors,
          hasAnalysis: !!starAnalysisResult,
        },
      };
    } catch (error) {
      logger.error('Error processing interview recording', {
        responseId: payload.responseId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  },
});