import React, { useState, useEffect, useContext } from 'react';
import { getClassesWithPayments, updateClassPayment, addDepartmentToClass, removeDepartmentFromClass, getDepartments } from '../../api';
import { AuthContext } from '../../context/AuthContext';
import './BillingDashboard.css';

const ClassPaymentManagement = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingClassId, setEditingClassId] = useState(null);
  const [editedPayments, setEditedPayments] = useState({});
  const [expandedClasses, setExpandedClasses] = useState(new Set());
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showAddDepartmentForm, setShowAddDepartmentForm] = useState({});
  const [newDepartmentName, setNewDepartmentName] = useState({});
  const [newDepartmentAmount, setNewDepartmentAmount] = useState({});
  const [availableDepartments, setAvailableDepartments] = useState([]);
  const { user } = useContext(AuthContext); 

  useEffect(() => {
    fetchClassesWithPayments();
    fetchAvailableDepartments();
  }, []);

  const fetchAvailableDepartments = async () => {
    try {
      const response = await getDepartments();
      setAvailableDepartments(response.data.data || []);
    } catch (error) {
      console.error('Error fetching departments:', error);
      // Set default departments if API fails
      setAvailableDepartments([
        { name: 'Academics', description: 'Academic fees' },
        { name: 'Sports', description: 'Sports activities' },
        { name: 'Library', description: 'Library charges' },
        { name: 'Hostel', description: 'Hostel fees' },
        { name: 'Transport', description: 'Transportation' },
        { name: 'Food', description: 'Food charges' }
      ]);
    }
  };

  const fetchClassesWithPayments = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await getClassesWithPayments();
      setClasses(data);
    } catch (err) {
      console.error('Error fetching classes with payments:', err);
      setError('Failed to fetch class payments. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (classId) => {
    if (user?.role !== 'chairman') {
      setError('Only Chairman can edit class payments.');
      return;
    }
    
    // Find the class object to get the className
    const classObj = classes.find(c => c._id === classId);
    const className = classObj ? classObj.className : classId;
    setEditingClassId(classId); // Use classId instead of className
    if (classObj) {
      const payments = {};
      classObj.payments.forEach(payment => {
        payments[payment.department] = {
          ...payment,
          amount: payment.amount.toString()
        };
      });
      setEditedPayments(payments);
    }
  };

  const handleCancel = () => {
    setEditingClassId(null);
    setEditedPayments({});
    setError(null);
    setSuccess(null);
  };

  const handleSave = async (classId) => {
    if (user?.role !== 'chairman') {
      setError('Only Chairman can edit class payments.');
      return;
    }
    
    try {
      // Find the class object to get the className
      const classObj = classes.find(c => c._id === classId);
      const className = classObj ? classObj.className : classId;
      const updatedPayments = Object.values(editedPayments).map(payment => ({
        department: payment.department,
        amount: parseFloat(payment.amount),
        isEditable: payment.isEditable
      }));

      await updateClassPayment(className, updatedPayments);
      
      setClasses(prev => prev.map(cls => 
        cls._id === classId 
          ? { ...cls, payments: updatedPayments }
          : cls
      ));
      
      setEditingClassId(null);
      setEditedPayments({});
      setSuccess('Class payment updated successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error updating class payment:', err);
      setError('Failed to update class payment. Please try again.');
    }
  };

  const handlePaymentChange = (department, field, value) => {
    setEditedPayments(prev => ({
      ...prev,
      [department]: {
        ...prev[department],
        [field]: value
      }
    }));
  };

  const toggleClassExpansion = (className) => {
    const newExpanded = new Set(expandedClasses);
    if (newExpanded.has(className)) {
      newExpanded.delete(className);
    } else {
      newExpanded.add(className);
    }
    setExpandedClasses(newExpanded);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const getTotalAmount = (payments) => {
    return payments.reduce((sum, payment) => sum + payment.amount, 0);
  };

  const getDepartmentColor = (department) => {
    const colors = {
      'Academics': 'var(--primary-color)',
      'Sports': 'var(--secondary-color)',
      'Music': 'var(--accent-color)',
      'Dance': '#8c2a1e',
      'Art': '#476b6b',
      'Library': '#dea08f',
      'Hostel': '#8c2a1e',
      'Transport': '#476b6b',
      'Food': 'var(--secondary-color)',
      'Other': 'var(--accent-color)'
    };
    return colors[department] || '#444';
  };

  const handleAddDepartment = async (classId) => {
    if (!user || user.role !== 'chairman') {
      setError('Only Chairman can add departments.');
      return;
    }

    let departmentName = newDepartmentName[classId]?.trim();
    if (departmentName === 'Other') {
      departmentName = newDepartmentName[`${classId}_custom`]?.trim() || '';
    }
    
    if (!departmentName) {
      setError('Department name is required.');
      return;
    }

    try {
      const amount = parseFloat(newDepartmentAmount[classId]) || 0;
      // Use className instead of classId for the API call
      const classObj = classes.find(c => c._id === classId);
      const className = classObj ? classObj.className : classId;
      
      await addDepartmentToClass(className, departmentName, amount);
      
      await fetchClassesWithPayments();
      setSuccess(`Department "${departmentName}" added successfully!`);
      setTimeout(() => setSuccess(null), 3000);
      setShowAddDepartmentForm(prev => ({ ...prev, [classId]: false }));
      setNewDepartmentName(prev => ({ ...prev, [classId]: '', [`${classId}_custom`]: '' }));
      setNewDepartmentAmount(prev => ({ ...prev, [classId]: '' }));
    } catch (err) {
      console.error('Error adding department:', err);
      setError('Failed to add department. Please try again.');
    }
  };

  const handleRemoveDepartment = async (classId, department) => {
    if (!user || user.role !== 'chairman') {
      setError('Only Chairman can remove departments.');
      return;
    }

    try {
      // Find the class object to get the className
      const classObj = classes.find(cls => cls._id === classId);
      const className = classObj ? classObj.className : classId;
      
      await removeDepartmentFromClass(className, department);
      
      // Refresh the data to remove the department
      await fetchClassesWithPayments();
      setSuccess(`Department "${department}" removed successfully!`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error removing department:', err);
      setError('Failed to remove department. Please try again.');
    }
  };

  const toggleAddDepartmentForm = (classId) => {
    if (!user || user.role !== 'chairman') {
      setError('Only Chairman can manage departments.');
      return;
    }
    setShowAddDepartmentForm(prev => ({
      ...prev,
      [classId]: !prev[classId]
    }));
 };

  if (loading) {
    return (
      <div className="loading">
        Loading class payments...
      </div>
    );
  }

  return (
    <div className="class-payment-management">
      <h3>Class Payment Management</h3>
      <p className="section-description">
        This payment method is based on a monthly fee structure.
      </p>
      
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
      
      {classes.length === 0 ? (
        <div className="no-bills">
          No class payments found.
        </div>
      ) : (
        <div className="classes-container">
          {classes.map(cls => {
            const isEditing = editingClassId === cls._id;
            const isAddingDepartment = showAddDepartmentForm[cls._id];
            
            return (
              <div key={cls._id} className="class-card">
                <div className="class-header">
                  <h4>Class {cls.className}</h4>
                  <div className="class-stats">
                    <span className="total-amount">
                      Total: {formatCurrency(getTotalAmount(cls.payments))}
                    </span>
                    <button 
                      className="toggle-button"
                      onClick={() => toggleClassExpansion(cls.className)}
                    >
                      {expandedClasses.has(cls.className) ? '▼' : '▶'}
                    </button>
                  </div>
                </div>
                
                {expandedClasses.has(cls.className) && (
                  <div className="class-content">
                    {user?.role === 'chairman' && (
                      <div className="department-actions">
                        <button 
                          onClick={() => toggleAddDepartmentForm(cls._id)}
                          className="secondary-button"
                        >
                          {isAddingDepartment ? 'Cancel' : '+ Add Department'}
                        </button>
                      </div>
                    )}
                    
                    {isAddingDepartment && user?.role === 'chairman' && (
                      <div className="add-department-form">
                        <h4>Add New Department</h4>
                        <div className="form-group">
                          <label>Department Name:</label>
                          <select
                            value={newDepartmentName[cls._id] || ''}
                            onChange={(e) => setNewDepartmentName(prev => ({ ...prev, [cls._id]: e.target.value }))}
                            className="form-input"
                          >
                            <option value="">Select department</option>
                            {availableDepartments.map(dept => (
                              <option key={dept._id} value={dept.name}>
                                {dept.name} {dept.description && `(${dept.description})`}
                              </option>
                            ))}
                            <option value="Other">Other (Custom)</option>
                          </select>
                        </div>
                        {newDepartmentName[cls._id] === 'Other' && (
                          <div className="form-group">
                            <label>Custom Department Name:</label>
                            <input
                              type="text"
                              value={newDepartmentName[`${cls._id}_custom`] || ''}
                              onChange={(e) => setNewDepartmentName(prev => ({ ...prev, [`${cls._id}_custom`]: e.target.value }))}
                              className="form-input"
                              placeholder="Enter custom department name"
                            />
                          </div>
                        )}
                        <div className="form-group">
                          <label>Amount (INR):</label>
                          <input
                            type="number"
                            value={newDepartmentAmount[cls._id] || ''}
                            onChange={(e) => setNewDepartmentAmount(prev => ({ ...prev, [cls._id]: e.target.value }))}
                            className="form-input"
                            placeholder="Enter amount"
                            min="0"
                            step="0.01"
                          />
                        </div>
                        <div className="form-actions">
                          <button 
                            onClick={() => handleAddDepartment(cls._id)}
                            className="primary-button"
                          >
                            Add Department
                          </button>
                        </div>
                      </div>
                    )}
                    
                    <div className="payments-table-wrapper">
                      <table className="payments-table">
                        <thead>
                          <tr>
                            <th>Department</th>
                            <th>Amount</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {cls.payments.map((payment) => {
                            const isDefaultDepartment = ['Academics', 'Sports', 'Music', 'Dance', 'Art', 'Library', 'Hostel', 'Transport', 'Food', 'Other'].includes(payment.department);
                            return (
                              <tr key={`${cls._id}-${payment.department}`}>
                                <td data-label="Department">
                                  <span className="department-badge" style={{ backgroundColor: getDepartmentColor(payment.department) }}>
                                    {payment.department}
                                  </span>
                                </td>
                                <td data-label="Amount">
                                  {isEditing ? (
                                    <input
                                      type="number"
                                      value={editedPayments[payment.department]?.amount || payment.amount}
                                      onChange={(e) => handlePaymentChange(payment.department, 'amount', e.target.value)}
                                      className="editable-input"
                                      min="0"
                                      step="0.01"
                                    />
                                  ) : (
                                    formatCurrency(payment.amount)
                                  )}
                                </td>
                                <td data-label="Actions">
                                  {isEditing ? (
                                    <div className="action-buttons">
                                      <button 
                                        onClick={() => handleSave(cls._id)}
                                        className="primary-button"
                                      >
                                        Save
                                      </button>
                                      <button 
                                        onClick={handleCancel}
                                        className="secondary-button"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  ) : user?.role === 'chairman' ? (
                                    <div className="action-buttons">
                                      <button 
                                        onClick={() => handleEdit(cls._id)}
                                        className="secondary-button"
                                      >
                                        Edit
                                      </button>
                                      {!isDefaultDepartment && (
                                        <button 
                                          onClick={() => handleRemoveDepartment(cls._id, payment.department)}
                                          className="danger-button"
                                          style={{ marginLeft: '5px' }}
                                        >
                                          Remove
                                        </button>
                                      )}
                                    </div>
                                  ) : (
                                    <span className="readonly-text">Read-only</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ClassPaymentManagement;
