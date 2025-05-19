import React, { useState } from "react";
import { Search, Plus, Eye, Pencil, Trash2, Star, FileText, Video, Link2 } from "lucide-react";

/**
 * Componente de valoración con estrellas
 */
const StarRating = ({ value }) => (
  <div className="flex gap-0.5 text-yellow-500">
    {Array.from({ length: 5 }).map((_, i) => (
      <Star key={i} size={16} fill={i < value ? "currentColor" : "none"} />
    ))}
  </div>
);

/**
 * Componente de entrada etiquetada
 */
const LabeledInput = ({ id, label, value, onChange, type = "text", placeholder }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-workSans-bold mb-2 text-[var(--open-sea)]">
      {label}
    </label>
    <div className="relative">
      <input
        id={id}
        type={type}
        className="w-full pl-10 pr-3 py-2 border border-[var(--coastal-sea)]/20 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--coastal-sea)]/50 focus:border-transparent"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--coastal-sea)]/50" size={18} />
    </div>
  </div>
);

/**
 * Componente de selección etiquetada
 */
const LabeledSelect = ({ id, label, options, value, onChange }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-workSans-bold mb-2 text-[var(--open-sea)]">
      {label}
    </label>
    <select
      id={id}
      className="w-full h-10 border border-[var(--coastal-sea)]/20 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--coastal-sea)]/50 focus:border-transparent bg-white"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  </div>
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
 * Icono según el tipo de contenido
 */
const TypeIcon = ({ type }) => {
  switch (type) {
    case "PDF":
      return <FileText size={16} className="mr-1" />;
    case "Video":
      return <Video size={16} className="mr-1" />;
    case "Link":
      return <Link2 size={16} className="mr-1" />;
    default:
      return null;
  }
};

/**
 * Dashboard de gestión de contenidos
 */
const ContentDashboard = () => {
  // Contenidos iniciales
  const initialContents = [
    { id: 1, title: "Matemáticas Avanzadas", info: "", author: "Juan Perez", date: "2025-05-20", type: "PDF", rating: 5 },
    { id: 2, title: "Álgebra Lineal", info: "", author: "Ana Lopez", date: "2025-06-15", type: "Video", rating: 4 },
    { id: 3, title: "Programación en Python", info: "", author: "Carla Gomez", date: "2025-07-02", type: "Link", rating: 3 },
    { id: 4, title: "Comprensión Lectora", info: "", author: "Mario Ruiz", date: "2025-08-10", type: "PDF", rating: 4 }
  ];

  // Estados para filtros
  const [query, setQuery] = useState("");
  const [selectedType, setSelectedType] = useState("Todos");
  
  // Tipos de contenido para filtrar
  const contentTypes = ["Todos", "PDF", "Video", "Link"];
  
  // Filtrar contenidos según búsqueda y tipo
  const filtered = initialContents.filter(
    (c) =>
      (selectedType === "Todos" || c.type === selectedType) &&
      `${c.title} ${c.author}`.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="w-full space-y-8">
      {/* Título y descripción */}
      <div className="mb-6">
        <h2 className="font-righteous text-2xl text-[var(--deep-sea)] mb-2">Biblioteca de Contenidos</h2>
        <p className="text-[var(--open-sea)]/80">Gestiona, organiza y accede a todos los materiales educativos</p>
      </div>

      {/* Buscador y filtros */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <LabeledInput
              id="search-content"
              label="Buscar Contenido:"
              value={query}
              onChange={setQuery}
              placeholder="Título o autor..."
            />
          </div>
          <div>
            <LabeledSelect
              id="filter-type"
              label="Filtrar por Tipo:"
              options={contentTypes}
              value={selectedType}
              onChange={setSelectedType}
            />
          </div>
          <div className="flex items-end">
            <button className="flex gap-1 items-center px-5 py-2 rounded-md bg-[var(--coastal-sea)] text-white hover:bg-opacity-90 transition-colors">
              <Plus size={18} /> Añadir Contenido
            </button>
          </div>
        </div>
      </div>

      {/* Tabla de contenidos */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-workSans-bold text-lg text-[var(--open-sea)]">Contenidos Disponibles</h2>
          <div className="text-sm text-[var(--open-sea)]/70">
            Mostrando {filtered.length} elementos
          </div>
        </div>
        
        <div className="bg-white rounded-lg overflow-hidden shadow-sm">
          <table className="min-w-full text-sm divide-y divide-[var(--coastal-sea)]/10">
            <thead className="bg-[var(--sand)]/50">
              <tr>
                <TH>Título</TH>
                <TH>Autor</TH>
                <TH>Fecha</TH>
                <TH>Tipo</TH>
                <TH>Valoración</TH>
                <TH className="text-center">Acciones</TH>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className="odd:bg-white even:bg-[var(--sand)]/20 hover:bg-[var(--coastal-sea)]/5 transition-colors">
                  <TD className="font-workSans-bold text-[var(--deep-sea)]">{c.title}</TD>
                  <TD>{c.author}</TD>
                  <TD>{c.date}</TD>
                  <TD>
                    <span 
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-workSans-bold ${
                        c.type === "PDF" 
                          ? "bg-blue-100 text-blue-800" 
                          : c.type === "Video" 
                          ? "bg-green-100 text-green-800" 
                          : "bg-purple-100 text-purple-800"
                      }`}
                    >
                      <TypeIcon type={c.type} /> {c.type}
                    </span>
                  </TD>
                  <TD>
                    <StarRating value={c.rating} />
                  </TD>
                  <TD>
                    <div className="flex items-center justify-center gap-4">
                      <button className="text-[var(--open-sea)]/60 hover:text-[var(--coastal-sea)] transition-colors">
                        <Eye size={18} />
                      </button>
                      <button className="text-[var(--open-sea)]/60 hover:text-[var(--coastal-sea)] transition-colors">
                        <Pencil size={18} />
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
        
        {/* Indicador cuando no hay resultados */}
        {filtered.length === 0 && (
          <div className="text-center py-8 text-[var(--open-sea)]/70">
            No se encontraron resultados para tu búsqueda.
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentDashboard; 