import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { clusterIncidents } from '@/lib/clustering';
import { loadCachedEmbeddings, saveCachedEmbeddings } from '@/lib/clustering/embeddings';
import { loadCachedTranslations, saveCachedTranslations } from '@/lib/clustering/translation';
import type { Incident, Pattern, ClusteringOptions } from '@/lib/clustering';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Parse request body
    const body = await request.json();
    const { incident_ids, options, preview, filters, dateRange } = body as {
      incident_ids?: string[];
      options?: ClusteringOptions;
      preview?: boolean;
      filters?: Record<string, string[]>;
      dateRange?: string;
    };
    
    console.log('=== CLUSTERING REQUEST ===');
    console.log('Incident IDs count:', incident_ids?.length || 'all');
    console.log('Filters:', filters);
    console.log('Date Range:', dateRange);
    console.log('Options received:', options ? JSON.stringify(options, null, 2) : 'undefined (will use defaults)');
    console.log('Preview mode:', preview);
    
    // Fetch incidents from database with filters
    let query = supabase.from('incidents').select('*');
    
    // Apply incident_ids filter if provided
    if (incident_ids && incident_ids.length > 0) {
      query = query.in('id', incident_ids);
    }
    
    // Apply date range filter
    if (dateRange) {
      const now = new Date();
      let startDate: Date;
      
      switch (dateRange) {
        case 'Last 24 hours':
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case 'Last 7 days':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'Last 30 days':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case 'Last 90 days':
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      }
      
      query = query.gte('time', startDate.toISOString());
    }
    
    // Apply field filters (service, source, category, subservice, priority)
    if (filters) {
      Object.entries(filters).forEach(([field, values]) => {
        if (values && values.length > 0) {
          // Handle priority field - remove 'P' prefix
          if (field === 'priority') {
            const priorityValues = values.map(v => parseInt(v.replace('P', '')));
            query = query.in(field, priorityValues);
          } else {
            query = query.in(field, values);
          }
        }
      });
    }
    
    const { data: incidents, error: fetchError } = await query;
    
    console.log('Fetched incidents:', incidents?.length || 0);
    
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
    
    console.log('Mapped incidents sample (first 3):');
    mappedIncidents.slice(0, 3).forEach((inc, idx) => {
      console.log(`  [${idx}]:`, {
        id: inc.id,
        time: inc.time,
        service: inc.service,
        category: inc.category,
        summary: inc.summary?.substring(0, 100),
        keywords: inc.keywords,
      });
    });
    
    // Run clustering algorithm
    const clusteringOptions = options || {
      similarityThreshold: 0.55, // Slightly higher threshold for better quality
      timeWindowHours: 168,      // 7 days window to capture more incidents
      minClusterSize: 2,         // Require at least 2 incidents per pattern
      useEmbeddings: true,       // Enable AI-powered clustering with local model (cached)
      embeddingModel: 'Xenova/all-MiniLM-L6-v2',
    };
    
    // Load cached embeddings and translations from database
    const incidentIds = mappedIncidents.map(inc => inc.id);
    const cachedEmbeddings = await loadCachedEmbeddings(incidentIds, supabase);
    const cachedTranslations = await loadCachedTranslations(incidentIds, supabase);
    
    console.log(`📦 Cache status before clustering:`);
    console.log(`   - Embeddings: ${cachedEmbeddings.size}/${incidentIds.length}`);
    console.log(`   - Translations: ${cachedTranslations.size}/${incidentIds.length}`);
    
    clusteringOptions.cachedEmbeddings = cachedEmbeddings;
    clusteringOptions.cachedTranslations = cachedTranslations;
    
    console.log('Starting clustering with options:', {
      similarityThreshold: clusteringOptions.similarityThreshold,
      timeWindowHours: clusteringOptions.timeWindowHours,
      minClusterSize: clusteringOptions.minClusterSize,
      useEmbeddings: clusteringOptions.useEmbeddings,
      embeddingModel: clusteringOptions.embeddingModel,
      cachedEmbeddingsSize: cachedEmbeddings.size,
      cachedTranslationsSize: cachedTranslations.size
    });
    const patterns = await clusterIncidents(mappedIncidents, clusteringOptions);
    console.log('Clustering complete. Patterns generated:', patterns.length);
    
    // Save new embeddings and translations back to database for future use
    // Check if there are any new embeddings to save
    const newEmbeddingsCount = (clusteringOptions.cachedEmbeddings?.size || 0) - cachedEmbeddings.size;
    if (clusteringOptions.cachedEmbeddings && newEmbeddingsCount > 0) {
      console.log(`💾 Saving ${newEmbeddingsCount} new embeddings to database...`);
      await saveCachedEmbeddings(clusteringOptions.cachedEmbeddings, supabase);
    }
    
    // Check if there are any new translations to save
    const newTranslationsCount = (clusteringOptions.cachedTranslations?.size || 0) - cachedTranslations.size;
    if (clusteringOptions.cachedTranslations && newTranslationsCount > 0) {
      console.log(`💾 Saving ${newTranslationsCount} new translations to database...`);
      await saveCachedTranslations(clusteringOptions.cachedTranslations, supabase);
    }
    
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
          time_range: {
            start: p.timeRangeStart,
            end: p.timeRangeEnd,
          },
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
          timeRangeStart: pattern.timeRangeStart,
          timeRangeEnd: pattern.timeRangeEnd,
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
          start: p.timeRangeStart,
          end: p.timeRangeEnd,
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
