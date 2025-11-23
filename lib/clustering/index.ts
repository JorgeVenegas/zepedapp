import type {
  Incident,
  Pattern,
  ClusteringOptions,
  IncidentCluster,
  NormalizedIncident,
  SimilarityWeights,
} from './types';
import { DEFAULT_OPTIONS, DEFAULT_WEIGHTS } from './types';
import { preprocessIncidents, computeIDF } from './preprocessing';
import { computeClusterSimilarity, temporalProximity, computeSimilarity } from './similarity';
import { generatePattern } from './patternGenerator';
import { generateIncidentEmbeddings, embeddingCosineSimilarity, isEmbeddingsAvailable } from './embeddings';
import { translateIncidents, isTranslationAvailable } from './translation';

/**
 * IMPROVED: DBSCAN-inspired clustering with better grouping
 * Uses density-based approach instead of simple incremental clustering
 */
async function dbscanClustering(
  incidents: NormalizedIncident[],
  options: Required<ClusteringOptions>,
  embeddings?: Map<string, number[]>
): Promise<IncidentCluster[]> {
  console.log('\n--- DBSCAN-Inspired Clustering ---');
  const clusters: IncidentCluster[] = [];
  const visited = new Set<string>();
  const clustered = new Set<string>();
  
  // Compute IDF for semantic similarity
  const allTokens = incidents.map(i => i._summaryTokens);
  const idf = computeIDF(allTokens);
  console.log('IDF computed for', Object.keys(idf).length, 'unique tokens');
  
  const useAI = embeddings && embeddings.size > 0;
  console.log('AI embeddings:', useAI ? `Using ${embeddings.size} AI feature vectors` : 'Not available');
  
  const weights: SimilarityWeights = { ...DEFAULT_WEIGHTS, ...options.weights };
  
  // Sort incidents by time for better temporal grouping
  const sortedIncidents = [...incidents].sort(
    (a, b) => a._time.getTime() - b._time.getTime()
  );
  
  console.log('Processing', sortedIncidents.length, 'incidents with DBSCAN approach...');
  console.log('Time range:', {
    first: sortedIncidents[0]?._time.toISOString(),
    last: sortedIncidents[sortedIncidents.length - 1]?._time.toISOString(),
  });
  
  /**
   * Find all neighbors of an incident within similarity threshold
   */
  function findNeighbors(incident: NormalizedIncident): NormalizedIncident[] {
    const neighbors: NormalizedIncident[] = [];
    
    for (const other of sortedIncidents) {
      if (other.id === incident.id) continue;
      
      // Check temporal constraint first (fast)
      const timeDiff = Math.abs(incident._time.getTime() - other._time.getTime());
      const timeDiffHours = timeDiff / (1000 * 60 * 60);
      if (timeDiffHours > options.timeWindowHours) continue;
      
      // Compute full similarity
      let similarity = computeSimilarity(incident, other, weights, {
        timeWindowHours: options.timeWindowHours,
        idf,
      });
      
      // Boost similarity with AI embeddings if available
      if (useAI && embeddings) {
        const embA = embeddings.get(incident.id);
        const embB = embeddings.get(other.id);
        if (embA && embB) {
          const aiSimilarity = embeddingCosineSimilarity(embA, embB);
          // Weighted combination: 60% AI, 40% traditional
          similarity = (0.6 * aiSimilarity) + (0.4 * similarity);
        }
      }
      
      if (similarity >= options.similarityThreshold) {
        neighbors.push(other);
      }
    }
    
    return neighbors;
  }
  
  /**
   * Expand cluster from a core incident
   */
  function expandCluster(
    incident: NormalizedIncident,
    neighbors: NormalizedIncident[],
    cluster: IncidentCluster
  ): void {
    cluster.incidents.push(incident);
    clustered.add(incident.id);
    
    // Process neighbors
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor.id)) {
        visited.add(neighbor.id);
        
        // Find neighbors of neighbor
        const neighborNeighbors = findNeighbors(neighbor);
        
        // If it's also a core point, add its neighbors
        if (neighborNeighbors.length >= options.minClusterSize - 1) {
          neighbors.push(...neighborNeighbors.filter(n => 
            !neighbors.some(existing => existing.id === n.id)
          ));
        }
      }
      
      // Add to cluster if not already in one
      if (!clustered.has(neighbor.id)) {
        cluster.incidents.push(neighbor);
        clustered.add(neighbor.id);
      }
    }
  }
  
  // Main DBSCAN loop
  let corePoints = 0;
  let noisePoints = 0;
  
  for (const incident of sortedIncidents) {
    if (visited.has(incident.id)) continue;
    
    visited.add(incident.id);
    const neighbors = findNeighbors(incident);
    
    if (neighbors.length >= options.minClusterSize - 1) {
      // Core point - start new cluster
      corePoints++;
      const newCluster: IncidentCluster = { incidents: [] };
      expandCluster(incident, neighbors, newCluster);
      clusters.push(newCluster);
    } else {
      // Noise/border point
      noisePoints++;
      // Still create single-incident cluster if minClusterSize allows
      if (options.minClusterSize === 1) {
        clusters.push({ incidents: [incident] });
        clustered.add(incident.id);
      }
    }
  }
  
  console.log('\nDBSCAN Clustering summary:');
  console.log('  Core points:', corePoints);
  console.log('  Noise points:', noisePoints);
  console.log('  Clusters created:', clusters.length);
  console.log('  Cluster sizes:', clusters.map(c => c.incidents.length));
  
  return clusters;
}

/**
 * Main clustering function
 * Takes incidents and returns patterns
 */
export async function clusterIncidents(
  incidents: Incident[],
  options: ClusteringOptions = {}
): Promise<Pattern[]> {
  console.log('\n=== CLUSTER INCIDENTS START ===');
  console.log('Input incidents:', incidents.length);
  
  if (incidents.length === 0) {
    console.log('No incidents to cluster');
    return [];
  }
  
  // Merge options with defaults
  const fullOptions: Required<Omit<ClusteringOptions, 'cachedEmbeddings' | 'cachedTranslations'>> & Pick<ClusteringOptions, 'cachedEmbeddings' | 'cachedTranslations'> = {
    ...DEFAULT_OPTIONS,
    ...options,
    weights: { ...DEFAULT_WEIGHTS, ...options.weights },
  };
  
  console.log('Clustering options:', {
    similarityThreshold: fullOptions.similarityThreshold,
    timeWindowHours: fullOptions.timeWindowHours,
    minClusterSize: fullOptions.minClusterSize,
    useEmbeddings: fullOptions.useEmbeddings,
    weights: fullOptions.weights,
  });
  
  // Preprocess incidents
  console.log('Preprocessing incidents...');
  const normalized = preprocessIncidents(incidents);
  console.log('Normalized incidents:', normalized.length);
  
  // Translate Spanish incidents to English if translation is available and not skipped
  let translations: Map<string, { summary: string; keywords: string[] }> | undefined;
  if (!fullOptions.skipTranslation && isTranslationAvailable()) {
    console.log('🌐 Checking for Spanish incidents to translate...');
    console.log(`📦 Cached translations available: ${fullOptions.cachedTranslations?.size || 0}`);
    translations = await translateIncidents(normalized, fullOptions.cachedTranslations);
    
    // Update the options with new translations for caching
    fullOptions.cachedTranslations = translations;
    
    // Apply translations to normalized incidents
    if (translations.size > 0) {
      for (const incident of normalized) {
        const translation = translations.get(incident.id);
        if (translation) {
          incident.summary = translation.summary;
          incident.keywords = translation.keywords;
          // Re-tokenize with translated text
          incident._normalizedSummary = translation.summary.toLowerCase();
          incident._summaryTokens = translation.summary.toLowerCase().split(' ').filter(t => t.length > 2);
        }
      }
      console.log(`✅ Applied ${translations.size} translations`);
    }
  } else if (fullOptions.skipTranslation) {
    console.log('⏭️  Translation skipped - incidents assumed to be in English');
  }
  
  // Generate AI embeddings if enabled and available
  let embeddings: Map<string, number[]> | undefined;
  if (fullOptions.useEmbeddings && isEmbeddingsAvailable()) {
    console.log('🤖 Generating AI-powered features with local transformer model...');
    // Use cached embeddings if provided
    embeddings = await generateIncidentEmbeddings(
      normalized, 
      fullOptions.embeddingModel,
      fullOptions.cachedEmbeddings
    );
    
    // Update the options with new embeddings for caching
    if (embeddings) {
      fullOptions.cachedEmbeddings = embeddings;
    }
    
    if (embeddings && embeddings.size > 0) {
      console.log(`✅ AI features ready for ${embeddings.size} incidents`);
    } else {
      console.log('⚠️  AI feature generation failed, falling back to rule-based');
    }
  }
  
  // Cluster incidents using improved DBSCAN approach
  console.log('Running DBSCAN clustering...');
  const clusters = await dbscanClustering(normalized, fullOptions, embeddings);
  console.log('Clusters created:', clusters.length);
  console.log('Cluster sizes:', clusters.map(c => c.incidents.length));
  
  // Generate patterns from clusters
  console.log('Generating patterns from clusters...');
  const patterns = clusters.map(cluster =>
    generatePattern(cluster, {
      maxKeywordsInTitle: fullOptions.maxKeywordsInTitle,
      useLLMForDescription: fullOptions.useLLMForDescription,
    })
  );
  console.log('Patterns generated:', patterns.length);
  
  // Sort patterns by priority (descending) and frequency (descending)
  patterns.sort((a, b) => {
    if (b.priority !== a.priority) {
      return b.priority - a.priority;
    }
    return b.frequency - a.frequency;
  });
  
  return patterns;
}

// Export all clustering functionality
export * from './types';
export * from './similarity';
export * from './preprocessing';
export * from './patternGenerator';
