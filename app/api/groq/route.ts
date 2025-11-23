import runGroqQuery from "@/lib/groq";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { query, system, user, model, temperature, max_tokens } = body;

    if (!query && !user) {
      return NextResponse.json(
        { error: "Either 'query' or 'user' is required" },
        { status: 400 }
      );
    }

    const result = await runGroqQuery({
      query,
      system,
      user,
      model,
      temperature,
      max_tokens,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Groq API error:", error.message);
    return NextResponse.json(
      { error: error.message || "Failed to query Groq API" },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint for quick testing (via URL params)
 * Example: GET /api/groq?query=What%20is%202%2B2%3F
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query");
    const system = searchParams.get("system");
    const user = searchParams.get("user");
    const model = searchParams.get("model");

    if (!query && !user) {
      return NextResponse.json(
        { error: "Either 'query' or 'user' is required" },
        { status: 400 }
      );
    }

    const result = await runGroqQuery({
      query: query || "",
      system: system || undefined,
      user: user || undefined,
      model: model || undefined,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Groq API error:", error.message);
    return NextResponse.json(
      { error: error.message || "Failed to query Groq API" },
      { status: 500 }
    );
  }
}
