import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function GET(request) {
    const { data, error } = await supabase
    .from('subjects')
    .select('name, syllabus_type')
    .order('name', { ascending: true });
    return new Response(JSON.stringify({ error: error, data: data }), {
        headers: { "Content-Type": "application/json" },
    });
}
