import React from 'react';
import './Loading.css';

const Loading = ({ size = 'medium', message = 'Loading...', className = '' }) => {
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
    <div className={`loading-container ${className}`}>
      <div className={`loading-spinner ${getSizeClasses()}`}>
        <div className="spinner-circle"></div>
      </div>
      <p className="loading-message">{message}</p>
    </div>
  );
};

export default Loading;
