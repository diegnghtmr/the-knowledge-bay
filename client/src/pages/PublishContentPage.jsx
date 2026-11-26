import React from "react";
import { useNavigate } from "react-router-dom";
import NavigationBar from "../components/layout/NavigationBar";
import ContentPublicationForm from "../components/content-publication/ContentPublicationForm";
import { useAuth } from "../context/AuthContext";
import { contentApi } from "../services/contentApi";

const PublishContentPage = () => {
  const { userRole } = useAuth();
  const navigate = useNavigate();

  const handlePublish = async (data) => {
    try {
      const contentData = {
        title: data.title,
        contentType: data.contentType,
        body: data.body,
        topics: data.topics,
        linkUrl: data.linkUrl || null,
        videoUrl: data.videoUrl || null,
      };

      const response = await contentApi.createContent(contentData, data.file);
      if (response.success) {
        alert("Contenido publicado exitosamente");
        navigate("/");
      } else {
        alert(response.message || "Error al publicar el contenido");
      }
    } catch (error) {
      alert("Error al publicar el contenido: " + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--sand)]">
      <NavigationBar title="Publicar Nuevo Contenido" />
      <main className="container mx-auto max-w-3xl py-8 px-4">
        <div className="bg-white p-6 sm:p-8 rounded-lg shadow-lg">
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--deep-sea)] mb-6 text-center">
            Comparte tu Conocimiento
          </h1>
          {userRole === "student" ? (
            <ContentPublicationForm onPublish={handlePublish} onCancel={() => navigate("/")} />
          ) : (
            <p role="status" className="text-center text-[var(--open-sea)]">
              Solo los estudiantes pueden publicar contenido.
            </p>
          )}
        </div>
      </main>
    </div>
  );
};

export default PublishContentPage;
