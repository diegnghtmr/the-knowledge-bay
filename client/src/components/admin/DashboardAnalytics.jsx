import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { BarChart2, TrendingUp, Network, RefreshCw } from "lucide-react";
import { getAnalyticsDashboard } from "../../services/adminApi";

/**
 * Panel analítico para administradores que muestra estadísticas y análisis
 */
export default function DashboardAnalytics() {
  const [analyticsData, setAnalyticsData] = useState({
    topicActivity: [],
    participationLevels: [],
    communityClusters: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      console.log("Loading analytics data...");
      const data = await getAnalyticsDashboard();
      console.log("Analytics data received:", data);
      
      setAnalyticsData({
        topicActivity: data.topicActivity || [],
        participationLevels: data.participationLevels || [],
        communityClusters: data.communityClusters || []
      });
      setError("");
    } catch (error) {
      setError(`Error al cargar los datos analíticos: ${error.message}`);
      console.error("Error loading analytics data:", error);
      
      // Only use fallback if we can't reach the server at all
      if (error.message.includes('fetch')) {
        setAnalyticsData({
          topicActivity: [
            { topic: "Matemáticas", contents: 12 },
            { topic: "Ciencias", contents: 9 },
            { topic: "Historia", contents: 15 },
          ],
          participationLevels: [
            { week: "Sem 1", activity: 20 },
            { week: "Sem 2", activity: 35 },
            { week: "Sem 3", activity: 40 },
            { week: "Sem 4", activity: 60 },
          ],
          communityClusters: [
            { id: 1, topic: "STEM Avanzado", students: "Ana, Luis, Sofía" },
            { id: 2, topic: "Literatura", students: "Carlos, Diana" },
            { id: 3, topic: "Historia y Arte", students: "Miguel, Elena, Pedro" },
          ]
        });
      } else {
        // Server responded but with empty/error data - use empty arrays
        setAnalyticsData({
          topicActivity: [],
          participationLevels: [],
          communityClusters: []
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream-custom p-8 font-workSans">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-righteous text-[var(--deep-sea)]">Panel Analítico</h1>
          <p className="text-sm text-[var(--open-sea)]/80 mt-1">
            Visión general de la actividad y las comunidades de estudiantes
          </p>
        </div>
        <button
          onClick={loadAnalyticsData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--coastal-sea)] text-white rounded-md hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Cargando...' : 'Actualizar'}
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 border border-red-200 p-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {loading && (
        <div className="mb-4 rounded-md bg-blue-50 border border-blue-200 p-3">
          <p className="text-sm text-blue-600">Cargando datos analíticos...</p>
        </div>
      )}

      {/* Grid principal */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Actividad por Tema */}
        <div className="rounded-2xl border border-[var(--coastal-sea)]/30 bg-white p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
          <div className="flex items-center gap-2 mb-2">
            <BarChart2 size={20} className="text-[var(--coastal-sea)]" />
            <h2 className="text-lg font-workSans-semibold text-[var(--deep-sea)]">Actividad por Tema</h2>
          </div>
          <p className="mb-4 text-sm text-[var(--open-sea)]/80">
            Distribución de contenidos por tema
          </p>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analyticsData.topicActivity} barSize={32} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="topic" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{ fill: "rgba(0,0,0,0.05)" }}
                  formatter={(value) => [`${value} contenidos`, 'Cantidad']}
                  labelFormatter={(label) => `Tema: ${label}`}
                />
                <Bar dataKey="contents" name="Contenidos" radius={[4, 4, 0, 0]} fill="var(--coastal-sea)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Niveles de Participación */}
        <div className="rounded-2xl border border-[var(--coastal-sea)]/30 bg-white p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={20} className="text-[var(--coastal-sea)]" />
            <h2 className="text-lg font-workSans-semibold text-[var(--deep-sea)]">Niveles de Participación</h2>
          </div>
          <p className="mb-4 text-sm text-[var(--open-sea)]/80">Actividad de estudiantes por semana</p>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analyticsData.participationLevels} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="week" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{ fill: "rgba(0,0,0,0.05)" }}
                  formatter={(value) => [`${value} acciones`, 'Actividad']}
                  labelFormatter={(label) => `${label}`}
                />
                <Line
                  type="monotone"
                  name="Actividad"
                  dataKey="activity"
                  stroke="var(--coastal-sea)"
                  strokeWidth={3}
                  dot={{ r: 4, strokeWidth: 2, fill: "white", stroke: "var(--coastal-sea)" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Detección de Comunidades (ancho completo) */}
        <div className="rounded-2xl border border-[var(--coastal-sea)]/30 bg-white p-6 shadow-sm hover:shadow-md transition-shadow duration-300 lg:col-span-2">
          <div className="flex items-center gap-2 mb-2">
            <Network size={20} className="text-[var(--coastal-sea)]" />
            <h2 className="text-lg font-workSans-semibold text-[var(--deep-sea)]">Detección de Comunidades</h2>
          </div>
          <p className="mb-4 text-sm text-[var(--open-sea)]/80">
            Clusters de estudiantes con intereses similares
          </p>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-[var(--sand)]/30">
                <tr>
                  <th className="py-3 px-4 font-workSans-medium text-[var(--open-sea)]">ID</th>
                  <th className="py-3 px-4 font-workSans-medium text-[var(--open-sea)]">Tema</th>
                  <th className="py-3 px-4 font-workSans-medium text-[var(--open-sea)]">Estudiantes</th>
                </tr>
              </thead>
              <tbody>
                {analyticsData.communityClusters.map((cluster) => (
                  <tr key={cluster.id} className="border-t border-[var(--coastal-sea)]/10 hover:bg-[var(--sand)]/30">
                    <td className="py-3 px-4 text-[var(--deep-sea)] font-workSans-medium">#{cluster.id}</td>
                    <td className="py-3 px-4 text-[var(--deep-sea)]">{cluster.topic}</td>
                    <td className="py-3 px-4 text-[var(--deep-sea)]">{cluster.students}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
} 