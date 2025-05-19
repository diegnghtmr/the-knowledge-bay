import React from 'react';
import NavigationBar from '../components/layout/NavigationBar';
import ContentPublicationForm from '../components/content-publication/ContentPublicationForm';
import { useAuth } from '../context/AuthContext'; // Para obtener datos del autor si es necesario

const PublishContentPage = () => {
  const { user } = useAuth(); // Ejemplo: obtener el usuario para asociarlo como autor

  const handlePublish = (data) => {
    console.log('Contenido a publicar:', data);
    // Aquí iría la lógica para enviar los datos al backend
    // Por ejemplo, construir un FormData si hay un archivo
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('contentType', data.contentType);
    formData.append('body', data.body);
    formData.append('topics', JSON.stringify(data.topics)); // Enviar como JSON string o procesar en backend
    if (data.file) {
      formData.append('file', data.file);
    }
    if (data.contentType === 'video') {
      formData.append('videoUrl', data.videoUrl);
    }
    // formData.append('authorId', user.id); // Ejemplo de cómo se podría añadir el autor

    alert('Contenido enviado (simulación). Revisa la consola.');
    // Redirigir o limpiar formulario después de publicar
  };

  const handleCancel = () => {
    console.log('Publicación cancelada');
    // Redirigir a la página anterior o al dashboard
    window.history.back(); 
  };

  return (
    <div className="min-h-screen bg-[var(--sand)]">
      <NavigationBar title="Publicar Nuevo Contenido" />
      <main className="container mx-auto max-w-3xl py-8 px-4">
        <div className="bg-white p-6 sm:p-8 rounded-lg shadow-lg">
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--deep-sea)] mb-6 text-center">
            Comparte tu Conocimiento
          </h1>
          <ContentPublicationForm 
            onPublish={handlePublish} 
            onCancel={handleCancel} 
          />
        </div>
      </main>
    </div>
  );
};

export default PublishContentPage; 