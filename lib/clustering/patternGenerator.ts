import type { IncidentCluster, NormalizedIncident, Pattern } from './types';

/**
 * Count keyword frequencies across incidents in a cluster
 */
function countKeywords(incidents: NormalizedIncident[]): Map<string, number> {
  const freq = new Map<string, number>();
  
  for (const incident of incidents) {
    for (const keyword of incident.keywords) {
      // Clean keyword by removing brackets and quotes, then normalize
      const cleaned = String(keyword).replace(/[\[\]"']/g, '').trim();
      if (cleaned) {
        const normalized = cleaned.toLowerCase();
        freq.set(normalized, (freq.get(normalized) || 0) + 1);
      }
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
  const priorities = incidents.map(i => i.priority);
  
  for (const incident of incidents) {
    services.set(incident.service, (services.get(incident.service) || 0) + 1);
    categories.set(incident.category, (categories.get(incident.category) || 0) + 1);
  }
  
  const topService = Array.from(services.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Unknown';
  const topCategory = Array.from(categories.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Unknown';
  const avgPriority = priorities.reduce((sum, p) => sum + p, 0) / priorities.length;
  
  // Select top 2-3 most meaningful keywords
  const meaningfulKeywords = topKeywords.slice(0, Math.min(3, maxKeywords));
  
  // Helper function to format category name
  const formatCategory = (cat: string) => {
    return cat
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  
  // Helper function to capitalize service name
  const formatService = (svc: string) => {
    return svc.charAt(0).toUpperCase() + svc.slice(1);
  };
  
  // Build descriptive title components
  const formattedCategory = formatCategory(topCategory);
  const formattedService = formatService(topService);
  
  // Determine severity prefix (text only, no emojis)
  let severityPrefix = '';
  if (avgPriority >= 4) {
    severityPrefix = 'Critical - ';
  } else if (avgPriority >= 3) {
    severityPrefix = 'High Priority - ';
  } else if (incidents.length >= 15) {
    severityPrefix = 'Recurring - ';
  }
  
  // Build natural language title
  let title = severityPrefix;
  
  // Handle multiple services
  if (services.size > 1) {
    title += `Cross-Service ${formattedCategory} Issues`;
  } else {
    title += `${formattedService} ${formattedCategory}`;
  }
  
  // Add keyword context if available - make it more contextual
  if (meaningfulKeywords.length > 0) {
    // Filter out generic keywords
    const specificKeywords = meaningfulKeywords.filter(kw => 
      !['issue', 'problem', 'service', 'help', 'please'].includes(kw.toLowerCase())
    );
    
    if (specificKeywords.length > 0) {
      // Clean keywords by removing brackets and quotes
      const cleanedKeywords = specificKeywords.map(kw => 
        String(kw).replace(/[\[\]"']/g, '').trim()
      ).filter(Boolean);
      
      if (cleanedKeywords.length > 0) {
        // Create natural phrases from keywords
        const keywordPhrase = cleanedKeywords.length === 1 
          ? cleanedKeywords[0]
          : cleanedKeywords.length === 2
            ? `${cleanedKeywords[0]} and ${cleanedKeywords[1]}`
            : cleanedKeywords.slice(0, 2).join(' & ');
        
        title += `: ${keywordPhrase.charAt(0).toUpperCase() + keywordPhrase.slice(1)}`;
      }
    }
  }
  
  return title;
}

/**
 * Generate a description for the pattern
 */
function generateDescription(incidents: NormalizedIncident[]): string {
  const count = incidents.length;
  const timeRange = getTimeRange(incidents);
  
  const services = new Set(incidents.map(i => i.service));
  const categories = new Set(incidents.map(i => i.category));
  const sources = new Set(incidents.map(i => i.source));
  const sentiments = incidents.map(i => i.sentimentAnalysis);
  
  // Calculate time metrics
  const startDate = timeRange.start.toISOString().split('T')[0];
  const endDate = timeRange.end.toISOString().split('T')[0];
  const durationDays = Math.ceil((timeRange.end.getTime() - timeRange.start.getTime()) / (1000 * 60 * 60 * 24));
  
  // Calculate priority distribution
  const priorities = incidents.map(i => i.priority);
  const avgPriority = (priorities.reduce((sum, p) => sum + p, 0) / priorities.length).toFixed(1);
  const criticalCount = priorities.filter(p => p >= 4).length;
  
  // Analyze sentiment
  const negativeSentiments = sentiments.filter(s => 
    s.toLowerCase().includes('negative') || 
    s.toLowerCase().includes('angry') || 
    s.toLowerCase().includes('frustrated')
  ).length;
  const sentimentRate = Math.round((negativeSentiments / count) * 100);
  
  // Build description as flowing paragraphs
  let desc = '';
  
  // First paragraph: Overview
  desc += `This pattern represents ${count} incident${count > 1 ? 's' : ''} `;
  
  if (durationDays === 0) {
    desc += `occurring on ${startDate}`;
  } else if (durationDays === 1) {
    desc += `occurring over one day from ${startDate} to ${endDate}`;
  } else {
    desc += `occurring over ${durationDays} days from ${startDate} to ${endDate}`;
  }
  
  // Service and category info
  if (services.size === 1) {
    desc += ` in the ${Array.from(services)[0]} service`;
  } else {
    desc += ` across ${services.size} services including ${Array.from(services).slice(0, 3).join(', ')}${services.size > 3 ? ' and others' : ''}`;
  }
  
  if (categories.size === 1) {
    desc += `, all categorized as ${Array.from(categories)[0]}`;
  } else {
    desc += `, spanning ${categories.size} different categories`;
  }
  desc += `. `;
  
  // Second paragraph: Impact and severity
  desc += `The average priority level is ${avgPriority} out of 5`;
  if (criticalCount > 0) {
    desc += `, with ${criticalCount} critical incident${criticalCount > 1 ? 's' : ''} requiring immediate attention`;
  }
  desc += `. `;
  
  // Sentiment information
  if (negativeSentiments > 0) {
    desc += `User sentiment analysis indicates that ${sentimentRate}% of reports contain negative feedback, suggesting significant user frustration. `;
  }
  
  // Source diversity
  if (sources.size > 1) {
    desc += `These issues have been reported across ${sources.size} different channels (${Array.from(sources).join(', ')}), indicating widespread visibility and impact. `;
  }
  
  // Third paragraph: Recommendations
  const recommendations = [];
  
  if (criticalCount >= count * 0.5) {
    recommendations.push('immediate attention is required due to the high proportion of critical incidents');
  }
  
  if (durationDays <= 1 && count >= 5) {
    recommendations.push('this appears to be an acute issue with rapid incident clustering that may suggest a new problem or recent deployment issue');
  } else if (durationDays >= 7) {
    recommendations.push('this is a chronic issue with a long-term pattern that likely indicates a systemic problem requiring architectural review');
  }
  
  if (services.size > 1) {
    recommendations.push('cross-service investigation is recommended to check for shared dependencies or infrastructure issues');
  }
  
  if (sentimentRate >= 50) {
    recommendations.push('proactive customer communication should be considered given the high level of negative sentiment');
  }
  
  if (recommendations.length > 0) {
    desc += `Based on the pattern characteristics, ${recommendations.join(', and ')}.`;
  }
  
  return desc;
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
