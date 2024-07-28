ddocument.addEventListener('DOMContentLoaded', async () => {
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

        // Create a container div with the single-post-container class
        const container = document.createElement('div');
        container.className = 'single-post-container';

        // Populate the post details inside the container
        container.innerHTML = `
            <h1 id="title">${post.title}</h1>
            <img id="image" src="${post.image || 'default-image.png'}" alt="Post Image">
            <p id="caption">${post.caption}</p>
            <p>Category: <span id="category">${post.category}</span></p>
            <p>Theme: <span id="theme">${post.theme}</span></p>
            <p>Rooms: <span id="rooms">${post.rooms}</span></p>
            <p>Room Category: <span id="room_category">${post.room_category}</span></p>
            <p>Created at: <span id="created_at">${new Date(post.created_at).toLocaleString()}</span></p>
            <div class="user-info">
                <img id="post-profile-pic" src="default-profile.png" alt="Profile Picture">
                <span id="post-username">Username</span>
            </div>
            <a href="index.html">Back to Home</a>
        `;

        // Append the container to the body
        document.body.appendChild(container);

        // Display the user who posted
        const userResponse = await fetch(`/users/${post.user_id}`);
        if (userResponse.ok) {
            const user = await userResponse.json();
            document.getElementById('post-username').innerText = user.username;
            document.getElementById('post-profile-pic').src = user.pfp || 'default-profile.png';
        }
    } catch (error) {
        console.error('Error fetching post data:', error);
        document.body.innerHTML = '<h1>There was an error fetching the post data.</h1>';
    }

    setupThemeSwitch(); // Initialize theme switcher
    fetchAndDisplayUserData(); // Fetch and display logged-in user data
});


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
