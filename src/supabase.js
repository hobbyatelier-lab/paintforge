import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL  = 'https://cxpydnchumwvemvhyetm.supabase.co'
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4cHlkbmNodW13dmVtdmh5ZXRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMwNzk2NTgsImV4cCI6MjA5ODY1NTY1OH0.6QS4IkudlonnMlaNEZsaDKm-Ah0NsytRc3dTtv0O0JM'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON)
