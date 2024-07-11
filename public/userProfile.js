async function fetchAndDisplayUserData() {
    try {
        const response = await fetch('/users/user-data');
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

document.addEventListener('DOMContentLoaded', () => {
    fetchAndDisplayUserData();
    setupThemeSwitch();
});
