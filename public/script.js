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
            const response = await fetch('/posts/latest-posts');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const posts = await response.json();
            console.log('Fetched posts:', posts); // Debugging line

            const postsContainer = document.getElementById('posts-container');
            postsContainer.innerHTML = ''; // Clear previous posts if any
    
            // Display only the 3 latest posts
            for (const post of posts) {
                const userResponse = await fetch(/users/user-profile?id=${post.user_id});
                const userData = await userResponse.json();

                const postElement = document.createElement('div');
                postElement.classList.add('post');
                postElement.innerHTML = `
                    <div class="post-header">
                        <img src="${userData.pfp || 'default-profile.png'}" alt="Profile Picture">
                        <span class="username">${userData.username}</span>
                    </div>
                    ${post.image ? `<img src="${post.image}" alt="Post Image">` : ''}
                    <p>${post.caption}</p>
                `;
                postsContainer.appendChild(postElement);
            }
        } catch (error) {
            console.error('Error fetching posts:', error);
        }
    }

    fetchAndDisplayUserData();
    setupThemeSwitch();
    fetchAndDisplayPosts();
});
