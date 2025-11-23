import { pipeline } from '@xenova/transformers';
import type { NormalizedIncident } from './types';

// Singleton pattern: Keep one instance of the pipeline to avoid reloading the model
let embeddingPipeline: any = null;

/**
 * Initialize the local embedding pipeline (lazy loading)
 * Uses Xenova/all-MiniLM-L6-v2 for 384-dimensional embeddings
 */
async function getPipeline(): Promise<any> {
  if (embeddingPipeline) {
    return embeddingPipeline;
  }
  
  try {
    console.log('🔧 Loading local embedding model (Xenova/all-MiniLM-L6-v2)...');
    
    // Suppress ONNX runtime warnings during model loading
    const originalWarn = console.warn;
    const originalLog = console.log;
    console.warn = () => {};
    console.log = () => {};
    
    try {
      embeddingPipeline = await pipeline(
        'feature-extraction',
        'Xenova/all-MiniLM-L6-v2'
      );
    } finally {
      // Restore console methods
      console.warn = originalWarn;
      console.log = originalLog;
    }
    
    console.log('✅ Local embedding model loaded successfully');
    return embeddingPipeline;
  } catch (error) {
    console.error('❌ Failed to load local embedding model:', error);
    return null;
  }
}

/**
 * Generate embedding using local transformer model
 * Returns 384-dimensional vector using MiniLM-L6-v2
 */
export async function generateEmbedding(
  text: string,
  model: string = 'Xenova/all-MiniLM-L6-v2'
): Promise<number[] | null> {
  const pipe = await getPipeline();
  if (!pipe) return null;
  
  try {
    // Generate embedding with mean pooling and normalization
    const result = await pipe(text, {
      pooling: 'mean',
      normalize: true,
    });
    
    // Extract the embedding array from the result
    const embedding = Array.from(result.data) as number[];
    
    return embedding;
  } catch (error) {
    console.error('Error generating local embedding:', error);
    return null;
  }
}

/**
 * Generate semantic features for multiple incidents using local model in batch
 * WITH CACHING: Only generates embeddings for incidents that don't have them
 */
export async function generateIncidentEmbeddings(
  incidents: NormalizedIncident[],
  model: string = 'Xenova/all-MiniLM-L6-v2',
  cachedEmbeddings?: Map<string, number[]>
): Promise<Map<string, number[]>> {
  const embeddings = cachedEmbeddings || new Map<string, number[]>();
  
  const pipe = await getPipeline();
  if (!pipe) {
    console.warn('Local embedding model not available. Falling back to rule-based clustering.');
    return embeddings;
  }
  
  // Filter out incidents that already have cached embeddings
  const incidentsToProcess = incidents.filter(inc => !embeddings.has(inc.id));
  
  if (incidentsToProcess.length === 0) {
    console.log('✅ All incidents already have cached embeddings. API calls saved: ' + incidents.length);
    return embeddings;
  }
  
  console.log(`🤖 Generating local embeddings for ${incidentsToProcess.length}/${incidents.length} new incidents...`);
  console.log(`💰 Embeddings saved by cache: ${incidents.length - incidentsToProcess.length}`);
  
  try {
    // Process incidents one by one
    for (let i = 0; i < incidentsToProcess.length; i++) {
      const incident = incidentsToProcess[i];
      const text = `Service: ${incident.service}\nCategory: ${incident.category}\nPriority: ${incident.priority}\nSummary: ${incident.summary}`;
      
      const embedding = await generateEmbedding(text, model);
      
      if (embedding) {
        embeddings.set(incident.id, embedding);
      }
      
      if ((i + 1) % 10 === 0) {
        console.log(`Processed ${i + 1}/${incidentsToProcess.length} new incidents`);
      }
    }
    
    console.log(`✅ Local embedding generation complete: ${embeddings.size} total (${incidentsToProcess.length} new, 384-dimensional vectors)`);
  } catch (error) {
    console.error('Error generating batch embeddings with local model:', error);
  }
  
  return embeddings;
}

/**
 * Compute cosine similarity between two feature vectors
 */
export function embeddingCosineSimilarity(
  embeddingA: number[],
  embeddingB: number[]
): number {
  if (embeddingA.length !== embeddingB.length) {
    throw new Error('Feature vectors must have the same dimension');
  }
  
  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;
  
  for (let i = 0; i < embeddingA.length; i++) {
    dotProduct += embeddingA[i] * embeddingB[i];
    magnitudeA += embeddingA[i] * embeddingA[i];
    magnitudeB += embeddingB[i] * embeddingB[i];
  }
  
  magnitudeA = Math.sqrt(magnitudeA);
  magnitudeB = Math.sqrt(magnitudeB);
  
  if (magnitudeA === 0 || magnitudeB === 0) return 0;
  
  return dotProduct / (magnitudeA * magnitudeB);
}

/**
 * Check if local embeddings are available
 */
export function isEmbeddingsAvailable(): boolean {
  return true; // Local model is always available (no API key required)
}

/**
 * Load cached embeddings from database
 */
export async function loadCachedEmbeddings(
  incidentIds: string[],
  supabase: any
): Promise<Map<string, number[]>> {
  const embeddings = new Map<string, number[]>();
  
  if (incidentIds.length === 0) {
    console.log('⚠️  No incident IDs provided for loading embeddings');
    return embeddings;
  }
  
  try {
    console.log(`🔍 Attempting to load cached embeddings for ${incidentIds.length} incidents...`);
    console.log(`   Sample IDs: ${incidentIds.slice(0, 3).join(', ')}`);
    
    const { data, error } = await supabase
      .from('incident_embeddings')
      .select('incident_id, embedding')
      .in('incident_id', incidentIds);
    
    if (error) {
      console.error('❌ Failed to load cached embeddings:', error.message);
      console.error('   Error details:', JSON.stringify(error, null, 2));
      return embeddings;
    }
    
    if (data) {
      for (const row of data) {
        embeddings.set(row.incident_id, row.embedding);
      }
      console.log(`📦 Loaded ${embeddings.size}/${incidentIds.length} cached embeddings from database`);
      if (embeddings.size === 0 && incidentIds.length > 0) {
        console.log('   ℹ️  No cached embeddings found - will generate new ones');
      }
    } else {
      console.log('   ℹ️  Query returned no data');
    }
  } catch (error) {
    console.error('❌ Error loading cached embeddings:', error);
  }
  
  return embeddings;
}

/**
 * Save embeddings to database for future use
 */
export async function saveCachedEmbeddings(
  embeddings: Map<string, number[]>,
  supabase: any
): Promise<void> {
  if (embeddings.size === 0) {
    console.log('⚠️  No embeddings to save (map is empty)');
    return;
  }
  
  try {
    const records = Array.from(embeddings.entries()).map(([incident_id, embedding]) => ({
      incident_id,
      embedding,
      model: 'xenova-minilm-l6-v2',
      created_at: new Date().toISOString(),
    }));
    
    console.log(`💾 Attempting to save ${records.length} embeddings to database...`);
    console.log(`   Sample IDs: ${records.slice(0, 3).map(r => r.incident_id).join(', ')}`);
    console.log(`   Embedding dimension: ${records[0].embedding.length}`);
    console.log(`   Sample embedding (first 5 values): [${records[0].embedding.slice(0, 5).join(', ')}...]`);
    
    const { data, error } = await supabase
      .from('incident_embeddings')
      .upsert(records, { onConflict: 'incident_id' })
      .select();
    
    if (error) {
      console.error('❌ Failed to save embeddings to cache:', error.message);
      console.error('   Error code:', error.code);
      console.error('   Error details:', JSON.stringify(error, null, 2));
    } else {
      console.log(`✅ Successfully saved ${records.length} embeddings (384D vectors) to database cache`);
      console.log(`   Rows returned from database: ${data?.length || 0}`);
    }
  } catch (error: any) {
    console.error('❌ Exception saving embeddings to cache:', error);
    console.error('   Exception message:', error?.message);
    console.error('   Exception stack:', error?.stack);
  }
}
