import React, { useState, useEffect, useContext, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Menu,
  Badge,
  Avatar,
  Dropdown,
  Modal,
  Divider,
} from "antd";
import { MenuOutlined, BellOutlined, UserOutlined } from "@ant-design/icons";
import { AuthContext } from "../../context/AuthContext";
import LOGO from "../../assets/logo.png";
import "./Navbar.css";
import axios from "axios";
import NotificationModal from "./NotificationModal";
import SettingsModal from "../modals/SettingsModal";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [drawerVisible, setDrawerVisible] = useState(false); // Profile/Menu drawer
  const [notifModalVisible, setNotifModalVisible] = useState(false); // Notification modal
  const [settingsModalVisible, setSettingsModalVisible] = useState(false); // Settings modal

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);


  // Notifications state
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifs, setLoadingNotifs] = useState(false);
  const [unseenCount, setUnseenCount] = useState(0);
  const pollingRef = useRef(null);
  const [supportsRead, setSupportsRead] = useState(false);

  // Hamburger menu drawer (profile/menu)
  const showDrawer = () => setDrawerVisible(true);
  const closeDrawer = () => setDrawerVisible(false);

  // Notification modal
  const showNotifModal = () => setNotifModalVisible(true);
  const closeNotifModal = () => setNotifModalVisible(false);

  // Settings modal
  const showSettingsModal = () => {
    setSettingsModalVisible(true);
    closeDrawer();
  };
  const closeSettingsModal = () => setSettingsModalVisible(false);

  const handleLogout = () => {
    logout(navigate);
    closeDrawer();
  };

  const handleToggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const markRead = async (id, read = true) => {
    if (!supportsRead) return;
    try {
      await axios.patch(`/api/earnings/${id}/mark-read`, { read });
    } catch { }
  };

  const approveRequest = async (id) => {
    try {
      await axios.patch(`/api/earnings/${id}/approve`, { approvedBy: user.email });
    } catch { }
  };
  const declineRequest = async (id) => {
    try {
      await axios.patch(`/api/earnings/${id}/decline`, { declinedBy: user.email, declineReason: "No reason" });
    } catch { }
  };

  const profileMenu = (
    <Menu>
      <Menu.Item key="profile">Profile</Menu.Item>
      <Menu.Item key="settings" onClick={showSettingsModal}>Settings</Menu.Item>
      <Menu.Item key="logout" onClick={handleLogout}>Logout</Menu.Item>
    </Menu>
  );

  const menuItems = user
    ? [
      { label: "Dashboard", path: "/dashboard", key: "/dashboard" },
      { label: "Holidays", path: "/holiday-planner", key: "/holiday-planner" },
      { label: "Syllabus", path: "/syllabus-tracker", key: "/syllabus-tracker" },
      { label: "Attendance", path: "/attendance", key: "/attendance" },
      { label: "Feedback", path: "/feedback", key: "/feedback" },
    ]
    : [];

  const getActiveKey = () => {
    const currentPath = location.pathname;
    const matchingItem = menuItems.find(item => item.path === currentPath);
    return matchingItem ? [currentPath] : ["/dashboard"];
  };
  const activeKeys = getActiveKey();
  return (
    <>
      <div className="nav-bar">
        <div className="logo" onClick={() => navigate(user ? "/dashboard" : "/")}>
          <img src={LOGO} alt="School Logo" />
        </div>
        {user && (
          <>
            <div className="sidebar-menu">
              <Menu
                mode="horizontal"
                selectedKeys={activeKeys}
                style={{
                  background: "transparent",
                  borderBottom: "none",
                }}
              >
          {menuItems.map((item) => (
            <Menu.Item
              key={item.key}
              className="custom-menu-item"
            >
              <Link to={item.path}>{item.label}</Link>
            </Menu.Item>
          ))}
          {user?.role === 'admin' && (
            <Menu.Item key="superuser-feedback" className="custom-menu-item">
              <Link to="/superuser-feedback">Feedback Control</Link>
            </Menu.Item>
          )}
                
                {/* <Menu.Item
                  key="notifications"
                  className="icon-item"
                  style={{ paddingInline: "9px", marginTop: "3px" }}
                  onClick={showNotifModal}
                >
                  <Badge count={unseenCount} overflowCount={10}>
                    <BellOutlined style={{ fontSize: "20px", color: "#fff" }} />
                  </Badge>
                </Menu.Item> */}
                <Menu.Item key="profile" style={{ marginLeft: "5px", paddingInline: "8px" }}>
                  <Dropdown overlay={profileMenu} trigger={["click"]}>
                    <div className="profile-section">
                      <Avatar icon={<UserOutlined />} style={{ fontSize: "20px" }} />
                      <span>{user.name}</span>
                    </div>
                  </Dropdown>
                </Menu.Item>
              </Menu>
            </div>
            <div className="mobile-menu-icons">
              <div className="menu-icon" onClick={showDrawer}>
                <MenuOutlined />
              </div>
              <div className="menu-icon" onClick={showNotifModal}>
                <Badge count={unseenCount} overflowCount={10}>
                  <BellOutlined style={{ fontSize: "20px" }} />
                </Badge>
              </div>
            </div>
          </>
        )}
      </div>
      <Modal
        className="profile-modal"
        open={drawerVisible}
        onCancel={closeDrawer}
        footer={null}
        width={290}
        closable={true}
        title={
          <div className="profile-modal-title">
            <Avatar icon={<UserOutlined />} />
            <div>
              <div className="profile-modal-name">{user?.name}</div>
              <div className="profile-modal-role">{user?.designation || user?.role}</div>
            </div>
          </div>
        }
        bodyStyle={{ padding: 0 }}
      >
        <Menu
          mode="vertical"
          selectedKeys={activeKeys}
          style={{ border: "none", background: "transparent" }}
          onClick={closeDrawer}
        >
          {menuItems.map((item) => (
            <Menu.Item key={item.key}>
              <Link to={item.path}>{item.label}</Link>
            </Menu.Item>
          ))}
          <Divider />
          <Menu.Item key="profile">Profile</Menu.Item>
          <Menu.Item key="settings" onClick={showSettingsModal}>Settings</Menu.Item>
          <Menu.Item key="logout" onClick={handleLogout}>Logout</Menu.Item>
        </Menu>
      </Modal>
      <NotificationModal
        visible={notifModalVisible}
        onClose={closeNotifModal}
        notifications={notifications}
        isChairman={user?.role === "chairman"}
        loading={loadingNotifs}
        onApprove={approveRequest}
        onDecline={declineRequest}
        onMarkRead={markRead}
        supportsRead={supportsRead}
      />
      <SettingsModal
        visible={settingsModalVisible}
        onClose={closeSettingsModal}
        theme={theme}
        setTheme={setTheme}
      />
    </>
  );
};

export default Navbar;
