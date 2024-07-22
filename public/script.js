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

    // Signup function
    async function signup(event) {
        event.preventDefault();

        const formData = new FormData(event.target);
        const username = formData.get('username');
        const email = formData.get('email');
        const password = formData.get('password');
        const confirmPassword = formData.get('confirm-password');

        if (password !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }

        try {
            const response = await fetch('/users/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, email, password })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message);
            }

            // Redirect to login page after successful signup
            window.location.href = '/login';
        } catch (error) {
            console.error('Error signing up:', error);
            alert(error.message); // Display error message to the user
        }
    }

    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
        signupForm.addEventListener('submit', signup);
    }

    // Update profile function
    async function updateProfile(event) {
        event.preventDefault();

        const formData = new FormData(event.target);
        const response = await fetch('/users/update-profile', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const errorData = await response.json();
            alert(errorData.message);
            return;
        }

        alert('Profile updated successfully');
        window.location.href = '/main'; // Redirect to main page after successful update
    }

    const settingsForm = document.getElementById('settings-form');
    if (settingsForm) {
        settingsForm.addEventListener('submit', updateProfile);
        fetchAndDisplayUserProfile();
    }

    // Fetch user profile data for settings page
    async function fetchAndDisplayPosts(page) {
        try {
            const response = await fetch(`/posts?page=${page}&limit=10`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const posts = await response.json();
            displayPosts(posts);
            setupPagination(page);
        } catch (error) {
            console.error('Error fetching posts:', error);
        }
    }

    function displayPosts(posts) {
        const postsContainer = document.getElementById('posts-container');
        postsContainer.innerHTML = '';

        posts.forEach(post => {
            const postElement = document.createElement('div');
            postElement.classList.add('post');
            postElement.innerHTML = `
                <div class="post-header">
                    <img src="${post.profile_pic || 'default-profile.png'}" alt="Creator's Profile Picture" class="creator-pfp">
                    <span class="post-username">${post.username}</span>
                </div>
                <div class="post-details">
                    <h3 class="post-title"><strong>${post.title}</strong></h3>
                    ${post.image ? `<img src="${post.image}" alt="Post Image" class="post-image">` : ''}
                    <p>${post.caption}</p>
                </div>
            `;
            postsContainer.appendChild(postElement);
        });
    }

    function setupPagination(currentPage) {
        const paginationContainer = document.getElementById('pagination-container');
        paginationContainer.innerHTML = '';

        for (let i = 1; i <= 10; i++) {
            const pageButton = document.createElement('button');
            pageButton.textContent = i;
            if (i === currentPage) {
                pageButton.disabled = true;
            }
            pageButton.onclick = () => fetchAndDisplayPosts(i);
            paginationContainer.appendChild(pageButton);
        }
    }
    // Navigate to settings page
    function goToSettings() {
        window.location.href = '/settings';
    }

    // Back to homepage function
    function goToHomePage() {
        window.location.href = '/main';
    }

    // Ensure the button exists before adding an event listener
    const backToHomepageButton = document.getElementById('back-to-homepage');
    if (backToHomepageButton) {
        backToHomepageButton.addEventListener('click', goToHomePage);
    }

    const settingsButton = document.getElementById('settings-button');
    if (settingsButton) {
        settingsButton.addEventListener('click', goToSettings);
    }

    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', logout);
    }

    // Logout function
    async function logout() {
        try {
            const response = await fetch('/users/logout', {
                method: 'POST',
                credentials: 'same-origin'
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            // Redirect to login page after logout
            window.location.href = '/login';
        } catch (error) {
            console.error('Error logging out:', error);
        }
    }

    document.getElementById('logout-button').addEventListener('click', logout);

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

    fetchAndDisplayUserData();
    setupThemeSwitch();
    fetchAndDisplayPosts(1);
});
