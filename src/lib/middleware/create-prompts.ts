import { JobInterviewPayload } from '@/types/interview';

// Helper function to generate the interview prompt - HIGHLY SPECIFIC TO JOB DESCRIPTION
export function generateInterviewPrompt(payload: JobInterviewPayload): string {
  const context = `
JOB CONTEXT:
- Company: ${payload.companyName}
- Role: ${payload.jobTitle}
- Experience Required: ${payload.yearsExperience} years
- Full Job Description: ${payload.jobDescription}
`;

  const instructions = `
CRITICAL INSTRUCTIONS:
You MUST analyze the Job Description above and extract SPECIFIC details to create targeted questions. 

STEP 1 - ANALYSIS REQUIRED:
- What specific technologies, tools, or platforms are mentioned?
- What are the exact responsibilities and daily tasks?
- What specific challenges or problems does this role solve?
- What industry-specific knowledge is required?
- What specific metrics, outcomes, or deliverables are mentioned?
- What team structures, stakeholders, or processes are described?

STEP 2 - QUESTION CREATION:
Create 5 questions that directly reference and test the SPECIFIC elements found in the job description.

REQUIREMENTS:
1. **USE SPECIFIC DETAILS**: Reference actual technologies, processes, or requirements from the job description
2. **AVOID GENERIC QUESTIONS**: No "tell me about a time you worked with a team" - instead use specific team structures mentioned in the JD
3. **REFERENCE ACTUAL RESPONSIBILITIES**: Use the exact tasks and challenges mentioned in the job description
4. **INCLUDE SPECIFIC CONTEXT**: If the JD mentions specific industries, regulations, or business contexts, incorporate them
5. **USE MENTIONED TECHNOLOGIES**: If specific tools, frameworks, or systems are listed, ask about them specifically
`;

  const examples = `
EXAMPLE OF GOOD vs BAD:

❌ BAD (Generic): "Tell me about a time you worked with cross-functional teams"
✅ GOOD (Specific): "This role involves coordinating with the Product Marketing team on feature releases for our SaaS platform. Describe your experience working with marketing teams on technical product launches, particularly around API documentation or developer-facing features."

❌ BAD (Generic): "How would you handle a performance issue?"
✅ GOOD (Specific): "Our infrastructure handles 100M+ daily API calls using AWS Lambda and DynamoDB. Walk me through how you'd troubleshoot and optimize Lambda cold start times impacting our mobile app response rates."

❌ BAD (Generic): "Describe your leadership experience"
✅ GOOD (Specific): "As a Senior Backend Engineer, you'll mentor 2-3 junior developers while architecting our transition from MongoDB to PostgreSQL. Tell me about a time you led both technical architecture decisions and team mentoring simultaneously."
`;

  const guidelines = `
SPECIFIC GUIDELINES:
- **Extract Technologies**: If React, Python, AWS, etc. are mentioned, ask about them specifically
- **Use Business Context**: If it's fintech, healthcare, e-commerce, etc., reference that industry
- **Reference Scale/Metrics**: If "millions of users" or "real-time processing" is mentioned, incorporate that scale
- **Include Stakeholders**: If "working with data scientists" or "partnering with ops team" is mentioned, ask about those specific relationships
- **Address Constraints**: If "legacy systems" or "rapid scaling" is mentioned, create scenarios around those challenges
- **Match Experience Level**: ${payload.yearsExperience} years - adjust complexity accordingly
- **Time Limit**: ${payload.timeToAnswer} seconds per response

CREATE QUESTIONS THAT ONLY SOMEONE FAMILIAR WITH THIS EXACT ROLE COULD ANSWER WELL.
`;

  return `You are an expert interviewer creating highly targeted questions for this specific role. 

${context}

${instructions}

${examples}

${guidelines}

Generate 5 laser-focused questions that test the EXACT requirements and context from this job description.`.trim();
}