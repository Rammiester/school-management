// src/services/dashboardServices.js

import axios from "axios";
import { appDefaults } from "../api/index.js";

const getToken = () => {
  return localStorage.getItem("token"); 
};
export const fetchDashboardStats = async (role) => {
  const { data } = await axios.post(appDefaults.api.DashboardStats, { role });
  return data;
};


export const submitRevenue = async (payload) => {
  const { data } = await axios.post(appDefaults.api.Earnings, payload);
  return data;
};

export const fetchMyPendingRevenues = (adminEmail) => {
  return axios
    .get(`${appDefaults.api.Earnings}?createdBy=${adminEmail}&status=pending`)
    .then((r) => r.data);
};

export const getSuggestedStudentId = async (cityCode, year) => {
  const { data } = await axios.get(
    `${appDefaults.api.Students}/suggest-id?cityCode=${cityCode}&year=${year}`
  );
  return data.suggestedId;
};

export const saveStudent = async (studentData) => {
  const { data } = await axios.post(appDefaults.api.Students, studentData);
  return data;
};

export const fetchPendingEarnings = (filters = {}) =>
  axios
    .get(`${appDefaults.api.Earnings}/pending`, { params: filters })
    .then((r) => r.data);

export const fetchNotifications = async (user) => {
  if (!user) return [];
  let url = "";
  if (user.role === "chairman") {
    url = `${appDefaults.api.Earnings}/pending`;
  } else {
    url = `${appDefaults.api.Earnings}/my-requests?email=${user.email}`;
  }
  const { data } = await axios.get(url);
  return Array.isArray(data) ? data : [];
};

export const approveEarning = (id, approvedBy) =>
  axios
    .patch(`${appDefaults.api.Earnings}/${id}/approve`, { approvedBy })
    .then((r) => r.data);

export const declineEarning = (id, declinedBy, declineReason) =>
  axios
    .patch(`${appDefaults.api.Earnings}/${id}/decline`, { declinedBy, declineReason })
    .then((r) => r.data);

export const approveAllEarnings = (approvedBy) =>
  axios
    .patch(`${appDefaults.api.Earnings}/bulk-approve`, { approvedBy })
    .then((r) => r.data);

export const declineAllEarnings = (declinedBy, declineReason) =>
  axios
    .patch(`${appDefaults.api.Earnings}/bulk-decline`, { declinedBy, declineReason })
    .then((r) => r.data);

export const markNotificationRead = (id, read) =>
  axios.patch(`${appDefaults.api.Earnings}/${id}/mark-read`, { read });

export const fetchAllStudents = async () => {
  const { data } = await axios.get(appDefaults.api.Students);
  return Array.isArray(data) ? data : data.students || [];
};

export const fetchStudentsWithPagination = async (page = 1, limit = 10, sortField = null, sortOrder = null) => {
  const params = { page, limit };
  
  if (sortField && sortOrder) {
    if (Array.isArray(sortField) && Array.isArray(sortOrder)) {
      if (sortField.length > 0 && sortOrder.length > 0) {
        params.sortField = sortField.join(',');
        params.sortOrder = sortOrder.join(',');
      }
    } else if (!Array.isArray(sortField) && !Array.isArray(sortOrder)) {
      if (sortField && sortOrder) {
        params.sortField = sortField;
        params.sortOrder = sortOrder;
      }
    } else {
      const fields = Array.isArray(sortField) ? sortField : [sortField];
      const orders = Array.isArray(sortOrder) ? sortOrder : [sortOrder];
      params.sortField = fields.join(',');
      params.sortOrder = orders.join(',');
    }
  }
  
  const { data } = await axios.get(appDefaults.api.Students, { params });
  return data;
};

export const searchStudents = async (query, sortField = null, sortOrder = null) => {
  const params = { q: query };
  
  if (sortField && sortOrder) {
    if (Array.isArray(sortField) && Array.isArray(sortOrder)) {
      if (sortField.length > 0 && sortOrder.length > 0) {
        params.sortField = sortField.join(',');
        params.sortOrder = sortOrder.join(',');
      }
    } else if (!Array.isArray(sortField) && !Array.isArray(sortOrder)) {
      if (sortField && sortOrder) {
        params.sortField = sortField;
        params.sortOrder = sortOrder;
      }
    } else {
      const fields = Array.isArray(sortField) ? sortField : [sortField];
      const orders = Array.isArray(sortOrder) ? sortOrder : [sortOrder];
      params.sortField = fields.join(',');
      params.sortOrder = orders.join(',');
    }
  }
  
  const { data } = await axios.get(`${appDefaults.api.Students}/search`, { params });
  return data;
};

export const fetchGenderDistribution = async () => {
  const { data } = await axios.get(`${appDefaults.api.Students}/gender-distribution`);
  return data;
};

export const fetchExamResults = async () => {
  const { data } = await axios.get(`${appDefaults.api.Students}/exam-results`);
  return data;
};

export const createNotice = async (noticeData) => {
  const { data } = await axios.post(appDefaults.api.Notices, noticeData);
  return data;
};

export const fetchPendingUsers = async () => {
  const token = getToken();
  const { data } = await axios.get(`${appDefaults.api.baseURL}/api/users/pending`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
};

export const approveUser = async (userId, role) => {
  const token = getToken();
  const { data } = await axios.put(
    `${appDefaults.api.baseURL}/api/users/approve/${userId}`,
    { role },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return data;
};

export const rejectUser = async (userId) => {
  const token = getToken();
  const { data } = await axios.delete(
    `${appDefaults.api.baseURL}/api/users/${userId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return data;
};

export const registerUser = async (userData) => {
  const token = getToken();
  const { data } = await axios.post(
    `${appDefaults.api.baseURL}/api/users`,
    userData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return data;
};

export const assignRollNumbers = async () => {
  const token = getToken();
  const { data } = await axios.post(
    `${appDefaults.api.baseURL}/api/students/assign-roll-numbers`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return data;
};

// Also export the API function directly for consistency
export { assignRollNumbers as assignRollNumbersAPI };
