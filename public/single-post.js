document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const postId = params.get('id');

    if (postId) {
        const post = await fetchPost(postId);
        if (post) {
            displayPost(post);
        } else {
            console.error('Post not found or error in fetching post.');
        }
    } else {
        console.error('No post ID found in URL.');
    }
});

async function fetchPost(id) {
    // Replace with your Supabase project URL and key

    const supabaseUrl = "https://fudsrzbhqpmryvmxgced.supabase.co";
    const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ1ZHNyemJocXBtcnl2bXhnY2VkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTM5MjE3OTQsImV4cCI6MjAyOTQ5Nzc5NH0.6UMbzoD8J1BQl01h6NSyZAHVhrWerUcD5VVGuBwRcag";

    const { createClient } = supabase;
    const supabase = createClient(supabaseUrl, supabaseKey);

    try {
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
    } catch (err) {
        console.error('Exception in fetching post:', err);
        return null;
    }
}

function displayPost(post) {
    const postContainer = document.getElementById('post-container');
    if (!post) {
        postContainer.innerHTML = '<p>Post not found</p>';
        return;
    }

    // Log the post content to check for undefined fields
    console.log('Displaying post:', post);

    postContainer.innerHTML = `
        <div class="post">
            <div class="post-header">
                <img src="${post.profile_pic || 'default-profile.png'}" alt="Creator's Profile Picture" class="creator-pfp">
                <span class="post-username">${post.username || 'Unknown User'}</span>
            </div>
            <div class="post-details">
                <h3 class="post-title"><strong>${post.title || 'Untitled Post'}</strong></h3>
                ${post.image ? `<img src="${post.image}" alt="Post Image" class="post-image">` : ''}
                <p>${post.caption || ''}</p>
            </div>
        </div>
    `;
}