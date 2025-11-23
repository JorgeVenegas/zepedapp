import { pipeline } from '@xenova/transformers';
import type { NormalizedIncident } from './types';

// Singleton pattern for translation pipeline
let translationPipeline: any = null;

/**
 * Initialize the translation pipeline (lazy loading)
 * Uses NLLB-200 for Spanish to English translation
 */
async function getTranslationPipeline(): Promise<any> {
  if (translationPipeline) {
    return translationPipeline;
  }
  
  try {
    console.log('🔧 Loading translation model (NLLB-200-distilled-600M)...');
    
    // Suppress ONNX runtime warnings during model loading
    const originalWarn = console.warn;
    const originalLog = console.log;
    console.warn = () => {};
    console.log = () => {};
    
    try {
      translationPipeline = await pipeline(
        'translation',
        'Xenova/nllb-200-distilled-600M'
      );
    } finally {
      // Restore console methods
      console.warn = originalWarn;
      console.log = originalLog;
    }
    
    console.log('✅ Translation model loaded successfully');
    return translationPipeline;
  } catch (error) {
    console.error('❌ Failed to load translation model:', error);
    return null;
  }
}

/**
 * Detect if text is in Spanish (simple heuristic)
 */
function isSpanish(text: string): boolean {
  if (!text || text.length < 3) return false;
  
  // Common Spanish words and patterns
  // Common Spanish words and patterns
  const spanishIndicators = [
    'el ', 'la ', 'los ', 'las ', 'un ', 'una ',
    'que ', 'de ', 'en ', 'y ', 'para ', 'del ', 'al ',
    'ción', 'ión', 'añ', 'ñ', 'esta', 'este', 'ustedes',
    'demora', 'tren', 'parada', 'retraso', 'problema',
    'generó', 'ocurrido', 'dirijo'
  ];
  
  const lowerText = text.toLowerCase();
  const matches = spanishIndicators.filter(indicator => lowerText.includes(indicator));
  
  // If at least 1 Spanish indicator found, consider it Spanish
  // (lowered threshold for short texts like keywords)
  return matches.length >= 1;
}

/**
 * Translate text from Spanish to English
 */
export async function translateToEnglish(text: string): Promise<string> {
  if (!text || text.trim().length === 0) return text;
  
  // Check if text is Spanish
  if (!isSpanish(text)) {
    return text; // Already in English or other language
  }
  
  const pipe = await getTranslationPipeline();
  if (!pipe) {
    console.warn('Translation model not available, keeping original text');
    return text;
  }
  
  try {
    const result = await pipe(text, {
      src_lang: 'spa_Latn', // Spanish
      tgt_lang: 'eng_Latn', // English
    });
    
    return result[0].translation_text || text;
  } catch (error) {
    console.error('Translation error:', error);
    return text; // Fallback to original
  }
}

/**
 * Translate array of keywords
 * Batch translates keywords more efficiently by joining them
 */
export async function translateKeywords(keywords: string[]): Promise<string[]> {
  if (keywords.length === 0) return [];
  
  // Join keywords with commas for batch translation
  const joinedKeywords = keywords.join(', ');
  
  // Translate the batch
  const translatedBatch = await translateToEnglish(joinedKeywords);
  
  // Split back into array and clean up
  return translatedBatch
    .split(',')
    .map(k => k.trim())
    .filter(k => k.length > 0);
}

/**
 * Load cached translations from database
 */
export async function loadCachedTranslations(
  incidentIds: string[],
  supabase: any
): Promise<Map<string, { summary: string; keywords: string[] }>> {
  const translations = new Map<string, { summary: string; keywords: string[] }>();
  
  if (incidentIds.length === 0) {
    console.log('⚠️  No incident IDs provided for loading translations');
    return translations;
  }
  
  try {
    console.log(`🔍 Attempting to load cached translations for ${incidentIds.length} incidents...`);
    console.log(`   Sample IDs: ${incidentIds.slice(0, 3).join(', ')}`);
    
    const { data, error } = await supabase
      .from('incident_translations')
      .select('incident_id, translated_summary, translated_keywords')
      .in('incident_id', incidentIds);
    
    if (error) {
      console.error('❌ Failed to load cached translations:', error.message);
      console.error('   Error details:', JSON.stringify(error, null, 2));
      return translations;
    }
    
    if (data) {
      for (const row of data) {
        translations.set(row.incident_id, {
          summary: row.translated_summary,
          keywords: row.translated_keywords || []
        });
      }
      console.log(`📦 Loaded ${translations.size}/${incidentIds.length} cached translations from database`);
      if (translations.size === 0 && incidentIds.length > 0) {
        console.log('   ℹ️  No cached translations found - will translate Spanish incidents');
      }
    } else {
      console.log('   ℹ️  Query returned no data');
    }
  } catch (error) {
    console.error('❌ Error loading cached translations:', error);
  }
  
  return translations;
}

/**
 * Save translations to database for future use
 */
export async function saveCachedTranslations(
  translations: Map<string, { summary: string; keywords: string[] }>,
  supabase: any
): Promise<void> {
  if (translations.size === 0) {
    console.log('⚠️  No translations to save (map is empty)');
    return;
  }
  
  try {
    const records = Array.from(translations.entries()).map(([incident_id, trans]) => ({
      incident_id,
      translated_summary: trans.summary,
      translated_keywords: trans.keywords,
      created_at: new Date().toISOString(),
    }));
    
    console.log(`💾 Attempting to save ${records.length} translations to database...`);
    console.log(`   Sample IDs: ${records.slice(0, 3).map(r => r.incident_id).join(', ')}`);
    
    const { data, error } = await supabase
      .from('incident_translations')
      .upsert(records, { onConflict: 'incident_id' })
      .select();
    
    if (error) {
      console.error('❌ Failed to save translations to cache:', error.message);
      console.error('   Error details:', JSON.stringify(error, null, 2));
    } else {
      console.log(`✅ Successfully saved ${records.length} translations to database cache`);
      console.log(`   Rows affected: ${data?.length || 0}`);
    }
  } catch (error) {
    console.error('❌ Error saving translations to cache:', error);
  }
}

/**
 * Translate incidents batch with caching
 */
export async function translateIncidents(
  incidents: NormalizedIncident[],
  cachedTranslations?: Map<string, { summary: string; keywords: string[] }>
): Promise<Map<string, { summary: string; keywords: string[] }>> {
  console.log(`[translateIncidents] Called with ${incidents.length} incidents, ${cachedTranslations?.size || 0} cached translations`);
  
  const translations = cachedTranslations || new Map();
  
  const pipe = await getTranslationPipeline();
  if (!pipe) {
    console.warn('Translation model not available. Keeping original text.');
    return translations;
  }
  
  // Filter incidents that need translation
  const incidentsToTranslate = incidents.filter(inc => 
    !translations.has(inc.id) && isSpanish(inc.summary)
  );
  
  if (incidentsToTranslate.length === 0) {
    console.log('✅ All incidents already translated or in English');
    return translations;
  }
  
  console.log(`🌐 Translating ${incidentsToTranslate.length}/${incidents.length} Spanish incidents to English...`);
  console.log(`💰 Translations saved by cache: ${incidents.length - incidentsToTranslate.length}`);
  
  try {
    for (let i = 0; i < incidentsToTranslate.length; i++) {
      const incident = incidentsToTranslate[i];
      
      // Translate summary
      const translatedSummary = await translateToEnglish(incident.summary);
      
      // Translate keywords
      const translatedKeywords = await translateKeywords(incident.keywords);
      
      translations.set(incident.id, {
        summary: translatedSummary,
        keywords: translatedKeywords
      });
      
      if ((i + 1) % 5 === 0) {
        console.log(`Translated ${i + 1}/${incidentsToTranslate.length} incidents`);
      }
    }
    
    console.log(`✅ Translation complete: ${translations.size} total (${incidentsToTranslate.length} new)`);
  } catch (error) {
    console.error('Error during batch translation:', error);
  }
  
  return translations;
}

/**
 * Check if translation is available
 */
export function isTranslationAvailable(): boolean {
  return true; // Local model is always available
}
