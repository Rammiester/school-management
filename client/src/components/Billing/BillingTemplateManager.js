import React, { useState, useEffect, useRef } from 'react';
import {
  getBillingTemplates,
  createBillingTemplate,
  updateBillingTemplate,
  deleteBillingTemplate,
  getDepartments
} from '../../api';
import './BillingDashboard.css';
import { Button, Space, Modal } from 'antd';

const BillingTemplateManager = () => {
  const [templates, setTemplates] = useState([]);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    properties: [],
    tags: [],
    isActive: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [departments, setDepartments] = useState([]);
 const [predefinedTags, setPredefinedTags] = useState([]);
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const [tagSuggestions, setTagSuggestions] = useState([]);
  const [cursorPosition, setCursorPosition] = useState(0);
  const textareaRef = useRef(null);

  const fetchTemplates = async () => {
    try {
      const { data } = await getBillingTemplates();
      setTemplates(data);
    } catch (error) {
      console.error('Error fetching templates:', error);
      setError('Failed to load billing templates');
    }
  };

  useEffect(() => {
    fetchTemplates();
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await getDepartments();
      const deptNames = response.data.data.map(dept => `${dept.name}Pay`);
      setDepartments(response.data.data);
      setPredefinedTags(deptNames);
    } catch (error) {
      console.error('Error fetching departments:', error);
      setPredefinedTags([]);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleDescriptionChange = (e) => {
    const value = e.target.value;
    const cursorPos = e.target.selectionStart;
    const textBeforeCursor = value.substring(0, cursorPos);
    const atIndex = textBeforeCursor.lastIndexOf('@');
    
    if (atIndex !== -1 && cursorPos > atIndex) {
      const tagQuery = textBeforeCursor.substring(atIndex + 1);
      const filteredTags = predefinedTags.filter(tag => 
        tag.toLowerCase().includes(tagQuery.toLowerCase()) && !value.includes(`@${tag}`)
      );
      setTagSuggestions(filteredTags);
      setShowTagSuggestions(true);
    } else {
      setShowTagSuggestions(false);
    }
    setFormData(prev => ({
      ...prev,
      description: value
    }));
    setCursorPosition(cursorPos);
 };

  const insertTag = (tag) => {
    const { description } = formData;
    const textBeforeCursor = description.substring(0, cursorPosition);
    const atIndex = textBeforeCursor.lastIndexOf('@');
    
    if (atIndex !== -1) {
      const beforeAt = description.substring(0, atIndex);
      const afterCursor = description.substring(cursorPosition);
      const newDescription = `${beforeAt}@${tag} ${afterCursor}`;
      setFormData(prev => ({
        ...prev,
        description: newDescription
      }));
      setShowTagSuggestions(false);
      setTagSuggestions([]);
      setTimeout(() => {
        if (textareaRef.current) {
          const newCursorPos = beforeAt.length + tag.length + 2;
          textareaRef.current.focus();
          textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
        }
      }, 0);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (textareaRef.current && !textareaRef.current.contains(e.target)) {
        setShowTagSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const addTagToDescription = (tag) => {
    const tagString = `@${tag}`;
    if (!formData.description.includes(tagString)) {
      setFormData(prev => ({
        ...prev,
        description: prev.description ? `${prev.description} ${tagString}` : tagString
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const templateData = {
        ...formData,
        items: []
      };

      if (editingTemplate) {
        await updateBillingTemplate(editingTemplate._id, templateData);
        setSuccess('Template updated successfully!');
      } else {
        await createBillingTemplate(templateData);
        setSuccess('Template created successfully!');
      }

      fetchTemplates();
      resetForm();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error saving template:', error);
      setError('Failed to save billing template');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      properties: [],
      tags: [],
      isActive: true
    });
  };

  const handleEdit = (template) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      description: template.description,
      properties: template.properties || [],
      tags: template.tags || [],
      isActive: template.isActive !== false
    });
    setIsFormVisible(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      try {
        await deleteBillingTemplate(id);
        fetchTemplates();
        setSuccess('Template deleted successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } catch (error) {
        console.error('Error deleting template:', error);
        setError('Failed to delete billing template');
      }
    }
  };

  const toggleForm = () => {
    setIsFormVisible(!isFormVisible);
    if (!isFormVisible) {
      resetForm();
      setEditingTemplate(null);
    }
  };

  const formatProperties = (properties) => {
    if (!properties || properties.length === 0) return 'No properties';
    return properties.join(', ');
  };

  const formatTags = (tags) => {
    if (!tags || tags.length === 0) return 'No tags';
    return tags.join(', ');
  };

  return (
    <div className="billing-template-manager">
      <div className="template-header">
        <h2 style={{ color: 'var(--white)' }}>Billing Templates</h2>
        <button
          className="toggle-form-btn"
          onClick={toggleForm}
        >
          {isFormVisible ? 'Cancel' : 'Add New Template'}
        </button>
      </div>

      <Modal
        title={editingTemplate ? 'Edit Template' : 'Create New Template'}
        open={isFormVisible}
        onCancel={() => {
          setIsFormVisible(false);
          resetForm();
          setEditingTemplate(null);
        }}
        footer={null}
        width={600}
      >
        <form onSubmit={handleSubmit} className="billing-template-form">
          <div className="form-group">
            <label htmlFor="name">Template Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="form-input"
              placeholder="Enter template name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <div className="description-input-container" style={{ position: 'relative' }}>
              <textarea
                ref={textareaRef}
                id="description"
                name="description"
                value={formData.description}
                onChange={handleDescriptionChange}
                className="form-textarea"
                placeholder="Enter template description. Type @ to see available tags..."
                rows="3"
              />
              {showTagSuggestions && tagSuggestions.length > 0 && (
                <div className="tag-suggestions-dropdown" style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  backgroundColor: 'var(--card-background-color)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '4px',
                  zIndex: 100,
                  maxHeight: '200px',
                  overflowY: 'auto',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                }}>
                  {tagSuggestions.map((tag, index) => (
                    <div
                      key={index}
                      className="tag-suggestion-item"
                      style={{
                        padding: '8px 12px',
                        cursor: 'pointer',
                        borderBottom: '1px solid var(--border-color)',
                        color: 'var(--text-light-color)',
                        transition: 'background-color 0.2s ease'
                      }}
                      onMouseDown={() => insertTag(tag)}
                    >
                      @{tag}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <p className="form-hint">Type @ to see available tags for department payment</p>
          </div>

          <div className="form-group">
            <label>Quick Tag Selection</label>
            <div className="tag-selection-container">
              <Space wrap>
                {predefinedTags.map(tag => (
                  <Button
                    key={tag}
                    type="primary"
                    size="small"
                    onClick={() => addTagToDescription(tag)}
                    className="tag-button"
                  >
                    @{tag}
                  </Button>
                ))}
              </Space>
            </div>
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {success && (
            <div className="success-message">
              {success}
            </div>
          )}

          <div className="form-actions">
            <button
              type="submit"
              disabled={loading}
              className="submit-btn"
            >
              {loading ? 'Saving...' : editingTemplate ? 'Update Template' : 'Create Template'}
            </button>
          </div>
        </form>
      </Modal>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {success && (
        <div className="success-message">
          {success}
        </div>
      )}

      <div className="templates-list">
        <h3>Available Templates</h3>
        {templates.length === 0 ? (
          <div className="no-bills">
            No billing templates found. Create your first template using the form above.
          </div>
        ) : (
          <div className="templates-grid">
            {templates.map(template => (
              <div key={template._id} className="template-card">
                <div className="template-header">
                  <h4>{template.name}</h4>
                  <span className={`status-badge ${template.isActive ? 'active' : 'inactive'}`}>
                    {template.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="template-details">
                  <p className="template-description">{template.description || 'No description provided'}</p>
                  <div className="template-meta">
                    <p><strong>Properties:</strong> {formatProperties(template.properties)}</p>
                    <p><strong>Tags:</strong> {formatTags(template.tags)}</p>
                    <p><strong>Created:</strong> {new Date(template.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="template-actions">
                  <button
                    onClick={() => handleEdit(template)}
                    className="edit-btn"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(template._id)}
                    className="delete-btn"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BillingTemplateManager;
