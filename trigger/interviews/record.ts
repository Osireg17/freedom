import { db } from '@/lib/db';
import { interviewAnswers } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { schemaTask, configure, logger, batch } from '@trigger.dev/sdk/v3';
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
  questionText: z.string(),
  questionType: z.string(),
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

      await batch.triggerByTaskAndWait([
      {
        task: analyseSTARTask,
        payload: {
          transcription: transcript,
          questionText: payload.questionText,
          questionType: payload.questionType,
        },
      },

    ]);

      // 4. Update database with transcription
      await db.update(interviewAnswers)
        .set({
          transcription: transcript,
          updatedAt: new Date(),
          audioUrl: payload.audioPath
        })
        .where(eq(interviewAnswers.id, payload.responseId));

      logger.info('Database updated with transcription', {
        responseId: payload.responseId,
      });

      // 5. Delete audio file from storage
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