import React from 'react';

const GlassCard = ({ children, className = '', glow = false }) => {
  return (
    <div className={`glass-panel rounded-2xl p-6 transition-all duration-300 ${glow ? 'glass-panel-glow' : ''} ${className}`}>
      {children}
    </div>
  );
};

export default GlassCard;
