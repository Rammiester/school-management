
//EventCalendar;
import React, { useState, useMemo } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { CalendarCard } from './EventCalendar.styles';
import { Typography } from "antd";

const EventCalendar = ({ eventss = [], onDateChange }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const processedEvents = useMemo(() => {
    return eventss.map((event) => ({
      ...event,
      dateObj: new Date(event.date)
    }));
 }, [eventss]);

  const hasEvent = (date) =>
    processedEvents.some((e) => e.dateObj.toDateString() === date.toDateString());

  const getEventsForDate = (date) =>
    processedEvents.filter((e) => e.dateObj.toDateString() === date.toDateString());

  const handleDateChange = (date) => {
    setSelectedDate(date);
    if (onDateChange) {
      onDateChange(date);
    }
  };

  const selectedEvents = getEventsForDate(selectedDate);

  return (
    <CalendarCard
      title={<Typography style={{ color: 'var(--text-light-color)' }}>School Events</Typography>}
    >
      <Calendar

        onChange={handleDateChange}
        value={selectedDate}
        tileContent={({ date }) =>
          hasEvent(date) ? <div className="event-indicator" /> : null
        }
        formatShortWeekday={(locale, date) => {
          return new Date(date).toLocaleDateString(locale, { weekday: 'short' }).substring(0, 3);
        }}
      />
      {selectedEvents.length > 0 && (
        <div className="event-popup">
          <h3>Events for {selectedDate.toLocaleDateString()}</h3>
          {selectedEvents.map((event, index) => (
            <div key={index} className="event-item">
              <p><b>{event.title}</b></p>
              {event.description && <p>{event.description}</p>}
              {event.location && (
                <p>
                  📍 <span>{event.location}</span>
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </CalendarCard>
  );
};

export default EventCalendar;
