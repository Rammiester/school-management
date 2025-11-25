import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Typography, Button, DatePicker, Space, Table, Modal, Form, Input, Select } from 'antd';
import { PlusOutlined, CalendarOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import { fetchDashboardStats } from '../../services/dashboardService';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import api from '../../api'; // Import the API client as default
import BackButton from '../../components/BackButton';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const EventsListPage = () => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [dateRange, setDateRange] = useState(null);
 const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const stats = await fetchDashboardStats('admin');
        setEvents(stats.events || []);
        setFilteredEvents(stats.events || []);
        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  useEffect(() => {
    let result = events;

    if (searchText) {
      result = result.filter(event =>
        event.title.toLowerCase().includes(searchText.toLowerCase()) ||
        event.description.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    if (dateRange) {
      const [start, end] = dateRange;
      result = result.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate >= new Date(start) && eventDate <= new Date(end);
      });
    }

    setFilteredEvents(result);
  }, [searchText, dateRange, events]);

  const handleAddEvent = () => {
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      
      const eventData = {
        ...values,
        date: values.date ? values.date.toISOString() : null
      };

      // Send to backend
      const response = await api.post('/api/events', eventData);
      
      // Add the new event to the list
      setEvents(prev => [...prev, response.data]);
      setFilteredEvents(prev => [...prev, response.data]);
      
      // Close modal and reset form
      setIsModalVisible(false);
      form.resetFields();
      
    } catch (error) {
      console.error('Error creating event:', error);
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleEditEvent = (event) => {
    const eventWithFormattedDate = {
      ...event,
      date: event.date ? moment(event.date).format('YYYY-MM-DD') : null
    };
    form.clearFields();
    form.setFieldsValue(eventWithFormattedDate);
    setIsModalVisible(true);
  };

  const handleDeleteEvent = async (eventId) => {
    try {
      await api.delete(`/api/events/${eventId}`);
      
      // Remove from local state
      setEvents(prev => prev.filter(event => event._id !== eventId));
      setFilteredEvents(prev => prev.filter(event => event._id !== eventId));
      
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  const columns = [
    {
      title: 'Event Title',
      dataIndex: 'title',
      key: 'title',
      sorter: (a, b) => a.title.localeCompare(b.title),
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (date) => moment(date).format('DD/MM/YYYY'),
      sorter: (a, b) => new Date(a.date) - new Date(b.date),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Location',
      dataIndex: 'location',
      key: 'location',
    },
    {
      title: 'Created By',
      dataIndex: 'createdBy',
      key: 'createdBy',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          <Button 
            icon={<EditOutlined />} 
            size="small"
            onClick={() => handleEditEvent(record)}
            style={{ backgroundColor: 'var(--primary-color)', borderColor: 'var(--primary-color)', color: 'white' }}
          />
          <Button 
            icon={<DeleteOutlined />} 
            size="small"
            onClick={() => handleDeleteEvent(record._id)}
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
          <CalendarOutlined /> School Events
        </Title>
        <Text style={{ color: 'var(--subtext-light)' }}>
          Manage and view all school events
        </Text>
      </div>

      <Card style={{ marginBottom: '24px' }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={8}>
            <Input
              placeholder="Search events..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: '100%' }}
            />
          </Col>
          <Col xs={24} md={8}>
            <RangePicker
              onChange={setDateRange}
              style={{ width: '100%' }}
            />
          </Col>
          <Col xs={24} md={8} style={{ textAlign: 'right' }}>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={handleAddEvent}
              style={{ backgroundColor: 'var(--accent-color)', borderColor: 'var(--accent-color)' }}
            >
              Add Event
            </Button>
          </Col>
        </Row>
      </Card>

      <Card>
        <Table
          columns={columns}
          dataSource={filteredEvents}
          rowKey="_id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `Total ${total} events`,
          }}
          scroll={{ x: 800 }}
        />
      </Card>

      <Modal
        title="Add/Edit Event"
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        okText="Save Event"
        cancelText="Cancel"
        style={{ top: 20 }}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="title"
            label="Event Title"
            rules={[{ required: true, message: 'Please enter event title' }]}
          >
            <Input placeholder="Enter event title" />
          </Form.Item>
          <Form.Item
            name="date"
            label="Event Date"
            rules={[{ required: true, message: 'Please select event date' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="description"
            label="Description"
          >
            <Input.TextArea rows={4} placeholder="Enter event description" />
          </Form.Item>
          <Form.Item
            name="location"
            label="Location"
          >
            <Input placeholder="Enter event location" />
          </Form.Item>
          <Form.Item
            name="createdBy"
            label="Created By"
          >
            <Input placeholder="Enter creator name" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default EventsListPage;
