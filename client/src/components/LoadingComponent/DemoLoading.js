import React, { useState, useEffect } from 'react';
import Loading from './Loading';
import EnhancedLoading from './EnhancedLoading';

const DemoLoading = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [showMessage, setShowMessage] = useState('Loading application data...');

  useEffect(() => {
    // Simulate loading completion
    const timer = setTimeout(() => {
      setIsLoading(false);
      setShowMessage('Application loaded successfully!');
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={{ 
      padding: '2rem', 
      maxWidth: '800px', 
      margin: '0 auto',
      textAlign: 'center'
    }}>
      <h2>Dynamic Loading Demo</h2>
      <p>This demonstrates how to use the loading component in your app</p>
      
      {isLoading ? (
        <div style={{ padding: '2rem' }}>
          <EnhancedLoading 
            size="large" 
            message={showMessage} 
          />
        </div>
      ) : (
        <div style={{ 
          padding: '2rem', 
          backgroundColor: 'var(--card-background-color)', 
          borderRadius: '8px',
          margin: '1rem 0'
        }}>
          <h3>✅ {showMessage}</h3>
          <p>The loading component can be used anywhere in your app!</p>
        </div>
      )}
      
      <div style={{ 
        marginTop: '2rem',
        padding: '1rem',
        backgroundColor: 'var(--card-background-color)', 
        borderRadius: '8px'
      }}>
        <h3>Usage Examples:</h3>
        <ul style={{ textAlign: 'left', padding: '1rem' }}>
          <li><code><Loading /></code> - Default medium size</li>
          <li><code><Loading size="small" /></code> - Small spinner</li>
          <li><code><Loading size="large" message="Custom message" /></code> - Large with custom message</li>
          <li><code><EnhancedLoading size="xlarge" /></code> - Enhanced with particles and glow</li>
        </ul>
      </div>
    </div>
  );
};

export default DemoLoading;
