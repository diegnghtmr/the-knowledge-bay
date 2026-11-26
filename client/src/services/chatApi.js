const CHAT_URL = `${(import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')}/api/chat`;

async function request(path, body) {
  const headers = new Headers({ Accept: 'application/json' });
  const token = sessionStorage.getItem('token');
  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (body) headers.set('Content-Type', 'application/json');

  // Do not forward response bodies or request details to console/error handlers.
  const response = await fetch(`${CHAT_URL}${path}`, {
    headers,
    ...(body && { method: 'POST', body: JSON.stringify(body) }),
  });
  if (!response.ok) throw new Error('Chat request failed');
  return response.json();
}

function toContact({ contactId, username, lastMessageText, lastMessageTimestamp }) {
  return {
    id: contactId,
    username,
    lastMessage: lastMessageTimestamp ? { text: lastMessageText, timestamp: lastMessageTimestamp } : null,
  };
}

export async function getContactsWithLastMessages() {
  const contacts = await request('/contacts');
  return contacts.map(toContact).sort((a, b) =>
    (Date.parse(b.lastMessage?.timestamp) || 0) - (Date.parse(a.lastMessage?.timestamp) || 0));
}

export function getChatMessages(contactId) {
  return request(`/${encodeURIComponent(contactId)}/messages`);
}

export function sendMessage(contactId, text) {
  return request('/send', { receiverId: contactId, text });
}

export async function searchContacts(term) {
  const query = new URLSearchParams({ query: term });
  const contacts = await request(`/contacts/search?${query}`);
  return contacts.map(toContact);
}
