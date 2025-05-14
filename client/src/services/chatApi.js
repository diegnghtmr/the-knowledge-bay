import authApi from './authApi';

// Obtener todos los contactos con sus últimos mensajes
export const getContactsWithLastMessages = async () => {
  try {
    // Usar authApi para mantener la gestión de tokens
    const response = await authApi.get('/api/chat/contacts');
    
    if (response.success) {
      const contactsWithMessages = response.data.map(contact => ({
        id: contact.contactId,
        username: contact.username,
        lastMessage: contact.lastMessageText ? {
          text: contact.lastMessageText,
          timestamp: new Date(contact.lastMessageTimestamp)
        } : null
      }));
      
      // Ordenar por timestamp del último mensaje (más reciente primero)
      contactsWithMessages.sort((a, b) => {
        // Si no hay mensaje, poner al final
        if (!a.lastMessage) return 1;
        if (!b.lastMessage) return -1;
        
        return b.lastMessage.timestamp - a.lastMessage.timestamp;
      });
      
      return {
        success: true,
        data: contactsWithMessages
      };
    }
    
    return response;
  } catch (error) {
    console.error('Error al obtener contactos:', error);
    return {
      success: false,
      message: 'No se pudieron cargar los contactos.'
    };
  }
};

// Obtener mensajes de una conversación específica
export const getChatMessages = async (contactId) => {
  try {
    // Usar authApi para mantener la gestión de tokens
    const response = await authApi.get(`/api/chat/${contactId}/messages`);
    
    if (response.success) {
      const messages = response.data.map(message => ({
        id: message.id,
        senderId: message.senderId,
        receiverId: message.senderId === contactId ? sessionStorage.getItem('userId') : contactId,
        text: message.text,
        timestamp: new Date(message.timestamp)
      }));
      
      return {
        success: true,
        data: messages
      };
    }
    
    return response;
  } catch (error) {
    console.error('Error al obtener mensajes:', error);
    return {
      success: false,
      message: 'No se pudieron cargar los mensajes.'
    };
  }
};

// Enviar un nuevo mensaje
export const sendMessage = async (contactId, text) => {
  try {
    // Usar authApi para mantener la gestión de tokens
    const response = await authApi.post('/api/chat/send', {
      receiverId: contactId,
      text: text
    });
    
    if (response.success) {
      const message = {
        id: response.data.id,
        senderId: response.data.senderId,
        receiverId: contactId,
        text: response.data.text,
        timestamp: new Date(response.data.timestamp)
      };
      
      return {
        success: true,
        data: message
      };
    }
    
    return response;
  } catch (error) {
    console.error('Error al enviar mensaje:', error);
    return {
      success: false,
      message: 'No se pudo enviar el mensaje.'
    };
  }
};

// Función para buscar contactos por nombre
export const searchContacts = async (searchTerm) => {
  try {
    // Obtenemos todos los contactos primero
    const contactsResponse = await getContactsWithLastMessages();
    
    if (contactsResponse.success) {
      const term = searchTerm.toLowerCase();
      
      // Filtrar contactos basados en el término de búsqueda
      const filtered = contactsResponse.data.filter(contact => 
        contact.username.toLowerCase().includes(term)
      );
      
      return {
        success: true,
        data: filtered
      };
    }
    
    return contactsResponse;
  } catch (error) {
    console.error('Error al buscar contactos:', error);
    return {
      success: false,
      message: 'No se pudieron buscar los contactos.'
    };
  }
};

export default {
  getContactsWithLastMessages,
  getChatMessages,
  sendMessage,
  searchContacts
};