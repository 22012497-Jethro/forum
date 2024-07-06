document.addEventListener('DOMContentLoaded', () => {
    const themeSwitch = document.getElementById('theme-switch');
    const logo = document.getElementById('nav-logo');
    const profilePic = document.getElementById('profile-pic');
    const profileUsername = document.getElementById('profile-username');
    const logoutOption = document.querySelector('.dropdown-content p:last-child');

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

    // Initialize the correct logo on page load
    if (document.body.classList.contains('dark-mode')) {
        logo.src = 'logo-light.png';
    } else {
        logo.src = 'logo-dark.png';
    }

    // Handle logout click
    logoutOption.addEventListener('click', () => {
        window.location.href = '/logout';
    });
});
