const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://fudsrzbhqpmryvmxgced.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ1ZHNyemJocXBtcnl2bXhnY2VkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTM5MjE3OTQsImV4cCI6MjAyOTQ5Nzc5NH0.6UMbzoD8J1BQl01h6NSyZAHVhrWerUcD5VVGuBwRcag';
const supabase = createClient(supabaseUrl, supabaseKey);

(async () => {
    try {
        const { data, error } = await supabase.from('users').select('*');
        if (error) {
            console.error("Error fetching data:", error);
        } else {
            console.log("Data fetched successfully:", data);
        }
    } catch (err) {
        console.error("Error during Supabase connection test:", err);
    }
})();
