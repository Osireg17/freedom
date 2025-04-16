// src/trigger/interviews/job.ts
import { db } from '@/lib/db';
import { interviews, interviewQuestions } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import OpenAI from 'openai';
import { schemaTask, logger, configure } from '@trigger.dev/sdk/v3';
import { v4 as uuidv4 } from 'uuid';
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
  category: string;
  type: 'behavioral' | 'technical';
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
// Helper function to generate the interview prompt - INDUSTRY AGNOSTIC
function generateInterviewPrompt(payload: JobInterviewPayload): string {
  const context = `
CONTEXT:
- Company Name: ${payload.companyName}
- Position Title: ${payload.jobTitle}
- Required Experience Level: ${payload.yearsExperience} years
- Job Description: ${payload.jobDescription}
`;

  const instructions = `
INSTRUCTIONS:
Based *only* on the provided CONTEXT (especially the Job Description), generate 5 high-quality interview questions suitable for a one-way video interview screen for the specific Position Title at the specified Company Name.

The questions MUST:
1. Be **directly relevant** to the responsibilities, skills, and qualifications outlined in the Job Description.
2. Be appropriate for a candidate with the specified Required Experience Level.
3. Assess a mix of behavioral competencies and role-specific skills/knowledge identified *from the Job Description*. Aim for a balance (e.g., 3 behavioral, 2 skill-based/situational, but adjust based on the role's nature).
4. Elicit detailed responses, encouraging the STAR method (Situation, Task, Action, Result) for behavioral questions where applicable.
5. Cover diverse key competency areas **derived from the Job Description** (e.g., problem-solving, communication, teamwork, leadership, analytical skills, specific domain knowledge, technical/practical abilities if mentioned).
`;

  const guidelines = `
IMPORTANT GUIDELINES:
- **Derive Key Competencies:** Identify the core skills, knowledge areas, and behavioral traits required for *this specific role* by analyzing the Job Description. Base your questions on these derived competencies.
- **Skill/Knowledge Questions:** If the Job Description mentions required technical skills, practical abilities, certifications, or specific knowledge areas (e.g., financial modeling, specific regulations, laboratory techniques, software tools), formulate questions to assess proficiency or experience in those *exact areas* or related fields and tasks associated with the role.
- **Situational Questions:** Create situational questions that assess how candidates would approach hypothetical scenarios relevant to the role, based on the Job Description. These should be realistic and aligned with the responsibilities outlined.
- **Behavioral Questions:** Frame behavioral questions around scenarios relevant to the responsibilities and challenges likely faced in *this role*, based on the Job Description.
- **Tool/Methodology Agnosticism:** If asking about experience with specific tools, software, or methodologies mentioned in the Job Description, phrase the question to **allow candidates to discuss analogous experience** if they haven't used the exact item (e.g., "Describe your experience with project management software like [Tool from JD], or similar tools..." or "Tell me about a time you used data analysis techniques to..."). **Avoid using company-specific jargon or internal tool names** unless clearly defined as a public requirement in the Job Description.
- **Experience Level:** Adjust the complexity and scope of the questions to match the Required Experience Level. More senior roles might require questions about strategy, leadership, or complex problem-solving.
- **Clarity and Focus:** Ensure questions are clear, unambiguous, and focused on assessing a specific competency or skill relevant to the Job Description.
- **Time Constraint:** Questions should be answerable within approximately ${payload.timeToAnswer} seconds.
`;

  const responseFormat = `
RESPONSE FORMAT (JSON array):
{
  "questions": [
    {
      "question": "Detailed, open-ended question reflecting the guidelines and derived competencies.",
      "category": "The specific key competency area derived from the Job Description that this question assesses (e.g., 'Project Management', 'Client Communication', 'Data Analysis', 'Regulatory Compliance', 'Machine Operation', 'Software Development Skill X')",
      "type": "behavioral" // Use 'behavioral' for questions primarily assessing past behavior or handling situations.
           // or "skill-based" // Use 'skill-based' for questions primarily assessing specific knowledge, technical/practical ability, or application of skills.
           // or "situational" // Use 'situational' for hypothetical scenarios assessing judgment or approach. Choose the most appropriate type.
    }
    // ... total of 5 questions
  ]
}
`;

  // Changed the AI's persona slightly
  return `You are an expert AI assistant tasked with generating fair and relevant screening interview questions for a one-way video interview. You will receive context about a specific job role at a specific company. Your goal is to create questions based *strictly* on the provided Job Description and role requirements, suitable for candidates from any background who meet the qualifications.
${context}
${instructions}
${guidelines}
${responseFormat}
Generate the 5 questions now based *only* on the provided context.`.trim();
}

// Helper function to generate questions with OpenAI
async function generateQuestionsWithOpenAI(prompt: string): Promise<GeneratedQuestion[]> {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
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

      return parsed.questions.map((q: { question: string; category: string; type: 'behavioral' | 'technical' }) => ({
        question: q.question,
        category: q.category,
        type: q.type
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
      id: uuidv4(),
      interviewId,
      questionNumber: i + 1,
      questionText: question.question,
      questionType: question.type,
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