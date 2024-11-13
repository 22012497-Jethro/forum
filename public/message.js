let selectedReceiverId = null;

document.addEventListener('DOMContentLoaded', () => {
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

// Function to load the user's conversations with the latest message
async function loadConversations() {
    try {
        const response = await fetch(`/messages/conversations`);
        if (!response.ok) throw new Error('Failed to load conversations');
        
        const conversations = await response.json();
        const conversationsSection = document.getElementById('conversations-section');
        conversationsSection.innerHTML = '';

        conversations.forEach(conversation => {
            addConversationToList(conversation);
        });
    } catch (error) {
        console.error('Error loading conversations:', error);
    }
}

// Helper function to add a conversation with the latest message and timestamp
function addConversationToList(conversation) {
    const conversationsSection = document.getElementById('conversations-section');
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

// Function to format timestamp for display
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

// Function to update the chat header with selected user's profile picture and username
function updateChatHeader(conversation) {
    const chatHeader = document.getElementById('chat-header');
    chatHeader.innerHTML = `
        <img src="${conversation.pfp || 'default-profile.png'}" alt="Profile Picture" class="chat-profile-pic">
        <span>${conversation.username}</span>
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

// Function to send a new message to the selected receiver and update conversation list
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
            loadConversations(); // Reload conversations to show the latest message
        } else {
            console.error('Failed to send message');
        }
    } catch (error) {
        console.error('Error sending message:', error);
    }
}
