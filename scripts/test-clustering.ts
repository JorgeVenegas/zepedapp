import { clusterIncidents } from '../lib/clustering';
import type { Incident } from '../lib/clustering';

// Sample test data
const sampleIncidents: Incident[] = [
  {
    id: '1',
    time: new Date('2025-11-22T10:00:00Z'),
    service: 'API Gateway',
    source: 'internal',
    subservice: 'auth',
    priority: 5,
    category: 'error',
    sentimentAnalysis: 'negative',
    summary: 'Database connection timeout during authentication',
    original: 'Error: Connection timeout to postgres database on auth endpoint',
    keywords: ['database', 'timeout', 'authentication', 'connection'],
  },
  {
    id: '2',
    time: new Date('2025-11-22T10:15:00Z'),
    service: 'API Gateway',
    source: 'internal',
    subservice: 'auth',
    priority: 5,
    category: 'error',
    sentimentAnalysis: 'negative',
    summary: 'Unable to connect to database for user login',
    original: 'Failed to establish connection to auth database',
    keywords: ['database', 'connection', 'login', 'authentication'],
  },
  {
    id: '3',
    time: new Date('2025-11-22T11:00:00Z'),
    service: 'Payment Service',
    source: 'external',
    subservice: 'checkout',
    priority: 8,
    category: 'error',
    sentimentAnalysis: 'negative',
    summary: 'Payment processing failed with gateway error',
    original: 'Payment gateway returned 500 error during checkout',
    keywords: ['payment', 'gateway', 'checkout', 'error'],
  },
  {
    id: '4',
    time: new Date('2025-11-22T11:05:00Z'),
    service: 'Payment Service',
    source: 'external',
    subservice: 'checkout',
    priority: 9,
    category: 'error',
    sentimentAnalysis: 'negative',
    summary: 'Transaction declined by payment gateway',
    original: 'Gateway declined transaction with insufficient funds',
    keywords: ['payment', 'gateway', 'transaction', 'declined'],
  },
  {
    id: '5',
    time: new Date('2025-11-22T10:30:00Z'),
    service: 'API Gateway',
    source: 'internal',
    subservice: 'auth',
    priority: 4,
    category: 'error',
    sentimentAnalysis: 'negative',
    summary: 'Authentication service experiencing slow database queries',
    original: 'Query execution time exceeded 5 seconds on auth database',
    keywords: ['database', 'performance', 'authentication', 'slow'],
  },
  {
    id: '6',
    time: new Date('2025-11-22T14:00:00Z'),
    service: 'Email Service',
    source: 'internal',
    subservice: 'notifications',
    priority: 2,
    category: 'warning',
    sentimentAnalysis: 'neutral',
    summary: 'Email delivery delayed for newsletter campaign',
    original: 'Newsletter emails queued but delivery delayed by 10 minutes',
    keywords: ['email', 'delivery', 'delayed', 'notification'],
  },
  {
    id: '7',
    time: new Date('2025-11-22T14:15:00Z'),
    service: 'Email Service',
    source: 'internal',
    subservice: 'notifications',
    priority: 3,
    category: 'warning',
    sentimentAnalysis: 'neutral',
    summary: 'High email queue backlog detected',
    original: 'Email queue has 10000 pending messages',
    keywords: ['email', 'queue', 'backlog', 'notification'],
  },
];

// Run clustering
console.log('Running clustering algorithm on sample incidents...\n');
console.log(`Total incidents: ${sampleIncidents.length}\n`);

const patterns = clusterIncidents(sampleIncidents, {
  similarityThreshold: 0.6,
  timeWindowHours: 4,
  weights: {
    keyword: 0.35,
    category: 0.25,
    temporal: 0.20,
    semantic: 0.15,
    priority: 0.03,
    sentiment: 0.02,
  },
});

console.log(`Patterns created: ${patterns.length}\n`);
console.log('='.repeat(80));

patterns.forEach((pattern, index) => {
  console.log(`\nPattern ${index + 1}:`);
  console.log(`Title: ${pattern.title}`);
  console.log(`Description: ${pattern.description}`);
  console.log(`Priority: ${pattern.priority}`);
  console.log(`Frequency: ${pattern.frequency}`);
  console.log(`Time Range: ${pattern.timeRange?.start.toISOString()} → ${pattern.timeRange?.end.toISOString()}`);
  console.log(`Incident IDs: ${pattern.incidentIds?.join(', ')}`);
  console.log(`\nFilters:`);
  console.log(JSON.stringify(pattern.filters, null, 2));
  console.log('='.repeat(80));
});

// Verify all incidents were clustered
const totalIncidentsInPatterns = patterns.reduce((sum, p) => sum + p.frequency, 0);
console.log(`\nTotal incidents in patterns: ${totalIncidentsInPatterns}`);
console.log(`Original incidents: ${sampleIncidents.length}`);
console.log(`Coverage: ${((totalIncidentsInPatterns / sampleIncidents.length) * 100).toFixed(1)}%`);
