let selectedReceiverId = null;
let debounceTimeout;

document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname === '/messages') {
        loadConversations();

        const searchInput = document.getElementById('username-search');
        const searchButton = document.getElementById('search-button'); // Search button
        const messageForm = document.getElementById('message-form');

        if (searchInput) {
            searchInput.addEventListener('input', debounce(searchUser, 300)); // Debounce on input
        }

        if (searchButton) {
            searchButton.addEventListener('click', searchUser); // Trigger search on button click
        }

        if (messageForm) {
            messageForm.addEventListener('submit', sendMessage);
        }
    }
});

// Debounce function to delay search until user stops typing
function debounce(func, delay) {
    return function (...args) {
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(() => func(...args), delay);
    };
}

// Function to search for users by username
async function searchUser() {
    const username = document.getElementById('username-search').value.trim();
    const searchResults = document.getElementById('search-results');

    if (!username) {
        searchResults.innerHTML = ''; // Clear results if input is empty
        return;
    }

    try {
        const response = await fetch(`/messages/search?username=${encodeURIComponent(username)}`);
        const users = await response.json();

        searchResults.innerHTML = ''; // Clear previous results
        console.log('Search results:', users); // Log the users to check the response

        if (users.length === 0) {
            searchResults.innerHTML = '<div class="no-results">No users found</div>';
        } else {
            users.forEach(user => {
                const userElement = document.createElement('div');
                userElement.className = 'search-result-item';
                userElement.textContent = user.username;
                searchResults.appendChild(userElement);
            });
        }
    } catch (error) {
        console.error('Error searching for user:', error);
    }
}

// Function to load a specific conversation
async function loadConversation(receiverId) {
    try {
        const response = await fetch(`/messages/conversation/${receiverId}`);
        if (!response.ok) throw new Error('Failed to load conversation');
        
        const { messages } = await response.json();
        const messageDisplay = document.getElementById('message-display');
        messageDisplay.innerHTML = '';

        messages.forEach(message => {
            const messageElement = document.createElement('div');
            messageElement.className = message.sender_id === receiverId ? 'message-received' : 'message-sent';
            messageElement.textContent = message.message_content;
            messageDisplay.appendChild(messageElement);
        });
    } catch (error) {
        console.error('Error loading conversation:', error);
    }
}

// Function to send a new message
async function sendMessage(event) {
    event.preventDefault();

    if (!selectedReceiverId) {
        console.error('No receiver selected');
        return;
    }

    const messageContent = document.getElementById('message-input').value;
    if (!messageContent.trim()) return; // Prevent sending empty messages

    try {
        const response = await fetch('/messages/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ receiver_id: selectedReceiverId, message_content: messageContent })
        });

        if (response.ok) {
            loadConversation(selectedReceiverId); // Reload the conversation after sending
            document.getElementById('message-input').value = ''; // Clear the input field
        } else {
            console.error('Failed to send message');
        }
    } catch (error) {
        console.error('Error sending message:', error);
    }
}
