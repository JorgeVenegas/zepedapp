/**
 * Test script for Spanish to English translation
 */

import { translateToEnglish, translateKeywords } from '../lib/clustering/translation';

async function testTranslation() {
  console.log('🧪 Testing Spanish to English Translation\n');
  console.log('='.repeat(60));
  
  // Test 1: Translate Spanish summary
  console.log('\n📝 Test 1: Translate Spanish summary');
  const spanishSummary = 'parada no planificada generó demora y estrés';
  console.log(`Input (Spanish): "${spanishSummary}"`);
  
  const translatedSummary = await translateToEnglish(spanishSummary);
  console.log(`Output (English): "${translatedSummary}"`);
  
  // Test 2: Translate keywords
  console.log('\n📝 Test 2: Translate Spanish keywords');
  const spanishKeywords = ['demora', 'parada', 'estrés', 'comunicación', 'apoyo'];
  console.log(`Input (Spanish): ${JSON.stringify(spanishKeywords)}`);
  
  const translatedKeywords = await translateKeywords(spanishKeywords);
  console.log(`Output (English): ${JSON.stringify(translatedKeywords)}`);
  
  // Test 3: English text (should not translate)
  console.log('\n📝 Test 3: English text (should pass through)');
  const englishText = 'database connection timeout error';
  console.log(`Input (English): "${englishText}"`);
  
  const passthrough = await translateToEnglish(englishText);
  console.log(`Output (unchanged): "${passthrough}"`);
  
  // Test 4: Mixed incident data
  console.log('\n📝 Test 4: Real incident example');
  const incident = {
    summary: 'Me dirijo a ustedes para describir un incidente ocurrido en el tren',
    keywords: ['tren', 'retraso', 'problema']
  };
  
  console.log('Input incident:');
  console.log(`  Summary: "${incident.summary}"`);
  console.log(`  Keywords: ${JSON.stringify(incident.keywords)}`);
  
  const translatedIncidentSummary = await translateToEnglish(incident.summary);
  const translatedIncidentKeywords = await translateKeywords(incident.keywords);
  
  console.log('\nTranslated incident:');
  console.log(`  Summary: "${translatedIncidentSummary}"`);
  console.log(`  Keywords: ${JSON.stringify(translatedIncidentKeywords)}`);
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ Translation tests completed!');
  console.log('\n💡 Next steps:');
  console.log('  1. Run this migration in Supabase to create translations table:');
  console.log('     supabase/migrations/20250122000001_create_incident_translations.sql');
  console.log('  2. Run clustering - Spanish incidents will be auto-translated');
  console.log('  3. Patterns will have English titles and descriptions');
}

// Run the tests
testTranslation().catch(error => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});
