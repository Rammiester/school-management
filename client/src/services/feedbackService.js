// src/services/feedbackService.js

import api from '../api';

export const uploadFeedback = async (formData) => {
  try {
    console.log('Sending feedback data:', {
      title: formData.get('title'),
      description: formData.get('description'),
      priority: formData.get('priority'),
      image: formData.get('image')
    });
    
    const response = await api.post('/api/feedback', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Feedback upload error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.error || 'Failed to submit feedback');
  }
};

export const uploadImage = async (imageFile) => {
  try {
    const formData = new FormData();
    formData.append('image', imageFile);
    
    const response = await api.post('/api/images/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    console.log('Image upload response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Image upload error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.error || 'Failed to upload image');
  }
};

export const fetchFeedback = async (params = {}) => {
  try {
    const response = await api.get('/api/feedback', { params });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to fetch feedback');
  }
};

export const updateFeedbackStatus = async (feedbackId, status) => {
  try {
    const response = await api.put(`/api/feedback/${feedbackId}/status`, { status });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to update feedback status');
  }
};

export const updateFeedbackPriority = async (feedbackId, priority) => {
  try {
    const response = await api.put(`/api/feedback/${feedbackId}/priority`, { priority });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to update feedback priority');
  }
};
