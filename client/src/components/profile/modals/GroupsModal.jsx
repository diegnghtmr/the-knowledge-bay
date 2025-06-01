import React from 'react';
import PropTypes from 'prop-types';
import ImprovedModalBase from './ImprovedModalBase';
import ListItem from './ListItem';
import { UsersIcon } from '@heroicons/react/24/solid';
import { useNavigate } from 'react-router-dom';

const GroupsModal = ({ groups, onClose }) => {
  const navigate = useNavigate();

  const handleViewGroup = (groupId) => {
    // Aquí iría la lógica para navegar al grupo
    console.log(`Ver grupo con ID: ${groupId}`);
    // En implementación real: history.push(`/groups/${groupId}`);
    navigate(`/study-groups`, { state: { groupId: groupId } });
    onClose();
  };

  return (
    <ImprovedModalBase 
      title="Grupos" 
      onClose={onClose}
      customIcon={UsersIcon}
    >
      <div className="space-y-1">
        {groups.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No perteneces a ningún grupo aún.</p>
        ) : (
          groups.map(group => (
            <ListItem
              key={group.id}
              name={group.name}
              onView={() => handleViewGroup(group.id)}
            />
          ))
        )}
      </div>
    </ImprovedModalBase>
  );
};

GroupsModal.propTypes = {
  groups: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired
    })
  ).isRequired,
  onClose: PropTypes.func.isRequired
};

export default GroupsModal; 