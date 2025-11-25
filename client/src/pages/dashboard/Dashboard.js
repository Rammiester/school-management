import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { AuthContext } from "../../context/AuthContext";
import { fetchDashboardStats } from "../../services/dashboardService";
import { getThemeSwitchValue } from '../../store/h1Slice';
import { getNoticesByDate } from "../../api/index";
import SchoolIcon from "@mui/icons-material/School";
import PeopleIcon from "@mui/icons-material/People";
import WorkOutlineIcon from "@mui/icons-material/WorkOutline";
import SportsSoccerIcon from "@mui/icons-material/SportsSoccer";
import BrushIcon from "@mui/icons-material/Brush";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import DirectionsBusIcon from "@mui/icons-material/DirectionsBus";
import HotelIcon from "@mui/icons-material/Hotel";
import { SolutionOutlined } from "@ant-design/icons";
import EventCalendar from "../../components/eventCalendar/EventCalendar";
import NoticeBoard from "../../components/noticeBoard/NoticeBoard";
import EarningsChart from "../../components/earningsChart/EarningsChart";
import AddStudentModal from "../../components/modals/AddStudentModal";
import HelpModal from "../../components/modals/HelpModal";
import Request from "../signUp/request";
import { Row, Col } from 'antd';
import Loading from "../../components/LoadingComponent/Loading";

const navigationPaths = {
  Students: "/students",
  Teachers: "/teachers",
  Staff: "/departments",
  Sports: "/sports",
  "Dance & Arts": "/arts",
  Finance: "/finance",
  Transport: "/transport",
  Hostel: "/hostel",
  Attendance: "/attendance",
  Timetable: "/timetable",
  Billing: "/billing",
  Events: "/events-list",
  Notices: "/notices-list"
};

const getIcon = (label) => {
  switch (label) {
    case "Students":
      return <SchoolIcon />;
    case "Teachers":
      return <PeopleIcon />;
    case "Staff":
      return <WorkOutlineIcon />;
    case "Sports":
      return <SportsSoccerIcon />;
    case "Dance & Arts":
      return <BrushIcon />;
    case "Finance":
      return <AttachMoneyIcon />;
    case "Transport":
      return <DirectionsBusIcon />;
    case "Hostel":
      return <HotelIcon />;
    case "Attendance":
      return <WorkOutlineIcon />
    case "Timetable":
      return <WorkOutlineIcon />
    case "Billing":
      return <AttachMoneyIcon />;
    default:
      return <SolutionOutlined />;
  }
};

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const role = user?.role;
  const navigate = useNavigate();
  const isDarkMode = useSelector(getThemeSwitchValue);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [filteredNotices, setFilteredNotices] = useState([]);

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  useEffect(() => {
    if (!role) return;
    setLoading(true);
    fetchDashboardStats(role)
      .then((data) => {
        setStats(data);
        setFilteredNotices(data.notices || []); // Initialize with all notices
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
        // Navigate to 404 page on API failure
        navigate('/404');
      });
  }, [role, user]);

  // Check if this is the user's first visit
  useEffect(() => {
    if (user && user.email) {
      const firstVisitKey = `firstVisit_${user.email}`;
      const hasVisited = localStorage.getItem(firstVisitKey);
      
      if (!hasVisited) {
        // Set flag to indicate user has visited
        localStorage.setItem(firstVisitKey, 'true');
        setIsHelpModalOpen(true);
      }
    }
  }, [user]);

  // Fetch notices by selected date when date changes
  useEffect(() => {
    const fetchNoticesByDate = async () => {
      if (stats && stats.notices) {
        try {
          // Use the backend endpoint to get notices for the selected date
          const response = await getNoticesByDate(selectedDate);
          setFilteredNotices(response.data);
        } catch (error) {
          console.error('Error fetching notices by date:', error);
          // Fallback to original filtering logic if API fails
          const dateNotices = stats.notices.filter(notice => {
            const noticeStartDate = notice.startDate ? new Date(notice.startDate) : null;
            const noticeEndDate = notice.endDate ? new Date(notice.endDate) : null;
            const checkDate = new Date(selectedDate);
            
            if (!noticeStartDate && !noticeEndDate) return true;
            if (noticeStartDate && !noticeEndDate) return checkDate >= noticeStartDate;
            if (!noticeStartDate && noticeEndDate) return checkDate <= noticeEndDate;
            return checkDate >= noticeStartDate && checkDate <= noticeEndDate;
          });
          setFilteredNotices(dateNotices);
        }
      }
    };

    fetchNoticesByDate();
  }, [selectedDate, stats]);

  if (!user) return null;
  if (loading) return <Loading message="Loading dashboard..." />;
  if (!stats) return <div>Error loading dashboard.</div>;

  const widgets = [];
  if ("studentsCount" in stats) {
    widgets.push({ label: "Students", value: stats.studentsCount });
  }
  if ("teachersCount" in stats) {
    widgets.push({ label: "Teachers", value: stats.teachersCount });
  }
  // if ("staffCount" in stats) {
  //   widgets.push({ label: "Staff", value: stats.staffCount });
  // }
  if ((role === "chairman" || role === "admin")) {
    if ("earnings" in stats) {
      const net = stats.earnings.totalEarnings - stats.earnings.totalExpenses;
      widgets.push({ label: "Finance", value: `₹${net}` });
    } else {
      widgets.push({ label: "Finance", value: "View" });
    }
  }
  if ("events" in stats) {
    widgets.push({ label: "Events", value: stats.events.length });
  }
  if ("notices" in stats) {
    widgets.push({ label: "Notices", value: stats.notices.length });
  }
  
  // Add Billing widget for chairman and admin
  if (role === "chairman" || role === "admin") {
    widgets.push({ label: "Billing", value: "View" });
  }
  
  // Add Timetable widget for everyone
  widgets.push({ label: "Attendance", value: "View" });
  widgets.push({ label: "Timetable", value: "View" });

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  return (
    <div className={`dashboard-container ${isDarkMode ? 'dark-theme' : 'light-theme'}`}>
      <Request />
      <div className="hero-banner">
        <div className="text-content">
          <h2>🎓 Welcome Back, {user.name}!</h2>
          <p>
            Role: <b>{user.role}</b>
          </p>
          <p>Here’s an overview of your school today.</p>
        </div>
      </div>
      <div className="header">
        <h1 className={`title ${isDarkMode ? 'dark-theme' : 'light-theme'}`}>Dashboard</h1>
      </div>
      <div className="dashboard-content">
        {widgets.map((stat, idx) => (
          <div
            key={idx}
            className="widget-card"
            onClick={() => {
              const path = navigationPaths[stat.label];
              path && navigate(path);
            }}
          >
            <div className="icon">{getIcon(stat.label)}</div>
            <div className="details">
              <h2>{stat.label}</h2>
              <p>{stat.value}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="section-wrapper">
        <Row gutter={[16, 16]} style={{ border: 'none', boxShadow: 'none' }}>
          <Col xs={24} sm={24} md={24} lg={12} style={{ border: 'none' }}>
            <button
              style={{
                background: "linear-gradient(90deg, #8c2a1e 0%, #f5ae3f 100%)",
                color: "#fff",
                padding: "0.8rem 1.5rem",
                border: "none",
                borderRadius: "50px",
                cursor: "pointer",
                marginTop: '1rem',
                fontWeight: "bold",
                fontSize: "1rem",
                boxShadow: "0 4px 6px rgba(0, 0, 0.1)"
              }}
              onClick={() => setIsModalOpen(true)}
            >
              + Add Student
            </button>
            {"events" in stats && (
              <EventCalendar eventss={stats.events} onDateChange={handleDateChange} />
            )}
          </Col>
          <Col xs={24} sm={24} md={24} lg={12} style={{ border: 'none' }}>
            {"notices" in stats && (
              <NoticeBoard isDarkMode={isDarkMode} notices={filteredNotices} selectedDate={selectedDate} />
            )}
          </Col>
        </Row>
        {role === "chairman" && "earnings" in stats && (
          <Row style={{ marginTop: '16px' }}>
            <Col span={24}>
              <EarningsChart
                isDarkMode={isDarkMode}
                data={stats.earnings.earningsData}
              />
            </Col>
          </Row>
        )}
      </div>
      {/* {stats.canAddRevenue && (role === "admin" || role === "chairman") && (
        <div style={{ marginTop: 20 }}>
          <button
            style={{
              background: "#8c2a1e",
              color: "#fff",
              padding: "0.6rem 1.2rem",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
            }}
            onClick={() => navigate("/add-revenue")}
          >
            Add Revenue / Expense
          </button>
        </div>
      )} */}
      <AddStudentModal
        visible={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onStudentAdded={() => {
        }}
      />
      <HelpModal
        visible={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
      />
    </div>
  );
};

export default Dashboard;
