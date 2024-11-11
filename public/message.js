let selectedReceiverId = null;

document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname === '/messages') {
        loadConversations();
        
        const searchInput = document.getElementById('username-search');
        const messageForm = document.getElementById('message-form');

        if (searchInput) {
            searchInput.addEventListener('input', searchUser); // Trigger search on input change
        }

        if (messageForm) {
            messageForm.addEventListener('submit', sendMessage);
        }
    }
});

// Function to load conversations
async function loadConversations() {
    try {
        const response = await fetch(`/messages/conversations`);
        if (!response.ok) throw new Error('Failed to load conversations');
        
        const users = await response.json();
        const conversationsSection = document.getElementById('conversations-section');
        conversationsSection.innerHTML = '';

        users.forEach(user => {
            const conversationLink = document.createElement('div');
            conversationLink.className = 'conversation';
            conversationLink.textContent = user.username;
            conversationLink.addEventListener('click', () => {
                selectedReceiverId = user.id;
                loadConversation(selectedReceiverId);
            });
            conversationsSection.appendChild(conversationLink);
        });
    } catch (error) {
        console.error('Error loading conversations:', error);
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
    if (!messageContent.trim()) return;

    try {
        const response = await fetch('/messages/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ receiver_id: selectedReceiverId, message_content: messageContent })
        });

        if (response.ok) {
            loadConversation(selectedReceiverId);
            document.getElementById('message-input').value = '';
        } else {
            console.error('Failed to send message');
        }
    } catch (error) {
        console.error('Error sending message:', error);
    }
}

// Function to search for users by username
async function searchUser() {
    const username = document.getElementById('username-search').value.trim();
    if (!username) {
        document.getElementById('search-results').innerHTML = '';
        return;
    }

    try {
        const response = await fetch(`/messages/search?username=${encodeURIComponent(username)}`);
        if (!response.ok) throw new Error('Failed to search for user');

        const users = await response.json();
        const searchResults = document.getElementById('search-results');
        searchResults.innerHTML = '';

        users.forEach(user => {
            const userElement = document.createElement('div');
            userElement.className = 'search-result-item';
            userElement.textContent = user.username;
            userElement.addEventListener('click', () => {
                selectedReceiverId = user.id;
                loadConversation(selectedReceiverId);
                searchResults.innerHTML = '';
                document.getElementById('username-search').value = '';
            });
            searchResults.appendChild(userElement);
        });

        if (users.length === 0) {
            const noResults = document.createElement('div');
            noResults.className = 'no-results';
            noResults.textContent = 'No users found';
            searchResults.appendChild(noResults);
        }
    } catch (error) {
        console.error('Error searching for user:', error);
    }
}
