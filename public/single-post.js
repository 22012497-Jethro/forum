document.addEventListener('DOMContentLoaded', async () => {
    const postId = new URLSearchParams(window.location.search).get('id');
    if (!postId) {
        document.body.innerHTML = '<h1>Post ID is missing!</h1>';
        return;
    }

    try {
        const response = await fetch(`/posts/${postId}`);
        if (!response.ok) {
            document.body.innerHTML = '<h1>Post not found!</h1>';
            return;
        }
        const post = await response.json();

        document.getElementById('title').innerText = post.title;
        document.getElementById('caption').innerText = post.caption;
        document.getElementById('image').src = post.image;
        document.getElementById('category').innerText = post.category;
        document.getElementById('theme').innerText = post.theme;
        document.getElementById('rooms').innerText = post.rooms;
        document.getElementById('room_category').innerText = post.room_category;
        document.getElementById('created_at').innerText = new Date(post.created_at).toLocaleString();
    } catch (error) {
        console.error('Error fetching post data:', error);
        document.body.innerHTML = '<h1>There was an error fetching the post data.</h1>';
    }
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
        console.log('Fetched user data:', data); // Debugging line
        if (data) {
            document.getElementById('profile-username').textContent = data.username;
            document.getElementById('profile-pic').src = data.pfp || 'default-profile.png';
        }
    } catch (error) {
        console.error('Error fetching user data:', error);
    }
}
