//index.js (main server entrypoint)

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

const usersRouter = require("./routes/users");
const studentsRouter = require("./routes/students");
const eventsRouter = require("./routes/events");
const noticesRouter = require("./routes/notices");
const earningsRouter = require("./routes/earnings");
const dashboardRouter = require("./routes/dashboard");
const attendanceRouter = require("./routes/attendance");
const timetableRouter = require("./routes/timetable");
const financeRouter = require("./routes/finance");
const financeRequestsRouter = require("./routes/financeRequests");
const holidaysRouter = require("./routes/holidays");
const billingRouter = require("./routes/billing");
const billingTemplatesRouter = require("./routes/billingTemplates");
const classPaymentsRouter = require("./routes/classPayments");
const feedbackRouter = require("./routes/feedback");
const imageUploadRouter = require("./routes/imageUpload");
const generateFromTemplateRouter = require("./routes/generateFromTemplate");
const departmentsRouter = require("./routes/departments");

// Scheduled jobs
require('./jobs/paymentReminders');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Serve React app in production (if build exists)
try {
  const buildPath = path.join(__dirname, 'build');
  if (require('fs').existsSync(buildPath)) {
    app.use(express.static(buildPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(buildPath, 'index.html'));
    });
  }
} catch (error) {
  console.log('Build directory not found or error serving static files:', error);
}

mongoose
  .connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 360000,
    socketTimeoutMS: 360000,
    maxPoolSize: 10,
    minPoolSize: 5,
    maxIdleTimeMS: 300000,
    heartbeatFrequencyMS: 10000,
    retryWrites: true,
    w: 'majority',
    readPreference: 'primaryPreferred',
    connectTimeoutMS: 30000,
    authSource: 'admin'
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.use("/api/users", usersRouter);
app.use("/api/students", studentsRouter);
app.use("/api/events", eventsRouter);
app.use("/api/notices", noticesRouter);
app.use("/api/earnings", earningsRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/attendance", attendanceRouter);
app.use("/api/timetable", timetableRouter);
app.use("/api/finance", financeRouter);
app.use("/api/finance-requests", financeRequestsRouter);
app.use("/api/holidays", holidaysRouter);
app.use("/api/billing", billingRouter);
app.use("/api/billing-templates", billingTemplatesRouter);
app.use("/api/class-payments", classPaymentsRouter);
app.use("/api/feedback", feedbackRouter);
app.use("/api/images", imageUploadRouter);
app.use("/api/template", generateFromTemplateRouter);
app.use("/api/departments", departmentsRouter);

app.get("/", (_req, res) => {
  res.send({ message: "API is up and running!" });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
