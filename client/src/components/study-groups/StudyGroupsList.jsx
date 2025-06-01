import React from "react";
import { Search } from "lucide-react";

// Group card component
const GroupCard = ({ group, onSelectGroup }) => (
  <div
    className="bg-white rounded-lg shadow-md overflow-hidden transform hover:scale-105 transition-transform duration-300 ease-in-out cursor-pointer flex flex-col border border-gray-100"
    onClick={() => onSelectGroup(group)}
  >
    <img
      src={group.heroImage || "https://placehold.co/600x300/4A5568/FFFFFF?text=Grupo"}
      alt={`Imagen de ${group.name}`}
      className="w-full h-48 object-cover"
      onError={(e) => (e.target.src = "https://placehold.co/600x300/4A5568/FFFFFF?text=Error+Img")}
    />
    <div className="p-5 flex flex-col flex-grow">
      <h2 className="text-xl font-semibold mb-2 text-[var(--coastal-sea)]">
        {group.name}
      </h2>
      <p className="text-sm text-gray-600 mb-4">
        <span className="font-medium text-gray-700">Interés:</span> {group.interest}
      </p>
      <div className="flex justify-between items-center text-xs text-gray-500 mt-auto">
        <span>{group.members} miembros</span>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onSelectGroup(group);
        }}
        className="mt-4 w-full bg-[var(--coastal-sea)] hover:bg-[var(--open-sea)] text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg"
      >
        Ver Grupo
      </button>
    </div>
  </div>
);

// Main component for the list of study groups
const StudyGroupsList = ({
  groups,
  onSelectGroup,
  searchTerm,
  onSearchChange,
  originalGroupsCount,
}) => {
  return (
    <div className="container mx-auto p-4 sm:p-6">
      <div className="mb-8">
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar grupos por nombre o interés..."
            className="w-full p-3 pl-10 rounded-lg border border-gray-300 text-gray-700 placeholder-gray-500 focus:ring-2 focus:ring-[var(--coastal-sea)] focus:border-transparent focus:outline-none transition-all"
            value={searchTerm}
            onChange={onSearchChange}
          />
          <Search
            size={20}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          />
        </div>
      </div>

      {groups.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group) => (
            <GroupCard key={group.id} group={group} onSelectGroup={onSelectGroup} />
          ))}
        </div>
      ) : searchTerm ? (
        <p className="text-center text-gray-500 text-lg mt-10">
          No se encontraron grupos con "{searchTerm}". Intenta otra búsqueda.
        </p>
      ) : (
        <p className="text-center text-gray-500 text-lg mt-10">
          No hay grupos de estudio disponibles en este momento.
        </p>
      )}
    </div>
  );
};

export default StudyGroupsList; 