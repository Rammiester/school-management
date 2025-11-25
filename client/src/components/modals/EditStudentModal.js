import React, { useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  message,
  Row,
  Col,
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
} from "@mui/icons-material";
import { appDefaults } from "../../api/index.js";

const { Option } = Select;
const { TextArea } = Input;

const COLORS = {
  PRIMARY: "#f5ae3f",
  SECONDARY: "#e07a5f",
  ACCENT: "#8c2a1e",
  BACKGROUND: "#002247",
  INPUT_BG: "#0a406a",
  TEXT_LIGHT: "#ffffff",
};

const labelWithIcon = (Icon, text) => (
  <span
    style={{
      color: COLORS.TEXT_LIGHT,
      display: "flex",
      alignItems: "center",
      gap: "6px",
    }}
  >
    <Icon style={{ fontSize: "18px", color: COLORS.TEXT_LIGHT }} />
    {text}
  </span>
);

const EditStudentModal = ({ visible, student, onClose, onUpdate }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible && student) {
      form.setFieldsValue({
        ...student,
        dob: student.dob ? dayjs(student.dob) : null,
      });
    }
  }, [visible, student, form]);

  const handleSubmit = async (values) => {
    try {
      const updatedPayload = {
        ...values,
        dob: values.dob ? values.dob.toISOString() : null,
      };

      const res = await fetch(`${appDefaults.api.baseURL}/students/${student._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedPayload),
      });

      if (!res.ok) throw new Error("Failed to update student");

      const updatedStudent = await res.json();
      message.success("Student updated successfully!");
      onUpdate(updatedStudent); // notify parent
      onClose(); // close modal
    } catch (err) {
      console.error("Update failed", err);
      message.error("Failed to update student");
    }
  };

  return (
    <Modal
      title="✏️ Edit Student"
      open={visible}
      onCancel={onClose}
      onOk={() => form.submit()}
      okText="Save Changes"
      okButtonProps={{
        style: {
          backgroundColor: COLORS.PRIMARY,
          borderColor: COLORS.PRIMARY,
          fontWeight: "bold",
        },
      }}
      cancelButtonProps={{
        style: {
          backgroundColor: "#eee",
        },
      }}
      bodyStyle={{ background: COLORS.BACKGROUND, color: COLORS.TEXT_LIGHT }}
      width={900}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        autoComplete="off"
      >
        <Row gutter={24}>
          <Col xs={24} md={12}>
            <Form.Item
              label={labelWithIcon(PersonIcon, "Full Name")}
              name="name"
              rules={[{ required: true, message: "Please enter full name" }]}
            >
              <Input />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              label={labelWithIcon(WcIcon, "Gender")}
              name="gender"
              rules={[{ required: true, message: "Please select gender" }]}
            >
              <Select placeholder="Select gender">
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
              rules={[{ required: true, message: "Select date of birth" }]}
            >
              <DatePicker style={{ width: "100%" }} />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              label={labelWithIcon(BadgeIcon, "Unique ID")}
              name="uniqueId"
              rules={[{ required: true, message: "Enter unique ID" }]}
            >
              <Input />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              label={labelWithIcon(FingerprintIcon, "Admission ID")}
              name="admissionId"
              rules={[{ required: true, message: "Enter admission ID" }]}
            >
              <Input />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              label={labelWithIcon(BloodtypeIcon, "Blood Group")}
              name="bloodGroup"
              rules={[{ required: true, message: "Select blood group" }]}
            >
              <Select placeholder="Select blood group">
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
              rules={[{ type: "email", message: "Invalid email" }]}
            >
              <Input />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              label={labelWithIcon(CallIcon, "Contact")}
              name="contact"
              rules={[
                { pattern: /^[0-9]{10}$/, message: "Enter 10-digit number" },
              ]}
            >
              <Input maxLength={10} />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              label={labelWithIcon(PersonIcon, "Father's Name")}
              name="fatherName"
            >
              <Input />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              label={labelWithIcon(CallIcon, "Parent Contact")}
              name="parentContact"
              rules={[
                { pattern: /^[0-9]{10}$/, message: "Enter 10-digit number" },
              ]}
            >
              <Input maxLength={10} />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item label={labelWithIcon(PersonIcon, "Grade")} name="grade">
              <Input placeholder="e.g. 10th" />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              label={labelWithIcon(PersonIcon, "Section")}
              name="section"
            >
              <Input placeholder="e.g. A" />
            </Form.Item>
          </Col>

          <Col xs={24}>
            <Form.Item
              label={labelWithIcon(HomeIcon, "Address")}
              name="address"
            >
              <Input />
            </Form.Item>
          </Col>

          <Col xs={24}>
            <Form.Item
              label={labelWithIcon(NotesIcon, "Remarks")}
              name="remarks"
            >
              <TextArea rows={2} />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              label={labelWithIcon(PersonIcon, "Age")}
              name="age"
              rules={[
                {
                  type: "number",
                  transform: (value) => Number(value),
                  message: "Enter valid age",
                },
              ]}
            >
              <Input type="number" />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              label={labelWithIcon(PersonIcon, "Performance Score")}
              name="performanceScore"
            >
              <Input type="number" />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              label={labelWithIcon(PersonIcon, "Attendance (%)")}
              name="attendance"
              rules={[
                {
                  pattern: /^\d{1,3}%$/,
                  message: "Use format like 90%",
                },
              ]}
            >
              <Input placeholder="e.g. 85%" />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default EditStudentModal;
