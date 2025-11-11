import styled from 'styled-components';
import { Card } from 'antd';

export const CalendarCard = styled(Card)`
  background: var(--card-background-color);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  box-shadow: var(--box-shadow-light);
  max-width: 600px;
  width: 100%;
  margin-top: 2rem;

  .ant-card-body {
    padding: 1.5rem;
  }

  /* Calendar navigation styles */
  .react-calendar__navigation__label{
    color: var(--text-light-color);
    font-weight: 600;
  }

  .react-calendar__navigation__arrow {
    color: var(--text-light-color) !important;
  }

  /* Calendar-specific styles */
  .react-calendar {
    background: transparent;
    border: none;
    width: 100%;
    font-family: inherit;
  }

  .react-calendar__month-view__days__day--weekend {
    color: var(--secondary-color);
  }

  .react-calendar__tile {
    position: relative;
    height: 60px; /* Increased for better touch target */
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background-color 0.2s ease;

    &:hover {
      background-color: rgba(140, 42, 30, 0.1); /* Subtle hover effect */
    }
  }

  .react-calendar__tile--active,
  .react-calendar__tile--now {
    background: var(--accent-color);
    color: var(--text-light-color);
    border-radius: 12px !important;
  }

  .react-calendar__tile--active:hover,
  .react-calendar__tile--now:hover {
    background: var(--accent-color-hover);
  }

  .react-calendar__tile--disabled {
    color: var(--placeholder-color);
    cursor: not-allowed;
  }

  /* Event indicator styles */
  .event-indicator {
    width: 8px;
    height: 8px;
    background-color: var(--modal-primary-color);
    border-radius: 50%;
    position: absolute;
    bottom: 4px;
    right: 4px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  }

  /* Event popup styles */
  .event-popup {
    margin-top: 1rem;
    padding: 1rem;
    color: var(--text-light-color);
    background: linear-gradient(135deg, var(--accent-color) 0%, var(--modal-secondary-color) 100%);
    border-radius: 8px;
    box-shadow: var(--box-shadow);
    max-height: 300px;
    overflow-y: auto;

    h3 {
      margin-top: 0;
      margin-bottom: 10px;
      text-align: center;
      color: var(--text-light-color);
    }

    p {
      margin: 2px 0 0;
      color: var(--subtext-light);
    }

    .event-item {
      padding: 10px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);

      &:last-child {
        border-bottom: none;
      }
    }
  }

  /* Location icon styling */
  .event-popup p span {
    font-size: 13px;
    opacity: 0.9;
  }
`;
