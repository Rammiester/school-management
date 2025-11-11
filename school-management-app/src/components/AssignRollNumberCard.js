import React, { useState } from 'react';
import { Button, Modal, message } from 'antd';
import { useSelector } from 'react-redux';
import { getThemeSwitchValue } from '../store/h1Slice';
import { assignRollNumbers } from '../services/dashboardService';
import './AssignRollNumberCard.css';

const AssignRollNumberCard = ({ students, onRollNumbersAssigned }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAssignRollNumbers = async () => {
    try {
      setLoading(true);
      const result = await assignRollNumbers();
      
      if (result && result.success) {
        message.success('Roll numbers assigned successfully!');
        if (result.assignedStudents) {
          onRollNumbersAssigned(result.assignedStudents);
        } else {
          onRollNumbersAssigned(students);
        }
        setIsModalVisible(false);
      } else {
        message.error(result?.message || 'Failed to assign roll numbers');
      }
    } catch (error) {
      message.error('Error assigning roll numbers: ' + (error.message || 'Unknown error'));
      console.error('Error assigning roll numbers:', error);
    } finally {
      setLoading(false);
    }
  };

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  return (
    <div className="assign-roll-card">
      <div className="assign-roll-card-content" onClick={showModal}>
        <h3> Assign Roll Numbers</h3>
        <p>Assign sequential roll numbers to students by grade</p>
        {/* <div className="assign-roll-count">
          {students.length} students
        </div> */}
      </div>

      <Modal
        title="Assign Roll Numbers"
        open={isModalVisible}
        onCancel={handleCancel}
        footer={[
          <Button key="cancel" onClick={handleCancel}>
            Cancel
          </Button>,
          <Button 
            key="assign" 
            type="primary" 
            onClick={handleAssignRollNumbers}
            loading={loading}
          >
            Assign Roll Numbers
          </Button>
        ]}
        width={500}
        centered
        className="assign-roll-modal"
      >
        <div className="assign-roll-modal-content">
          <p>Are you sure you want to assign roll numbers to all students?</p>
          <p className="assign-roll-info">
            Roll numbers will be assigned in ascending order within each grade.
          </p>
          <p className="assign-roll-info">
            Students will be sorted by name and then assigned sequential roll numbers.
          </p>
        </div>
      </Modal>
    </div>
  );
};

export default AssignRollNumberCard;
