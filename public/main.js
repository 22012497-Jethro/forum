document.addEventListener('DOMContentLoaded', (event) => {
    loadPosts();

    document.getElementById('posts-container').addEventListener('click', (event) => {
        const postElement = event.target.closest('.post');
        if (postElement) {
            const postId = postElement.getAttribute('data-post-id');
            window.location.href = `/post.html?post_id=${postId}`;
        }
    });
});

function loadPosts() {
    fetch('/posts') // Replace with your actual endpoint to fetch posts
        .then(response => response.json())
        .then(posts => {
            const postsContainer = document.getElementById('posts-container');
            postsContainer.innerHTML = ''; // Clear existing posts
            posts.forEach(post => {
                const postElement = document.createElement('div');
                postElement.classList.add('post');
                postElement.setAttribute('data-post-id', post.id);
                postElement.innerHTML = `
                    <h4 class="post-title" onclick="location.href='/post.html?post_id=${post.id}'">${post.title}</h4>
                    <p class="post-content">${post.content}</p>
                `;
                postsContainer.appendChild(postElement);
            });
        })
        .catch(error => console.error('Error loading posts:', error));
}
