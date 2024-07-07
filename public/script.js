document.addEventListener('DOMContentLoaded', () => {
    const themeSwitch = document.getElementById('theme-switch');
    const createPostButton = document.getElementById('create-post-button');
    const postModal = document.getElementById('post-modal');
    const closeButton = document.querySelector('.close-button');
    const logo = document.getElementById('nav-logo');
    const profilePic = document.getElementById('profile-pic');
    const profileUsername = document.getElementById('profile-username');
    const logoutOption = document.querySelector('.dropdown-content p:last-child');
    const postForm = document.getElementById('post-form');
    const postsContainer = document.getElementById('posts-container');

    // Parse URL parameters to get username and profile picture URL
    const urlParams = new URLSearchParams(window.location.search);
    const username = urlParams.get('username');
    const pfp = urlParams.get('pfp');

    if (username) {
        profileUsername.textContent = username;
    }

    if (pfp) {
        profilePic.src = decodeURIComponent(pfp);
    }

    // Load theme from localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.body.classList.add(savedTheme);
        logo.src = savedTheme === 'dark-mode' ? 'logo-light.png' : 'logo-dark.png';
    } else {
        // Set default theme to light-mode if not set
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

    // Handle modal open and close
    createPostButton.addEventListener('click', () => {
        postModal.style.display = 'block';
    });

    closeButton.addEventListener('click', () => {
        postModal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target === postModal) {
            postModal.style.display = 'none';
        }
    });

    // Handle post creation
    postForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(postForm);
        const response = await fetch('/create-post', {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            const newPost = await response.json();
            displayPost(newPost);
            postForm.reset();
            postModal.style.display = 'none';
        } else {
            alert('Failed to create post');
        }
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
        const response = await fetch('/posts');
        const posts = await response.json();
        posts.forEach(displayPost);
    }

    loadPosts();
});
