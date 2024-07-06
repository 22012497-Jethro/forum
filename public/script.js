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

    // Function to apply the theme
    function applyTheme(theme) {
        if (theme === 'dark-mode') {
            document.body.classList.add('dark-mode');
            document.body.classList.remove('light-mode');
            logo.src = 'logo-light.png';
        } else {
            document.body.classList.add('light-mode');
            document.body.classList.remove('dark-mode');
            logo.src = 'logo-dark.png';
        }
    }

    // Load theme from localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        applyTheme(savedTheme);
    } else {
        // Set default theme to light-mode if not set
        applyTheme('light-mode');
    }

    themeSwitch.addEventListener('click', () => {
        if (document.body.classList.contains('light-mode')) {
            localStorage.setItem('theme', 'dark-mode');
            applyTheme('dark-mode');
        } else {
            localStorage.setItem('theme', 'light-mode');
            applyTheme('light-mode');
        }
    });

    // Handle logout click
    logoutOption.addEventListener('click', () => {
        window.location.href = '/logout';
    });
});
