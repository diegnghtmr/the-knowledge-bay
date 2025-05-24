import React from "react";
import { Users, FileText, HelpCircle, Users2, Award, Mail, TrendingUp } from "lucide-react";

// ────────────────────────────────────────────────────────────────
// Mock data – reemplaza con tu API
// ────────────────────────────────────────────────────────────────
const kpis = [
  { id: 1, label: "Total Usuarios", value: 777, icon: <Users size={20} />, increase: "+12% ↑" },
  { id: 2, label: "Total Contenidos", value: 777, icon: <FileText size={20} />, increase: "+8% ↑" },
  { id: 3, label: "Total Solicitudes", value: 777, icon: <HelpCircle size={20} />, increase: "+15% ↑" },
  { id: 4, label: "Total Grupos", value: 777, icon: <Users2 size={20} />, increase: "+5% ↑" },
];

const mostValued = [
  { id: 1, title: "Matemáticas Avanzadas", author: "Juan Pérez", likes: 125 },
  { id: 2, title: "Álgebra Lineal", author: "Ana López", likes: 98 },
  { id: 3, title: "Programación en Python", author: "Carla Gómez", likes: 87 },
  { id: 4, title: "Comprensión Lectora", author: "Mario Ruiz", likes: 76 },
  { id: 5, title: "Historia Moderna", author: "Laura Torres", likes: 65 },
];

const mostConnected = [
  { id: 1, username: "jperez", email: "jperez@mail.com", connections: 42 },
  { id: 2, username: "alopez", email: "alopez@mail.com", connections: 38 },
  { id: 3, username: "cgomez", email: "cgomez@mail.com", connections: 34 },
  { id: 4, username: "mruiz", email: "mruiz@mail.com", connections: 29 },
  { id: 5, username: "ltorres", email: "ltorres@mail.com", connections: 27 },
];

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
            {mostValued.map((item) => (
              <RankItem
                key={item.id}
                rank={item.id}
                primary={item.title}
                secondary={`Autor: ${item.author}`}
                metric={item.likes}
                metricLabel="likes"
              />
            ))}
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
            {mostConnected.map((item) => (
              <RankItem
                key={item.id}
                rank={item.id}
                primary={item.username}
                secondary={item.email}
                metric={item.connections}
                metricLabel="conexiones"
              />
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
} 