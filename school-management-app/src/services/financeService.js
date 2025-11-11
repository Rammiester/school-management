//services/financeService.js
import api from '../api';

export const createFinanceRequest = async (requestData) => {
  try {
    const response = await api.post('/api/earnings', requestData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getAllFinanceRequests = async (page = 1, limit = 10, filters = {}) => {
  try {
    // Ensure page and limit are always included in params for consistency
    const params = { 
      page, 
      limit, 
      ...filters 
    };
    
    // Ensure we're using the correct endpoint that matches backend
    const response = await api.get('/api/earnings', {
      params
    });
    
    // Handle different response structures from backend
    if (response.data && response.data.success && response.data.data && response.data.pagination) {
      // New structured response from backend
      return response.data;
    } else if (response.data && Array.isArray(response.data)) {
      // Old array response
      return {
        data: response.data,
        pagination: {
          page: page,
          limit: limit,
          total: response.data.length
        }
      };
    } else if (response.data && response.data.data) {
      // Another possible structure
      return {
        data: response.data.data,
        pagination: response.data.pagination || {
          page: page,
          limit: limit,
          total: response.data.data.length || 0
        }
      };
    } else {
      // Fallback
      return {
        data: [],
        pagination: {
          page: page,
          limit: limit,
          total: 0
        }
      };
    }
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getPendingRequests = async () => {
  try {
    const response = await api.get('/api/earnings/pending-earnings');
    // Ensure we return the data properly, handling both array and object responses
    if (response.data && Array.isArray(response.data)) {
      return response.data;
    } else if (response.data && response.data.data) {
      return response.data.data;
    } else {
      return [];
    }
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const deleteFinanceRequest = async (id) => {
  try {
    const response = await api.delete(`/api/earnings/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const reviewRequest = async (id, status, reviewNotes = '') => {
  try {
    let url;
    if (status === 'approved') {
      url = `/api/earnings/${id}/approve`;
    } else {
      url = `/api/earnings/${id}/decline`;
    }
    
    const response = await api.patch(url, { status, reviewNotes });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getFinanceStats = async () => {
  try {
    // Since we're using earnings as the main model, we'll return stats based on earnings
    const response = await api.get('/api/earnings');
    const earnings = response.data;
    
    const totalRevenue = earnings
      .filter(e => e.type === 'revenue')
      .reduce((sum, e) => sum + e.earnings, 0);
    
    const totalExpense = earnings
      .filter(e => e.type === 'expense')
      .reduce((sum, e) => sum + e.earnings, 0);
    
    const netBalance = totalRevenue - totalExpense;
    const pendingRequests = earnings.filter(e => e.status === 'pending').length;
    
    return {
      success: true,
      data: {
        totalRevenue,
        totalExpense,
        netBalance,
        pendingRequests
      }
    };
  } catch (error) {
    throw error.response?.data || error;
  }
};

// New improved functions based on the API structure from dashboardService.js
export const getFinanceSummary = async (startDate, endDate, params) => {
  try {
    const response = await api.get('/api/finance/summary', {
      params: { startDate, endDate, ...params }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getRevenueExpenseData = async (startDate, endDate, params) => {
  try {
    const response = await api.get('/api/finance/revenue-expense', {
      params: { startDate, endDate, ...params }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getRevenueBreakdown = async (startDate, endDate, params) => {
  try {
    const response = await api.get('/api/finance/revenue-breakdown', {
      params: { startDate, endDate, ...params }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getExpenseBreakdown = async (startDate, endDate, params) => {
  try {
    const response = await api.get('/api/finance/expense-breakdown', {
      params: { startDate, endDate, ...params }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const searchUsers = async (searchTerm) => {
  try {
    const response = await api.get(`/api/users/search?q=${searchTerm}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const searchStudents = async (searchTerm) => {
  try {
    const response = await api.get(`/api/students/search?q=${searchTerm}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// New service function to get all users
export const getAllUsers = async () => {
  try {
    const response = await api.get('/api/users');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Additional finance-specific functions
export const getEarningsByType = async (type) => {
  try {
    const response = await api.get(`/api/earnings?type=${type}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getEarningsByDateRange = async (startDate, endDate) => {
  try {
    const response = await api.get('/api/earnings/range', {
      params: { startDate, endDate }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// New service methods for filtered data retrieval
export const getFinanceByRequestTypeAndStatus = async (startDate, endDate, requestType, status, type) => {
  try {
    const response = await api.get('/api/finance/by-request-type-and-status', {
      params: { startDate, endDate, requestType, status, type }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getRequestTypeAnalysisMonthly = async (startDate, endDate, requestType, type) => {
  try {
    const response = await api.get('/api/finance/request-type-analysis-monthly', {
      params: { startDate, endDate, requestType, type }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getRequestTypeComparison = async (startDate, endDate, requestType) => {
  try {
    const response = await api.get('/api/finance/request-type-comparison', {
      params: { startDate, endDate, requestType }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getAdvancedRequestTypeFilter = async (startDate, endDate, requestType, status, type, recipient) => {
  try {
    const response = await api.get('/api/finance/advanced-request-type-filter', {
      params: { startDate, endDate, requestType, status, type, recipient }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getFinanceByUserRecipient = async (startDate, endDate, recipient, requestType) => {
  try {
    const response = await api.get('/api/finance/by-user-recipient', {
      params: { startDate, endDate, recipient, requestType }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Service method for caching frequently accessed filtered data
export const getCachedFinanceData = async (cacheKey, fetchFunction) => {
  try {
    // In a real implementation, this would check cache first
    const result = await fetchFunction();
    return result;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Service method with proper error handling and logging
export const getFinanceDataWithLogging = async (endpoint, params) => {
  try {
    const response = await api.get(endpoint, { params });
    return response.data;
  } catch (error) {
    console.error(`Error fetching data from ${endpoint}:`, error);
    throw error.response?.data || error;
  }
};
