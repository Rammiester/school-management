import React, { useState, useEffect } from "react";
import { Button, Modal, Select, Table, Typography } from 'antd';
import "../../App.css"
import { getTimetableClasses, getTimetableForClass, getUsers, updateTimetableEntry, updateUser, getAvailableTeachersForPeriod } from "../../api";
import BackButton from "../../components/BackButton";
const { Title, Text } = Typography;

const Timetable = () => {
  const [classes, setClasses] = useState([]);
  const [timetableData, setTimetableData] = useState({});
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [viewingClassTimetable, setViewingClassTimetable] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [subjectDetail, setSubjectDetail] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState('');
  const [assignLoading, setAssignLoading] = useState(false);
  const [availableTeachers, setAvailableTeachers] = useState([]);
  const [loadingAvailableTeachers, setLoadingAvailableTeachers] = useState(false);


  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const [classResponse, usersResponse] = await Promise.all([
          getTimetableClasses(),
          getUsers()
        ]);
        setClasses(classResponse.data);
        setUsers(usersResponse.data);
      } catch (error) {
        console.error('Error fetching initial data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  const fetchTimetableForClass = async (className) => {
    if (!className) return;
    try {
      setLoading(true);
      const response = await getTimetableForClass(className);
      setTimetableData(prev => ({ ...prev, [className]: response.data }));
    } catch (error) {
      console.error(`Error fetching timetable for ${className}:`, error);
    } finally {
      setLoading(false);
    }
  };

  const handleClassSelect = (classObj) => {
    setSelectedClass(classObj);
    setViewingClassTimetable(true);
    if (!timetableData[classObj.id]) {
      fetchTimetableForClass(classObj.id);
    }
  };

  const handleBack = () => {
    setSelectedClass(null);
    setViewingClassTimetable(false);
  };

  const handleClassCellClick = (entry) => {
    if (entry && entry.day) {
      setSubjectDetail(entry);
      setModalVisible(true);
    } else {
      console.error('Invalid entry structure:', entry);
    }
  };

  const handleModalClose = () => {
    setModalVisible(false);
    setSubjectDetail(null);
  };

  const fetchAvailableTeachersForPeriod = async (day, timeSlot) => {
    setLoadingAvailableTeachers(true);
    try {
      const response = await getAvailableTeachersForPeriod(day, timeSlot);
      setAvailableTeachers(response.data);
    } catch (error) {
      console.error('Error fetching available teachers:', error);
      setAvailableTeachers(users.filter(user =>
        (user.role === 'teacher' || user.role === 'staff') && user.isAvailable
      ));
    } finally {
      setLoadingAvailableTeachers(false);
    }
  };

  const handleAssignUser = async () => {
    if (!selectedUser || !subjectDetail || !selectedClass) return;
    setAssignLoading(true);
    try {
      const selectedUserObj = users.find(user => user._id === selectedUser);
      if (!selectedUserObj) {
        throw new Error('Selected user not found');
      }

      await updateTimetableEntry(selectedClass.id, subjectDetail.day, subjectDetail.time, selectedUser);
      fetchTimetableForClass(selectedClass.id);

      setShowAssignModal(false);
      setModalVisible(false);
      setSelectedUser('');
    } catch (error) {
      console.error('Error assigning user:', error);
      alert('Error assigning user: ' + error.message);
    } finally {
      setAssignLoading(false);
    }
  };

  const handleShowAssignModal = async () => {
    if (subjectDetail?.day && subjectDetail?.time) {
      await fetchAvailableTeachersForPeriod(subjectDetail.day, subjectDetail.time);
    }
    setShowAssignModal(true);
  };

  const classObjects = classes.map(cls => ({
    id: cls,
    name: cls.charAt(0).toUpperCase() + cls.slice(1)
  }));

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  const periods = (timetableData[selectedClass?.id]?.schedule?.Monday || [])
    .map((entry, index) => ({ id: index, time: entry.time }))
    .filter(period => period.time);

  const availableUsers = users.filter(user =>
    (user.role === 'teacher' || user.role === 'staff') && user.isAvailable
  );

  const prepareTableData = () => {
    if (!selectedClass || !timetableData[selectedClass.id]) return [];

    return periods.map(period => {
      const row = { key: period.id, period: period.time };
      let hasAnyClass = false;

      days.forEach(day => {
        const schedule = timetableData[selectedClass.id]?.schedule?.[day];
        const entry = schedule?.[period.id] || null;
        row[day.toLowerCase()] = entry;
        if (entry) hasAnyClass = true;
      });

      return hasAnyClass ? row : null;
    }).filter(Boolean);
  };

  const columns = [
    {
      title: 'Period',
      dataIndex: 'period',
      key: 'period',
      rowScope: 'row',
      width: 100,
      fixed: 'left',
      render: (text) => <span className="period-cell">{text}</span>,
      onCell: () => ({ style: { background: 'var(--accent-color)' } }),
    },
    ...days.map(day => ({
      title: day,
      key: day.toLowerCase(),
      width: 150,
      render: (_, record) => {
        const entry = record[day.toLowerCase()];
        return entry ? (
          <div className="class-cell-content" onClick={() => handleClassCellClick({ ...entry, day })}>
            <div className="class-subject">{entry.subject}</div>
            <div className="class-teacher">{entry.teacher}</div>
            <div className="class-room">Room: {entry.room}</div>
          </div>
        ) : <span className="no-class">No Class</span>;
      }
    }))
  ];

  return (
    <div className="timetable-container">
      {viewingClassTimetable ? (
        <div className="back-button-container">
          <BackButton text="← Back to Classes" onClick={handleBack} />
        </div>
      ) : (
        <BackButton />
      )}
      <div className="timetable-header">
        <h1>Academic Timetable</h1>
        <p>{periods.length} Academic Periods • {days.length} School Days ({days[0]} - {days[days.length - 1]})</p>
        <p className="fixed-title-note">Note: Main title is fixed for every timetable view</p>
      </div>

      {!viewingClassTimetable ? (
        <div >
          <Title level={2} style={{ color: 'var(--text-light-color)', marginBottom: '24px' }}>
            All Classes
          </Title>
          <div className="class-cards-container" >
            {classObjects.map(cls => (
              <div
                key={cls.id}
                className="class-card"
                onClick={() => handleClassSelect(cls)}
              >
                <h3>{cls.name}</h3>
              </div>
            ))}
          </div>
        </div>
      ) : selectedClass && (
        <div className="timetable-display">
          <div className="class-header">
            <h2>{selectedClass.name} Timetable</h2>
          </div>
          <div className="timetable-table-container">
            <Table
              columns={columns}
              dataSource={prepareTableData()}
              pagination={false}
              scroll={{ x: 1200 }}
              className="timetable-table"
              size="middle"
              loading={loading}
            />
          </div>
        </div>
      )}

      <Modal title="Subject Details" visible={modalVisible} onCancel={handleModalClose} footer={null} width={400}>
        {subjectDetail ? (
          <div className="subject-item card">
            <h4>{subjectDetail.subject}</h4>
            <p>Teacher: {subjectDetail.teacher}</p>
            <p>Room: {subjectDetail.room}</p>
            <p>Time: {subjectDetail.time}</p>
            <p>Day: {subjectDetail.day}</p>
            <div style={{ marginTop: '15px' }}>
              <Button type="primary" onClick={handleShowAssignModal}>Assign User</Button>
            </div>
          </div>
        ) : (
          <p>No subject details available.</p>
        )}
      </Modal>

      <Modal title="Assign User" visible={showAssignModal} onCancel={() => setShowAssignModal(false)} footer={null} width={400}>
        <div className="subject-item card">
          <h4>Assign User to {subjectDetail?.subject}</h4>
          <p>Day: {subjectDetail?.day}, Time: {subjectDetail?.time}</p>
          <div style={{ marginBottom: '15px' }}>
            <label>Select User:</label>
            <Select
              style={{ width: '100%' }}
              placeholder="Select a teacher or staff member"
              value={selectedUser}
              onChange={setSelectedUser}
              loading={loadingAvailableTeachers}
              options={availableTeachers.map(user => ({ value: user._id, label: `${user.name} (${user.role})` }))}
            />
          </div>
          <Button type="primary" onClick={handleAssignUser} loading={assignLoading} disabled={!selectedUser}>
            Assign User
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default Timetable;
