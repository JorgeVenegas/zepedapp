# Embedding Caching Implementation

## Overview
This implementation adds a database-backed caching layer for Groq AI embeddings to significantly reduce API costs. Previously, every clustering operation would generate new embeddings for all incidents, resulting in hundreds of API calls. With caching, embeddings are generated once and reused across multiple clustering operations.

## Cost Savings
- **Before**: 100+ Groq API calls per clustering operation
- **After**: Only calls Groq for new/uncached incidents
- **Typical Savings**: 95%+ reduction in API costs after initial run

## Architecture

### Database Schema
**Table**: `incident_embeddings`
- `incident_id` (UUID, PRIMARY KEY): References incidents(id)
- `embedding` (NUMERIC[]): 10-dimensional feature vector from Groq
- `model` (TEXT): Model identifier ('groq-llama-3.3-70b')
- `created_at` (TIMESTAMPTZ): Creation timestamp
- `updated_at` (TIMESTAMPTZ): Last update timestamp

**Indexes**:
- `idx_incident_embeddings_incident_id`: Fast lookups by incident
- `idx_incident_embeddings_model`: Filter by model version

### Code Flow

1. **Load Cached Embeddings** (`loadCachedEmbeddings`)
   - Query database for existing embeddings
   - Returns Map<incident_id, embedding>
   - Called at start of clustering operation

2. **Generate Missing Embeddings** (`generateIncidentEmbeddings`)
   - Filters out incidents that already have cached embeddings
   - Only calls Groq API for new incidents
   - Logs savings: "API calls saved by cache: X"

3. **Save New Embeddings** (`saveCachedEmbeddings`)
   - Upserts new embeddings to database
   - Called after clustering completes
   - Uses ON CONFLICT to handle duplicates

## Modified Files

### lib/clustering/embeddings.ts
- Added `cachedEmbeddings` parameter to `generateIncidentEmbeddings`
- Added `loadCachedEmbeddings(incidentIds, supabase)` function
- Added `saveCachedEmbeddings(embeddings, supabase)` function
- Enhanced logging to show cache hits and API savings

### lib/clustering/types.ts
- Added `cachedEmbeddings?: Map<string, number[]>` to `ClusteringOptions`
- Updated `DEFAULT_OPTIONS` type to use `Omit<>` for optional field

### lib/clustering/index.ts
- Updated `clusterIncidents` to accept and use `cachedEmbeddings` option
- Passes cached embeddings to `generateIncidentEmbeddings`

### app/api/patterns/cluster/route.ts
- Imports caching functions: `loadCachedEmbeddings`, `saveCachedEmbeddings`
- Loads cached embeddings before clustering
- Passes cache to clustering options
- Saves new embeddings after clustering completes

### Database Migration
- Created `supabase/migrations/20250101000000_create_incident_embeddings.sql`
- Defines schema with proper indexes and triggers

## Usage Example

```typescript
// In cluster API route:

// 1. Load existing embeddings
const incidentIds = mappedIncidents.map(inc => inc.id);
const cachedEmbeddings = await loadCachedEmbeddings(incidentIds, supabase);

// 2. Pass to clustering (will only generate missing embeddings)
const options = {
  useEmbeddings: true,
  cachedEmbeddings: cachedEmbeddings
};
const patterns = await clusterIncidents(incidents, options);

// 3. Save any new embeddings generated
if (options.cachedEmbeddings.size > cachedEmbeddings.size) {
  await saveCachedEmbeddings(options.cachedEmbeddings, supabase);
}
```

## Logging Output

**First run** (no cache):
```
📦 Loaded 0 cached embeddings from database
🤖 Generating AI features for 100/100 new incidents using Groq...
💰 API calls saved by cache: 0
✅ Groq feature extraction complete: 100 total (100 new)
💾 Saved 100 embeddings to database cache
```

**Second run** (with cache):
```
📦 Loaded 100 cached embeddings from database
✅ All incidents already have cached embeddings. API calls saved: 100
```

**Incremental run** (partial cache):
```
📦 Loaded 80 cached embeddings from database
🤖 Generating AI features for 20/100 new incidents using Groq...
💰 API calls saved by cache: 80
✅ Groq feature extraction complete: 100 total (20 new)
💾 Saved 20 embeddings to database cache
```

## Benefits

1. **Cost Reduction**: 95%+ reduction in Groq API costs
2. **Performance**: Faster clustering for repeat operations
3. **Scalability**: Database handles large embedding caches efficiently
4. **Transparency**: Clear logging shows cache effectiveness
5. **Automatic**: Works seamlessly without manual intervention

## Future Enhancements

- **Model versioning**: Invalidate cache when switching models
- **TTL/expiry**: Auto-expire old embeddings after X days
- **Batch operations**: Optimize bulk embedding generation
- **Analytics**: Track cache hit rates and cost savings over time
