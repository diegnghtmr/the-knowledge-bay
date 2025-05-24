import React, { useState } from "react";
import { Search, Plus, Eye, Pencil, Lock, Trash2, Star, Users2, Network, BarChart2 } from "lucide-react";
import { Link } from "react-router-dom";

/**
 * Componente de tarjeta para reportes
 */
const ReportCard = ({ icon, title, link }) => (
  <Link to={link} className="block">
    <div className="flex items-center gap-3 border border-[var(--coastal-sea)]/30 hover:border-[var(--coastal-sea)] p-4 transition-colors cursor-pointer select-none rounded-md shadow-sm bg-white hover:bg-[var(--sand)]/30">
      <div className="shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-[var(--coastal-sea)]/10 text-[var(--coastal-sea)]">
        {icon}
      </div>
      <div className="p-0 font-workSans-bold text-sm text-[var(--deep-sea)]">{title}</div>
    </div>
  </Link>
);

/**
 * Componente de encabezado de tabla
 */
const TH = ({ children, className = "" }) => (
  <th className={`px-4 py-3 text-left font-workSans-bold text-[var(--open-sea)] ${className}`}>{children}</th>
);

/**
 * Componente de celda de tabla
 */
const TD = ({ children, className = "" }) => (
  <td className={`px-4 py-3 border-t border-[var(--coastal-sea)]/10 ${className}`}>{children}</td>
);

/**
 * Dashboard de gestión de usuarios
 */
const UserDashboard = () => {
  // Datos iniciales
  const initialUsers = [
    { id: 1, name: "Usuario1", email: "Usuario1@gmail.com", role: "Estudiante" },
    { id: 2, name: "Usuario2", email: "Usuario2@gmail.com", role: "Profesor" },
    { id: 3, name: "Usuario3", email: "Usuario3@gmail.com", role: "Estudiante" },
    { id: 4, name: "Usuario4", email: "Usuario4@gmail.com", role: "Estudiante" }
  ];

  // Estado para la búsqueda
  const [query, setQuery] = useState("");
  
  // Filtrar usuarios según la búsqueda
  const filtered = initialUsers.filter((u) =>
    `${u.name} ${u.email} ${u.role}`.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="w-full space-y-8">
      {/* Título y descripción */}
      <div className="mb-6">
        <h2 className="font-righteous text-2xl text-[var(--deep-sea)] mb-2">Panel de Control</h2>
        <p className="text-[var(--open-sea)]/80">Administra usuarios, consulta estadísticas y gestiona permisos</p>
      </div>

      {/* Buscador */}
      <div className="flex flex-wrap items-end gap-4 bg-white p-6 rounded-lg shadow-sm">
        <div className="flex-1 min-w-[250px]">
          <label htmlFor="search-usr" className="block text-sm font-workSans-bold mb-2 text-[var(--open-sea)]">
            Buscar Usuario:
          </label>
          <div className="relative">
            <input
              id="search-usr"
              className="w-full pl-10 pr-3 py-2 border border-[var(--coastal-sea)]/20 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--coastal-sea)]/50 focus:border-transparent"
              placeholder="Nombre, correo o rol..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--coastal-sea)]/50" size={18} />
          </div>
        </div>
        <button className="flex gap-1 items-center px-5 py-2 border border-[var(--coastal-sea)]/20 rounded-md hover:border-[var(--coastal-sea)]/50 text-[var(--deep-sea)] transition-colors">
          <Search size={18} /> Buscar
        </button>
        <button className="flex gap-1 items-center px-5 py-2 rounded-md bg-[var(--coastal-sea)] text-white hover:bg-opacity-90 transition-colors">
          <Plus size={18} /> Añadir Usuario
        </button>
      </div>

      {/* Listado + reportes */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="md:col-span-3 overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-workSans-bold text-lg text-[var(--open-sea)]">Lista de Usuarios</h2>
            <div className="text-sm text-[var(--open-sea)]/70">
              Mostrando {filtered.length} usuarios
            </div>
          </div>
          
          <div className="bg-white rounded-lg overflow-hidden shadow-sm">
            <table className="min-w-full text-sm divide-y divide-[var(--coastal-sea)]/10">
              <thead className="bg-[var(--sand)]/50">
                <tr>
                  <TH>Usuario</TH>
                  <TH>Correo</TH>
                  <TH>Rol</TH>
                  <TH className="text-center">Acciones</TH>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u.id} className="odd:bg-white even:bg-[var(--sand)]/20 hover:bg-[var(--coastal-sea)]/5 transition-colors">
                    <TD className="font-workSans-bold text-[var(--deep-sea)]">{u.name}</TD>
                    <TD>{u.email}</TD>
                    <TD>{u.role}</TD>
                    <TD>
                      <div className="flex items-center justify-center gap-4">
                        <button className="text-[var(--open-sea)]/60 hover:text-[var(--coastal-sea)] transition-colors">
                          <Eye size={18} />
                        </button>
                        <button className="text-[var(--open-sea)]/60 hover:text-[var(--coastal-sea)] transition-colors">
                          <Pencil size={18} />
                        </button>
                        <button className="text-[var(--open-sea)]/60 hover:text-[var(--coastal-sea)] transition-colors">
                          <Lock size={18} />
                        </button>
                        <button className="text-[var(--open-sea)]/60 hover:text-red-500 transition-colors">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </TD>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        <aside>
          <h2 className="font-workSans-bold text-lg mb-4 text-[var(--open-sea)]">Reportes y Análisis</h2>
          <div className="space-y-4">
            <ReportCard 
              icon={<Star size={22} />} 
              title="Contenidos más valorados" 
              link="/admin/stats"
            />
            <ReportCard 
              icon={<Users2 size={22} />} 
              title="Estudiantes con más conexiones" 
              link="/admin/stats"
            />
            <ReportCard 
              icon={<Network size={22} />} 
              title="Detectar clusters" 
              link="/admin/analytics"
            />
            <ReportCard 
              icon={<BarChart2 size={22} />} 
              title="Niveles de participación" 
              link="/admin/analytics"
            />
          </div>

          <h2 className="font-workSans-bold text-lg mb-4 mt-8 text-[var(--open-sea)]">Gestión Avanzada</h2>
          <div className="space-y-4">
            <ReportCard 
              icon={<Plus size={22} />} 
              title="Gestión de Intereses" 
              link="/admin/interests"
            />
            <ReportCard 
              icon={<Search size={22} />} 
              title="Solicitudes de Ayuda" 
              link="/admin/help-requests"
            />
          </div>
        </aside>
      </div>
    </div>
  );
};

export default UserDashboard; 