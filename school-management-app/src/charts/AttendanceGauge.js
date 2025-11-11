import React, { useEffect, useState } from "react";
import { Progress, Typography } from "antd";
import styled from "styled-components";

// Styled Container for Centering
const CircularContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  text-align: center;
  padding: 10px;
  opacity: 0;
  transform: scale(0.8);
  animation: fadeIn 1s forwards;

  @keyframes fadeIn {
    0% {
      opacity: 0;
      transform: scale(0.8);
    }
    100% {
      opacity: 1;
      transform: scale(1);
    }
  }
`;

// Function to get color based on attendance
const getColor = (attendance) => {
  if (attendance >= 80) return "#52c41a"; // Green
  if (attendance >= 70) return "#faad14"; // Orange
  return "#ff4d4f"; // Red
};

const StudentAttendanceCircular = ({ attendance }) => {
  //const attendanceValue = parseInt(attendance.replace("%", ""), 10);
  const attendanceValue = attendance
  ? parseInt(attendance.toString().replace("%", ""), 10)
  : 0;

  const attendanceColor = getColor(attendanceValue);

  // Animation State
  const [animatedValue, setAnimatedValue] = useState(0);
  const [displayText, setDisplayText] = useState("0%");

  useEffect(() => {
    let progress = 0;
    const interval = setInterval(() => {
      if (progress >= attendanceValue) {
        clearInterval(interval);
      } else {
        progress += 1;
        setAnimatedValue(progress);
        setDisplayText(`${progress}%`);
      }
    }, 20); // Smooth counting animation

    return () => clearInterval(interval);
  }, [attendanceValue]);

  return (
    <CircularContainer>
      <Typography.Title
        level={4}
        style={{
          color: attendanceColor,
          fontSize: "1.5rem",
          fontWeight: "bold",
          opacity: animatedValue === attendanceValue ? 1 : 0,
          transition: "opacity 0.5s ease-in-out",
        }}
      >
        Attendance
      </Typography.Title>
      <Progress
        type="circle"
        percent={animatedValue}
        strokeColor={attendanceColor}
        strokeWidth={10}
        size={150} // Slightly larger for better visibility
        format={() => displayText} // Sync with animated percentage
      />
    </CircularContainer>
  );
};

export default StudentAttendanceCircular;
