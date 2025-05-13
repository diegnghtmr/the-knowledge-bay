import authApi from './authApi';

// Simulación de datos en memoria
const knowledgeBay = {
  contacts: [
    { id: 1, username: 'Antonio', followed: true },
    { id: 2, username: 'Camila', followed: true },
    { id: 3, username: 'Jean Pool', followed: true },
    { id: 4, username: 'Elon Musk', followed: true },
    // Más contactos simulados si es necesario
  ],
  chats: {
    // Formato: { contactId: { messages: [...], lastMessageTimestamp: Date } }
    3: {
      messages: [
        {
          id: 1,
          senderId: 3,
          receiverId: 0, // Usuario actual
          text: 'Y yo me paré sobre la arena del mar, y vi a una bestia emerger del mar, que tenía siete cabezas y diez cuernos; y sobre sus cuernos diez diademas; y sobre las cabezas de ella nombre de blasfemia.',
          timestamp: new Date('2025-03-10T12:21:00')
        },
        {
          id: 2,
          senderId: 3,
          receiverId: 0,
          text: 'Y adoraron al dragón que había dado la potestad a la bestia, y adoraron a la bestia, diciendo: ¿Quién es semejante a la bestia, y quién podrá lidiar con ella?',
          timestamp: new Date('2025-03-10T12:21:30')
        },
        {
          id: 3,
          senderId: 0, // Usuario actual
          receiverId: 3,
          text: 'Muy buenos días, espero que se encuentre muy bien.',
          timestamp: new Date('2025-03-10T12:21:45')
        }
      ],
      lastMessageTimestamp: new Date('2025-03-10T12:21:45')
    },
    1: {
      messages: [
        {
          id: 1,
          senderId: 1,
          receiverId: 0,
          text: 'Hola caballero, me place saludarte.',
          timestamp: new Date('2025-03-11T12:30:00')
        }
      ],
      lastMessageTimestamp: new Date('2025-03-11T12:30:00')
    },
    2: {
      messages: [
        {
          id: 1,
          senderId: 2,
          receiverId: 0,
          text: 'Hola caballero, me place saludarte.',
          timestamp: new Date(Date.now() - 86400000) // Ayer
        }
      ],
      lastMessageTimestamp: new Date(Date.now() - 86400000)
    },
    4: {
      messages: [
        {
          id: 1,
          senderId: 4,
          receiverId: 0,
          text: 'Hola caballero, me place saludarte.',
          timestamp: new Date(Date.now() - 86400000) // Ayer
        }
      ],
      lastMessageTimestamp: new Date(Date.now() - 86400000)
    }
  },
  currentUserId: 0
};

// Obtener todos los contactos con sus últimos mensajes
export const getContactsWithLastMessages = async () => {
  try {
    // Simulación de llamada a API
    await new Promise(resolve => setTimeout(resolve, 300)); // Simular latencia
    
    // Procesar contactos y agregar mensaje más reciente si existe
    const contactsWithMessages = knowledgeBay.contacts.map(contact => {
      const chat = knowledgeBay.chats[contact.id];
      
      if (chat && chat.messages.length > 0) {
        const lastMessage = chat.messages[chat.messages.length - 1];
        return {
          ...contact,
          lastMessage: {
            text: lastMessage.text,
            timestamp: lastMessage.timestamp
          }
        };
      }
      
      return contact;
    });
    
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
    // Simulación de llamada a API
    await new Promise(resolve => setTimeout(resolve, 300)); // Simular latencia
    
    if (knowledgeBay.chats[contactId]) {
      return {
        success: true,
        data: knowledgeBay.chats[contactId].messages
      };
    } else {
      // Si no existe chat, devolver array vacío (nueva conversación)
      return {
        success: true,
        data: []
      };
    }
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
    // Simulación de llamada a API
    await new Promise(resolve => setTimeout(resolve, 200)); // Simular latencia
    
    const currentUserId = knowledgeBay.currentUserId;
    const now = new Date();
    
    // Crear nuevo mensaje
    const newMessage = {
      id: Date.now(), // ID único basado en timestamp
      senderId: currentUserId,
      receiverId: contactId,
      text,
      timestamp: now
    };
    
    // Si no existe el chat, crearlo
    if (!knowledgeBay.chats[contactId]) {
      knowledgeBay.chats[contactId] = {
        messages: [],
        lastMessageTimestamp: now
      };
    }
    
    // Agregar mensaje al chat
    knowledgeBay.chats[contactId].messages.push(newMessage);
    knowledgeBay.chats[contactId].lastMessageTimestamp = now;
    
    return {
      success: true,
      data: newMessage
    };
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
    // Simulación de llamada a API
    await new Promise(resolve => setTimeout(resolve, 100)); // Simular latencia mínima
    
    const term = searchTerm.toLowerCase();
    
    // Filtrar contactos basados en el término de búsqueda
    const filteredContacts = await getContactsWithLastMessages();
    
    if (filteredContacts.success) {
      const filtered = filteredContacts.data.filter(contact => 
        contact.username.toLowerCase().includes(term)
      );
      
      return {
        success: true,
        data: filtered
      };
    }
    
    return filteredContacts;
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