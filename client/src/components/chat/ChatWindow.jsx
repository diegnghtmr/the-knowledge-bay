import { useEffect, useRef, useState } from 'react';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import { getChatMessages, sendMessage, watchChatMessages } from '../../services/chatApi';

function mergeMessages(previous, incoming) {
  const byId = new Map(previous.map(message => [message.id, message]));
  for (const message of incoming) byId.set(message.id, message);
  if (byId.size === previous.length) return previous;
  return [...byId.values()].sort((a, b) => a.id - b.id);
}

const ChatWindow = ({ contact, onBack, onMessageSent }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [historyError, setHistoryError] = useState(false);
  const [sendError, setSendError] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const sending = useRef(false);
  const messagesArea = useRef(null);

  useEffect(() => {
    // Each contact selection has its own request generation and component key.
    let current = true;
    let pending = false;
    let queued = false;
    let hasHistory = false;
    const sync = () => {
      if (!current) return;
      if (pending) { queued = true; return; }
      pending = true;
      getChatMessages(contact.id).then(history => {
        if (!current) return;
        hasHistory = true;
        setHistoryError(false);
        setMessages(previous => mergeMessages(previous, history));
      }).catch(() => {
        if (current && !hasHistory) setHistoryError(true);
      }).finally(() => {
        if (!current) return;
        setLoading(false);
        pending = false;
        if (queued) { queued = false; sync(); }
      });
    };
    sync();
    const close = watchChatMessages(contact.id, message => {
      if (current) setMessages(previous => mergeMessages(previous, [message]));
    }, sync);
    return () => { current = false; close(); };
  }, [contact.id]);

  useEffect(() => {
    const element = messagesArea.current;
    element?.scrollTo({ top: element.scrollHeight });
  }, [messages]);

  const handleSendMessage = async text => {
    if (sending.current || loading || !text.trim()) return false;
    sending.current = true;
    setIsSending(true);
    setSendError(false);
    try {
      const saved = await sendMessage(contact.id, text);
      setMessages(previous => mergeMessages(previous, [saved]));
      onMessageSent(saved);
      return true;
    } catch {
      setSendError(true);
      return false;
    } finally {
      sending.current = false;
      setIsSending(false);
    }
  };

  const dateHeader = messages.length ? new Date(messages[0].timestamp).toLocaleDateString('es-ES', {
    year: 'numeric', month: 'long', day: 'numeric',
  }) : null;

  return (
    <div className="flex flex-col h-full rounded-xl overflow-hidden" style={{ backgroundColor: 'var(--sand)' }}>
      <div className="grid grid-cols-[44px_minmax(0,1fr)_44px] items-center md:flex md:justify-center py-4 shadow-sm" style={{ backgroundColor: 'var(--coastal-sea)' }}>
        <button
          type="button"
          className="md:hidden flex justify-center items-center h-11 -my-2"
          style={{ color: 'var(--deep-sea)' }}
          aria-label="Volver a conversaciones"
          onClick={onBack}
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m14 6-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <h2 className="text-xl font-medium text-center min-w-0 truncate" style={{ color: 'var(--deep-sea)' }}>{contact.username}</h2>
      </div>
      <div ref={messagesArea} className="flex-1 min-h-0 overflow-y-auto p-4" role="log" aria-label="Mensajes">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <p className="opacity-70" style={{ color: 'var(--deep-sea)' }}>Cargando mensajes...</p>
          </div>
        ) : historyError ? (
          <div className="flex justify-center items-center h-full">
            <p role="alert" className="text-red-500">No se pudieron cargar los mensajes.</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex justify-center items-center h-full">
            <p className="opacity-70" style={{ color: 'var(--deep-sea)' }}>No hay mensajes aún. ¡Comienza la conversación!</p>
          </div>
        ) : (
          <>
            <div className="flex justify-center mb-6">
              <span className="inline-block px-3 py-1 rounded-full text-xs"
                style={{ backgroundColor: 'white', opacity: '0.6', color: 'var(--deep-sea)' }}>
                {dateHeader}
              </span>
            </div>
            {messages.map(message => (
              <MessageBubble key={message.id} message={message} isCurrentUser={message.senderId !== contact.id} />
            ))}
          </>
        )}
      </div>
      {sendError && <p className="px-4 text-sm text-red-500" role="alert">No se pudo enviar el mensaje.</p>}
      <MessageInput onSendMessage={handleSendMessage} disabled={isSending || loading || historyError} />
    </div>
  );
};

export default ChatWindow;
