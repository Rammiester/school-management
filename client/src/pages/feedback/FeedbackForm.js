import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { uploadFeedback } from '../../services/feedbackService';
import { uploadImageWithRetry } from '../../store/feedbackSlice';
import BackButton from '../../components/BackButton';
import {
  setTitle,
  setDescription,
  setPriority,
  setImage,
  setImagePreview,
  setImageInfo,
  setUploadError,
  setSubmitting,
  setMessage,
  resetForm,
  resetUploadAttempts
} from '../../store/feedbackSlice';
import {
  selectTitle,
  selectDescription,
  selectPriority,
  selectImage,
  selectImagePreview,
  selectImageInfo,
  selectIsUploading,
  selectIsSubmitting,
  selectMessage,
  selectUploadError,
  selectUploadAttempts,
  selectMaxUploadAttempts
} from '../../store/feedbackSlice';
import './FeedbackForm.css';

const FeedbackForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Get state from Redux store
  const title = useSelector(selectTitle);
  const description = useSelector(selectDescription);
  const priority = useSelector(selectPriority);
  const image = useSelector(selectImage);
  const imagePreview = useSelector(selectImagePreview);
  const imageInfo = useSelector(selectImageInfo);
  const isUploading = useSelector(selectIsUploading);
  const isSubmitting = useSelector(selectIsSubmitting);
  const message = useSelector(selectMessage);
  const uploadError = useSelector(selectUploadError);
  const uploadAttempts = useSelector(selectUploadAttempts);
  const maxUploadAttempts = useSelector(selectMaxUploadAttempts);

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        dispatch(setMessage({ type: 'error', text: 'Please select a valid image file (JPEG, PNG, etc.)' }));
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        dispatch(setMessage({ type: 'error', text: 'File size exceeds 5MB limit' }));
        return;
      }

      dispatch(setImage(file));
      const reader = new FileReader();
      reader.onloadend = () => {
        dispatch(setImagePreview(reader.result));
        dispatch(setMessage({ type: '', text: '' }));
        dispatch(resetUploadAttempts());

        // Automatically upload the image when selected
        uploadImageImmediately(file);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImageImmediately = async (file) => {
    try {
      await dispatch(uploadImageWithRetry(file));
    } catch (error) {
      console.error('Image upload failed after retries:', error);
    }
  };

  const handleRetryUpload = async () => {
    if (image) {
      dispatch(setMessage({ type: 'info', text: 'Retrying upload...' }));
      dispatch(resetUploadAttempts());
      await uploadImageImmediately(image);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(setSubmitting(true));
    dispatch(setMessage({ type: '', text: '' }));

    try {
      // Create form data for feedback submission
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('priority', priority);

      // Include image info if available
      if (imageInfo) {
        formData.append('image', JSON.stringify(imageInfo));
      }

      await uploadFeedback(formData);
      dispatch(setMessage({ type: 'success', text: 'Feedback submitted successfully!' }));
      // Reset form
      dispatch(resetForm());

      // Redirect to dashboard after successful submission
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (error) {
      dispatch(setMessage({
        type: 'error',
        text: error.message || 'Failed to submit feedback. Please try again.'
      }));
    } finally {
      dispatch(setSubmitting(false));
    }
  };

  const handleReset = () => {
    dispatch(resetForm());
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      // Validate file size
      if (file.size > 5 * 1024 * 1024) {
        dispatch(setMessage({ type: 'error', text: 'File size exceeds 5MB limit' }));
        return;
      }
      // Handle the dropped image file
      const reader = new FileReader();
      reader.onloadend = () => {
        dispatch(setImagePreview(reader.result));
        dispatch(setImage(file));
        dispatch(setMessage({ type: '', text: '' }));
        dispatch(resetUploadAttempts());
        uploadImageImmediately(file);
      };
      reader.readAsDataURL(file);
    } else {
      dispatch(setMessage({ type: 'error', text: 'Please drop a valid image file' }));
    }
  };

  return (
    <div>
      <div style={{ paddingLeft: '25px' }}><BackButton /></div>
      <div className="feedback-form-container">
        <div className="feedback-form-card">
          <h2 className="feedback-form-title">Submit Feedback</h2>
          <p className="form-description">Share your suggestions, issues, or concerns with us. Include images if needed.</p>

          {message.text && (
            <div className={`message ${message.type}`}>
              {message.text}
            </div>
          )}
          <form onSubmit={handleSubmit} className="feedback-form" encType="multipart/form-data">
            <div className="form-group">
              <label htmlFor="title">Title *</label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => dispatch(setTitle(e.target.value))}
                required
                className="form-input"
                placeholder="Brief title for your feedback"
                maxLength="100"
              />
              <span className="char-count">{title.length}/100</span>
            </div>
            <div className="form-group">
              <label htmlFor="description">Description *</label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => dispatch(setDescription(e.target.value))}
                required
                rows="6"
                className="form-textarea"
                placeholder="Please provide detailed description of your feedback. Be as specific as possible so we can address your concern effectively."
                maxLength="1000"
              />
              <span className="char-count">{description.length}/1000</span>
            </div>
            <div className="form-group">
              <label htmlFor="priority">Priority</label>
              <select
                id="priority"
                value={priority}
                onChange={(e) => dispatch(setPriority(e.target.value))}
                className="form-select"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="image">Image (Optional)</label>
              <div className="image-upload-container">
                <div
                  className="upload-area"
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById('image').click()}
                >
                  <input
                    type="file"
                    id="image"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="file-input"
                    style={{ display: 'none' }}
                  />
                  <div className="upload-content">
                    <span className="upload-icon">📁</span>
                    <p className="upload-text">Click to upload an image or drag and drop</p>
                    <p className="upload-hint">JPG, PNG, GIF (Max 5MB)</p>
                  </div>
                </div>
                {imagePreview && (
                  <div className="image-preview">
                    <img src={imagePreview} alt="Preview" className="preview-image" />
                    {uploadError && !isUploading && (
                      <button
                        type="button"
                        className="retry-image-btn"
                        onClick={handleRetryUpload}
                      >
                        Retry Upload
                      </button>
                    )}
                    <button
                      type="button"
                      className="remove-image-btn"
                      onClick={() => {
                        dispatch(setImage(null));
                        dispatch(setImagePreview(null));
                        dispatch(setImageInfo(null));
                        dispatch(setUploadError(null));
                        dispatch(resetUploadAttempts());
                      }}
                    >
                      Remove
                    </button>
                  </div>
                )}
                {isUploading && <p className="upload-status">Uploading...</p>}
                {uploadError && isUploading && (
                  <p className="upload-status error">Uploading... (Attempt {uploadAttempts}/{maxUploadAttempts})</p>
                )}
              </div>
            </div>
            <div className="form-actions">
              <button
                type="button"
                onClick={handleReset}
                className="reset-button"
                disabled={isSubmitting}
              >
                Reset Form
              </button>
              <button
                type="submit"
                disabled={isSubmitting || isUploading}
                className="submit-button"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FeedbackForm;
