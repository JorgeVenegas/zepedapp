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
        name: solution.name,
        description: solution.description,
        cost: {
          min: solution.costMin,
          max: solution.costMax
        },
        feasibility: Math.max(1, Math.min(10, solution.feasibility)), // Ensure 1-10 range
        implementationTime: {
          start: startDate,
          end: endDate
        }
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
    
    // Time constraint - calculate days from start to end date
    if (options.timeConstraint) {
      const days = Math.ceil((solution.implementationTime.end.getTime() - solution.implementationTime.start.getTime()) / (1000 * 60 * 60 * 24));
      if (days > options.timeConstraint) {
        return false;
      }
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
        const aDays = Math.ceil((a.implementationTime.end.getTime() - a.implementationTime.start.getTime()) / (1000 * 60 * 60 * 24));
        const bDays = Math.ceil((b.implementationTime.end.getTime() - b.implementationTime.start.getTime()) / (1000 * 60 * 60 * 24));
        return aDays - bDays;
      case 'feasibility':
      default:
        return b.feasibility - a.feasibility;
    }
  });
}
