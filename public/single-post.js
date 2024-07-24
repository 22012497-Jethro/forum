document.addEventListener('DOMContentLoaded', (event) => {
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

        const response = await fetch('/comments/addComment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ user_id: userId, post_id: postId, comment: commentText }),
        });

        if (response.ok) {
            const newComment = await response.json();
            displayComment(newComment[0]); // Assuming the response is an array with the new comment as the first element
            document.getElementById('comment-text').value = ''; // Clear the comment form
        } else {
            console.error('Failed to add comment');
        }
    });
});

function getPostId() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('post_id');
}

function getUserId() {
    return document.getElementById('profile-username').dataset.userId;
}

function loadPost() {
    const postId = getPostId();
    fetch(`/posts/${postId}`)
        .then(response => response.json())
        .then(post => {
            if (!post) {
                console.error('No post found');
                return;
            }
            const postElement = document.getElementById('post-container');
            postElement.innerHTML = `
                <h1>${post.title || 'No title'}</h1>
                <p>${post.caption || 'No caption'}</p>
                <img src="${post.image || 'default-image.png'}" alt="${post.title || 'No title'}" />
            `;
        })
        .catch(error => console.error('Error loading post:', error));
}

async function loadComments() {
    const postId = getPostId();
    const response = await fetch(`/comments?post_id=${postId}`);
    const comments = await response.json();
    comments.forEach(comment => displayComment(comment));
}

function displayComment(comment) {
    const commentsSection = document.getElementById('comments-section');
    const commentElement = document.createElement('div');
    commentElement.classList.add('comment');
    commentElement.innerHTML = `
        <p>${comment.comment}</p>
        <small>By User ${comment.user_id} on ${new Date(comment.created_at).toLocaleString()}</small>
    `;
    commentsSection.appendChild(commentElement);
}

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

    document.addEventListener('DOMContentLoaded', () => {
        fetchAndDisplayUserData();
        setupThemeSwitch();
    });
});