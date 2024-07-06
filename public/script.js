document.addEventListener('DOMContentLoaded', () => {
    const themeSwitch = document.getElementById('theme-switch');
    const logo = document.getElementById('nav-logo');
    const profilePic = document.getElementById('profile-pic');
    const profileUsername = document.getElementById('profile-username');

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

    themeSwitch.addEventListener('click', () => {
        if (document.body.classList.contains('light-mode')) {
            document.body.classList.remove('light-mode');
            document.body.classList.add('dark-mode');
            logo.src = 'logo-light.png';
        } else {
            document.body.classList.remove('dark-mode');
            document.body.classList.add('light-mode');
            logo.src = 'logo-dark.png';
        }
    });

    // Initialize the correct logo on page load
    if (document.body.classList.contains('dark-mode')) {
        logo.src = 'logo-light.png';
    } else {
        logo.src = 'logo-dark.png';
    }
});
