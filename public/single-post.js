document.addEventListener('DOMContentLoaded', async () => {
    const postId = new URLSearchParams(window.location.search).get('id');
    if (!postId) {
        document.body.innerHTML = '<h1>Post ID is missing!</h1>';
        console.error('Post ID is missing from the URL');
        return;
    }

    try {
        const response = await fetch(`/posts/${postId}`);
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
        const supabaseUrl = "https://fudsrzbhqpmryvmxgced.supabase.co";
        const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ1ZHNyemJocXBtcnl2bXhnY2VkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTM5MjE3OTQsImV4cCI6MjAyOTQ5Nzc5NH0.6UMbzoD8J1BQl01h6NSyZAHVhrWerUcD5VVGuBwRcag";
        const supabase = createClient(supabaseUrl, supabaseKey);

        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', post.user_id)
            .single();

        if (error) {
            console.error('Error fetching user data:', error);
            document.getElementById('post-username').innerText = 'Unknown User';
            document.getElementById('post-profile-pic').src = 'default-profile.png';
        } else {
            document.getElementById('post-username').innerText = user.username;
            document.getElementById('post-profile-pic').src = user.pfp || 'default-profile.png';
        }
    } catch (error) {
        console.error('Error fetching post data:', error);
        document.body.innerHTML = '<h1>There was an error fetching the post data.</h1>';
    }

    setupThemeSwitch(); // Initialize theme switcher
    fetchAndDisplayUserData(); // Fetch and display logged-in user data
});

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
