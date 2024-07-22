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
            room_category: formData.get('room_category')
        };

        try {
            const response = await fetch(`/posts/${postId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(postDetails)
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
});
