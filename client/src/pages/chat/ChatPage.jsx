import { useEffect, useState } from 'react';
import ContactList from '../../components/chat/ContactList';
import ChatWindow from '../../components/chat/ChatWindow';
import NavigationBar from '../../components/layout/NavigationBar';
import { getContactsWithLastMessages } from '../../services/chatApi';

const ChatPage = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedContact, setSelectedContact] = useState(null);
  const [error, setError] = useState(false);
  const [threadOpen, setThreadOpen] = useState(false);

  useEffect(() => {
    let current = true;
    getContactsWithLastMessages().then(results => {
      if (!current) return;
      setContacts(results);
      setSelectedContact(selection => selection ?? results[0] ?? null);
    }).catch(() => {
      if (current) setError(true);
    }).finally(() => {
      if (current) setLoading(false);
    });
    return () => { current = false; };
  }, []);

  const handleContactSelect = contact => {
    setSelectedContact(contact);
    setThreadOpen(true);
  };

  const updateContactWithNewMessage = (contact, { text, timestamp }) => {
    setContacts(previous => [
      ...previous.filter(item => item.id !== contact.id),
      { ...contact, lastMessage: { text, timestamp } },
    ].sort((a, b) => (Date.parse(b.lastMessage?.timestamp) || 0) - (Date.parse(a.lastMessage?.timestamp) || 0)));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-cream-custom">
        <p className="text-gray-500">Cargando chats...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-cream-custom">
        <div className="p-6 rounded-lg shadow-sm text-center max-w-md border border-gray-200">
          <p className="text-red-500 font-medium mb-2">Error</p>
          <p className="text-gray-700 mb-4">Error al cargar los contactos. Por favor, intente de nuevo más tarde.</p>
          <button
            className="bg-coastal-sea text-white px-4 py-2 rounded hover:bg-opacity-90 transition-colors"
            onClick={() => window.location.reload()}
          >
            Intentar de nuevo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-dvh md:h-screen bg-cream-custom overflow-hidden">
      <NavigationBar title="Chat" />
      <div className="flex flex-1 min-h-0 p-4 gap-4 overflow-hidden">
        <div className={`${threadOpen ? 'hidden md:block' : 'block'} w-full md:w-80 h-full shrink-0 bg-cream-custom`}>
          <ContactList
            contacts={contacts}
            onSelectContact={handleContactSelect}
            selectedContact={selectedContact}
          />
        </div>
        <div className={`${threadOpen ? 'block' : 'hidden'} md:block flex-1 min-w-0`}>
          {selectedContact ? (
            <ChatWindow
              key={selectedContact.id}
              contact={selectedContact}
              onBack={() => setThreadOpen(false)}
              onMessageSent={message => updateContactWithNewMessage(selectedContact, message)}
            />
          ) : (
            <div className="flex justify-center items-center h-full bg-cream-custom">
              <p className="text-gray-600">Selecciona un chat para comenzar</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
