import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateSolutionsForPattern } from '@/lib/groq'
import type { Pattern } from '@/lib/types'

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const patternId = params?.id

    if (!patternId) {
      return NextResponse.json(
        { success: false, error: 'Pattern ID is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Fetch the pattern
    const { data: pattern, error: patternError } = await supabase
      .from('patterns')
      .select('*')
      .eq('id', patternId)
      .single()

    if (patternError || !pattern) {
      console.error('Error fetching pattern:', patternError)
      return NextResponse.json(
        { success: false, error: 'Pattern not found' },
        { status: 404 }
      )
    }

    // Fetch incident IDs separately
    const { data: incidentPatterns, error: incidentError } = await supabase
      .from('incident_patterns')
      .select('incident_id')
      .eq('pattern_id', patternId)

    if (incidentError) {
      console.error('Error fetching incident patterns:', incidentError)
    }

    // Transform the pattern data to match the expected Pattern type
    const patternData: Pattern = {
      id: pattern.id,
      title: pattern.title,
      description: pattern.description,
      priority: pattern.priority,
      frequency: pattern.frequency,
      filters: pattern.filters || {},
      incidentIds: incidentPatterns?.map((ip: any) => ip.incident_id) || [],
      timeRangeStart: pattern.time_range_start,
      timeRangeEnd: pattern.time_range_end,
      created_at: pattern.created_at,
      updated_at: pattern.updated_at,
    }

    console.log('🤖 Generating solutions for pattern:', patternData.title)

    // Generate solutions using Groq
    const solutions = await generateSolutionsForPattern(patternData)

    console.log(`✅ Generated ${solutions.length} solutions`)

    // Return solutions without saving to database
    // Solutions will be saved only when user clicks "Save Solution" button
    return NextResponse.json({
      success: true,
      solutions: solutions,
      count: solutions.length,
    })
  } catch (error) {
    console.error('Error generating solutions:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    )
  }
}
