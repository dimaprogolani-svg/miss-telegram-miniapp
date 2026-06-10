import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://hxoyvftmpkdxmtgyutdo.supabase.co'

const supabaseKey =
  'sb_publishable_3PcSisRuc3uA1fPGfZdONA_qE0hK_g2'

export const supabase = createClient(
  supabaseUrl,
  supabaseKey
)