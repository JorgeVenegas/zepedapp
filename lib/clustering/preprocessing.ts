import type { Incident, NormalizedIncident } from './types';

const STOPWORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from',
  'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the',
  'to', 'was', 'will', 'with', 'this', 'but', 'they', 'have', 'had',
  'what', 'when', 'where', 'who', 'which', 'why', 'how',
]);

/**
 * Normalize text: lowercase, remove punctuation, remove stopwords
 */
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Tokenize text and remove stopwords
 */
export function tokenize(text: string): string[] {
  const normalized = normalizeText(text);
  return normalized
    .split(' ')
    .filter(token => token.length > 2 && !STOPWORDS.has(token));
}

/**
 * Compute TF (Term Frequency) for a document
 */
export function computeTF(tokens: string[]): Map<string, number> {
  const tf = new Map<string, number>();
  const totalTokens = tokens.length;
  
  for (const token of tokens) {
    tf.set(token, (tf.get(token) || 0) + 1);
  }
  
  // Normalize by document length
  for (const [token, count] of tf.entries()) {
    tf.set(token, count / totalTokens);
  }
  
  return tf;
}

/**
 * Compute IDF (Inverse Document Frequency) for a corpus
 */
export function computeIDF(documents: string[][]): Map<string, number> {
  const idf = new Map<string, number>();
  const numDocs = documents.length;
  
  // Count documents containing each term
  const docCounts = new Map<string, number>();
  for (const doc of documents) {
    const uniqueTerms = new Set(doc);
    for (const term of uniqueTerms) {
      docCounts.set(term, (docCounts.get(term) || 0) + 1);
    }
  }
  
  // Compute IDF
  for (const [term, count] of docCounts.entries()) {
    idf.set(term, Math.log(numDocs / count));
  }
  
  return idf;
}

/**
 * Compute TF-IDF vector for a document
 */
export function computeTFIDF(
  tokens: string[],
  idf: Map<string, number>
): Map<string, number> {
  const tf = computeTF(tokens);
  const tfidf = new Map<string, number>();
  
  for (const [token, tfValue] of tf.entries()) {
    const idfValue = idf.get(token) || 0;
    tfidf.set(token, tfValue * idfValue);
  }
  
  return tfidf;
}

/**
 * Preprocess a single incident
 */
export function preprocessIncident(incident: Incident): NormalizedIncident {
  const time = incident.time instanceof Date 
    ? incident.time 
    : new Date(incident.time);
  
  const normalizedSummary = normalizeText(incident.summary);
  const summaryTokens = tokenize(incident.summary);
  
  return {
    ...incident,
    _time: time,
    _normalizedSummary: normalizedSummary,
    _summaryTokens: summaryTokens,
  };
}

/**
 * Preprocess all incidents
 */
export function preprocessIncidents(incidents: Incident[]): NormalizedIncident[] {
  return incidents.map(preprocessIncident);
}

/**
 * Extract all unique keywords from incidents
 */
export function extractAllKeywords(incidents: NormalizedIncident[]): Set<string> {
  const allKeywords = new Set<string>();
  for (const incident of incidents) {
    for (const keyword of incident.keywords) {
      allKeywords.add(keyword.toLowerCase());
    }
  }
  return allKeywords;
}
