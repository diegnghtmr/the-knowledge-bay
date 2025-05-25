import React, { useState, useEffect } from "react";
import { Users, FileText, HelpCircle, Users2, Award, Mail, TrendingUp } from "lucide-react";
import { getAdminStats } from "../../services/adminApi";
import LoadingSpinner from "../common/LoadingSpinner";

// ────────────────────────────────────────────────────────────────
// UI helpers
// ────────────────────────────────────────────────────────────────
/**
 * Tarjeta de indicador clave de rendimiento
 */
const KPIBox = ({ label, value, icon, increase }) => (
  <div className="flex flex-col justify-between rounded-2xl border border-[var(--coastal-sea)]/30 bg-white p-4 shadow-sm hover:shadow-md transition-shadow duration-300 md:p-6">
    <div className="flex items-center justify-between mb-2">
      <span className="text-sm font-workSans-medium text-[var(--open-sea)]">{label}</span>
      <div className="text-[var(--coastal-sea)]">{icon}</div>
    </div>
    <div className="flex items-end justify-between">
      <span className="text-2xl font-righteous text-[var(--deep-sea)] md:text-3xl">{value}</span>
      {increase && (
        <span className="text-xs font-workSans-medium text-green-600">{increase}</span>
      )}
    </div>
  </div>
);

/**
 * Elemento de lista para mostrar rankings
 */
const RankItem = ({ rank, primary, secondary, icon, metric, metricLabel }) => (
  <li className="flex gap-3 text-sm md:text-base p-3 hover:bg-[var(--sand)]/30 rounded-lg transition-colors duration-200">
    <span className="flex items-center justify-center min-w-7 h-7 rounded-full bg-[var(--coastal-sea)]/10 text-[var(--coastal-sea)] font-workSans-semibold">
      {rank}
    </span>
    <div className="flex flex-col flex-1">
      <span className="font-workSans-medium text-[var(--deep-sea)] truncate max-w-[13rem] md:max-w-[16rem]">
        {primary}
      </span>
      <span className="text-xs text-[var(--open-sea)]/70 truncate max-w-[13rem] md:max-w-[16rem]">
        {secondary}
      </span>
    </div>
    {metric && (
      <div className="flex flex-col items-end">
        <span className="font-workSans-semibold text-[var(--coastal-sea)]">{metric}</span>
        <span className="text-xs text-[var(--open-sea)]/70">{metricLabel}</span>
      </div>
    )}
    {icon && <div className="text-[var(--coastal-sea)]">{icon}</div>}
  </li>
);

/**
 * Panel de estadísticas de administrador que muestra KPIs y listas de ranking
 */
export default function AdminDashboardStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await getAdminStats();
        setStats(data);
      } catch (err) {
        setError('Error al cargar las estadísticas');
        console.error('Error fetching admin stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-cream-custom p-8 font-workSans flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-cream-custom p-8 font-workSans">
        <div className="text-center text-red-600">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  const kpis = [
    { 
      id: 1, 
      label: "Total Usuarios", 
      value: stats?.kpis?.totalUsers || 0, 
      icon: <Users size={20} />, 
      increase: "+12% ↑" 
    },
    { 
      id: 2, 
      label: "Total Contenidos", 
      value: stats?.kpis?.totalContent || 0, 
      icon: <FileText size={20} />, 
      increase: "+8% ↑" 
    },
    { 
      id: 3, 
      label: "Total Solicitudes", 
      value: stats?.kpis?.totalHelpRequests || 0, 
      icon: <HelpCircle size={20} />, 
      increase: "+15% ↑" 
    },
    { 
      id: 4, 
      label: "Total Grupos", 
      value: stats?.kpis?.totalGroups || 0, 
      icon: <Users2 size={20} />, 
      increase: "+5% ↑" 
    },
  ];

  return (
    <div className="min-h-screen bg-cream-custom p-8 font-workSans">
      <div className="mb-6">
        <h1 className="text-2xl font-righteous text-[var(--deep-sea)]">Panel de Estadísticas</h1>
        <p className="text-sm text-[var(--open-sea)]/80 mt-1">
          Resumen de métricas y actividad de la plataforma
        </p>
      </div>
      
      {/* KPI Grid */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <KPIBox key={kpi.id} label={kpi.label} value={kpi.value} icon={kpi.icon} increase={kpi.increase} />
        ))}
      </div>

      {/* Sección de Título */}
      <div className="mb-6">
        <h2 className="text-xl font-workSans-semibold text-[var(--deep-sea)] flex items-center gap-2">
          <TrendingUp size={20} className="text-[var(--coastal-sea)]" />
          Resumen de Actividad
        </h2>
        <p className="text-sm text-[var(--open-sea)]/80">
          Estadísticas de los contenidos y usuarios más activos en la plataforma
        </p>
      </div>

      {/* Top Lists */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Most Valued Content */}
        <div className="rounded-2xl border border-[var(--coastal-sea)]/30 bg-white p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
          <div className="flex items-center gap-2 mb-2">
            <Award size={20} className="text-[var(--coastal-sea)]" />
            <h2 className="text-lg font-workSans-semibold text-[var(--deep-sea)]">Contenidos Más Valorados</h2>
          </div>
          <p className="mb-4 text-sm text-[var(--open-sea)]/80">Top 5 contenidos por cantidad de likes</p>
          <ol className="space-y-2">
            {stats?.mostValuedContent?.map((item, index) => (
              <RankItem
                key={item.id}
                rank={index + 1}
                primary={item.title}
                secondary={`Autor: ${item.author}`}
                metric={item.likes}
                metricLabel="likes"
              />
            )) || (
              <li className="text-center text-[var(--open-sea)]/70 py-4">
                No hay contenidos disponibles
              </li>
            )}
          </ol>
        </div>

        {/* More Connected Students */}
        <div className="rounded-2xl border border-[var(--coastal-sea)]/30 bg-white p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
          <div className="flex items-center gap-2 mb-2">
            <Users2 size={20} className="text-[var(--coastal-sea)]" />
            <h2 className="text-lg font-workSans-semibold text-[var(--deep-sea)]">Estudiantes Más Conectados</h2>
          </div>
          <p className="mb-4 text-sm text-[var(--open-sea)]/80">Top 5 estudiantes por conexiones</p>
          <ol className="space-y-2">
            {stats?.mostConnectedUsers?.map((item, index) => (
              <RankItem
                key={item.id}
                rank={index + 1}
                primary={item.username}
                secondary={item.email}
                metric={item.connections}
                metricLabel="conexiones"
              />
            )) || (
              <li className="text-center text-[var(--open-sea)]/70 py-4">
                No hay usuarios disponibles
              </li>
            )}
          </ol>
        </div>
      </div>
    </div>
  );
} 