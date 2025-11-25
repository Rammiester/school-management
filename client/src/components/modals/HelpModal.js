import React from 'react';
import { Modal, Button } from 'antd';
import './HelpModal.css';

const HelpModal = ({ visible, onClose }) => {
  return (
    <Modal
      title={
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '10px',
          color: 'var(--text-light-color)'
        }}>
          <span>💡</span>
          <span>Help & Improvement Guide</span>
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={600}
      className="help-modal"
      centered
    >
      <div className="help-modal-content">
        <div className="help-content">
          <p style={{ 
            color: 'var(--text-light-color)',
            lineHeight: '1.6',
            marginBottom: '20px'
          }}>
            <strong>Help us improve the system using feedback to make it more robust and conflict-free!</strong>
          </p>
          
          <div className="help-section">
            <h3 style={{ 
              color: 'var(--secondary-color)',
              marginBottom: '10px',
              fontSize: '1.1em'
            }}>
              How Your Feedback Helps
            </h3>
            <ul style={{ 
              color: 'var(--subtext-light)',
              paddingLeft: '20px',
              lineHeight: '1.5'
            }}>
              <li>Identifies areas for system improvement</li>
              <li>Eliminates conflicts between different modules</li>
              <li>Creates a more robust and reliable system</li>
              <li>Enhances user experience for all stakeholders</li>
            </ul>
          </div>

          <div className="help-section">
            <h3 style={{ 
              color: 'var(--secondary-color)',
              marginBottom: '10px',
              fontSize: '1.1em'
            }}>
              Feedback Process
            </h3>
            <p style={{ 
              color: 'var(--subtext-light)',
              lineHeight: '1.5',
              marginBottom: '15px'
            }}>
              When you provide feedback through the feedback system, it gets analyzed to:
            </p>
            <ul style={{ 
              color: 'var(--subtext-light)',
              paddingLeft: '20px',
              lineHeight: '1.5'
            }}>
              <li>Identify potential conflicts in data handling</li>
              <li>Optimize system performance</li>
              <li>Improve user interface and experience</li>
              <li>Enhance data integrity and consistency</li>
            </ul>
          </div>

          <div className="help-section">
            <h3 style={{ 
              color: 'var(--secondary-color)',
              marginBottom: '10px',
              fontSize: '1.1em'
            }}>
              Benefits
            </h3>
            <p style={{ 
              color: 'var(--subtext-light)',
              lineHeight: '1.5',
              marginBottom: '15px'
            }}>
              By using feedback to improve the system:
            </p>
            <ul style={{ 
              color: 'var(--subtext-light)',
              paddingLeft: '20px',
              lineHeight: '1.5'
            }}>
              <li>Reduces system conflicts and errors</li>
              <li>Creates a more stable and reliable platform</li>
              <li>Ensures better data management</li>
              <li>Improves overall user satisfaction</li>
            </ul>
          </div>

          <div style={{ 
            textAlign: 'center', 
            marginTop: '20px',
            padding: '15px',
            backgroundColor: 'var(--card-background-color)',
            borderRadius: '8px',
            border: '1px solid var(--border-color)'
          }}>
            <p style={{ 
              color: 'var(--modal-secondary-color)',
              fontWeight: 'bold',
              marginBottom: '10px'
            }}>
              Thank you for helping us build a better system!
            </p>
            <p style={{ 
              color: 'var(--subtext-light)',
              fontSize: '0.9em'
            }}>
              Your feedback is invaluable in creating a robust and conflict-free platform.
            </p>
          </div>
        </div>
      </div>
      
      <div style={{ 
        textAlign: 'center', 
        marginTop: '20px' 
      }}>
        <Button
          type="primary"
          onClick={onClose}
          style={{
            backgroundColor: 'var(--primary-color)',
            borderColor: 'var(--primary-color)',
            borderRadius: '4px',
            fontWeight: 'bold'
          }}
        >
          Got It!
        </Button>
      </div>
    </Modal>
  );
};

export default HelpModal;
