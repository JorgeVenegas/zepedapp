# Groq AI API Integration Guide

This guide explains how to use the Groq AI API integration in your Next.js app.

## Setup

### 1. Install Dependencies

The Groq SDK is already installed:

```bash
npm install groq-sdk
```

### 2. Set API Key

Create or update `.env.local` with your Groq API key:

```env
GROQ_API_KEY=your_groq_api_key_here
```

Get your API key from [Groq Console](https://console.groq.com/keys).

### 3. Start Dev Server

```bash
npm run dev
```

---

## Core Function: `runGroqQuery()`

Located in `lib/groq.ts`, this is the main function to query Groq AI.

### Import

```typescript
import runGroqQuery from "@/lib/groq";
```

### Parameters

```typescript
{
  query: string;              // Main query (required if user not provided)
  system?: string;            // System prompt/instructions
  user?: string;              // User message (takes precedence over query)
  model?: string;             // Model ID (default: "llama-3.1-8b-instant")
  temperature?: number;       // 0-2 (default: 1)
  max_tokens?: number;        // Max completion tokens (default: 1024)
  stream?: boolean;           // Enable streaming (default: false)
}
```

### Response

Returns a chat completion object:

```typescript
{
  id: string;
  choices: [{
    message: {
      role: "assistant";
      content: string;  // The AI's answer
    };
    finish_reason: string;
  }];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}
```

---

## Usage Examples

### 1. Server Component

```typescript
import runGroqQuery from "@/lib/groq";

export default async function MyComponent() {
  const response = await runGroqQuery({
    query: "What is machine learning?",
    system: "You are an expert educator.",
  });

  const answer = response.choices[0].message.content;

  return <div>{answer}</div>;
}
```

### 2. Server Action

```typescript
"use server";

import runGroqQuery from "@/lib/groq";

export async function askGroq(userInput: string) {
  const response = await runGroqQuery({
    query: userInput,
    system: "You are a helpful assistant.",
    temperature: 0.7,
  });

  return response.choices[0].message.content;
}
```

Then call from client:

```typescript
"use client";

import { askGroq } from "@/app/actions";

export default function Form() {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const answer = await askGroq("Your question");
    console.log(answer);
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

### 3. API Route (POST)

```typescript
// app/api/groq/route.ts

import runGroqQuery from "@/lib/groq";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { query, system, user, model, temperature, max_tokens } = body;

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
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

Call from client:

```typescript
const res = await fetch("/api/groq", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    query: "What is AI?",
    system: "Be concise.",
  }),
});

const data = await res.json();
console.log(data.choices[0].message.content);
```

### 4. Client Component (via API endpoint)

```typescript
"use client";

import { useState } from "react";

export default function ChatForm() {
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const handleQuery = async (query: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/groq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const data = await res.json();
      setAnswer(data.choices[0].message.content);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={() => handleQuery("Tell me a joke")}>
        {loading ? "Loading..." : "Ask"}
      </button>
      <p>{answer}</p>
    </div>
  );
}
```

### 5. Streaming Response

```typescript
import runGroqQuery from "@/lib/groq";

const response = await runGroqQuery({
  query: "Write a long story",
  stream: true,
});

for await (const chunk of response) {
  const content = chunk.choices[0]?.delta?.content || "";
  process.stdout.write(content);
}
```

---

## API Endpoint Tests

### GET (Quick Test)

```bash
curl "http://localhost:3000/api/groq?query=What%20is%202%2B2%3F"
```

### POST (Full Control)

```bash
curl -X POST http://localhost:3000/api/groq \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Explain quantum computing",
    "system": "You are a physicist.",
    "temperature": 0.5,
    "max_tokens": 2000
  }'
```

---

## Available Models

- `llama-3.1-8b-instant` (default, fastest, free tier)
- `llama-3.1-70b-versatile` (larger, more capable)
- `mixtral-8x7b-32768` (faster for some tasks)

Check [Groq Models](https://console.groq.com/docs/models) for latest list.

---

## Best Practices

✅ **Do:**

- Use server components or server actions to keep API key safe
- Pass system prompts for consistent behavior
- Handle errors in try-catch blocks
- Use temperature 0.3-0.7 for factual responses, 0.8-1.5 for creative
- Set reasonable max_tokens to control cost

❌ **Don't:**

- Expose API key in client-side code
- Use extremely high temperatures unless needed
- Make unlimited requests without rate limiting
- Leave API key in version control (use `.env.local`)

---

## Troubleshooting

### Missing API Key

Error: `The GROQ_API_KEY environment variable is missing or empty`

**Solution:** Add your key to `.env.local` and restart the dev server.

### Rate Limited

Error: `429 Too Many Requests`

**Solution:** Implement request throttling or use appropriate model for your use case.

### Invalid Model

Error: `Model not found`

**Solution:** Check available models at [Groq Console](https://console.groq.com/docs/models).

---
