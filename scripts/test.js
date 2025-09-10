import 'dotenv/config'; // loads .env automatically

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

const fetchSubjects = async () => {
    
    const everything = await supabase
    .from('subjects')
    .select('name, syllabus_type')
    .order('name', { ascending: true });
    console.log(everything)
    if (error) {
        console.error('Error fetching subjects:', error.message);
        setLoadingSubjects(false); // Set loading to false on error
        return;
    }

  };
fetchSubjects()