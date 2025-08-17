import { JobInterviewPayload } from '@/types/interview';

// Helper function to generate the interview prompt - 5 Questions Only
export function generateInterviewPrompt(payload: JobInterviewPayload): string {
  const context = `
JOB CONTEXT:
- Company: ${payload.companyName}
- Role: ${payload.jobTitle}
- Experience Required: ${payload.yearsExperience} years
- Full Job Description: ${payload.jobDescription}
`;

  const instructions = `
INSTRUCTIONS:
You are an expert interviewer. Create **exactly 5 highly-targeted interview questions** for this role.

QUESTION CATEGORIES (Balance required):
1. **Technical / Functional Skills** — Role-specific hard skills, tools, or processes.
2. **Behavioral / Situational** — Soft skills, teamwork, leadership, adaptability.
3. **Strategy / Problem-Solving** — Decision-making, prioritization, improvements.
4. **Industry / Business Knowledge** — Domain-specific trends, regulations, customer context.

RULES:
- Use the job description to make each question **specific and realistic**.
- Avoid generic wording (e.g., “Tell me about teamwork”).
- Incorporate **technologies, processes, responsibilities, stakeholders, or metrics** mentioned.
- Match complexity to ${payload.yearsExperience} years of experience.
- Ensure each question can be answered in ${payload.timeToAnswer} seconds.
- Cover at least **3 different categories** among the 5 questions.

EXAMPLES:
❌ BAD: "How do you handle deadlines?"
✅ GOOD: "This role requires managing overlapping product launch timelines with marketing and design teams. How would you handle conflicting priorities during a major release?"

OUTPUT FORMAT:
Return a JSON array of 5 items:

[
  {
    "question": "string (the interview question)",
    "category": "string (Technical | Behavioral | Strategy | Industry)",
    "focus": "string (the JD element this tests, e.g., 'GDPR compliance in fintech products')"
  }
]
`;

  return `You are generating structured, role-specific interview questions.

${context}

${instructions}`;
}
