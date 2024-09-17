import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ucneekhlpolpahgtcxsn.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjbmVla2hscG9scGFoZ3RjeHNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjY1MjE1NzQsImV4cCI6MjA0MjA5NzU3NH0.VWQGko6F8ShFUnpBYYQYmHHsBssQznuXSnblb38fXXA'

export const supabase = createClient(supabaseUrl, supabaseKey)