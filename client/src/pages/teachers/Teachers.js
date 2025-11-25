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
import { teachers } from "../../data/dummyData";
import "./Teachers.css";

const { useBreakpoint } = Grid;

const performanceData = teachers.map((teacher) => {
  const attendance = parseInt(teacher.attendance.replace("%", ""), 10);
  const leavesPenalty = (teacher.leavesTaken / teacher.totalLeavesAllowed) * 20;
  const complaintsPenalty = teacher.complaints * 10;
  const score =
    attendance * 0.3 +
    teacher.syllabusCompletion * 0.4 -
    leavesPenalty -
    complaintsPenalty;
  return { name: teacher.name, performance: Math.max(0, Math.round(score)) };
});

const topTeacher =
  performanceData.length > 0
    ? performanceData.reduce((max, curr) =>
        curr.performance > max.performance ? curr : max
      )
    : { name: "N/A" };

const genderRatio = teachers.reduce(
  (acc, teacher) => {
    if (teacher.id % 2 === 0) acc.Male++;
    else acc.Female++;
    return acc;
  },
  { Male: 0, Female: 0 }
);
const genderData = [
  { name: "Male", value: genderRatio.Male },
  { name: "Female", value: genderRatio.Female },
];

const subjectData = Object.entries(
  teachers.reduce((acc, teacher) => {
    acc[teacher.subject] = (acc[teacher.subject] || 0) + 1;
    return acc;
  }, {})
).map(([subject, count]) => ({ subject, count }));

const Teachers = () => {
  const [selectedTeacher, setSelectedTeacher] = useState(null);
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

  const showModal = (teacher) => {
    setSelectedTeacher(teacher);
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setSelectedTeacher(null);
  };

  const filteredTeachers = teachers.filter(
    (teacher) =>
      teacher.name.toLowerCase().includes(searchText.toLowerCase()) ||
      teacher.subject.toLowerCase().includes(searchText.toLowerCase()) ||
      teacher.email.toLowerCase().includes(searchText)
  );

  const downloadTeacherListExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredTeachers);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Teachers");
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const data = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
    });
    saveAs(data, "Teacher_List.xlsx");
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
    { title: "Subject", dataIndex: "subject", key: "subject" },
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
    <div className="teachers-container">
      <BackButton />
      <div className="header-container">
        <div className="header-title-container">
          <h2 className="title">👨‍🏫 Teachers List</h2>
        </div>
        <div className="right-section">
          <div className="custom-search-input">
              <Input
                prefix={<SearchOutlined />}
                placeholder={"Search by Name, ID, or Mobile"}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="search-input-field"
              />
            </div>
          <Button
            type="primary"
            onClick={() => navigate("/add-student")}
            className="add-teacher-button"
          >
            + Add Teacher
          </Button>
          <button className="download-button" onClick={downloadTeacherListExcel}>
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
            <h4>Total Teachers</h4>
            <h2>{teachers.length}</h2>
          </div>
        </div>

        <div className="summary-card">
          <div className="icon">
            <TrophyOutlined className="card-icon" />
          </div>
          <div className="summary-content">
            <h4>Top Performance</h4>
            <h2>{topTeacher.name}</h2>
          </div>
        </div>

        <div className="summary-card">
          <div className="icon">
            <FileTextOutlined className="card-icon" />
          </div>
          <div className="summary-content">
            <h4>Total Department</h4>
            <h2>5</h2>
          </div>
        </div>
      </div>

      <div className="charts-wrapper">
        <div className="chart-card-styled">
          <h3>Gender Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={genderData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                strokeWidth={0}
                innerRadius={50}
                outerRadius={65}
                label
              >
                {genderData.map((entry, index) => (
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
          <h3>Subject Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={subjectData}
                dataKey="count"
                nameKey="subject"
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={65}
                strokeWidth={0}
                label
              >
                {subjectData.map((entry, index) => (
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
          dataSource={filteredTeachers}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          bordered
        />
      </div>

      <TeacherDetailsModal
        open={isModalVisible}
        teacher={selectedTeacher}
        onClose={handleCancel}
      />
    </div>
  );
};

export default Teachers;
