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
    stream: false,
  });

  return chatCompletion;
}

export default runGroqQuery;

export async function analyzeTwitterFeedback(feedbackTexts: string[]) {
    const systemPrompt = `You are a transit feedback analysis expert. You MUST respond with ONLY valid JSON, no markdown, no explanations.

Analyze each feedback text and return an array of objects with this EXACT structure:
{
  "original": "metro" or "train",
  "subservice": any relevant subdivison to better categorize (e.g. bus-station, platform, waggon, office, ticket office),
  "priority": 0-5 (0=critical/life or safety risk, 5=minor suggestion),
  "category": one of ["delays-cancellations","tickets-fares","accessibility","facilities-cleanliness","information-communication","staff-passenger-behavior","lost-items-security"],
  "sentiment_analysis": "1" for positive or "-1" for negative,
  "summary": brief summary in english,
  "keywords": array of 2-5 relevant keywords translated to english.
}

Rules:
- Return ONLY a JSON array
- One object per input text, maintaining the same order
- If text is unclear, make best guess based on context
- All fields are required`;

    const userPrompt = `Analyze these ${feedbackTexts.length} feedback texts and return a JSON array:

${feedbackTexts.map((text, idx) => `${idx + 1}. "${text}"`).join('\n')}

Remember: Respond with ONLY the JSON array, nothing else.`;

    const groqResult = await runGroqQuery({
        system: systemPrompt,
        query: userPrompt,
        temperature: 0.3,
        max_tokens: 6000,
    });

    return groqResult;
}

export interface AnalyzedFeedback {
    original: "metro" | "train";
    subservice: string;
    priority: number;
    category: string;
    sentiment_analysis: "1" | "-1";
    summary: string;
    keywords: string[];
}

export function parseAndValidateGroqResponse(
    groqResult: any,
    expectedCount: number
): AnalyzedFeedback[] {
    try {
        // Extract content from choices[0].message.content
        const responseText = groqResult.choices[0].message.content;

        console.log("=== Response extracted successfully ===");
        console.log("Response received:", responseText);

        // Check if response was completed
        if (groqResult.choices[0].finish_reason !== "stop") {
            console.warn("WARNING: Response may be incomplete. Finish reason:", groqResult.choices[0].finish_reason);
        }

        // Remove markdown code blocks if present (though your response looks clean)
        const cleanedText = responseText
            .replace(/```json\n?/g, '')
            .replace(/```\n?/g, '')
            .trim();

        // Parse JSON
        const parsed = JSON.parse(cleanedText);

        if (!Array.isArray(parsed)) {
            throw new Error("Response is not an array");
        }

        console.log(`✓ Parsed ${parsed.length} items (expected ${expectedCount})`);

        if (parsed.length !== expectedCount) {
            console.warn(`Expected ${expectedCount} results, got ${parsed.length}`);
        }

        // Validate and return
        return parsed.map((item, idx) => validateItem(item, idx));

    } catch (error: any) {
        console.error("=== Parsing error ===");
        console.error("Error:", error.message);
        console.error("Finish reason:", groqResult.choices?.[0]?.finish_reason);
        console.error("Raw content preview:", groqResult.choices?.[0]?.message?.content?.substring(0, 500));
        throw new Error(`Failed to parse Groq response: ${error.message}`);
    }
}

export interface AnalyzedFeedback {
    original: "metro" | "train";
    subservice: string;
    priority: number;
    category: string;
    sentiment_analysis: "1" | "-1";
    summary: string;
    keywords: string[];
}

function validateItem(item: any, index: number): AnalyzedFeedback | null{

    if (!item || typeof item !== 'object') {
        console.warn(`Item at index ${index} is invalid`);
        return null;
    }

    const validCategories = [
        "delays-cancellations",
        "tickets-fares",
        "accessibility",
        "facilities-cleanliness",
        "information-communication",
        "staff-passenger-behavior",
        "lost-items-security"
    ];

    return {
        original: ["metro", "train"].includes(item.original) ? item.original as "metro" | "train" : "metro",
        subservice: item.subservice || "general",
        priority: Math.min(5, Math.max(0, parseInt(item.priority) || 3)),
        category: validCategories.includes(item.category) ? item.category : "information-communication",
        sentiment_analysis: ["1", "-1"].includes(item.sentiment_analysis) ? item.sentiment_analysis as "1" | "-1" : "-1",
        summary: item.summary || `Feedback ${index + 1}`,
        keywords: Array.isArray(item.keywords) ? item.keywords : []
    };
}
