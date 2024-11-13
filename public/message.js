let selectedReceiverId = null;

document.addEventListener('DOMContentLoaded', () => {
    // Load existing conversations on page load
    loadConversations();

    const searchInput = document.getElementById('username-search');
    const messageForm = document.getElementById('message-form');

    if (searchInput) {
        searchInput.addEventListener('input', debounce(searchUser, 300));
    }

    if (messageForm) {
        messageForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            await sendMessage();
        });
    }
});

// Debounce function to limit the frequency of API calls
function debounce(func, delay) {
    let debounceTimeout;
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

        users.forEach(user => addConversationToList(user));
    } catch (error) {
        console.error('Error loading conversations:', error);
    }
}

// Helper function to add a user to the conversation list with the last message and timestamp
function addConversationToList(conversation) {
    const conversationsSection = document.getElementById('conversations-section');
    
    // Check if this user is already in the conversation list
    const existingUser = [...conversationsSection.children].find(child => child.dataset.userId === conversation.id);

    if (!existingUser) {
        const conversationLink = document.createElement('div');
        conversationLink.className = 'conversation';
        conversationLink.dataset.userId = conversation.id; // Set user ID for easy retrieval

        // Display the profile picture and username
        const profilePictureUrl = conversation.pfp || 'default-profile.png';
        const displayName = conversation.username || 'Unknown User';

        conversationLink.innerHTML = `
            <img src="${profilePictureUrl}" alt="Profile Picture" class="chat-profile-pic">
            <div>
                <strong>${displayName}</strong><br>
                <small>${conversation.last_message || ''}</small><br>
                <small>${conversation.last_message_time || ''}</small>
            </div>
        `;

        // Add click event to load conversation when this item is clicked
        conversationLink.addEventListener('click', () => {
            selectedReceiverId = conversation.id;
            updateChatHeader(conversation); // Update chat header
            fetchAndDisplayMessages(selectedReceiverId); // Load conversation messages
        });

        conversationsSection.appendChild(conversationLink);
    }
}

// Utility function to format timestamp (e.g., '12:45 PM' or 'Yesterday')
function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    
    if (date.toDateString() === now.toDateString()) {
        // Show time if it's today
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
        // Show date if it's not today
        return date.toLocaleDateString();
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
                    updateChatHeader(user);
                    fetchAndDisplayMessages(selectedReceiverId);
                    addConversationToList(user);
                    searchResults.innerHTML = '';
                    document.getElementById('username-search').value = '';
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
        <span>${user.username || 'Unknown User'}</span>
    `;
}

// Function to fetch and display messages for the selected conversation
async function fetchAndDisplayMessages(receiverId) {
    try {
        const response = await fetch(`/messages/conversation/${receiverId}`);
        if (!response.ok) throw new Error('Failed to load messages');

        const { messages } = await response.json();
        const messageDisplay = document.getElementById('message-display');
        messageDisplay.innerHTML = '';

        messages.forEach(message => displayMessage(message));
    } catch (error) {
        console.error('Error fetching messages:', error);
    }
}

// Function to display a single message with timestamp in the chat display
function displayMessage(message) {
    const messageDisplay = document.getElementById('message-display');
    const messageElement = document.createElement('div');
    
    messageElement.className = message.sender_id === selectedReceiverId ? 'message-received' : 'message-sent';
    messageElement.innerHTML = `
        <div>${message.content}</div>
        <small>${formatTimestamp(message.created_at)}</small>
    `;

    messageDisplay.appendChild(messageElement);
    messageDisplay.scrollTop = messageDisplay.scrollHeight;
}

// Function to send a new message to the selected receiver
async function sendMessage() {
    if (!selectedReceiverId) {
        console.error('No receiver selected');
        return;
    }

    const content = document.getElementById('message-input').value.trim();
    if (!content) {
        console.error('Message content is empty');
        return;
    }

    try {
        const response = await fetch('/messages/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ receiver_id: selectedReceiverId, content })
        });

        if (response.ok) {
            const newMessage = await response.json(); // Get the stored message from the server
            displayMessage(newMessage); // Display the new message immediately in the UI
            document.getElementById('message-input').value = ''; // Clear the input field
            loadConversations(); // Refresh conversation list to update last message and timestamp
        } else {
            console.error('Failed to send message');
        }
    } catch (error) {
        console.error('Error sending message:', error);
    }
}
