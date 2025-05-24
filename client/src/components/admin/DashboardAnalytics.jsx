import React from "react";
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
import { BarChart2, TrendingUp, Network } from "lucide-react";

// --- Mock data --------------------------------------------------------------
const barData = [
  { topic: "Matemáticas", contents: 12 },
  { topic: "Ciencias", contents: 9 },
  { topic: "Historia", contents: 15 },
];

const lineData = [
  { week: "Sem 1", activity: 20 },
  { week: "Sem 2", activity: 35 },
  { week: "Sem 3", activity: 40 },
  { week: "Sem 4", activity: 60 },
];

const clusters = [
  { id: 1, topic: "STEM Avanzado", students: "Ana, Luis, Sofía" },
  { id: 2, topic: "Literatura", students: "Carlos, Diana" },
  { id: 3, topic: "Historia y Arte", students: "Miguel, Elena, Pedro" },
];

/**
 * Panel analítico para administradores que muestra estadísticas y análisis
 */
export default function DashboardAnalytics() {
  return (
    <div className="min-h-screen bg-cream-custom p-8 font-workSans">
      <div className="mb-6">
        <h1 className="text-2xl font-righteous text-[var(--deep-sea)]">Panel Analítico</h1>
        <p className="text-sm text-[var(--open-sea)]/80 mt-1">
          Visión general de la actividad y las comunidades de estudiantes
        </p>
      </div>

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
              <BarChart data={barData} barSize={32} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
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
              <LineChart data={lineData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
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
                {clusters.map((cluster) => (
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