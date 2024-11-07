document.addEventListener('DOMContentLoaded', async () => {
    const userId = window.location.pathname.split('/').pop(); // Extract user ID from URL
    await fetchAndDisplayUserData(userId); // Fetch and display user profile data
    await fetchAndDisplayUserPosts(userId); // Fetch and display user posts
});

// Function to fetch and display user profile information
async function fetchAndDisplayUserData(userId) {
    try {
        const response = await fetch(`/users/user-profile/${userId}`);
        if (!response.ok) {
            throw new Error('Failed to fetch user profile data');
        }
        
        const data = await response.json();
        if (data) {
            document.getElementById('user-profile-username').textContent = data.username;
            document.getElementById('user-profile-pic').src = data.pfp || 'default-profile.png';
            document.getElementById('post-stats').textContent = `${data.postCount} Posts`;
        }
    } catch (error) {
        console.error('Error fetching user profile data:', error);
    }
}

// Function to fetch and display user posts
async function fetchAndDisplayUserPosts(userId) {
    try {
        const response = await fetch(`/posts/user/${userId}`);
        if (!response.ok) {
            throw new Error('Failed to fetch user posts');
        }
        
        const posts = await response.json();
        
        const postsList = document.getElementById('posts-list');
        postsList.innerHTML = ''; // Clear any existing posts

        posts.forEach(post => {
            const postItem = document.createElement('div');
            postItem.classList.add('post-item');
            postItem.textContent = post.title; // Display the post title
            postsList.appendChild(postItem);
        });
    } catch (error) {
        console.error('Error fetching user posts:', error);
    }
}
