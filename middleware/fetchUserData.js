const { createClient } = require('@supabase/supabase-js');

// Supabase setup
const supabaseUrl = "https://fudsrzbhqpmryvmxgced.supabase.co";
const supabaseKey = "your_actual_supabase_key"; // Replace with your actual key
const supabase = createClient(supabaseUrl, supabaseKey);

const fetchUserData = async (req, res, next) => {
    const userId = req.session.userId;
    if (!userId) {
        return next();
    }

    try {
        const { data, error } = await supabase
            .from('users')
            .select('username, pfp')
            .eq('id', userId)
            .single();

        if (error) {
            console.error("Error fetching user data:", error);
            return next();
        }

        req.userData = data;
        next();
    } catch (err) {
        console.error("Error fetching user data:", err);
        next();
    }
};

module.exports = fetchUserData;
