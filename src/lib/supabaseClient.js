import { createClient } from '@supabase/supabase-js'

// Você encontra essas chaves no seu painel do Supabase
const supabaseUrl = 'https://lboqmzbgiqinocdmoupv.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxib3FtemJnaXFpbm9jZG1vdXB2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2MzQxMTIsImV4cCI6MjA3ODIxMDExMn0.E6VUWSQ67hPUBkAQt5SZTsR1ymnSk_mM7MrdTm-Jfm0'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)