import React, { useState, useEffect, useContext } from 'react';
import { Card, List, Button, Typography, Space, message, Tag } from 'antd';
import { CheckCircleOutlined, ClockCircleOutlined, LogoutOutlined, UserOutlined, UserSwitchOutlined } from '@ant-design/icons';
import { getStudentsByGrade, studentCheckIn, studentCheckOut, getStudentAttendance } from '../api';
import { AuthContext } from '../context/AuthContext';
import Loading from './LoadingComponent/Loading';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const StudentAttendanceSelector = () => {
  const [students, setStudents] = useState([]);
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [loading, setLoading] = useState(false);
  const [studentAttendance, setStudentAttendance] = useState({});
  const [currentStudent, setCurrentStudent] = useState(null);
  const { user } = useContext(AuthContext);

  // Initialize with current user's grade if student
  useEffect(() => {
    if (user && user.role === 'student') {
      setSelectedGrade(user.grade);
    }
  }, [user]);

  const fetchStudentsByGrade = async (grade) => {
    try {
      setLoading(true);
      const response = await getStudentsByGrade(grade);
      const students = response.data || [];
      setStudents(students);
      
      // Initialize attendance status for each student
      const attendanceMap = {};
      students.forEach(student => {
        attendanceMap[student._id] = null;
      });
      setStudentAttendance(attendanceMap);
    } catch (err) {
      console.error('Error fetching students:', err);
      message.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedGrade) {
      fetchStudentsByGrade(selectedGrade);
    }
  }, [selectedGrade]);

  const handleGradeChange = (grade) => {
    setSelectedGrade(grade);
  };

  const handleStudentClick = async (studentId) => {
    setCurrentStudent(studentId);
    try {
      const response = await getStudentAttendance(studentId);
      if (response.data && response.data.length > 0) {
        const today = dayjs().startOf('day');
        const todayAttendance = response.data.find(record => {
          const recordDate = dayjs(record.date).startOf('day');
          return recordDate.isSame(today);
        });
        setStudentAttendance(prev => ({
          ...prev,
          [studentId]: todayAttendance || response.data[0]
        }));
      } else {
        setStudentAttendance(prev => ({
          ...prev,
          [studentId]: null
        }));
      }
    } catch (err) {
      console.error(err);
      message.error('Failed to fetch attendance data');
    }
  };

  const handleStudentCheckIn = async (studentId) => {
    try {
      await studentCheckIn(studentId);
      message.success('Student checked in successfully!');
      handleStudentClick(studentId);
    } catch (err) {
      console.error(err);
      message.error('Failed to check in student');
    }
  };

  const handleStudentCheckOut = async (studentId) => {
    try {
      await studentCheckOut(studentId);
      message.success('Student checked out successfully!');
      handleStudentClick(studentId);
    } catch (err) {
      console.error(err);
      message.error('Failed to check out student');
    }
  };

  const getAttendanceStatus = (attendanceRecord) => {
    if (!attendanceRecord) return 'not-checked-in';
    if (attendanceRecord.checkInTime && attendanceRecord.checkOutTime) return 'checked-out';
    if (attendanceRecord.checkInTime) return 'checked-in';
    return 'not-checked-in';
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'checked-in': return 'Checked-in';
      case 'checked-out': return 'Checked-out';
      case 'not-checked-in': return 'Not checked in';
      default: return 'Unknown';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'checked-in': return 'success';
      case 'checked-out': return 'error';
      case 'not-checked-in': return 'default';
      default: return 'default';
    }
  };

  return (
    <div className="student-attendance-selector">
      <Card 
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <UserSwitchOutlined style={{ color: 'var(--accent-color)' }} />
            <Title level={3} style={{ margin: 0, color: 'var(--text-light-color)' }}>
              Student Attendance
            </Title>
          </div>
        }
        className="attendance-card"
        headStyle={{
          backgroundColor: 'var(--card-primary)',
          color: 'var(--text-light-color)',
          borderBottom: '1px solid var(--border-color)'
        }}
      >
        {user?.role === 'student' ? (
          <div style={{ marginBottom: '20px' }}>
            <Text style={{ color: 'var(--text-light-color)', fontWeight: 600, marginRight: '12px' }}>
              Your Class: {user.grade}
            </Text>
          </div>
        ) : (
          <div style={{ marginBottom: '20px' }}>
            <Text style={{ color: 'var(--text-light-color)', marginRight: '12px' }}>Select Class:</Text>
            <Space>
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'].map(grade => (
                <Button
                  key={grade}
                  type={selectedGrade === grade ? 'primary' : 'default'}
                  onClick={() => handleGradeChange(grade)}
                  style={{ 
                    backgroundColor: selectedGrade === grade ? 'var(--accent-color)' : 'var(--card-background-color)',
                    borderColor: selectedGrade === grade ? 'var(--accent-color)' : 'var(--border-color)',
                    color: selectedGrade === grade ? 'white' : 'var(--text-light-color)'
                  }}
                >
                  {grade}
                </Button>
              ))}
            </Space>
          </div>
        )}

        {selectedGrade ? (
          <div>
            {loading ? (
              <Loading size="large" message="Loading students..." />
            ) : students.length > 0 ? (
              <List
                dataSource={students}
                renderItem={(student) => {
                  const attendanceStatus = getAttendanceStatus(studentAttendance[student._id]);
                  const isCurrentStudent = currentStudent === student._id;
                  
                  return (
                    <List.Item
                      onClick={() => handleStudentClick(student._id)}
                      className={isCurrentStudent ? 'selected' : ''}
                      style={{
                        cursor: 'pointer',
                        padding: '16px 20px',
                        backgroundColor: isCurrentStudent ? 'var(--primary-color)' : 'var(--card-background-color)',
                        borderRadius: '12px',
                        border: `1px solid ${isCurrentStudent ? 'var(--accent-color)' : 'var(--border-color)'}`,
                        marginBottom: '12px',
                        color: 'var(--text-light-color)',
                        display: 'flex',
                        alignItems: 'center',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', width: '100%', gap: '16px' }}>
                        <div style={{ 
                          width: '40px', 
                          height: '40px', 
                          borderRadius: '50%', 
                          background: 'var(--card-primary)', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          color: 'var(--accent-color)',
                          fontWeight: 'bold',
                          fontSize: '16px',
                          flexShrink: 0,
                          border: '2px solid var(--border-color)'
                        }}>
                          {student.name ? student.name.charAt(0) : '?'}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                            <Text style={{ color: 'var(--text-light-color)', fontWeight: 600, fontSize: '16px' }}>
                              {student.name}
                            </Text>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <Tag color={getStatusColor(attendanceStatus)} className="status-badge" style={{ fontSize: '12px', padding: '2px 8px' }}>
                                {getStatusText(attendanceStatus)}
                              </Tag>
                            </div>
                          </div>
                          <Space direction="vertical" size="small" style={{ width: '100%' }}>
                            <Text style={{ color: 'var(--subtext-light)', fontSize: '14px' }}>
                              Roll No: {student.rollNumber}
                            </Text>
                            {studentAttendance[student._id] && (
                              <Space direction="horizontal" size="middle" style={{ flexWrap: 'wrap', gap: '8px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <ClockCircleOutlined style={{ fontSize: '12px', color: 'var(--subtext-light)' }} />
                                  <Text style={{ color: 'var(--subtext-light)', fontSize: '12px' }}>
                                    {studentAttendance[student._id].checkInTime ? dayjs(studentAttendance[student._id].checkInTime).format('HH:mm') : 'N/A'}
                                  </Text>
                                </div>
                                {studentAttendance[student._id].checkOutTime && (
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <LogoutOutlined style={{ fontSize: '12px', color: 'var(--subtext-light)' }} />
                                    <Text style={{ color: 'var(--subtext-light)', fontSize: '12px' }}>
                                      {dayjs(studentAttendance[student._id].checkOutTime).format('HH:mm')}
                                    </Text>
                                  </div>
                                )}
                              </Space>
                            )}
                          </Space>
                        </div>
                      </div>
                    </List.Item>
                  );
                }}
              />
            ) : (
              <Text type="secondary" style={{ color: 'var(--text-light-color)' }}>
                No students found for this class.
              </Text>
            )}
          </div>
        ) : (
          <Text type="secondary" style={{ color: 'var(--text-light-color)' }}>
            Please select a class to view students.
          </Text>
        )}
      </Card>
    </div>
  );
};

export default StudentAttendanceSelector;
