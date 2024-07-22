document.addEventListener('DOMContentLoaded', () => {
    const editForm = document.getElementById('edit-post-form');
    const postId = new URLSearchParams(window.location.search).get('id');

    // Fetch post data and populate the form
    async function fetchPostData() {
        try {
            const response = await fetch(`/posts/${postId}`);
            const post = await response.json();

            document.getElementById('post-id').value = post.id;
            document.getElementById('title').value = post.title;
            document.getElementById('caption').value = post.caption;
            if (post.image) {
                document.getElementById('image-preview').src = post.image;
            }
        } catch (error) {
            console.error('Error fetching post data:', error);
        }
    }

    // Handle form submission
    editForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const formData = new FormData(editForm);
        formData.append('post_id', postId);

        try {
            const response = await fetch(`/posts/${postId}/edit`, {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                alert('Post updated successfully');
                window.location.href = '/profile';
            } else {
                alert('Error updating post');
            }
        } catch (error) {
            console.error('Error updating post:', error);
        }
    });

    // Handle cancel button
    document.getElementById('cancel-edit-button').addEventListener('click', () => {
        window.location.href = '/profile';
    });

    // Fetch the post data to populate the form
    fetchPostData();
});
