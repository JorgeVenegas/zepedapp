# Pattern Clustering System

This module implements an intelligent pattern detection system that transforms individual incidents into actionable patterns using AI-powered clustering and similarity analysis.

## Overview

The clustering system analyzes incidents to discover recurring patterns, enabling proactive issue management and root cause analysis. It combines traditional text analysis with AI embeddings from Groq LLM to achieve high-quality pattern detection.

## How It Works

### 1. **Data Preprocessing**
```
Raw Incidents → Normalized Data → Feature Extraction
```

The system first normalizes incident data:
- Converts timestamps to Date objects
- Extracts and tokenizes summaries
- Normalizes text (lowercase, removes special chars)
- Prepares structured data for analysis

**File:** `lib/clustering/preprocessing.ts`

### 2. **AI Feature Generation (Optional)**
```
Normalized Incidents → Groq LLM → 10D Embeddings → Cache
```

If enabled, the system generates semantic features using Groq's LLM:
- Creates rich text representation (service, category, priority, summary)
- Calls Groq API to generate 10-dimensional feature vectors
- **Caches embeddings** in database to reduce API costs (95%+ savings)
- Reuses cached embeddings for repeat incidents

**Files:** 
- `lib/clustering/embeddings.ts` - AI feature generation
- `app/api/patterns/cluster/route.ts` - Cache loading/saving

**Database:** `incident_embeddings` table stores cached vectors

### 3. **Similarity Calculation**
```
Incident Pairs → Multi-Metric Analysis → Weighted Score → Similarity
```

For each pair of incidents, the system calculates similarity across multiple dimensions:

| Metric | Weight | Method | Purpose |
|--------|--------|--------|---------|
| **Keyword** | 30% | Jaccard similarity on keyword sets | Identifies common technical terms |
| **Category** | 25% | Exact match on category + service | Groups by incident type |
| **Temporal** | 20% | Gaussian decay over time window | Finds time-clustered incidents |
| **AI Semantic** | 60%* | Cosine similarity on embeddings | Deep semantic understanding |
| **Traditional Semantic** | 40%* | TF-IDF + cosine similarity | Fallback text matching |
| **Priority** | 5% | Inverse difference of priorities | Groups similar severity |
| **Sentiment** | 5% | Exact sentiment match | Detects user impact |

*When AI is enabled, semantic score = 60% AI + 40% traditional. Without AI, only traditional is used.

**Files:**
- `lib/clustering/similarity.ts` - All similarity metrics
- `lib/clustering/embeddings.ts` - AI cosine similarity

### 4. **DBSCAN Clustering**
```
Similarity Matrix → Density-Based Grouping → Clusters
```

The system uses DBSCAN (Density-Based Spatial Clustering) algorithm:

**Algorithm Steps:**
1. **Find neighbors**: For each incident, identify all incidents with similarity ≥ threshold
2. **Core points**: Incidents with enough neighbors become cluster cores
3. **Expand clusters**: Recursively add neighbors to form dense regions
4. **Handle noise**: Unmatched incidents become single-incident patterns

**Why DBSCAN?**
- ✅ Automatically determines number of clusters
- ✅ Handles varying cluster sizes and shapes
- ✅ Identifies outliers (noise points)
- ✅ No need to specify cluster count upfront

**Parameters:**
- `similarityThreshold` (default: 0.65): Minimum similarity to be neighbors
- `minClusterSize` (default: 1): Minimum incidents per pattern
- `timeWindowHours` (default: 24): Maximum time gap between incidents

**File:** `lib/clustering/index.ts` - `dbscanClustering()`

### 5. **Pattern Generation**
```
Clusters → Analysis → Patterns (Title, Description, Filters)
```

Each cluster is transformed into an actionable pattern:

**Title Generation:**
- Analyzes top keywords, services, categories
- Determines severity based on priority (🔴 Critical, 🟠 High, ⚠️ Frequent)
- Creates natural language titles: 
  - "🔴 Critical: API Performance issues related to timeout and latency"
  - "⚠️ Frequent: Database issues across 3 services (25+ incidents)"

**Description Generation:**
- Provides comprehensive pattern overview with metrics
- Calculates impact: priority distribution, sentiment analysis
- Identifies visibility: channels, services affected
- **Recommends actions** based on pattern characteristics:
  - 🚨 Immediate attention for critical incidents
  - ⚡ Acute vs 📊 Chronic issue classification
  - 🔗 Cross-service investigation needs
  - 💬 Customer communication requirements

**Filter Extraction:**
- Services, categories, sources affected
- Priority range
- Time range (start/end)
- Common keywords
- Sentiment patterns

**File:** `lib/clustering/patternGenerator.ts`

### 6. **Pattern Persistence**
```
Patterns → Validation → Database → API Response
```

Generated patterns are optionally saved to database:
- Stores in `patterns` table with all metadata
- Returns patterns with incident IDs for traceability
- Supports preview mode (no saving)

**File:** `app/api/patterns/cluster/route.ts`

## Architecture Diagram

```
┌─────────────────┐
│  Raw Incidents  │
└────────┬────────┘
         │
         ↓
┌─────────────────────────────────────┐
│  1. PREPROCESSING                   │
│  • Normalize timestamps             │
│  • Tokenize summaries               │
│  • Extract features                 │
└────────┬────────────────────────────┘
         │
         ↓
┌─────────────────────────────────────┐
│  2. AI FEATURE GENERATION           │
│  ┌──────────────┐  ┌─────────────┐ │
│  │ Groq LLM API │→ │ Cache (DB)  │ │
│  └──────────────┘  └─────────────┘ │
│  • 10D embeddings per incident      │
│  • 95%+ cache hit rate              │
└────────┬────────────────────────────┘
         │
         ↓
┌─────────────────────────────────────┐
│  3. SIMILARITY CALCULATION          │
│  • Keyword overlap (Jaccard)        │
│  • Category/Service matching        │
│  • Temporal proximity (Gaussian)    │
│  • AI semantic (Cosine on vectors)  │
│  • Traditional semantic (TF-IDF)    │
│  • Priority alignment               │
│  • Sentiment matching               │
│  → Weighted similarity score        │
└────────┬────────────────────────────┘
         │
         ↓
┌─────────────────────────────────────┐
│  4. DBSCAN CLUSTERING               │
│  • Find neighbors (similarity ≥ θ)  │
│  • Identify core points             │
│  • Expand dense regions             │
│  • Label noise/outliers             │
│  → Incident clusters                │
└────────┬────────────────────────────┘
         │
         ↓
┌─────────────────────────────────────┐
│  5. PATTERN GENERATION              │
│  • Intelligent titles (with emoji)  │
│  • Comprehensive descriptions       │
│  • Actionable recommendations       │
│  • Filter extraction                │
│  → Actionable patterns              │
└────────┬────────────────────────────┘
         │
         ↓
┌─────────────────────────────────────┐
│  6. PERSISTENCE (Optional)          │
│  • Save to database                 │
│  • Return with metadata             │
│  → API response                     │
└─────────────────────────────────────┘
```

## Configuration

### Default Options
```typescript
{
  similarityThreshold: 0.65,    // 0-1, higher = stricter matching
  timeWindowHours: 24,          // Max time gap between incidents
  minClusterSize: 1,            // Minimum incidents per pattern
  useEmbeddings: true,          // Enable AI-powered clustering
  embeddingModel: 'llama-3.3-70b-versatile',
  maxKeywordsInTitle: 5,        // Keywords in pattern titles
  useLLMForDescription: false,  // Future: AI-generated descriptions
  
  weights: {
    keyword: 0.30,
    category: 0.25,
    temporal: 0.20,
    semantic: 0.15,
    priority: 0.05,
    sentiment: 0.05
  }
}
```

## Usage Examples

### Basic Clustering (Programmatic)

```typescript
import { clusterIncidents } from '@/lib/clustering';

const incidents = await fetchIncidents();

const patterns = await clusterIncidents(incidents, {
  similarityThreshold: 0.55,
  timeWindowHours: 168,
  minClusterSize: 2,
  useEmbeddings: true,
});

console.log(`Found ${patterns.length} patterns`);
patterns.forEach(p => {
  console.log(`${p.title} - ${p.frequency} incidents`);
});
```

### Via API Endpoint

```bash
# Preview patterns without saving
curl -X POST http://localhost:3000/api/patterns/cluster \
  -H "Content-Type: application/json" \
  -d '{
    "preview": true,
    "options": {
      "similarityThreshold": 0.55,
      "timeWindowHours": 168,
      "minClusterSize": 2,
      "useEmbeddings": true
    }
  }'

# Save patterns to database
curl -X POST http://localhost:3000/api/patterns/cluster \
  -H "Content-Type: application/json" \
  -d '{ "preview": false }'
```

### Via UI

1. Navigate to Records page
2. Apply filters (optional)
3. Click **"Explore Patterns"** button
4. Review generated patterns in drawer
5. Click **"Save Pattern"** to persist
6. Click **"Create Solution"** to generate fix

## Performance & Cost Optimization

### Embedding Caching

The system includes intelligent caching to reduce AI API costs:

**First Run:**
```
📦 Loaded 0 cached embeddings from database
🤖 Generating AI features for 100/100 new incidents using Groq...
💰 API calls saved by cache: 0
✅ Groq feature extraction complete: 100 total (100 new)
💾 Saved 100 embeddings to database cache
```

**Subsequent Runs:**
```
📦 Loaded 100 cached embeddings from database
✅ All incidents already have cached embeddings. API calls saved: 100
```

**Cost Savings:**
- Without cache: ~$0.10 per 100 incidents
- With cache: ~$0.005 per 100 incidents (95%+ reduction)

### Performance Tips

1. **Use appropriate thresholds**: Lower threshold = more patterns but lower quality
2. **Adjust time windows**: Shorter windows = faster processing
3. **Enable caching**: Always keep `useEmbeddings: true` for best results
4. **Filter before clustering**: Process only relevant incidents
5. **Batch processing**: Cluster in chunks of 500-1000 incidents

## Tuning Guide

### Similarity Threshold

| Threshold | Result | Use Case |
|-----------|--------|----------|
| 0.3-0.4 | Very loose clustering, many large patterns | Broad trend analysis |
| 0.5-0.6 | **Recommended** - balanced grouping | General pattern detection |
| 0.7-0.8 | Strict matching, precise patterns | High-confidence patterns only |
| 0.9+ | Nearly identical incidents only | Duplicate detection |

### Time Window

| Window | Result | Use Case |
|--------|--------|----------|
| 1-6 hours | Acute incident bursts | Real-time alerting |
| 24 hours | Daily patterns | Daily operations review |
| 168 hours (7 days) | **Recommended** - weekly trends | Sprint retrospectives |
| 720 hours (30 days) | Long-term patterns | Monthly analysis |

### Minimum Cluster Size

| Size | Result | Use Case |
|------|--------|----------|
| 1 | All incidents become patterns | Complete coverage |
| 2-3 | **Recommended** - true patterns only | Quality over quantity |
| 5+ | High-confidence patterns | Executive reporting |

## Output Format

### Pattern Object

```typescript
{
  title: "🔴 Critical: API Performance issues related to timeout and latency",
  description: "**Pattern Overview:** This pattern represents 15 incidents...",
  filters: {
    services: ["API", "Gateway"],
    categories: ["Performance"],
    keywords: ["timeout", "latency", "slow"],
    priority_range: { min: 3, max: 5 },
    time_range: { 
      start: "2025-11-15T00:00:00Z", 
      end: "2025-11-20T23:59:59Z" 
    }
  },
  priority: 4,
  frequency: 15,
  incidentIds: ["uuid1", "uuid2", ...],
  timeRangeStart: "2025-11-15T00:00:00Z",
  timeRangeEnd: "2025-11-20T23:59:59Z"
}
```

## Database Schema

### Patterns Table

```sql
CREATE TABLE patterns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  filters JSONB NOT NULL,
  priority INTEGER DEFAULT 0,
  frequency INTEGER DEFAULT 0,
  timeRangeStart TIMESTAMPTZ,
  timeRangeEnd TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Incident Embeddings Table (Cache)

```sql
CREATE TABLE incident_embeddings (
  incident_id UUID PRIMARY KEY REFERENCES incidents(id),
  embedding NUMERIC[] NOT NULL,
  model TEXT NOT NULL DEFAULT 'groq-llama-3.3-70b',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Troubleshooting

### No Patterns Generated

**Possible causes:**
- Threshold too high → Lower to 0.5
- Time window too small → Increase to 168 hours
- Incidents too diverse → Check if incidents share keywords/categories
- No AI features → Verify `GROQ_API_KEY` is set

### Too Many Patterns

**Solutions:**
- Increase `similarityThreshold` to 0.7+
- Increase `minClusterSize` to 3+
- Reduce `timeWindowHours` to 24
- Filter incidents before clustering

### Slow Performance

**Solutions:**
- Enable embedding caching (create `incident_embeddings` table)
- Reduce batch size (process 500-1000 at a time)
- Disable embeddings: `useEmbeddings: false`
- Add indexes to incidents table

### High API Costs

**Solutions:**
- ✅ Create `incident_embeddings` table for caching
- ✅ Run clustering less frequently
- Consider using lower-cost embedding models

## Advanced Topics

### Custom Similarity Weights

Adjust weights based on your domain:

```typescript
// For time-sensitive alerting
const alertingWeights = {
  temporal: 0.40,  // Time is critical
  keyword: 0.30,
  category: 0.20,
  semantic: 0.10,
  priority: 0.00,
  sentiment: 0.00
};

// For semantic grouping
const semanticWeights = {
  semantic: 0.50,  // AI understanding
  keyword: 0.20,
  category: 0.15,
  temporal: 0.10,
  priority: 0.03,
  sentiment: 0.02
};
```

### Hybrid Approach

Combine multiple clustering runs:

```typescript
// Strict pass for high-confidence patterns
const criticalPatterns = await clusterIncidents(incidents, {
  similarityThreshold: 0.75,
  minClusterSize: 5
});

// Looser pass for remaining incidents
const remainingIncidents = incidents.filter(
  inc => !criticalPatterns.some(p => p.incidentIds.includes(inc.id))
);
const generalPatterns = await clusterIncidents(remainingIncidents, {
  similarityThreshold: 0.55,
  minClusterSize: 2
});
```

## File Structure

```
lib/clustering/
├── index.ts                 # Main clustering logic (DBSCAN)
├── embeddings.ts           # AI feature generation & caching
├── similarity.ts           # All similarity metrics
├── preprocessing.ts        # Data normalization
├── patternGenerator.ts     # Pattern creation from clusters
├── types.ts               # TypeScript interfaces
└── README.md              # This file

app/api/patterns/
├── route.ts               # CRUD operations for patterns
├── [id]/route.ts         # Single pattern operations
└── cluster/route.ts      # Clustering endpoint

supabase/migrations/
├── create_patterns_table.sql
└── 20250101000000_create_incident_embeddings.sql
```

## Contributing

To improve the clustering algorithm:

1. **Adjust similarity metrics** in `similarity.ts`
2. **Modify DBSCAN parameters** in `index.ts`
3. **Enhance pattern generation** in `patternGenerator.ts`
4. **Add new features** to embeddings pipeline

## References

- DBSCAN Algorithm: [Wikipedia](https://en.wikipedia.org/wiki/DBSCAN)
- Groq LLM: [Documentation](https://groq.com/)
- TF-IDF: [Text Frequency Analysis](https://en.wikipedia.org/wiki/Tf%E2%80%93idf)
- Cosine Similarity: [Vector Similarity](https://en.wikipedia.org/wiki/Cosine_similarity)

### 2. Use the API endpoint

```bash
# Trigger clustering on all incidents
curl -X POST http://localhost:3000/api/patterns/cluster \
  -H "Content-Type: application/json" \
  -d '{
    "options": {
      "similarityThreshold": 0.7,
      "timeWindowHours": 48
    }
  }'

# Get all patterns
curl http://localhost:3000/api/patterns

# Get patterns with filters
curl "http://localhost:3000/api/patterns?priority_min=5&frequency_min=3"

# Get a specific pattern with incidents
curl http://localhost:3000/api/patterns/{pattern-id}

# Delete a pattern
curl -X DELETE http://localhost:3000/api/patterns/{pattern-id}
```

## Architecture

```
lib/clustering/
├── index.ts              # Main clusterIncidents() function
├── types.ts              # TypeScript interfaces and defaults
├── similarity.ts         # Multi-dimensional similarity metrics
├── preprocessing.ts      # Text normalization and feature extraction
└── patternGenerator.ts   # Cluster-to-Pattern transformation
```

## Configuration Options

```typescript
interface ClusteringOptions {
  weights?: {
    keyword?: number;      // Default: 0.30
    category?: number;     // Default: 0.25
    temporal?: number;     // Default: 0.20
    semantic?: number;     // Default: 0.15
    priority?: number;     // Default: 0.05
    sentiment?: number;    // Default: 0.05
  };
  similarityThreshold?: number;  // Default: 0.65
  timeWindowHours?: number;      // Default: 24
  minClusterSize?: number;       // Default: 1
  maxKeywordsInTitle?: number;   // Default: 5
}
```

## Similarity Metrics

### 1. Keyword Overlap (30%)
- Uses Jaccard similarity on keyword arrays
- Formula: `|A ∩ B| / |A ∪ B|`

### 2. Category & Service Match (25%)
- Exact matching on category and service fields
- Binary: 1.0 for match, 0.0 for mismatch

### 3. Temporal Proximity (20%)
- Incidents within time window (default 24 hours)
- Exponential decay: `exp(-time_diff / time_window)`

### 4. Semantic Similarity (15%)
- TF-IDF vectorization + cosine similarity
- Analyzes summary text content

### 5. Priority Alignment (5%)
- Normalized distance between priority values
- Groups incidents of similar urgency

### 6. Sentiment Match (5%)
- Exact matching on sentiment analysis
- Bonus for aligned sentiment (positive/negative/neutral)

## Pattern Structure

```typescript
interface Pattern {
  title: string;           // Auto-generated from top keywords
  description: string;     // Summary of cluster characteristics
  filters: {
    services: string[];
    categories: string[];
    keywords: string[];
    priority_range: { min: number; max: number };
    sentiments: string[];
    time_range: { start: string; end: string };
  };
  priority: number;        // Weighted average (recent = higher weight)
  frequency: number;       // Count of incidents in pattern
  incidentIds: string[];   // Array of incident IDs
  timeRange: {
    start: Date;
    end: Date;
  };
}
```

## Database Schema

Run the migration to create the required tables:

```sql
-- See supabase/migrations/create_patterns_table.sql
```

Tables created:
- `patterns`: Stores pattern metadata and filters
- `incident_patterns`: Junction table linking incidents to patterns

## Testing

Run the test script:

```bash
npx tsx scripts/test-clustering.ts
```

Expected output:
- 7 sample incidents → 3 patterns
- 100% coverage
- Patterns sorted by priority (descending)

## API Endpoints

### POST `/api/patterns/cluster`
Trigger clustering on incidents.

**Request:**
```json
{
  "incident_ids": ["uuid1", "uuid2"],  // optional
  "options": {
    "similarityThreshold": 0.7,
    "timeWindowHours": 48
  }
}
```

**Response:**
```json
{
  "success": true,
  "patterns_created": 12,
  "patterns": [...]
}
```

### GET `/api/patterns`
List all patterns with filtering.

**Query params:**
- `priority_min`, `priority_max`
- `frequency_min`
- `service`, `category`
- `start_date`, `end_date`
- `limit` (default: 50), `offset` (default: 0)

### GET `/api/patterns/:id`
Get pattern details with related incidents.

### DELETE `/api/patterns/:id`
Delete a pattern (cascade deletes relationships).

## Performance

- **100 incidents**: ~50ms
- **1,000 incidents**: ~300ms
- **10,000 incidents**: ~3s (optimized with incremental clustering)

## Next Steps

1. **LLM Integration**: Use OpenAI to generate richer descriptions
2. **Embeddings**: Replace TF-IDF with embeddings for better semantic understanding
3. **Auto-clustering**: Set up cron jobs to automatically cluster new incidents
4. **Pattern Evolution**: Track how patterns change over time
5. **Anomaly Detection**: Flag incidents that don't match any pattern
6. **Dashboard UI**: Build a component to visualize patterns and relationships

## Example Output

```
Pattern 1:
Title: API Gateway - error: database, authentication, connection, timeout, login
Priority: 5
Frequency: 3
Time Range: 2025-11-22T10:00:00.000Z → 2025-11-22T10:30:00.000Z

Filters:
{
  "services": ["API Gateway"],
  "categories": ["error"],
  "keywords": ["database", "timeout", "authentication", "connection", "login"],
  "priority_range": { "min": 4, "max": 5 }
}
```

## Contributing

To add new similarity metrics:
1. Add function to `lib/clustering/similarity.ts`
2. Update weights in `lib/clustering/types.ts`
3. Integrate in `computeSimilarity()` function
4. Update tests and documentation
