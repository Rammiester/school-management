import React, { useState, useEffect } from 'react';
import { fetchFeedback, updateFeedbackStatus, updateFeedbackPriority } from '../../services/feedbackService';
import { BASE_URL } from '../../api';
import BackButton from '../../components/BackButton';
import './SuperuserControlBase.css';

const SuperuserControlBase = () => {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const itemsPerPage = 10;

  useEffect(() => {
    loadFeedback();
  }, [currentPage, filterStatus, filterPriority, sortBy, searchTerm]);

  const loadFeedback = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetchFeedback({
        page: currentPage,
        limit: itemsPerPage,
        status: filterStatus === 'all' ? undefined : filterStatus,
        priority: filterPriority === 'all' ? undefined : filterPriority,
        sortBy,
        search: searchTerm
      });
      
      setFeedback(response.feedback);
      setTotalPages(response.pagination.pages);
    } catch (err) {
      setError('Failed to load feedback. Please try again.');
      console.error('Error loading feedback:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (feedbackId, newStatus) => {
    try {
      setIsUpdating(true);
      await updateFeedbackStatus(feedbackId, newStatus);
      // Update local state
      setFeedback(prev => prev.map(fb => 
        fb._id === feedbackId ? { ...fb, status: newStatus } : fb
      ));
    } catch (err) {
      setError('Failed to update feedback status.');
      console.error('Error updating status:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePriorityChange = async (feedbackId, newPriority) => {
    try {
      setIsUpdating(true);
      await updateFeedbackPriority(feedbackId, newPriority);
      // Update local state
      setFeedback(prev => prev.map(fb => 
        fb._id === feedbackId ? { ...fb, priority: newPriority } : fb
      ));
    } catch (err) {
      setError('Failed to update feedback priority.');
      console.error('Error updating priority:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#f39c12';
      case 'reviewed': return '#3498db';
      case 'resolved': return '#27ae60';
      case 'rejected': return '#e74c3c';
      default: return '#95a5a6';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return '#e74c3c';
      case 'high': return '#e67e22';
      case 'medium': return '#f39c12';
      case 'low': return '#27ae60';
      default: return '#95a5a6';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'reviewed': return 'Reviewed';
      case 'resolved': return 'Resolved';
      case 'rejected': return 'Rejected';
      default: return status;
    }
  };

  const getPriorityText = (priority) => {
    switch (priority) {
      case 'critical': return 'Critical';
      case 'high': return 'High';
      case 'medium': return 'Medium';
      case 'low': return 'Low';
      default: return priority;
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`page-button ${currentPage === i ? 'active' : ''}`}
        >
          {i}
        </button>
      );
    }

    return (
      <div className="pagination">
        {currentPage > 1 && (
          <button 
            onClick={() => handlePageChange(currentPage - 1)}
            className="page-button"
          >
            Previous
          </button>
        )}
        {pages}
        {currentPage < totalPages && (
          <button 
            onClick={() => handlePageChange(currentPage + 1)}
            className="page-button"
          >
            Next
          </button>
        )}
      </div>
    );
  };

  const openFeedbackDetails = (feedbackItem) => {
    setSelectedFeedback(feedbackItem);
    setShowDetails(true);
  };

  const closeFeedbackDetails = () => {
    setShowDetails(false);
    setSelectedFeedback(null);
  };

  const getFeedbackStats = () => {
    const total = feedback.length;
    const pending = feedback.filter(f => f.status === 'pending').length;
    const resolved = feedback.filter(f => f.status === 'resolved').length;
    const reviewed = feedback.filter(f => f.status === 'reviewed').length;
    const rejected = feedback.filter(f => f.status === 'rejected').length;
    
    return { total, pending, resolved, reviewed, rejected };
  };

  const stats = getFeedbackStats();

  if (loading && feedback.length === 0) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading feedback...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">{error}</p>
        <button className="retry-button" onClick={loadFeedback}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="superuser-control-base">
      <BackButton/>
      <div className="control-header">
        <div className="header-main">
          <h1 className="page-title">Feedback Management</h1>
          <div className="header-stats">
            <div className="stat-item">
              <span className="stat-value">{stats.total}</span>
              <span className="stat-label">Total</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{stats.pending}</span>
              <span className="stat-label">Pending</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{stats.resolved}</span>
              <span className="stat-label">Resolved</span>
            </div>
          </div>
        </div>
        <div className="controls">
          <div className="filter-group">
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="filter-select"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="reviewed">Reviewed</option>
              <option value="resolved">Resolved</option>
              <option value="rejected">Rejected</option>
            </select>
            
            <select
              value={filterPriority}
              onChange={(e) => {
                setFilterPriority(e.target.value);
                setCurrentPage(1);
              }}
              className="filter-select"
            >
              <option value="all">All Priority</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setCurrentPage(1);
              }}
              className="filter-select"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="priority">Priority</option>
            </select>
            
            <input
              type="text"
              placeholder="Search feedback..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="search-input"
            />
          </div>
        </div>
      </div>

      <div className="feedback-list">
        {feedback.length === 0 ? (
          <div className="no-feedback">
            <div className="no-feedback-content">
              <span className="no-feedback-icon">📋</span>
              <h3>No feedback found</h3>
              <p>There are no feedback items matching your criteria.</p>
            </div>
          </div>
        ) : (
          feedback.map((item) => (
            <div key={item._id} className="feedback-item">
              <div className="feedback-header">
                <div className="feedback-title">
                  <h3>{item.title}</h3>
                  <span className="user-info">
                    by {item.userName} ({item.userRole})
                  </span>
                </div>
                <div className="feedback-meta">
                  <span 
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(item.status) }}
                  >
                    {getStatusText(item.status)}
                  </span>
                  <span 
                    className="priority-badge"
                    style={{ backgroundColor: getPriorityColor(item.priority) }}
                  >
                    {getPriorityText(item.priority)}
                  </span>
                  <span className="date">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="feedback-content">
                <p className="description">{item.description.substring(0, 150)}{item.description.length > 150 ? '...' : ''}</p>
                {item.image && item.image.url && (
                  <div className="image-container">
                    <img 
                      src={`${BASE_URL}${item.image.url}`} 
                      alt="Feedback attachment" 
                      className="feedback-image"
                      onClick={() => openFeedbackDetails(item)}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        // You could add a fallback here if needed
                      }}
                    />
                  </div>
                )}
              </div>

              <div className="feedback-actions">
                <div className="action-group">
                  <label htmlFor={`status-${item._id}`}>Status:</label>
                  <select
                    id={`status-${item._id}`}
                    value={item.status}
                    onChange={(e) => handleStatusChange(item._id, e.target.value)}
                    className="action-select"
                    disabled={isUpdating}
                  >
                    <option value="pending">Pending</option>
                    <option value="reviewed">Reviewed</option>
                    <option value="resolved">Resolved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                <div className="action-group">
                  <label htmlFor={`priority-${item._id}`}>Priority:</label>
                  <select
                    id={`priority-${item._id}`}
                    value={item.priority}
                    onChange={(e) => handlePriorityChange(item._id, e.target.value)}
                    className="action-select"
                    disabled={isUpdating}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
                <button
                  className="details-button"
                  onClick={() => openFeedbackDetails(item)}
                  disabled={isUpdating}
                >
                  View Details
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {totalPages > 1 && renderPagination()}

      {/* Feedback Details Modal */}
      {showDetails && selectedFeedback && (
        <div className="modal-overlay" onClick={closeFeedbackDetails}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedFeedback.title}</h2>
              <button className="close-button" onClick={closeFeedbackDetails}>×</button>
            </div>
            <div className="modal-body">
              <div className="feedback-details-header">
                <div className="user-info-section">
                  <span className="user-name">{selectedFeedback.userName}</span>
                  <span className="user-role">({selectedFeedback.userRole})</span>
                </div>
                <div className="feedback-meta-section">
                  <span 
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(selectedFeedback.status) }}
                  >
                    {getStatusText(selectedFeedback.status)}
                  </span>
                  <span 
                    className="priority-badge"
                    style={{ backgroundColor: getPriorityColor(selectedFeedback.priority) }}
                  >
                    {getPriorityText(selectedFeedback.priority)}
                  </span>
                  <span className="date">
                    {new Date(selectedFeedback.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="feedback-details-content">
                <p className="description">{selectedFeedback.description}</p>
                {selectedFeedback.image && selectedFeedback.image.url && (
                  <div className="image-container">
                    <img 
                      src={selectedFeedback.image.url.startsWith('http') ? selectedFeedback.image.url : `${BASE_URL}${selectedFeedback.image.url}`} 
                      alt="Feedback attachment" 
                      className="feedback-image"
                    />
                  </div>
                )}
              </div>
              <div className="modal-actions">
                <div className="action-group">
                  <label htmlFor="modal-status">Status:</label>
                  <select
                    id="modal-status"
                    value={selectedFeedback.status}
                    onChange={(e) => handleStatusChange(selectedFeedback._id, e.target.value)}
                    className="action-select"
                    disabled={isUpdating}
                  >
                    <option value="pending">Pending</option>
                    <option value="reviewed">Reviewed</option>
                    <option value="resolved">Resolved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                <div className="action-group">
                  <label htmlFor="modal-priority">Priority:</label>
                  <select
                    id="modal-priority"
                    value={selectedFeedback.priority}
                    onChange={(e) => handlePriorityChange(selectedFeedback._id, e.target.value)}
                    className="action-select"
                    disabled={isUpdating}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperuserControlBase;
