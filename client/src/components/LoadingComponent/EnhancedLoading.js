import React from 'react';
import './EnhancedLoading.css';

const EnhancedLoading = ({ 
  size = 'medium', 
  message = 'Loading...', 
  showGlow = true,
  showParticles = true,
  className = ''
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'loading-small';
      case 'large':
        return 'loading-large';
      case 'xlarge':
        return 'loading-xlarge';
      default:
        return 'loading-medium';
    }
  };

  return (
    <div className={`enhanced-loading-container ${className}`}>
      <div className={`enhanced-loading-spinner ${getSizeClasses()}`}>
        {showParticles && (
          <>
            <div className="particle particle-1"></div>
            <div className="particle particle-2"></div>
            <div className="particle particle-3"></div>
            <div className="particle particle-4"></div>
          </>
        )}
        <div className="spinner-core">
          <div className="spinner-circle"></div>
        </div>
      </div>
      <p className={`loading-message ${showGlow ? 'glow' : ''}`}>{message}</p>
      {showGlow && <div className="loading-glow"></div>}
    </div>
  );
};

export default EnhancedLoading;
