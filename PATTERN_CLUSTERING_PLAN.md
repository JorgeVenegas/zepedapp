# Pattern Clustering Algorithm - Implementation Plan

## Overview
Transform individual Incidents into Patterns by clustering similar incidents based on multiple dimensions: temporal proximity, semantic similarity, service/category matching, and keyword overlap.

---

## 1. Data Structures

### Input: Incident Schema
```typescript
interface Incident {
  id: string;
  time: Date;
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
```

### Output: Pattern Schema
```typescript
interface Pattern {
  title: string;
  description: string;
  filters: JSON;  // aggregated filter criteria
  priority: number;  // computed from incident priorities
  frequency: number;  // count of incidents in pattern
  // Internal tracking (optional)
  incidentIds?: string[];
  timeRange?: { start: Date; end: Date };
}
```

---

## 2. Clustering Strategy

### Multi-Dimensional Similarity Approach

The algorithm will use **hierarchical agglomerative clustering** with a custom similarity metric that weighs multiple dimensions:

#### **Similarity Dimensions & Weights**

1. **Keyword Overlap** (Weight: 0.30)
   - Jaccard similarity on keyword arrays
   - Formula: `|keywords_A ∩ keywords_B| / |keywords_A ∪ keywords_B|`

2. **Category & Service Match** (Weight: 0.25)
   - Exact match on `category` (1.0 or 0.0)
   - Exact match on `service` (1.0 or 0.0)
   - Optional: Fuzzy match on `subservice`

3. **Temporal Proximity** (Weight: 0.20)
   - Incidents within a configurable time window (e.g., 24 hours)
   - Decay function: `exp(-time_diff / time_window)`
   - Cluster incidents that occur close in time

4. **Semantic Similarity** (Weight: 0.15)
   - Compare `summary` text using:
     - TF-IDF + cosine similarity (lightweight)
     - OR embeddings (e.g., OpenAI, local models) for better accuracy
   - Threshold: 0.6+ similarity

5. **Priority Alignment** (Weight: 0.05)
   - Normalized distance: `1 - |priority_A - priority_B| / max_priority`
   - Groups incidents with similar urgency

6. **Sentiment Match** (Weight: 0.05)
   - Exact match bonus (positive/negative/neutral alignment)

#### **Overall Similarity Formula**
```
similarity(A, B) = 
  0.30 * keyword_sim(A, B) +
  0.25 * category_service_sim(A, B) +
  0.20 * temporal_sim(A, B) +
  0.15 * semantic_sim(A, B) +
  0.05 * priority_sim(A, B) +
  0.05 * sentiment_sim(A, B)
```

**Clustering Threshold**: 0.65 (adjustable)

---

## 3. Algorithm Steps

### Phase 1: Preprocessing

1. **Normalize Text**
   - Lowercase all text fields
   - Remove stopwords from summaries
   - Tokenize keywords

2. **Build Feature Vectors**
   - Extract TF-IDF vectors from summaries
   - Create one-hot encodings for categorical fields
   - Normalize priority scores to [0, 1]

3. **Sort by Time**
   - Order incidents chronologically for efficient temporal clustering

### Phase 2: Clustering

#### Option A: **Incremental Clustering** (Recommended for streaming data)

```
Initialize empty clusters []

For each incident I in chronological order:
  candidates = clusters where time_diff(I, cluster) < time_window
  
  If candidates is empty:
    Create new cluster with I
  Else:
    scores = [similarity(I, cluster) for cluster in candidates]
    best_cluster = cluster with max(scores)
    
    If max(scores) >= threshold:
      Add I to best_cluster
    Else:
      Create new cluster with I
```

#### Option B: **Hierarchical Agglomerative Clustering** (Batch processing)

```
1. Start with each incident as its own cluster
2. Compute pairwise similarity matrix
3. Repeat until no merge candidates:
   - Find pair with highest similarity > threshold
   - Merge clusters
   - Update similarity matrix
4. Return final clusters
```

### Phase 3: Pattern Generation

For each cluster:

1. **Generate Title**
   - Extract most frequent keywords (top 3-5)
   - Format: `"{Service} - {Category}: {Keywords}"`
   - Example: `"API Service - Error: timeout, database, connection"`

2. **Generate Description**
   - Summarize incident summaries:
     - Option 1: Template-based (most common phrases)
     - Option 2: LLM-generated summary from all summaries
   - Include frequency and time range
   - Example: `"15 incidents reported between 2025-11-20 and 2025-11-22 involving timeout errors in the API service, primarily affecting database connections."`

3. **Build Filters JSON**
   ```json
   {
     "service": ["api-service"],
     "category": ["error"],
     "keywords": ["timeout", "database", "connection"],
     "priority_range": [3, 5],
     "sentiment": ["negative"],
     "time_range": {
       "start": "2025-11-20T10:00:00Z",
       "end": "2025-11-22T15:30:00Z"
     }
   }
   ```

4. **Compute Priority**
   - **Weighted average**: `sum(priority * recency_weight) / sum(recency_weight)`
   - More recent incidents have higher weight
   - OR take max priority if patterns represent critical issues

5. **Set Frequency**
   - Count of incidents in cluster

---

## 4. Implementation Architecture

### File Structure
```
lib/
  clustering/
    index.ts                 # Main clustering function
    similarity.ts            # Similarity metrics
    preprocessing.ts         # Text normalization, feature extraction
    patternGenerator.ts      # Convert clusters to Pattern objects
    types.ts                 # TypeScript interfaces
```

### Core Functions

#### `lib/clustering/similarity.ts`
```typescript
export function computeSimilarity(
  incidentA: Incident,
  incidentB: Incident,
  weights: SimilarityWeights
): number {
  // Compute each dimension
  const keywordSim = jaccardSimilarity(incidentA.keywords, incidentB.keywords);
  const categorySim = exactMatch(incidentA.category, incidentB.category);
  const serviceSim = exactMatch(incidentA.service, incidentB.service);
  const temporalSim = temporalProximity(incidentA.time, incidentB.time);
  const semanticSim = cosineSimilarity(incidentA.summary, incidentB.summary);
  const prioritySim = normalizedDistance(incidentA.priority, incidentB.priority);
  const sentimentSim = exactMatch(incidentA.sentimentAnalysis, incidentB.sentimentAnalysis);
  
  return (
    weights.keyword * keywordSim +
    weights.category * (categorySim + serviceSim) / 2 +
    weights.temporal * temporalSim +
    weights.semantic * semanticSim +
    weights.priority * prioritySim +
    weights.sentiment * sentimentSim
  );
}
```

#### `lib/clustering/index.ts`
```typescript
export function clusterIncidents(
  incidents: Incident[],
  options?: ClusteringOptions
): Pattern[] {
  // 1. Preprocess
  const normalized = preprocessIncidents(incidents);
  
  // 2. Cluster
  const clusters = incrementalClustering(normalized, options);
  
  // 3. Generate patterns
  const patterns = clusters.map(cluster => generatePattern(cluster));
  
  return patterns;
}
```

#### `lib/clustering/patternGenerator.ts`
```typescript
export function generatePattern(cluster: IncidentCluster): Pattern {
  const incidents = cluster.incidents;
  
  // Extract common keywords
  const keywordFreq = countKeywords(incidents);
  const topKeywords = getTopN(keywordFreq, 5);
  
  // Generate title
  const title = generateTitle(incidents, topKeywords);
  
  // Generate description (could call LLM here)
  const description = generateDescription(incidents);
  
  // Build filters
  const filters = buildFilters(incidents);
  
  // Compute priority (weighted by recency)
  const priority = computeWeightedPriority(incidents);
  
  return {
    title,
    description,
    filters,
    priority,
    frequency: incidents.length,
    incidentIds: incidents.map(i => i.id),
    timeRange: {
      start: min(incidents.map(i => i.time)),
      end: max(incidents.map(i => i.time))
    }
  };
}
```

---

## 5. Configuration Options

```typescript
interface ClusteringOptions {
  // Similarity weights
  weights?: {
    keyword?: number;
    category?: number;
    temporal?: number;
    semantic?: number;
    priority?: number;
    sentiment?: number;
  };
  
  // Thresholds
  similarityThreshold?: number;  // default: 0.65
  timeWindowHours?: number;      // default: 24
  minClusterSize?: number;       // default: 2
  
  // Semantic options
  useEmbeddings?: boolean;       // default: false (use TF-IDF)
  embeddingModel?: string;       // e.g., "text-embedding-3-small"
  
  // Pattern generation
  maxKeywordsInTitle?: number;   // default: 5
  useLLMForDescription?: boolean; // default: false
}
```

---

## 6. Advanced Features (Optional)

### A. Dynamic Re-clustering
- When new incidents arrive, re-evaluate existing patterns
- Split patterns that become too diverse
- Merge patterns that converge over time

### B. Pattern Decay
- Reduce pattern relevance if no new incidents match in X days
- Archive stale patterns

### C. Hierarchical Patterns
- Create "super-patterns" from related patterns
- Example: "Database Issues" parent pattern with children:
  - "Connection Timeouts"
  - "Query Performance"
  - "Replication Lag"

### D. Anomaly Detection
- Flag incidents that don't match any existing pattern (outliers)
- Could indicate new emerging issues

---

## 7. Testing Strategy

### Unit Tests
1. **Similarity Metrics**
   - Test Jaccard similarity with known keyword sets
   - Verify temporal decay function
   - Check cosine similarity on sample summaries

2. **Clustering Logic**
   - Test with synthetic incidents (known clusters)
   - Verify threshold behavior
   - Edge cases: single incident, identical incidents

3. **Pattern Generation**
   - Validate filter JSON structure
   - Check title/description formatting
   - Verify priority computation

### Integration Tests
1. Load sample incident data from database
2. Run clustering algorithm
3. Assert:
   - Reasonable number of patterns created
   - All incidents assigned to patterns
   - Patterns have valid structure

### Performance Benchmarks
- Measure clustering time for 100, 1000, 10000 incidents
- Monitor memory usage
- Optimize bottlenecks (likely semantic similarity)

---

## 8. Database Schema Extension

### New Table: `patterns`
```sql
CREATE TABLE patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  filters JSONB NOT NULL,
  priority INTEGER NOT NULL,
  frequency INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  time_range_start TIMESTAMPTZ,
  time_range_end TIMESTAMPTZ,
  incident_ids UUID[] -- array of incident IDs
);

CREATE INDEX idx_patterns_priority ON patterns(priority DESC);
CREATE INDEX idx_patterns_frequency ON patterns(frequency DESC);
CREATE INDEX idx_patterns_time_range ON patterns(time_range_start, time_range_end);
CREATE INDEX idx_patterns_filters ON patterns USING GIN(filters);
```

### Link Table: `incident_patterns` (many-to-many)
```sql
CREATE TABLE incident_patterns (
  incident_id UUID REFERENCES incidents(id) ON DELETE CASCADE,
  pattern_id UUID REFERENCES patterns(id) ON DELETE CASCADE,
  similarity_score FLOAT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (incident_id, pattern_id)
);
```

---

## 9. API Endpoints

### POST `/api/patterns/cluster`
**Purpose**: Trigger clustering on a set of incidents

**Request Body**:
```json
{
  "incident_ids": ["uuid1", "uuid2", ...],  // optional, defaults to all
  "options": {
    "similarityThreshold": 0.7,
    "timeWindowHours": 48
  }
}
```

**Response**:
```json
{
  "success": true,
  "patterns_created": 12,
  "patterns": [
    { "id": "pattern-uuid", "title": "...", "frequency": 5 },
    ...
  ]
}
```

### GET `/api/patterns`
**Purpose**: List all patterns with filtering

**Query Params**:
- `priority_min`, `priority_max`
- `frequency_min`
- `service`, `category`
- `start_date`, `end_date`

### GET `/api/patterns/:id`
**Purpose**: Get pattern details including linked incidents

---

## 10. Implementation Phases

### Phase 1: Core Clustering (Week 1)
- [ ] Implement similarity metrics
- [ ] Build incremental clustering algorithm
- [ ] Add TypeScript types
- [ ] Unit tests for similarity functions

### Phase 2: Pattern Generation (Week 1-2)
- [ ] Implement pattern generator
- [ ] Create filter JSON builder
- [ ] Add title/description generators
- [ ] Test with sample data

### Phase 3: Database Integration (Week 2)
- [ ] Create `patterns` table migration
- [ ] Add pattern save/update functions
- [ ] Build API endpoints
- [ ] Integration tests

### Phase 4: Optimization & LLM Integration (Week 3)
- [ ] Add TF-IDF vectorization for summaries
- [ ] Optional: Integrate embeddings API
- [ ] Optional: LLM-generated descriptions
- [ ] Performance tuning

### Phase 5: UI & Monitoring (Week 3-4)
- [ ] Pattern dashboard component
- [ ] Visualize incident-to-pattern relationships
- [ ] Real-time clustering triggers
- [ ] Admin controls for re-clustering

---

## 11. Example Usage

```typescript
import { clusterIncidents } from '@/lib/clustering';
import { createClient } from '@/lib/supabase/server';

// Fetch incidents
const supabase = await createClient();
const { data: incidents } = await supabase
  .from('incidents')
  .select('*')
  .gte('time', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) // last 7 days
  .order('time', { ascending: true });

// Cluster into patterns
const patterns = clusterIncidents(incidents, {
  similarityThreshold: 0.7,
  timeWindowHours: 24,
  weights: {
    keyword: 0.35,
    category: 0.25,
    temporal: 0.20,
    semantic: 0.15,
    priority: 0.03,
    sentiment: 0.02
  }
});

// Save patterns to database
for (const pattern of patterns) {
  await supabase.from('patterns').insert({
    title: pattern.title,
    description: pattern.description,
    filters: pattern.filters,
    priority: pattern.priority,
    frequency: pattern.frequency,
    time_range_start: pattern.timeRange?.start,
    time_range_end: pattern.timeRange?.end,
    incident_ids: pattern.incidentIds
  });
}

console.log(`Created ${patterns.length} patterns from ${incidents.length} incidents`);
```

---

## 12. Key Libraries

- **Text Processing**: `natural` (TF-IDF, tokenization)
- **Similarity**: Custom implementations + `ml-distance` (cosine)
- **Embeddings** (optional): OpenAI SDK or `@xenova/transformers` (local)
- **Date Math**: `date-fns`
- **Statistics**: `simple-statistics` (for weighted averages)

---

## 13. Success Metrics

- **Coverage**: % of incidents assigned to patterns (target: >85%)
- **Coherence**: Manual review of pattern quality (sample 20 patterns)
- **Performance**: Clustering time < 5 seconds for 1000 incidents
- **Actionability**: Patterns lead to reduced incident resolution time

---

## Next Steps

1. Review and approve this plan
2. Set up database schema (`patterns` table)
3. Implement similarity metrics module
4. Build incremental clustering algorithm
5. Create pattern generator
6. Add API endpoints
7. Build UI dashboard
