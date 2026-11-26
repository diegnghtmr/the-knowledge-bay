import apiClient from './apiClient.js';

const CHAT_URL = '/api/chat';

async function request(path, body) {
  const url = `${CHAT_URL}${path}`;
  const result = await (body ? apiClient.post(url, body) : apiClient.get(url));
  // Do not forward response bodies or request details to console/error handlers.
  if (!result.success) throw new Error('Chat request failed');
  return result.data;
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
