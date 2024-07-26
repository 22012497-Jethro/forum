document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded and parsed');
    loadPost();
    loadComments();

    document.getElementById('comment-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const commentText = document.getElementById('comment-text').value;
        const postId = getPostId();
        const userId = getUserId();

        if (commentText.trim() === "") {
            alert("Comment cannot be empty.");
            return;
        }

        try {
            const response = await fetch('/comments/addComment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ user_id: userId, post_id: postId, comment: commentText }),
            });

            if (response.ok) {
                const newComment = await response.json();
                displayComment(newComment[0]); // Assuming the response is an array with the new comment
                document.getElementById('comment-text').value = ""; // Clear the comment form
            } else {
                console.error('Failed to add comment');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    });
});

const getPostId = () => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('post_id');
};

const getUserId = () => {
    // Placeholder for actual user ID logic
    return 'User1';
};

const loadPost = async () => {
    const postId = getPostId();
    console.log('Post ID:', postId); // Log the post ID for debugging
    try {
        const response = await fetch(`/posts/${postId}`);
        if (!response.ok) {
            console.error('No post found');
            return;
        }

        const post = await response.json();
        console.log('Post Data:', post); // Log the post data for debugging
        const postElement = document.getElementById('post-container');
        postElement.innerHTML = `
            <div class="post-header">
                <img src="${post.author_pfp || 'default-profile.png'}" alt="Creator's Profile Picture">
                <span class="post-username">${post.author || 'Unknown'}</span>
            </div>
            <div class="post-details">
                <h3>${post.title || 'No title'}</h3>
                <p>${post.caption || 'No caption'}</p>
            </div>
        `;
    } catch (error) {
        console.error('Error loading post:', error);
    }
};

const loadComments = async () => {
    const postId = getPostId();
    try {
        const response = await fetch(`/comments?post_id=${postId}`);
        if (!response.ok) {
            console.error('Failed to load comments');
            return;
        }

        const comments = await response.json();
        const commentsContainer = document.getElementById('comments-container');
        commentsContainer.innerHTML = comments.map(comment => `
            <div class="comment">
                <p>${comment.comment}</p>
                <small>By ${comment.author}</small>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading comments:', error);
    }
};

const displayComment = (comment) => {
    const commentsContainer = document.getElementById('comments-container');
    commentsContainer.insertAdjacentHTML('beforeend', `
        <div class="comment">
            <p>${comment.comment}</p>
            <small>By ${comment.author}</small>
        </div>
    `);
};

document.addEventListener('DOMContentLoaded', () => {
    // Event listeners for navigation bar
    const settingsButton = document.getElementById('settings-button');
    if (settingsButton) {
        settingsButton.addEventListener('click', () => {
            window.location.href = '/settings';
        });
    }

    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', async () => {
            try {
                const response = await fetch('/users/logout', {
                    method: 'POST',
                    credentials: 'same-origin'
                });
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                window.location.href = '/login';
            } catch (error) {
                console.error('Error logging out:', error);
            }
        });
    }

    const profileButton = document.getElementById('profile-username');
    if (profileButton) {
        profileButton.addEventListener('click', () => {
            window.location.href = '/profile';
        });
    }

    const profilePicButton = document.getElementById('profile-pic');
    if (profilePicButton) {
        profilePicButton.addEventListener('click', () => {
            window.location.href = '/profile';
        });
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

    setupThemeSwitch();

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

    fetchAndDisplayUserData();

    document.addEventListener('DOMContentLoaded', () => {
        fetchAndDisplayUserData();
        setupThemeSwitch();
    });
});