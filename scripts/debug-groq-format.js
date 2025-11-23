// Script para debuggear el formato exacto que devuelve Groq API
import { generateSolutionsWithGroq } from '../lib/ai/groqClient.js';

const testPattern = {
  id: 'debug-test',
  title: 'Debug Format Test',
  description: 'Testing to see exact Groq response format',
  priority: 6,
  frequency: 4,
  time_range: {
    start: '2024-11-01T00:00:00Z',
    end: '2024-11-22T00:00:00Z'
  },
  filters: {
    services: ['test-service'],
    categories: ['testing']
  }
};

async function debugGroqResponse() {
  console.log('🔍 Debugging Groq API Response Format...\n');
  
  try {
    console.log('📤 Enviando pattern a Groq:');
    console.log(JSON.stringify(testPattern, null, 2));
    console.log('\n⏳ Llamando a Groq API...\n');
    
    const groqResponse = await generateSolutionsWithGroq(testPattern, {
      maxSolutions: 2,
      feasibilityThreshold: 5
    });
    
    console.log('📥 Respuesta RAW de Groq:');
    console.log('Type:', typeof groqResponse);
    console.log('Keys:', Object.keys(groqResponse));
    console.log('Full Response:', JSON.stringify(groqResponse, null, 2));
    
    if (groqResponse.solutions && Array.isArray(groqResponse.solutions)) {
      console.log('\n📊 Estructura de cada solución:');
      groqResponse.solutions.forEach((solution, index) => {
        console.log(`\n--- Solución ${index + 1} ---`);
        console.log('Keys:', Object.keys(solution));
        console.log('Types:', Object.entries(solution).reduce((acc, [key, value]) => {
          acc[key] = typeof value;
          return acc;
        }, {}));
        console.log('Sample solution:', JSON.stringify(solution, null, 2));
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

debugGroqResponse();
