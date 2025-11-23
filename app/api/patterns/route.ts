import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const priorityMin = searchParams.get('priority_min');
    const priorityMax = searchParams.get('priority_max');
    const frequencyMin = searchParams.get('frequency_min');
    const service = searchParams.get('service');
    const category = searchParams.get('category');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    
    // Build query
    let query = supabase.from('patterns').select('*', { count: 'exact' });
    
    if (priorityMin) {
      query = query.gte('priority', parseInt(priorityMin));
    }
    if (priorityMax) {
      query = query.lte('priority', parseInt(priorityMax));
    }
    if (frequencyMin) {
      query = query.gte('frequency', parseInt(frequencyMin));
    }
    if (startDate) {
      query = query.gte('time_range_start', startDate);
    }
    if (endDate) {
      query = query.lte('time_range_end', endDate);
    }
    
    // JSONB filters (service and category)
    if (service) {
      query = query.contains('filters', { services: [service] });
    }
    if (category) {
      query = query.contains('filters', { categories: [category] });
    }
    
    // Order and pagination
    query = query
      .order('priority', { ascending: false })
      .order('frequency', { ascending: false })
      .range(offset, offset + limit - 1);
    
    const { data: patterns, error, count } = await query;
    
    if (error) {
      return NextResponse.json(
        { success: false, error: 'Failed to fetch patterns', details: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      total: count || 0,
      limit,
      offset,
      patterns,
    });
    
  } catch (error: any) {
    console.error('Error fetching patterns:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    
    console.log('POST /api/patterns - Received request body:', JSON.stringify(body, null, 2));
    
    const { 
      title, 
      description, 
      filters, 
      priority, 
      frequency, 
      time_range_start, 
      time_range_end, 
      incident_ids 
    } = body;
    
    // Validate required fields
    if (!title || !description) {
      console.error('POST /api/patterns - Validation failed: Missing title or description');
      return NextResponse.json(
        { success: false, error: 'Title and description are required' },
        { status: 400 }
      );
    }
    
    // Insert pattern
    const insertData = {
      title,
      description,
      filters: filters || {},
      priority: priority || 0,
      frequency: frequency || 0,
      time_range_start,
      time_range_end,
      incident_ids: incident_ids || [],
    };
    
    console.log('POST /api/patterns - Attempting to insert:', JSON.stringify(insertData, null, 2));
    
    const { data: pattern, error: insertError } = await supabase
      .from('patterns')
      .insert(insertData)
      .select()
      .single();
    
    if (insertError) {
      console.error('POST /api/patterns - Insert failed:', {
        error: insertError,
        message: insertError.message,
        details: insertError.details,
        hint: insertError.hint,
        code: insertError.code,
      });
      return NextResponse.json(
        { success: false, error: 'Failed to save pattern', details: insertError.message },
        { status: 500 }
      );
    }
    
    console.log('POST /api/patterns - Pattern inserted successfully:', pattern?.id);
    
    // Create incident-pattern relationships if incident_ids provided
    if (incident_ids && incident_ids.length > 0 && pattern) {
      const relationships = incident_ids.map((incidentId: string) => ({
        incident_id: incidentId,
        pattern_id: pattern.id,
        similarity_score: 1.0,
      }));
      
      console.log(`POST /api/patterns - Creating ${relationships.length} incident-pattern relationships`);
      
      const { error: relationshipError } = await supabase.from('incident_patterns').insert(relationships);
      
      if (relationshipError) {
        console.error('POST /api/patterns - Failed to create incident-pattern relationships:', relationshipError);
        // Don't fail the entire request, just log the error
      } else {
        console.log('POST /api/patterns - Incident-pattern relationships created successfully');
      }
    }
    
    console.log('POST /api/patterns - Request completed successfully');
    
    return NextResponse.json({
      success: true,
      pattern,
    });
    
  } catch (error: any) {
    console.error('POST /api/patterns - Unexpected error:', {
      error,
      message: error?.message,
      stack: error?.stack,
      name: error?.name,
    });
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
