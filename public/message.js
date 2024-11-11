let selectedReceiverId = null;
let debounceTimeout;

document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname === '/messages') {
        loadConversations();
        
        const searchInput = document.getElementById('username-search');
        const messageForm = document.getElementById('message-form');

        if (searchInput) {
            searchInput.addEventListener('input', debounce(searchUser, 300)); // Use debounce on search input
        }

        if (messageForm) {
            messageForm.addEventListener('submit', sendMessage);
        }
    }
});

// Function to debounce search input (wait until user stops typing)
function debounce(func, delay) {
    return function (...args) {
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(() => func(...args), delay);
    };
}

// Function to load existing conversations
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

// Function to search for users by username
async function searchUser() {
    const username = document.getElementById('username-search').value.trim();
    const searchResults = document.getElementById('search-results');

    // Clear previous results if the search is empty
    if (!username) {
        searchResults.innerHTML = '';
        return;
    }

    try {
        console.log('Searching for:', username); // Debug log

        const response = await fetch(`/messages/search?username=${encodeURIComponent(username)}`);
        if (!response.ok) throw new Error('Failed to search for user');

        const users = await response.json(); // Retrieve the list of users
        console.log('Received search results:', users); // Log the result

        // Clear previous search results
        searchResults.innerHTML = '';

        // Display each user found
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

        // If no users found, display "No users found"
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

// Function to send a new message to the selected receiver
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
