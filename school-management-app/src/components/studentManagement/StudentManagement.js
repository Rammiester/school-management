import React, { useEffect, useState } from "react";
import {
  Form,
  Input,
  Typography,
  DatePicker,
  Select,
  Row,
  Col,
  message,
} from "antd";
import "antd/dist/reset.css";
import "./StudentManagement.css";
import {
  Person as PersonIcon,
  Wc as WcIcon,
  CalendarToday as CalendarTodayIcon,
  Badge as BadgeIcon,
  Call as CallIcon,
  Fingerprint as FingerprintIcon,
  Bloodtype as BloodtypeIcon,
  Email as EmailIcon,
  Notes as NotesIcon,
  Home as HomeIcon,
} from "@mui/icons-material";

import {
  getSuggestedStudentId,
  saveStudent,
} from "../../services/dashboardService";

const CITY_CODE = "pat";
const CURRENT_YEAR = new Date().getFullYear();
const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const StudentManagement = () => {
  const [form] = Form.useForm();
  const [loadingId, setLoadingId] = useState(false);
  const [suggestedId, setSuggestedId] = useState("");
  const [messageApi, contextHolder] = message.useMessage();

  // Helper for form labels with icons
  const labelWithIcon = (Icon, text) => (
    <span className="student-management-form-label">
      <Icon />
      {text}
    </span>
  );

  // Show toast messages (success/error/info)
  const showToast = (type, content) => {
    messageApi.open({
      type,
      content,
      duration: 3, // visible for 3 seconds
      style: { fontSize: 16 },
    });
  };

  // Fetch next available unique id from API
  const fetchSuggestedId = async () => {
    setLoadingId(true);
    try {
      const id = await getSuggestedStudentId(CITY_CODE, CURRENT_YEAR);
      setSuggestedId(id);
      form.setFieldsValue({ uniqueId: id });
    } catch (err) {
      setSuggestedId("");
      form.setFieldsValue({ uniqueId: "" });
      showToast("error", "Failed to fetch student ID. Try again.");
    } finally {
      setLoadingId(false);
    }
  };

  useEffect(() => {
    fetchSuggestedId();
    // eslint-disable-next-line
  }, []);

  // When DOB changes, only set age
  const handleDobChange = (date) => {
    if (date) {
      const today = new Date();
      const birthDate = date.toDate();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      form.setFieldsValue({ age });
    } else {
      form.setFieldsValue({ age: undefined });
    }
  };

  // Clear any toast when user edits a field
  const handleFieldChange = () => {
    messageApi.destroy();
  };

  const handleAddStudent = async (values) => {
    try {
      const studentPayload = {
        ...values,
        uniqueId: suggestedId,
        cityCode: CITY_CODE,
        dob: values.dob.toISOString(),
        admissionYear: CURRENT_YEAR,
        marks: { 2019: 0, 2020: 0, 2021: 0, 2022: 0 },
        testReports: [],
        complaints: [],
        awards: [],
        examResults: [],
        overallPercentage: 0,
        classPosition: "N/A",
        sectionPosition: "N/A",
        schoolPerformanceRange: "N/A",
      };

      const response = await saveStudent(studentPayload);

      // Only show message if the backend confirms success
      if (response && response.message === "Student added!") {
        showToast("success", "Student added successfully!");
        form.resetFields();
        fetchSuggestedId(); // get next for further adds
      }
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.suggestedId
      ) {
        showToast(
          "error",
          "Student ID already exists! Suggesting next available ID."
        );
        setSuggestedId(error.response.data.suggestedId);
        form.setFieldsValue({ uniqueId: error.response.data.suggestedId });
        return;
      }
      showToast(
        "error",
        error.message || "Failed to add student. Please try again."
      );
    }
  };

  return (
    <div className="student-management-container">
      {/* Must include contextHolder for AntD popup messages to work */}
      {contextHolder}

      <div className="student-management-header">
        <Title level={4} style={{ color: "white", margin: 0 }}>
          🧑‍🎓 Add New Student
        </Title>
      </div>
      <div className="student-management-form-container">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAddStudent}
          autoComplete="off"
          onFieldsChange={handleFieldChange}
        >
          <Row gutter={24}>
            <Col xs={24} md={12}>
              <Form.Item
                label={labelWithIcon(PersonIcon, "Full Name")}
                name="name"
                rules={[
                  { required: true, message: "Please enter student name" },
                ]}
              >
                <Input placeholder="Enter full name" className="student-management-input" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label={labelWithIcon(WcIcon, "Gender")}
                name="gender"
                rules={[{ required: true, message: "Please select gender" }]}
              >
                <Select placeholder="Select gender" className="student-management-select">
                  <Option value="Male">Male</Option>
                  <Option value="Female">Female</Option>
                  <Option value="Other">Other</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label={labelWithIcon(CalendarTodayIcon, "Date of Birth")}
                name="dob"
                rules={[{ required: true, message: "Please select DOB" }]}
              >
                <DatePicker
                  className="student-management-datepicker"
                  onChange={handleDobChange}
                  format="YYYY-MM-DD"
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label={labelWithIcon(BadgeIcon, "Unique ID")}
                name="uniqueId"
                initialValue={suggestedId}
              >
                <Input
                  value={suggestedId}
                  readOnly
                  placeholder="Auto-generated"
                  suffix={loadingId ? <Loading size="small" /> : null}
                  className="student-management-disabled-input"
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label={labelWithIcon(FingerprintIcon, "Admission ID")}
                name="admissionId"
                rules={[
                  { required: true, message: "Please enter admission ID" },
                ]}
              >
                <Input placeholder="Enter admission ID" className="student-management-input" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label={labelWithIcon(BloodtypeIcon, "Blood Group")}
                name="bloodGroup"
                rules={[
                  { required: true, message: "Please select blood group" },
                ]}
              >
                <Select placeholder="Select blood group" className="student-management-select">
                  {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map(
                    (group) => (
                      <Option key={group} value={group}>
                        {group}
                      </Option>
                    )
                  )}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label={labelWithIcon(EmailIcon, "Email")}
                name="email"
                rules={[
                  { required: true, message: "Please enter email" },
                  { type: "email", message: "Invalid email format" },
                ]}
              >
                <Input placeholder="Enter email address" className="student-management-input" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label={labelWithIcon(CallIcon, "Contact")}
                name="contact"
                rules={[
                  { required: true, message: "Enter contact number" },
                  {
                    pattern: /^[0-9]{10}$/,
                    message: "Enter a valid 10-digit number",
                  },
                ]}
              >
                <Input placeholder="Enter contact number" maxLength={10} className="student-management-input" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label={labelWithIcon(PersonIcon, "Father's Name")}
                name="fatherName"
                rules={[
                  { required: true, message: "Please enter father's name" },
                ]}
              >
                <Input placeholder="Enter father's name" className="student-management-input" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label={labelWithIcon(CallIcon, "Parent Contact")}
                name="parentContact"
                rules={[
                  { required: true, message: "Enter parent contact" },
                  {
                    pattern: /^[0-9]{10}$/,
                    message: "Enter a valid 10-digit number",
                  },
                ]}
              >
                <Input placeholder="Parent contact number" maxLength={10} className="student-management-input" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label={labelWithIcon(PersonIcon, "Grade")}
                name="grade"
                rules={[{ required: true, message: "Please enter grade" }]}
              >
                <Input placeholder="e.g. 10th, 9th, 11th" className="student-management-input" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label={labelWithIcon(PersonIcon, "Section")}
                name="section"
                rules={[{ required: true, message: "Please enter section" }]}
              >
                <Input placeholder="e.g. A, B, C" className="student-management-input" />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item
                label={labelWithIcon(HomeIcon, "Address")}
                name="address"
                rules={[{ required: true, message: "Please enter address" }]}
              >
                <Input placeholder="Enter address" className="student-management-input" />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item
                label={labelWithIcon(NotesIcon, "Remarks")}
                name="remarks"
              >
                <TextArea rows={2} placeholder="Any remarks or notes..." className="student-management-textarea" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label={labelWithIcon(PersonIcon, "Age")} name="age">
                <Input
                  type="number"
                  readOnly
                  placeholder="Calculated from DOB"
                  className="student-management-disabled-input"
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label={labelWithIcon(PersonIcon, "Performance Score")}
                name="performanceScore"
              >
                <Input type="number" placeholder="Score out of 100" className="student-management-input" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label={labelWithIcon(PersonIcon, "Attendance (%)")}
                name="attendance"
                rules={[
                  { pattern: /^\d{1,3}%$/, message: "Use format like 90%" },
                ]}
              >
                <Input placeholder="e.g. 85%" className="student-management-input" />
              </Form.Item>
            </Col>
          </Row>
          <div style={{ textAlign: "right", marginTop: "20px" }}>
            <button
              type="submit"
              disabled={loadingId || !suggestedId}
              className="student-management-save-button"
            >
              {loadingId ? <Loading size="small" /> : "Save Student"}
            </button>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default StudentManagement;
