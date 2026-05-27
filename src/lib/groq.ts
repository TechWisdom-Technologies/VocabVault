import Groq from "groq-sdk";
import type { ChatCompletion, ChatCompletionCreateParamsNonStreaming } from "groq-sdk/resources/chat/completions";

const groqApiKeys = [
  process.env.GROQ_API_KEY,
  process.env.GROQ_API_KEY_2,
  process.env.GROQ_API_KEY_3,
].filter(Boolean) as string[];

const groqClients = groqApiKeys.map((apiKey) => new Groq({ apiKey }));

export const groq = groqClients[0] || new Groq({ apiKey: process.env.GROQ_API_KEY! });

const isRateLimitError = (error: unknown) => {
  const status = typeof error === "object" && error !== null ? (error as { status?: number }).status : undefined;
  const code = typeof error === "object" && error !== null ? (error as { code?: number | string }).code : undefined;
  const message = error instanceof Error ? error.message.toLowerCase() : "";

  return status === 429 || code === 429 || code === "429" || message.includes("rate limit") || message.includes("too many requests");
};

export async function createGroqChatCompletion(
  input: ChatCompletionCreateParamsNonStreaming
): Promise<ChatCompletion> {
  let lastError: unknown;

  for (const client of groqClients) {
    try {
      return await client.chat.completions.create(input);
    } catch (error) {
      lastError = error;
      if (!isRateLimitError(error)) {
        throw error;
      }
    }
  }

  throw lastError;
}

export default groq;
