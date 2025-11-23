import { createClient } from '@supabase/supabase-js'

async function applyMigration() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials')
    console.error('Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY)')
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  console.log('🔄 Applying migration: Add pattern_id to solutions table...')

  try {
    // Check if column already exists
    const { data: existingColumns, error: checkError } = await supabase
      .from('solutions')
      .select('*')
      .limit(0)

    if (checkError) {
      console.error('Error checking table:', checkError)
    }

    // Apply migration using raw SQL
    const { error: migrationError } = await supabase.rpc('exec_sql', {
      sql: `
        -- Add pattern_id column if it doesn't exist
        DO $$ 
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name='solutions' AND column_name='pattern_id'
          ) THEN
            ALTER TABLE public.solutions 
            ADD COLUMN pattern_id uuid REFERENCES public.patterns(id) ON DELETE CASCADE;
            
            CREATE INDEX IF NOT EXISTS idx_solutions_pattern_id 
            ON public.solutions USING btree (pattern_id);
            
            RAISE NOTICE 'Column pattern_id added successfully';
          ELSE
            RAISE NOTICE 'Column pattern_id already exists';
          END IF;
        END $$;
      `
    })

    if (migrationError) {
      console.error('❌ Migration failed:', migrationError)
      console.log('\n📋 Please run this SQL directly in your Supabase SQL Editor:')
      console.log(`
-- Add pattern_id column to solutions table
ALTER TABLE public.solutions 
ADD COLUMN IF NOT EXISTS pattern_id uuid REFERENCES public.patterns(id) ON DELETE CASCADE;

-- Create index for pattern_id lookups
CREATE INDEX IF NOT EXISTS idx_solutions_pattern_id ON public.solutions USING btree (pattern_id);
      `)
      process.exit(1)
    }

    console.log('✅ Migration applied successfully!')
    
    // Verify the column was added
    const { data: verification, error: verifyError } = await supabase
      .from('solutions')
      .select('pattern_id')
      .limit(1)

    if (!verifyError) {
      console.log('✅ Verified: pattern_id column is accessible')
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error)
    console.log('\n📋 Please run this SQL directly in your Supabase SQL Editor:')
    console.log(`
-- Add pattern_id column to solutions table
ALTER TABLE public.solutions 
ADD COLUMN IF NOT EXISTS pattern_id uuid REFERENCES public.patterns(id) ON DELETE CASCADE;

-- Create index for pattern_id lookups
CREATE INDEX IF NOT EXISTS idx_solutions_pattern_id ON public.solutions USING btree (pattern_id);
    `)
    process.exit(1)
  }
}

applyMigration()
