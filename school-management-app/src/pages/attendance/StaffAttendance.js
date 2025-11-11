import React, { useState, useEffect, useContext } from 'react';
import { getUsers, getAttendance, checkIn, checkOut, getAttendanceByDate, getAttendanceByDateRange, biometricCheckIn, biometricCheckOut } from '../../api';
import { Card, List, Button, Typography, Space, Modal, Tag, DatePicker, message } from 'antd';
import { UserOutlined, CheckCircleOutlined, ClockCircleOutlined, LogoutOutlined, CalendarOutlined, DownloadOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { AuthContext } from '../../context/AuthContext';
import Loading from '../../components/LoadingComponent/Loading';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const StaffAttendance = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [attendance, setAttendance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [attendanceByDate, setAttendanceByDate] = useState([]);
  const [isExportModalVisible, setIsExportModalVisible] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [isBiometricModalVisible, setIsBiometricModalVisible] = useState(false);
  const [biometricType, setBiometricType] = useState('fingerprint');
  const { user } = useContext(AuthContext);
  const today = dayjs();
  const monthStart = today.clone().subtract(1, 'month').startOf('day');
  const monthEnd = today.clone().endOf('day');
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [exportDateRange, setExportDateRange] = useState([monthStart, monthEnd]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await getUsers();
        setUsers(response.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    if (user && user.role === 'chairman') {
      fetchAttendanceByDate(selectedDate);
    }
  }, [user, selectedDate]);

  const handleUserClick = async (userId) => {
    setSelectedUser(userId);
    setIsModalVisible(true);
    setAttendance(null);
    try {
      const response = await getAttendance(userId);
      if (response.data && response.data.length > 0) {
        const today = dayjs().startOf('day');
        const todayAttendance = response.data.find(record => {
          const recordDate = dayjs(record.date).startOf('day');
          return recordDate.isSame(today);
        });
        setAttendance(todayAttendance || response.data[0]);
      } else {
        setAttendance(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCheckIn = async () => {
    try {
      await checkIn(selectedUser);
      handleUserClick(selectedUser);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCheckOut = async () => {
    try {
      await checkOut(selectedUser);
      handleUserClick(selectedUser);
    } catch (err) {
      console.error(err);
    }
  };

  const handleBiometricCheckIn = async () => {
    try {
      const mockBiometricId = `biometric_${Date.now()}_${selectedUser}`;
      const mockDeviceInfo = `Android Device - ${navigator.userAgent}`;

      await biometricCheckIn(selectedUser, mockBiometricId, biometricType, mockDeviceInfo);
      message.success('Biometric check-in successful!');
      handleUserClick(selectedUser);
      setIsBiometricModalVisible(false);
    } catch (err) {
      console.error(err);
      message.error('Biometric check-in failed');
    }
  };

  const handleBiometricCheckOut = async () => {
    try {
      const mockBiometricId = `biometric_${Date.now()}_${selectedUser}`;
      const mockDeviceInfo = `Android Device - ${navigator.userAgent}`;

      await biometricCheckOut(selectedUser, mockBiometricId, mockDeviceInfo);
      message.success('Biometric check-out successful!');
      handleUserClick(selectedUser);
      setIsBiometricModalVisible(false);
    } catch (err) {
      console.error(err);
      message.error('Biometric check-out failed');
    }
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setSelectedUser(null);
    setAttendance(null);
  };

  const handleBiometricModalClose = () => {
    setIsBiometricModalVisible(false);
    setBiometricType('fingerprint');
  };

  const fetchAttendanceByDate = async (date) => {
    try {
      const formattedDate = date.format('YYYY-MM-DD');
      const response = await getAttendanceByDate(formattedDate);
      setAttendanceByDate(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDateChange = (date) => {
    if (!date) return;
    const newDate = date;
    setSelectedDate(newDate);
    fetchAttendanceByDate(newDate);
  };

  const handleExportModalOpen = () => {
    const baseDate = selectedDate || dayjs();
    setIsExportModalVisible(true);
    setExportDateRange([
      baseDate.clone().subtract(1, 'month').startOf('day'),
      baseDate.clone().endOf('day')
    ]);
  };

  const handleExportModalClose = () => {
    setIsExportModalVisible(false);
    setExportDateRange([dayjs().subtract(1, 'month').startOf('day'), dayjs().endOf('day')]);
  };

  const handleExport = async () => {
    setExportLoading(true);
    try {
      const [startMoment, endMoment] = exportDateRange;
      if (!startMoment || !endMoment) throw new Error('Invalid date range');
      const startStr = startMoment.format('YYYY-MM-DD');
      const endStr = endMoment.format('YYYY-MM-DD');

      const response = await getAttendanceByDateRange(startStr, endStr);
      const records = response.data;

      const excelContent = generateExcelData(records, startMoment, endMoment);
      const filename = `attendance_${startStr}_${endStr}.csv`;
      downloadExcel(excelContent, filename);
    } catch (err) {
      console.error(err);
    } finally {
      setExportLoading(false);
      handleExportModalClose();
    }
  };

  const generateExcelData = (records, startDateMoment, endDateMoment) => {
    const bom = '\ufeff';
    let excelContent = bom + 'User Name,';

    const dateRange = [];
    let current = startDateMoment;
    while (current.isBefore(endDateMoment) || current.isSame(endDateMoment)) {
      dateRange.push(current);
      current = current.add(1, 'day');
    }

    dateRange.forEach(date => {
      const dateStr = date.format('YYYY-MM-DD');
      excelContent += `${dateStr} Check-in,${dateStr} Check-out,${dateStr} Status,${dateStr} Biometric,`;
    });
    excelContent = excelContent.slice(0, -1) + '\n';

    const userMap = {};

    records.forEach(record => {
      const userId = record.userId?._id || 'N/A';
      const userName = record.userId?.name || 'N/A';
      const dateStr = dayjs(record.date).format('YYYY-MM-DD');

      if (!userMap[userId]) {
        userMap[userId] = { name: userName, attendance: {} };
      }

      const status = record.checkInTime && record.checkOutTime
        ? 'Checked-out'
        : record.checkInTime ? 'Checked-in' : 'Not checked in';

      userMap[userId].attendance[dateStr] = {
        checkIn: record.checkInTime ? dayjs(record.checkInTime).format('HH:mm') : '',
        checkOut: record.checkOutTime ? dayjs(record.checkOutTime).format('HH:mm') : '',
        status,
        biometric: record.biometricVerified ? 'Yes' : 'No'
      };
    });

    Object.values(userMap).forEach(user => {
      excelContent += `${user.name},`;
      dateRange.forEach(date => {
        const dateStr = date.format('YYYY-MM-DD');
        if (user.attendance[dateStr]) {
          const { checkIn, checkOut, status, biometric } = user.attendance[dateStr];
          excelContent += `${checkIn || 'N/A'},${checkOut || 'N/A'},${status},${biometric},`;
        } else {
          excelContent += `,,No records,No,`;
        }
      });
      excelContent = excelContent.slice(0, -1) + '\n';
    });

    return excelContent;
  };

  const downloadExcel = (excelContent, filename) => {
    const blob = new Blob([excelContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="attendance-page">
      <Title level={2} style={{ color: 'var(--text-light-color)', marginBottom: '24px' }}>
        Staff Attendance
      </Title>
      
      <div style={{ padding: '20px', minHeight: 'auto' }}>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Card
              title="Attendance by Date"
            >
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <Space style={{ marginBottom: '16px' }}>
                  <CalendarOutlined style={{ fontSize: '20px', color: 'var(--accent-color)' }} />
                  <Text style={{ color: "var(--text-light-color)" }} strong>Select Date:</Text>
                  <DatePicker
                    value={selectedDate}
                    onChange={handleDateChange}
                    format="DD/MM/YYYY"
                  />
                </Space>
                <Space style={{ marginBottom: '16px' }}>
                  <Button
                    type="primary"
                    onClick={handleExportModalOpen}
                    icon={<DownloadOutlined />}
                    style={{ backgroundColor: 'var(--accent-color)', borderColor: 'var(--accent-color)', color: 'white' }}
                  >
                    Export Excel
                  </Button>
                </Space>

                {attendanceByDate.length > 0 ? (
                  <List
                    className="attendance-by-date-list"
                    dataSource={attendanceByDate}
                    renderItem={(record) => (
                      <List.Item style={{ 
                        padding: '16px 20px', 
                        backgroundColor: 'var(--card-background-color)', 
                        borderRadius: '12px',
                        border: '1px solid var(--border-color)',
                        marginBottom: '12px',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                        cursor: 'default',
                        minHeight: '80px'
                      }}>
                        <List.Item.Meta
                          avatar={<UserOutlined style={{ fontSize: '24px', color: 'var(--accent-color)' }} />}
                          title={<Text style={{ color: 'var(--text-light-color)', fontWeight: 600 }}> {record.userId?.name || record.studentId?.name}</Text>}
                          description={
                            <Space direction="vertical" size="small">
                              <Text style={{ color: 'var(--text-light-color)' }}>Role: {record.userId?.role || (record.studentId ? 'Student' : 'N/A')}</Text>
                              <Space direction="horizontal" size="middle" style={{ flexWrap: 'wrap', gap: '8px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <ClockCircleOutlined style={{ fontSize: '12px', color: 'var(--subtext-light)' }} />
                                  <Text style={{ color: 'var(--subtext-light)', fontSize: '12px' }}>
                                    Check-in: {record.checkInTime ? dayjs(record.checkInTime).format('HH:mm') : 'N/A'}
                                  </Text>
                                </div>
                                {record.checkOutTime && (
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <LogoutOutlined style={{ fontSize: '12px', color: 'var(--subtext-light)' }} />
                                    <Text style={{ color: 'var(--subtext-light)', fontSize: '12px' }}>
                                      Check-out: {dayjs(record.checkOutTime).format('HH:mm')}
                                    </Text>
                                  </div>
                                )}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <EyeInvisibleOutlined style={{ fontSize: '12px', color: 'var(--subtext-light)' }} />
                                  <Text style={{ color: 'var(--subtext-light)', fontSize: '12px' }}>
                                    Biometric: {record.biometricVerified ? 'Yes' : 'No'}
                                  </Text>
                                </div>
                              </Space>
                              <Space direction="horizontal" size="middle">
                                {record.checkInTime && record.checkOutTime ? (
                                  <Tag color="error" className="status-badge" style={{ fontSize: '12px', padding: '2px 8px' }}>
                                    Checked-out
                                  </Tag>
                                ) : record.checkInTime ? (
                                  <Tag color="success" className="status-badge" style={{ fontSize: '12px', padding: '2px 8px' }}>
                                    Checked-in
                                  </Tag>
                                ) : (
                                  <Tag color="default" className="status-badge" style={{ fontSize: '12px', padding: '2px 8px' }}>
                                    Not checked in
                                  </Tag>
                                )}
                              </Space>
                            </Space>
                          }
                        />
                      </List.Item>
                    )}
                  />
                ) : (
                  <Text type="secondary">No attendance records found for this date.</Text>
                )}
              </Space>
            </Card>
          </Space>
        </div>

      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Card
          title="Staff and Teachers"
          className="attendance-card"
          headStyle={{
            backgroundColor: 'var(--card-primary)',
            color: 'var(--text-light-color)',
            borderBottom: '1px solid var(--border-color)'
          }}
        >
          {loading ? (
            <Loading size="large" message="Loading staff and teachers..." />
          ) : users.length > 0 ? (
            <List
              className="attendance-card"
              dataSource={users}
              renderItem={(user) => {
                const todayAttendance = attendanceByDate.find(record => record.userId?._id === user._id);
                const hasCheckedIn = todayAttendance?.checkInTime;
                const hasCheckedOut = todayAttendance?.checkOutTime;
                const status = hasCheckedOut ? 'checked-out' : hasCheckedIn ? 'checked-in' : 'not-checked-in';
                
                return (
                  <List.Item
                    onClick={() => handleUserClick(user._id)}
                    className={selectedUser === user._id ? 'selected' : ''}
                    style={{
                      cursor: 'pointer',
                      padding: '20px',
                      borderRadius: '12px',
                      backgroundColor: selectedUser === user._id ? 'var(--primary-color)' : 'var(--card-background-color)',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      border: `1px solid ${selectedUser === user._id ? 'var(--accent-color)' : 'var(--border-color)'}`,
                      marginBottom: '12px',
                      color: 'var(--text-light-color)',
                      minHeight: '100px',
                      display: 'flex',
                      alignItems: 'center',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                      position: 'relative',
                      overflow: 'hidden',
                      transform: selectedUser === user._id ? 'translateY(-2px)' : 'none'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', width: '100%', gap: '16px' }}>
                      <div style={{ 
                        width: '50px', 
                        height: '50px', 
                        borderRadius: '50%', 
                        background: 'var(--card-primary)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        color: 'var(--accent-color)',
                        fontWeight: 'bold',
                        fontSize: '20px',
                        flexShrink: 0,
                        border: '2px solid var(--border-color)',
                        position: 'relative',
                        overflow: 'hidden'
                      }}>
                        {user.name ? user.name.charAt(0) : '?'}
                        <div style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          background: 'linear-gradient(135deg, rgba(140, 42, 30, 0.2) 0%, transparent 50%)',
                          opacity: 0.5
                        }}></div>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                          <Text style={{ color: 'var(--text-light-color)', fontWeight: 600, fontSize: '18px', lineHeight: '1.3' }}>{user.name || 'Unknown User'}</Text>
                          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            {status === 'checked-in' && (
                              <Tag color="success" className="status-badge" style={{ fontSize: '12px', padding: '2px 8px' }}>
                                Checked-in
                              </Tag>
                            )}
                            {status === 'checked-out' && (
                              <Tag color="error" className="status-badge" style={{ fontSize: '12px', padding: '2px 8px' }}>
                                Checked-out
                              </Tag>
                            )}
                            {status === 'not-checked-in' && (
                              <Tag color="default" className="status-badge" style={{ fontSize: '12px', padding: '2px 8px' }}>
                                Not checked in
                              </Tag>
                            )}
                          </div>
                        </div>
                        <Space direction="vertical" size="small" style={{ width: '100%' }}>
                          <Text style={{ color: 'var(--subtext-light)', fontSize: '14px' }}>Role: {user.role}</Text>
                          {todayAttendance && (
                            <Space direction="horizontal" size="middle" style={{ flexWrap: 'wrap', gap: '8px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <ClockCircleOutlined style={{ fontSize: '12px', color: 'var(--subtext-light)' }} />
                                <Text style={{ color: 'var(--subtext-light)', fontSize: '12px' }}>
                                  {todayAttendance.checkInTime ? dayjs(todayAttendance.checkInTime).format('HH:mm') : 'N/A'}
                                </Text>
                              </div>
                              {todayAttendance.checkOutTime && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <LogoutOutlined style={{ fontSize: '12px', color: 'var(--subtext-light)' }} />
                                  <Text style={{ color: 'var(--subtext-light)', fontSize: '12px' }}>
                                    {dayjs(todayAttendance.checkOutTime).format('HH:mm')}
                                  </Text>
                                </div>
                              )}
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <EyeInvisibleOutlined style={{ fontSize: '12px', color: 'var(--subtext-light)' }} />
                                <Text style={{ color: 'var(--subtext-light)', fontSize: '12px' }}>
                                  {todayAttendance.biometricVerified ? 'Biometric' : 'No Biometric'}
                                </Text>
                              </div>
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
            <Text type="secondary">No staff or teachers found.</Text>
          )}
        </Card>
      </Space>

      <Modal
        title={`Attendance for ${users.find((user) => user._id === selectedUser)?.name || 'User'}`}
        visible={isModalVisible}
        onCancel={handleModalClose}
        footer={null}
        width={600}
      >
        {attendance ? (
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <CheckCircleOutlined style={{ fontSize: '24px', color: 'var(--accent-color)' }} />
              <div>
                <Text strong style={{ color: 'var(--text-light-color)' }}>Check-in:</Text> <Text style={{ color: 'var(--text-light-color)' }}>{attendance.checkInTime ? dayjs(attendance.checkInTime).format('HH:mm') : 'Not checked in yet'}</Text>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <ClockCircleOutlined style={{ fontSize: '24px', color: 'var(--secondary-color)' }} />
              <div>
                <Text strong style={{ color: 'var(--text-light-color)' }}>Check-out:</Text> <Text style={{ color: 'var(--text-light-color)' }}>{attendance.checkOutTime ? dayjs(attendance.checkOutTime).format('HH:mm') : 'Not checked out yet'}</Text>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Text strong style={{ color: 'var(--text-light-color)' }}>Biometric Verified:</Text> <Text style={{ color: 'var(--text-light-color)' }}>{attendance.biometricVerified ? 'Yes' : 'No'}</Text>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Text strong style={{ color: 'var(--text-light-color)' }}>Status:</Text>
              {attendance.checkInTime && attendance.checkOutTime ? (
                <Tag color="error">Checked-out</Tag>
              ) : attendance.checkInTime ? (
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
            onClick={handleCheckIn}
            icon={<CheckCircleOutlined />}
            style={{ backgroundColor: 'var(--accent-color)', borderColor: 'var(--accent-color)', color: 'white' }}
          >
            Check-in
          </Button>
          <Button
            type="primary"
            onClick={handleCheckOut}
            icon={<LogoutOutlined />}
            style={{ backgroundColor: 'var(--secondary-color)', borderColor: 'var(--secondary-color)', color: 'white' }}
          >
            Check-out
          </Button>
          <Button
            type="primary"
            onClick={() => setIsBiometricModalVisible(true)}
            className="biometric-btn"
          >
            Biometric Check-in
          </Button>
        </Space>
      </Modal>

      <Modal
        title="Biometric Authentication"
        visible={isBiometricModalVisible}
        onCancel={handleBiometricModalClose}
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
              onClick={handleBiometricCheckIn}
              icon={<CheckCircleOutlined />}
              style={{ backgroundColor: 'var(--accent-color)', borderColor: 'var(--accent-color)', color: 'white' }}
            >
              Biometric Check-in
            </Button>
            <Button
              type="primary"
              onClick={handleBiometricCheckOut}
              icon={<LogoutOutlined />}
              style={{ backgroundColor: 'var(--secondary-color)', borderColor: 'var(--secondary-color)', color: 'white' }}
            >
              Biometric Check-out
            </Button>
          </Space>
        </Space>
      </Modal>

      <Modal
        title="Export Attendance Data"
        visible={isExportModalVisible}
        onCancel={handleExportModalClose}
        footer={null}
        width={500}
      >
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Text strong>Select Date Range:</Text>
          <RangePicker
            value={exportDateRange}
            onChange={(dates) => setExportDateRange(dates)}
            format="DD/MM/YYYY"
            className="add-notice-datepicker"
          />
          <Space style={{ marginTop: '20px' }} direction="vertical" size="middle">
            <Button
              type="primary"
              onClick={handleExport}
              loading={exportLoading}
              icon={<DownloadOutlined />}
              style={{ backgroundColor: 'var(--accent-color)', borderColor: 'var(--accent-color)', color: 'white' }}
            >
              Export Excel
            </Button>
          </Space>
        </Space>
      </Modal>
    </div>
  );
};

export default StaffAttendance;
