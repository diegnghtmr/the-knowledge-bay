import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavigationBar from '../components/layout/NavigationBar';
import ContentPublicationForm from '../components/content-publication/ContentPublicationForm';
import { useAuth } from '../context/AuthContext';
import { contentApi } from '../services/contentApi';

const PublishContentPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePublish = async (data) => {
    setIsSubmitting(true);
    
    try {
      console.log('Contenido a publicar:', data);
      
      const contentData = {
        title: data.title,
        contentType: data.contentType,
        body: data.body,
        topics: data.topics,
        linkUrl: data.linkUrl || null,
        videoUrl: data.videoUrl || null,
      };

      console.log("Enviando datos de contenido:", contentData);
      
      const response = await contentApi.createContent(contentData, data.file);
      
      console.log("Respuesta del servidor:", response);
      
      if (response.success) {
        alert("Contenido publicado exitosamente");
        navigate('/');
      } else {
        alert(response.message || "Error al publicar el contenido");
      }
    } catch (error) {
      console.error("Error al publicar contenido:", error);
      alert("Error al publicar el contenido: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    console.log('Publicación cancelada');
    navigate('/');
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
            isSubmitting={isSubmitting}
          />
        </div>
      </main>
    </div>
  );
};

export default PublishContentPage; 