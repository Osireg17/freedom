// src/trigger/interviews/job.ts
import { db } from '@/lib/db';
import { interviews, interviewQuestions } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import OpenAI from 'openai';
import { zodTextFormat } from 'openai/helpers/zod';
import { schemaTask, logger, configure } from '@trigger.dev/sdk/v3';
import { z } from 'zod';
import { JobInterviewPayloadSchema } from '@/types/interview';
import { generateInterviewPrompt } from '@/lib/middleware/create-prompts';

// Configure Trigger.dev
configure({
  secretKey: process.env.TRIGGER_SECRET_KEY,
});

// Initialize OpenAI client
const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
if (!apiKey) {
  throw new Error('OPENAI_API_KEY is not defined');
}

const openai = new OpenAI({
  apiKey: apiKey,
});

// Define structured output schema for AI response
const QuestionSchema = z.object({
  question: z.string().describe("Detailed, open-ended interview question"),
  category: z.string().describe("The specific key competency area this question assesses"),
  type: z.enum(['behavioral', 'skill-based', 'situational']).describe("The type of question being asked")
});

const InterviewQuestionsResponseSchema = z.object({
  questions: z.array(QuestionSchema).length(5).describe("Array of exactly 5 interview questions")
});

type GeneratedQuestion = z.infer<typeof QuestionSchema>;

interface TaskResult {
  success: boolean;
  interviewId: string;
  questions: GeneratedQuestion[];
}

export const generateJobInterviewQuestionsJob = schemaTask({
  id: 'generate-job-interview-questions',
  maxDuration: 300, // 5 minutes maximum duration
  schema: JobInterviewPayloadSchema,

  async run(payload): Promise<TaskResult> {
    logger.info('Starting job interview questions generation', { 
      interviewId: payload.interviewId 
    });

    try {
      // Generate prompt based on job information
      const prompt = generateInterviewPrompt(payload);
      logger.info('Generated interview prompt', { 
        prompt: prompt.substring(0, 200) + '...' // Log just the beginning for brevity
      });

      // Get AI response with structured questions
      const questionsResponse = await generateQuestionsWithOpenAI(prompt);
      logger.info('Generated questions successfully', {
        interviewId: payload.interviewId,
        questionCount: questionsResponse.questions.length,
      });

      // Store questions in database
      await storeInterviewQuestions(payload.interviewId, questionsResponse.questions);
      logger.info('Stored interview questions in database', { 
        interviewId: payload.interviewId 
      });

      // Update interview status to ready
      await updateInterviewStatus(payload.interviewId, 'ongoing');
      logger.info('Updated interview status to ongoing', { 
        interviewId: payload.interviewId 
      });

      return {
        success: true,
        interviewId: payload.interviewId,
        questions: questionsResponse.questions,
      };
    } catch (error) {
      return handleTaskError(error, payload.interviewId);
    }
  },
});


// Helper function to generate questions with OpenAI Responses API
async function generateQuestionsWithOpenAI(prompt: string): Promise<z.infer<typeof InterviewQuestionsResponseSchema>> {
  try {
    const response = await openai.responses.parse({
      model: "gpt-5-mini",
      input: [
        {
          role: "system",
          content: "You are an expert interviewer who creates detailed, industry-specific behavioral interview questions. You must generate exactly 5 questions that follow the structured format provided."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      text: {
        format: zodTextFormat(InterviewQuestionsResponseSchema, "interview_questions"),
      },
      temperature: 0.8,
      max_output_tokens: 2000,
      top_p: 1,
    });

    // Check if response completed successfully
    if (response.status !== "completed") {
      throw new Error(`Response incomplete: ${response.status}`);
    }

    // Handle potential refusal
    const messageOutput = response.output[0];
    if (messageOutput.type !== 'message') {
      throw new Error('Unexpected output type from OpenAI');
    }

    const content = messageOutput.content[0];
    if (content.type === 'refusal') {
      throw new Error(`OpenAI refused the request: ${content.refusal}`);
    }

    // Return the parsed structured data
    if (!response.output_parsed) {
      throw new Error('Failed to parse structured response from OpenAI');
    }
    return response.output_parsed;

  } catch (error) {
    logger.error('Error generating questions with OpenAI Responses API', { error });
    
    // Provide more specific error context
    if (error instanceof Error) {
      throw new Error(`Failed to generate questions: ${error.message}`);
    }
    throw new Error('Failed to generate questions with OpenAI Responses API');
  }
}

// Helper function to update interview status
async function updateInterviewStatus(interviewId: string, status: 'not_started' | 'ongoing' | 'completed') {
  await db.update(interviews)
    .set({ 
      status, 
      updatedAt: new Date() 
    })
    .where(eq(interviews.id, interviewId));
}

// Helper function to store interview questions in database
async function storeInterviewQuestions(interviewId: string, questions: GeneratedQuestion[]) {
  for (let i = 0; i < questions.length; i++) {
    const question = questions[i];
    
    await db.insert(interviewQuestions).values({
      interviewId,
      questionNumber: i + 1,
      questionText: question.question,
      questionType: question.type === 'skill-based' ? 'technical' : 
        ['behavioral', 'situational'].includes(question.type) 
          ? question.type as 'behavioral' | 'situational'
          : 'other',
    });
  }
}

// Helper function to handle errors
function handleTaskError(error: unknown, interviewId: string): never {
  if (error instanceof z.ZodError) {
    logger.error('Validation error in payload', { interviewId, issues: error.issues });
    throw new Error('Invalid payload format');
  }

  logger.error('Error in generateJobInterviewQuestions task', {
    interviewId,
    error: error instanceof Error ? error.message : 'Unknown error',
  });
  throw error;
}