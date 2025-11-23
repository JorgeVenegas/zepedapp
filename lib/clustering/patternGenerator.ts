import type { IncidentCluster, NormalizedIncident, Pattern } from './types';

/**
 * Count keyword frequencies across incidents in a cluster
 */
function countKeywords(incidents: NormalizedIncident[]): Map<string, number> {
  const freq = new Map<string, number>();
  
  for (const incident of incidents) {
    for (const keyword of incident.keywords) {
      const normalized = keyword.toLowerCase();
      freq.set(normalized, (freq.get(normalized) || 0) + 1);
    }
  }
  
  return freq;
}

/**
 * Get top N keywords by frequency
 */
function getTopKeywords(freq: Map<string, number>, n: number): string[] {
  return Array.from(freq.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([keyword]) => keyword);
}

/**
 * Generate a title for the pattern
 */
function generateTitle(
  incidents: NormalizedIncident[],
  topKeywords: string[],
  maxKeywords: number = 5
): string {
  // Get most common service and category
  const services = new Map<string, number>();
  const categories = new Map<string, number>();
  
  for (const incident of incidents) {
    services.set(incident.service, (services.get(incident.service) || 0) + 1);
    categories.set(incident.category, (categories.get(incident.category) || 0) + 1);
  }
  
  const topService = Array.from(services.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Unknown';
  const topCategory = Array.from(categories.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Unknown';
  
  const keywordStr = topKeywords.slice(0, maxKeywords).join(', ');
  
  return `${topService} - ${topCategory}: ${keywordStr}`;
}

/**
 * Generate a description for the pattern
 */
function generateDescription(incidents: NormalizedIncident[]): string {
  const count = incidents.length;
  const timeRange = getTimeRange(incidents);
  
  const services = new Set(incidents.map(i => i.service));
  const categories = new Set(incidents.map(i => i.category));
  
  const startDate = timeRange.start.toISOString().split('T')[0];
  const endDate = timeRange.end.toISOString().split('T')[0];
  
  const serviceStr = services.size === 1 
    ? `in ${Array.from(services)[0]}` 
    : `across ${services.size} services`;
  
  const categoryStr = categories.size === 1
    ? `(${Array.from(categories)[0]})`
    : `(${categories.size} categories)`;
  
  return `${count} incident${count > 1 ? 's' : ''} reported between ${startDate} and ${endDate} ${serviceStr} ${categoryStr}. Common issues involve the identified keywords.`;
}

/**
 * Build filters JSON from incidents
 */
function buildFilters(incidents: NormalizedIncident[]): Record<string, any> {
  const services = new Set(incidents.map(i => i.service));
  const categories = new Set(incidents.map(i => i.category));
  const sources = new Set(incidents.map(i => i.source));
  const sentiments = new Set(incidents.map(i => i.sentimentAnalysis));
  
  const allKeywords = new Set<string>();
  for (const incident of incidents) {
    for (const keyword of incident.keywords) {
      allKeywords.add(keyword.toLowerCase());
    }
  }
  
  const priorities = incidents.map(i => i.priority);
  const minPriority = Math.min(...priorities);
  const maxPriority = Math.max(...priorities);
  
  const timeRange = getTimeRange(incidents);
  
  return {
    services: Array.from(services),
    categories: Array.from(categories),
    sources: Array.from(sources),
    keywords: Array.from(allKeywords).slice(0, 20), // Limit to top 20
    priority_range: {
      min: minPriority,
      max: maxPriority,
    },
    sentiments: Array.from(sentiments),
    time_range: {
      start: timeRange.start.toISOString(),
      end: timeRange.end.toISOString(),
    },
  };
}

/**
 * Get time range from incidents
 */
function getTimeRange(incidents: NormalizedIncident[]): { start: Date; end: Date } {
  const times = incidents.map(i => i._time.getTime());
  return {
    start: new Date(Math.min(...times)),
    end: new Date(Math.max(...times)),
  };
}

/**
 * Compute weighted priority (more recent incidents have higher weight)
 */
function computeWeightedPriority(incidents: NormalizedIncident[]): number {
  if (incidents.length === 0) return 0;
  
  // Sort by time (most recent first)
  const sorted = [...incidents].sort((a, b) => b._time.getTime() - a._time.getTime());
  
  let weightedSum = 0;
  let totalWeight = 0;
  
  // Exponential decay: more recent = higher weight
  for (let i = 0; i < sorted.length; i++) {
    const weight = Math.exp(-i / sorted.length);
    weightedSum += sorted[i].priority * weight;
    totalWeight += weight;
  }
  
  return Math.round(weightedSum / totalWeight);
}

/**
 * Generate a Pattern from a cluster of incidents
 */
export function generatePattern(
  cluster: IncidentCluster,
  options: {
    maxKeywordsInTitle?: number;
    useLLMForDescription?: boolean;
  } = {}
): Pattern {
  const incidents = cluster.incidents;
  
  if (incidents.length === 0) {
    throw new Error('Cannot generate pattern from empty cluster');
  }
  
  // Count keywords and get top ones
  const keywordFreq = countKeywords(incidents);
  const topKeywords = getTopKeywords(keywordFreq, options.maxKeywordsInTitle || 5);
  
  // Generate title
  const title = generateTitle(incidents, topKeywords, options.maxKeywordsInTitle);
  
  // Generate description
  const description = options.useLLMForDescription
    ? generateDescription(incidents) // Placeholder for LLM integration
    : generateDescription(incidents);
  
  // Build filters
  const filters = buildFilters(incidents);
  
  // Compute priority
  const priority = computeWeightedPriority(incidents);
  
  // Get time range
  const timeRange = getTimeRange(incidents);
  
  return {
    title,
    description,
    filters,
    priority,
    frequency: incidents.length,
    incidentIds: incidents.map(i => i.id),
    timeRangeStart: timeRange.start.toISOString(),
    timeRangeEnd: timeRange.end.toISOString(),
  };
}
