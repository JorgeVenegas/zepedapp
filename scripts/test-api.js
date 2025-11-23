#!/usr/bin/env node

// Simple test script to verify the solution generation API
async function testSolutionAPI() {
  const testPattern = {
    id: 'test-pattern-1',
    title: 'Database Connection Timeouts',
    description: 'Multiple incidents of database connection timeouts affecting user login and data retrieval operations. Users report slow response times and failed login attempts during peak hours.',
    priority: 8,
    frequency: 12,
    time_range: {
      start: '2024-11-01T00:00:00Z',
      end: '2024-11-22T00:00:00Z'
    },
    filters: {
      services: ['user-service', 'auth-service'],
      categories: ['database', 'performance'],
      keywords: ['timeout', 'connection', 'database', 'slow'],
      priority_range: {
        min: 6,
        max: 10
      }
    }
  };

  const options = {
    maxSolutions: 3,
    feasibilityThreshold: 5,
    prioritizeBy: 'feasibility'
  };

  console.log('🚀 Testing Solution Generation API\n');
  console.log('Pattern:', testPattern.title);
  console.log('Priority:', testPattern.priority, '| Frequency:', testPattern.frequency);
  console.log('\n⏳ Calling API...\n');

  try {
    const response = await fetch('http://localhost:3000/api/solutions/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pattern: testPattern, options })
    });

    const data = await response.json();

    if (data.success) {
      console.log(`✅ Success! Generated ${data.count} solutions:\n`);
      
      data.solutions.forEach((solution, index) => {
        console.log(`${index + 1}. ${solution.name}`);
        console.log(`   💰 Cost: $${solution.cost.min.toLocaleString()} - $${solution.cost.max.toLocaleString()}`);
        console.log(`   🎯 Feasibility: ${solution.feasibility}/10`);
        console.log(`   ⏱️  Timeline: ${solution.implementationTime.estimatedDays} days`);
        console.log(`   📈 Impact: ${solution.impact}`);
        console.log(`   🏷️  Tags: ${solution.tags.join(', ')}`);
        console.log(`   📝 Description: ${solution.description}`);
        if (solution.reasoning) {
          console.log(`   🤖 AI Reasoning: ${solution.reasoning}`);
        }
        console.log('');
      });
    } else {
      console.error('❌ API Error:', data.error);
    }
  } catch (error) {
    console.error('❌ Network Error:', error.message);
  }
}

// Run the test if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testSolutionAPI();
}
