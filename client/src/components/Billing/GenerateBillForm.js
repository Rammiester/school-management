import React, { useState, useEffect } from 'react';
import { generateBills, getStudentsByGrade, getStudentByGradeAndRollNumber, getStudentByGradeAndName, getBillingTemplates, generateBillsFromTemplate } from '../../api';
import './BillingDashboard.css';
import SegmentedButton from './SegmentedButton';

const CustomCheckbox = ({ checked, onChange, children, className = '' }) => {
  return (
    <label className={`custom-checkbox ${className}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="custom-checkbox-input"
      />
      <span className="custom-checkbox-checkmark">
        {checked && (
          <svg width="12" height="9" viewBox="0 0 12 9" fill="none">
            <path
              d="M1 4.5L4 7.5L11 1"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </span>
      <span className="custom-checkbox-label">{children}</span>
    </label>
  );
};

const GenerateBillForm = ({ onBillGenerated }) => {
  const [billType, setBillType] = useState('addition');
  const [generationType, setGenerationType] = useState('department');
  const [showAdditionalInfo, setShowAdditionalInfo] = useState(true);
  const [formData, setFormData] = useState({
    studentIds: '',
    departments: [],
    allDepartments: false,
    startDate: '',
    endDate: '',
    description: '',
    items: [{ description: '', amount: 0 }],
    selectedClass: '',
    selectedRollNumber: '',
    selectedStudent: null,
    selectedRollNumberOptions: [],
    selectedTemplate: null,
    templateDescription: '',
  });

  const [classes, setClasses] = useState(['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th']);
  const [students, setStudents] = useState([]);
  const [studentNames, setStudentNames] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [error, setError] = useState('');

  const departmentOptions = [
    { value: 'hostel', label: 'Hostel' },
    { value: 'food', label: 'Food' },
    { value: 'academics', label: 'Academics' },
    { value: 'transport', label: 'Transport' },
    { value: 'administration', label: 'Administration' },
    { value: 'other', label: 'Other' },
  ];

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoadingTemplates(true);
      const response = await getBillingTemplates();
      setTemplates(response.data || []);
    } catch (error) {
      setTemplates([]);
      setError('Failed to load billing templates');
    } finally {
      setLoadingTemplates(false);
    }
  };

  useEffect(() => {
    if (formData.selectedClass) {
      const fetchStudents = async () => {
        try {
          setLoading(true);
          const response = await getStudentsByGrade(formData.selectedClass);
          setStudentNames(response.data || []);
        } catch (error) {
          setStudentNames([]);
          setError('Failed to load students for selected class');
        } finally {
          setLoading(false);
        }
      };
      fetchStudents();
    } else {
      setStudentNames([]);
    }
  }, [formData.selectedClass]);

  useEffect(() => {
    if (formData.selectedClass && formData.selectedRollNumber) {
      const fetchStudentDetails = async () => {
        try {
          const response = await getStudentByGradeAndRollNumber(
            formData.selectedClass,
            formData.selectedRollNumber
          );
          if (response.data) {
            setStudents([response.data]);
          }
        } catch (error) {
          setStudents([]);
        }
      };
      fetchStudentDetails();
    } else {
      setStudents([]);
    }
  }, [formData.selectedClass, formData.selectedRollNumber]);

  const handleItemChange = (index, e) => {
    const newItems = [...formData.items];
    newItems[index][e.target.name] = e.target.value;
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const addItem = () => {
    setFormData(prev => ({ ...prev, items: [...prev.items, { description: '', amount: 0 }] }));
  };

  const removeItem = (index) => {
    if (formData.items.length > 1) {
      const newItems = formData.items.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, items: newItems }));
    }
  };

  const handleClassChange = (e) => {
    const classValue = e.target.value;
    setFormData(prev => ({
      ...prev,
      selectedClass: classValue,
      selectedRollNumber: '',
      selectedStudent: null
    }));
  };

  const handleStudentNameChange = async (e) => {
    const studentName = e.target.value;
    setFormData(prev => ({
      ...prev,
      selectedStudent: studentName,
      selectedRollNumber: '',
      selectedRollNumberOptions: []
    }));

    if (studentName && formData.selectedClass) {
      try {
        const response = await getStudentByGradeAndName(formData.selectedClass, studentName);
        if (response.data && Array.isArray(response.data)) {
          setFormData(prev => ({
            ...prev,
            selectedRollNumberOptions: response.data
          }));
        }
      } catch (error) {
        setFormData(prev => ({
          ...prev,
          selectedRollNumberOptions: []
        }));
      }
    }
  };

  const handleRollNumberChange = (e) => {
    setFormData(prev => ({ ...prev, selectedRollNumber: e.target.value }));
  };

  const handleTemplateChange = (e) => {
    const templateId = e.target.value;
    const selectedTemplate = templates.find(t => t._id === templateId);
    setFormData(prev => ({
      ...prev,
      selectedTemplate: selectedTemplate,
      templateDescription: selectedTemplate?.description || ''
    }));
  };

  const validateForm = () => {
    if (billType === 'addition' && formData.items.some(item => !item.description.trim() || item.amount <= 0)) {
      setError('Please fill in all item descriptions and amounts');
      return false;
    }
    
    if (formData.startDate && formData.endDate && new Date(formData.startDate) > new Date(formData.endDate)) {
      setError('Start date must be before end date');
      return false;
    }

    if (billType === 'template' && !formData.selectedTemplate) {
      setError('Please select a template');
      return false;
    }

    setError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const storedUser = localStorage.getItem('user');
      let userId = null;
      if (storedUser) {
        try {
          const userObj = JSON.parse(storedUser);
          userId = userObj._id || userObj.id;
        } catch (error) {
          console.error('Error parsing user from localStorage:', error);
        }
      }

      if (!userId) {
        alert('Please log in to generate bills. User authentication is required.');
        return;
      }

      let payload = {
        generationType: generationType,
        startDate: formData.startDate,
        endDate: formData.endDate,
        generatedBy: userId,
      };

      // Handle description based on bill type
      if (billType === 'addition') {
        payload.description = formData.description;
        payload.items = formData.items.filter(item => item.description.trim() !== '' && item.amount > 0);
      } else {
        if (!formData.selectedTemplate) {
          throw new Error('Please select a template');
        }
        payload.templateId = formData.selectedTemplate._id;
        payload.description = formData.templateDescription || formData.description || formData.selectedTemplate.description;
        payload.items = formData.selectedTemplate.items || [];
      }

      // Handle different generation types with proper payload structure
      if (generationType === 'department') {
        payload.departmentFilter = {
          departments: formData.allDepartments ? null : formData.departments,
          allDepartments: formData.allDepartments
        };
      } else if (generationType === 'class') {
        payload.classFilter = {
          className: formData.selectedClass,
        };
      } else if (generationType === 'student') {
        if (formData.selectedStudent) {
          payload.studentIds = [formData.selectedStudent];
        } else {
          payload.studentIds = formData.studentIds.split(',').map(id => id.trim()).filter(id => id !== '');
        }
      } else if (generationType === 'NonId') {
        // For NonId, send the selected information based on what's available
        if (formData.selectedStudent && formData.selectedRollNumber) {
          payload.classFilter = {
            className: formData.selectedClass,
            rollNumber: parseInt(formData.selectedRollNumber)
          };
        } else if (formData.selectedClass && formData.selectedRollNumber) {
          payload.classFilter = {
            className: formData.selectedClass,
            rollNumber: parseInt(formData.selectedRollNumber)
          };
        } else if (formData.studentIds.trim()) {
          payload.studentIds = formData.studentIds.split(',').map(id => id.trim()).filter(id => id !== '');
        } else if (formData.selectedClass) {
          payload.classFilter = {
            className: formData.selectedClass
          };
        }
      }

      // For addition bills, ensure items are properly included
      if (billType === 'addition') {
        if (generationType === 'NonId') {
          // Make sure items and generatedBy are included for NonId
          payload.items = formData.items.filter(item => item.description.trim() !== '' && item.amount > 0);
          // Don't set generatedBy again here as it's already set at the beginning
        }
        await generateBills(payload);
      } else {
        await generateBillsFromTemplate(payload);
      }

      // Reset form
      setFormData({
        studentIds: '',
        departments: [],
        allDepartments: false,
        startDate: '',
        endDate: '',
        description: '',
        items: [{ description: '', amount: 0 }],
        selectedClass: '',
        selectedRollNumber: '',
        selectedStudent: null,
        selectedRollNumberOptions: [],
        selectedTemplate: null,
        templateDescription: '',
      });

      alert('Bills generated successfully');
      
      // Call the callback to refresh the bills list
      if (onBillGenerated) {
        onBillGenerated();
      }
    } catch (error) {
      console.error('Error generating bills:', error);
      setError(error.message || 'Failed to generate bills');
    }
  };

  const segmentedOptions = [
    { value: 'addition', label: 'Addition Bill' },
    { value: 'template', label: 'Template Bill' }
  ];

  return (
    <div className="generate-bill-form">
      <div className="dashboard-header">
        <h2 className="dashboard-title">Generate Bills</h2>
        <p className="dashboard-subtitle">Create new bills for students or departments</p>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="billing-form">
        <div className="form-section">
          <h3 className="form-section-title">Bill Type</h3>
          <div className="form-group">
            <SegmentedButton
              options={segmentedOptions}
              value={billType}
              onChange={setBillType}
            />
          </div>
        </div>

        <div className="form-section">
          <h3 className="form-section-title">Generation Settings</h3>
          <div className="form-group">
            <label htmlFor="generationType">Generation Type</label>
            <div className="radio-group">
              <label className="radio-label">
                <input
                  type="radio"
                  id="department"
                  name="generationType"
                  value="department"
                  checked={generationType === 'department'}
                  onChange={(e) => setGenerationType(e.target.value)}
                  className="radio-input"
                />
                <span className="radio-custom"></span>
                Department
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  id="class"
                  name="generationType"
                  value="class"
                  checked={generationType === 'class'}
                  onChange={(e) => setGenerationType(e.target.value)}
                  className="radio-input"
                />
                <span className="radio-custom"></span>
                Full Class
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  id="student"
                  name="generationType"
                  value="student"
                  checked={generationType === 'student'}
                  onChange={(e) => setGenerationType(e.target.value)}
                  className="radio-input"
                />
                <span className="radio-custom"></span>
                Student
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  id="NonId"
                  name="generationType"
                  value="NonId"
                  checked={generationType === 'NonId'}
                  onChange={(e) => setGenerationType(e.target.value)}
                  className="radio-input"
                />
                <span className="radio-custom"></span>
                Non Id
              </label>
            </div>
          </div>

          {generationType === 'department' ? (
            <div className="form-group">
              <CustomCheckbox
                checked={formData.allDepartments}
                onChange={(e) => setFormData(prev => ({ ...prev, allDepartments: e.target.checked, departments: [] }))}
                className="all-departments-checkbox"
              >
                All Departments
              </CustomCheckbox>

              {!formData.allDepartments && (
                <div className="form-group department-selection">
                  <label className="departments-label">Select Departments</label>
                  <div className="department-checkboxes-grid">
                    {departmentOptions.map(dept => (
                      <CustomCheckbox
                        key={dept.value}
                        checked={formData.departments.includes(dept.value)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData(prev => ({
                              ...prev,
                              departments: [...prev.departments, dept.value]
                            }));
                          } else {
                            setFormData(prev => ({
                              ...prev,
                              departments: prev.departments.filter(d => d !== dept.value)
                            }));
                          }
                        }}
                        className="department-checkbox"
                      >
                        {dept.label}
                      </CustomCheckbox>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : generationType === 'NonId' ? (
            <div className="form-group">
              <label htmlFor="selectedClass">Select Class</label>
              <select
                id="selectedClass"
                value={formData.selectedClass}
                onChange={handleClassChange}
                className="filter-select"
                disabled={loading}
              >
                <option value="">Select a class</option>
                {classes.map(cls => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>

              {formData.selectedClass && studentNames.length > 0 && (
                <div className="form-group" style={{ marginTop: '15px' }}>
                  <label htmlFor="selectedStudent">Select Student Name</label>
                  <select
                    id="selectedStudent"
                    value={formData.selectedStudent || ''}
                    onChange={handleStudentNameChange}
                    className="filter-select"
                  >
                    <option value="">Select student name</option>
                    {studentNames.map(name => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                  </select>
                </div>
              )}

              {formData.selectedStudent && formData.selectedRollNumberOptions.length > 0 && (
                <div className="form-group" style={{ marginTop: '15px' }}>
                  <label htmlFor="selectedRollNumber">Select Roll Number</label>
                  <select
                    id="selectedRollNumber"
                    value={formData.selectedRollNumber}
                    onChange={handleRollNumberChange}
                    className="filter-select"
                  >
                    <option value="">Select roll number</option>
                    {formData.selectedRollNumberOptions.map(rollNumber => (
                      <option key={rollNumber} value={rollNumber}>{rollNumber}</option>
                    ))}
                  </select>
                </div>
              )}

              {formData.selectedStudent && formData.selectedRollNumberOptions.length === 0 && (
                <div className="form-group" style={{ marginTop: '15px' }}>
                  <label htmlFor="selectedRollNumber">Enter Roll Number</label>
                  <input
                    type="number"
                    id="selectedRollNumber"
                    value={formData.selectedRollNumber}
                    onChange={handleRollNumberChange}
                    className="form-input"
                    placeholder="Enter roll number"
                    min="1"
                  />
                </div>
              )}

              {formData.selectedRollNumber && students.length > 0 && (
                <div className="form-group" style={{ marginTop: '15px' }}>
                  <label htmlFor="selectedStudentFromRoll">Student Details</label>
                  <div className="student-details">
                    <p><strong>Name:</strong> {students[0]?.name}</p>
                    <p><strong>Roll Number:</strong> {students[0]?.rollNumber}</p>
                    <p><strong>Grade:</strong> {students[0]?.grade}</p>
                  </div>
                </div>
              )}
            </div>
          ) : generationType === 'class' ? (
            <div className="form-group">
              <label htmlFor="selectedClass">Select Class</label>
              <select
                id="selectedClass"
                value={formData.selectedClass}
                onChange={handleClassChange}
                className="filter-select"
                disabled={loading}
              >
                <option value="">Select a class</option>
                {classes.map(cls => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
            </div>
          ) : (
            <div className="form-group">
              <label htmlFor="studentIds">Student IDs (comma-separated)</label>
              <input
                type="text"
                id="studentIds"
                value={formData.studentIds}
                onChange={(e) => setFormData(prev => ({ ...prev, studentIds: e.target.value }))}
                required
                className="form-input"
                placeholder="e.g., 123, 456, 789"
              />
            </div>
          )}
        </div>

        {billType === 'template' ? (
          <div className="form-section">
            <h3 className="form-section-title">Template Bill Settings</h3>
            <div className="form-group">
              <label htmlFor="selectedTemplate">Select Template</label>
              <select
                id="selectedTemplate"
                value={formData.selectedTemplate?._id || ''}
                onChange={handleTemplateChange}
                className="filter-select"
                disabled={loadingTemplates}
              >
                <option value="">Select a template</option>
                {templates.map(template => (
                  <option key={template._id} value={template._id}>{template.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="templateDescription">Description (Override)</label>
              <textarea
                id="templateDescription"
                value={formData.templateDescription}
                onChange={(e) => setFormData(prev => ({ ...prev, templateDescription: e.target.value }))}
                placeholder="Enter bill description (overrides template description)"
                className="form-textarea"
                rows="2"
              />
            </div>
          </div>
        ) : (
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter bill description"
              className="form-textarea"
              rows="3"
            />
          </div>
        )}

        {billType === 'addition' && (
          <div className="form-section">
            <h3 className="form-section-title">Bill Items</h3>
            {formData.items.map((item, index) => (
              <div key={index} className="item-row">
                <div className="form-group">
                  <label htmlFor={`description-${index}`}>Item Description</label>
                  <input
                    type="text"
                    id={`description-${index}`}
                    name="description"
                    placeholder="Item description"
                    value={item.description}
                    onChange={(e) => handleItemChange(index, e)}
                    required
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor={`amount-${index}`}>Amount</label>
                  <input
                    type="number"
                    id={`amount-${index}`}
                    name="amount"
                    placeholder="Amount"
                    value={item.amount}
                    onChange={(e) => handleItemChange(index, e)}
                    required
                    className="form-input"
                    min="0"
                    step="0.01"
                  />
                </div>
                {formData.items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="remove-item-btn"
                    title="Remove item"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button type="button" onClick={addItem} className="add-item-btn">
              + Add Item
            </button>
          </div>
        )}

        <div className="form-section">
          <CustomCheckbox
            checked={showAdditionalInfo}
            onChange={(e) => setShowAdditionalInfo(e.target.checked)}
          >
            Show Additional Information
          </CustomCheckbox>
          {showAdditionalInfo && (
            <>
              <div className="form-group">
                <label htmlFor="startDate">Start Date</label>
                <input
                  type="date"
                  id="startDate"
                  value={formData.startDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                  required
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label htmlFor="endDate">End Date</label>
                <input
                  type="date"
                  id="endDate"
                  value={formData.endDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                  required
                  className="form-input"
                />
              </div>
            </>
          )}
        </div>

        <div className="form-actions">
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Generating...' : 'Generate Bills'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default GenerateBillForm;
