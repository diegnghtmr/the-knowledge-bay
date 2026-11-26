import apiClient, { openAuthenticatedStream } from './apiClient.js';

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

// The server sends LF frames; accept CRLF as well, including boundaries split across chunks.
async function readEvents(reader, onEvent, onBytes) {
  const decoder = new TextDecoder();
  let buffer = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) return;
    onBytes();
    buffer += decoder.decode(value, { stream: true });
    let end;
    while ((end = /\r?\n\r?\n/.exec(buffer))) {
      const lines = buffer.slice(0, end.index).split(/\r?\n/);
      buffer = buffer.slice(end.index + end[0].length);
      const name = lines.find(line => line.startsWith('event:'))?.slice(6).trim();
      const data = lines.filter(line => line.startsWith('data:')).map(line => line.slice(5).replace(/^ /, '')).join('\n');
      if (name) onEvent(name, data);
    }
  }
}

export function watchChatMessages(contactId, onMessage, sync) {
  const path = `${CHAT_URL}/${encodeURIComponent(contactId)}/events`;
  let stopped = false;
  let retry;
  let active;
  let backoff = 500;
  let connectedBefore = false;

  async function connect() {
    const controller = new AbortController();
    active = controller;
    const started = Date.now();
    let stable = false;
    let reader;
    let idle;
    const resetIdle = () => {
      clearTimeout(idle);
      idle = setTimeout(() => controller.abort(), 45_000);
    };
    resetIdle();
    try {
      const response = await openAuthenticatedStream(path, controller.signal);
      if (stopped || !response || response.status === 401) return;
      if (response.ok && response.headers.get('content-type')?.startsWith('text/event-stream') && response.body) {
        reader = response.body.getReader();
        await readEvents(reader, (name, data) => {
          if (stopped) return;
          if (name === 'ready') {
            stable = true;
            sync(); // Registered server-side: history closes the gap with the first HTTP read.
          } else if (name === 'message') {
            const message = JSON.parse(data);
            if (Number.isSafeInteger(message.id) && typeof message.text === 'string') onMessage(message);
          }
        }, resetIdle);
        if (!stable && connectedBefore && !stopped) sync();
      } else {
        await response.body?.cancel();
        if (connectedBefore && !stopped) sync(); // An unavailable SSE route still has HTTP history.
      }
    } catch {
      // Network or proxy disconnected. Retry without logging request details.
      if (connectedBefore && !stopped) sync();
    } finally {
      clearTimeout(idle);
      if (reader) await reader.cancel().catch(() => {});
    }
    if (stopped) return;
    connectedBefore = true;
    if (stable && Date.now() - started > 5000) backoff = 500;
    retry = setTimeout(connect, backoff);
    backoff = Math.min(backoff * 2, 8000);
  }

  connect();
  return () => {
    stopped = true;
    clearTimeout(retry);
    active?.abort();
  };
}

export function sendMessage(contactId, text) {
  return request('/send', { receiverId: contactId, text });
}

export async function searchContacts(term) {
  const query = new URLSearchParams({ query: term });
  const contacts = await request(`/contacts/search?${query}`);
  return contacts.map(toContact);
}
