import React, { useState } from 'react';
import { Typography, Card } from 'antd';
import './Attendance.css';
import BackButton from '../../components/BackButton';
import SegmentedButton from '../../components/Billing/SegmentedButton';
import StaffAttendance from './StaffAttendance';
import StudentAttendance from './StudentAttendance';

const { Title } = Typography;

const Attendance = () => {
  const [activeTab, setActiveTab] = useState('staff');

  return (
    <div className="attendance-page">
      <BackButton />
      <Title level={2} style={{ color: 'var(--text-light-color)', marginBottom: '24px' }}>
        Attendance Management
      </Title>
      
      <Card style={{ marginBottom: '24px' }}>
        <SegmentedButton
          options={[
            { label: 'Staff', value: 'staff' },
            { label: 'Students', value: 'students' }
          ]}
          value={activeTab}
          onChange={setActiveTab}
        />
      </Card>

      {activeTab === 'staff' ? <StaffAttendance /> : <StudentAttendance />}
    </div>
  );
};

export default Attendance;
