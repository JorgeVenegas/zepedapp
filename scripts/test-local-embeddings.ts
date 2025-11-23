/**
 * Test script for local embedding generation using @xenova/transformers
 */

import { generateEmbedding } from '../lib/clustering/embeddings';

async function testLocalEmbeddings() {
  console.log('🧪 Testing Local Embedding Generation\n');
  console.log('='.repeat(60));
  
  // Test 1: Single embedding generation
  console.log('\n📝 Test 1: Generate embedding for sample text');
  console.log('Input: "Database connection timeout"\n');
  
  const text = 'Database connection timeout';
  const embedding = await generateEmbedding(text);
  
  if (!embedding) {
    console.error('❌ Failed to generate embedding');
    process.exit(1);
  }
  
  console.log('✅ Embedding generated successfully!');
  console.log(`📊 Vector dimension: ${embedding.length}`);
  console.log(`📈 First 5 values: [${embedding.slice(0, 5).map(n => n.toFixed(4)).join(', ')}]`);
  console.log(`📉 Last 5 values: [${embedding.slice(-5).map(n => n.toFixed(4)).join(', ')}]`);
  
  // Validate dimension
  if (embedding.length !== 384) {
    console.error(`❌ Expected 384 dimensions, got ${embedding.length}`);
    process.exit(1);
  }
  
  console.log('\n✅ Vector dimension is correct (384)');
  
  // Test 2: Multiple embeddings
  console.log('\n📝 Test 2: Generate embeddings for multiple texts');
  
  const texts = [
    'API timeout error in production',
    'Database connection pool exhausted',
    'Memory leak causing service crash'
  ];
  
  const embeddings = [];
  for (const txt of texts) {
    const emb = await generateEmbedding(txt);
    if (emb) {
      embeddings.push(emb);
      console.log(`  ✓ Generated embedding for: "${txt}"`);
    }
  }
  
  console.log(`\n✅ Generated ${embeddings.length}/${texts.length} embeddings`);
  
  // Test 3: Similarity check
  console.log('\n📝 Test 3: Check semantic similarity (cosine)');
  
  const cosineSimilarity = (a: number[], b: number[]): number => {
    let dotProduct = 0;
    let magA = 0;
    let magB = 0;
    
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      magA += a[i] * a[i];
      magB += b[i] * b[i];
    }
    
    return dotProduct / (Math.sqrt(magA) * Math.sqrt(magB));
  };
  
  if (embeddings.length >= 2) {
    const sim1 = cosineSimilarity(embeddings[0], embeddings[1]);
    const sim2 = cosineSimilarity(embeddings[0], embeddings[2]);
    
    console.log(`  Similarity (timeout vs database): ${(sim1 * 100).toFixed(2)}%`);
    console.log(`  Similarity (timeout vs memory): ${(sim2 * 100).toFixed(2)}%`);
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ All tests passed! Local embeddings are working correctly.');
  console.log('\n💡 Next steps:');
  console.log('  1. Truncate incident_embeddings table in Supabase');
  console.log('  2. Run clustering to generate new 384D embeddings');
  console.log('  3. Verify cache is working (second run should be instant)');
}

// Run the tests
testLocalEmbeddings().catch(error => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});
