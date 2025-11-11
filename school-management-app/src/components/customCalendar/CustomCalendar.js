import React, { useState, useRef, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './CustomCalendar.css';
import { CalendarOutlined } from '@ant-design/icons';

const CustomCalendar = ({ value, onChange, format = "DD/MM/YYYY" }) => {
  const [selectedDate, setSelectedDate] = useState(value || new Date());
  const [isOpen, setIsOpen] = useState(false);
  const calendarRef = useRef(null);

  // Handle date selection
  const handleDateChange = (date) => {
    setSelectedDate(date);
    onChange(date);
    setIsOpen(false); // Close calendar after selection
  };

  // Handle click outside to close calendar
  const handleClickOutside = (event) => {
    if (calendarRef.current && !calendarRef.current.contains(event.target)) {
      setIsOpen(false);
    }
  };

  // Toggle calendar visibility
  const toggleCalendar = () => {
    setIsOpen(!isOpen);
  };

  // Close calendar when clicking outside
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Ensure selectedDate is set to today if value is null/undefined
  useEffect(() => {
    if (!value) {
      setSelectedDate(new Date());
    }
  }, [value]);

  // Convert date to proper format for display
  const formatDate = (date) => {
    if (!date) return 'Select Date';
    // If it's already a Date object, use toLocaleDateString
    if (date instanceof Date && !isNaN(date)) {
      return date.toLocaleDateString('en-GB');
    }
    // If it's a timestamp or string, convert it to Date first
    const dateObj = new Date(date);
    if (isNaN(dateObj)) return 'Select Date';
    return dateObj.toLocaleDateString('en-GB');
  };

  return (
    <div className="custom-calendar-wrapper" ref={calendarRef}>
      <div className="custom-calendar-trigger" onClick={toggleCalendar}>
        <span className="custom-calendar-input">
          {formatDate(selectedDate)}
        </span>
        <CalendarOutlined className="custom-calendar-icon" />
      </div>
      
      {isOpen && (
        <div className="custom-calendar-dropdown">
          <Calendar
            onChange={handleDateChange}
            value={selectedDate}
            formatShortWeekday={(locale, date) => {
              // Format short weekday names to be only first 3 letters
              return new Date(date).toLocaleDateString(locale, { weekday: 'short' }).substring(0, 3);
            }}
            className="custom-calendar"
          />
        </div>
      )}
    </div>
  );
};

export default CustomCalendar;
