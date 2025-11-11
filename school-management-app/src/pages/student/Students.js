// src/pages/Students/Students.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Table, Button, message, Input } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import StudentDetailsModal from "../../components/modals/StudentDetailsModal";
import AddStudentModal from "../../components/modals/AddStudentModal";
import BackButton from "../../components/BackButton";
import AssignRollNumberCard from "../../components/AssignRollNumberCard";
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
import SchoolIcon from "@mui/icons-material/School";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import PaymentIcon from "@mui/icons-material/Payment";
import WcIcon from "@mui/icons-material/Wc";
import DirectionsBusIcon from "@mui/icons-material/DirectionsBus";
import AssessmentIcon from "@mui/icons-material/Assessment";
import { useSelector } from "react-redux";
import { getThemeSwitchValue } from "../../store/h1Slice";
import EditStudentModal from "../../components/modals/EditStudentModal";
import { fetchStudentsWithPagination, searchStudents, fetchGenderDistribution, fetchExamResults } from "../../services/dashboardService";
import "./Students.css";

const Students = () => {
  const [studentList, setStudentList] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0
  });
  const [totalStudents, setTotalStudents] = useState(0);
  const [genderRatio, setGenderRatio] = useState([]);
  const [examResults, setExamResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [currentSortField, setCurrentSortField] = useState(null);
  const [currentSortOrder, setCurrentSortOrder] = useState(null);


  useEffect(() => {
    if (!isSearching) {
      loadStudentsWithPagination(pagination.current, currentSortField, currentSortOrder);
    }
  }, [pagination.current, isSearching, currentSortField, currentSortOrder]);

  useEffect(() => {
    const loadGenderDistribution = async () => {
      try {
        const distribution = await fetchGenderDistribution();
        setGenderRatio(distribution);
      } catch (err) {
        setGenderRatio([
          { name: "Male", value: 0 },
          { name: "Female", value: 0 },
          { name: "Other", value: 0 }
        ]);
      }
    };
    loadGenderDistribution();
  }, []);

  useEffect(() => {
    const loadExamResults = async () => {
      try {
        const results = await fetchExamResults();
        setExamResults(results);
      } catch (err) {
        setExamResults([]);
      }
    };
    loadExamResults();
  }, []);

  const loadStudentsWithPagination = async (page, sortField = null, sortOrder = null) => {
    try {
      setLoading(true);
      const data = await fetchStudentsWithPagination(page, pagination.pageSize, sortField, sortOrder);
      setStudentList(data.students || data);
      setPagination(prev => ({
        ...prev,
        current: page,
        total: data.pagination?.totalStudents || (data.students ? data.students.length : 0),
        totalPages: data.pagination?.totalPages || 1
      }));
      setTotalStudents(data.pagination?.totalStudents || 0);
    } catch (err) {
      message.error("Unable to load student data.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (searchTerm, sortField = null, sortOrder = null) => {
    if (!searchTerm.trim()) {
      setIsSearching(false);
      setPagination(prev => ({
        ...prev,
        current: 1
      }));
      loadStudentsWithPagination(1, sortField, sortOrder);
      return;
    }

    try {
      setLoading(true);
      setIsSearching(true);
      const data = await searchStudents(searchTerm, sortField, sortOrder);
      setStudentList(data);
      setPagination(prev => ({
        ...prev,
        current: 1,
        total: data.length,
        totalPages: 1
      }));
      setTotalStudents(data.length);
    } catch (err) {
      message.error("Unable to search student data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      handleSearch(searchText);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchText]);

  const handleTableChange = (pagination, filters, sorter) => {
    let sortFields = [];
    let sortOrders = [];

    if (Array.isArray(sorter)) {
      sorter.forEach(s => {
        if (s.field && s.order) {
          sortFields.push(s.field);
          sortOrders.push(s.order);
        }
      });
    } else if (sorter.field && sorter.order) {
      sortFields = [sorter.field];
      sortOrders = [sorter.order];
    }

    if (sortFields.length > 0) {
      setCurrentSortField(sortFields[0]);
      setCurrentSortOrder(sortOrders[0]);
    } else {
      setCurrentSortField(null);
      setCurrentSortOrder(null);
    }

    if (isSearching && searchText.trim()) {
      handleSearch(searchText, sortFields, sortOrders);
    } else {
      loadStudentsWithPagination(pagination.current || 1, sortFields, sortOrders);
    }
  };

  const showModal = (student) => {
    setSelectedStudent(student);
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setSelectedStudent(null);
  };

  const filteredStudents = studentList;

  const topPerformer = useMemo(() => {
    return [...studentList]
      .filter((s) => !isNaN(s.performanceScore))
      .sort((a, b) => b.performanceScore - a.performanceScore)[0];
  }, [studentList]);

  const pendingFeesStudents = useMemo(() => {
    return studentList.filter((student) => student.feesPending);
  }, [studentList]);

  const showEditModal = (student) => {
    setEditingStudent(student);
    setIsEditModalVisible(true);
  };

  const handleEditClose = () => {
    setEditingStudent(null);
    setIsEditModalVisible(false);
  };

  const handleAddStudentOpen = () => {
    setIsAddModalVisible(true);
  };

  const handleAddStudentClose = () => {
    setIsAddModalVisible(false);
  };

  const handleStudentAdded = async () => {
    await loadStudentsWithPagination(pagination.current, currentSortField, currentSortOrder);
    try {
      const distribution = await fetchGenderDistribution();
      setGenderRatio(distribution);
    } catch (err) {
    }
  };

  const handleStudentUpdate = async (updatedStudent) => {
    setStudentList((prev) =>
      prev.map((s) => (s._id === updatedStudent._id ? updatedStudent : s))
    );
    if (isSearching && searchText.trim()) {
      await handleSearch(searchText, currentSortField, currentSortOrder);
    } else {
      await loadStudentsWithPagination(pagination.current, currentSortField, currentSortOrder);
    }
    try {
      const distribution = await fetchGenderDistribution();
      setGenderRatio(distribution);
    } catch (err) {
    }
  };

  const getUserRole = () => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        return user.role || '';
      } catch (e) {
        return '';
      }
    }
    return '';
  };

  const userRole = getUserRole();

  const columns = [
    {
      title: "ID",
      dataIndex: "uniqueId",
      key: "uniqueId",
      fixed: 'left',
      sorter: { multiple: 1 },
      sortDirections: ['ascend', 'descend'],
      render: (text) => (text ? text : "--"),
      onCell: () => ({ style: { background: 'var(--accent-color) !important', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } }),
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      sorter: { multiple: 2 },
      sortDirections: ['ascend', 'descend'],
      render: (text) => (
        <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <SchoolIcon style={{ color: "var(--modal-secondary-color)" }} />
          {text ? text : "--"}
        </span>
      ),
    },
    {
      title: "Grade",
      dataIndex: "grade",
      key: "grade",
      sorter: { multiple: 3 },
      sortDirections: ['ascend', 'descend'],
      render: (text) => (text ? text : "--"),
    },
    {
      title: "Section",
      dataIndex: "section",
      key: "section",
      sorter: { multiple: 4 },
      sortDirections: ['ascend', 'descend'],
      render: (text) => (text ? text : "--"),
    },
    {
      title: "Mobile",
      dataIndex: "parentContact",
      key: "parentContact",
      sorter: { multiple: 5 },
      sortDirections: ['ascend', 'descend'],
      render: (text) => (text ? text : "--"),
    },
    {
      title: "Attendance",
      dataIndex: "attendance",
      key: "attendance",
      sorter: { multiple: 6 },
      sortDirections: ['ascend', 'descend'],
      render: (text) => (text ? text : "--"),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <div style={{ display: "flex", gap: "8px" }}>
          <Button
            type="primary"
            onClick={() => showModal(record)}
            style={{ background: "var(--modal-secondary-color)" }}
          >
            View
          </Button>
          {(userRole === 'admin' || userRole === 'chairman') && (
            <Button type="default" onClick={() => showEditModal(record)}>
              Edit
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="students-container">
      <BackButton />

      {(userRole === 'chairman') && (
        <AssignRollNumberCard
          students={studentList}
          onRollNumbersAssigned={(assignedStudents) => {
            setStudentList(assignedStudents);
            setTotalStudents(assignedStudents.length);
          }}
        />
      )}
      <div className="students-header">
        <h2 className="students-title">Student Dashboard</h2>
        <div className="right-section">
          <div className="search-and-buttons">
            <div className="custom-search-input">
              <Input
                prefix={<SearchOutlined />}
                placeholder={loading ? "Searching..." : "Search by Name, ID, or Mobile"}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                disabled={loading}
                className="search-input-field"
              />
            </div>
            <Button
              type="primary"
              onClick={handleAddStudentOpen}
              className="add-student-button"
            >
              + Add Student
            </Button>
          </div>
        </div>
      </div>

      <div className="summary-cards-grid">
        <div className="summary-card">
          <SchoolIcon style={{ fontSize: "1.8rem", color: "var(--modal-secondary-color)" }} />
          <div className="summary-content">
            <h4>Total Students</h4>
            <h2>{totalStudents}</h2>
          </div>
        </div>

        <div className="summary-card">
          <EmojiEventsIcon
            style={{ fontSize: "1.8rem", color: "var(--modal-secondary-color)" }}
          />
          <div className="summary-content">
            <h4>Top Performer</h4>
            <h2>{topPerformer?.name || "N/A"}</h2>
            <p>Grade {topPerformer?.grade}</p>
          </div>
        </div>

        <div className="summary-card">
          <PaymentIcon style={{ fontSize: "1.8rem", color: "var(--modal-secondary-color)" }} />
          <div className="summary-content">
            <h4>Pending Fees</h4>
            <h2>{pendingFeesStudents.length}</h2>
          </div>
        </div>
      </div>
      <div className="charts-grid">
        <div className="chart-card">
          <h3>
            <WcIcon style={{ color: "var(--modal-secondary-color)", marginRight: 8 }} />
            Gender Distribution
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={genderRatio}
                dataKey="value"
                nameKey="name"
                innerRadius={50}
                outerRadius={65}
                label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
              >
                {genderRatio.map((entry, index) => (
                  <Cell key={index} fill={
                    entry.name === 'Male' ? 'var(--modal-secondary-color)' :
                      entry.name === 'Female' ? 'var(--primary-color)' :
                        'var(--accent-color)'
                  } />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>
            <AssessmentIcon style={{ color: "var(--modal-secondary-color)", marginRight: 8 }} />
            Exam Results
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            {examResults && examResults.length > 0 ? (
              <BarChart data={examResults}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fill: "var(--text-light-color)" }} />
                <YAxis tick={{ fill: "var(--text-light-color)" }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="Pass" stackId="a" fill={`var(--modal-secondary-color)`} />
                <Bar dataKey="Fail" stackId="a" fill={`var(--accent-color)`} />
                <Bar dataKey="NotAttended" stackId="a" fill={`var(--border-color)`} />
              </BarChart>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-light-color)' }}>
                No exam results data available
              </div>
            )}
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>
            <DirectionsBusIcon
              style={{ color: "var(--modal-secondary-color)", marginRight: 8 }}
            />
            Transit Modes
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={[{ name: "Own Students", value: 402 }, { name: "Students Bus", value: 775 }]}
                dataKey="value"
                nameKey="name"
                innerRadius={50}
                outerRadius={65}
                label={({ name, value }) => `${value} ${name}`}
              >
                {[{ name: "Own Students", value: 402 }, { name: "Students Bus", value: 775 }].map((entry, index) => (
                  <Cell
                    key={index}
                    fill={`var(--modal-secondary-color)`}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="timetable-table-container" >
        <Table
          columns={columns}
          dataSource={filteredStudents}
          rowKey="_id"
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            pageSizeOptions: ['10', '20', '50', '100'],
            showSizeChanger: true,
            showQuickJumper: false,
            showTotal: (total, range) => `Showing ${range[0]}-${range[1]} of ${total} students`,
          }}
          onChange={handleTableChange}
          bordered
          scroll={{ x: 1200 }}
          className="timetable-table"
          onRow={(record) => ({
            onClick: (e) => {
              if (e.target.closest("button")) return;
              showModal(record);
            },
          })}
        />
      </div>

      <StudentDetailsModal
        visible={isModalVisible}
        student={selectedStudent}
        onClose={handleCancel}
      />
      <EditStudentModal
        visible={isEditModalVisible}
        student={editingStudent}
        onClose={handleEditClose}
        onUpdate={handleStudentUpdate}
      />
      <AddStudentModal
        visible={isAddModalVisible}
        onClose={handleAddStudentClose}
        onStudentAdded={handleStudentAdded}
      />
    </div>
  );
};

export default Students;
