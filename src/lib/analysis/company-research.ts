
import { companyProfiles } from '@/lib/db/schema';
import { and, gt, sql } from 'drizzle-orm';
import OpenAI from 'openai';
import { db } from '../db';

// Lazy-initialize OpenAI client to avoid import-time errors
let openaiClient: OpenAI | null = null;
function getOpenAI(): OpenAI {
  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY,
    });
  }
  return openaiClient;
}

interface CompanyProfile {
  id: string;
  companyName: string;
  domain: string | null;
  industry: string | null;
  sizeCategory: 'startup' | 'mid-size' | 'enterprise' | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  coreValues: any; // JSONB field - CompanyValue[] at runtime
  cultureKeywords: string[] | null;
  leadershipStyle: string | null;
  workEnvironment: string | null;
  lastResearchedAt: Date | null;
  researchConfidenceScore: number | null; // 0-100 integer
  sourceUrls: string[] | null;
  createdAt: Date;
  updatedAt: Date;
}

interface CompanyValue {
  value: string;
  description: string;
  intensity: number; // 1-10 scale
}

interface ExtractedCompanyData {
  core_values: CompanyValue[];
  culture_keywords: string[];
  leadership_style: string | null;
  work_environment: string | null;
  industry: string | null;
  size_category: 'startup' | 'mid-size' | 'enterprise' | null;
  confidence_score: number; // 0-100 integer
}

/**
 * Get or research a company profile
 * Returns cached profile if available and recent (< 7 days old)
 * Otherwise researches the company and stores the profile
 */
export async function getOrResearchCompanyProfile(
  companyName: string
): Promise<CompanyProfile | null> {
  if (!companyName) {
    console.log('[CompanyResearch] No company name provided');
    return null;
  }

  // Check for existing, recent profile
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const existingProfile = await db
    .select()
    .from(companyProfiles)
    .where(
      and(
        sql`LOWER(${companyProfiles.companyName}) = LOWER(${companyName})`,
        gt(companyProfiles.lastResearchedAt, sevenDaysAgo),
        gt(companyProfiles.researchConfidenceScore, 60)
      )
    )
    .limit(1);

  if (existingProfile.length > 0) {
    console.log(`[CompanyResearch] Using cached profile for ${companyName}`);
    return existingProfile[0] as CompanyProfile;
  }

  // Research company if not found or stale
  console.log(`[CompanyResearch] Researching ${companyName}`);
  return await researchCompanyValues(companyName);
}

/**
 * Research company values and culture using web search-enabled models
 */
async function researchCompanyValues(
  companyName: string,
): Promise<CompanyProfile | null> {
  // Select model based on user tier
  // Pro users get gpt-5-mini with web search
  // Standard/Free users get gpt-4o-mini-search-preview
  const searchModel = 'gpt-5-mini';
  console.log(`[CompanyResearch] Using model: ${searchModel}`);

  // Use Responses API with web search tool
  const searchResponse = await getOpenAI().responses.create({
    model: searchModel,
    instructions: `You are a company research assistant. Your task is to gather comprehensive, factual information about companies using web search. Focus on finding official company sources, career pages, about pages, and reputable business news.`,
    input: `Research ${companyName} and provide detailed information about:

1. Company Mission & Core Values (3-6 key values)
   - What are their stated core values?
   - What principles guide their work?

2. Workplace Culture & Keywords (5-10 descriptors)
   - How do they describe their culture?
   - What cultural keywords appear frequently? (e.g., "innovative", "collaborative", "fast-paced")

3. Leadership Style
   - Is it democratic, hierarchical, flat, servant-leadership, or transformational?
   - How do they make decisions?

4. Work Environment
   - Remote-first, hybrid, in-office, or flexible?
   - What's their stance on remote work?

5. Company Size & Industry
   - Startup, mid-size, or enterprise?
   - What industry/sector?

Search for official company sources first (careers page, about page, mission statements). Include specific examples and quotes where possible.`,
    tools: [{ type: 'web_search_preview_2025_03_11' }],
    store: true,
  });

  const searchContent = searchResponse.output_text;
  const annotations = searchResponse.output
    .filter((item: any) => item.type === 'message')
    .flatMap((item: any) => item.content || [])
    .flatMap((content: any) => content.annotations || []);

  if (!searchContent) {
    console.warn('[CompanyResearch] No search results obtained');
    return null;
  }

  // Extract source URLs from annotations
  const sourceUrls = annotations
    .filter((ann: any) => ann.type === 'url_citation')
    .map((ann: any) => ann.url_citation?.url || '')
    .filter(Boolean);

  console.log(`[CompanyResearch] Found ${sourceUrls.length} source URLs`);

  // Extract structured data from search results
  const extractedData = await extractCompanyData(companyName, searchContent);

  if (extractedData.confidence_score < 60) {
    console.warn(
      `[CompanyResearch] Low confidence score (${extractedData.confidence_score}) for ${companyName}`
    );
  }

  // Store company profile with source URLs
  const storedProfile = await storeCompanyProfile(
    companyName,
    extractedData,
    sourceUrls
  );

  console.log(
    `[CompanyResearch] Successfully researched and stored profile for ${companyName} (confidence: ${extractedData.confidence_score})`
  );
  return storedProfile;
}

/**
 * Extract structured company data from search results using LLM
 */
async function extractCompanyData(
  companyName: string,
  searchResultsText: string
): Promise<ExtractedCompanyData> {
  const completion = await getOpenAI().chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `Analyze company research information and extract structured data.

TASK: Extract the following information about the company:

1. Core Values (3-6 key values):
   - Each value should have: name, description, and intensity (1-10 scale)
   - Intensity indicates how strongly the company emphasizes this value
   - Use direct quotes or paraphrases from the research

2. Cultural Keywords (5-10 keywords):
   - Single-word or short-phrase descriptors
   - Examples: "fast-paced", "collaborative", "innovative", "customer-focused", "data-driven"

3. Leadership Style:
   - Choose one: "democratic", "hierarchical", "flat", "servant-leadership", "transformational", "adaptive"
   - Base this on how they describe decision-making and leadership

4. Work Environment:
   - Choose one: "remote-first", "hybrid", "in-office", "flexible"
   - Based on their stated work policies

5. Industry and Size:
   - Industry: e.g., "Technology", "Finance", "Healthcare", "E-commerce"
   - Size: one of "startup" (<50 employees), "mid-size" (50-1000), "enterprise" (>1000)

6. Confidence Score (0-100 integer):
   - >80: Very confident, found official sources and detailed information
   - 60-80: Moderately confident, found some official information
   - <60: Low confidence, limited or unclear information

IMPORTANT: Return ONLY valid JSON. No additional text.

Example format:
{
  "core_values": [
    {"value": "Innovation", "description": "Continuously pushing boundaries and embracing new ideas", "intensity": 9},
    {"value": "Customer Focus", "description": "Putting customer needs at the center of every decision", "intensity": 8}
  ],
  "culture_keywords": ["innovative", "fast-paced", "collaborative", "data-driven", "customer-focused"],
  "leadership_style": "flat",
  "work_environment": "remote-first",
  "industry": "Technology",
  "size_category": "mid-size",
  "confidence_score": 85
}`,
        },
        {
          role: 'user',
          content: `Company: ${companyName}\n\nResearch Results:\n${searchResultsText}`,
        },
      ],
      response_format: { type: 'json_object' },
    });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error('No content returned from LLM');
  }

  const data = JSON.parse(content);

  // Validate and set defaults - convert to 0-100 scale if needed
  const confidenceScore = typeof data.confidence_score === 'number'
    ? (data.confidence_score < 1 ? Math.round(data.confidence_score * 100) : data.confidence_score)
    : 50;

  return {
    core_values: Array.isArray(data.core_values) ? data.core_values : [],
    culture_keywords: Array.isArray(data.culture_keywords)
      ? data.culture_keywords
      : [],
    leadership_style: data.leadership_style || null,
    work_environment: data.work_environment || null,
    industry: data.industry || null,
    size_category: data.size_category || null,
    confidence_score: confidenceScore,
  };
}

/**
 * Store company profile in database
 */
async function storeCompanyProfile(
  companyName: string,
  extractedData: ExtractedCompanyData,
  sourceUrls: string[]
): Promise<CompanyProfile> {
  const result = await db
    .insert(companyProfiles)
    .values({
      companyName,
      coreValues: extractedData.core_values,
      cultureKeywords: extractedData.culture_keywords,
      leadershipStyle: extractedData.leadership_style,
      workEnvironment: extractedData.work_environment,
      industry: extractedData.industry,
      sizeCategory: extractedData.size_category,
      lastResearchedAt: new Date(),
      researchConfidenceScore: extractedData.confidence_score,
      sourceUrls,
    })
    .onConflictDoUpdate({
      target: companyProfiles.companyName,
      set: {
        coreValues: extractedData.core_values,
        cultureKeywords: extractedData.culture_keywords,
        leadershipStyle: extractedData.leadership_style,
        workEnvironment: extractedData.work_environment,
        industry: extractedData.industry,
        sizeCategory: extractedData.size_category,
        lastResearchedAt: new Date(),
        researchConfidenceScore: extractedData.confidence_score,
        sourceUrls,
        updatedAt: new Date(),
      },
    })
    .returning();

  return result[0] as CompanyProfile;
}
