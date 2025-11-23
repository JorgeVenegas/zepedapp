export interface Solution {
  name: string;
  description: string;
  cost: {
    min: number;
    max: number;
    justification?: string; // Detailed cost breakdown and reasoning
  };
  feasibility: number; // 1-10 scale (10 = most feasible)
  feasibilityJustification?: string; // Explanation of feasibility factors
  implementationTime: {
    start: Date | string; // Date object or ISO string from API
    end: Date | string;   // Date object or ISO string from API
    justification?: string; // Timeline breakdown and dependencies
  };
}

export interface SolutionGenerationOptions {
  budgetLimit?: number;
  timeConstraint?: number; // days
  feasibilityThreshold?: number; // 1-10
  maxSolutions?: number;
  prioritizeBy?: 'cost' | 'time' | 'feasibility' | 'impact';
}

export interface GroqSolutionResponse {
  solutions: Array<{
    name: string;
    description: string;
    costMin: number;
    costMax: number;
    costJustification?: string;
    feasibility: number;
    feasibilityJustification?: string;
    estimatedDays: number;
    timeJustification?: string;
  }>;
}

export interface Pattern {
  id: string;
  title: string;
  description: string;
  filters: Record<string, any>;
  priority: number;
  frequency: number;
  time_range: {
    start: string;
    end: string;
  };
}
