#!/usr/bin/env node
import { generateSolutions } from '../lib/solutions/solutionGenerator.js';

// Test pattern data
const testPattern = {
  id: 'test-pattern-1',
  title: 'Database Connection Timeouts',
  description: 'Multiple incidents of database connection timeouts affecting user login and data retrieval operations',
  priority: 8,
  frequency: 12,
  time_range: {
    start: '2024-11-01T00:00:00Z',
    end: '2024-11-22T00:00:00Z'
  },
  filters: {
    services: ['user-service', 'auth-service'],
    categories: ['database', 'performance'],
    keywords: ['timeout', 'connection', 'database', 'slow']
  }
};

async function testSolutionGeneration() {
  console.log('🚀 Testing Groq AI Solution Generation...\n');
  console.log('Pattern:', testPattern.title);
  console.log('Priority:', testPattern.priority);
  console.log('Frequency:', testPattern.frequency);
  console.log('\n⏳ Generating solutions...\n');
  
  try {
    const solutions = await generateSolutions(testPattern, {
      maxSolutions: 3,
      feasibilityThreshold: 5
    });
    
    console.log(`✅ Generated ${solutions.length} solutions:\n`);
    
    solutions.forEach((solution, index) => {
      const days = Math.ceil((solution.implementationTime.end.getTime() - solution.implementationTime.start.getTime()) / (1000 * 60 * 60 * 24));
      console.log(`${index + 1}. ${solution.name}`);
      console.log(`   Cost: $${solution.cost.min.toLocaleString()} - $${solution.cost.max.toLocaleString()}`);
      console.log(`   Feasibility: ${solution.feasibility}/10`);
      console.log(`   Timeline: ${days} days (${solution.implementationTime.start.toDateString()} - ${solution.implementationTime.end.toDateString()})`);
      console.log(`   Description: ${solution.description.substring(0, 100)}...`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testSolutionGeneration();
