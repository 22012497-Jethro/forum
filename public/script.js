document.addEventListener('DOMContentLoaded', () => {
    const themeSwitch = document.getElementById('theme-switch');
    const createPostButton = document.getElementById('create-post-button');
    const logo = document.getElementById('nav-logo');
    const profilePic = document.getElementById('profile-pic');
    const profileUsername = document.getElementById('profile-username');
    const logoutOption = document.querySelector('.dropdown-content p');
    const postsContainer = document.getElementById('posts-container');

    // Fetch user profile data
    async function fetchUserProfile() {
        try {
            const response = await fetch('/user-profile');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();

            if (data.username) {
                profileUsername.textContent = data.username;
            } else {
                console.error("Username not found");
            }

            if (data.pfp) {
                profilePic.src = data.pfp;
            } else {
                console.error("Profile picture URL not found");
            }
        } catch (error) {
            console.error("Error fetching user profile:", error);
        }
    }

    fetchUserProfile();

    // Load theme from localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.body.classList.add(savedTheme);
        logo.src = savedTheme === 'dark-mode' ? 'logo-light.png' : 'logo-dark.png';
    } else {
        document.body.classList.add('light-mode');
        logo.src = 'logo-dark.png';
    }

    themeSwitch.addEventListener('click', () => {
        if (document.body.classList.contains('light-mode')) {
            document.body.classList.remove('light-mode');
            document.body.classList.add('dark-mode');
            logo.src = 'logo-light.png';
            localStorage.setItem('theme', 'dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
            document.body.classList.add('light-mode');
            logo.src = 'logo-dark.png';
            localStorage.setItem('theme', 'light-mode');
        }
    });

    // Handle logout click
    logoutOption.addEventListener('click', () => {
        window.location.href = '/logout';
    });

    // Function to display a post
    function displayPost(post) {
        const postElement = document.createElement('div');
        postElement.classList.add('post');
        postElement.innerHTML = `
            <h3>${post.title}</h3>
            <p>${post.caption}</p>
            ${post.image ? `<img src="${post.image}" alt="Post Image">` : ''}
            <p>Category: ${post.category}</p>
            ${post.theme ? `<p>Theme: ${post.theme}</p>` : ''}
            ${post.rooms ? `<p>Number of Rooms: ${post.rooms}</p>` : ''}
            ${post.room_category ? `<p>Room Category: ${post.room_category}</p>` : ''}
        `;
        postsContainer.prepend(postElement);
    }

    // Load existing posts
    async function loadPosts() {
        try {
            const response = await fetch('/posts');
            const posts = await response.json();
            posts.forEach(displayPost);
        } catch (error) {
            console.error('Error loading posts:', error);
        }
    }

    loadPosts();
});
