import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest, context: any) {
  try {
    const id = context?.params?.id;
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Pattern ID is required' },
        { status: 400 }
      );
    }
    
    const supabase = await createClient();
    
    // Fetch pattern
    const { data: pattern, error } = await supabase
      .from('patterns')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error || !pattern) {
      return NextResponse.json(
        { success: false, error: 'Pattern not found' },
        { status: 404 }
      );
    }
    
    // Fetch related incidents
    const { data: relationships } = await supabase
      .from('incident_patterns')
      .select('incident_id, similarity_score')
      .eq('pattern_id', id);
    
    const incidentIds = relationships?.map(r => r.incident_id) || [];
    
    let incidents = [];
    if (incidentIds.length > 0) {
      const { data: incidentData } = await supabase
        .from('incidents')
        .select('*')
        .in('id', incidentIds);
      
      incidents = incidentData || [];
    }
    
    return NextResponse.json({
      success: true,
      pattern: {
        ...pattern,
        incidents,
      },
    });
    
  } catch (error: any) {
    console.error('Error fetching pattern:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, context: any) {
  try {
    const id = context?.params?.id;
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Pattern ID is required' },
        { status: 400 }
      );
    }
    
    const supabase = await createClient();
    
    const { error } = await supabase
      .from('patterns')
      .delete()
      .eq('id', id);
    
    if (error) {
      return NextResponse.json(
        { success: false, error: 'Failed to delete pattern', details: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Pattern deleted successfully',
    });
    
  } catch (error: any) {
    console.error('Error deleting pattern:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
