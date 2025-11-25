import React, { useState } from "react";
import {
  Modal,
  Form,
  Input,
  DatePicker,
  message,
  Row,
  Col,
  Button,
  Space
} from "antd";
import { appDefaults } from "../../api/index.js";
import { createNotice } from "../../services/dashboardService";

const { TextArea } = Input;

const AddNoticeModal = ({ visible, onClose, onNoticeAdded }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  // Show toast messages (success/error/info)
  const showToast = (type, content) => {
    messageApi.open({
      type,
      content,
      duration: 3,
      style: { fontSize: 16 },
    });
  };

  const handleSubmit = async (values) => {
    try {
      setLoading(true);

      // Format date range to ISO strings
      const noticeData = {
        ...values,
        startDate: values.fromDate ? values.fromDate.toISOString() : new Date().toISOString(),
        endDate: values.toDate ? values.toDate.toISOString() : new Date().toISOString()
      };

      const response = await createNotice(noticeData);

      if (response && (response.message === "Notice created!" || response._id)) {
        showToast("success", "Note created successfully!");
        onNoticeAdded();
        onClose();
        form.resetFields();
      } else {
        // Handle case where response doesn't have expected message
        showToast("error", "Notice created but with unexpected response");
      }
    } catch (error) {
      showToast(
        "error",
        error.message || "Failed to add notice. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {contextHolder}
      <Modal
        title={
          <div className="modal-title">
            <span className="modal-icon">📢</span>
            <span>Add New Notice</span>
          </div>
        }
        open={visible}
        onCancel={onClose}
        onOk={() => form.submit()}
        okText="Save Notice"
        okButtonProps={{
          className: "add-notice-modal ant-btn-primary",
          disabled: loading,
        }}
        cancelButtonProps={{
          className: "add-notice-modal ant-btn-default",
        }}
        width={600}
        footer={[
          <Button
            key="back"
            onClick={onClose}
            className="add-notice-modal ant-btn-default"
          >
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={() => form.submit()}
            disabled={loading}
            className="add-notice-modal ant-btn-primary"
          >
            Save Notice
          </Button>,
        ]}
        className="add-notice-modal"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          autoComplete="off"
        >
          <Row gutter={[24, 24]}>
            <Col xs={24} sm={24} md={24}>
              <Form.Item
                label={<label style={{ color: "white" }}>Notice Message</label>}
                name="message"
                rules={[
                  { required: true, message: "Please enter notice message" },
                ]}
              >
                <TextArea
                  rows={4}
                  placeholder="Enter notice message"
                  className="add-notice-textarea"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={24} md={24}>
              <Form.Item
                label={<label style={{ color: "white" }}>Posted By</label>}
                name="postedBy"
                rules={[
                  { required: true, message: "Please enter who posted this notice" },
                ]}
              >
                <Input
                  placeholder="Enter name of poster"
                  className="add-notice-input"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={24} md={24}>
              <Form.Item label={<label style={{ color: "white" }}>Date Range</label>} required>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Row gutter={12}>
                    <Col xs={24} sm={11}>
                      <Form.Item
                        name="fromDate"
                        noStyle
                        rules={[{ required: true, message: "Please select from date" }]}
                      >
                        <DatePicker
                          style={{ width: "100%" }}
                          format="YYYY-MM-DD"
                          placeholder="From Date"
                          className="add-notice-datepicker"
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={2} style={{ textAlign: 'center', alignSelf: 'center' }}>
                      <span style={{color:"white"}}>to</span>
                    </Col>
                    <Col xs={24} sm={11}>
                      <Form.Item
                        name="toDate"
                        noStyle
                        rules={[{ required: true, message: "Please select to date" }]}
                      >
                        <DatePicker
                          style={{ width: "100%" }}
                          format="YYYY-MM-DD"
                          placeholder="To Date"
                          className="add-notice-datepicker"
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                </Space>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </>
  );
};

export default AddNoticeModal;
