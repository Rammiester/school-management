import React, { useRef, useState, useEffect } from "react";
import {
  Modal,
  Typography,
  List,
  Row,
  Col,
  Button,
  Progress,
  Tooltip,
  Select,
  Table,
} from "antd";
import {
  InfoCircleOutlined,
  HomeOutlined,
  PhoneOutlined,
  TrophyOutlined,
  DownloadOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import html2canvas from "html2canvas";
import StudentAttendanceGauge from "../../charts/AttendanceGauge";
import AcademicPerformanceChart from "../../charts/AcademicPerformanceChart";
import LOGO from "../../assets/logo.png";


const { Title, Paragraph, Text } = Typography;
const { Option } = Select;

const StudentDetailsModal = ({ visible, student, onClose }) => {
  const modalRef = useRef(null);
  const reportCardRef = useRef(null);
  const [progressValue, setProgressValue] = useState(0);
  const [selectedReportType, setSelectedReportType] = useState("Annually");
  const [selectedAcademicYear, setSelectedAcademicYear] = useState("2022");

  useEffect(() => {
    if (visible && student) {
      const finalScore = Math.round(
        (Number(student?.performanceScore || 0) +
          Number(student?.attendance?.replace("%", "") || 0)) /
        2
      );
      let currentProgress = 0;
      const interval = setInterval(() => {
        currentProgress += 2;
        setProgressValue(currentProgress);
        if (currentProgress >= finalScore) {
          clearInterval(interval);
          setProgressValue(finalScore);
        }
      }, 20);
      return () => clearInterval(interval);
    } else {
      setProgressValue(0);
    }
  }, [visible, student]);

  if (!student) return null;

  const filteredMarksData = () => {
    if (student.marks && typeof student.marks === 'object') {
      return Object.entries(student.marks).map(([year, score]) => ({
        year: year,
        score: score
      }));
    } else if (Array.isArray(student.marks)) {
      return student.marks.map(mark => ({
        year: mark.subject || mark.year,
        score: mark.score || mark.percentage || 0
      }));
    } else {
      return [];
    }
  };

  const filteredExamResults = Array.isArray(student.examResults)
    ? student.examResults.filter(
      (result) =>
        result.type === selectedReportType &&
        result.academicYear === selectedAcademicYear
    ).sort((a, b) => {
      return a.subject?.localeCompare(b.subject) || 0;
    })
    : [];

  const filteredTestReports = Array.isArray(student.testReports)
    ? student.testReports.filter(
      (report) =>
        report.type === selectedReportType &&
        report.academicYear === selectedAcademicYear
    )
    : [];

  const downloadScreenshot = async () => {
    if (!modalRef.current) return;
    const canvas = await html2canvas(modalRef.current, {
      scale: 2,
      backgroundColor: "#002247",
    });
    const image = canvas.toDataURL("image/jpeg", 1.0);
    const link = document.createElement("a");
    link.href = image;
    link.download = `${student.name}_Details.jpeg`;
    link.click();
  };

  const printReportCard = () => {
    if (!reportCardRef.current) return;
    const printWindow = window.open("", "", "width=900,height=700");

    const reportHTML = `
      <html>
        <head>
          <title>Report Card - ${student.name}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600&display=swap');

            body {
              font-family: 'Open Sans', sans-serif;
              background: #fff;
              margin: 0;
              padding: 0;
              color: #333;
            }

            .report-card-container {
              max-width: 700px;
              margin: 30px auto;
              padding: 20px;
              border: 2px solid var(--background-color);
              border-radius: 8px;
            }

            .report-card-header {
              background: var(--background-color);
              color: var(--text-light-color);
              padding: 16px;
              display: flex;
              align-items: center;
              justify-content: space-between;
              border-radius: 6px;
            }

            .school-info {
              text-align: left;
            }

            .school-name {
              font-size: 1.6rem;
              font-weight: 600;
              margin: 0;
            }

            .report-title {
              margin: 0;
              font-size: 1.1rem;
            }

            .report-card-header img {
              height: 60px;
            }

            .content-wrapper {
              margin-top: 20px;
            }

            .student-info {
              margin-bottom: 16px;
              border-bottom: 1px solid #ccc;
              padding-bottom: 12px;
            }

            .student-info h2 {
              margin: 0;
              font-size: 1.3rem;
              color: var(--accent-color);
            }

            .student-info p {
              margin: 4px 0;
              font-size: 0.95rem;
            }

            .exam-heading {
              text-align: center;
              margin-top: 20px;
              font-size: 1.2rem;
              color: var(--secondary-color);
              text-transform: uppercase;
              margin-bottom: 8px;
            }

            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
              font-size: 0.9rem;
            }
            th, td {
              border: 1px solid var(--card-primary);
              padding: 8px;
              text-align: center;
            }
            th {
              background: var(--modal-secondary-color);
              color: #000;
            }

            .overall-details {
              margin-top: 20px;
              display: flex;
              justify-content: space-between;
              flex-wrap: wrap;
            }
            .overall-details .column {
              width: 48%;
            }
            .detail-item {
              background: var(--card-primary);
              color: var(--text-light-color);
              padding: 12px;
              border-radius: 6px;
              margin-bottom: 10px;
              text-align: center;
            }
            .detail-item strong {
              display: block;
              margin-bottom: 4px;
            }

            .signatures {
              margin-top: 30px;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .signature-block {
              text-align: center;
              width: 30%;
            }
            .signature-block .line {
              margin-top: 40px;
              width: 100%;
              height: 1px;
              background: #ccc;
            }

            .footer-note {
              margin-top: 30px;
              text-align: center;
              font-size: 0.8rem;
              color: #666;
            }

            @media (max-width: 768px) {
              .overall-details .column {
                width: 100%;
                margin-bottom: 10px;
              }
              .signature-block {
                width: 30%;
              }
            }
          </style>
        </head>
        <body>
          <div class="report-card-container">
            <div class="report-card-header">
              <div class="school-info">
                <h5 class="school-name">SARASWATI RESIDENTIAL SCHOOL</h5>
                <p class="report-title">Comprehensive Report Card</p>
              </div>
              <img src="${LOGO}" alt="School Logo"/>
            </div>

            <div class="content-wrapper">
              <div class="student-info">
                <h2>${student.name}</h2>
                <p><strong>Grade:</strong> ${student.grade || "N/A"}</p>
                <p><strong>Academic Year:</strong> ${selectedAcademicYear}</p>
                <p><strong>Report Type:</strong> ${selectedReportType}</p>
              </div>

              <h3 class="exam-heading">Exam Performance</h3>
              ${filteredExamResults.length > 0
        ? `
                    <table>
                      <thead>
                        <tr>
                          <th>Subject</th>
                          <th>Marks Obtained</th>
                          <th>Total Marks</th>
                          <th>Percentage</th>
                          <th>Class Position</th>
                          <th>Section Position</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${filteredExamResults
          .map(
            (res) => `
                            <tr>
                              <td>${res.subject}</td>
                              <td>${res.marks}</td>
                              <td>${res.total}</td>
                              <td>${res.percentage}%</td>
                              <td>${res.classPosition}</td>
                              <td>${res.sectionPosition}</td>
                            </tr>
                          `
          )
          .join("")}
                      </tbody>
                    </table>
                  `
        : `
                    <p style="text-align:center; margin-top:20px; color:var(--accent-color);">
                      <span style="font-size:16px; margin-right:8px;">&#9888;</span>
                      No exam results available for the selected criteria.
                    </p>
                  `
      }

              <div class="overall-details">
                <div class="column">
                  <div class="detail-item">
                    <strong>Overall Percentage</strong>
                    ${student.overallPercentage || "N/A"}%
                  </div>
                  <div class="detail-item">
                    <strong>Position in Class</strong>
                    ${student.classPosition || "N/A"}
                  </div>
                </div>
                <div class="column">
                  <div class="detail-item">
                    <strong>Position in Section</strong>
                    ${student.sectionPosition || "N/A"}
                  </div>
                  <div class="detail-item">
                    <strong>School Perf. Range</strong>
                    ${student.schoolPerformanceRange || "N/A"}
                  </div>
                </div>
              </div>

              <div class="signatures">
                <div class="signature-block">
                  <div class="line"></div>
                  <p>Homeroom Teacher</p>
                </div>
                <div class="signature-block">
                  <div class="line"></div>
                  <p>Head of Campus</p>
                </div>
                <div class="signature-block">
                  <div class="line"></div>
                  <p>Student/Guardian</p>
                </div>
              </div>

              <div class="footer-note">
                Generated on ${new Date().toLocaleDateString()} | Keep working hard!
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(reportHTML);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  const fallback = (val) => (val || val === 0 ? val : "--");

  const columns = [
    {
      title: "Subject",
      dataIndex: "subject",
      key: "subject",
      fixed: 'left',
      render: (text) => <span>{fallback(text)}</span>,
    },
    {
      title: "Marks",
      dataIndex: "marks",
      key: "marks",
      render: (text) => <span>{fallback(text)}</span>,
    },
    {
      title: "Total",
      dataIndex: "total",
      key: "total",
      render: (text) => <span>{fallback(text)}</span>,
    },
    {
      title: "Percentage",
      dataIndex: "percentage",
      key: "percentage",
      render: (text) => <span>{fallback(text)}%</span>,
    },
    {
      title: "Class Pos.",
      dataIndex: "classPosition",
      key: "classPosition",
      render: (text) => <span>{fallback(text)}</span>,
    },
    {
      title: "Section Pos.",
      dataIndex: "sectionPosition",
      key: "sectionPosition",
      render: (text) => <span>{fallback(text)}</span>,
    },
  ];

  const getResponsiveStyles = () => ({
    modalBody: {
      background: "var(--background-color)",
      borderRadius: "16px",
      padding: "20px",
      minHeight: "100vh",
      maxHeight: "90vh",
      overflowY: "auto",
      '@media (min-width: 576px)': {
        padding: "25px",
      },
      '@media (min-width: 768px)': {
        padding: "30px",
      },
      '@media (min-width: 992px)': {
        padding: "35px",
      },
    },
    headerContainer: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 18,
      marginBottom: 14,
      borderBottom: `1px solid var(--border-color)`,
      paddingBottom: 18,
      width: "100%",
    },
    logo: {
      width: "100%",
      maxWidth: 180,
      height: "auto",
      objectFit: "contain",
      background: "var(--text-light-color)",
      padding: 8,
      borderRadius: 8,
    },
    headerText: {
      textAlign: "center",
      width: "100%",
      marginTop: 10,
    },
    title: {
      margin: "0 0 8px 0",
      color: "var(--text)",
      letterSpacing: 1,
      fontSize: "1.2rem",
      '@media (min-width: 576px)': {
        fontSize: "1.4rem",
      },
      '@media (min-width: 768px)': {
        fontSize: "1.6rem",
      },
    },
    uniqueId: {
      color: "var(--subtext-dark)",
      fontSize: "0.9rem",
      '@media (min-width: 576px)': {
        fontSize: "1rem",
      },
    },
    buttonContainer: {
      width: "100%",
      textAlign: "center",
      marginTop: 15,
      display: "flex",
      justifyContent: "center",
      gap: 10,
      flexWrap: "wrap",
      '@media (min-width: 576px)': {
        gap: 12,
      },
      '@media (min-width: 768px)': {
        gap: 15,
      },
    },
    softCard: {
      background: "var(--card-background-color)",
      borderRadius: 14,
      boxShadow: "var(--box-shadow-light)",
      padding: "16px",
      border: "none",
      marginBottom: 16,
      '@media (min-width: 576px)': {
        padding: "20px",
        marginBottom: 20,
      },
      '@media (min-width: 768px)': {
        padding: "24px",
        marginBottom: 24,
      },
    },
    chartContainer: {
      display: 'grid',
      gridTemplateColumns: '1fr',
      gap: '12px',
      marginBottom: '12px',
      '@media (min-width: 576px)': {
        gap: '14px',
      },
      '@media (min-width: 768px)': {
        gridTemplateColumns: '1fr 1fr',
        gap: '16px',
      },
      '@media (min-width: 992px)': {
        gap: '20px',
      },
    },
    chartCard: {
      background: "var(--card-background-color)",
      borderRadius: 14,
      boxShadow: "var(--box-shadow-light)",
      padding: 12,
      minHeight: 180,
      '@media (min-width: 576px)': {
        padding: 14,
        minHeight: 200,
      },
      '@media (min-width: 768px)': {
        padding: 16,
        minHeight: 210,
      },
    },
    chartTitle: {
      fontWeight: 600,
      fontSize: "0.9rem",
      color: "var(--text)",
      marginBottom: 10,
      '@media (min-width: 576px)': {
        fontSize: "1rem",
      },
      '@media (min-width: 768px)': {
        fontSize: "1.1rem",
      },
    },
    statsRow: {
      marginBottom: 16,
      '@media (min-width: 576px)': {
        marginBottom: 20,
      },
      '@media (min-width: 768px)': {
        marginBottom: 24,
      },
    },
    statsCard: {
      background: "var(--card-background-color)",
      borderRadius: 14,
      boxShadow: "var(--box-shadow-light)",
      padding: '12px',
      minHeight: 80,
      '@media (min-width: 576px)': {
        padding: '14px',
        minHeight: 85,
      },
      '@media (min-width: 768px)': {
        padding: '16px',
        minHeight: 90,
      },
    },
    statsLabel: {
      color: "var(--subtext-dark)",
      marginBottom: 6,
      display: "block",
      fontSize: "0.8rem",
      '@media (min-width: 576px)': {
        fontSize: "0.9rem",
        marginBottom: 8,
      },
    },
    statsValue: {
      fontWeight: 700,
      fontSize: "1rem",
      color: "var(--text)",
      '@media (min-width: 576px)': {
        fontSize: "1.1rem",
      },
      '@media (min-width: 768px)': {
        fontSize: "1.2rem",
      },
    },
    reportCardContainer: {
      background: "var(--card-background-color)",
      padding: 12,
      borderRadius: 14,
      display: "flex",
      alignItems: "center",
      gap: 12,
      marginBottom: 18,
      '@media (min-width: 576px)': {
        gap: 16,
        marginBottom: 20,
      },
      '@media (min-width: 768px)': {
        gap: 18,
        marginBottom: 22,
      },
    },
    reportCardLabel: {
      fontWeight: 500,
      color: "var(--subtext-dark)",
      fontSize: "0.9rem",
      '@media (min-width: 576px)': {
        fontSize: "1rem",
      },
    },
    select: {
      width: "90%",
      maxWidth: 280,
      '@media (min-width: 576px)': {
        width: "85%",
        maxWidth: 300,
      },
      '@media (min-width: 768px)': {
        width: "80%",
        maxWidth: 300,
      },
    },
    tableContainer: {
      background: "var(--text-light-color)",
      border: `1.5px solid var(--border-color)`,
      marginBottom: 16,
      borderRadius: 14,
      overflow: "hidden",
      '@media (min-width: 576px)': {
        marginBottom: 20,
      },
      '@media (min-width: 768px)': {
        marginBottom: 24,
      },
    },
    listCard: {
      background: "var(--card-background-color)",
      borderRadius: 14,
      boxShadow: "var(--box-shadow-light)",
      padding: "16px",
      '@media (min-width: 576px)': {
        padding: "18px",
      },
      '@media (min-width: 768px)': {
        padding: "20px",
      },
    },
    listTitle: {
      fontWeight: 600,
      fontSize: "0.9rem",
      color: "var(--text)",
      marginBottom: 8,
      '@media (min-width: 576px)': {
        fontSize: "1rem",
        marginBottom: 10,
      },
    },
    listStyle: {
      background: "var(--card-background-color)",
      borderRadius: 8,
      border: "none",
      boxShadow: "none",
      margin: 0,
      padding: "8px 0",
      '@media (min-width: 576px)': {
        padding: "10px 0",
      },
    },
    listItem: {
      padding: "6px 10px",
      border: "none",
      color: "var(--text)",
      fontSize: "0.8rem",
      '@media (min-width: 576px)': {
        padding: "7px 12px",
        fontSize: "0.9rem",
      },
      '@media (min-width: 768px)': {
        padding: "7px 13px",
        fontSize: "0.95rem",
      },
    },
  });

  const styles = getResponsiveStyles();

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null}
      width="95vw"
      maxWidth="900px"
      style={{ padding: 0 }}
      bodyStyle={styles.modalBody}
      closeIcon={
        <span style={{ fontSize: 20, color: "var(--subtext-dark)", fontWeight: 600 }}>
          ×
        </span>
      }
      destroyOnClose
      centered
    >
      <div
        ref={modalRef}
        style={{
          background: "var(--background-color)",
          borderRadius: "16px",
          minHeight: "100%",
        }}
      >
        <div style={styles.headerContainer}>
          <img
            src={LOGO}
            alt="School Logo"
            style={styles.logo}
          />
          <div style={styles.headerText}>
            <Title level={3} style={styles.title}>
              {student.name
                ? student.name.charAt(0).toUpperCase() + student.name.slice(1)
                : "--"}
            </Title>
            <Text style={styles.uniqueId}>
              Unique ID:{" "}
              <span style={{ color: "var(--primary-color)" }}>{fallback(student.uniqueId)}</span>
            </Text>
          </div>
          <div style={styles.buttonContainer}>
            <Button
              icon={<DownloadOutlined />}
              size="middle"
              onClick={downloadScreenshot}
            >
              Download JPEG
            </Button>
            <Button
              type="default"
              onClick={printReportCard}
            >
              Print Report Card
            </Button>
          </div>
        </div>

        <Row gutter={[12, 12]} style={{ marginBottom: 12 }}>
          <Col xs={24} md={12}>
            <div style={styles.softCard}>
              <Row gutter={[12, 12]}>
                <Col xs={24}>
                  <Paragraph style={{ marginBottom: 6, color: "var(--subtext-dark)", fontSize: "0.9rem" }}>
                    <InfoCircleOutlined style={{ marginRight: 7, color: "var(--primary-color)" }} />
                    <strong>Age:</strong> {fallback(student.age)}
                  </Paragraph>
                  <Paragraph style={{ marginBottom: 6, color: "var(--subtext-dark)", fontSize: "0.9rem" }}>
                    <TrophyOutlined style={{ marginRight: 7, color: "var(--accent-color)" }} />
                    <strong>Grade:</strong> {fallback(student.grade)}
                  </Paragraph>
                  <Paragraph style={{ marginBottom: 6, color: "var(--subtext-dark)", fontSize: "0.9rem" }}>
                    <HomeOutlined style={{ marginRight: 7, color: "var(--secondary-color)" }} />
                    <strong>Address:</strong> {fallback(student.address)}
                  </Paragraph>
                  <Paragraph style={{ marginBottom: 6, color: "var(--subtext-dark)", fontSize: "0.9rem" }}>
                    <InfoCircleOutlined style={{ marginRight: 7, color: "var(--primary-color)" }} />
                    <strong>DOB:</strong> {fallback(student.dob?.split('T')[0])}
                  </Paragraph>
                </Col>
                <Col xs={24}>
                  <Paragraph style={{ marginBottom: 6, color: "var(--subtext-dark)", fontSize: "0.9rem" }}>
                    <PhoneOutlined style={{ marginRight: 7, color: "var(--primary-color)" }} />
                    <strong>Contact:</strong> {fallback(student.contact)}
                  </Paragraph>
                  <Paragraph style={{ marginBottom: 6, color: "var(--subtext-dark)", fontSize: "0.9rem" }}>
                    <strong>Father Name:</strong> {fallback(student.fatherName)}
                  </Paragraph>
                  <Paragraph style={{ marginBottom: 6, color: "var(--subtext-dark)", fontSize: "0.9rem" }}>
                    <PhoneOutlined style={{ marginRight: 7, color: "var(--primary-color)" }} />
                    <strong>Parent Contact:</strong> {fallback(student.parentContact)}
                  </Paragraph>
                  <Paragraph style={{ marginBottom: 6, color: "var(--subtext-dark)", fontSize: "0.9rem" }}>
                    <strong>Blood Group:</strong> {fallback(student.bloodGroup)}
                  </Paragraph>
                </Col>
              </Row>
              <Paragraph style={{ color: "var(--subtext-dark)", marginTop: 8, fontSize: "0.9rem" }}>
                <strong>Remarks:</strong> {fallback(student.remarks)}
              </Paragraph>
            </div>
          </Col>
          <Col xs={24} md={12}>
            <div style={{...styles.chartContainer, height: "96%"}}>
              <div style={{ ...styles.softCard, height: "100%" }}>
                <div style={styles.chartTitle}>
                  Attendance
                </div>
                <StudentAttendanceGauge
                  attendance={student.attendance}
                  chartId="student-attendance-gauge"
                />
              </div>
            </div>
          </Col>
        </Row>
          <div style={styles.chartContainer}>
            <div style={styles.chartCard}>
              <div style={styles.chartTitle}>
                Academic Performance
              </div>
              <AcademicPerformanceChart data={filteredMarksData()} height="400px" />
            </div>
          </div>

        <Row gutter={[12, 12]} style={styles.statsRow}>
          <Col xs={24} sm={12} md={6}>
            <div style={styles.statsCard}>
              <Text style={styles.statsLabel}>
                Admission Year
              </Text>
              <div style={styles.statsValue}>
                {fallback(student.admissionYear)}
              </div>
            </div>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <div style={styles.statsCard}>
              <Text style={styles.statsLabel}>
                Section
              </Text>
              <div style={styles.statsValue}>
                {fallback(student.section)}
              </div>
            </div>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <div style={styles.statsCard}>
              <Text style={styles.statsLabel}>
                Gender
              </Text>
              <div style={styles.statsValue}>
                {fallback(student.gender)}
              </div>
            </div>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <div style={styles.statsCard}>
              <Text style={styles.statsLabel}>
                Email
              </Text>
              <div style={styles.statsValue}>
                {fallback(student.email)}
              </div>
            </div>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <div style={styles.statsCard}>
              <Text style={styles.statsLabel}>
                Roll Number
              </Text>
              <div style={styles.statsValue}>
                {fallback(student.rollNumber)}
              </div>
            </div>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <div style={styles.statsCard}>
              <Text style={styles.statsLabel}>
                Admission ID
              </Text>
              <div style={styles.statsValue}>
                {fallback(student.admissionId)}
              </div>
            </div>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <div style={styles.statsCard}>
              <Text style={styles.statsLabel}>
                City Code
              </Text>
              <div style={styles.statsValue}>
                {fallback(student.cityCode)}
              </div>
            </div>
          </Col>
        </Row>

        <Row gutter={[12, 12]} style={styles.reportCardContainer}>
          <Col xs={24} sm={24} md={8} lg={8}>
            <Text style={styles.reportCardLabel}>
              Report Card:
            </Text>
            <Select
              value={selectedReportType}
              style={styles.select}
              onChange={setSelectedReportType}
            >
              <Option value="Quarterly">Quarterly</Option>
              <Option value="Half Yearly">Half Yearly</Option>
              <Option value="Annually">Annually</Option>
            </Select>
          </Col>
          <Col xs={24} sm={24} md={8} lg={8}>
            <Text style={{ ...styles.reportCardLabel, marginTop: 12 }}>
              Academic Year:
            </Text>
            <Select
              value={selectedAcademicYear}
              style={styles.select}
              onChange={setSelectedAcademicYear}
            >
              <Option value="2019">2019</Option>
              <Option value="2020">2020</Option>
              <Option value="2021">2021</Option>
              <Option value="2022">2022</Option>
            </Select>
          </Col>
        </Row>

        <div
          ref={reportCardRef}
          style={styles.tableContainer}
        >
          <Table
            columns={columns}
            dataSource={filteredExamResults}
            scroll={{ x: 600 }}
            className="timetable-table"
            pagination={false}
            size="small"
          />
        </div>

        <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
          <Col xs={24} md={8}>
            <div style={styles.listCard}>
              <div style={styles.listTitle}>
                Test Reports
              </div>
              <List
                dataSource={filteredTestReports && filteredTestReports.length > 0 ? filteredTestReports : [{ subject: "--", score: "--" }]}
                style={styles.listStyle}
                renderItem={(report, idx) => (
                  <List.Item key={idx} style={{ ...styles.listItem, color: "var(--text)" }}>
                    <InfoCircleOutlined style={{ color: "var(--primary-color)", marginRight: 6, fontSize: "0.8rem" }} />
                    <span>{fallback(report.subject)}: {fallback(report.score)}</span>
                  </List.Item>
                )}
              />
            </div>
          </Col>
          <Col xs={24} md={8}>
            <div style={styles.listCard}>
              <div style={styles.listTitle}>
                Complaints
              </div>
              <List
                dataSource={student.complaints && student.complaints.length > 0 ? student.complaints : ["No complaints"]}
                style={styles.listStyle}
                renderItem={(complaint, idx) => (
                  <List.Item key={idx} style={{ ...styles.listItem, color: "var(--secondary-color)" }}>
                    <WarningOutlined style={{ color: "var(--secondary-color)", marginRight: 6, fontSize: "0.8rem" }} />
                    {complaint}
                  </List.Item>
                )}
              />
            </div>
          </Col>
          <Col xs={24} md={8}>
            <div style={styles.listCard}>
              <div style={styles.listTitle}>
                Awards
              </div>
              <List
                dataSource={student.awards && student.awards.length > 0 ? student.awards : ["No awards"]}
                style={styles.listStyle}
                renderItem={(award, idx) => (
                  <List.Item key={idx} style={{ ...styles.listItem, color: "var(--accent-color)" }}>
                    <TrophyOutlined style={{ color: "var(--accent-color)", marginRight: 6, fontSize: "0.8rem" }} />
                    {award}
                  </List.Item>
                )}
              />
            </div>
          </Col>
        </Row>
      </div>
    </Modal>
  );
};

export default StudentDetailsModal;
