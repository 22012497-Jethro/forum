document.addEventListener('DOMContentLoaded', async () => {
    await loadUserProfile();

    document.getElementById('settings-form').addEventListener('submit', async (event) => {
        event.preventDefault();

        const formData = new FormData();
        formData.append('username', document.getElementById('username').value);
        formData.append('email', document.getElementById('email').value);
        const pfp = document.getElementById('pfp').files[0];
        if (pfp) {
            formData.append('pfp', pfp);
        }

        const response = await fetch('/users/update-profile', {
            method: 'POST',
            body: formData,
        });

        const result = await response.json();
        if (response.ok) {
            alert('Profile updated successfully');
        } else {
            document.getElementById('error-message').innerText = result.message;
        }
    });
});

async function loadUserProfile() {
    const response = await fetch('/users/user-profile');
    if (response.ok) {
        const userProfile = await response.json();
        document.getElementById('username').value = userProfile.username;
        document.getElementById('email').value = userProfile.email;
    } else {
        console.error('Error loading user profile');
    }
}
