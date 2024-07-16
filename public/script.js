document.addEventListener('DOMContentLoaded', () => {
    // Fetch user profile data
    async function fetchAndDisplayUserData() {
        try {
            const response = await fetch('/users/user-profile');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            console.log('Fetched user data:', data); // Debugging line
            if (data) {
                document.getElementById('profile-username').textContent = data.username;
                document.getElementById('profile-pic').src = data.pfp || 'default-profile.png';
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
        }
    }

    // Theme switch functions
    function applyTheme(theme) {
        document.body.className = theme;
        const logo = document.getElementById('nav-logo');
        logo.src = theme === 'dark-mode' ? 'logo-light.png' : 'logo-dark.png';
        localStorage.setItem('theme', theme);
    }

    function setupThemeSwitch() {
        const themeSwitch = document.getElementById('theme-switch');
        const savedTheme = localStorage.getItem('theme') || 'light-mode';
        applyTheme(savedTheme);

        themeSwitch.addEventListener('click', () => {
            const newTheme = document.body.classList.contains('light-mode') ? 'dark-mode' : 'light-mode';
            applyTheme(newTheme);
        });
    }

    async function fetchAndDisplayPosts() {
        try {
            const response = await fetch('/posts');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const posts = await response.json();
            console.log('Fetched posts:', posts); // Debugging line
            posts.forEach(displayPost);
        } catch (error) {
            console.error('Error fetching posts:', error);
        }
    }

    function displayPost(post) {
        const postElement = document.createElement('div');
        postElement.classList.add('post');
        postElement.innerHTML = `
            <div class="post-header">
                <img src="${post.image || 'default-profile.png'}" alt="Post Image">
                <h3>${post.title}</h3>
                <p>${post.caption}</p>
            </div>
            <div class="post-details">
                <p>Category: ${post.category}</p>
                <p>Theme: ${post.theme}</p>
                <p>Rooms: ${post.rooms}</p>
                <p>Room Category: ${post.room_category}</p>
                <p>Posted by: ${post.user_id}</p>
                <p>Created at: ${post.created_at}</p>
            </div>
        `;
        document.getElementById('posts-container').appendChild(postElement);
    }

    async function addComment(postId) {
        const commentInput = document.getElementById(`comment-input-${postId}`);
        const commentText = commentInput.value;
        if (!commentText) return;

        try {
            const response = await fetch(`/posts/${postId}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text: commentText }),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const comment = await response.json();
            const commentsContainer = document.getElementById(`comments-${postId}`);
            const commentElement = document.createElement('div');
            commentElement.classList.add('comment');
            commentElement.textContent = comment.text;
            commentsContainer.appendChild(commentElement);

            commentInput.value = ''; // Clear the input field
        } catch (error) {
            console.error('Error adding comment:', error);
        }
    }

    fetchAndDisplayUserData();
    setupThemeSwitch();
    fetchAndDisplayPosts();
});
