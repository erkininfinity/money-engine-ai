import OpenAI from "openai";

const apiKey = process.env.OPENAI_API_KEY;
const baseURL = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";

export const getOpenAIClient = () => {
  if (!apiKey) {
    // We don't throw immediately so build time doesn't break if keys are missing
    console.warn("WARNING: OPENAI_API_KEY is not defined in environment variables.");
  }
  return new OpenAI({
    apiKey: apiKey || "dummy-key",
    baseURL,
  });
};

export const openaiModel = process.env.OPENAI_MODEL || "gpt-4o";
export const openai = getOpenAIClient();
