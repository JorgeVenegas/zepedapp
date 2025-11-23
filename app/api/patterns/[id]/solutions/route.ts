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

    // Save solutions to database
    const solutionsToInsert = solutions.map(solution => ({
      pattern_id: patternId,
      name: solution.name,
      description: solution.description,
      cost_min: solution.cost_min,
      cost_max: solution.cost_max,
      feasibility: solution.feasibility,
      implementation_start_date: solution.implementation_start_date,
      implementation_end_date: solution.implementation_end_date,
    }))

    const { data: savedSolutions, error: saveError } = await supabase
      .from('solutions')
      .insert(solutionsToInsert)
      .select()

    if (saveError) {
      console.error('Error saving solutions:', saveError)
      return NextResponse.json(
        { success: false, error: 'Failed to save solutions' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      solutions: savedSolutions,
      count: savedSolutions?.length || 0,
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
