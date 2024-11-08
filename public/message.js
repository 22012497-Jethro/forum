let selectedReceiverId = null; // Global variable to store the selected receiver ID

document.addEventListener('DOMContentLoaded', () => {
    loadConversations();

    // Add event listener to search button
    const searchButton = document.getElementById('search-button');
    if (searchButton) {
        searchButton.addEventListener('click', searchUser);
    }

    // Add event listener to message form for sending messages
    const messageForm = document.getElementById('message-form');
    if (messageForm) {
        messageForm.addEventListener('submit', sendMessage);
    }
});

// Function to load conversations
async function loadConversations() {
    try {
        const response = await fetch(`/messages/conversations`);
        if (!response.ok) throw new Error('Failed to load conversations');
        
        const users = await response.json();
        const conversationsSection = document.getElementById('conversations-section');
        conversationsSection.innerHTML = ''; // Clear previous list

        users.forEach(user => {
            const conversationLink = document.createElement('div');
            conversationLink.className = 'conversation';
            conversationLink.textContent = user.username;
            conversationLink.addEventListener('click', () => {
                selectedReceiverId = user.id; // Set the global receiver ID
                loadConversation(selectedReceiverId); // Load conversation with the selected user
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
        
        const messages = await response.json();
        const messageDisplay = document.getElementById('message-display');
        messageDisplay.innerHTML = ''; // Clear previous messages

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
        return; // Exit if no receiver is selected
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

// Function to search for users by username
async function searchUser() {
    const username = document.getElementById('username-search').value;
    if (!username.trim()) return; // Don't search if input is empty

    try {
        const response = await fetch(`/messages/search?username=${username}`);
        if (!response.ok) throw new Error('Failed to search for user');

        const users = await response.json();
        const searchResults = document.getElementById('search-results');
        searchResults.innerHTML = ''; // Clear previous search results

        users.forEach(user => {
            const userElement = document.createElement('div');
            userElement.className = 'search-result-item';
            userElement.textContent = user.username;
            userElement.addEventListener('click', () => {
                selectedReceiverId = user.id;
                loadConversation(selectedReceiverId); // Load the conversation with the selected user
                searchResults.innerHTML = ''; // Clear search results after selection
            });
            searchResults.appendChild(userElement);
        });
    } catch (error) {
        console.error('Error searching for user:', error);
    }
}
