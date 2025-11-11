import React, { useState, useEffect } from 'react';
import { Modal, Button, Space, Descriptions, Tag, Form, Input, Select, DatePicker, TimePicker, message } from 'antd';
import { CloseOutlined, CheckOutlined, EditOutlined } from '@ant-design/icons';
import moment from 'moment';
import './ReviewModal.css';

const ReviewModal = ({ visible, onClose, request, onReview, reviewing, mode = 'view', showActionButtons = true, fetchPendingRequests, fetchFinanceData }) => {
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm();
  const [isEditing, setIsEditing] = useState(false);
  const [currentMode, setCurrentMode] = useState(mode);

  useEffect(() => {
    if (mode === 'edit' && visible && request) {
      form.setFieldsValue({
        ...request,
        date: request.date ? moment(request.date) : null,
        time: request.time ? moment(request.time, 'HH:mm') : null
      });
    }
    setCurrentMode(mode);
  }, [visible, request, mode, form]);

  if (!request) {
    return null;
  }

  const handleApprove = async () => {
    if (request && request._id) {
      await onReview(request._id, 'approved');
      fetchPendingRequests();
      if (fetchFinanceData) {
        fetchFinanceData();
      }
      onClose();
    } else {
      messageApi.error('Error processing approval request');
    }
  };

  const handleReject = async () => {
    if (request && request._id) {
      await onReview(request._id, 'rejected', 'Rejected by chairman');
      fetchPendingRequests();
      if (fetchFinanceData) {
        fetchFinanceData();
      }
      onClose();
    } else {
      messageApi.error('Error processing rejection request');
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const editedRequest = {
        ...request,
        ...values,
        date: values.date ? values.date.format('YYYY-MM-DD') : request.date,
        time: values.time ? values.time.format('HH:mm') : request.time
      };
      onReview(request._id, 'edit', editedRequest);
      setIsEditing(false);
    } catch (error) {
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    form.resetFields();
  };

  const isEditable = currentMode === 'edit' && request.status === 'pending';

  if (currentMode === 'view') {
    return (
      <Modal
        title="Request Details"
        open={visible}
        onCancel={onClose}
        footer={null}
        width={800}
        className="review-modal"
      >
        <div className="review-modal-content">
          <Descriptions bordered column={2}>
            <Descriptions.Item label="Type">
              {request.type ? (
                <Tag color={request.type === 'revenue' ? 'success' : 'error'}>
                  {request.type.toUpperCase()}
                </Tag>
              ) : (
                <Tag color="default">N/A</Tag>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Request Type">
              {request.requestType ? request.requestType.toUpperCase() : 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Name">
              {request.name || 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Amount">
              <strong>
                ₹{request.type === 'revenue'
                  ? request.earnings?.toLocaleString()
                  : request.type === 'expense'
                    ? request.expenses?.toLocaleString()
                    : '0'}
              </strong>
            </Descriptions.Item>
            <Descriptions.Item label="Date">
              {request.date ? moment(request.date).format('DD/MM/YYYY') : 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Time">
              {request.time || 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Mode of Payment">
              {request.modeOfPayment ? request.modeOfPayment.toUpperCase() : 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Fee Period">
              {request.feePeriod || 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Description" span={2}>
              {request.description || 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Requested By">
              {request.requestedBy || request.createdBy || request.requestingUser || 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag color={request.status === 'approved' ? 'success' : request.status === 'rejected' ? 'error' : 'warning'}>
                {request.status?.toUpperCase() || 'N/A'}
              </Tag>
            </Descriptions.Item>
          </Descriptions>

          <div style={{ marginTop: 24, textAlign: 'right' }}>
            <Space>
              <Button onClick={onClose}>Close</Button>
              {showActionButtons && request.status === 'pending' && (
                <Button
                  type="primary"
                  onClick={handleEdit}
                  icon={<EditOutlined />}
                >
                  Edit
                </Button>
              )}
              {showActionButtons && (
                <>
                  <Button
                    danger
                    onClick={handleReject}
                    loading={reviewing}
                    icon={<CloseOutlined />}
                  >
                    Reject
                  </Button>
                  <Button
                    type="primary"
                    onClick={handleApprove}
                    loading={reviewing}
                    icon={<CheckOutlined />}
                  >
                    Approve
                  </Button>
                </>
              )}
            </Space>
          </div>
        </div>
      </Modal>
    );
  } else {
    return (
      <Modal
        title="Edit Request"
        open={visible}
        onCancel={onClose}
        footer={null}
        width={800}
        className="review-modal"
      >
        <div className="review-modal-content">
          <Form form={form} layout="vertical" onFinish={handleSave}>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Type">
                <Form.Item name="type" style={{ marginBottom: 0 }}>
                  <Select disabled>
                    <Select.Option value="revenue">Revenue</Select.Option>
                    <Select.Option value="expense">Expense</Select.Option>
                  </Select>
                </Form.Item>
              </Descriptions.Item>
              <Descriptions.Item label="Request Type">
                <Form.Item name="requestType" style={{ marginBottom: 0 }}>
                  <Input disabled />
                </Form.Item>
              </Descriptions.Item>
              <Descriptions.Item label="Name">
                <Form.Item name="name" style={{ marginBottom: 0 }}>
                  <Input disabled />
                </Form.Item>
              </Descriptions.Item>
              <Descriptions.Item label="Amount">
                <Form.Item
                  name="earnings"
                  label="Amount"
                  style={{ marginBottom: 0 }}
                  rules={[{ required: true, message: 'Please enter amount' }]}
                >
                  <Input type="number" />
                </Form.Item>
              </Descriptions.Item>
              <Descriptions.Item label="Date">
                <Form.Item
                  name="date"
                  label="Date"
                  style={{ marginBottom: 0 }}
                  rules={[{ required: true, message: 'Please select date' }]}
                >
                  <DatePicker style={{ width: '100%' }} />
                </Form.Item>
              </Descriptions.Item>
              <Descriptions.Item label="Time">
                <Form.Item
                  name="time"
                  label="Time"
                  style={{ marginBottom: 0 }}
                  rules={[{ required: true, message: 'Please select time' }]}
                >
                  <TimePicker style={{ width: '100%' }} format="HH:mm" />
                </Form.Item>
              </Descriptions.Item>
              <Descriptions.Item label="Mode of Payment">
                <Form.Item
                  name="modeOfPayment"
                  label="Payment Method"
                  style={{ marginBottom: 0 }}
                  rules={[{ required: true, message: 'Please select payment method' }]}
                >
                  <Select>
                    <Select.Option value="cash">Cash</Select.Option>
                    <Select.Option value="card">Card</Select.Option>
                    <Select.Option value="upi">UPI</Select.Option>
                    <Select.Option value="bank transfer">Bank Transfer</Select.Option>
                    <Select.Option value="cheque">Cheque</Select.Option>
                  </Select>
                </Form.Item>
              </Descriptions.Item>
              <Descriptions.Item label="Fee Period">
                <Form.Item name="feePeriod" style={{ marginBottom: 0 }}>
                  <Input placeholder="e.g., Jan 2024 - Mar 2024" />
                </Form.Item>
              </Descriptions.Item>
              <Descriptions.Item label="Description" span={2}>
                <Form.Item
                  name="description"
                  label="Description"
                  style={{ marginBottom: 0 }}
                  rules={[{ required: true, message: 'Please enter description' }]}
                >
                  <Input.TextArea rows={3} />
                </Form.Item>
              </Descriptions.Item>
            </Descriptions>

            <div style={{ marginTop: 24, textAlign: 'right' }}>
              <Space>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={handleCancelEdit}>Reset</Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={reviewing}
                >
                  Save Changes
                </Button>
              </Space>
            </div>
          </Form>
        </div>
      </Modal>
    );
  }
};

export default ReviewModal;
