import type { Solution, SolutionGenerationOptions } from '@/lib/types/solution';
import { generateSolutionsWithGroq } from '@/lib/ai/groqClient';
import { v4 as uuidv4 } from 'uuid';

export async function generateSolutions(
  pattern: any,
  options: SolutionGenerationOptions = {}
): Promise<Solution[]> {
  try {
    console.log('Generating solutions for pattern:', pattern.title);
    
    // Generate solutions using Groq
    const groqResponse = await generateSolutionsWithGroq(pattern, options);
    
    if (!groqResponse?.solutions || !Array.isArray(groqResponse.solutions)) {
      throw new Error('Invalid response format from AI service');
    }
    
    // Transform Groq response to our Solution type
    const solutions: Solution[] = groqResponse.solutions.map(solution => {
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(startDate.getDate() + solution.estimatedDays);
      
      return {
        id: uuidv4(),
        name: solution.name,
        description: solution.description,
        cost: {
          min: solution.costMin,
          max: solution.costMax,
          currency: 'USD'
        },
        feasibility: Math.max(1, Math.min(10, solution.feasibility)), // Ensure 1-10 range
        implementationTime: {
          start: startDate,
          end: endDate,
          estimatedDays: solution.estimatedDays
        },
        patternId: pattern.id,
        createdAt: new Date(),
        tags: solution.tags || [],
        impact: solution.impact || 'Medium',
        reasoning: solution.reasoning
      };
    });
    
    // Filter and rank solutions
    const filteredSolutions = filterSolutions(solutions, options);
    return rankSolutions(filteredSolutions, options.prioritizeBy);
    
  } catch (error: any) {
    console.error('Solution generation failed:', error);
    throw new Error(`Failed to generate solutions: ${error.message}`);
  }
}

function filterSolutions(
  solutions: Solution[],
  options: SolutionGenerationOptions
): Solution[] {
  return solutions.filter(solution => {
    // Budget constraint
    if (options.budgetLimit && solution.cost.min > options.budgetLimit) {
      return false;
    }
    
    // Time constraint
    if (options.timeConstraint && solution.implementationTime.estimatedDays > options.timeConstraint) {
      return false;
    }
    
    // Feasibility threshold
    if (options.feasibilityThreshold && solution.feasibility < options.feasibilityThreshold) {
      return false;
    }
    
    return true;
  }).slice(0, options.maxSolutions || 5);
}

function rankSolutions(
  solutions: Solution[],
  prioritizeBy: string = 'feasibility'
): Solution[] {
  return solutions.sort((a, b) => {
    switch (prioritizeBy) {
      case 'cost':
        return ((a.cost.min + a.cost.max) / 2) - ((b.cost.min + b.cost.max) / 2);
      case 'time':
        return a.implementationTime.estimatedDays - b.implementationTime.estimatedDays;
      case 'impact':
        const impactScore = { High: 3, Medium: 2, Low: 1 };
        return (impactScore[b.impact as keyof typeof impactScore] || 0) - 
               (impactScore[a.impact as keyof typeof impactScore] || 0);
      case 'feasibility':
      default:
        // Rank by feasibility * impact / cost ratio
        const aScore = a.feasibility * (a.impact === 'High' ? 3 : a.impact === 'Medium' ? 2 : 1) / 
                      (((a.cost.min + a.cost.max) / 2) / 1000);
        const bScore = b.feasibility * (b.impact === 'High' ? 3 : b.impact === 'Medium' ? 2 : 1) / 
                      (((b.cost.min + b.cost.max) / 2) / 1000);
        return bScore - aScore;
    }
  });
}
