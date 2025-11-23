import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    const { 
      pattern_id, 
      name, 
      description, 
      cost_min, 
      cost_max, 
      feasibility, 
      implementation_start_date, 
      implementation_end_date 
    } = body;

    // Validate required fields
    if (!name || !description) {
      return NextResponse.json(
        { success: false, error: 'Name and description are required' },
        { status: 400 }
      );
    }

    // Validate feasibility is within range
    if (feasibility !== undefined && (feasibility < 1 || feasibility > 10)) {
      return NextResponse.json(
        { success: false, error: 'Feasibility must be between 1 and 10' },
        { status: 400 }
      );
    }

    // Create solution with provided or default values
    const { data, error } = await supabase
      .from('solutions')
      .insert({
        name,
        description,
        cost_min: cost_min ?? 0,
        cost_max: cost_max ?? 0,
        feasibility: feasibility ?? 5,
        implementation_start_date: implementation_start_date ?? new Date().toISOString(),
        implementation_end_date: implementation_end_date ?? new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating solution:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
      message: 'Solution created successfully',
    });
  } catch (error) {
    console.error('Error in POST /api/solutions:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get all solutions
    const { data, error } = await supabase
      .from('solutions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching solutions:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      solutions: data,
    });
  } catch (error) {
    console.error('Error in GET /api/solutions:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
