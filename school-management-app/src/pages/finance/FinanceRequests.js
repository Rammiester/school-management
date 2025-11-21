import React, { useState, useEffect, useContext } from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  TimePicker,
  Button,
  Space,
  Card,
  Row,
  Col,
  Tag,
  message,
  Table,
  Typography,
  Divider,
  Upload,
} from "antd";
import {
  PlusOutlined,
  EyeOutlined,
  DeleteOutlined,
  UploadOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  EditOutlined,
} from "@ant-design/icons";
import { AuthContext } from "../../context/AuthContext";
import {
  createFinanceRequest,
  getAllFinanceRequests,
  deleteFinanceRequest,
  searchUsers,
  searchStudents,
  getAllUsers,
} from "../../services/financeService";
import dayjs from "dayjs";
import ReviewModal from "../../components/modals/ReviewModal";

// helper: returns current India time as a dayjs object
const getIndiaTime = () => {
  const now = new Date();
  const utcMs = now.getTime() + now.getTimezoneOffset() * 60000;
  const istOffsetMs = 5.5 * 60 * 60 * 1000;
  const istDate = new Date(utcMs + istOffsetMs);
  return dayjs(istDate);
};

const { Option } = Select;
const { TextArea } = Input;

const FinanceRequests = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const { user } = useContext(AuthContext);
  const [form] = Form.useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewModal, setViewModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [fileList, setFileList] = useState([]); // NEW: For file uploads
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [filters, setFilters] = useState({});
  const [dateRange, setDateRange] = useState([
    dayjs().subtract(1, "month"),
    dayjs(),
  ]);
  const [filterForm] = Form.useForm();

  // Enhanced request types based on the API structure
  const expenseTypes = [
    "salary",
    "food",
    "admin office",
    "housekeeping",
    "stationary",
    "other",
    "transport",
  ];
  const revenueTypes = [
    "school fee",
    "hostel fee",
    "uniform fee",
    "other fees",
    "donation",
    "grant",
  ];
  const paymentModes = ["cash", "card", "upi", "bank transfer", "cheque"];
  const [recipientType, setRecipientType] = useState("user");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // ensure date & time are set to current India time every time the "Create Request" modal opens
  useEffect(() => {
    if (isModalOpen) {
      const nowIst = getIndiaTime();
      // set both date and time fields (DatePicker expects a dayjs, TimePicker expects a dayjs)
      form.setFieldsValue({
        date: nowIst,
        time: nowIst,
      });
    } else {
      // optional: reset form when modal closed so stale data doesn't linger
      form.resetFields();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isModalOpen]);

  useEffect(() => {
    fetchRequests();
    fetchAllUsers(); // Fetch all users when component mounts
  }, []);
  const typeValue = Form.useWatch("type", form);
  useEffect(() => {
    if (typeValue) {
      const typeLabel = typeValue === "expense" ? "Expense" : "Revenue";
      message.success(`Request Type selected: ${typeLabel}`);
    }
  }, [typeValue, form]);
  const showDetails = (record) => {
    setSelectedRequest(record);
    setViewModal(true);
  };

  const showEdit = (record) => {
    setSelectedRequest(record);
    setEditModal(true);
  };
  const handleReview = async (requestId, status, editedRequest = null) => {
    if (status === "edit" && editedRequest) {
      // Handle edit functionality
      try {
        // In a real implementation, you would update the request here
        // For now, we'll just simulate the update
        message.success("Request updated successfully");
        setEditModal(false);
        setSelectedRequest(null);
        fetchRequests(); // Refresh the list to show updated data
      } catch (error) {
        message.error("Failed to update request");
        console.error("Error updating request:", error);
      }
    } else {
      // Handle approve/reject functionality (keep original logic)
      // This would call the backend API to approve/reject
      try {
        // This is a placeholder - in real implementation you'd call your API
        message.success(`Request ${status} successfully`);
        if (status === "approved" || status === "rejected") {
          setViewModal(false);
        }
        setSelectedRequest(null);
        fetchRequests();
      } catch (error) {
        message.error("Failed to review request");
        console.error("Error reviewing request:", error);
      }
    }
  };
  const fetchRequests = async (
    page = 1,
    limit = 10,
    additionalFilters = {}
  ) => {
    setLoading(true);
    try {
      const response = await getAllFinanceRequests(
        page,
        limit,
        additionalFilters
      );
      // Handle different response structures
      if (response.data && response.pagination) {
        // New structure from backend
        setRequests(response.data);
        setPagination((prev) => ({
          ...prev,
          current: page,
          pageSize: limit,
          total: response.pagination.total || 0,
        }));
      } else if (response && Array.isArray(response)) {
        // Old structure (direct array)
        setRequests(response);
        setPagination((prev) => ({
          ...prev,
          current: page,
          pageSize: limit,
          total: response.length || 0,
        }));
      } else {
        // Fallback
        setRequests([]);
        setPagination((prev) => ({
          ...prev,
          current: page,
          pageSize: limit,
          total: 0,
        }));
      }
    } catch (error) {
      messageApi.error("Failed to fetch requests");
      console.error("Error fetching requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllUsers = async () => {
    try {
      const users = await getAllUsers(); // Call the new service function
      setAllUsers(users);
    } catch (error) {
      messageApi.error("Failed to fetch users");
      console.error("Error fetching users:", error);
    }
  };

  const handleUserSearch = async (value) => {
    if (value.length >= 3) {
      try {
        const users = await searchUsers(value);
        setFilteredUsers(users);
      } catch (error) {
        messageApi.error("Failed to search users");
      }
    } else {
      setFilteredUsers([]);
    }
  };

  const handleStudentSearch = async (value) => {
    if (value.length >= 3) {
      try {
        const students = await searchStudents(value);
        setFilteredStudents(students);
      } catch (error) {
        messageApi.error("Failed to search students");
      }
    } else {
      setFilteredStudents([]);
    }
  };

  const handleSubmit = async (values) => {
  setSubmitting(true);
  try {
    let recipientName = "";

    if (recipientType === "student") {
      const student = filteredStudents.find(
        (s) => s.uniqueId === values.recipient
      );
      recipientName = student?.name || "";
    } else {
      let user = filteredUsers.find((u) => u.email === values.recipient);
      if (!user) {
        user = allUsers.find((u) => u.email === values.recipient);
      }
      if (!user) {
        user = filteredUsers.find((u) => u._id === values.recipient);
      }
      if (!user) {
        user = allUsers.find((u) => u._id === values.recipient);
      }
      recipientName = user?.name || values.recipient || "";
    }

    // Create FormData for file upload
    const formData = new FormData();
    
    // Append regular fields - ENSURE THEY ARE NOT UNDEFINED
    formData.append('type', values.type || '');
    formData.append('requestType', values.requestType || '');
    formData.append('name', recipientName || "Unknown");
    formData.append('date', values.date.format("YYYY-MM-DD"));
    formData.append('time', values.time.format("HH:mm"));
    formData.append('month', values.date.format("MMMM"));
    formData.append('modeOfPayment', values.modeOfPayment || '');
    formData.append('description', values.description || '');
    formData.append('requestedBy', user.id || '');
    formData.append('earnings', values.type === "revenue" ? parseFloat(values.amount) : 0);
    formData.append('expenses', values.type === "expense" ? parseFloat(values.amount) : 0);
    
    if (values.feePeriod) {
      formData.append('feePeriod', values.feePeriod);
    }

    // Append files
    if (fileList && fileList.length > 0) {
      fileList.forEach((file) => {
        formData.append('attachments', file.originFileObj);
      });
    }

    // DEBUG: Log what we're sending
    console.log('FormData contents:');
    for (let [key, value] of formData.entries()) {
      console.log(key, value);
    }

    const response = await createFinanceRequest(formData);
    messageApi.success("Request created successfully");
    setIsModalOpen(false);
    form.resetFields();
    setFileList([]);
    fetchRequests();
  } catch (error) {
    console.error('Submission error:', error);
    messageApi.error(error.message || "Failed to create request");
  } finally {
    setSubmitting(false);
  }
};

  const handleDelete = async (id) => {
    try {
      const response = await deleteFinanceRequest(id);
      messageApi.success("Request deleted successfully");
      fetchRequests();
    } catch (error) {
      messageApi.error("Failed to delete request");
    }
  };
  const handleDropdownVisibleChange = (visible) => {
    // This function can be used to validate when dropdown opens
    // But we'll rely on the form validation instead
    if (visible) {
      // Check if type is selected before showing options
      const type = form.getFieldValue("type");
      if (!type) {
        messageApi.error("Please select Request Type first");
        // Prevent dropdown from opening if no type selected
        return false;
      }
    }
    return true;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "orange";
      case "approved":
        return "green";
      case "rejected":
        return "red";
      default:
        return "default";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <CheckCircleOutlined style={{ color: "orange" }} />;
      case "approved":
        return <CheckCircleOutlined style={{ color: "green" }} />;
      case "rejected":
        return <CloseCircleOutlined style={{ color: "red" }} />;
      default:
        return null;
    }
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      fixed: "left",
      width: 150,
      render: (text) => <span className="period-cell">{text || "N/A"}</span>,
      onCell: () => ({
        style: {
          background: "var(--accent-color) !important",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        },
      }),
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      width: 100,
      render: (type) => (
        <Tag color={type === "revenue" ? "success" : "error"}>
          {type?.toUpperCase() || "N/A"}
        </Tag>
      ),
    },
    {
      title: "Request Type",
      dataIndex: "requestType",
      key: "requestType",
      width: 150,
      render: (text) => (text ? text.toUpperCase() : "N/A"),
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      width: 120,
      render: (_, record) => {
        const amount =
          record.type === "revenue" ? record.earnings : record.expenses;
        return `₹${amount?.toLocaleString() || 0}`;
      },
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      width: 120,
      render: (date) => dayjs(date).format("DD/MM/YYYY"),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status) => (
        <div style={{ display: "flex", alignItems: "center" }}>
          {getStatusIcon(status)}
          <span style={{ marginLeft: "5px" }}>
            {status?.toUpperCase() || "N/A"}
          </span>
        </div>
      ),
    },
    {
      title: "Requested By",
      dataIndex: "requestedBy",
      key: "requestedBy",
      width: 150,
      render: (requestedBy, record) => {
        if (!requestedBy) {
          return "N/A";
        }

        if (typeof requestedBy === "string") {
          return requestedBy;
        }

        if (requestedBy.name) {
          return requestedBy.name;
        }

        if (requestedBy.email) {
          return requestedBy.email;
        }

        return "N/A";
      },
    },
    {
      title: "Actions",
      key: "actions",
      width: 180,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="primary"
            icon={<EyeOutlined />}
            size="small"
            onClick={() => showDetails(record)}
          >
            View
          </Button>
          <Button
            type="primary"
            icon={<EditOutlined />}
            size="small"
            onClick={() => showEdit(record)}
            disabled={
              record.status !== "pending" && record.status !== undefined
            }
          >
            Edit
          </Button>
          {(record.status === "pending" || !record.status) && (
            <Button
              danger
              icon={<DeleteOutlined />}
              size="small"
              onClick={() => handleDelete(record._id)}
              title="Delete Request"
            />
          )}
        </Space>
      ),
    },
  ];

  return (
    <>
      {contextHolder}
      <div
        className="timetable-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h1>Finance Requests</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsModalOpen(true)}
        >
          Create Request
        </Button>
      </div>

      <div
        className="timetable-table-container"
        style={{ marginBottom: "20px" }}
      >
        <Card style={{ padding: "20px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "20px",
            }}
          >
            <h3>Recent Requests</h3>
            <Button
              type="link"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            >
              {showAdvancedFilters ? "Hide Filters" : "Show Filters"}
            </Button>
          </div>

          {showAdvancedFilters && (
            <div
              style={{
                marginBottom: "20px",
                padding: "15px",
                backgroundColor: "var(--card-background-color)",
                borderRadius: "4px",
              }}
            >
              <Form form={filterForm} layout="vertical">
                <Row gutter={16}>
                  <Col span={8}>
                    <Form.Item name="type" label="Type">
                      <Select placeholder="Select type" allowClear>
                        <Option value="revenue">Revenue</Option>
                        <Option value="expense">Expense</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item name="status" label="Status">
                      <Select placeholder="Select status" allowClear>
                        <Option value="pending">Pending</Option>
                        <Option value="approved">Approved</Option>
                        <Option value="rejected">Rejected</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item name="dateRange" label="Date Range">
                      <DatePicker.RangePicker
                        style={{ width: "100%" }}
                        format="YYYY-MM-DD"
                        placeholder={["Start date", "End date"]}
                        value={dateRange}
                      />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col span={24}>
                    <Space>
                      <Button
                        type="primary"
                        onClick={async () => {
                          const values = filterForm.getFieldsValue(true);

                          const { dateRange, ...rest } = values;
                          const query = {
                            ...rest,
                            page: 1,
                            limit: pagination.pageSize,
                          };
                          if (
                            Array.isArray(dateRange) &&
                            dateRange.length === 2
                          ) {
                            query.startDate = dayjs(dateRange[0]).format(
                              "YYYY-MM-DD"
                            );
                            query.endDate = dayjs(dateRange[1]).format(
                              "YYYY-MM-DD"
                            );
                          }
                          Object.keys(query).forEach((k) => {
                            const v = query[k];
                            if (v === undefined || v === null || v === "")
                              delete query[k];
                          });
                          setFilters(query);
                          fetchRequests(1, pagination.pageSize, query);
                        }}
                      >
                        Apply Filters
                      </Button>

                      <Button
                        onClick={() => {
                          filterForm.resetFields();
                          setFilters({});
                          fetchRequests(1, pagination.pageSize);
                        }}
                      >
                        Reset
                      </Button>
                    </Space>
                  </Col>
                </Row>
              </Form>
            </div>
          )}

          <Table
            columns={columns}
            dataSource={requests}
            loading={loading}
            scroll={{ x: 1200 }}
            className="timetable-table"
            pagination={{
              ...pagination,
              onChange: (page, pageSize) => {
                fetchRequests(page, pageSize);
              },
            }}
            rowKey="_id"
          />
        </Card>
      </div>

      <Modal
        title="Create Finance Request"
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setFileList([]); // NEW: Clear file list on cancel
        }}
        footer={null}
        width={700}
        className="add-notice-modal"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            dateRange: [dayjs().subtract(1, "month"), dayjs()],
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="type"
                label="Type"
                rules={[{ required: true, message: "Please select type" }]}
              >
                <Select placeholder="Select type">
                  <Option value="expense">Expense</Option>
                  <Option value="revenue">Revenue</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="requestType"
                label="Request Category"
                rules={[
                  { required: true, message: "Please select request category" },
                ]}
              >
                <Select
                  placeholder="Select category"
                  showSearch
                  filterOption={(input, option) =>
                    option.children
                      .toLowerCase()
                      .indexOf(input.toLowerCase()) >= 0
                  }
                  onOpenChange={handleDropdownVisibleChange}
                  // disabled={!typeValue}
                >
                  {typeValue === "revenue" &&
                    revenueTypes.map((type) => (
                      <Option key={type} value={type}>
                        {type
                          .replace(/([A-Z])/g, " $1")
                          .replace(/^./, (str) => str.toUpperCase())}
                      </Option>
                    ))}
                  {typeValue === "expense" &&
                    expenseTypes.map((type) => (
                      <Option key={type} value={type}>
                        {type
                          .replace(/([A-Z])/g, " $1")
                          .replace(/^./, (str) => str.toUpperCase())}
                      </Option>
                    ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="recipientType"
                label="Recipient Type"
                rules={[
                  { required: true, message: "Please select recipient type" },
                ]}
                initialValue="user"
              >
                <Select
                  placeholder="Select recipient type"
                  onChange={(value) => setRecipientType(value)}
                >
                  <Option value="user">User</Option>
                  <Option value="student">Student</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="amount"
                label="Amount"
                rules={[{ required: true, message: "Please enter amount" }]}
              >
                <Input type="number" placeholder="Enter amount" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="recipient"
                label={recipientType === "student" ? "Student" : "User"}
                rules={[
                  { required: true, message: "Please select a recipient" },
                ]}
              >
                <Select
                  placeholder={`Select a ${recipientType}`}
                  showSearch
                  onSearch={
                    recipientType === "student"
                      ? handleStudentSearch
                      : handleUserSearch
                  }
                  filterOption={false}
                  allowClear
                >
                  {recipientType === "student"
                    ? filteredStudents.map((student) => (
                        <Option key={student.uniqueId} value={student.uniqueId}>
                          {student.name} ({student.uniqueId})
                        </Option>
                      ))
                    : allUsers.map(
                        (
                          user // Use allUsers instead of filteredUsers
                        ) => (
                          <Option key={user._id} value={user.email}>
                            {user.name} ({user.email})
                          </Option>
                        )
                      )}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="date"
                label="Date"
                rules={[{ required: true, message: "Please select date" }]}
              >
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="time"
                label="Time"
                rules={[{ required: true, message: "Please select time" }]}
              >
                <TimePicker style={{ width: "100%" }} format="HH:mm" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="modeOfPayment"
                label="Payment Method"
                rules={[
                  { required: true, message: "Please select payment method" },
                ]}
              >
                <Select placeholder="Select payment method">
                  {paymentModes.map((mode) => (
                    <Option key={mode} value={mode}>
                      {mode
                        .replace(/([A-Z])/g, " $1")
                        .replace(/^./, (str) => str.toUpperCase())}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: "Please enter description" }]}
          >
            <TextArea rows={3} placeholder="Enter description" />
          </Form.Item>

          {/* NEW: Attachment Upload Field */}
          <Form.Item
            name="attachments"
            label="Attachments (Optional)"
            valuePropName="fileList"
            getValueFromEvent={(e) => {
              if (Array.isArray(e)) {
                return e;
              }
              return e?.fileList;
            }}
            extra="Upload bill/receipt images (Max 2 files, JPG/PNG only, 5MB each)"
          >
            <Upload
              listType="picture-card"
              maxCount={2}
              accept=".jpg,.jpeg,.png"
              beforeUpload={(file) => {
                const isJpgOrPng =
                  file.type === "image/jpeg" || file.type === "image/png";
                if (!isJpgOrPng) {
                  messageApi.error("You can only upload JPG/PNG file!");
                  return Upload.LIST_IGNORE;
                }
                const isLt5M = file.size / 1024 / 1024 < 5;
                if (!isLt5M) {
                  messageApi.error("Image must be smaller than 5MB!");
                  return Upload.LIST_IGNORE;
                }
                return false; // Prevent auto upload
              }}
              fileList={fileList}
              onChange={({ fileList: newFileList }) => setFileList(newFileList)}
            >
              {fileList.length >= 2 ? null : (
                <div>
                  <UploadOutlined />
                  <div style={{ marginTop: 8 }}>Upload</div>
                </div>
              )}
            </Upload>
          </Form.Item>

          <Form.Item
            name="feePeriod"
            label="Fee Period (for revenue)"
            hidden={form.getFieldValue("type") !== "revenue"}
          >
            <Input placeholder="e.g., Jan 2024 - Mar 2024" />
          </Form.Item>

          <Divider style={{ margin: "20px 0" }} />

          <Form.Item>
            <Space style={{ width: "100%", justifyContent: "flex-end" }}>
              <Button
                onClick={() => {
                  setIsModalOpen(false);
                  setFileList([]);
                }}
              >
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" loading={submitting}>
                Create Request
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
      <ReviewModal
        visible={viewModal}
        onClose={() => setViewModal(false)}
        request={selectedRequest}
        onReview={handleReview}
        mode="view"
        showActionButtons={false}
      />
      <ReviewModal
        visible={editModal}
        onClose={() => setEditModal(false)}
        request={selectedRequest}
        onReview={handleReview}
        mode="edit"
      />
    </>
  );
};

export default FinanceRequests;
