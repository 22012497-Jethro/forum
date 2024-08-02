document.addEventListener('DOMContentLoaded', async () => {
    const postId = new URLSearchParams(window.location.search).get('id');
    if (!postId) {
        document.body.innerHTML = '<h1>Post ID is missing!</h1>';
        console.error('Post ID is missing from the URL');
        return;
    }

    try {
        console.log(`Fetching post with ID: ${postId}`);
        const response = await fetch(`/posts/${postId}`);
        if (!response.ok) {
            document.body.innerHTML = `<h1>Post not found! Status: ${response.status}</h1>`;
            console.error(`Failed to fetch post. Status: ${response.status}, StatusText: ${response.statusText}`);
            return;
        }
        const post = await response.json();
        console.log(`Post fetched successfully: ${JSON.stringify(post)}`);

        // Populate the post details conditionally
        populatePostDetails(post);

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

function populatePostDetails(post) {
    const postSection = document.querySelector('.single-post-container');
    postSection.innerHTML = ''; // Clear any existing content

    if (post.user) {
        const user = document.createElement('div');
        user.className = 'post-user';
        user.innerHTML = `
            <img id="post-profile-pic" src="${post.user.pfp || 'default-profile.png'}" alt="Profile Picture">
            <span id="post-username">${post.user.username}</span>
        `;
        postSection.appendChild(user);
    }

    if (post.title) {
        const title = document.createElement('h1');
        title.className = 'post-title';
        title.textContent = post.title;
        postSection.appendChild(title);
    }

    if (post.caption) {
        const caption = document.createElement('p');
        caption.className = 'post-caption';
        caption.textContent = post.caption;
        postSection.appendChild(caption);
    }

    if (post.image) {
        const imageContainer = document.createElement('div');
        imageContainer.id = 'image-container';
        const image = document.createElement('img');
        image.className = 'post-image';
        image.src = post.image;
        image.alt = 'Post Image';
        imageContainer.appendChild(image);
        postSection.appendChild(imageContainer);
    }

    if (post.category) {
        const category = document.createElement('p');
        category.className = 'post-category';
        category.innerHTML = `<strong>Category:</strong> ${post.category}`;
        postSection.appendChild(category);
    }

    if (post.theme) {
        const theme = document.createElement('p');
        theme.className = 'post-theme';
        theme.innerHTML = `<strong>Theme:</strong> ${post.theme}`;
        postSection.appendChild(theme);
    }

    if (post.rooms) {
        const rooms = document.createElement('p');
        rooms.className = 'post-rooms';
        rooms.innerHTML = `<strong>Rooms:</strong> ${post.rooms}`;
        postSection.appendChild(rooms);
    }

    if (post.room_category) {
        const roomCategory = document.createElement('p');
        roomCategory.className = 'post-room-category';
        roomCategory.innerHTML = `<strong>Room Category:</strong> ${post.room_category}`;
        postSection.appendChild(roomCategory);
    }

    if (post.created_at) {
        const createdAt = document.createElement('p');
        createdAt.className = 'post-created-at';
        createdAt.innerHTML = `<strong>Created at:</strong> ${new Date(post.created_at).toLocaleString()}`;
        postSection.appendChild(createdAt);
    }

    const backToHome = document.createElement('a');
    backToHome.href = '/main';
    backToHome.className = 'back-button';
    backToHome.textContent = 'Back to Home';
    postSection.appendChild(backToHome);
}

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
                <p>${comment.comments}</p>
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
