document.addEventListener('DOMContentLoaded', async () => {
    const postId = new URLSearchParams(window.location.search).get('id');
    if (!postId) {
        document.body.innerHTML = '<h1>Post ID is missing!</h1>';
        console.error('Post ID is missing from the URL');
        return;
    }

    try {
        const response = await fetch(`/posts/${postId}`);
        console.log(`Fetch response status: ${response.status}`);

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
