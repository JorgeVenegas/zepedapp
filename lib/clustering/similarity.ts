import type { NormalizedIncident, SimilarityWeights, IncidentCluster } from './types';
import { computeIDF, computeTFIDF } from './preprocessing';

/**
 * Jaccard similarity for keyword sets
 */
export function jaccardSimilarity(keywordsA: string[], keywordsB: string[]): number {
  const setA = new Set(keywordsA.map(k => k.toLowerCase()));
  const setB = new Set(keywordsB.map(k => k.toLowerCase()));
  
  const intersection = new Set([...setA].filter(x => setB.has(x)));
  const union = new Set([...setA, ...setB]);
  
  if (union.size === 0) return 0;
  return intersection.size / union.size;
}

/**
 * Exact match similarity (returns 1.0 or 0.0)
 */
export function exactMatch(valueA: string, valueB: string): number {
  return valueA.toLowerCase() === valueB.toLowerCase() ? 1.0 : 0.0;
}

/**
 * Temporal proximity with exponential decay
 */
export function temporalProximity(
  timeA: Date,
  timeB: Date,
  windowHours: number = 24
): number {
  const diffMs = Math.abs(timeA.getTime() - timeB.getTime());
  const diffHours = diffMs / (1000 * 60 * 60);
  
  if (diffHours > windowHours) return 0;
  
  // Exponential decay
  return Math.exp(-diffHours / windowHours);
}

/**
 * Cosine similarity between two TF-IDF vectors
 */
export function cosineSimilarity(
  vectorA: Map<string, number>,
  vectorB: Map<string, number>
): number {
  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;
  
  // Get all unique terms
  const allTerms = new Set([...vectorA.keys(), ...vectorB.keys()]);
  
  for (const term of allTerms) {
    const a = vectorA.get(term) || 0;
    const b = vectorB.get(term) || 0;
    
    dotProduct += a * b;
    magnitudeA += a * a;
    magnitudeB += b * b;
  }
  
  magnitudeA = Math.sqrt(magnitudeA);
  magnitudeB = Math.sqrt(magnitudeB);
  
  if (magnitudeA === 0 || magnitudeB === 0) return 0;
  
  return dotProduct / (magnitudeA * magnitudeB);
}

/**
 * Semantic similarity using TF-IDF and cosine similarity
 */
export function semanticSimilarity(
  incidentA: NormalizedIncident,
  incidentB: NormalizedIncident,
  idf: Map<string, number>
): number {
  const tfidfA = computeTFIDF(incidentA._summaryTokens, idf);
  const tfidfB = computeTFIDF(incidentB._summaryTokens, idf);
  
  return cosineSimilarity(tfidfA, tfidfB);
}

/**
 * Priority similarity (normalized distance)
 */
export function prioritySimilarity(
  priorityA: number,
  priorityB: number,
  maxPriority: number = 10
): number {
  const distance = Math.abs(priorityA - priorityB);
  return 1 - (distance / maxPriority);
}

/**
 * Compute overall similarity between two incidents
 */
export function computeSimilarity(
  incidentA: NormalizedIncident,
  incidentB: NormalizedIncident,
  weights: SimilarityWeights,
  options: {
    timeWindowHours: number;
    idf: Map<string, number>;
    maxPriority?: number;
  }
): number {
  // Keyword similarity
  const keywordSim = jaccardSimilarity(incidentA.keywords, incidentB.keywords);
  
  // Category and service similarity
  const categorySim = exactMatch(incidentA.category, incidentB.category);
  const serviceSim = exactMatch(incidentA.service, incidentB.service);
  const categoryServiceSim = (categorySim + serviceSim) / 2;
  
  // Temporal similarity
  const temporalSim = temporalProximity(
    incidentA._time,
    incidentB._time,
    options.timeWindowHours
  );
  
  // Semantic similarity
  const semanticSim = semanticSimilarity(incidentA, incidentB, options.idf);
  
  // Priority similarity
  const prioritySim = prioritySimilarity(
    incidentA.priority,
    incidentB.priority,
    options.maxPriority || 10
  );
  
  // Sentiment similarity
  const sentimentSim = exactMatch(
    incidentA.sentimentAnalysis,
    incidentB.sentimentAnalysis
  );
  
  // Weighted sum
  return (
    weights.keyword * keywordSim +
    weights.category * categoryServiceSim +
    weights.temporal * temporalSim +
    weights.semantic * semanticSim +
    weights.priority * prioritySim +
    weights.sentiment * sentimentSim
  );
}

/**
 * Compute similarity between an incident and a cluster
 */
export function computeClusterSimilarity(
  incident: NormalizedIncident,
  cluster: IncidentCluster,
  weights: SimilarityWeights,
  options: {
    timeWindowHours: number;
    idf: Map<string, number>;
    maxPriority?: number;
  }
): number {
  // Average similarity with all incidents in cluster
  const similarities = cluster.incidents.map(clusterIncident =>
    computeSimilarity(incident, clusterIncident, weights, options)
  );
  
  return similarities.reduce((sum, sim) => sum + sim, 0) / similarities.length;
}
