let selectedReceiverId = null;
let debounceTimeout;

document.addEventListener('DOMContentLoaded', () => {
    // Load existing conversations on page load
    loadConversations();

    const searchInput = document.getElementById('username-search');
    const searchButton = document.getElementById('search-button');
    const messageForm = document.getElementById('message-form');

    if (searchInput) {
        searchInput.addEventListener('input', debounce(searchUser, 300));
    }

    if (searchButton) {
        searchButton.addEventListener('click', searchUser);
    }

    if (messageForm) {
        messageForm.addEventListener('submit', sendMessage);
    }
});

// Debounce function to limit the frequency of API calls
function debounce(func, delay) {
    return function (...args) {
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(() => func(...args), delay);
    };
}

// Function to load the user's conversations
async function loadConversations() {
    try {
        const response = await fetch(`/messages/conversations`);
        if (!response.ok) throw new Error('Failed to load conversations');
        
        const users = await response.json();
        const conversationsSection = document.getElementById('conversations-section');
        conversationsSection.innerHTML = '';

        users.forEach(user => {
            addConversationToList(user); // Use helper function to add to list
        });
    } catch (error) {
        console.error('Error loading conversations:', error);
    }
}

// Helper function to add a user to the conversation list
function addConversationToList(user) {
    const conversationsSection = document.getElementById('conversations-section');
    const existingUser = [...conversationsSection.children].find(child => child.textContent === user.username);

    // Only add if the user doesn't already exist in the list
    if (!existingUser) {
        const conversationLink = document.createElement('div');
        conversationLink.className = 'conversation';
        conversationLink.textContent = user.username;
        conversationLink.addEventListener('click', () => {
            selectedReceiverId = user.id;
            updateChatHeader(user); // Update chat header
            loadConversation(selectedReceiverId); // Load conversation
        });
        conversationsSection.appendChild(conversationLink);
    }
}

// Function to search for users by username
async function searchUser() {
    const username = document.getElementById('username-search').value.trim();
    const searchResults = document.getElementById('search-results');

    if (!username) {
        searchResults.innerHTML = '<div class="no-results">Enter a username to search</div>';
        return;
    }

    try {
        const response = await fetch(`/messages/search?username=${encodeURIComponent(username)}`);
        const users = await response.json();

        searchResults.innerHTML = '';
        if (users.length === 0) {
            searchResults.innerHTML = '<div class="no-results">No users found</div>';
        } else {
            users.forEach(user => {
                const userElement = document.createElement('div');
                userElement.className = 'search-result-item';
                userElement.textContent = user.username;
                userElement.addEventListener('click', () => {
                    selectedReceiverId = user.id;
                    updateChatHeader(user); // Update chat header with selected user
                    loadConversation(selectedReceiverId);
                    addConversationToList(user); // Add user to conversations list if not there
                    searchResults.innerHTML = ''; // Clear search results
                    document.getElementById('username-search').value = ''; // Clear input
                });
                searchResults.appendChild(userElement);
            });
        }
    } catch (error) {
        console.error('Error searching for user:', error);
        searchResults.innerHTML = '<div class="no-results">Error retrieving search results</div>';
    }
}

// Function to update the chat header with selected user's profile picture and username
function updateChatHeader(user) {
    const profilePictureUrl = user.pfp ? user.pfp : 'default-profile.png';
    const chatHeader = document.getElementById('chat-header');
    chatHeader.innerHTML = `
        <img src="${profilePictureUrl}" alt="Profile Picture" class="chat-profile-pic">
        <span>${user.username}</span>
    `;
}

// Function to load a specific conversation between the user and the selected receiver
async function loadConversation(receiverId) {
    try {
        const response = await fetch(`/messages/conversation/${receiverId}`);
        if (!response.ok) throw new Error('Failed to load conversation');
        
        const { messages } = await response.json();
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

// Function to send a new message to the selected receiver
// Function to send a new message to the selected receiver and update the chat window
async function sendMessage(event) {
    event.preventDefault();

    if (!selectedReceiverId) {
        console.error('No receiver selected');
        return;
    }

    const messageContent = document.getElementById('message-input').value.trim();
    if (!messageContent) {
        console.error('Message content is empty');
        return;
    }

    try {
        // Send the message to the server
        const response = await fetch('/messages/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                receiver_id: selectedReceiverId,
                message_content: messageContent
            })
        });

        if (response.ok) {
            // Clear the input field
            document.getElementById('message-input').value = '';

            // Append the new message to the chat window
            appendMessageToChat({
                sender_id: 'me', // Placeholder for "me"; in the database this would be the actual sender_id
                message_content: messageContent,
                timestamp: new Date().toLocaleTimeString()
            });
        } else {
            console.error('Failed to send message');
        }
    } catch (error) {
        console.error('Error sending message:', error);
    }
}

// Function to append a new message to the chat display
function appendMessageToChat(message) {
    const messageDisplay = document.getElementById('message-display');
    
    // Create a message element based on the sender
    const messageElement = document.createElement('div');
    messageElement.className = message.sender_id === 'me' ? 'message-sent' : 'message-received';
    messageElement.textContent = message.message_content;

    // Append to the message display
    messageDisplay.appendChild(messageElement);

    // Scroll to the bottom to view the latest message
    messageDisplay.scrollTop = messageDisplay.scrollHeight;
}
