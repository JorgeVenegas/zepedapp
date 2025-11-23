// Core data types
export interface Incident {
  id: string;
  time: Date | string;
  service: string;
  source: string;
  subservice: string;
  priority: number;
  category: string;
  sentimentAnalysis: string;
  summary: string;
  original: string;
  keywords: string[];
}

export interface Pattern {
  title: string;
  description: string;
  filters: Record<string, any>;
  priority: number;
  frequency: number;
  timeRangeStart?: string | null;
  timeRangeEnd?: string | null;
  incidentIds?: string[];
}

// Configuration
export interface SimilarityWeights {
  keyword: number;
  category: number;
  temporal: number;
  semantic: number;
  priority: number;
  sentiment: number;
}

export interface ClusteringOptions {
  weights?: Partial<SimilarityWeights>;
  similarityThreshold?: number;
  timeWindowHours?: number;
  minClusterSize?: number;
  useEmbeddings?: boolean;
  embeddingModel?: string;
  maxKeywordsInTitle?: number;
  useLLMForDescription?: boolean;
  cachedEmbeddings?: Map<string, number[]>;
  cachedTranslations?: Map<string, { summary: string; keywords: string[] }>;
}

// Internal types
export interface NormalizedIncident extends Incident {
  _time: Date;
  _normalizedSummary: string;
  _summaryTokens: string[];
}

export interface IncidentCluster {
  incidents: NormalizedIncident[];
  centroid?: {
    time: Date;
    keywords: Set<string>;
    priority: number;
  };
}

export const DEFAULT_WEIGHTS: SimilarityWeights = {
  keyword: 0.30,
  category: 0.25,
  temporal: 0.20,
  semantic: 0.15,
  priority: 0.05,
  sentiment: 0.05,
};

export const DEFAULT_OPTIONS: Required<Omit<ClusteringOptions, 'cachedEmbeddings' | 'cachedTranslations'>> = {
  weights: DEFAULT_WEIGHTS,
  similarityThreshold: 0.65,
  timeWindowHours: 24,
  minClusterSize: 1,
  useEmbeddings: true,
  embeddingModel: 'Xenova/all-MiniLM-L6-v2',
  maxKeywordsInTitle: 5,
  useLLMForDescription: false,
};
