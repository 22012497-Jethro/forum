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
                <img src="${post.pfp}" alt="Profile Picture">
                <span class="username">${post.username}</span>
            </div>
            ${post.image ? `<img src="${post.image}" alt="Post Image">` : ''}
            <p>${post.caption}</p>
            ${post.category ? `<p>Category: ${post.category}</p>` : ''}
            ${post.theme ? `<p>Theme: ${post.theme}</p>` : ''}
            ${post.rooms ? `<p>Number of Rooms: ${post.rooms}</p>` : ''}
            ${post.room_category ? `<p>Room Category: ${post.room_category}</p>` : ''}
        `;
        document.getElementById('posts-container').appendChild(postElement);
    }

    fetchAndDisplayUserData();
    setupThemeSwitch();
    fetchAndDisplayPosts();
});
