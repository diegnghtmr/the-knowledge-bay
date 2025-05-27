import sampleData from "../data/sample-data.json";
import * as Json from "postcss";

const API_BASE_URL = "http://localhost:8080/api";

// Función helper para incluir headers de autorización
const getHeaders = () => {
  const token = localStorage.getItem("authToken");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Obtener estadísticas administrativas
export const getAdminStats = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/stats`, {
      method: "GET",
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    throw error;
  }
};

// Obtener todos los usuarios (admin)
export const getAllUsersAdmin = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/users`, {
      method: "GET",
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};

// Obtener todo el contenido (admin)
export const getAllContentAdmin = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/content`, {
      method: "GET",
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching content:", error);
    throw error;
  }
};

// Obtener todas las solicitudes de ayuda (admin)
export const getAllHelpRequestsAdmin = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/help-requests`, {
      method: "GET",
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching help requests:", error);
    throw error;
  }
};

// Eliminar contenido (admin)
export const deleteContent = async (contentId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/content/${contentId}`, {
      method: "DELETE",
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error deleting content:", error);
    throw error;
  }
};

// Eliminar solicitud de ayuda (admin)
export const deleteHelpRequest = async (requestId) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/admin/help-requests/${requestId}`,
      {
        method: "DELETE",
        headers: getHeaders(),
      },
    );

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error deleting help request:", error);
    throw error;
  }
};

// Actualizar solicitud de ayuda (admin)
export const updateHelpRequestAdmin = async (requestId, requestData) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/admin/help-requests/${requestId}`,
      {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify(requestData),
      },
    );

    if (!response.ok) {
      const errorBody = await response.json();
      throw new Error(errorBody.message || `Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating help request:", error);
    throw error;
  }
};

// === INTEREST MANAGEMENT APIs ===

// Obtener todos los intereses
export const getAllInterests = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/interests`, {
      method: "GET",
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching interests:", error);
    throw error;
  }
};

// Crear nuevo interés
export const createInterest = async (interestData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/interests`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(interestData),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating interest:", error);
    throw error;
  }
};

// Actualizar interés
export const updateInterest = async (interestId, interestData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/interests/${interestId}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(interestData),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating interest:", error);
    throw error;
  }
};

// Eliminar interés
export const deleteInterest = async (interestId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/interests/${interestId}`, {
      method: "DELETE",
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error deleting interest:", error);
    throw error;
  }
};

// Cargar datos de muestra para intereses

export const loadSampleInterests = async () => {
  const response = await fetch(`${API_BASE_URL}/import`, {
    method: "POST",
    headers: {
      ...getHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(sampleData),
  });

  console.log("Response:", JSON.stringify(sampleData));

  if (!response.ok) throw new Error("Error al importar datos");

  return await response.json();
};

// === AFFINITY GRAPH APIs ===

// Obtener datos del grafo de afinidad
export const getAffinityGraphData = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/affinity-graph/data`, {
      method: "GET",
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching affinity graph data:", error);
    throw error;
  }
};

// Encontrar ruta más corta entre estudiantes
export const findShortestPath = async (student1, student2) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/affinity-graph/shortest-path?student1=${encodeURIComponent(student1)}&student2=${encodeURIComponent(student2)}`,
      {
        method: "GET",
        headers: getHeaders(),
      },
    );

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error finding shortest path:", error);
    throw error;
  }
};

// Refrescar grafo de afinidad
export const refreshAffinityGraph = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/affinity-graph/refresh`, {
      method: "POST",
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error refreshing affinity graph:", error);
    throw error;
  }
};

// === ANALYTICS APIs ===

// Obtener datos completos de analytics
export const getAnalyticsDashboard = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/analytics/dashboard`, {
      method: "GET",
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching analytics dashboard:", error);
    throw error;
  }
};

// Obtener actividad por tema
export const getTopicActivity = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/analytics/topic-activity`, {
      method: "GET",
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching topic activity:", error);
    throw error;
  }
};

// Obtener niveles de participación
export const getParticipationLevels = async () => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/analytics/participation-levels`,
      {
        method: "GET",
        headers: getHeaders(),
      },
    );

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching participation levels:", error);
    throw error;
  }
};

// Obtener detección de comunidades
export const getCommunityDetection = async () => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/analytics/community-detection`,
      {
        method: "GET",
        headers: getHeaders(),
      },
    );

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching community detection:", error);
    throw error;
  }
};

// Actualizar usuario (admin)
export const updateUserAdmin = async (userId, userData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorBody = await response.json();
      throw new Error(errorBody.message || `Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
};

// Actualizar contenido (admin)
export const updateContentAdmin = async (contentId, contentData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/content/${contentId}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(contentData),
    });

    if (!response.ok) {
      const errorBody = await response.json();
      throw new Error(errorBody.message || `Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating content:", error);
    throw error;
  }
};
