import React from 'react';
import PropTypes from 'prop-types';

const InterestTag = ({ name }) => {
  return (
    <span className="bg-[var(--coastal-sea)]/20 text-[var(--coastal-sea)] text-xs py-1 px-3 rounded-full">
      {name}
    </span>
  );
};

InterestTag.propTypes = {
  name: PropTypes.string.isRequired,
};

export default InterestTag;