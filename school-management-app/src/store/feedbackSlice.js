import { createSlice } from '@reduxjs/toolkit';
import { uploadImage } from '../services/feedbackService';

const initialState = {
  title: '',
  description: '',
  priority: 'medium',
  image: null,
  imagePreview: null,
  imageInfo: null,
  isUploading: false,
  uploadError: null,
  isSubmitting: false,
  message: { type: '', text: '' },
  uploadAttempts: 0,
  maxUploadAttempts: 3
};

export const feedbackSlice = createSlice({
  name: 'feedback',
  initialState,
  reducers: {
    // Form field reducers
    setTitle: (state, action) => {
      state.title = action.payload;
    },
    setDescription: (state, action) => {
      state.description = action.payload;
    },
    setPriority: (state, action) => {
      state.priority = action.payload;
    },
    
    // Image related reducers
    setImage: (state, action) => {
      state.image = action.payload;
    },
    setImagePreview: (state, action) => {
      state.imagePreview = action.payload;
    },
    setImageInfo: (state, action) => {
      state.imageInfo = action.payload;
    },
    setUploadError: (state, action) => {
      state.uploadError = action.payload;
    },
    
    // Loading states
    setUploading: (state, action) => {
      state.isUploading = action.payload;
    },
    setSubmitting: (state, action) => {
      state.isSubmitting = action.payload;
    },
    
    // Message reducer
    setMessage: (state, action) => {
      state.message = action.payload;
    },
    
    // Upload attempts
    incrementUploadAttempts: (state) => {
      state.uploadAttempts += 1;
    },
    resetUploadAttempts: (state) => {
      state.uploadAttempts = 0;
    },
    
    // Reset form
    resetForm: (state) => {
      state.title = '';
      state.description = '';
      state.priority = 'medium';
      state.image = null;
      state.imagePreview = null;
      state.imageInfo = null;
      state.isUploading = false;
      state.uploadError = null;
      state.isSubmitting = false;
      state.message = { type: '', text: '' };
      state.uploadAttempts = 0;
    },
    
    // Upload image with retry logic
    uploadImageStart: (state) => {
      state.isUploading = true;
      state.uploadError = null;
      state.message = { type: 'info', text: 'Uploading image...' };
    },
    uploadImageSuccess: (state, action) => {
      state.isUploading = false;
      state.imageInfo = action.payload;
      state.message = { type: 'success', text: 'Image uploaded successfully!' };
      state.uploadAttempts = 0;
    },
    uploadImageFailure: (state, action) => {
      state.isUploading = false;
      state.uploadError = action.payload;
      state.message = { type: 'error', text: `Failed to upload image. Attempt ${state.uploadAttempts}/${state.maxUploadAttempts}. ${action.payload}` };
    }
  }
});

export const {
  setTitle,
  setDescription,
  setPriority,
  setImage,
  setImagePreview,
  setImageInfo,
  setUploadError,
  setUploading,
  setSubmitting,
  setMessage,
  incrementUploadAttempts,
  resetUploadAttempts,
  resetForm,
  uploadImageStart,
  uploadImageSuccess,
  uploadImageFailure
} = feedbackSlice.actions;

// Async thunk for uploading image with retry logic
export const uploadImageWithRetry = (imageFile) => async (dispatch, getState) => {
  dispatch(uploadImageStart());
  
  const state = getState();
  let attempts = state.feedback.uploadAttempts;
  
 try {
    const response = await uploadImage(imageFile);
    dispatch(uploadImageSuccess(response.image));
    return response;
  } catch (error) {
    attempts++;
    dispatch(incrementUploadAttempts());
    
    if (attempts >= state.feedback.maxUploadAttempts) {
      dispatch(uploadImageFailure('Maximum retry attempts reached. Please try again later.'));
      throw error;
    } else {
      dispatch(uploadImageFailure(error.message));
      // Optionally add a delay before retry
      await new Promise(resolve => setTimeout(resolve, 1000 * attempts)); // Exponential backoff
      return dispatch(uploadImageWithRetry(imageFile));
    }
  }
};

// Selector functions
export const selectTitle = (state) => state.feedback.title;
export const selectDescription = (state) => state.feedback.description;
export const selectPriority = (state) => state.feedback.priority;
export const selectImage = (state) => state.feedback.image;
export const selectImagePreview = (state) => state.feedback.imagePreview;
export const selectImageInfo = (state) => state.feedback.imageInfo;
export const selectIsUploading = (state) => state.feedback.isUploading;
export const selectIsSubmitting = (state) => state.feedback.isSubmitting;
export const selectMessage = (state) => state.feedback.message;
export const selectUploadError = (state) => state.feedback.uploadError;
export const selectUploadAttempts = (state) => state.feedback.uploadAttempts;
export const selectMaxUploadAttempts = (state) => state.feedback.maxUploadAttempts;

export default feedbackSlice.reducer;
