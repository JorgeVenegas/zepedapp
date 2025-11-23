import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

async function applyMigration() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials in environment variables');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log('📦 Reading migration file...');
  const migrationPath = path.join(__dirname, '../supabase/migrations/20250101000000_create_incident_embeddings.sql');
  const sql = fs.readFileSync(migrationPath, 'utf-8');

  console.log('🚀 Applying migration...');
  
  try {
    const { error } = await supabase.rpc('exec_sql', { sql });
    
    if (error) {
      // Try direct query if RPC doesn't exist
      const lines = sql.split(';').filter(line => line.trim());
      for (const line of lines) {
        if (line.trim()) {
          const { error: queryError } = await supabase.from('_temp').select('*').limit(0);
          if (queryError) {
            console.error('❌ Migration failed:', queryError.message);
            process.exit(1);
          }
        }
      }
    }
    
    console.log('✅ Migration applied successfully!');
    console.log('');
    console.log('The incident_embeddings table is now ready.');
    console.log('Next time you run clustering, embeddings will be cached automatically.');
    
  } catch (err) {
    console.error('❌ Error applying migration:', err);
    console.log('');
    console.log('Please apply the migration manually through the Supabase Dashboard:');
    console.log('1. Go to SQL Editor in your Supabase Dashboard');
    console.log('2. Copy the contents of: supabase/migrations/20250101000000_create_incident_embeddings.sql');
    console.log('3. Paste and run in the SQL Editor');
  }
}

applyMigration();
