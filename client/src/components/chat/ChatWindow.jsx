import React, { useState, useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import { getChatMessages, sendMessage } from '../../services/chatApi';

const ChatWindow = ({ contact, onMessageSent }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const [isSending, setIsSending] = useState(false);
  
  // Cargar mensajes cuando cambia el contacto seleccionado
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true);
        const response = await getChatMessages(contact.id);
        if (response.success) {
          setMessages(response.data);
          setError(null);
        } else {
          setError(response.message || 'Error al cargar los mensajes');
        }
      } catch (err) {
        setError('Error al cargar los mensajes. Por favor, intente de nuevo más tarde.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMessages();
  }, [contact.id]);
  
  // Hacer scroll al mensaje más reciente cuando se cargan mensajes o se envía uno nuevo
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  const handleSendMessage = async (text) => {
    if (!text.trim() || isSending) return;
    
    try {
      setIsSending(true);
      
      // Crear un mensaje temporal optimista con un ID único temporal
      const tempId = `temp-${Date.now()}`;
      const optimisticMessage = {
        id: tempId,
        senderId: 0, // Usuario actual
        receiverId: contact.id,
        text,
        timestamp: new Date(),
        isOptimistic: true // Marca para reconocer que es temporal
      };
      
      // Agregar el mensaje optimista a la UI inmediatamente
      setMessages(prevMessages => [...prevMessages, optimisticMessage]);
      
      // Enviar el mensaje a la API
      const response = await sendMessage(contact.id, text);
      
      if (response.success) {
        // Reemplazar el mensaje optimista con el real
        setMessages(prevMessages => 
          prevMessages.map(msg => 
            msg.id === tempId ? response.data : msg
          )
        );
        
        // Notificar al componente padre para actualizar la lista de contactos
        onMessageSent(response.data);
      } else {
        // En caso de error, eliminar el mensaje optimista
        setMessages(prevMessages => 
          prevMessages.filter(msg => msg.id !== tempId)
        );
        setError(response.message || 'Error al enviar el mensaje');
      }
    } catch (err) {
      // En caso de error, eliminar el mensaje optimista si existe
      setMessages(prevMessages => 
        prevMessages.filter(msg => !msg.isOptimistic)
      );
      setError('Error al enviar el mensaje. Por favor, intente de nuevo más tarde.');
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };

  // Función para mostrar la fecha en formato "10 de marzo de 2025"
  const formatDateHeader = (timestamp) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    
    // Si es del 10/3/2025, mostrar "10 de marzo de 2025"
    if (date.getFullYear() === 2025 && date.getMonth() === 2 && date.getDate() === 10) {
      return '10 de marzo de 2025';
    }
    
    return date.toLocaleDateString('es-ES', options);
  };
  
  // Para la imagen compartida, solo tenemos mensajes del 10 de marzo de 2025
  const dateHeaderShown = messages.length > 0 ? true : false;
  
  // Filtrar posibles mensajes duplicados (mismo texto y mismo timestamp)
  const uniqueMessages = messages.reduce((acc, current) => {
    const x = acc.find(item => 
      item.text === current.text && 
      !item.isOptimistic &&
      Math.abs(new Date(item.timestamp) - new Date(current.timestamp)) < 1000
    );
    if (!x) {
      return acc.concat([current]);
    } else {
      return acc;
    }
  }, []);
  
  return (
    <div className="flex flex-col h-full rounded-xl overflow-hidden" style={{ backgroundColor: 'var(--sand)' }}>
      {/* Cabecera - Fondo coastal-sea, texto deep-sea */}
      <div className="py-4 flex items-center justify-center shadow-sm" style={{ backgroundColor: 'var(--coastal-sea)' }}>
        <h2 className="text-xl font-medium" style={{ color: 'var(--deep-sea)' }}>{contact.username}</h2>
      </div>
      
      {/* Área de mensajes - Fondo sand (heredado), padding */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <p className="opacity-70" style={{ color: 'var(--deep-sea)' }}>Cargando mensajes...</p>
          </div>
        ) : error ? (
          <div className="flex justify-center items-center h-full">
            <p className="text-red-500">{error}</p>
          </div>
        ) : uniqueMessages.length === 0 ? (
          <div className="flex justify-center items-center h-full">
            <p className="opacity-70" style={{ color: 'var(--deep-sea)' }}>No hay mensajes aún. ¡Comienza la conversación!</p>
          </div>
        ) : (
          <>
            {dateHeaderShown && (
              <div className="flex justify-center mb-6">
                <span className="inline-block px-3 py-1 rounded-full text-xs" 
                  style={{ backgroundColor: 'white', opacity: '0.6', color: 'var(--deep-sea)' }}>
                  {formatDateHeader(uniqueMessages[0].timestamp)}
                </span>
              </div>
            )}
            {uniqueMessages.map(message => (
              <MessageBubble 
                key={message.id} 
                message={message} 
                isCurrentUser={message.senderId === 0} // 0 es el ID del usuario actual en este caso
              />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>
      
      {/* Área de entrada de mensaje */}
      <MessageInput onSendMessage={handleSendMessage} disabled={isSending} />
    </div>
  );
};

export default ChatWindow; 