import React, { useState, useEffect } from 'react';
import { Button, Space, Tag, message, Table, Typography } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import { getPendingRequests, reviewRequest } from '../../services/financeService';
import moment from 'moment';
import ReviewModal from '../../components/modals/ReviewModal';
import './Finance.css';

const { Title } = Typography;

const ChairmanReview = ({ fetchFinanceData }) => {
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchPendingRequests = async () => {
    setLoading(true);
    try {
      const data = await getPendingRequests();
      setPendingRequests(data);
    } catch (error) {
      message.error('Failed to fetch pending requests');
      console.error('Error fetching pending requests:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  const handleReview = async (requestId, status, reviewNotes = '') => {
    setReviewing(true);
    try {
      const response = await reviewRequest(requestId, status, reviewNotes);
      if (response.success) {
        message.success(`Request ${status} successfully`);
        setIsModalOpen(false);
        setSelectedRequest(null);
        // Refresh pending requests after review
        fetchPendingRequests();
      }
    } catch (error) {
      message.error('Failed to review request');
      console.error('Error reviewing request:', error);
    } finally {
      setReviewing(false);
    }
  };

  const showDetails = (record) => {
    setSelectedRequest(record);
    setIsModalOpen(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'orange';
      case 'approved': return 'green';
      case 'rejected': return 'red';
      default: return 'default';
    }
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      fixed: 'left',
      width: 150,
      render: (text) => <span className="period-cell">{text || 'N/A'}</span>,
      onCell: () => ({ style: { background: 'var(--accent-color) !important', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } }),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type) => {
        if (!type) return <Tag color="default">N/A</Tag>;
        return (
          <Tag color={type === 'revenue' ? 'green' : 'red'}>
            {type?.toUpperCase() || 'N/A'}
          </Tag>
        );
      }
    },
    {
      title: 'Request Type',
      dataIndex: 'requestType',
      key: 'requestType',
      width: 150,
      render: (text) => text ? text.toUpperCase() : 'N/A'
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      width: 120,
      render: (_, record) => {
        const amount = record.type === 'revenue' ? record.earnings : record.expenses;
        return `₹${amount?.toLocaleString() || 0}`;
      }
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      width: 120,
      render: (date) => moment(date).format('DD/MM/YYYY') || 'N/A'
    },
    {
      title: 'Requested By',
      dataIndex: 'createdBy',
      key: 'createdBy',
      width: 150,
      render: (createdBy) => createdBy || 'N/A'
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<EyeOutlined />}
            size="small"
            onClick={() => showDetails(record)}
          >
            View
          </Button>
          {/* <Button
            type="primary"
            icon={<CheckOutlined />}
            size="small"
            onClick={() => handleReview(record._id, 'approved')}
          >
            Approve
          </Button>
          <Button
            danger
            icon={<CloseOutlined />}
            size="small"
            onClick={() => handleReview(record._id, 'rejected', 'Rejected by chairman')}
          >
            Reject
          </Button> */}
        </Space>
      )
    }
  ];

  return (
    <div className="chairman-review-container">
      <div className="page-header">
        <h2>Pending Finance Requests</h2>
      </div>

      <div className="timetable-table-container">
        <Table
          columns={columns}
          dataSource={pendingRequests}
          loading={loading}
          scroll={{ x: 1200 }}
          className="timetable-table"
          pagination={{ pageSize: 10 }}
          rowKey="_id"
          emptyText="No pending requests found"
        />
      </div>
      <ReviewModal
        visible={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        request={selectedRequest}
        onReview={handleReview}
        reviewing={reviewing}
        fetchPendingRequests={fetchPendingRequests}
        fetchFinanceData={fetchFinanceData}
      />
    </div>
  );
};

export default ChairmanReview;
