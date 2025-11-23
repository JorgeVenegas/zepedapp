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
import { computeClusterSimilarity, temporalProximity } from './similarity';
import { generatePattern } from './patternGenerator';

/**
 * Incremental clustering algorithm
 * Processes incidents chronologically and assigns each to an existing cluster or creates a new one
 */
function incrementalClustering(
  incidents: NormalizedIncident[],
  options: Required<ClusteringOptions>
): IncidentCluster[] {
  const clusters: IncidentCluster[] = [];
  
  // Compute IDF for semantic similarity
  const allTokens = incidents.map(i => i._summaryTokens);
  const idf = computeIDF(allTokens);
  
  const weights: SimilarityWeights = { ...DEFAULT_WEIGHTS, ...options.weights };
  
  // Sort incidents by time
  const sortedIncidents = [...incidents].sort(
    (a, b) => a._time.getTime() - b._time.getTime()
  );
  
  for (const incident of sortedIncidents) {
    // Find candidate clusters within time window
    const candidates = clusters.filter(cluster => {
      const latestTime = Math.max(
        ...cluster.incidents.map(i => i._time.getTime())
      );
      const timeDiff = incident._time.getTime() - latestTime;
      const timeDiffHours = timeDiff / (1000 * 60 * 60);
      
      return timeDiffHours <= options.timeWindowHours && timeDiffHours >= 0;
    });
    
    if (candidates.length === 0) {
      // Create new cluster
      clusters.push({
        incidents: [incident],
      });
      continue;
    }
    
    // Compute similarity with each candidate cluster
    const similarities = candidates.map(cluster => ({
      cluster,
      similarity: computeClusterSimilarity(incident, cluster, weights, {
        timeWindowHours: options.timeWindowHours,
        idf,
      }),
    }));
    
    // Find best match
    const bestMatch = similarities.reduce((best, current) =>
      current.similarity > best.similarity ? current : best
    );
    
    if (bestMatch.similarity >= options.similarityThreshold) {
      // Add to existing cluster
      bestMatch.cluster.incidents.push(incident);
    } else {
      // Create new cluster
      clusters.push({
        incidents: [incident],
      });
    }
  }
  
  // Filter clusters by minimum size
  return clusters.filter(
    cluster => cluster.incidents.length >= options.minClusterSize
  );
}

/**
 * Main clustering function
 * Takes incidents and returns patterns
 */
export function clusterIncidents(
  incidents: Incident[],
  options: ClusteringOptions = {}
): Pattern[] {
  if (incidents.length === 0) {
    return [];
  }
  
  // Merge options with defaults
  const fullOptions: Required<ClusteringOptions> = {
    ...DEFAULT_OPTIONS,
    ...options,
    weights: { ...DEFAULT_WEIGHTS, ...options.weights },
  };
  
  // Preprocess incidents
  const normalized = preprocessIncidents(incidents);
  
  // Cluster incidents
  const clusters = incrementalClustering(normalized, fullOptions);
  
  // Generate patterns from clusters
  const patterns = clusters.map(cluster =>
    generatePattern(cluster, {
      maxKeywordsInTitle: fullOptions.maxKeywordsInTitle,
      useLLMForDescription: fullOptions.useLLMForDescription,
    })
  );
  
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
