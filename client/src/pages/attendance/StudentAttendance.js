import React, { useState, useEffect } from 'react';
import { getStudentsWithRollNumbers, studentCheckIn, studentCheckOut, studentBiometricCheckIn, studentBiometricCheckOut, getStudentAttendance, bulkStudentAttendance } from '../../api';
import { Card, List, Button, Typography, Space, Modal, Tag, message } from 'antd';
import { UserOutlined, CheckCircleOutlined, ClockCircleOutlined, LogoutOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import Loading from '../../components/LoadingComponent/Loading';

const { Title, Text } = Typography;

const StudentAttendance = () => {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [studentAttendance, setStudentAttendance] = useState(null);
  const [studentLoading, setStudentLoading] = useState(false);
  const [isStudentModalVisible, setIsStudentModalVisible] = useState(false);
  const [isStudentListModalVisible, setIsStudentListModalVisible] = useState(false);
  const [isStudentBiometricModalVisible, setIsStudentBiometricModalVisible] = useState(false);
  const [biometricType, setBiometricType] = useState('fingerprint');
  const [studentStatuses, setStudentStatuses] = useState({});
  const [currentStudent, setCurrentStudent] = useState(null);

  useEffect(() => {
    const fetchStudents = async () => {
      if (selectedGrade) {
        try {
          setStudentLoading(true);
          const response = await getStudentsWithRollNumbers(selectedGrade);
          const students = response.data || [];
          setStudents(students);

          const initialStatus = {};
          students.forEach(student => {
            initialStatus[student._id] = 'absent';
          });
          setStudentStatuses(initialStatus);

        } catch (err) {
          console.error('Error fetching students:', err);
          message.error('Failed to fetch students');
        } finally {
          setStudentLoading(false);
        }
      } else {
        setStudents([]);
        setStudentStatuses({});
      }
    };
    fetchStudents();
  }, [selectedGrade]);

  const handleGradeChange = (grade) => {
    setSelectedGrade(grade);
    setStudentStatuses({});
    setIsStudentListModalVisible(true);
  };

  const handleStatusChange = (studentId, status) => {
    setStudentStatuses(prevStatus => ({
      ...prevStatus,
      [studentId]: status,
    }));
  };

  const handleSubmitAttendance = async () => {
    try {
      const attendanceData = {
        grade: selectedGrade,
        date: dayjs().format('YYYY-MM-DD'),
        statuses: studentStatuses,
      };
      await bulkStudentAttendance(attendanceData);
      message.success('Attendance submitted successfully!');
      setIsStudentListModalVisible(false);
      setStudentStatuses({});
      setStudents([]);
    } catch (err) {
      console.error('Error submitting attendance:', err);
      message.error('Failed to submit attendance.');
    }
  };

  const handleStudentClick = async (studentId) => {
    setSelectedStudent(studentId);
    setIsStudentModalVisible(true);
    setStudentAttendance(null);
    try {
      const response = await getStudentAttendance(studentId);
      if (response.data && response.data.length > 0) {
        const today = dayjs().startOf('day');
        const todayAttendance = response.data.find(record => {
          const recordDate = dayjs(record.date).startOf('day');
          return recordDate.isSame(today);
        });
        setStudentAttendance(todayAttendance || response.data[0]);
      } else {
        setStudentAttendance(null);
      }
    } catch (err) {
      console.error(err);
      message.error('Failed to fetch student attendance');
    }
  };

  const handleStudentCheckIn = async () => {
    try {
      await studentCheckIn(selectedStudent);
      message.success('Student checked in successfully!');
      handleStudentClick(selectedStudent);
    } catch (err) {
      console.error(err);
      message.error('Failed to check in student.');
    }
  };

  const handleStudentCheckOut = async () => {
    try {
      await studentCheckOut(selectedStudent);
      message.success('Student checked out successfully!');
      handleStudentClick(selectedStudent);
    } catch (err) {
      console.error(err);
      message.error('Failed to check out student.');
    }
  };

  const handleStudentBiometricCheckIn = async () => {
    try {
      const mockBiometricId = `biometric_${Date.now()}_${selectedStudent}`;
      const mockDeviceInfo = `Android Device - ${navigator.userAgent}`;

      await studentBiometricCheckIn(selectedStudent, 'fingerprint', mockDeviceInfo);
      message.success('Student biometric check-in successful!');
      handleStudentClick(selectedStudent);
      setIsStudentBiometricModalVisible(false);
    } catch (err) {
      console.error(err);
      message.error('Student biometric check-in failed');
    }
  };

  const handleStudentBiometricCheckOut = async () => {
    try {
      const mockBiometricId = `biometric_${Date.now()}_${selectedStudent}`;
      const mockDeviceInfo = `Android Device - ${navigator.userAgent}`;

      await studentBiometricCheckOut(selectedStudent, mockBiometricId, mockDeviceInfo);
      message.success('Student biometric check-out successful!');
      handleStudentClick(selectedStudent);
      setIsStudentBiometricModalVisible(false);
    } catch (err) {
      console.error(err);
      message.error('Student biometric check-out failed');
    }
  };

  const handleStudentModalClose = () => {
    setIsStudentModalVisible(false);
    setSelectedStudent(null);
    setStudentAttendance(null);
  };

  const handleStudentBiometricModalClose = () => {
    setIsStudentBiometricModalVisible(false);
    setBiometricType('fingerprint');
  };

  const handleStudentListModalClose = () => {
    setIsStudentListModalVisible(false);
    setStudents([]);
  };

  const handleIndividualStudentAttendanceSubmit = async (studentId, status) => {
    try {
      setStudentStatuses(prev => ({
        ...prev,
        [studentId]: status
      }));
      message.success(`Attendance recorded as ${status} for student`);
    } catch (err) {
      console.error('Error submitting student attendance:', err);
      message.error('Failed to submit student attendance.');
    }
  };

  const getStudentInfo = (studentId) => {
    return students.find(student => student._id === studentId) || {};
  };

  return (
    <div className="attendance-page">
      <Title level={2} style={{ color: 'var(--text-light-color)', marginBottom: '24px' }}>
        Student Attendance
      </Title>
      
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div className="class-cards-container">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'].map(grade => (
            <Card
              key={grade}
              hoverable
              className="class-card"
              onClick={() => handleGradeChange(grade)}
            >
              <div className="class-card-content">
                <UserOutlined style={{ fontSize: '24px', color: 'var(--accent-color)' }} />
                <Title level={5} style={{ margin: '0', color: 'var(--text-light-color)' }}>
                  Class {grade}
                </Title>
              </div>
            </Card>
          ))}
        </div>
      </Space>

      <Modal
        title={`Attendance for ${getStudentInfo(selectedStudent)?.name || 'Student'}`}
        visible={isStudentModalVisible}
        onCancel={handleStudentModalClose}
        footer={null}
        width={600}
      >
        {studentAttendance ? (
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <CheckCircleOutlined style={{ fontSize: '24px', color: 'var(--accent-color)' }} />
              <div>
                <Text strong style={{ color: 'var(--text-light-color)' }}>Check-in:</Text> <Text style={{ color: 'var(--text-light-color)' }}>{studentAttendance.checkInTime ? dayjs(studentAttendance.checkInTime).format('HH:mm') : 'Not checked in yet'}</Text>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <ClockCircleOutlined style={{ fontSize: '24px', color: 'var(--secondary-color)' }} />
              <div>
                <Text strong style={{ color: 'var(--text-light-color)' }}>Check-out:</Text> <Text style={{ color: 'var(--text-light-color)' }}>{studentAttendance.checkOutTime ? dayjs(studentAttendance.checkOutTime).format('HH:mm') : 'Not checked out yet'}</Text>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Text strong style={{ color: 'var(--text-light-color)' }}>Biometric Verified:</Text> <Text style={{ color: 'var(--text-light-color)' }}>{studentAttendance.biometricVerified ? 'Yes' : 'No'}</Text>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Text strong style={{ color: 'var(--text-light-color)' }}>Status:</Text>
              {studentAttendance.checkInTime && studentAttendance.checkOutTime ? (
                <Tag color="error">Checked-out</Tag>
              ) : studentAttendance.checkInTime ? (
                <Tag color="success">Checked-in</Tag>
              ) : (
                <Tag color="default">Not checked in</Tag>
              )}
            </div>
          </Space>
        ) : (
          <Text type="secondary" style={{ color: 'var(--text-light-color)' }}>No attendance record for today</Text>
        )}
        <Space style={{ marginTop: '20px' }}>
          <Button
            type="primary"
            onClick={handleStudentCheckIn}
            icon={<CheckCircleOutlined />}
            style={{ backgroundColor: 'var(--accent-color)', borderColor: 'var(--accent-color)', color: 'white' }}
          >
            Check-in
          </Button>
          <Button
            type="primary"
            onClick={handleStudentCheckOut}
            icon={<LogoutOutlined />}
            style={{ backgroundColor: 'var(--secondary-color)', borderColor: 'var(--secondary-color)', color: 'white' }}
          >
            Check-out
          </Button>
          <Button
            type="primary"
            onClick={() => setIsStudentBiometricModalVisible(true)}
            className="biometric-btn"
          >
            Biometric Check-in
          </Button>
        </Space>
      </Modal>

      <Modal
        title="Student Biometric Authentication"
        visible={isStudentBiometricModalVisible}
        onCancel={handleStudentBiometricModalClose}
        footer={null}
        width={500}
      >
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Text strong>Biometric Type:</Text>
          <Space direction="horizontal" size="middle">
            <Button
              type={biometricType === 'fingerprint' ? 'primary' : 'default'}
              onClick={() => setBiometricType('fingerprint')}
            >
              Fingerprint
            </Button>
            <Button
              type={biometricType === 'face' ? 'primary' : 'default'}
              onClick={() => setBiometricType('face')}
            >
              Face Recognition
            </Button>
          </Space>
          <Text strong>Device: {navigator.userAgent}</Text>
          <Text type="secondary">Please authenticate using your biometric device</Text>
          <Space style={{ marginTop: '20px' }} direction="vertical" size="middle">
            <Button
              type="primary"
              onClick={handleStudentBiometricCheckIn}
              icon={<CheckCircleOutlined />}
              style={{ backgroundColor: 'var(--accent-color)', borderColor: 'var(--accent-color)', color: 'white' }}
            >
              Biometric Check-in
            </Button>
            <Button
              type="primary"
              onClick={handleStudentBiometricCheckOut}
              icon={<LogoutOutlined />}
              style={{ backgroundColor: 'var(--secondary-color)', borderColor: 'var(--secondary-color)', color: 'white' }}
            >
              Biometric Check-out
            </Button>
          </Space>
        </Space>
      </Modal>

      <Modal
        title={`Attendance for Class ${selectedGrade}`}
        visible={isStudentListModalVisible}
        onCancel={handleStudentListModalClose}
        footer={[
          <Button key="back" onClick={handleStudentListModalClose}>
            Cancel
          </Button>,
          <Button key="submit" type="primary" onClick={handleSubmitAttendance}>
            Submit Attendance
          </Button>,
        ]}
        width={800}
        destroyOnClose={true}
      >
        {studentLoading ? (
          <Loading size="large" message="Loading students..." />
        ) : students.length > 0 ? (
          <List
            dataSource={students}
            renderItem={(student) => (
              <List.Item style={{ padding: '16px 20px', backgroundColor: 'var(--card-background-color)', borderRadius: '12px', border: '1px solid var(--border-color)', marginBottom: '12px' }}>
                <List.Item.Meta
                  avatar={<UserOutlined />}
                  title={student.name}
                  description={`Roll No: ${student.rollNumber}`}
                />
                <Space direction="horizontal" size="middle" style={{ flexWrap: 'wrap' }}>
                  <Button
                    type={studentStatuses[student._id] === 'present' ? 'primary' : 'default'}
                    onClick={() => handleStatusChange(student._id, 'present')}
                    style={{ backgroundColor: studentStatuses[student._id] === 'present' ? 'var(--accent-color)' : 'transparent', borderColor: studentStatuses[student._id] === 'present' ? 'var(--accent-color)' : 'var(--border-color)' }}
                  >
                    Present
                  </Button>
                  <Button
                    type={studentStatuses[student._id] === 'absent' ? 'primary' : 'default'}
                    danger={studentStatuses[student._id] === 'absent'}
                    onClick={() => handleStatusChange(student._id, 'absent')}
                    style={{ backgroundColor: studentStatuses[student._id] === 'absent' ? 'var(--accent-color)' : 'transparent', borderColor: studentStatuses[student._id] === 'absent' ? 'var(--accent-color)' : 'var(--border-color)' }}
                  >
                    Absent
                  </Button>
                  <Button
                    type={studentStatuses[student._id] === 'leave' ? 'primary' : 'default'}
                    onClick={() => handleStatusChange(student._id, 'leave')}
                    style={{ backgroundColor: studentStatuses[student._id] === 'leave' ? 'var(--accent-color)' : 'transparent', borderColor: studentStatuses[student._id] === 'leave' ? 'var(--accent-color)' : 'var(--border-color)' }}
                  >
                    Leave
                  </Button>
                </Space>
              </List.Item>
            )}
          />
        ) : (
          <Text type="secondary">No students found for this class.</Text>
        )}
      </Modal>
    </div>
  );
};

export default StudentAttendance;
