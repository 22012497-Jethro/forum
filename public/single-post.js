// Supabase configuration
const supabaseUrl = "https://fudsrzbhqpmryvmxgced.supabase.co";
    const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ1ZHNyemJocXBtcnl2bXhnY2VkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTM5MjE3OTQsImV4cCI6MjAyOTQ5Nzc5NH0.6UMbzoD8J1BQl01h6NSyZAHVhrWerUcD5VVGuBwRcag";

    // Initialize Supabase client
const { createClient } = supabase;
const supabase = createClient(supabaseUrl, supabaseKey);

document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const postId = params.get('id');

    if (postId) {
        const post = await fetchPost(postId);
        if (post) {
            displayPost(post);
            const comments = await fetchComments(postId);
            displayComments(comments);
        } else {
            console.error('Post not found or error in fetching post.');
            displayError('Post not found or error in fetching post.');
        }
    } else {
        console.error('No post ID found in URL.');
        displayError('No post ID found in URL.');
    }

    document.getElementById('comment-form').addEventListener('submit', async (event) => {
        event.preventDefault();
        await addComment(postId);
        const comments = await fetchComments(postId);
        displayComments(comments);
    });
});

async function fetchPost(id) {
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

async function fetchComments(postId) {
    try {
        let { data: comments, error } = await supabase
            .from('comments')
            .select('*')
            .eq('post_id', postId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching comments:', error);
            return [];
        }
        console.log('Fetched comments:', comments); // Debugging line
        return comments;
    } catch (err) {
        console.error('Exception in fetching comments:', err);
        return [];
    }
}

function displayComments(comments) {
    const commentsSection = document.getElementById('comments-section');
    if (!comments || comments.length === 0) {
        commentsSection.innerHTML = '<p>No comments yet.</p>';
        return;
    }

    commentsSection.innerHTML = comments.map(comment => `
        <div class="comment">
            <span class="comment-username">${comment.username || 'Anonymous'}</span>
            <p>${comment.text}</p>
        </div>
    `).join('');
}

async function addComment(postId) {
    const commentText = document.getElementById('comment-text').value;
    if (!commentText) {
        alert('Comment cannot be empty');
        return;
    }

    const userId = document.getElementById('profile-username').dataset.userId;

    try {
        let { data: comment, error } = await supabase
            .from('comments')
            .insert([{ text: commentText, post_id: postId, user_id: userId }])
            .single();

        if (error) {
            console.error('Error adding comment:', error);
            return null;
        }
        console.log('Added comment:', comment); // Debugging line
        document.getElementById('comment-text').value = ''; // Clear the comment form
        return comment;
    } catch (err) {
        console.error('Exception in adding comment:', err);
        return null;
    }
}

function displayError(message) {
    const postContainer = document.getElementById('post-container');
    postContainer.innerHTML = `<p>${message}</p>`;
}
