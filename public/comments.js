document.addEventListener('DOMContentLoaded', (event) => {
    loadPost();
    loadComments();

    document.getElementById('comment-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const commentText = document.getElementById('comment-text').value;
        const postId = getPostId();
        const userId = getUserId();

        const response = await fetch('/comments/addComment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ user_id: userId, post_id: postId, comment: commentText }),
        });

        if (response.ok) {
            const newComment = await response.json();
            displayComment(newComment[0]); // Assuming the response is an array with the new comment as the first element
            document.getElementById('comment-text').value = ''; // Clear the comment form
        } else {
            console.error('Failed to add comment');
        }
    });
});

function getPostId() {
    // Function to retrieve the current post ID from the URL or page context
    // Replace with your actual implementation
    return 1; // Example post ID
}

function getUserId() {
    // Function to retrieve the current user ID from the session or page context
    // Replace with your actual implementation
    return 1; // Example user ID
}

function loadPost() {
    // Function to load the post content dynamically
    // Replace with your actual implementation
    const post = {
        title: 'Sample Post',
        content: 'This is a sample post content.'
    };
    const postElement = document.getElementById('post-container');
    postElement.innerHTML = `<h1>${post.title}</h1><p>${post.content}</p>`;
}

async function loadComments() {
    const postId = getPostId();
    const response = await fetch(`/comments?post_id=${postId}`);
    const comments = await response.json();
    comments.forEach(comment => displayComment(comment));
}

function displayComment(comment) {
    const commentsSection = document.getElementById('comments-section');
    const commentElement = document.createElement('div');
    commentElement.classList.add('comment');
    commentElement.textContent = comment.comment;
    commentsSection.appendChild(commentElement);
}
