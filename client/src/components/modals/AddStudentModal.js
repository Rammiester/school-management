import React, { useEffect, useState } from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  message,
  Row,
  Col,
  Button,
} from "antd";
import dayjs from "dayjs";
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
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import { appDefaults } from "../../api/index.js";
import {
  getSuggestedStudentId,
  saveStudent,
} from "../../services/dashboardService";
import Loading from "../LoadingComponent/Loading";

const { Option } = Select;
const { TextArea } = Input;

const COLORS = {
  PRIMARY: "var(--primary-color)",
  SECONDARY: "var(--secondary-color)",
  ACCENT: "var(--accent-color)",
  BACKGROUND: "var(--background-color)",
  INPUT_BG: "var(--input-background-color)",
  TEXT_LIGHT: "var(--text-light-color)",
  CARD_BG: "var(--card-background-color)",
};

const CITY_CODE = "pat";
const CURRENT_YEAR = new Date().getFullYear();

const labelWithIcon = (Icon, text) => (
  <span
    style={{
      color: COLORS.TEXT_LIGHT,
      display: "flex",
      alignItems: "center",
      gap: "6px",
      fontWeight: "500",
    }}
  >
    <Icon style={{ fontSize: "18px", color: COLORS.SECONDARY }} />
    {text}
  </span>
);

const AddStudentModal = ({ visible, onClose, onStudentAdded }) => {
  const [form] = Form.useForm();
  const [loadingId, setLoadingId] = useState(false);
  const [suggestedId, setSuggestedId] = useState("");
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
    if (visible) {
      fetchSuggestedId();
      form.resetFields();
    }
  }, [visible, form]);

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

  const handleSubmit = async (values) => {
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

      if (response && response.message === "Student added!") {
        showToast("success", "Student added successfully!");
        onStudentAdded();
        onClose();
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

  const handleRefreshId = async () => {
    await fetchSuggestedId();
  };

  return (
    <>
      <style>
        {`
          .ant-select-selector {
            border: 1px solid var(--border-color) !important;
            background: ${COLORS.INPUT_BG} !important;
            color: ${COLORS.TEXT_LIGHT} !important;
          }
          
          .ant-modal-content {
            position: relative;
            background-clip: padding-box;
            border: 0;
            border-radius: 8px;
            box-shadow: 0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 9px 28px 8px rgba(0, 0, 0, 0.05);
            pointer-events: auto;
            padding: 20px 24px;
          }
          
          .ant-modal-header {
            background: ${COLORS.CARD_BG} !important;
            border-bottom: 1px solid var(--border-color);
          }
          
          .ant-modal-title {
            color: ${COLORS.TEXT_LIGHT} !important;
            background: ${COLORS.BACKGROUND} !important;
          }
          
          .ant-select-dropdown {
            background: ${COLORS.INPUT_BG} !important;
            color: ${COLORS.TEXT_LIGHT} !important;
          }
          
          .ant-select-option {
            background: ${COLORS.INPUT_BG} !important;
            color: ${COLORS.TEXT_LIGHT} !important;
          }
          
          .ant-select-option:hover {
            background: ${COLORS.PRIMARY} !important;
          }
          
          .ant-input::placeholder,
          .ant-input-affix-wrapper::placeholder,
          .ant-select-selection-placeholder {
            color: var(--placeholder-color) !important;
            opacity: 1;
          }
          
          .ant-picker {
            background: ${COLORS.INPUT_BG} !important;
            color: ${COLORS.TEXT_LIGHT} !important;
            border: 1px solid var(--border-color) !important;
          }
          
          .ant-picker-input > input {
            color: ${COLORS.TEXT_LIGHT} !important;
          }
        `}
      </style>
      {contextHolder}
      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ color: COLORS.SECONDARY }}>🧑‍🎓</span>
            <span>Add New Student</span>
          </div>
        }
        open={visible}
        onCancel={onClose}
        onOk={() => form.submit()}
        okText="Save Student"
        okButtonProps={{
          style: {
            backgroundColor: COLORS.PRIMARY,
            borderColor: COLORS.PRIMARY,
            fontWeight: "bold",
            borderRadius: "4px",
          },
          disabled: loadingId || !suggestedId,
        }}
        cancelButtonProps={{
          style: {
            backgroundColor: "var(--dark-card)",
            borderColor: "var(--dark-card)",
            color: COLORS.TEXT_LIGHT,
            borderRadius: "4px",
          },
        }}
        bodyStyle={{
          background: COLORS.BACKGROUND,
          color: COLORS.TEXT_LIGHT,
          padding: "24px",
        }}
        width={900}
        footer={[
          <Button
            key="back"
            onClick={onClose}
            style={{
              backgroundColor: "var(--dark-card)",
              borderColor: "var(--dark-card)",
              color: COLORS.TEXT_LIGHT,
              borderRadius: "4px",
            }}
          >
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={() => form.submit()}
            disabled={loadingId || !suggestedId}
            style={{
              backgroundColor: COLORS.PRIMARY,
              borderColor: COLORS.PRIMARY,
              fontWeight: "bold",
              borderRadius: "4px",
            }}
          >
            Save Student
          </Button>,
        ]}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          autoComplete="off"
          style={{
            background: COLORS.CARD_BG,
            padding: "20px",
            borderRadius: "8px",
          }}
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
                <Input
                  placeholder="Enter full name"
                  style={{
                    background: COLORS.INPUT_BG,
                    color: COLORS.TEXT_LIGHT,
                    borderColor: "var(--border-color)",
                  }}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label={labelWithIcon(WcIcon, "Gender")}
                name="gender"
                rules={[{ required: true, message: "Please select gender" }]}
              >
                <Select
                  placeholder="Select gender"
                  style={{
                    background: COLORS.INPUT_BG,
                    color: COLORS.TEXT_LIGHT,
                    borderColor: "var(--border-color)",
                  }}
                  dropdownStyle={{
                    background: COLORS.INPUT_BG,
                    color: COLORS.TEXT_LIGHT,
                  }}
                >
                  <Option
                    value="Male"
                    style={{
                      background: COLORS.INPUT_BG,
                      color: COLORS.TEXT_LIGHT,
                    }}
                  >
                    Male
                  </Option>
                  <Option
                    value="Female"
                    style={{
                      background: COLORS.INPUT_BG,
                      color: COLORS.TEXT_LIGHT,
                    }}
                  >
                    Female
                  </Option>
                  <Option
                    value="Other"
                    style={{
                      background: COLORS.INPUT_BG,
                      color: COLORS.TEXT_LIGHT,
                    }}
                  >
                    Other
                  </Option>
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
                  style={{
                    width: "100%",
                    background: COLORS.INPUT_BG,
                    color: COLORS.TEXT_LIGHT,
                  }}
                  onChange={handleDobChange}
                  format="YYYY-MM-DD"
                  popupStyle={{ background: COLORS.INPUT_BG }}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label={labelWithIcon(BadgeIcon, "Student ID")}
                name="uniqueId"
                initialValue={suggestedId}
              >
                <div style={{ display: "flex", alignItems: "center" }}>
                  <Input
                    value={suggestedId}
                    readOnly
                    placeholder="Auto-generated (SRS_PAT_2025_0001)"
                    suffix={loadingId ? <Loading size="small" /> : null}
                    style={{
                      background: COLORS.INPUT_BG,
                      color: COLORS.TEXT_LIGHT,
                      borderColor: "var(--border-color)",
                      borderTopRightRadius: "0",
                      borderBottomRightRadius: "0",
                      width: "100%",
                    }}
                  />
                  <Button
                    onClick={handleRefreshId}
                    disabled={loadingId}
                    style={{
                      backgroundColor: "#333",
                      borderColor: "#333",
                      color: COLORS.TEXT_LIGHT,
                      borderTopLeftRadius: "0",
                      borderBottomLeftRadius: "0",
                      width: "40px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <RefreshIcon style={{ fontSize: 16 }} />
                  </Button>
                </div>
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
                <Input
                  placeholder="Enter admission ID"
                  style={{
                    background: COLORS.INPUT_BG,
                    color: COLORS.TEXT_LIGHT,
                    borderColor: "var(--border-color)",
                  }}
                />
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
                <Select
                  placeholder="Select blood group"
                  style={{
                    background: COLORS.INPUT_BG,
                    color: COLORS.TEXT_LIGHT,
                  }}
                  dropdownStyle={{
                    background: COLORS.INPUT_BG,
                    color: COLORS.TEXT_LIGHT,
                  }}
                >
                  {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map(
                    (group) => (
                      <Option
                        key={group}
                        value={group}
                        style={{
                          background: COLORS.INPUT_BG,
                          color: COLORS.TEXT_LIGHT,
                        }}
                      >
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
                <Input
                  placeholder="Enter email address"
                  style={{
                    background: COLORS.INPUT_BG,
                    color: COLORS.TEXT_LIGHT,
                    borderColor: "var(--border-color)",
                  }}
                />
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
                <Input
                  placeholder="Enter contact number"
                  maxLength={10}
                  style={{
                    background: COLORS.INPUT_BG,
                    color: COLORS.TEXT_LIGHT,
                    borderColor: "var(--border-color)",
                  }}
                />
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
                <Input
                  placeholder="Enter father's name"
                  style={{
                    background: COLORS.INPUT_BG,
                    color: COLORS.TEXT_LIGHT,
                    borderColor: "var(--border-color)",
                  }}
                />
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
                <Input
                  placeholder="Parent contact number"
                  maxLength={10}
                  style={{
                    background: COLORS.INPUT_BG,
                    color: COLORS.TEXT_LIGHT,
                    borderColor: "var(--border-color)",
                  }}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label={labelWithIcon(PersonIcon, "Grade")}
                name="grade"
                rules={[{ required: true, message: "Please select grade" }]}
              >
                <Select
                  placeholder="Select grade"
                  style={{
                    background: COLORS.INPUT_BG,
                    color: COLORS.TEXT_LIGHT,
                    borderColor: "var(--border-color)",
                  }}
                  dropdownStyle={{
                    background: COLORS.INPUT_BG,
                    color: COLORS.TEXT_LIGHT,
                  }}
                >
                  {Array.from({ length: 12 }, (_, i) => {
                    const grade = `${i + 1}${
                      i === 0 ? "st" : i === 1 ? "nd" : i === 2 ? "rd" : "th"
                    }`;
                    return (
                      <Option
                        key={grade}
                        value={grade}
                        style={{
                          background: COLORS.INPUT_BG,
                          color: COLORS.TEXT_LIGHT,
                        }}
                      >
                        {grade}
                      </Option>
                    );
                  })}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label={labelWithIcon(PersonIcon, "Section")}
                name="section"
                rules={[{ required: true, message: "Please enter section" }]}
              >
                <Input
                  placeholder="e.g. A, B, C"
                  style={{
                    background: COLORS.INPUT_BG,
                    color: COLORS.TEXT_LIGHT,
                    borderColor: "var(--border-color)",
                  }}
                />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item
                label={labelWithIcon(HomeIcon, "Address")}
                name="address"
                rules={[{ required: true, message: "Please enter address" }]}
              >
                <Input
                  placeholder="Enter address"
                  style={{
                    background: COLORS.INPUT_BG,
                    color: COLORS.TEXT_LIGHT,
                    borderColor: "var(--border-color)",
                  }}
                />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item
                label={labelWithIcon(NotesIcon, "Remarks")}
                name="remarks"
              >
                <TextArea
                  rows={2}
                  placeholder="Any remarks or notes..."
                  style={{
                    background: COLORS.INPUT_BG,
                    color: COLORS.TEXT_LIGHT,
                    borderColor: "var(--border-color)",
                  }}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label={labelWithIcon(PersonIcon, "Age")} name="age">
                <Input
                  type="number"
                  readOnly
                  placeholder="Calculated from DOB"
                  style={{
                    background: COLORS.INPUT_BG,
                    color: COLORS.TEXT_LIGHT,
                    borderColor: "var(--border-color)",
                  }}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label={labelWithIcon(PersonIcon, "Performance Score")}
                name="performanceScore"
              >
                <Input
                  type="number"
                  placeholder="Score out of 100"
                  style={{
                    background: COLORS.INPUT_BG,
                    color: COLORS.TEXT_LIGHT,
                    borderColor: "var(--border-color)",
                  }}
                />
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
                <Input
                  placeholder="e.g. 85%"
                  style={{
                    background: COLORS.INPUT_BG,
                    color: COLORS.TEXT_LIGHT,
                    borderColor: "var(--border-color)",
                  }}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </>
  );
};

export default AddStudentModal;
