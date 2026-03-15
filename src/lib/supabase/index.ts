export { supabase } from './client'


// this re-exports everything from client.ts
//vwithout this long imports is needed like this:- import { supabase } from '@/lib/supabase/client' but now only this is enough import { supabase } from '@/lib/supabase'