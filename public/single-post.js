document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const postId = params.get('id');

    if (postId) {
        const post = await fetchPost(postId);
        displayPost(post);
    }
});

async function fetchPost(id) {
    // Replace with your Supabase project URL and key
    const supabaseUrl = "https://fudsrzbhqpmryvmxgced.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ1ZHNyemJocXBtcnl2bXhnY2VkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTM5MjE3OTQsImV4cCI6MjAyOTQ5Nzc5NH0.6UMbzoD8J1BQl01h6NSyZAHVhrWerUcD5VVGuBwRcag";

    const { createClient } = supabase;
    const supabase = createClient(supabaseUrl, supabaseKey);

    let { data: post, error } = await supabase
        .from('posts')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        console.error('Error fetching post:', error);
        return null;
    }
    console.log('Fetched post:', post); // Debugging line
    return post;
}

function displayPost(post) {
    const postContainer = document.getElementById('post-container');
    if (!post) {
        postContainer.innerHTML = '<p>Post not found</p>';
        return;
    }
    postContainer.innerHTML = `
        <div class="post">
            <div class="post-header">
                <img src="${post.profile_pic || 'default-profile.png'}" alt="Creator's Profile Picture" class="creator-pfp">
                <span class="post-username">${post.username}</span>
            </div>
            <div class="post-details">
                <h3 class="post-title"><strong>${post.title}</strong></h3>
                ${post.image ? `<img src="${post.image}" alt="Post Image" class="post-image">` : ''}
                <p>${post.caption}</p>
            </div>
        </div>
    `;
}
