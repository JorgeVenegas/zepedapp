# Clustering Algorithm Improvements

## Current Issues
1. **Simple incremental clustering** - Processes incidents one-by-one chronologically
2. **Average linkage** - Uses average similarity which can be sensitive to outliers
3. **No cluster refinement** - Once assigned, incidents never move
4. **Fixed weights** - Similarity weights don't adapt to data
5. **Basic text similarity** - TF-IDF is good but not state-of-the-art

## Recommended Improvements

### 1. **Enhanced Rule-Based Clustering (Immediate)**
- ✅ Use **complete linkage** (minimum similarity) instead of average
- ✅ Add **cluster merging** after initial assignment
- ✅ Implement **silhouette scoring** to validate cluster quality
- ✅ Add **adaptive thresholds** based on data distribution

### 2. **Groq AI Integration (Recommended - FREE)**
- ✅ Use Groq's ultra-fast LLMs (llama-3.3-70b-versatile, mixtral-8x7b)
- ✅ FREE tier: 30 requests/minute, sufficient for most use cases
- ✅ Extract 10-dimensional semantic features per incident
- ✅ Much faster than OpenAI (up to 750 tokens/sec)
- ✅ Features: urgency, complexity, impact, scope, etc.

### 3. **Advanced ML Models (Optional)**
- HDBSCAN (Hierarchical Density-Based Clustering)
- DBSCAN with learned epsilon
- Gaussian Mixture Models
- Neural clustering with autoencoders

## Implementation Plan

### Phase 1: Enhanced Rule-Based (Files Modified)
- `lib/clustering/index.ts` - Add DBSCAN-like algorithm ✅
- `lib/clustering/similarity.ts` - Improve similarity metrics
- `lib/clustering/types.ts` - Add new options

### Phase 2: Groq AI Integration ✅
- `lib/clustering/embeddings.ts` - Groq API integration
- Environment variable: `GROQ_API_KEY`
- Fallback to TF-IDF if API unavailable

### Phase 3: Cluster Quality Metrics
- Silhouette coefficient
- Davies-Bouldin index
- Calinski-Harabasz score

## Usage Examples

```typescript
// Enhanced rule-based (current)
const patterns = clusterIncidents(incidents, {
  algorithm: 'dbscan',
  minClusterSize: 3,
  similarityThreshold: 0.6,
});

// With Groq AI features
const patterns = clusterIncidents(incidents, {
  useEmbeddings: true,
  embeddingModel: 'llama-3.3-70b-versatile',
  similarityThreshold: 0.75,
});

// Hybrid approach
const patterns = clusterIncidents(incidents, {
  algorithm: 'hierarchical',
  useEmbeddings: true,
  weights: {
    embedding: 0.5,
    keyword: 0.2,
    category: 0.2,
    temporal: 0.1,
  },
});
```

## Cost Considerations

### Groq API (Recommended)
- **Cost: FREE** for most use cases
- Free tier: 30 requests/minute, 14,400 requests/day
- Speed: Up to 750 tokens/second (ultra-fast)
- Models: llama-3.3-70b-versatile, mixtral-8x7b-32768
- 10,000 incidents ≈ 10,000 requests = FREE
- Paid tier: $0.59/million tokens (if needed)

### OpenAI Embeddings (Alternative)
- Cost: ~$0.02 per 1M tokens
- Average incident: ~100 tokens
- 10,000 incidents ≈ $0.20
- Cache embeddings in database to avoid recomputing

### Self-Hosted Options
- Sentence-BERT models (free, requires infrastructure)
- FastText (free, less accurate)
- Universal Sentence Encoder (free, TensorFlow required)

## Setup Instructions

### Groq Setup (Recommended)
1. Get free API key: https://console.groq.com/
2. Add to `.env.local`:
   ```
   GROQ_API_KEY=your_key_here
   ```
3. Install SDK: `npm install groq-sdk`
4. Features auto-enabled when key is present
