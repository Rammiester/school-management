import axios from 'axios';

export const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: BASE_URL,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const getUsers = () => api.get('/api/users/atendencelist');
export const getAttendance = (userId) =>
  api.get(`/api/attendance/user/${userId}`);
export const getStudentAttendance = (studentId) =>
  api.get(`/api/attendance/student/${studentId}`);
export const getAttendanceByDate = (date) =>
  api.get(`/api/attendance/all/${date}`);
export const getAttendanceByDateRange = (start, end) =>
  api.get('/api/attendance/range', { params: { start, end } });
export const checkIn = (userId) =>
  api.post('/api/attendance/checkin', { userId });
export const checkOut = (userId) =>
  api.post('/api/attendance/checkout', { userId });
export const studentCheckIn = (studentId) =>
  api.post('/api/attendance/student/checkin', { studentId });
export const studentCheckOut = (studentId) =>
  api.post('/api/attendance/student/checkout', { studentId });
export const biometricCheckIn = (userId, biometricId, biometricType, deviceInfo) =>
  api.post('/api/attendance/biometric/checkin', { userId, biometricId, biometricType, deviceInfo });
export const biometricCheckOut = (userId, biometricId, deviceInfo) =>
  api.post('/api/attendance/biometric/checkout', { userId, biometricId, deviceInfo });
export const studentBiometricCheckIn = (studentId, biometricType, deviceInfo) =>
  api.post('/api/attendance/student/biometric/checkin', { studentId, biometricType, deviceInfo });
export const studentBiometricCheckOut = (studentId, biometricId, deviceInfo) =>
  api.post('/api/attendance/student/biometric/checkout', { studentId, biometricId, deviceInfo });
export const bulkStudentAttendance = (data) => api.post('/api/attendance/student/bulk', data);
export const getTimetableClasses = () => api.get('/api/timetable');
export const getTimetableForClass = (className) => api.get(`/api/timetable/${className}`);
export const createTimetableForClass = (className, schedule) => api.post(`/api/timetable/${className}`, { schedule });
export const updateTimetableForClass = (className, day, schedule) => api.put(`/api/timetable/${className}/${day}`, { schedule });
export const updateTimetableEntry = (className, day, time, teacher) => api.put(`/api/timetable/${className}/${day}`, { time, teacher });
export const updateUser = (userId, userData) => api.put(`/api/users/${userId}`, userData);
export const deleteTimetableForClass = (className) => api.delete(`/api/timetable/${className}`);

export const getAvailableTeachersForPeriod = (day, timeSlot) => api.get('/api/users/available', { params: { role: 'teacher', day, timeSlot } });
export const checkUserAvailability = (userId, date, timeSlot) => api.post('/api/users/availability/check', { userId, date, timeSlot });
export const getUserAvailability = (userId) => api.get(`/api/users/availability/${userId}`);

export const getFinanceSummary = (startDate, endDate, requestType) => {
  const params = { startDate, endDate };
  if (requestType) params.requestType = requestType;
  return api.get('/api/finance/summary', { params });
};

export const getRevenueExpenseData = (startDate, endDate, requestType) => {
  const params = { startDate, endDate };
  if (requestType) params.requestType = requestType;
  return api.get('/api/finance/revenue-expense', { params });
};

export const getRevenueBreakdown = (startDate, endDate, requestType) => {
  const params = { startDate, endDate };
  if (requestType) params.requestType = requestType;
  return api.get('/api/finance/revenue-breakdown', { params });
};

export const getExpenseBreakdown = (startDate, endDate, requestType) => {
  const params = { startDate, endDate };
  if (requestType) params.requestType = requestType;
  return api.get('/api/finance/expense-breakdown', { params });
};

export const getFinanceByRequestTypeAndStatus = (startDate, endDate, requestType, status, type) => {
  const params = {};
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;
  if (requestType) params.requestType = requestType;
  if (status) params.status = status;
  if (type) params.type = type;
  return api.get('/api/finance/by-request-type-and-status', { params });
};

export const getRequestTypeAnalysisMonthly = (startDate, endDate, requestType, type) => {
  const params = {};
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;
  if (requestType) params.requestType = requestType;
  if (type) params.type = type;
  return api.get('/api/finance/request-type-analysis-monthly', { params });
};

export const getRequestTypeComparison = (startDate, endDate, requestType) => {
  const params = {};
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;
  if (requestType) params.requestType = requestType;
  return api.get('/api/finance/request-type-comparison', { params });
};

export const getAdvancedRequestTypeFilter = (startDate, endDate, requestType, status, type, recipient) => {
  const params = {};
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;
  if (requestType) params.requestType = requestType;
  if (status) params.status = status;
  if (type) params.type = type;
  if (recipient) params.recipient = recipient;
  return api.get('/api/finance/advanced-request-type-filter', { params });
};

export const getFinanceByUserRecipient = (startDate, endDate, recipient, requestType) => {
  const params = {};
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;
  if (recipient) params.recipient = recipient;
  if (requestType) params.requestType = requestType;
  return api.get('/api/finance/by-user-recipient', { params });
};


export const getHolidays = () => api.get('/api/holidays');
export const addHoliday = (holidayData) => api.post('/api/holidays', holidayData);
export const deleteHoliday = (id) => api.delete(`/api/holidays/${id}`);
export const getUsersWithoutLeave = () => api.get('/api/holidays/users-without-leave');
export const applyForLeave = (leaveData) => api.post('/api/holidays/leave', leaveData);
export const getLeaveRequests = () => api.get('/api/holidays/leave');
export const getLeaveRequestsForUser = (userId) => api.get(`/api/holidays/leave/user/${userId}`);
export const updateLeaveStatus = (id, status) => api.put(`/api/holidays/leave/${id}`, { status });

export const generateBills = (data) => api.post('/api/billing/generate', data);
export const getBills = (params) => api.get('/api/billing', { params });
export const updateBillStatus = (id, status, modeOfPayment) => api.put(`/api/billing/${id}/status`, { status, modeOfPayment });
export const getBillingSummary = (params) => api.get('/api/billing/summary', { params });
export const exportBills = (params) => {
  const url = new URL(`${BASE_URL}/api/billing/export`);
  Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
  window.open(url, '_blank');
};

// Billing Template API functions
export const createBillingTemplate = (templateData) => api.post('/api/billing-templates', templateData);
export const getBillingTemplates = () => api.get('/api/billing-templates');
export const updateBillingTemplate = (id, templateData) => api.put(`/api/billing-templates/${id}`, templateData);
export const deleteBillingTemplate = (id) => api.delete(`/api/billing-templates/${id}`);
export const generateBillsFromTemplate = (data) => api.post('/api/template/generate-from-template', data);

export const getStudentsByGrade = (grade) => api.get(`/api/students/grade/${grade}`);
export const getStudentsWithRollNumbers = (grade) => api.get(`/api/students/grade/${grade}/students-with-roll`);
export const getStudentByGradeAndRollNumber = (grade, rollNumber) => 
  api.get(`/api/students/grade/${grade}/rollnumber/${rollNumber}`);
export const getStudentByGradeAndName = (grade, name) => 
  api.get(`/api/students/grade/${grade}/name/${name}`);

export const assignRollNumbers = () => api.post('/api/students/assign-roll-numbers');
export const scheduleRollNumbers = (date) => api.post('/api/students/schedule-roll-numbers', { date });
export const getScheduledRollNumberDate = () => api.get('/api/students/schedule-roll-numbers');
export const cancelScheduledRollNumbers = () => api.delete('/api/students/schedule-roll-numbers');

// Class payment API functions
export const getClassesWithPayments = () => api.get('/api/class-payments/classes-payments');
export const updateClassPayment = (classId, payments) => api.put(`/api/class-payments/classes-payments/${classId}`, { payments });
export const addDepartmentToClass = (classId, department, amount) => api.post(`/api/class-payments/classes-payments/${classId}/departments`, { department, amount });
export const removeDepartmentFromClass = (classId, department) => api.delete(`/api/class-payments/classes-payments/${classId}/departments/${department}`);
export const getDepartments = () => api.get('/api/departments');

// Notice API functions
export const getNoticesByDate = (date) => api.get('/api/notices/by-date', { params: { date } });

export const appDefaults = {
  api: {
    baseURL: BASE_URL,
    DashboardStats: `${BASE_URL}/api/dashboard`,
    Earnings: `${BASE_URL}/api/earnings`,
    Students: `${BASE_URL}/api/students`,
    Notices: `${BASE_URL}/api/notices`,
    Events: `${BASE_URL}/api/events`,
    Finance: `${BASE_URL}/api/finance`,
  },
};

export const fetchPendingRequests = async () => {
  try {
    const response = await api.get('/api/earnings/pending-earnings');
    return response.data;
  } catch (error) {
    console.error('Error fetching pending requests:', error);
    throw error;
  }
};
export default api;
