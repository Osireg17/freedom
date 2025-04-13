// src/trigger/interviews/job.ts
import { db } from '@/lib/db';
import { interviews, interviewQuestions } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import OpenAI from 'openai';
import { schemaTask, logger, configure } from '@trigger.dev/sdk/v3';
import { createId } from '@paralleldrive/cuid2';
import { z } from 'zod';

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

// Define schema for payload validation
const JobInterviewPayloadSchema = z.object({
  interviewId: z.string(),
  userId: z.string(),
  jobTitle: z.string().min(2),
  companyName: z.string().min(2),
  jobDescription: z.string().min(50),
  yearsExperience: z.number().min(0),
  timeToAnswer: z.number().min(30).max(300),
  prepTime: z.number().min(0).max(300),
});

type JobInterviewPayload = z.infer<typeof JobInterviewPayloadSchema>;

interface GeneratedQuestion {
  question: string;
  area: string;
  context: string;
}

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
      // Update interview status to processing
      await updateInterviewStatus(payload.interviewId, 'ongoing');
      logger.info('Updated interview status to ongoing', { 
        interviewId: payload.interviewId 
      });

      // Generate prompt based on job information
      const prompt = generateInterviewPrompt(payload);
      logger.info('Generated interview prompt', { 
        prompt: prompt.substring(0, 200) + '...' // Log just the beginning for brevity
      });

      // Get AI response with questions
      const questions = await generateQuestionsWithOpenAI(prompt);
      logger.info('Generated questions successfully', {
        interviewId: payload.interviewId,
        questionCount: questions.length,
      });

      // Store questions in database
      await storeInterviewQuestions(payload.interviewId, questions);
      logger.info('Stored interview questions in database', { 
        interviewId: payload.interviewId 
      });

      // Update interview status to ready
      await updateInterviewStatus(payload.interviewId, 'completed');
      logger.info('Updated interview status to completed', { 
        interviewId: payload.interviewId 
      });

      return {
        success: true,
        interviewId: payload.interviewId,
        questions,
      };
    } catch (error) {
      return handleTaskError(error, payload.interviewId);
    }
  },
});

// Helper function to generate the interview prompt
function generateInterviewPrompt(payload: JobInterviewPayload): string {
    return `You are an expert AI interviewer for AceYourHireVue, specializing in creating realistic one-way video interview questions that assess candidates' qualifications for specific job positions. Your task is to generate thoughtful, relevant questions based on the job description provided.
  
  CONTEXT:
  - Company Name: ${payload.companyName}
  - Position: ${payload.jobTitle}
  - Experience Level: ${payload.yearsExperience} years
  - Job Description: ${payload.jobDescription}
  
  INSTRUCTIONS:
  Generate 5 high-quality interview questions that:
  1. Are directly relevant to the ${payload.jobTitle} role at ${payload.companyName}
  2. Match the complexity appropriate for someone with ${payload.yearsExperience} years of experience
  3. Include a mix of behavioral and technical questions (3 behavioral, 2 technical)
  4. Follow the STAR methodology (Situation, Task, Action, Result) to elicit comprehensive responses
  5. Cover different competency areas relevant to the role
  
  QUESTION CATEGORIES TO INCLUDE:
  - Technical Skills: Questions that assess specific technical knowledge mentioned in the job description
  - Problem Solving: Scenario-based questions related to challenges in this role
  - Leadership/Teamwork: Questions about collaboration and influence
  - Communication: Questions about stakeholder interactions common in this role
  - Industry Knowledge: Questions specific to ${payload.companyName}'s industry
  
  RESPONSE FORMAT(JSON array):
  {
    "questions": [
      {
        "question": "Detailed, open-ended question that prompts a STAR response",
        "category": "One of the categories listed above",
        "type": "behavioral" or "technical",
      }
    ]
  }
  
  IMPORTANT GUIDELINES:
  - Use industry-specific terminology relevant to ${payload.jobTitle}
  - Scale question difficulty based on ${payload.yearsExperience} years of experience
  - Reference technologies, methodologies, or skills mentioned in the job description
  - Create questions that assess both past experiences and hypothetical scenarios
  - Ensure questions are specific enough to demonstrate relevant expertise but open-ended enough to allow candidates to showcase their unique experiences
  - Format questions to be answered within ${payload.timeToAnswer} seconds (typical one-way video interview answer time)
  - Avoid generic questions that could apply to any job role
  - Ensure technical questions are specific to technologies/skills mentioned in the job description
  
  Your goal is to create questions that would be used in a real HireVue-style one-way video interview to thoroughly evaluate a candidate's fit for this specific role.`.trim();
  }

// Helper function to generate questions with OpenAI
async function generateQuestionsWithOpenAI(prompt: string): Promise<GeneratedQuestion[]> {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert interviewer who creates detailed, industry-specific behavioral interview questions."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: {
        "type": "json_object"
      },
      temperature: 0.7,
      max_tokens: 2000,
      top_p: 1,
      frequency_penalty: 0.3,
      presence_penalty: 0.6
    });

    const responseText = completion.choices[0].message.content;
    if (!responseText) {
      throw new Error('Empty response from OpenAI');
    }

    try {
      const parsed = JSON.parse(responseText);
      if (!parsed.questions || !Array.isArray(parsed.questions)) {
        throw new Error('Invalid response format: expected array of questions');
      }

      return parsed.questions.map((q: { question: string; area: string; context: string }) => ({
        question: q.question,
        area: q.area,
        context: q.context
      }));
    } catch (parseError) {
      logger.error('Error parsing OpenAI response', { responseText, error: parseError });
      throw new Error('Failed to parse OpenAI response as JSON');
    }
  } catch (error) {
    logger.error('Error generating questions with OpenAI', { error });
    throw new Error('Failed to generate questions with OpenAI');
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
  // Insert each question into the database
  for (let i = 0; i < questions.length; i++) {
    const question = questions[i];
    
    await db.insert(interviewQuestions).values({
      id: createId(),
      interviewId,
      questionNumber: i + 1,
      questionText: question.question,
      questionType: 'behavioral', // Could be dynamic based on question.area
      // Additional metadata could be stored in a separate table or as JSON
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