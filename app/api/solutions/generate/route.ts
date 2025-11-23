import { NextRequest, NextResponse } from 'next/server';
import { generateSolutions } from '@/lib/solutions/solutionGenerator';

export async function POST(request: NextRequest) {
  try {
    const { pattern, options = {} } = await request.json();
    
    if (!pattern) {
      return NextResponse.json(
        { success: false, error: 'Pattern is required' },
        { status: 400 }
      );
    }
    
    // Validate pattern structure
    if (!pattern.title || !pattern.description) {
      return NextResponse.json(
        { success: false, error: 'Pattern must have title and description' },
        { status: 400 }
      );
    }
    
    console.log('Generating solutions for pattern:', pattern.title);
    
    // Generate solutions
    const solutions = await generateSolutions(pattern, {
      maxSolutions: 5,
      feasibilityThreshold: 3,
      ...options
    });
    
    return NextResponse.json({
      success: true,
      solutions,
      count: solutions.length,
      message: `Generated ${solutions.length} solutions`
    });
    
  } catch (error: any) {
    console.error('Solution generation error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to generate solutions',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
