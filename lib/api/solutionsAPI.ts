import type { Solution, SolutionGenerationOptions, Pattern } from '@/lib/types/solution';

/**
 * Generate solutions for a given pattern using the Groq AI API
 * @param pattern - The incident pattern to generate solutions for
 * @param options - Optional configuration for solution generation
 * @returns Promise<Solution[]> - Array of generated solutions
 */
export async function generateSolutionsAPI(
  pattern: Pattern,
  options: SolutionGenerationOptions = {}
): Promise<Solution[]> {
  const response = await fetch('/api/solutions/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      pattern,
      options: {
        maxSolutions: 5,
        feasibilityThreshold: 3,
        prioritizeBy: 'feasibility',
        ...options,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error || 'Failed to generate solutions');
  }

  return data.solutions || [];
}

/**
 * Utility function to filter solutions by constraints
 * @param solutions - Array of solutions to filter
 * @param maxCost - Maximum cost threshold
 * @param maxDays - Maximum implementation days
 * @param minFeasibility - Minimum feasibility score
 * @returns Filtered array of solutions
 */
export function filterSolutions(
  solutions: Solution[],
  maxCost?: number,
  maxDays?: number,
  minFeasibility?: number
): Solution[] {
  return solutions.filter(solution => {
    if (maxCost && solution.cost.min > maxCost) return false;
    if (maxDays) {
      const days = Math.ceil((solution.implementationTime.end.getTime() - solution.implementationTime.start.getTime()) / (1000 * 60 * 60 * 24));
      if (days > maxDays) return false;
    }
    if (minFeasibility && solution.feasibility < minFeasibility) return false;
    return true;
  });
}

/**
 * Utility function to sort solutions by different criteria
 * @param solutions - Array of solutions to sort
 * @param sortBy - Sorting criteria
 * @returns Sorted array of solutions
 */
export function sortSolutions(
  solutions: Solution[],
  sortBy: 'cost' | 'feasibility' | 'time' = 'feasibility'
): Solution[] {
  return [...solutions].sort((a, b) => {
    switch (sortBy) {
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

/**
 * Calculate the total cost range for a set of solutions
 * @param solutions - Array of solutions
 * @returns Object with min and max total costs
 */
export function calculateTotalCost(solutions: Solution[]): { min: number; max: number } {
  return solutions.reduce(
    (total, solution) => ({
      min: total.min + solution.cost.min,
      max: total.max + solution.cost.max,
    }),
    { min: 0, max: 0 }
  );
}

/**
 * Get solution statistics
 * @param solutions - Array of solutions
 * @returns Statistics object
 */
export function getSolutionStats(solutions: Solution[]) {
  if (solutions.length === 0) {
    return {
      count: 0,
      avgFeasibility: 0,
      avgCost: 0,
      avgDays: 0,
    };
  }

  const avgFeasibility = solutions.reduce((sum, s) => sum + s.feasibility, 0) / solutions.length;
  const avgCost = solutions.reduce((sum, s) => sum + (s.cost.min + s.cost.max) / 2, 0) / solutions.length;
  const avgDays = solutions.reduce((sum, s) => {
    const days = Math.ceil((s.implementationTime.end.getTime() - s.implementationTime.start.getTime()) / (1000 * 60 * 60 * 24));
    return sum + days;
  }, 0) / solutions.length;

  return {
    count: solutions.length,
    avgFeasibility: Math.round(avgFeasibility * 100) / 100,
    avgCost: Math.round(avgCost),
    avgDays: Math.round(avgDays),
  };
}
