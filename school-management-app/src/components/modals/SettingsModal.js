import React, { useState, useContext, useEffect } from "react";
import {
  Modal,
  Form,
  Button,
  Switch,
  Select,
  Input,
  Typography,
  message,
  Menu,
  DatePicker,
} from "antd";
import {
  CloseOutlined,
  SettingOutlined,
  GlobalOutlined,
  TeamOutlined,
  LinkOutlined,
  ToolOutlined,
  UserOutlined,
  SoundOutlined,
  MessageOutlined,
  InfoCircleOutlined,
  CrownOutlined,
  CheckOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone,
} from "@ant-design/icons";
import { AuthContext } from "../../context/AuthContext";
import { scheduleRollNumbers, getScheduledRollNumberDate, cancelScheduledRollNumbers } from "../../api";
import "./SettingsModal.css";

const { Title, Text } = Typography;
const { Option } = Select;

const SettingsModal = ({ visible, onClose, theme: initialTheme, setTheme }) => {
  const { user } = useContext(AuthContext);
  const [form] = Form.useForm();
  const [selectedMenuItem, setSelectedMenuItem] = useState("general");
  const [language, setLanguage] = useState("English (US)");
  const [notifications, setNotifications] = useState("off");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [showAdvancedParams, setShowAdvancedParams] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [scheduleDate, setScheduleDate] = useState(null);
  const [existingSchedule, setExistingSchedule] = useState(null);
  const [theme, setLocalTheme] = useState(initialTheme);

  useEffect(() => {
    setTheme(theme);
  }, [theme, setTheme]);

  const menuItems = [
    { key: "general", icon: <SettingOutlined />, label: "General" },
    { key: "interface", icon: <GlobalOutlined />, label: "Interface" },
    { key: "connections", icon: <LinkOutlined />, label: "Connections" },
    { key: "tools", icon: <ToolOutlined />, label: "Tools" },
    { key: "personalization", icon: <UserOutlined />, label: "Personalization" },
    { key: "audio", icon: <SoundOutlined />, label: "Audio" },
    { key: "chats", icon: <MessageOutlined />, label: "Chats" },
    { key: "account", icon: <TeamOutlined />, label: "Account" },
    { key: "about", icon: <InfoCircleOutlined />, label: "About" },
  ];

  const adminMenuItems = [
    { key: "admin", icon: <CrownOutlined />, label: "Admin Settings" },
  ];

  const handleScheduleRollNumbers = async () => {
    if (!scheduleDate) {
      message.error("Please select a date for scheduling.");
      return;
    }
    try {
      const response = await scheduleRollNumbers(scheduleDate.toISOString());
      if (response.data.success) {
        message.success(response.data.message);
        setExistingSchedule(new Date(scheduleDate).toLocaleString());
      } else {
        message.error(response.data.message || "Failed to schedule roll number assignment.");
      }
    } catch (error) {
      message.error("An error occurred while scheduling.");
    }
  };

  const handleCancelSchedule = async () => {
   try {
     const response = await cancelScheduledRollNumbers();
     if (response.data.success) {
       message.success(response.data.message);
       setExistingSchedule(null);
     } else {
       message.error(response.data.message || "Failed to cancel scheduled assignment.");
     }
   } catch (error) {
     message.error("An error occurred while canceling the schedule.");
   }
 };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const values = { theme, language, notifications, systemPrompt, showAdvancedParams };
      localStorage.setItem("webui-settings", JSON.stringify(values));
      localStorage.setItem("theme", theme);

      if (theme === "dark") {
        document.documentElement.setAttribute("data-theme", "dark");
      } else if (theme === "light") {
        document.documentElement.setAttribute("data-theme", "light");
      } else {
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        document.documentElement.setAttribute("data-theme", prefersDark ? "dark" : "light");
      }

      message.success("Settings saved successfully!");
    } catch (error) {
      console.error("Error saving settings:", error);
      message.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  const renderContent = () => {
    switch (selectedMenuItem) {
      case "general":
        return (
          <div className="settings-content">
            <Title level={3}>UI Settings</Title>
            <div className="setting-item">
              <div className="setting-header">
                <Text strong>Theme</Text>
              </div>
              <Select value={theme} onChange={(newTheme) => { setLocalTheme(newTheme); setTheme(newTheme); }}>
                <Option value="system">🖥️ System</Option>
                <Option value="light">☀️ Light</Option>
                <Option value="dark">🌙 Dark</Option>
              </Select>
            </div>
            <div className="setting-item">
              <div className="setting-header">
                <Text strong>Language</Text>
                <Text type="secondary" className="setting-description">
                  Couldn't find your language?{" "}
                  <a href="#" className="translate-link">
                    Help us translate Open WebUI
                  </a>
                </Text>
              </div>
              <Select value={language} onChange={setLanguage} className="setting-select">
                <Option value="English (US)">English (US)</Option>
                <Option value="Spanish">Español</Option>
                <Option value="French">Français</Option>
                <Option value="German">Deutsch</Option>
                <Option value="Chinese">中文</Option>
              </Select>
            </div>
            <div className="setting-item">
              <div className="setting-header">
                <Text strong>Notifications</Text>
              </div>
              <Select value={notifications} onChange={setNotifications} className="setting-select">
                <Option value="on">On</Option>
                <Option value="off">Off</Option>
              </Select>
            </div>
            <div className="setting-item">
              <div className="setting-header">
                <Text strong>System Prompt</Text>
              </div>
              <Input.TextArea
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                placeholder="Enter system prompt here"
                rows={4}
                className="setting-textarea"
              />
            </div>
            <div className="setting-item">
              <div className="setting-header">
                <Text strong>Advanced Parameters</Text>
                <Button type="link" size="small" onClick={() => setShowAdvancedParams(!showAdvancedParams)} className="toggle-button">
                  {showAdvancedParams ? <EyeInvisibleOutlined /> : <EyeTwoTone />}
                </Button>
              </div>
              {showAdvancedParams && (
                <div className="advanced-params-panel">
                  <Text type="secondary">Advanced parameters panel would go here</Text>
                </div>
              )}
            </div>
            <div className="settings-footer">
              <Button type="primary" onClick={handleSave} loading={isSaving} className="save-button">
                <CheckOutlined /> Save Changes
              </Button>
            </div>
          </div>
        );

      case "interface":
        return (
          <div className="settings-content">
            <Title level={3}>Interface Settings</Title>
            <Text type="secondary">Interface customization options will be available here.</Text>
          </div>
        );

      case "connections":
        return (
          <div className="settings-content">
            <Title level={3}>Connections</Title>
            <Text type="secondary">Manage your API connections and integrations.</Text>
          </div>
        );

      case "tools":
        return (
          <div className="settings-content">
            <Title level={3}>Tools</Title>
            <Text type="secondary">Configure external tools and plugins.</Text>
          </div>
        );

      case "personalization":
        return (
          <div className="settings-content">
            <Title level={3}>Personalization</Title>
            <Text type="secondary">Customize your personal preferences.</Text>
          </div>
        );

      case "audio":
        return (
          <div className="settings-content">
            <Title level={3}>Audio Settings</Title>
            <Text type="secondary">Configure audio input and output settings.</Text>
          </div>
        );

      case "chats":
        return (
          <div className="settings-content">
            <Title level={3}>Chat Settings</Title>
            <Text type="secondary">Manage your chat preferences and history.</Text>
          </div>
        );

      case "account":
        return (
          <div className="settings-content">
            <Title level={3}>Account Settings</Title>
            <Text type="secondary">Manage your account information and preferences.</Text>
          </div>
        );

      case "about":
        return (
          <div className="settings-content">
            <Title level={3}>About</Title>
            <Text type="secondary">Application information and version details.</Text>
          </div>
        );

      case "admin":
        return (
          <div className="settings-content">
            <Title level={3}>Admin Settings</Title>
            <div className="setting-item">
              <div className="setting-header">
                <Text strong>Assign RollNumbers Automation</Text>
              </div>
              {existingSchedule && (
                <div style={{ marginTop: '16px' }}>
                  <Text>
                    Currently scheduled for: {existingSchedule}
                  </Text>
                </div>
              )}
              <div style={{ marginBottom: '16px' }}>
                <Text strong>Select Automation Date: </Text>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                  <DatePicker 
                    onChange={(date) => setScheduleDate(date)} 
                    style={{ flex: 1 }}
                    defaultValue={scheduleDate || null}
                  />
                  <Button onClick={handleScheduleRollNumbers} disabled={!scheduleDate}>
                    Schedule
                  </Button>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  useEffect(() => {
   const fetchScheduledDate = async () => {
     try {
       const response = await getScheduledRollNumberDate();
       if (response.data.success && response.data.date) {
         setExistingSchedule(new Date(response.data.date).toLocaleString());
       }
     } catch (error) {
       console.error("Error fetching scheduled date:", error);
     }
   };

   if (visible) {
     fetchScheduledDate();
   }
 }, [visible]);

  useEffect(() => {
    if (visible) {
      try {
        const savedSettings = localStorage.getItem("webui-settings");
        if (savedSettings) {
          const settings = JSON.parse(savedSettings);
          setLanguage(settings.language || "English (US)");
          setNotifications(settings.notifications || "off");
          setSystemPrompt(settings.systemPrompt || "");
          setShowAdvancedParams(settings.showAdvancedParams || false);
          if (!theme) {
            setLocalTheme(settings.theme || "dark");
          }
        }
      } catch (error) {
        console.error("Error loading settings:", error);
      }
    }
  }, [visible, theme]);

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      width={800}
      footer={null}
      closable={false}
      className="settings-modal"
    >
      <Button type="text" icon={<CloseOutlined />} onClick={onClose} className="close-button" />
      <div className="settings-container">
        <div className="settings-sidebar">
          <div className="settings-header">
            <Title level={4} className="settings-title">Settings</Title>
          </div>
          <Menu
            mode="vertical"
            selectedKeys={[selectedMenuItem]}
            onClick={({ key }) => setSelectedMenuItem(key)}
            className="settings-menu"
            items={menuItems}
          />
          {(user?.role === "admin" || user?.role === "chairman") && (
            <>
              <div className="menu-divider" />
              <Menu
                mode="vertical"
                selectedKeys={[selectedMenuItem]}
                onClick={({ key }) => setSelectedMenuItem(key)}
                className="settings-menu admin-menu"
                items={adminMenuItems}
              />
            </>
          )}
        </div>
        <div className="settings-main">
          {renderContent()}
        </div>
      </div>
    </Modal>
  );
};

export default SettingsModal;
