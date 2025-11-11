import React, { useState } from 'react';
import { NoticeBoardCard, NoticeCard, DateBadge } from './NoticeBoard.styles';
import {Typography} from "antd";
import AddNoticeModal from '../modals/AddNoticeModal';

// Utility for date formatting: "28 Jun, 2025"
function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric'
  }).replace(/ /g, ' ');
}

// Function to check if a date falls within a notice's date range
const isNoticeVisibleForDate = (notice, selectedDate) => {
  const noticeStartDate = notice.startDate ? new Date(notice.startDate) : null;
  const noticeEndDate = notice.endDate ? new Date(notice.endDate) : null;
  const checkDate = new Date(selectedDate);
  
  // If no date range is set, show the notice
  if (!noticeStartDate && !noticeEndDate) {
    return true;
  }
  
  // If only start date is set, check if current date is after or equal to start date
  if (noticeStartDate && !noticeEndDate) {
    return checkDate >= noticeStartDate;
  }
  
  // If only end date is set, check if current date is before or equal to end date
  if (!noticeStartDate && noticeEndDate) {
    return checkDate <= noticeEndDate;
  }
  
  // If both dates are set, check if current date is within the range
 return checkDate >= noticeStartDate && checkDate <= noticeEndDate;
};

const NoticeBoard = ({ notices = [], selectedDate = new Date() }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleAddNotice = () => {
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
  };

  const handleNoticeAdded = () => {
    // Refresh notices or update state
    window.location.reload();
  };

  // Filter notices based on the selected date range
  const visibleNotices = notices.filter(notice => 
    isNoticeVisibleForDate(notice, selectedDate)
  );

  return (
    <>
      <NoticeBoardCard 
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography style={{ color: '#ffffff', fontSize: '1.2rem', fontWeight: '600' }}>
               Notice Board
            </Typography>
            <button
              onClick={handleAddNotice}
              style={{
                backgroundColor: '#8c2a1e',
                color: '#ffffff',
                border: 'none',
                borderRadius: '4px',
                padding: '0.25rem 0.75rem',
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}
            >
              Add Notice
            </button>
          </div>
        }
      >
        <div className="scrollable">
          {visibleNotices.length === 0 && (
            <div style={{ 
              textAlign: 'center', 
              padding: '2rem',
              color: '#00000',
              fontStyle: 'italic'
            }}>
              No notices for the selected date.
            </div>
          )}
          {visibleNotices.map((notice, index) => (
            <NoticeCard key={notice._id || index}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                <DateBadge>
                  {formatDate(notice.startDate || notice.date || notice.createdAt)}
                </DateBadge>
              </div>
              <p className="title" style={{ 
                color: '#000000',
                marginBottom: '0.5rem'
              }}>
                {notice.message}
              </p>
              <p className="author" style={{ 
                color: '#cccccc',
                fontStyle: 'italic'
              }}>
                {notice.postedBy || 'Admin'}
              </p>
            </NoticeCard>
          ))}
        </div>
      </NoticeBoardCard>
      
      <AddNoticeModal 
        visible={isModalVisible}
        onClose={handleModalClose}
        onNoticeAdded={handleNoticeAdded}
      />
    </>
  );
};

export default NoticeBoard;
