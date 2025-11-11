import React, { useEffect, useState, useRef } from "react";
import {
  Modal,
  Typography,
  List,
  Row,
  Col,
  Button,
  Progress,
  Divider,
  Card,
} from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import BookIcon from "@mui/icons-material/Book";
import SchoolIcon from "@mui/icons-material/School";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import ScheduleIcon from "@mui/icons-material/Schedule";
import EventIcon from "@mui/icons-material/Event";

import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import BeenhereIcon from "@mui/icons-material/Beenhere";
import PersonIcon from "@mui/icons-material/Person";
import html2canvas from "html2canvas";
import moment from "moment";
import style from '../../App.css'

const TeacherDetailsModal = ({ open, teacher, onClose }) => {
  const [experienceProgress, setExperienceProgress] = useState(0);
  const [performanceScore, setPerformanceScore] = useState(0);
  const [workDuration, setWorkDuration] = useState("");
  const modalRef = useRef(null);

  useEffect(() => {
    if (open && teacher) {
      let progress = 0;
      const interval = setInterval(() => {
        progress += 1;
        setExperienceProgress(progress);
        if (progress >= teacher.experience) {
          clearInterval(interval);
        }
      }, 40);
      return () => clearInterval(interval);
    } else {
      setExperienceProgress(0);
    }
  }, [open, teacher]);

  useEffect(() => {
    if (teacher) {
      const leavesPenalty =
        (teacher.leavesTaken / teacher.totalLeavesAllowed) * 20;
      const complaintsPenalty = teacher.complaints * 10;
      const score =
        parseInt(teacher.attendance.replace("%", ""), 10) * 0.3 +
        teacher.syllabusCompletion * 0.4 -
        leavesPenalty -
        complaintsPenalty;
      setPerformanceScore(Math.max(0, Math.round(score)));

      if (teacher.dateOfJoining) {
        const duration = moment().diff(
          moment(teacher.dateOfJoining),
          "years",
          true
        );
        setWorkDuration(
          `${Math.floor(duration)} yrs, ${Math.round((duration % 1) * 12)} mos`
        );
      }
    }
  }, [teacher]);

  if (!teacher) return null;

  const downloadScreenshot = async () => {
    if (!modalRef.current) return;
    const canvas = await html2canvas(modalRef.current, {
      scale: 2,
      backgroundColor: "var(--background-color)",
    });
    const image = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = image;
    link.download = `${teacher.name}_Details.png`;
    link.click();
  };

  const getColor = (value) => {
    if (value >= 80) return "#52c41a";
    if (value >= 60) return "#faad14";
    return "#ff4d4f";
  };

  const attendanceValue = parseInt(teacher.attendance.replace("%", ""), 10);
  const attendanceColor = getColor(attendanceValue);

  const CardWrapper = ({ title, icon, children }) => (
    <Card
      title={
        <span
          style={{
            color: "var(--text-light-color)",
            display: "flex",
            alignItems: "center",
          }}
        >
          {icon && (
            <span
              style={{
                backgroundColor: `var(--primary-color)33`,
                borderRadius: "50%",
                width: 28,
                height: 28,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginRight: 8,
              }}
            >
              {icon}
            </span>
          )}
          {title}
        </span>
      }
      style={{
        background: "var(--card-background-color)",
        borderRadius: 10,
        border: `1px solid var(--border-color)`,
        color: "var(--text-light-color)",
        boxShadow: "0px 4px 12px rgba(0,0,0,0.15)",
        marginBottom: 16,
      }}
    >
      {children}
    </Card>
  );

  return (
    <Modal
      title={null}
      open={open}
      onCancel={onClose}
      footer={[
        <Button
          key="download"
          type="primary"
          icon={<DownloadOutlined />}
          onClick={downloadScreenshot}
          style={{
            backgroundColor: "var(--primary-color)",
            border: "none",
            transition: "all 0.3s ease",
          }}
          onMouseOver={(e) =>
            (e.currentTarget.style.background = "var(--accent-color)")
          }
          onMouseOut={(e) =>
            (e.currentTarget.style.background = "var(--primary-color)")
          }
        >
          Download Details
        </Button>,
      ]}
      width="85%"
      style={{
        maxWidth: "1000px",
        background: "var(--background-color)",
      }}
    >
      <div ref={modalRef}>
        <Typography.Title
          level={3}
          style={{
            color: "var(--text-light-color)",
            marginBottom: 24,
            textAlign: "center",
            borderBottom: `1px solid var(--border-color)`,
            paddingBottom: 12,
          }}
        >
          Teacher Details
        </Typography.Title>

        <Row gutter={[16, 16]} style={{ marginBottom: "16px" }}>
          <Col xs={24} md={10}>
            <div
              style={{
                borderLeft: `4px solid var(--accent-color)`,
                paddingLeft: 16,
              }}
            >
              <Typography.Title
                level={4}
                style={{
                  color: "var(--text-light-color)",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <PersonIcon style={{ marginRight: 10, color: "var(--accent-color)" }} />
                {teacher.name}
              </Typography.Title>
              <Typography.Paragraph style={{ color: "var(--subtext-light)" }}>
                <BookIcon style={{ marginRight: 10, color: "var(--primary-color)" }} />
                <strong>Subject:</strong> {teacher.subject}
              </Typography.Paragraph>
              <Typography.Paragraph style={{ color: "var(--subtext-light)" }}>
                <SchoolIcon
                  style={{ marginRight: 10, color: "var(--primary-color)" }}
                />
                <strong>Qualification:</strong> {teacher.qualification}
              </Typography.Paragraph>
              <Typography.Paragraph style={{ color: "var(--subtext-light)" }}>
                <EmailIcon
                  style={{ marginRight: 10, color: "var(--secondary-color)" }}
                />
                <strong>Email:</strong> {teacher.email}
              </Typography.Paragraph>
              <Typography.Paragraph style={{ color: "var(--subtext-light)" }}>
                <PhoneIcon
                  style={{ marginRight: 10, color: "var(--accent-color)" }}
                />
                <strong>Contact:</strong> {teacher.contact}
              </Typography.Paragraph>
              <Typography.Paragraph style={{ color: "var(--subtext-light)" }}>
                <ScheduleIcon
                  style={{ marginRight: 10, color: "var(--accent-color)" }}
                />
                <strong>Work Duration:</strong> {workDuration}
              </Typography.Paragraph>
            </div>
          </Col>

          <Col xs={12} md={7}>
            <CardWrapper title="Performance">
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  paddingTop: 12,
                }}
              >
                <Progress
                  type="circle"
                  percent={performanceScore}
                  strokeColor={{
                    "0%": "var(--primary-color)",
                    "100%": "var(--secondary-color)",
                  }}
                  trailColor="#1c3b5a"
                  format={() => (
                    <span style={{ color: "#ffffff", fontSize: "1.1rem" }}>
                      {performanceScore}%
                    </span>
                  )}
                />
              </div>
            </CardWrapper>
          </Col>

          <Col xs={12} md={7}>
            <CardWrapper title="Experience">
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  paddingTop: 12,
                }}
              >
                <Progress
                  type="circle"
                  percent={experienceProgress}
                  trailColor="#1c3b5a"
                  strokeColor="#4f8fe0"
                  format={() => (
                    <span style={{ color: "#ffffff", fontSize: "1.1rem" }}>
                      {experienceProgress} yrs
                    </span>
                  )}
                />
              </div>
            </CardWrapper>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <CardWrapper
              title="Attendance"
              icon={<AccessTimeIcon style={{ color: "var(--accent-color)" }} />}
            >
              <Progress
                percent={attendanceValue}
                status="active"
                strokeColor={attendanceColor}
              />
            </CardWrapper>
          </Col>

          <Col xs={24} md={12}>
            <CardWrapper
              title="Leave Details"
              icon={<EventIcon style={{ color: "var(--secondary-color)" }} />}
            >
              <Typography.Paragraph style={{ color: "var(--text-light-color)" }}>
                <strong>Leaves Taken:</strong> {teacher.leavesTaken}
              </Typography.Paragraph>
              <Typography.Paragraph style={{ color: "var(--text-light-color)" }}>
                <strong>Applied Leaves:</strong> {teacher.appliedLeaves}
              </Typography.Paragraph>
              <Typography.Paragraph style={{ color: "var(--text-light-color)" }}>
                <strong>Total Allowed:</strong> {teacher.totalLeavesAllowed}
              </Typography.Paragraph>
            </CardWrapper>
          </Col>
        </Row>

        <Divider style={{ borderColor: "var(--border-color)" }} />

        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <CardWrapper
              title="Achievements"
              icon={<EmojiEventsIcon style={{ color: "var(--accent-color)" }} />}
            >
              <List
                bordered
                dataSource={teacher.achievements}
                renderItem={(item) => (
                  <List.Item style={{ color: "var(--text-light-color)" }}>
                    <BeenhereIcon
                      style={{
                        marginRight: 8,
                        fontSize: "14px",
                        color: "var(--secondary-color)",
                      }}
                    />
                    {item}
                  </List.Item>
                )}
              />
            </CardWrapper>
          </Col>

          <Col xs={24} md={12}>
            <CardWrapper
              title="Workshops"
              icon={<SchoolIcon style={{ color: "var(--secondary-color)" }} />}
            >
              <List
                bordered
                dataSource={teacher.workshops}
                renderItem={(item) => (
                  <List.Item style={{ color: "var(--text-light-color)" }}>
                    <BeenhereIcon
                      style={{
                        marginRight: 8,
                        fontSize: "14px",
                        color: "var(--secondary-color)",
                      }}
                    />
                    {item}
                  </List.Item>
                )}
              />
            </CardWrapper>
          </Col>
        </Row>
      </div>
    </Modal>
  );
};

export default TeacherDetailsModal;
