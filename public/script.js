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

    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
        signupForm.addEventListener('submit', signup);
    }

    // Fetch user profile data for settings page
    async function fetchAndDisplayUserProfile() {
        try {
            const response = await fetch('/users/profile');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const profile = await response.json();
            console.log('Fetched user profile:', profile); // Debugging line
            if (profile) {
                document.getElementById('username').value = profile.username;
                document.getElementById('email').value = profile.email;
            }
        } catch (error) {
            console.error('Error fetching user profile:', error);
        }
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

    // Fetch posts with optional filters
    async function fetchAndDisplayPosts(page, titleFilter = '', categoryFilter = '') {
        try {
            const response = await fetch(`/posts?page=${page}&limit=10&title=${titleFilter}&category=${categoryFilter}`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const posts = await response.json();
            displayPosts(posts);
            setupPagination(page, titleFilter, categoryFilter);
        } catch (error) {
            console.error('Error fetching posts:', error);
        }
    }

    // Fetch and display user posts
    async function fetchAndDisplayUserPosts() {
        try {
            const response = await fetch('/users/user-posts');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const posts = await response.json();
            displayUserPosts(posts);
        } catch (error) {
            console.error('Error fetching user posts:', error);
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
                    <h3 class="post-title"><strong><a href="single-post.html?id=${post.id}">${post.title}</a></strong></h3>
                    ${post.image ? `<img src="${post.image}" alt="Post Image" class="post-image">` : ''}
                    <p>${post.caption}</p>
                </div>
            `;
            postsContainer.appendChild(postElement);
        });
    }

    function displayUserPosts(posts) {
        const userPostsContainer = document.getElementById('user-posts-container');
        userPostsContainer.innerHTML = '';

        posts.forEach(post => {
            const postElement = document.createElement('div');
            postElement.classList.add('post');
            postElement.innerHTML = `
                <div class="post-details">
                    <h3 class="post-title"><strong>${post.title}</strong></h3>
                    ${post.image ? `<img src="${post.image}" alt="Post Image" class="post-image">` : ''}
                    <p>${post.caption}</p>
                    <p><small>Created at: ${new Date(post.created_at).toLocaleString()}</small></p>
                    <div class="post-actions">
                        <button class="edit-post-button" data-post-id="${post.id}">Edit Post</button>
                        <button class="delete-post-button" data-post-id="${post.id}" data-image-url="${post.image}">Delete Post</button>
                    </div>
                </div>
            `;
            userPostsContainer.appendChild(postElement);
        });

        // Attach event listeners to edit buttons
        const editButtons = document.querySelectorAll('.edit-post-button');
        editButtons.forEach(button => {
            button.addEventListener('click', handleEditPost);
        });

        // Attach event listeners to delete buttons
        const deleteButtons = document.querySelectorAll('.delete-post-button');
        deleteButtons.forEach(button => {
            button.addEventListener('click', handleDeletePost);
        });
    }

    function handleEditPost(event) {
        const postId = event.target.getAttribute('data-post-id');
        window.location.href = `/edit.html?postId=${postId}`;
    }

    async function handleDeletePost(event) {
        const postId = event.target.getAttribute('data-post-id');
        const imageUrl = event.target.getAttribute('data-image-url');

        if (confirm('Are you sure you want to delete this post?')) {
            try {
                const response = await fetch(`/posts/${postId}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ image_url: imageUrl })
                });

                if (!response.ok) {
                    throw new Error('Error deleting post');
                }

                alert('Post deleted successfully');
                fetchAndDisplayUserPosts(); // Refresh the posts
            } catch (error) {
                console.error('Error deleting post:', error);
            }
        }
    }

    async function fetchPostDetails(postId) {
        try {
            const response = await fetch(`/posts/${postId}`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const post = await response.json();

            // Fill the form with post details
            document.getElementById('edit-post-id').value = post.id;
            document.getElementById('edit-post-title').value = post.title;
            document.getElementById('edit-post-caption').value = post.caption;
            document.getElementById('edit-post-image').value = post.image;
        } catch (error) {
            console.error('Error fetching post details:', error);
        }
    }

    async function updatePost(event) {
        event.preventDefault();

        const postId = document.getElementById('edit-post-id').value;
        const title = document.getElementById('edit-post-title').value;
        const caption = document.getElementById('edit-post-caption').value;
        const image = document.getElementById('edit-post-image').value;

        try {
            const response = await fetch(`/posts/${postId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ title, caption, image })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message);
            }

            alert('Post updated successfully');
            window.location.href = '/profile'; // Redirect to profile page after successful update
        } catch (error) {
            console.error('Error updating post:', error);
            alert(error.message); // Display error message to the user
        }
    }

    const editPostForm = document.getElementById('edit-post-form');
    if (editPostForm) {
        editPostForm.addEventListener('submit', updatePost);
    }

    // Check if on edit.html page and load post details
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('postId');
    if (postId) {
        fetchPostDetails(postId);
    }

    function setupPagination(currentPage, titleFilter = '', categoryFilter = '') {
        const paginationContainer = document.getElementById('pagination-container');
        paginationContainer.innerHTML = '';

        for (let i = 1; i <= 10; i++) {
            const pageButton = document.createElement('button');
            pageButton.textContent = i;
            if (i === currentPage) {
                pageButton.disabled = true;
            }
            pageButton.onclick = () => fetchAndDisplayPosts(i, titleFilter, categoryFilter);
            paginationContainer.appendChild(pageButton);
        }
    }

    // Filter button event listener
    const filterButton = document.getElementById('filter-button');
    if (filterButton) {
        filterButton.addEventListener('click', () => {
            const titleFilter = document.getElementById('filter-title').value;
            const categoryFilter = document.getElementById('filter-category').value;
            console.log('Filters applied - Title:', titleFilter, 'Category:', categoryFilter); // Debugging line
            fetchAndDisplayPosts(1, titleFilter, categoryFilter);
        });
    }

    // Navigate to settings page
    function goToSettings() {
        window.location.href = '/settings';
    }

    // Back to homepage function
    function goToHomePage() {
        window.location.href = '/main';
    }

    function goToProfile() {
        window.location.href = '/profile';
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

    const profileButton = document.getElementById('profile-username');
    if (profileButton) {
        profileButton.addEventListener('click', goToProfile);
    }

    const profilePicButton = document.getElementById('profile-pic');
    if (profilePicButton) {
        profilePicButton.addEventListener('click', goToProfile);
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
    if (window.location.pathname === '/profile') {
        fetchAndDisplayUserPosts();
    }
});
