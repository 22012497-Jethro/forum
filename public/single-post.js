document.addEventListener('DOMContentLoaded', async () => {
    const postId = new URLSearchParams(window.location.search).get('id');
    if (!postId) {
        document.body.innerHTML = '<h1>Post ID is missing!</h1>';
        console.error('Post ID is missing from the URL');
        return;
    }

    try {
        const response = await fetch(`/posts/${postId}`);
        if (!response.ok) {
            document.body.innerHTML = `<h1>Post not found! Status: ${response.status}</h1>`;
            console.error(`Failed to fetch post. Status: ${response.status}, StatusText: ${response.statusText}`);
            return;
        }
        const post = await response.json();
        console.log(`Post fetched successfully: ${JSON.stringify(post)}`);

        // Populate the post details
        document.getElementById('title').innerText = post.title;
        document.getElementById('caption').innerText = post.caption;
        document.getElementById('image').src = post.image || 'default-image.png';
        document.getElementById('category').innerText = post.category;
        document.getElementById('theme').innerText = post.theme;
        document.getElementById('rooms').innerText = post.rooms;
        document.getElementById('room_category').innerText = post.room_category;
        document.getElementById('created_at').innerText = new Date(post.created_at).toLocaleString();

        // Display the user who posted
        document.getElementById('post-username').innerText = post.user.username;
        document.getElementById('post-profile-pic').src = post.user.pfp || 'default-profile.png';

        // Fetch and display comments
        await fetchAndDisplayComments(postId);
    } catch (error) {
        console.error('Error fetching post data:', error);
        document.body.innerHTML = '<h1>There was an error fetching the post data.</h1>';
    }

    setupThemeSwitch(); // Initialize theme switcher
    fetchAndDisplayUserData(); // Fetch and display logged-in user data

    setupDropdown(); // Initialize dropdown functionality

    // Handle comment form submission
    const commentForm = document.getElementById('comment-form');
    commentForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        await postComment(postId);
    });
});

async function fetchAndDisplayComments(postId) {
    try {
        const response = await fetch(`/posts/${postId}/comments`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const comments = await response.json();
        console.log('Fetched comments:', comments);

        const commentsContainer = document.getElementById('comments-container');
        commentsContainer.innerHTML = ''; // Clear previous comments
        comments.forEach(comment => {
            const commentElement = document.createElement('div');
            commentElement.className = 'comment';
            commentElement.innerHTML = `
                <p><strong>${comment.username}</strong> (${new Date(comment.created_at).toLocaleString()}):</p>
                <p>${comment.text}</p>
            `;
            commentsContainer.appendChild(commentElement);
        });
    } catch (error) {
        console.error('Error fetching comments:', error);
    }
}

async function postComment(postId) {
    const commentText = document.getElementById('comment-text').value;
    if (!commentText) {
        return;
    }

    try {
        const response = await fetch(`/posts/${postId}/comments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ text: commentText })
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        // Clear the comment box and refresh comments
        document.getElementById('comment-text').value = '';
        await fetchAndDisplayComments(postId);
    } catch (error) {
        console.error('Error posting comment:', error);
    }
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

function applyTheme(theme) {
    document.body.className = theme;
    const logo = document.getElementById('nav-logo');
    logo.src = theme === 'dark-mode' ? 'logo-light.png' : 'logo-dark.png';
    localStorage.setItem('theme', theme);
}

async function fetchAndDisplayUserData() {
    try {
        const response = await fetch('/users/user-profile');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        console.log('Fetched user data:', data);
        if (data) {
            document.getElementById('profile-username').textContent = data.username;
            document.getElementById('profile-pic').src = data.pfp || 'default-profile.png';
        }
    } catch (error) {
        console.error('Error fetching user data:', error);
    }
}

function setupDropdown() {
    const profilePic = document.getElementById('profile-pic');
    const dropdownContent = document.querySelector('.dropdown-content');

    profilePic.addEventListener('click', () => {
        dropdownContent.classList.toggle('show');
    });

    window.onclick = function(event) {
        if (!event.target.matches('#profile-pic') && !event.target.matches('#profile-username')) {
            if (dropdownContent.classList.contains('show')) {
                dropdownContent.classList.remove('show');
            }
        }
    };

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
}
