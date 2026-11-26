import { useEffect, useState } from 'react';
import ContactItem from './ContactItem';
import { searchContacts } from '../../services/chatApi';

const ContactList = ({ contacts, onSelectContact, selectedContact }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const query = searchTerm.trim();

  useEffect(() => {
    if (!query) return;
    let current = true;
    const delaySearch = setTimeout(async () => {
      try {
        const matches = await searchContacts(query);
        if (current) setSearchResult({ query, matches });
      } catch {
        if (current) setSearchResult({ query, error: true });
      }
    }, 300);
    return () => {
      current = false;
      clearTimeout(delaySearch);
    };
  }, [query]);

  const handleSearchChange = value => {
    if (value.trim() !== query) setSearchResult(null);
    setSearchTerm(value);
  };

  const isSearching = Boolean(query) && searchResult?.query !== query;
  const matchingIds = new Set(searchResult?.matches?.map(contact => contact.id));
  const conversationsById = new Map(contacts.map(contact => [contact.id, contact]));
  const visibleContacts = query ? [
    ...contacts.filter(contact => matchingIds.has(contact.id)),
    ...(searchResult?.matches ?? []).filter(contact => !conversationsById.has(contact.id)),
  ] : contacts;

  return (
    <div className="flex flex-col h-full rounded-xl overflow-hidden" style={{ backgroundColor: 'var(--sand)' }}>
      <div className="p-4 sticky top-0 z-10 shadow-sm" style={{ backgroundColor: 'var(--sand)' }}>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style={{ color: 'var(--deep-sea)' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            type="text"
            aria-label="Buscar conversaciones por nombre o correo"
            placeholder="Buscar conversaciones"
            className="w-full p-3 pl-10 text-sm rounded-full focus:outline-none"
            style={{ backgroundColor: 'white', color: 'var(--deep-sea)' }}
            value={searchTerm}
            onChange={event => handleSearchChange(event.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-2" style={{ backgroundColor: 'var(--sand)' }}>
        {isSearching ? (
          <div className="flex justify-center items-center p-8">
            <div className="animate-pulse flex flex-col items-center">
              <p style={{ color: 'var(--deep-sea)' }} className="text-sm">Buscando...</p>
            </div>
          </div>
        ) : searchResult?.error ? (
          <p role="alert" className="p-4 text-sm text-red-500">No se pudieron buscar los contactos.</p>
        ) : visibleContacts.length > 0 ? (
          <div>
            {query && (
              <div className="px-4 py-2 text-xs mb-2 wrap-anywhere" style={{ backgroundColor: 'var(--open-sea)', color: 'white', borderRadius: '8px' }}>
                Resultados para "{searchTerm}"
              </div>
            )}
            {visibleContacts.map(contact => (
              <ContactItem
                key={contact.id}
                contact={contact}
                isSelected={selectedContact?.id === contact.id}
                onClick={() => onSelectContact(contact)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-8 text-center h-64">
            <p className="font-medium" style={{ color: 'var(--deep-sea)' }}>No se encontraron contactos</p>
            <p className="text-sm mt-1" style={{ color: 'var(--open-sea)' }}>
              {query ? 'Intenta con otro término de búsqueda' : 'Busca por nombre o correo para comenzar una conversación.'}
            </p>
            {searchTerm && (
              <button
                type="button"
                onClick={() => handleSearchChange('')}
                className="mt-4 hover:underline text-sm"
                style={{ color: 'var(--coastal-sea)' }}
              >
                Limpiar búsqueda
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactList;
