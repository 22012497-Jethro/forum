async function fetchAndDisplayUserData() {
    try {
        const response = await fetch('/users/user-data');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        document.getElementById('profile-username').textContent = data.username;
        document.getElementById('profile-pic').src = data.pfp || 'default-profile.png';
    } catch (error) {
        console.error('Error fetching user data:', error);
    }
}

document.addEventListener('DOMContentLoaded', fetchAndDisplayUserData);
