document.addEventListener('DOMContentLoaded', (event) => {
    loadPost();
    loadComments();

    document.getElementById('comment-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const commentText = document.getElementById('comment-text').value;
        const postId = getPostId();
        const userId = getUserId();

        if (commentText.trim() === "") {
            alert("Comment cannot be empty.");
            return;
        }

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
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('post_id');
}

function getUserId() {
    return document.getElementById('profile-username').dataset.userId;
}

function loadPost() {
    const postId = getPostId();
    fetch(`/posts/${postId}`)
        .then(response => response.json())
        .then(post => {
            const postElement = document.getElementById('post-container');
            postElement.innerHTML = `<h1>${post.title}</h1><p>${post.content}</p>`;
        })
        .catch(error => console.error('Error loading post:', error));
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
    commentElement.innerHTML = `
        <p>${comment.comment}</p>
        <small>By User ${comment.user_id} on ${new Date(comment.created_at).toLocaleString()}</small>
    `;
    commentsSection.appendChild(commentElement);
}
