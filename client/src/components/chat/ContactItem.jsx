const ContactItem = ({ contact, isSelected, onClick }) => {
  const formatDate = timestamp => {
    const date = new Date(timestamp);
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    }
    if (date.toDateString() === yesterday.toDateString()) return 'Ayer';
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
  };

  const preview = contact.lastMessage?.text ?? '';

  return (
    <button
      type="button"
      className="block w-full py-3 px-4 my-3 cursor-pointer text-left transition-colors duration-150 rounded-xl"
      aria-current={isSelected ? 'true' : undefined}
      style={{
        backgroundColor: isSelected ? 'var(--coastal-sea)' : 'white',
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
      }}
      onClick={onClick}
    >
      <span className="flex justify-between items-start gap-2">
        <span className="font-medium text-base truncate" style={{ color: isSelected ? 'var(--deep-sea)' : 'var(--open-sea)' }}>
          {contact.username}
        </span>
        {contact.lastMessage && (
          <span className="text-xs whitespace-nowrap" style={{ color: 'var(--deep-sea)' }}>
            {formatDate(contact.lastMessage.timestamp)}
          </span>
        )}
      </span>
      {contact.lastMessage && (
        <span className="block text-sm mt-1 truncate" style={{ color: 'var(--deep-sea)' }}>
          {preview.length > 40 ? `${preview.substring(0, 40)}...` : preview}
        </span>
      )}
    </button>
  );
};

export default ContactItem;
