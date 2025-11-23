/**
 * Test script to verify translation caching works correctly
 */

import { createClient } from '@supabase/supabase-js';

async function testTranslationCaching() {
  console.log('🧪 Testing Translation Caching\n');
  console.log('='.repeat(60));
  
  // Initialize Supabase client
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials');
    process.exit(1);
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  // Check if incident_translations table exists
  console.log('\n📋 Checking incident_translations table...');
  const { data: tables, error: tablesError } = await supabase
    .from('incident_translations')
    .select('count')
    .limit(1);
  
  if (tablesError) {
    console.error('❌ incident_translations table does not exist!');
    console.error('Run this migration first:');
    console.error('  supabase/migrations/20250122000001_create_incident_translations.sql');
    process.exit(1);
  }
  
  console.log('✅ incident_translations table exists');
  
  // Count existing cached translations
  const { count: cachedCount } = await supabase
    .from('incident_translations')
    .select('*', { count: 'exact', head: true });
  
  console.log(`\n📊 Current cache status:`);
  console.log(`  Cached translations: ${cachedCount || 0}`);
  
  // Sample a few incidents to check if they have Spanish text
  console.log('\n🔍 Checking for Spanish incidents...');
  const { data: incidents, error: incidentsError } = await supabase
    .from('incidents')
    .select('id, summary, keywords')
    .limit(10);
  
  if (incidentsError || !incidents) {
    console.error('❌ Failed to fetch incidents:', incidentsError);
    process.exit(1);
  }
  
  console.log(`\n📝 Sample incidents (first 5):`);
  incidents.slice(0, 5).forEach((inc, idx) => {
    const hasSpanishIndicators = /[áéíóúñ¿¡]/i.test(inc.summary) || 
                                  /(el |la |los |las |de |en |para )/i.test(inc.summary);
    console.log(`  [${idx + 1}] ${inc.id.substring(0, 8)}... - ${hasSpanishIndicators ? '🇪🇸 Spanish' : '🇬🇧 English'}`);
    console.log(`      Summary: "${inc.summary.substring(0, 60)}..."`);
  });
  
  // Check if any of these incidents have cached translations
  const incidentIds = incidents.map(i => i.id);
  const { data: cached, error: cachedError } = await supabase
    .from('incident_translations')
    .select('incident_id, translated_summary')
    .in('incident_id', incidentIds);
  
  if (cachedError) {
    console.error('❌ Failed to check cached translations:', cachedError);
  } else {
    console.log(`\n💾 Cached translations for sample incidents: ${cached?.length || 0}/${incidents.length}`);
    if (cached && cached.length > 0) {
      cached.slice(0, 3).forEach((trans, idx) => {
        console.log(`  [${idx + 1}] ${trans.incident_id.substring(0, 8)}...`);
        console.log(`      Translation: "${trans.translated_summary.substring(0, 60)}..."`);
      });
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ Translation caching test completed!');
  console.log('\n💡 Next steps:');
  console.log('  1. If incident_translations table does not exist, run the migration');
  console.log('  2. Run pattern clustering to generate translations');
  console.log('  3. Run this test again to verify translations are cached');
  console.log('  4. Second run should be much faster due to caching');
}

// Run the test
testTranslationCaching().catch(error => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});
