document.addEventListener('DOMContentLoaded', () => {
    // Back to homepage function
    function goToHomePage() {
        window.location.href = '/main';
    }

    const backToHomepageButton = document.getElementById('back-to-homepage');
    if (backToHomepageButton) {
        backToHomepageButton.addEventListener('click', goToHomePage);
    }

    // Fetch post data and populate form
    async function fetchPostData() {
        const urlParams = new URLSearchParams(window.location.search);
        const postId = urlParams.get('id');

        try {
            const response = await fetch(`/posts/${postId}`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const post = await response.json();
            populateForm(post);
        } catch (error) {
            console.error('Error fetching post data:', error);
        }
    }

    function populateForm(post) {
        document.getElementById('post-title').value = post.title;
        document.getElementById('post-caption').value = post.caption;
        document.getElementById('post-category').value = post.category;
        document.getElementById('post-theme').value = post.theme || '';
        document.getElementById('post-rooms').value = post.number_of_rooms || 1;
        document.getElementById('post-room-category').value = post.room_category || '';
        document.getElementById('current-image').src = post.image || '';
        document.getElementById('current-image').style.display = post.image ? 'block' : 'none';
    }

    // Update post function
    async function updatePost(event) {
        event.preventDefault();

        const urlParams = new URLSearchParams(window.location.search);
        const postId = urlParams.get('id');

        const formData = new FormData(event.target);
        const postDetails = {
            title: formData.get('title'),
            caption: formData.get('caption'),
            category: formData.get('category'),
            theme: formData.get('theme'),
            number_of_rooms: formData.get('rooms'),
            room_category: formData.get('room_category'),
            image: formData.get('image') // only include image if it is provided
        };

        try {
            const response = await fetch(`/posts/${postId}`, {
                method: 'PUT',
                body: formData // send the FormData directly
            });

            if (!response.ok) {
                throw new Error('Error updating post');
            }

            alert('Post updated successfully');
            window.location.href = '/profile';
        } catch (error) {
            console.error('Error updating post:', error);
            alert('Error updating post');
        }
    }

    const editPostForm = document.getElementById('edit-post-form');
    if (editPostForm) {
        editPostForm.addEventListener('submit', updatePost);
    }

    fetchPostData();

    // Event listeners for navigation bar
    const settingsButton = document.getElementById('settings-button');
    if (settingsButton) {
        settingsButton.addEventListener('click', () => {
            window.location.href = '/settings';
        });
    }

    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', async () => {
            try {
                const response = await fetch('/users/logout', {
                    method: 'POST',
                    credentials: 'same-origin'
                });
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                window.location.href = '/login';
            } catch (error) {
                console.error('Error logging out:', error);
            }
        });
    }

    const profileButton = document.getElementById('profile-username');
    if (profileButton) {
        profileButton.addEventListener('click', () => {
            window.location.href = '/profile';
        });
    }

    const profilePicButton = document.getElementById('profile-pic');
    if (profilePicButton) {
        profilePicButton.addEventListener('click', () => {
            window.location.href = '/profile';
        });
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

    setupThemeSwitch();

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

    fetchAndDisplayUserData();
});
