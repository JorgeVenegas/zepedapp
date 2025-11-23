import { Groq } from "groq-sdk";

export type GroqQueryParams = {
  query: string;
  system?: string;
  user?: string;
  model?: string;
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
};

/**
 * Run a Groq AI API query using the official Groq SDK.
 *
 * Requires the environment variable `GROQ_API_KEY` to be set.
 *
 * @param params.query - the main query string (or use user if both provided)
 * @param params.system - optional system prompt/instructions
 * @param params.user - optional user message (takes precedence over query)
 * @param params.model - optional model id (defaults to llama-3.1-8b-instant)
 * @param params.temperature - optional temperature (0-2)
 * @param params.max_tokens - optional max completion tokens
 * @param params.stream - optional stream flag (defaults to false)
 */
export async function runGroqQuery({
  query,
  system,
  user,
  model = "llama-3.1-8b-instant",
  temperature = 1,
  max_tokens = 1024,
  stream = false,
}: GroqQueryParams) {
  const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
  });

  const messages: Array<{ role: "user" | "system"; content: string }> = [];

  if (system) {
    messages.push({ role: "system", content: system });
  }

  messages.push({
    role: "user",
    content: user || query,
  });

  const chatCompletion = await groq.chat.completions.create({
    messages: messages as Parameters<
      typeof groq.chat.completions.create
    >[0]["messages"],
    model,
    temperature,
    max_completion_tokens: max_tokens,
    stream,
  });

  return chatCompletion;
}

export default runGroqQuery;
