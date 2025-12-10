import React, { useState, useEffect, useContext } from 'react';
import { fetchPendingUsers, approveUser, rejectUser } from '../../services/dashboardService';
import { AuthContext } from '../../context/AuthContext';
import { Modal, Select, Button, Space, Row, Col } from 'antd';
import './request.css';

const Request = () => {
  const { user } = useContext(AuthContext);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRequestsModalOpen, setIsRequestsModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  useEffect(() => {
    if (user && (user.role === 'chairman' )) {
      fetchRequests();
    }
  }, [user]);

  const isChairman = user && user.role === 'chairman';
  
  if (!isChairman) {
    return null;
  }

  const fetchRequests = async () => {
    try {
      const data = await fetchPendingUsers();
      if (Array.isArray(data)) {
        setRequests(data);
      } else if (data && data.length !== undefined) {
        setRequests(Array.isArray(data.data) ? data.data : []);
      } else {
        setError('Invalid data format received from server');
        setRequests([]);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch requests');
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId, role) => {
    try {
      await approveUser(userId, role);
      fetchRequests();
      setIsModalOpen(false);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to approve request');
    }
  };

  const handleReject = async (userId) => {
    try {
      await rejectUser(userId);
      fetchRequests();
      setIsModalOpen(false);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to reject request');
    }
  };

  const openModal = (request) => {
    setSelectedRequest(request);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedRequest(null);
  };

  const openRequestsModal = () => {
    setIsRequestsModalOpen(true);
    fetchRequests();
  };

  const closeRequestsModal = () => {
    setIsRequestsModalOpen(false);
    setSelectedRequest(null);
  };

  if (loading && isRequestsModalOpen) return <div className="request-loading">Loading requests...</div>;

  const renderRequestCard = () => {
    if (requests.length === 0) return null;
    
    return (
      <div className="request-card" onClick={openRequestsModal}>
        <h3>📋 Sign Up Requests</h3>
        <p>Manage new user registrations</p>
        <div className="request-count">
          {requests.length} pending
        </div>
      </div>
    );
  };

  const renderRequestItems = () => {
    if (requests.length === 0) {
      return (
        <div className="no-requests-message">
          <p>No pending requests</p>
        </div>
      );
    }
    
    return (
      <Row gutter={[16, 16]}>
        {requests.map(request => (
          <Col xs={24} sm={24} md={12} lg={8} key={request._id}>
            <div className="request-item" onClick={() => openModal(request)}>
              <h4>{request.name}</h4>
              <p>Email: {request.email}</p>
              <p>Role: {request.role || 'Pending'}</p>
            </div>
          </Col>
        ))}
      </Row>
    );
  };

  return (
    <div className="request-dashboard-container">
      {renderRequestCard()}

      <Modal
        title="Sign Up Requests"
        open={isRequestsModalOpen}
        onCancel={closeRequestsModal}
        footer={null}
        width={800}
        centered
        className="request-modal"
      >
        {renderRequestItems()}
      </Modal>

      <Modal
        title="Approve/Reject Request"
        open={isModalOpen}
        onCancel={closeModal}
        footer={null}
        width={600}
        centered
        className="request-modal"
      >
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <p><strong>Name:</strong> {selectedRequest?.name}</p>
            <p><strong>Email:</strong> {selectedRequest?.email}</p>
            <p><strong>Current Role:</strong> {selectedRequest?.role || 'Pending'}</p>
          </Col>
          <Col span={24}>
            <div style={{ marginBottom: 16 }}>
              <label>Assign Role:</label>
              <Select
                defaultValue="teacher"
                onChange={(value) => setSelectedRequest({...selectedRequest, role: value})}
                style={{ width: '100%' }}
                placeholder="Select a role"
              >
                <Select.Option value="teacher">Teacher</Select.Option>
                <Select.Option value="staff">Staff</Select.Option>
                <Select.Option value="admin">Admin</Select.Option>
              </Select>
            </div>
          </Col>
          <Col span={24}>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button 
                type="primary" 
                onClick={() => handleApprove(selectedRequest?._id, selectedRequest?.role)}
                disabled={!selectedRequest?.role}
              >
                Approve
              </Button>
              <Button 
                danger 
                onClick={() => handleReject(selectedRequest?._id)}
              >
                Reject
              </Button>
              <Button 
                onClick={closeModal}
              >
                Close
              </Button>
            </Space>
          </Col>
        </Row>
      </Modal>
    </div>
  );
};

export default Request;