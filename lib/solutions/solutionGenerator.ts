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
          max: solution.costMax,
          justification: solution.costJustification
        },
        feasibility: Math.max(1, Math.min(10, solution.feasibility)), // Ensure 1-10 range
        feasibilityJustification: solution.feasibilityJustification,
        implementationTime: {
          start: startDate,
          end: endDate,
          justification: solution.timeJustification
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
      const startDate = typeof solution.implementationTime.start === 'string' 
        ? new Date(solution.implementationTime.start) 
        : solution.implementationTime.start;
      const endDate = typeof solution.implementationTime.end === 'string' 
        ? new Date(solution.implementationTime.end) 
        : solution.implementationTime.end;
      const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
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
        const aStartDate = typeof a.implementationTime.start === 'string' 
          ? new Date(a.implementationTime.start) 
          : a.implementationTime.start;
        const aEndDate = typeof a.implementationTime.end === 'string' 
          ? new Date(a.implementationTime.end) 
          : a.implementationTime.end;
        const bStartDate = typeof b.implementationTime.start === 'string' 
          ? new Date(b.implementationTime.start) 
          : b.implementationTime.start;
        const bEndDate = typeof b.implementationTime.end === 'string' 
          ? new Date(b.implementationTime.end) 
          : b.implementationTime.end;
        const aDays = Math.ceil((aEndDate.getTime() - aStartDate.getTime()) / (1000 * 60 * 60 * 24));
        const bDays = Math.ceil((bEndDate.getTime() - bStartDate.getTime()) / (1000 * 60 * 60 * 24));
        return aDays - bDays;
      case 'feasibility':
      default:
        return b.feasibility - a.feasibility;
    }
  });
}
