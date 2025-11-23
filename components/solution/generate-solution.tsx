'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, DollarSign, Zap, Target, Lightbulb, Clock, TrendingUp } from 'lucide-react';
import type { Solution } from '@/lib/types/solution';

interface GenerateSolutionProps {
  pattern: any;
  onSolutionsGenerated?: (solutions: Solution[]) => void;
}

export default function GenerateSolution({ pattern, onSolutionsGenerated }: GenerateSolutionProps) {
  const [loading, setLoading] = useState(false);
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [error, setError] = useState<string | null>(null);

  const generateSolutions = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/solutions/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pattern,
          options: {
            maxSolutions: 5,
            feasibilityThreshold: 3,
            prioritizeBy: 'feasibility'
          }
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSolutions(data.solutions || []);
        onSolutionsGenerated?.(data.solutions || []);
      } else {
        setError(data.error || 'Failed to generate solutions');
      }
    } catch (err: any) {
      setError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  const getFeasibilityColor = (feasibility: number) => {
    if (feasibility >= 8) return 'default';
    if (feasibility >= 6) return 'secondary';
    if (feasibility >= 4) return 'outline';
    return 'destructive';
  };

  const getImpactColor = (impact: string) => {
    switch (impact.toLowerCase()) {
      case 'high': return 'default';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getImpactIcon = (impact: string) => {
    switch (impact.toLowerCase()) {
      case 'high': return <TrendingUp className="w-3 h-3" />;
      case 'medium': return <Target className="w-3 h-3" />;
      case 'low': return <Clock className="w-3 h-3" />;
      default: return <Target className="w-3 h-3" />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-yellow-600" />
          <h3 className="text-lg font-semibold">AI-Generated Solutions</h3>
        </div>
        <Button 
          onClick={generateSolutions} 
          disabled={loading}
          size="sm"
        >
          <Zap className="w-4 h-4 mr-2" />
          {loading ? 'Generating...' : 'Generate Solutions'}
        </Button>
      </div>

      {error && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive text-base">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{error}</p>
          </CardContent>
        </Card>
      )}

      {solutions.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            <span className="text-sm font-medium">
              {solutions.length} solution{solutions.length !== 1 ? 's' : ''} generated
            </span>
          </div>
          
          {solutions.map((solution, index) => (
            <Card key={solution.id} className="bg-muted/30">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <CardTitle className="text-base font-medium">
                    {index + 1}. {solution.name}
                  </CardTitle>
                  <div className="flex gap-1 flex-shrink-0">
                    <Badge variant={getImpactColor(solution.impact)} className="flex items-center gap-1">
                      {getImpactIcon(solution.impact)}
                      {solution.impact} Impact
                    </Badge>
                    <Badge variant={getFeasibilityColor(solution.feasibility)}>
                      {solution.feasibility}/10 Feasible
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                <p className="text-sm text-muted-foreground">
                  {solution.description}
                </p>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-muted-foreground" />
                    <span>
                      ${solution.cost.min.toLocaleString()} - ${solution.cost.max.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>
                      {solution.implementationTime.estimatedDays} days
                    </span>
                  </div>
                </div>

                {solution.tags.length > 0 && (
                  <div className="flex gap-1 flex-wrap">
                    {solution.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                {solution.reasoning && (
                  <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground font-medium mb-1">
                      AI Reasoning:
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {solution.reasoning}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {solutions.length === 0 && !loading && !error && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <Lightbulb className="w-8 h-8 text-muted-foreground mx-auto" />
              <p className="text-center text-muted-foreground text-sm">
                Click "Generate Solutions" to get AI-powered recommendations for this pattern.
              </p>
              <p className="text-xs text-muted-foreground">
                Solutions will include cost estimates, feasibility scores, and implementation timelines.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
