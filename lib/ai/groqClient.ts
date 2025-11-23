import Groq from 'groq-sdk';
import type { GroqSolutionResponse } from '@/lib/types/solution';

function createGroqClient() {
  const apiKey = process.env.GROQ_API_KEY;
  
  if (!apiKey) {
    throw new Error('GROQ_API_KEY environment variable is required. Please add it to your .env.local file.');
  }
  
  return new Groq({
    apiKey: apiKey,
  });
}

export async function generateSolutionsWithGroq(
  pattern: any,
  options: any = {}
): Promise<GroqSolutionResponse> {
  const prompt = createSolutionPrompt(pattern, options);
  const groq = createGroqClient();
  
  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are an expert IT solutions architect specializing in incident management and user satisfaction optimization. 
          Your task is to analyze incident patterns and generate practical, cost-effective solutions that improve user satisfaction.
          Always respond with valid JSON. Focus on solutions that address root causes, not just symptoms.
          Consider both technical and process improvements.`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      model: "llama-3.1-8b-instant", // Current available Groq model
      temperature: 0.7,
      max_tokens: 3000,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No content received from Groq');
    }

    console.log('🔍 RAW Groq Response:', content);

    // Clean the response to ensure it's valid JSON
    const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
    
    console.log('🧹 Cleaned Content:', cleanContent);
    
    const parsed = JSON.parse(cleanContent);
    
    console.log('📊 Parsed JSON:', JSON.stringify(parsed, null, 2));
    
    // Validate response structure
    if (!parsed.solutions || !Array.isArray(parsed.solutions)) {
      throw new Error('Invalid response structure from AI service');
    }
    
    return parsed;
  } catch (error: any) {
    console.error('Groq API Error:', error);
    throw new Error(`Failed to generate solutions: ${error.message}`);
  }
}

function createSolutionPrompt(pattern: any, options: any): string {
  const constraints = [];
  if (options.budgetLimit) constraints.push(`Budget limit: $${options.budgetLimit}`);
  if (options.timeConstraint) constraints.push(`Time constraint: ${options.timeConstraint} days`);
  if (options.feasibilityThreshold) constraints.push(`Minimum feasibility: ${options.feasibilityThreshold}/10`);

  return `
Analyze this incident pattern and generate 3-5 practical solutions to improve user satisfaction:

INCIDENT PATTERN:
- Title: ${pattern.title}
- Description: ${pattern.description}
- Priority: ${pattern.priority}/10
- Frequency: ${pattern.frequency} incidents
- Time Range: ${pattern.time_range?.start} to ${pattern.time_range?.end}
- Filters: ${JSON.stringify(pattern.filters, null, 2)}

CONSTRAINTS:
${constraints.length > 0 ? constraints.join('\n') : 'No specific constraints'}

Generate solutions that:
1. Address root causes of user dissatisfaction
2. Reduce incident frequency and impact
3. Improve user experience and satisfaction
4. Are practical and implementable

Consider these solution categories:
- Infrastructure improvements (servers, networking, monitoring)
- Process automation (workflows, alerts, self-service)
- User experience enhancements (interfaces, documentation, training)
- Preventive measures (capacity planning, redundancy, testing)
- Communication improvements (status pages, notifications, feedback loops)

For each solution, provide:
- Feasibility score (1-10, where 10 is most feasible)
- Cost estimate in USD (realistic ranges)
- Implementation time in days
- Expected impact (High/Medium/Low)
- Reasoning for why this solution addresses the pattern

Respond with ONLY this JSON format:
{
  "solutions": [
    {
      "name": "Solution Name",
      "description": "Detailed description of the solution and how it improves user satisfaction",
      "costMin": 5000,
      "costMax": 15000,
      "feasibility": 8,
      "estimatedDays": 21,
      "impact": "High",
      "tags": ["automation", "monitoring", "user-experience"],
      "reasoning": "This solution addresses the root cause by..."
    }
  ]
}
`;
}
