import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Typography, Button, DatePicker, Space, Table, Modal, Form, Input, Select, Tag } from 'antd';
import { PlusOutlined, FileTextOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import { fetchDashboardStats } from '../../services/dashboardService';
import { getNoticesByDate } from '../../api/index';
import moment from 'moment';
import api from '../../api'; // Import the API client as default
import BackButton from '../../components/BackButton';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const NoticesListPage = () => {
  const [notices, setNotices] = useState([]);
  const [filteredNotices, setFilteredNotices] = useState([]);
  const [loading, setLoading] = useState(true);
 const [searchText, setSearchText] = useState('');
  const [dateRange, setDateRange] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const stats = await fetchDashboardStats('admin');
        setNotices(stats.notices || []);
        setFilteredNotices(stats.notices || []);
        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    };

    fetchNotices();
  }, []);

  useEffect(() => {
    let result = notices;

    if (searchText) {
      result = result.filter(notice =>
        notice.message.toLowerCase().includes(searchText.toLowerCase()) ||
        (notice.postedBy && notice.postedBy.toLowerCase().includes(searchText.toLowerCase()))
      );
    }

    if (dateRange) {
      const [start, end] = dateRange;
      result = result.filter(notice => {
        const noticeDate = new Date(notice.startDate || notice.date || notice.createdAt);
        return noticeDate >= new Date(start) && noticeDate <= new Date(end);
      });
    }

    if (statusFilter !== 'all') {
      const today = new Date();
      result = result.filter(notice => {
        const startDate = notice.startDate ? new Date(notice.startDate) : null;
        const endDate = notice.endDate ? new Date(notice.endDate) : null;
        
        if (statusFilter === 'active') {
          if (!startDate && !endDate) return true;
          if (startDate && !endDate) return today >= startDate;
          if (!startDate && endDate) return today <= endDate;
          return today >= startDate && today <= endDate;
        } else if (statusFilter === 'expired') {
          if (endDate) return today > endDate;
          return false;
        } else if (statusFilter === 'upcoming') {
          if (startDate) return today < startDate;
          return false;
        }
        return true;
      });
    }

    setFilteredNotices(result);
 }, [searchText, dateRange, statusFilter, notices]);

  const handleAddNotice = () => {
    setIsModalVisible(true);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      
      const noticeData = {
        ...values,
        startDate: values.startDate ? values.startDate.toISOString() : null,
        endDate: values.endDate ? values.endDate.toISOString() : null
      };

      // Send to backend
      const response = await api.post('/api/notices', noticeData);
      
      // Add the new notice to the list
      setNotices(prev => [...prev, response.data]);
      setFilteredNotices(prev => [...prev, response.data]);
      
      // Close modal and reset form
      setIsModalVisible(false);
      form.resetFields();
      
    } catch (error) {
      console.error('Error creating notice:', error);
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleEditNotice = (notice) => {
    const noticeWithFormattedDates = {
      ...notice,
      startDate: notice.startDate ? moment(notice.startDate).format('YYYY-MM-DD') : null,
      endDate: notice.endDate ? moment(notice.endDate).format('YYYY-MM-DD') : null
    };
    form.setFieldsValue(noticeWithFormattedDates);
    setIsModalVisible(true);
 };

  const handleDeleteNotice = async (noticeId) => {
    try {
      await api.delete(`/api/notices/${noticeId}`);
      
      // Remove from local state
      setNotices(prev => prev.filter(notice => notice._id !== noticeId));
      setFilteredNotices(prev => prev.filter(notice => notice._id !== noticeId));
      
    } catch (error) {
      console.error('Error deleting notice:', error);
    }
  };

  const getStatusTag = (notice) => {
    const today = new Date();
    const startDate = notice.startDate ? new Date(notice.startDate) : null;
    const endDate = notice.endDate ? new Date(notice.endDate) : null;

    if (!startDate && !endDate) return <Tag color="blue">Always Visible</Tag>;
    if (startDate && !endDate && today >= startDate) return <Tag color="green">Active</Tag>;
    if (!startDate && endDate && today <= endDate) return <Tag color="green">Active</Tag>;
    if (startDate && endDate && today >= startDate && today <= endDate) return <Tag color="green">Active</Tag>;
    if (endDate && today > endDate) return <Tag color="red">Expired</Tag>;
    if (startDate && today < startDate) return <Tag color="orange">Upcoming</Tag>;
    
    return <Tag color="default">Unknown</Tag>;
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    const d = new Date(date);
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const columns = [
    {
      title: 'Notice Message',
      dataIndex: 'message',
      key: 'message',
      render: (text) => <div style={{ maxWidth: '300px', wordWrap: 'break-word' }}>{text}</div>,
      sorter: (a, b) => a.message.localeCompare(b.message),
    },
    {
      title: 'Posted By',
      dataIndex: 'postedBy',
      key: 'postedBy',
      sorter: (a, b) => (a.postedBy || '').localeCompare(b.postedBy || ''),
    },
    {
      title: 'Start Date',
      dataIndex: 'startDate',
      key: 'startDate',
      render: (date) => date ? formatDate(date) : 'N/A',
      sorter: (a, b) => {
        const dateA = a.startDate ? new Date(a.startDate) : new Date(0);
        const dateB = b.startDate ? new Date(b.startDate) : new Date(0);
        return dateA - dateB;
      },
    },
    {
      title: 'End Date',
      dataIndex: 'endDate',
      key: 'endDate',
      render: (date) => date ? formatDate(date) : 'N/A',
      sorter: (a, b) => {
        const dateA = a.endDate ? new Date(a.endDate) : new Date(0);
        const dateB = b.endDate ? new Date(b.endDate) : new Date(0);
        return dateA - dateB;
      },
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, record) => getStatusTag(record),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          <Button 
            icon={<EditOutlined />} 
            size="small"
            onClick={() => handleEditNotice(record)}
            style={{ backgroundColor: 'var(--primary-color)', borderColor: 'var(--primary-color)', color: 'white' }}
          />
          <Button 
            icon={<DeleteOutlined />} 
            size="small"
            onClick={() => handleDeleteNotice(record._id)}
            danger
          />
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px', minHeight: '100vh' }}>
      <BackButton />
      <div style={{ marginBottom: '24px' }}>
        <Title level={2} style={{ color: 'var(--text-light-color)' }}>
          <FileTextOutlined /> School Notices
        </Title>
        <Text style={{ color: 'var(--subtext-light)' }}>
          Manage and view all school notices with date range filtering
        </Text>
      </div>

      <Card style={{ marginBottom: '24px' }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={6}>
            <Input
              placeholder="Search notices..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: '100%' }}
            />
          </Col>
          <Col xs={24} md={6}>
            <RangePicker
              onChange={setDateRange}
              style={{ width: '100%' }}
            />
          </Col>
          <Col xs={24} md={6}>
            <Select
              placeholder="Filter by status"
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: '100%' }}
              allowClear
            >
              <Option value="all">All Status</Option>
              <Option value="active">Active</Option>
              <Option value="expired">Expired</Option>
              <Option value="upcoming">Upcoming</Option>
            </Select>
          </Col>
          <Col xs={24} md={6} style={{ textAlign: 'right' }}>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={handleAddNotice}
              style={{ backgroundColor: 'var(--accent-color)', borderColor: 'var(--accent-color)' }}
            >
              Add Notice
            </Button>
          </Col>
        </Row>
      </Card>

      <Card>
        <Table
          columns={columns}
          dataSource={filteredNotices}
          rowKey="_id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `Total ${total} notices`,
          }}
          scroll={{ x: 100 }}
        />
      </Card>

      <Modal
        title="Add/Edit Notice"
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        okText="Save Notice"
        cancelText="Cancel"
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="message"
            label="Notice Message"
            rules={[{ required: true, message: 'Please enter notice message' }]}
          >
            <Input.TextArea rows={4} placeholder="Enter notice message" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="startDate"
                label="Start Date"
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="endDate"
                label="End Date"
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="postedBy"
            label="Posted By"
          >
            <Input placeholder="Enter name of person posting" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default NoticesListPage;
