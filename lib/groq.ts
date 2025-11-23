import { Groq } from "groq-sdk";
import {Pattern, Solution} from "@/lib/types";

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
        console.log("First 200 chars:", responseText.substring(0, 200));

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

        // Validate and return, filtering out null values
        return parsed.map((item, idx) => validateItem(item, idx)).filter((item): item is AnalyzedFeedback => item !== null);

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

export async function generateSolutionsForPattern(pattern: Pattern): Promise<Solution[]> {
    const systemPrompt = `You are an expert in Mexico City's metro and integrated mobility systems (Metro CDMX, Metrobús, Trolebús, Cablebús, RTP, Ecobici).

You MUST respond with ONLY valid JSON, no markdown, no explanations, no code blocks.

Analyze the given pattern (a recurring problem affecting Mexico City metro/transit users) and propose exactly 3 realistic solutions.

Return a JSON array with this EXACT structure:
[
  {
    "name": "Solution name",
    "description": "Detailed explanation of the solution in Spanish",
    "cost_min": number in Mexican pesos,
    "cost_max": number in Mexican pesos,
    "feasibility": number from 1-10 (1=very difficult, 10=very feasible),
    "implementation_start_date": "YYYY-MM-DD",
    "implementation_end_date": "YYYY-MM-DD"
  }
]

Requirements:
- All 3 solutions must be actionable and realistic for Mexico City's context
- Consider budget constraints, infrastructure, and local regulations
- Feasibility should account for: technical complexity, political will, budget availability, and time required (scale 1-10)
- Cost ranges should be realistic estimates in MXN
- Implementation timeframes should be practical (consider planning, approval, execution)
- Descriptions should be in Spanish and detailed enough to understand the approach
- Solutions should address the root cause identified in the pattern`;

    const userPrompt = `Analyze this transit pattern and propose 3 solutions:

Pattern ID: ${pattern.id}
Title: ${pattern.title}
Description: ${pattern.description}
Priority: ${pattern.priority}
Frequency: ${pattern.frequency} incidents
Time Range: ${pattern.timeRangeStart || 'N/A'} to ${pattern.timeRangeEnd || 'N/A'}
Total Incidents: ${pattern.incidentIds.length}
Filters: ${JSON.stringify(pattern.filters, null, 2)}

Context:
- This pattern represents a recurring problem in Mexico City's metro/transit system
- Solutions must be feasible within CDMX's transit infrastructure and budget
- Consider short-term, medium-term, and long-term solutions

Respond with ONLY the JSON array of 3 solutions in English, nothing else.`;

    try {
        const groqResult = await runGroqQuery({
            system: systemPrompt,
            query: userPrompt,
            temperature: 0.4, // Slightly higher for creative solutions
            max_tokens: 4000,
        });

        // Parse and validate the response
        const solutions = parseGroqResponse(groqResult);

        // Validate we got exactly 3 solutions
        if (solutions.length !== 3) {
            throw new Error(`Expected 3 solutions, got ${solutions.length}`);
        }

        return solutions;
    } catch (error) {
        console.error('Error generating solutions:', error);
        throw new Error(`Failed to generate solutions: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

function parseGroqResponse(response: any): Solution[] {
    const responseText = response.choices[0].message.content;
    try{
        console.log("RESPONSE");
        console.log(response);
        let cleaned = responseText.trim();
        console.log("CLEANED RESPONSE");
        console.log(cleaned);
        if (cleaned.startsWith('```')) {
            cleaned = cleaned.replace(/```json\n?/g, '').replace(/```\n?/g, '');
        }
        // Parse JSON
        const parsed = JSON.parse(cleaned);

        // Validate it's an array
        if (!Array.isArray(parsed)) {
            throw new Error('Response is not an array');
        }

        const solutions: Solution[] = parsed.map((item, idx) => {
            // Validate dates
            const startDate = new Date(item.implementation_start_date);
            const endDate = new Date(item.implementation_end_date);

            return {
                id: '', // Will be set by database
                name: item.name,
                description: item.description,
                cost_min: item.cost_min,
                cost_max: item.cost_max,
                feasibility: item.feasibility,
                implementation_start_date: item.implementation_start_date,
                implementation_end_date: item.implementation_end_date,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            };
        });
        return solutions;
    }
    catch(error){
        console.error('Failed to parse Groq response:', response);
        throw new Error(`JSON parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
