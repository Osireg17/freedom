// trigger/interviews/analyse-star-task.ts
import getSTARAnalysisPrompt from "@/lib/middleware/star-prompt";
import { task, logger } from "@trigger.dev/sdk/v3";
import OpenAI from "openai";

// Initialize OpenAI with consistent API key
const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || process.env.OPENAI_API_KEY,
});

interface STARTaskPayload {
  transcription: string;
  questionText: string;
  questionType: string;
  userTier: string;
  answerId?: string;
}

interface STARAnalysisResult {
  starAnalysis: {
    situation: {
      present: boolean;
      clarity: number;
      specificity: number;
      relevance: number;
      details: string;
      missing: string;
    };
    task: {
      present: boolean;
      clarity: number;
      specificity: number;
      relevance: number;
      details: string;
      missing: string;
    };
    action: {
      present: boolean;
      clarity: number;
      specificity: number;
      leadership: number;
      skills_demonstrated: string[];
      details: string;
      missing: string;
    };
    result: {
      present: boolean;
      clarity: number;
      quantifiable: number;
      impact: number;
      details: string;
      missing: string;
    };
  };
  overallScore: number;
  starCompleteness: number;
  responseQuality: number;
  strengths: string[];
  improvements: string[];
  evaluation: string; // User-friendly evaluation summary
  // Pro tier additional fields
  competencies_demonstrated?: string[];
  behavioral_indicators?: {
    leadership: number;
    teamwork: number;
    problem_solving: number;
  };
  coaching_recommendations?: string[];
  interview_readiness?: number;
  // Standard tier additional fields
  key_skills_shown?: string[];
  communication_effectiveness?: number;
  next_steps?: string[];
}

export const analyseSTARTask = task({
  id: "analyse-star-method",
  queue: {
    concurrencyLimit: 10,
  },
  maxDuration: 180, // 3 minutes timeout
  run: async (payload: STARTaskPayload): Promise<STARAnalysisResult> => {
    const { transcription, questionText, questionType, userTier, answerId } = payload;

    logger.info("Starting STAR analysis", {
      answerId,
      userTier,
      questionType,
      transcriptionLength: transcription.length,
    });

    try {
      // Validate inputs
      if (!transcription?.trim()) {
        throw new Error("Transcription is empty or missing");
      }
      if (!questionText?.trim()) {
        throw new Error("Question text is empty or missing");
      }

      // Get tier-specific prompt
      const prompt = getSTARAnalysisPrompt(userTier);
      
      // Select model based on tier
      const model = userTier === 'pro' ? 'gpt-5-mini' : 'gpt-4.1-mini';
      
      logger.info("Calling OpenAI for STAR analysis", {
        model,
        userTier,
        answerId,
      });

      const response = await openai.chat.completions.create({
        model,
        messages: [
          { role: "system", content: prompt },
          { 
            role: "user", 
            content: `QUESTION: ${questionText}\n\nINTERVIEW RESPONSE: ${transcription}\n\nQUESTION TYPE: ${questionType}` 
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.2, // Low temperature for consistent analysis
        max_tokens: userTier === 'pro' ? 2000 : 1000,
      });

      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error("No content received from OpenAI API");
      }

      let analysisResult: STARAnalysisResult;
      try {
        analysisResult = JSON.parse(content);
      } catch (parseError) {
        logger.error("Failed to parse OpenAI response", {
          content,
          parseError: parseError instanceof Error ? parseError.message : 'Unknown parse error',
          answerId,
        });
        throw new Error("Invalid JSON response from OpenAI");
      }

      // Validate required fields
      if (!analysisResult.starAnalysis || typeof analysisResult.overallScore !== 'number') {
        logger.error("Invalid analysis structure received", {
          analysisResult,
          answerId,
        });
        throw new Error("Invalid analysis structure from OpenAI");
      }

      logger.info("STAR analysis completed successfully", {
        answerId,
        overallScore: analysisResult.overallScore,
        starCompleteness: analysisResult.starCompleteness,
        userTier,
      });

      return analysisResult;

    } catch (error) {
      logger.error("STAR analysis failed", {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        answerId,
        userTier,
        transcriptionLength: transcription?.length || 0,
      });

      // Re-throw with more context
      if (error instanceof Error) {
        throw new Error(`STAR analysis failed: ${error.message}`);
      }
      throw new Error("STAR analysis failed with unknown error");
    }
  },
});