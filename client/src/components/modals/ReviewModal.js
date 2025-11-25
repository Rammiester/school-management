import React, { useState, useEffect } from "react";
import {
  Modal,
  Button,
  Space,
  Descriptions,
  Tag,
  Form,
  Input,
  Select,
  DatePicker,
  TimePicker,
  message,
  Image,
} from "antd";
import {
  CloseOutlined,
  CheckOutlined,
  EditOutlined,
  FileImageOutlined,
  DownloadOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import moment from "moment";
import "./ReviewModal.css";

const ReviewModal = ({
  visible,
  onClose,
  request,
  onReview,
  reviewing,
  mode = "view",
  showActionButtons = true,
  fetchPendingRequests,
  fetchFinanceData,
}) => {
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm();
  const [isEditing, setIsEditing] = useState(false);
  const [currentMode, setCurrentMode] = useState(mode);

  useEffect(() => {
    if (mode === "edit" && visible && request) {
      form.setFieldsValue({
        ...request,
        date: request.date ? moment(request.date) : null,
        time: request.time ? moment(request.time, "HH:mm") : null,
      });
    }
    setCurrentMode(mode);
  }, [visible, request, mode, form]);

  if (!request) {
    return null;
  }

  const handleApprove = async () => {
    if (request && request._id) {
      await onReview(request._id, "approved");
      fetchPendingRequests?.();
      fetchFinanceData?.();
      onClose();
    } else {
      messageApi.error("Error processing approval request");
    }
  };

  const handleReject = async () => {
    if (request && request._id) {
      await onReview(request._id, "rejected", "Rejected by chairman");
      fetchPendingRequests?.();
      fetchFinanceData?.();
      onClose();
    } else {
      messageApi.error("Error processing rejection request");
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setCurrentMode("edit");
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const editedRequest = {
        ...request,
        ...values,
        date: values.date ? values.date.format("YYYY-MM-DD") : request.date,
        time: values.time ? values.time.format("HH:mm") : request.time,
      };
      await onReview(request._id, "edit", editedRequest);
      setIsEditing(false);
      setCurrentMode("view");
      messageApi.success("Request updated successfully");
    } catch (error) {
      messageApi.error("Failed to update request");
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setCurrentMode("view");
    form.resetFields();
  };

  // NEW: Render attachments with preview and download
  const renderAttachments = () => {
    if (!request.attachments || request.attachments.length === 0) {
      return <span style={{ color: "#999" }}>No attachments</span>;
    }

    const baseURL = process.env.REACT_APP_API_URL || "http://localhost:3001";

    return (
      <Space direction="vertical" style={{ width: "100%", marginTop: "10px" }}>
        {request.attachments.map((attachment, index) => {
          // Extract filename from path (e.g., "uploads/finance-requests/bill-123.jpg")
          const filename = attachment.split("/").pop();
          const fileUrl = `${baseURL}/${attachment}`;

          return (
            <div
              key={index}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "10px",
                border: "1px solid var(--border-color)",
                borderRadius: "6px",
                backgroundColor: "var(--card-background-color)",
              }}
            >
              <FileImageOutlined
                style={{
                  fontSize: "24px",
                  color: "var(--primary-color)",
                }}
              />
              <span style={{ flex: 1, fontSize: "14px" }}>{filename}</span>
              <Space>
                {/* Image Preview */}
                <Image
                  width={60}
                  height={60}
                  src={fileUrl}
                  alt={`Attachment ${index + 1}`}
                  style={{
                    objectFit: "cover",
                    borderRadius: "4px",
                    border: "1px solid var(--border-color)",
                  }}
                  preview={{
                    mask: <EyeOutlined />,
                  }}
                  fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
                />
                {/* Download Button */}
                <Button
                  type="link"
                  icon={<DownloadOutlined />}
                  href={fileUrl}
                  download={filename}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Download
                </Button>
              </Space>
            </div>
          );
        })}
      </Space>
    );
  };

  const isEditable = currentMode === "edit" && request.status === "pending";

  if (currentMode === "view") {
    return (
      <>
        {contextHolder}
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
                  <Tag color={request.type === "revenue" ? "success" : "error"}>
                    {request.type.toUpperCase()}
                  </Tag>
                ) : (
                  <Tag color="default">N/A</Tag>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Request Type">
                {request.requestType
                  ? request.requestType.toUpperCase()
                  : "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Name">
                {request.name || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Amount">
                <strong
                  style={{ fontSize: "16px", color: "var(--primary-color)" }}
                >
                  ₹
                  {request.type === "revenue"
                    ? request.earnings?.toLocaleString()
                    : request.type === "expense"
                    ? request.expenses?.toLocaleString()
                    : "0"}
                </strong>
              </Descriptions.Item>
              <Descriptions.Item label="Date">
                {request.date
                  ? moment(request.date).format("DD/MM/YYYY")
                  : "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Time">
                {request.time || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Mode of Payment">
                {request.modeOfPayment
                  ? request.modeOfPayment.toUpperCase()
                  : "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Fee Period">
                {request.feePeriod || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Description" span={2}>
                {request.description || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Requested By">
                {typeof request.requestedBy === "string"
                  ? request.requestedBy
                  : request.requestedBy?.name ||
                    request.requestedBy?.email ||
                    request.createdBy ||
                    request.requestingUser ||
                    "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag
                  color={
                    request.status === "approved"
                      ? "success"
                      : request.status === "rejected"
                      ? "error"
                      : "warning"
                  }
                >
                  {request.status?.toUpperCase() || "PENDING"}
                </Tag>
              </Descriptions.Item>

              {/* NEW: Attachments Display */}
              <Descriptions.Item label="Attachments" span={2}>
                {renderAttachments()}
              </Descriptions.Item>

              {/* Show approval/rejection info if available */}
              {request.approvedBy && (
                <Descriptions.Item label="Approved By" span={2}>
                  {request.approvedBy}
                </Descriptions.Item>
              )}
              {request.declinedBy && (
                <Descriptions.Item label="Declined By" span={2}>
                  {request.declinedBy}
                </Descriptions.Item>
              )}
              {request.declineReason && (
                <Descriptions.Item label="Decline Reason" span={2}>
                  {request.declineReason}
                </Descriptions.Item>
              )}
            </Descriptions>

            <div style={{ marginTop: 24, textAlign: "right" }}>
              <Space>
                <Button onClick={onClose}>Close</Button>
                {showActionButtons && request.status === "pending" && (
                  <>
                    <Button
                      type="default"
                      onClick={handleEdit}
                      icon={<EditOutlined />}
                    >
                      Edit
                    </Button>
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
                      style={{ backgroundColor: "#52c41a" }}
                    >
                      Approve
                    </Button>
                  </>
                )}
              </Space>
            </div>
          </div>
        </Modal>
      </>
    );
  } else {
    return (
      <>
        {contextHolder}
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
                    name={request.type === "revenue" ? "earnings" : "expenses"}
                    style={{ marginBottom: 0 }}
                    rules={[{ required: true, message: "Please enter amount" }]}
                  >
                    <Input type="number" prefix="₹" />
                  </Form.Item>
                </Descriptions.Item>
                <Descriptions.Item label="Date">
                  <Form.Item
                    name="date"
                    style={{ marginBottom: 0 }}
                    rules={[{ required: true, message: "Please select date" }]}
                  >
                    <DatePicker style={{ width: "100%" }} />
                  </Form.Item>
                </Descriptions.Item>
                <Descriptions.Item label="Time">
                  <Form.Item
                    name="time"
                    style={{ marginBottom: 0 }}
                    rules={[{ required: true, message: "Please select time" }]}
                  >
                    <TimePicker style={{ width: "100%" }} format="HH:mm" />
                  </Form.Item>
                </Descriptions.Item>
                <Descriptions.Item label="Mode of Payment">
                  <Form.Item
                    name="modeOfPayment"
                    style={{ marginBottom: 0 }}
                    rules={[
                      {
                        required: true,
                        message: "Please select payment method",
                      },
                    ]}
                  >
                    <Select>
                      <Select.Option value="cash">Cash</Select.Option>
                      <Select.Option value="card">Card</Select.Option>
                      <Select.Option value="upi">UPI</Select.Option>
                      <Select.Option value="bank transfer">
                        Bank Transfer
                      </Select.Option>
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
                    style={{ marginBottom: 0 }}
                    rules={[
                      { required: true, message: "Please enter description" },
                    ]}
                  >
                    <Input.TextArea rows={3} />
                  </Form.Item>
                </Descriptions.Item>

                {/* Show attachments in edit mode (read-only) */}
                <Descriptions.Item label="Attachments" span={2}>
                  {renderAttachments()}
                  <div
                    style={{
                      marginTop: "8px",
                      fontSize: "12px",
                      color: "#999",
                    }}
                  >
                    Note: Attachments cannot be modified after creation
                  </div>
                </Descriptions.Item>
              </Descriptions>

              <div style={{ marginTop: 24, textAlign: "right" }}>
                <Space>
                  <Button onClick={handleCancelEdit}>Cancel</Button>
                  <Button onClick={() => form.resetFields()}>Reset</Button>
                  <Button type="primary" htmlType="submit" loading={reviewing}>
                    Save Changes
                  </Button>
                </Space>
              </div>
            </Form>
          </div>
        </Modal>
      </>
    );
  }
};

export default ReviewModal;
