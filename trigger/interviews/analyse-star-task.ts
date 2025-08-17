// trigger/interviews/tasks/analyze-star-task.ts
import getSTARAnalysisPrompt from "@/lib/middleware/star-prompt";
import { task } from "@trigger.dev/sdk/v3";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const analyseSTARTask = task({
  id: "analyse-star-method",
  queue: {
    concurrencyLimit: 10,
  },
  run: async (payload: {
    transcription: string;
    questionText: string;
    questionType: string;
  }) => {
    const { transcription, questionText } = payload;

    const prompt = getSTARAnalysisPrompt();

    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        { role: "system", content: prompt },
        { role: "user", content: `QUESTION: ${questionText}\nRESPONSE: ${transcription}` }
      ],
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No content received from OpenAI API");
    }

    return JSON.parse(content);
  },
});

