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
