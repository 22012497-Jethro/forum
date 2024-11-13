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

// Function to format timestamp
function formatTimestamp(timestamp) {
    const messageDate = new Date(timestamp);
    const today = new Date();
    const isToday = messageDate.toDateString() === today.toDateString();

    if (isToday) {
        return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
        return messageDate.toLocaleDateString();
    }
}

// Update addConversationToList to show the last message and timestamp
function addConversationToList(conversation) {
    const conversationsSection = document.getElementById('conversations-section');
    const existingUser = [...conversationsSection.children].find(child => child.dataset.userId === conversation.userId);

    if (!existingUser) {
        const conversationDiv = document.createElement('div');
        conversationDiv.className = 'conversation';
        conversationDiv.dataset.userId = conversation.userId;

        conversationDiv.innerHTML = `
            <div class="conversation-header">
                <img src="${conversation.pfp || 'default-profile.png'}" alt="Profile Picture" class="conversation-profile-pic">
                <div>
                    <span class="conversation-username">${conversation.username}</span>
                    <span class="conversation-timestamp">${formatTimestamp(conversation.timestamp)}</span>
                </div>
            </div>
            <p class="conversation-last-message">${conversation.lastMessage || 'No messages yet.'}</p>
        `;

        conversationDiv.addEventListener('click', () => {
            selectedReceiverId = conversation.userId;
            updateChatHeader(conversation);
            fetchAndDisplayMessages(selectedReceiverId);
        });

        conversationsSection.appendChild(conversationDiv);
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
        <span>${user.username}</span>
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

// Function to display a single message in the chat display
function displayMessage(message) {
    const messageDisplay = document.getElementById('message-display');
    const messageElement = document.createElement('div');
    
    messageElement.className = message.sender_id === selectedReceiverId ? 'message-received' : 'message-sent';
    messageElement.textContent = message.content;

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
            body: JSON.stringify({
                receiver_id: selectedReceiverId,
                content
            })
        });

        if (response.ok) {
            const newMessage = await response.json(); // Get the stored message from the server
            displayMessage(newMessage); // Display the new message immediately in the UI
            document.getElementById('message-input').value = ''; // Clear the input field
        } else {
            console.error('Failed to send message');
        }
    } catch (error) {
        console.error('Error sending message:', error);
    }
}

// Function to fetch and display messages for the selected conversation
async function fetchAndDisplayMessages(receiverId) {
    try {
        // Fetch all messages for the current conversation
        const response = await fetch(`/messages/conversation/${receiverId}`);
        if (!response.ok) throw new Error('Failed to load messages');

        const { messages } = await response.json();
        const messageDisplay = document.getElementById('message-display');
        messageDisplay.innerHTML = ''; // Clear any previous messages

        // Display each message in the conversation
        messages.forEach(message => displayMessage(message));
    } catch (error) {
        console.error('Error fetching messages:', error);
    }
}

// Function to display a single message in the chat display
function displayMessage(message) {
    const messageDisplay = document.getElementById('message-display');

    const messageElement = document.createElement('div');
    messageElement.className = `message ${message.sender_id === selectedReceiverId ? 'message-received' : 'message-sent'}`;
    messageElement.textContent = message.content;

    messageDisplay.appendChild(messageElement);
    messageDisplay.scrollTop = messageDisplay.scrollHeight;
}
