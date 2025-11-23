import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { clusterIncidents } from '@/lib/clustering';
import type { Incident, Pattern, ClusteringOptions } from '@/lib/clustering';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Parse request body
    const body = await request.json();
    const { incident_ids, options, preview } = body as {
      incident_ids?: string[];
      options?: ClusteringOptions;
      preview?: boolean;
    };
    
    // Fetch incidents from database
    let query = supabase.from('incidents').select('*');
    
    if (incident_ids && incident_ids.length > 0) {
      query = query.in('id', incident_ids);
    }
    
    const { data: incidents, error: fetchError } = await query;
    
    if (fetchError) {
      return NextResponse.json(
        { success: false, error: 'Failed to fetch incidents', details: fetchError.message },
        { status: 500 }
      );
    }
    
    if (!incidents || incidents.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No incidents found' },
        { status: 404 }
      );
    }
    
    // Map database fields to clustering Incident type
    const mappedIncidents: Incident[] = incidents.map((inc: any) => ({
      id: inc.id,
      time: inc.time,
      service: inc.service || '',
      source: inc.source || '',
      subservice: inc.subservice || '',
      priority: inc.priority || 0,
      category: inc.category || '',
      sentimentAnalysis: inc.sentiment_analysis || inc.sentimentAnalysis || '',
      summary: inc.summary || '',
      original: inc.original || '',
      keywords: inc.keywords || [],
    }));
    
    // Run clustering algorithm
    const patterns = clusterIncidents(mappedIncidents, options);
    
    // If preview mode, just return the patterns without saving
    if (preview) {
      return NextResponse.json({
        success: true,
        patterns_created: patterns.length,
        patterns: patterns.map(p => ({
          title: p.title,
          description: p.description,
          filters: p.filters,
          priority: p.priority,
          frequency: p.frequency,
          time_range_start: p.timeRangeStart,
          time_range_end: p.timeRangeEnd,
          incident_ids: p.incidentIds,
        })),
      });
    }
    
    // Save patterns to database
    const savedPatterns: any[] = [];
    
    for (const pattern of patterns) {
      const { data: savedPattern, error: saveError } = await supabase
        .from('patterns')
        .insert({
          title: pattern.title,
          description: pattern.description,
          filters: pattern.filters,
          priority: pattern.priority,
          frequency: pattern.frequency,
          time_range_start: pattern.timeRangeStart,
          time_range_end: pattern.timeRangeEnd,
          incident_ids: pattern.incidentIds,
        })
        .select()
        .single();
      
      if (saveError) {
        console.error('Error saving pattern:', saveError);
        continue;
      }
      
      savedPatterns.push(savedPattern);
      
      // Create incident-pattern relationships
      if (pattern.incidentIds && savedPattern) {
        const relationships = pattern.incidentIds.map(incidentId => ({
          incident_id: incidentId,
          pattern_id: savedPattern.id,
          similarity_score: 1.0, // Could compute actual similarity if needed
        }));
        
        await supabase.from('incident_patterns').insert(relationships);
      }
    }
    
    return NextResponse.json({
      success: true,
      patterns_created: savedPatterns.length,
      patterns: savedPatterns.map(p => ({
        id: p.id,
        title: p.title,
        priority: p.priority,
        frequency: p.frequency,
        time_range: {
          start: p.time_range_start,
          end: p.time_range_end,
        },
      })),
    });
    
  } catch (error: any) {
    console.error('Clustering error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
