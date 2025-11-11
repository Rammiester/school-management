import React, { useContext, useState } from "react";
import {
  Form,
  Input,
  DatePicker,
  Select,
  message,
  Typography,
  Row,
  Col,
} from "antd";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { submitRevenue } from "../../services/dashboardService";
import {
  Container,
  HeaderBox,
  FormContainer,
  SaveButton,
} from "./AddRevenue.styles";
import {
  CalendarToday as CalendarTodayIcon,
  EventNote as EventNoteIcon,
  AttachMoney as AttachMoneyIcon,
  MoneyOff as MoneyOffIcon,
  Description as DescriptionIcon,
  Badge as BadgeIcon,
} from "@mui/icons-material";

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const AddRevenue = () => {
  const [form] = Form.useForm();
  const { user } = useContext(AuthContext);
  const [isFee, setIsFee] = useState(false);

  // For conditional rendering of Student Unique ID field
  const onFieldsChange = (_, allFields) => {
    const type = allFields.find(f => f.name[0] === "type")?.value;
    const desc = allFields.find(f => f.name[0] === "description")?.value || "";
    setIsFee(
      type === "earning" && desc.toLowerCase().includes("fee")
    );
  };

  const labelWithIcon = (Icon, text) => (
    <span style={{ display: "flex", alignItems: "center", gap: 6, color: "#fff" }}>
      <Icon style={{ fontSize: 18, color: "#fff" }} />
      {text}
    </span>
  );

  const handleAdd = async (values) => {
    try {
      const payload = {
        date: values.date.toISOString(),
        month: values.month,
        description: values.description,
        createdBy: user.email,
        earnings: values.type === "earning" ? Number(values.amount) : 0,
        expenses: values.type === "expense" ? Number(values.amount) : 0,
        studentUniqueId: (values.type === "earning" && isFee) ? values.studentUniqueId : undefined,
        type: values.type,
      };
      await submitRevenue(payload);
      message.success("Entry submitted (pending chairman approval)");
      form.resetFields();
      setIsFee(false);
    } catch (err) {
      message.error(
        err?.response?.data?.error || "Failed to submit entry. Please try again."
      );
    }
  };

  return (
    <Container>
      <HeaderBox>
        <Title level={4} style={{ color: "white", margin: 0 }}>
          💰 Add Revenue / Expense
        </Title>
      </HeaderBox>

      <FormContainer>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAdd}
          autoComplete="off"
          onFieldsChange={onFieldsChange}
        >
          <Row gutter={24}>
            <Col xs={24} md={12}>
              <Form.Item
                label={labelWithIcon(CalendarTodayIcon, "Transaction Date")}
                name="date"
                rules={[{ required: true, message: "Please select a date" }]}
              >
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                label={labelWithIcon(EventNoteIcon, "Month")}
                name="month"
                rules={[{ required: true, message: "Please enter month" }]}
              >
                <Input placeholder="e.g. January" />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                label={labelWithIcon(AttachMoneyIcon, "Type")}
                name="type"
                rules={[{ required: true, message: "Please select type" }]}
              >
                <Select placeholder="Select type">
                  <Option value="earning">Earning</Option>
                  <Option value="expense">Expense</Option>
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                label={labelWithIcon(MoneyOffIcon, "Amount")}
                name="amount"
                rules={[{ required: true, message: "Please enter amount" }]}
              >
                <Input type="number" placeholder="Enter amount" min={1} />
              </Form.Item>
            </Col>

            <Col xs={24}>
              <Form.Item
                label={labelWithIcon(DescriptionIcon, "Description")}
                name="description"
                rules={[{ required: true, message: "Please enter description" }]}
              >
                <TextArea rows={3} placeholder="Purpose/details (e.g. Fee, Sports, Transport...)" />
              </Form.Item>
            </Col>

            {isFee && (
              <Col xs={24} md={12}>
                <Form.Item
                  label={labelWithIcon(BadgeIcon, "Student Unique ID")}
                  name="studentUniqueId"
                  rules={[{ required: true, message: "Enter student unique ID for fee collection" }]}
                >
                  <Input placeholder="e.g. pat202501" />
                </Form.Item>
              </Col>
            )}
          </Row>

          <div style={{ textAlign: "right", marginTop: 24 }}>
            <SaveButton type="primary" htmlType="submit">
              Save Entry
            </SaveButton>
          </div>
        </Form>
      </FormContainer>
    </Container>
  );
};

export default AddRevenue;
