import type { Solution, SolutionGenerationOptions, Pattern } from '@/lib/types/solution';

/**
 * Helper function to safely get time from Date or string
 */
const getTime = (date: Date | string): number => {
  if (typeof date === 'string') {
    return new Date(date).getTime();
  }
  return date.getTime();
};

/**
 * Helper function to safely calculate days between dates
 */
const calculateDays = (start: Date | string, end: Date | string): number => {
  try {
    const startTime = getTime(start);
    const endTime = getTime(end);
    return Math.ceil((endTime - startTime) / (1000 * 60 * 60 * 24));
  } catch (error) {
    console.error('Error calculating days:', error);
    return 0;
  }
};

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
      const days = calculateDays(solution.implementationTime.start, solution.implementationTime.end);
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
        const aDays = calculateDays(a.implementationTime.start, a.implementationTime.end);
        const bDays = calculateDays(b.implementationTime.start, b.implementationTime.end);
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
    const days = calculateDays(s.implementationTime.start, s.implementationTime.end);
    return sum + days;
  }, 0) / solutions.length;

  return {
    count: solutions.length,
    avgFeasibility: Math.round(avgFeasibility * 100) / 100,
    avgCost: Math.round(avgCost),
    avgDays: Math.round(avgDays),
  };
}
