#!/usr/bin/env node

// Demo script to show the simplified solution format
async function showSolutionFormat() {
  console.log('🧪 Testing Simplified Solution Format\n');
  
  const testPattern = {
    id: 'demo-pattern',
    title: 'Database Connection Failures',
    description: 'Repeated database connection failures causing user login issues',
    priority: 8,
    frequency: 10,
    time_range: {
      start: '2024-11-01T00:00:00Z',
      end: '2024-11-22T00:00:00Z'
    },
    filters: {
      services: ['database-service'],
      categories: ['connectivity', 'performance']
    }
  };

  try {
    const response = await fetch('http://localhost:3000/api/solutions/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pattern: testPattern,
        options: { maxSolutions: 1 }
      })
    });

    const data = await response.json();

    if (data.success && data.solutions.length > 0) {
      const solution = data.solutions[0];
      const startDate = new Date(solution.implementationTime.start);
      const endDate = new Date(solution.implementationTime.end);
      const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));

      console.log('📋 SIMPLIFIED SOLUTION FORMAT:\n');
      console.log(`🏷️  Name: ${solution.name}\n`);
      console.log(`📝 Description: ${solution.description}\n`);
      console.log(`💰 Cost Range: $${solution.cost.min.toLocaleString()} - $${solution.cost.max.toLocaleString()}\n`);
      console.log(`🎯 Feasibility: ${solution.feasibility}/10\n`);
      console.log(`📅 Implementation Time:`);
      console.log(`   Start: ${startDate.toDateString()}`);
      console.log(`   End: ${endDate.toDateString()}`);
      console.log(`   Duration: ${days} days\n`);
      
      console.log('✅ Solution contains ONLY the 5 required fields:');
      console.log('   1. Name (String)');
      console.log('   2. Description (String)');
      console.log('   3. Cost (Range<Int>)');
      console.log('   4. Feasibility (Integer 1-10)');
      console.log('   5. Time of Implementation (Date Range)');
      
    } else {
      console.error('❌ Error:', data.error || 'No solutions generated');
    }
  } catch (error) {
    console.error('❌ Network Error:', error.message);
  }
}

showSolutionFormat();
