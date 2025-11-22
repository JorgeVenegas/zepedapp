'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Pattern {
  id: string;
  title: string;
  description: string;
  priority: number;
  frequency: number;
  time_range: {
    start: string;
    end: string;
  };
}

export default function PatternClusteringDemo() {
  const [loading, setLoading] = useState(false);
  const [patterns, setPatterns] = useState<Pattern[]>([]);
  const [error, setError] = useState<string | null>(null);

  const triggerClustering = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/patterns/cluster', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          options: {
            similarityThreshold: 0.65,
            timeWindowHours: 24,
          },
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setPatterns(data.patterns || []);
      } else {
        setError(data.error || 'Failed to cluster incidents');
      }
    } catch (err: any) {
      setError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  const fetchPatterns = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/patterns?limit=20');
      const data = await response.json();
      
      if (data.success) {
        setPatterns(data.patterns || []);
      } else {
        setError(data.error || 'Failed to fetch patterns');
      }
    } catch (err: any) {
      setError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: number) => {
    if (priority >= 8) return 'destructive';
    if (priority >= 5) return 'default';
    return 'secondary';
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold">Pattern Clustering</h1>
        <p className="text-muted-foreground">
          Automatically cluster incidents into patterns based on similarity
        </p>
        
        <div className="flex gap-3">
          <Button 
            onClick={triggerClustering} 
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Run Clustering'}
          </Button>
          <Button 
            onClick={fetchPatterns} 
            disabled={loading}
            variant="outline"
          >
            Load Existing Patterns
          </Button>
        </div>
      </div>

      {error && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
          </CardContent>
        </Card>
      )}

      {patterns.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">
            Found {patterns.length} Pattern{patterns.length !== 1 ? 's' : ''}
          </h2>
          
          <div className="grid gap-4">
            {patterns.map((pattern) => (
              <Card key={pattern.id}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <CardTitle className="text-lg">{pattern.title}</CardTitle>
                    <div className="flex gap-2">
                      <Badge variant={getPriorityColor(pattern.priority)}>
                        Priority {pattern.priority}
                      </Badge>
                      <Badge variant="outline">
                        {pattern.frequency} incident{pattern.frequency !== 1 ? 's' : ''}
                      </Badge>
                    </div>
                  </div>
                  <CardDescription>{pattern.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    <p>
                      Time range: {new Date(pattern.time_range.start).toLocaleString()} 
                      {' → '}
                      {new Date(pattern.time_range.end).toLocaleString()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {patterns.length === 0 && !loading && !error && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              No patterns yet. Click "Run Clustering" to analyze incidents.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
