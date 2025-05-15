import React, { useState, useEffect } from 'react';
import ContactList from '../../components/chat/ContactList';
import ChatWindow from '../../components/chat/ChatWindow';
import { getContactsWithLastMessages } from '../../services/chatApi';

const ChatPage = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedContact, setSelectedContact] = useState(null);
  const [error, setError] = useState(null);
  const [isMobileView, setIsMobileView] = useState(false);
  const [showContacts, setShowContacts] = useState(true);

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        setLoading(true);
        const response = await getContactsWithLastMessages();
        if (response.success) {
          setContacts(response.data);
          // Seleccionar el primer contacto por defecto si existe
          if (response.data.length > 0 && !selectedContact) {
            setSelectedContact(response.data[0]);
          }
        } else {
          setError(response.message);
        }
      } catch (err) {
        setError('Error al cargar los contactos. Por favor, intente de nuevo más tarde.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchContacts();
    
    // Manejar responsive
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    
    handleResize(); // Ejecutar al inicio
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleContactSelect = (contact) => {
    setSelectedContact(contact);
    if (isMobileView) {
      setShowContacts(false);
    }
  };

  const updateContactWithNewMessage = (contactId, message) => {
    setContacts(prevContacts => {
      // Encontrar el contacto que se actualizará
      const updatedContacts = prevContacts.map(contact => {
        if (contact.id === contactId) {
          return {
            ...contact,
            lastMessage: {
              text: message.text,
              timestamp: message.timestamp
            }
          };
        }
        return contact;
      });

      // Reordenar los contactos para que el más reciente esté primero
      return updatedContacts.sort((a, b) => {
        if (!a.lastMessage) return 1;
        if (!b.lastMessage) return -1;
        return new Date(b.lastMessage.timestamp) - new Date(a.lastMessage.timestamp);
      });
    });
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
          <p className="text-gray-700 mb-4">{error}</p>
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
    <div className="flex h-screen p-4 gap-4 bg-cream-custom overflow-hidden">
      {/* Lista de contactos */}
      <div className={`${
        isMobileView ? (showContacts ? 'block w-full' : 'hidden') : 'block'
      } w-80 h-full bg-cream-custom`}>
        <ContactList 
          contacts={contacts} 
          onSelectContact={handleContactSelect} 
          selectedContact={selectedContact} 
        />
      </div>
      
      {/* Ventana de chat */}
      <div className={`${
        isMobileView ? (showContacts ? 'hidden' : 'block w-full') : 'flex-1'
      }`}>
        {selectedContact ? (
          <ChatWindow 
            contact={selectedContact} 
            onMessageSent={(message) => updateContactWithNewMessage(selectedContact.id, message)} 
          />
        ) : (
          <div className="flex justify-center items-center h-full bg-cream-custom">
            <p className="text-gray-600">Selecciona un chat para comenzar</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;