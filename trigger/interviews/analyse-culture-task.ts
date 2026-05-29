// trigger/interviews/analyse-culture-task.ts
import { task, logger } from '@trigger.dev/sdk/v3';
import OpenAI from 'openai';

// Lazy-initialize OpenAI client to avoid import-time errors
let openaiClient: OpenAI | null = null;
function getOpenAI(): OpenAI {
  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || process.env.OPENAI_API_KEY,
    });
  }
  return openaiClient;
}

interface CompanyValue {
  value: string;
  description: string;
  intensity: number;
}

interface CompanyProfile {
  id: string;
  companyName: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  coreValues: any; // JSONB from database - CompanyValue[] at runtime
  cultureKeywords: string[] | null;
  leadershipStyle: string | null;
  workEnvironment: string | null;
}

interface CultureTaskPayload {
  transcription: string;
  questionText: string;
  companyProfile: CompanyProfile;
  userTier: string;
  answerId?: string;
}

interface ValueAlignment {
  value_name: string;
  alignment_score: number; // 0-100
  evidence: string;
  suggestions: string;
}

interface CultureAnalysisResult {
  company_profile_id: string;
  overall_alignment: number; // 0-100
  value_alignments: ValueAlignment[];
  cultural_keyword_matches: string[];
  alignment_explanation: string;
  improvement_suggestions: string[];
  // Pro tier additional fields
  behavioral_culture_fit?: number;
  value_demonstration_examples?: string[];
  cultural_coaching?: string[];
}

/**
 * Analyze company culture alignment task
 * Evaluates how well interview responses align with company values and culture
 */
export const analyseCultureTask = task({
  id: 'analyse-company-culture',
  queue: {
    concurrencyLimit: 8,
  },
  run: async (payload: CultureTaskPayload): Promise<CultureAnalysisResult | null> => {
    const { transcription, questionText, companyProfile, userTier, answerId } = payload;

    // Skip for free tier or if no company data
    if (userTier === 'free' || !companyProfile?.coreValues) {
      logger.info('Skipping culture analysis', { userTier, hasProfile: !!companyProfile });
      return null;
    }

    logger.info('Starting culture alignment analysis', {
      answerId,
      company: companyProfile.companyName,
      userTier,
      valueCount: companyProfile.coreValues?.length || 0,
    });

    const culturePrompt = getCultureAlignmentPrompt(userTier);

    // Select model based on tier
    const model = 'gpt-5-mini';

    const completion = await getOpenAI().chat.completions.create({
      model,
      messages: [
        {
          role: 'system',
          content: culturePrompt,
        },
        {
          role: 'user',
          content: `
COMPANY: ${companyProfile.companyName}

CORE VALUES:
${companyProfile.coreValues.map((v: CompanyValue) => `- ${v.value}: ${v.description} (Intensity: ${v.intensity}/10)`).join('\n')}

CULTURAL KEYWORDS: ${companyProfile.cultureKeywords?.join(', ') || 'N/A'}

LEADERSHIP STYLE: ${companyProfile.leadershipStyle || 'N/A'}

WORK ENVIRONMENT: ${companyProfile.workEnvironment || 'N/A'}

---

INTERVIEW QUESTION:
${questionText}

CANDIDATE RESPONSE:
${transcription}

---

Analyze how well this response demonstrates alignment with the company's culture and values.`,
        },
      ],
      response_format: { type: 'json_object' },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No content returned from OpenAI');
    }

    const analysisData = JSON.parse(content);

    // Construct result with proper typing
    const result: CultureAnalysisResult = {
      company_profile_id: companyProfile.id,
      overall_alignment: analysisData.overall_alignment || 0,
      value_alignments: analysisData.value_alignments || [],
      cultural_keyword_matches: analysisData.cultural_keyword_matches || [],
      alignment_explanation: analysisData.alignment_explanation || '',
      improvement_suggestions: analysisData.improvement_suggestions || [],
    };

    // Add pro tier fields if applicable
    if (userTier === 'pro') {
      result.behavioral_culture_fit = analysisData.behavioral_culture_fit || 0;
      result.value_demonstration_examples = analysisData.value_demonstration_examples || [];
      result.cultural_coaching = analysisData.cultural_coaching || [];
    }

    logger.info('Culture alignment analysis completed', {
      answerId,
      overallAlignment: result.overall_alignment,
      matchedKeywords: result.cultural_keyword_matches.length,
    });

    return result;
  },
});

/**
 * Get culture alignment analysis prompt based on user tier
 */
function getCultureAlignmentPrompt(userTier: string): string {
  const basePrompt = `You are an expert interview coach specializing in company culture fit analysis.

TASK: Analyze how well the candidate's interview response aligns with the company's stated values and culture.

EVALUATION CRITERIA:

1. Value Alignment (score each company value 0-100):
   - Does the response demonstrate this value?
   - Are there specific examples showing alignment?
   - How naturally does it fit?

2. Cultural Keyword Matches:
   - Which cultural keywords from the company appear in the response?
   - Are they used authentically or just name-dropped?

3. Overall Cultural Alignment (0-100):
   - Weighted combination of value alignments
   - Consider leadership style compatibility
   - Consider work environment fit

4. Improvement Suggestions:
   - How can the candidate better demonstrate cultural fit?
   - Which values need more emphasis?
   - Specific action items

IMPORTANT: Return ONLY valid JSON with this structure:
{
  "overall_alignment": 75,
  "value_alignments": [
    {
      "value_name": "Innovation",
      "alignment_score": 80,
      "evidence": "Candidate described implementing a new process...",
      "suggestions": "Could strengthen by mentioning specific innovative outcomes"
    }
  ],
  "cultural_keyword_matches": ["collaborative", "data-driven"],
  "alignment_explanation": "The response shows strong alignment with company values...",
  "improvement_suggestions": [
    "Emphasize more examples of customer focus",
    "Include metrics to demonstrate impact"
  ]
}`;

  if (userTier === 'pro') {
    return (
      basePrompt +
      `

ADVANCED PRO ANALYSIS:

5. Behavioral Culture Fit (0-100):
   - How well does the behavioral style match company culture?
   - Natural alignment vs. learned behaviors

6. Value Demonstration Examples:
   - Specific quotes or moments showing each value
   - Quality of cultural alignment evidence

7. Cultural Coaching:
   - Deep, actionable coaching for each value
   - Interview strategy for demonstrating fit
   - Authentic vs. performative alignment

Add these additional fields to your JSON response:
{
  ...base fields...,
  "behavioral_culture_fit": 82,
  "value_demonstration_examples": [
    "When discussing the project, the phrase 'we focused on customer feedback' directly demonstrates Customer Focus value"
  ],
  "cultural_coaching": [
    "For Innovation: Share a specific example where you challenged status quo with measurable results",
    "For Collaboration: Describe how you facilitated cross-team alignment, not just participated"
  ]
}`
    );
  }

  // Standard tier gets the base prompt
  return basePrompt;
}
