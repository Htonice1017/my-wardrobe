import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://bomoqdzglzfaetfpbqbz.supabase.co'

const supabaseKey = 'sb_publishable_uAkF7cDloQS5wQ02D-pPXA_l7xyqTQv'

export const supabase = createClient(supabaseUrl, supabaseKey)