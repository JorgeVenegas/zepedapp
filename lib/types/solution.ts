export interface Solution {
  name: string;
  description: string;
  cost: {
    min: number;
    max: number;
  };
  feasibility: number; // 1-10 scale (10 = most feasible)
  implementationTime: {
    start: Date;
    end: Date;
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
    feasibility: number;
    estimatedDays: number;
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
