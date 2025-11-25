import React, { useState } from "react";
import { Table, Button, Grid, Input } from "antd";
import {
  DownloadOutlined,
  SearchOutlined,
  UserOutlined,
  FileTextOutlined,
  TrophyOutlined,
} from "@ant-design/icons";
import * as XLSX from "xlsx";
import { useSelector } from "react-redux";
import { saveAs } from "file-saver";
import TeacherDetailsModal from "../../components/modals/TeacherDetailsModal";
import BackButton from "../../components/BackButton";
import { useNavigate } from "react-router-dom";
import { getThemeSwitchValue } from "../../store/h1Slice";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { staff } from "../../data/dummyData";
import "./StaffPage.css";

const { useBreakpoint } = Grid;

// Performance calculation for staff
const performanceData = staff.map((member) => {
  const achievementsCount = member.achievements ? member.achievements.length : 0;
  const performance = Math.min(achievementsCount * 10, 100); // Max 100
  return { name: member.name, performance };
});

const topStaffMember =
  performanceData.length > 0
    ? performanceData.reduce((max, curr) =>
        curr.performance > max.performance ? curr : max
      )
    : { name: "N/A" };

const departmentRatio = staff.reduce(
  (acc, member) => {
    acc[member.department] = (acc[member.department] || 0) + 1;
    return acc;
  },
  {}
);
const departmentData = Object.entries(departmentRatio).map(([department, count]) => ({
  name: department,
  value: count
}));

const roleData = Object.entries(
  staff.reduce((acc, member) => {
    acc[member.role] = (acc[member.role] || 0) + 1;
    return acc;
  }, {})
).map(([role, count]) => ({ role, count }));

const StaffPage = () => {
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchText, setSearchText] = useState("");
  const navigate = useNavigate();
  const togglevalue = useSelector(getThemeSwitchValue);
  const screens = useBreakpoint();

  // Define the new palette
  const PRIMARY_COLOR = "#f5ae3f"; // Main primary color
  const SECONDARY_COLOR = "#e07a5f"; // Accent color
  const TERTIARY_COLOR = "gray"; // Neutral gray

  const COLORS = [PRIMARY_COLOR, SECONDARY_COLOR];
  const EXAM_COLORS = [PRIMARY_COLOR, SECONDARY_COLOR, TERTIARY_COLOR];
  const TRANSPORT_COLORS = [PRIMARY_COLOR, SECONDARY_COLOR];

  const showModal = (staffMember) => {
    setSelectedStaff(staffMember);
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setSelectedStaff(null);
  };

  const filteredStaff = staff.filter(
    (member) =>
      member.name.toLowerCase().includes(searchText.toLowerCase()) ||
      member.role.toLowerCase().includes(searchText.toLowerCase()) ||
      member.email.toLowerCase().includes(searchText)
  );

  const downloadStaffListExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredStaff);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Staff");
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const data = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
    });
    saveAs(data, "Staff_List.xlsx");
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <span className="table-cell-container">
          <UserOutlined className="table-icon" />
          {text}
        </span>
      ),
    },
    { title: "Role", dataIndex: "role", key: "role" },
    { title: "Department", dataIndex: "department", key: "department" },
    ...(screens.md
      ? [
          { title: "Experience", dataIndex: "experience", key: "experience" },
          { title: "Email", dataIndex: "email", key: "email" },
        ]
      : []),
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Button
          type="primary"
          onClick={() => showModal(record)}
          style={{ background: PRIMARY_COLOR }}
        >
          {screens.md ? "View Details" : "View"}
        </Button>
      ),
    },
  ];

  return (
    <div className="staff-container">
      <BackButton />
      <div className="header-container">
        <div className="header-title-container">
          <h2 className="title">👨‍💼 Staff List</h2>
        </div>
        <div className="right-section">
          <div className="custom-search-input">
              <Input
                prefix={<SearchOutlined />}
                placeholder={"Search by Name, Role, or Email"}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="search-input-field"
              />
            </div>
          <Button
            type="primary"
            onClick={() => navigate("/add-staff")}
            className="add-staff-button"
          >
            + Add Staff
          </Button>
          <button className="download-button" onClick={downloadStaffListExcel}>
            <DownloadOutlined />
          </button>
        </div>
      </div>

      <div className="card-wrapper">
        <div className="summary-card">
          <div className="icon">
            <FileTextOutlined className="card-icon" />
          </div>
          <div className="summary-content">
            <h4>Total Staff</h4>
            <h2>{staff.length}</h2>
          </div>
        </div>

        <div className="summary-card">
          <div className="icon">
            <TrophyOutlined className="card-icon" />
          </div>
          <div className="summary-content">
            <h4>Top Performer</h4>
            <h2>{topStaffMember.name}</h2>
          </div>
        </div>

        <div className="summary-card">
          <div className="icon">
            <FileTextOutlined className="card-icon" />
          </div>
          <div className="summary-content">
            <h4>Total Departments</h4>
            <h2>{Object.keys(departmentRatio).length}</h2>
          </div>
        </div>
      </div>

      <div className="charts-wrapper">
        <div className="chart-card-styled">
          <h3>Department Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={departmentData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                strokeWidth={0}
                innerRadius={50}
                outerRadius={65}
                label
              >
                {departmentData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card-styled">
          <h3>Performance Overview</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                stroke={togglevalue ? "#fff" : "#000"}
                tick={{ fill: "#ffffff" }}
              />
              <YAxis
                stroke={togglevalue ? "#fff" : "#000"}
                tick={{ fill: "#ffffff" }}
              />
              <Tooltip />
              <Legend />
              <Bar dataKey="performance" fill={EXAM_COLORS[0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card-styled">
          <h3>Role Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={roleData}
                dataKey="count"
                nameKey="role"
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={65}
                strokeWidth={0}
                label
              >
                {roleData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={TRANSPORT_COLORS[index % TRANSPORT_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{ marginTop: "20px" }}>
        <Table
          columns={columns}
          dataSource={filteredStaff}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          bordered
        />
      </div>

      <TeacherDetailsModal
        open={isModalVisible}
        teacher={selectedStaff}
        onClose={handleCancel}
      />
    </div>
  );
};

export default StaffPage;
