import React, { useState, useEffect } from 'react';
import { getBills, updateBillStatus } from '../../api';
import './BillingDashboard.css';
import GenerateBillForm from './GenerateBillForm';
import ClassPaymentManagement from './ClassPaymentManagement';
import BillingTemplateManager from './BillingTemplateManager';
import SegmentedButton from './SegmentedButton';
import BackButton from '../../components/BackButton';
import { BarChartOutlined, CheckCircleOutlined, CloseCircleOutlined, DollarOutlined, ExclamationCircleOutlined, CreditCardOutlined, BankOutlined, MobileOutlined, WalletOutlined } from '@ant-design/icons';

const BillingDashboard = () => {
  const [bills, setBills] = useState([]);
  const [filters, setFilters] = useState({
    student: '',
    status: '',
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1
  });
  const [activeTab, setActiveTab] = useState('bills');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalBills: 0,
    paidBills: 0,
    unpaidBills: 0,
    totalAmount: 0
  });
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedBillId, setSelectedBillId] = useState(null);

  useEffect(() => {
    fetchBills();
  }, [filters, pagination.page]);

  const fetchBills = async () => {
    setLoading(true);
    try {
      const params = {
        ...filters,
        page: pagination.page,
        limit: pagination.limit
      };
      const { data } = await getBills(params);
      
      setBills(data.bills || data);
      
      if (data.pagination) {
        setPagination(prev => ({
          ...prev,
          total: data.pagination.total,
          pages: data.pagination.pages
        }));
      }

      // Calculate statistics using all bills (not just current page)
      const allBills = data.bills || data;
      const totalBills = allBills.length;
      const paidBills = allBills.filter(bill => bill.status === 'paid').length;
      const unpaidBills = allBills.filter(bill => bill.status === 'unpaid').length;
      const totalAmount = allBills.reduce((sum, bill) => sum + bill.amount, 0);

      setStats({
        totalBills,
        paidBills,
        unpaidBills,
        totalAmount
      });
    } catch (error) {
      console.error('Error fetching bills:', error);
      setBills([]);
      setStats({ totalBills: 0, paidBills: 0, unpaidBills: 0, totalAmount: 0 });
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleRejectBill = async (id) => {
    try {
      await updateBillStatus(id, 'rejected', 'none');
      fetchBills();
    } catch (error) {
      console.error('Error rejecting bill:', error);
      alert('Failed to reject bill. Please try again.');
    }
  };

  const handlePayBill = async (id, gateway) => {
    try {
      await updateBillStatus(id, 'paid', gateway);
      fetchBills();
      setShowPaymentModal(false);
    } catch (error) {
      console.error('Error paying bill:', error);
      alert('Failed to process payment. Please try again.');
    }
  };

  const openPaymentModal = (id) => {
    setSelectedBillId(id);
    setShowPaymentModal(true);
  };

  const closePaymentModal = () => {
    setShowPaymentModal(false);
    setSelectedBillId(null);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'status-paid';
      case 'unpaid':
        return 'status-unpaid';
      case 'pending':
        return 'status-pending';
      case 'overdue':
        return 'status-overdue';
      default:
        return '';
    }
  };

  const getStatCardColor = (type) => {
    switch (type) {
      case 'total':
        return 'stat-card-total';
      case 'paid':
        return 'stat-card-paid';
      case 'unpaid':
        return 'stat-card-unpaid';
      case 'overdue':
        return 'stat-card-overdue';
      default:
        return '';
    }
 };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'paid':
        return <CheckCircleOutlined className="status-icon paid" />;
      case 'unpaid':
        return <CloseCircleOutlined className="status-icon unpaid" />;
      case 'pending':
        return <ExclamationCircleOutlined className="status-icon pending" />;
      case 'overdue':
        return <ExclamationCircleOutlined className="status-icon overdue" />;
      default:
        return <ExclamationCircleOutlined className="status-icon" />;
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    const d = new Date(date);
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="billing-dashboard">
      <BackButton />
      <div className="dashboard-header">
        <h2 className="dashboard-title">Billing Management</h2>
        <p className="dashboard-subtitle">Manage student bills and billing templates</p>
      </div>

      <div className="dashboard-stats">
        <div className={`stat-card ${getStatCardColor('total')}`}>
          <div className="stat-icon">
            <BarChartOutlined />
          </div>
          <h3>Total Bills</h3>
          <p className="stat-value">{stats.totalBills}</p>
        </div>
        <div className={`stat-card ${getStatCardColor('paid')}`}>
          <div className="stat-icon">
            <CheckCircleOutlined />
          </div>
          <h3>Paid Bills</h3>
          <p className="stat-value">{stats.paidBills}</p>
        </div>
        <div className={`stat-card ${getStatCardColor('unpaid')}`}>
          <div className="stat-icon">
            <CloseCircleOutlined />
          </div>
          <h3>Unpaid Bills</h3>
          <p className="stat-value">{stats.unpaidBills}</p>
        </div>
        <div className={`stat-card ${getStatCardColor('total')}`}>
          <div className="stat-icon">
            <DollarOutlined />
          </div>
          <h3>Total Amount</h3>
          <p className="stat-value">{formatCurrency(stats.totalAmount)}</p>
        </div>
      </div>

      <SegmentedButton
        options={[
          { label: 'Bills', value: 'bills' },
          { label: 'Billing Templates', value: 'template' },
          { label: 'Generate Bills', value: 'generate' },
          { label: 'Class Payment Management', value: 'class-payment-management' }
        ]}
        value={activeTab}
        onChange={setActiveTab}
      />

      {activeTab === 'bills' && (
        <>
          <div className="filters-section">
            <div className="filter-group">
              <label htmlFor="student">Student ID</label>
              <input
                type="text"
                id="student"
                name="student"
                value={filters.student}
                onChange={handleFilterChange}
                className="filter-input"
                placeholder="Enter student ID"
              />
            </div>

            <div className="filter-group">
              <label htmlFor="status">Status</label>
              <select
                id="status"
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="filter-select"
              >
                <option value="">All</option>
                <option value="paid">Paid</option>
                <option value="unpaid">Unpaid</option>
                <option value="pending">Pending</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
          </div>

          <div className="bills-list">
            <h3>Bills</h3>
            {loading ? (
              <div className="loading">Loading bills...</div>
            ) : bills.length === 0 ? (
              <div className="no-bills">No bills found.</div>
            ) : (
              <>
                <div className="bills-table-wrapper">
                  <table className="bills-table">
                    <thead>
                      <tr>
                        <th className="fixed-column student-column">Student</th>
                        <th>Template</th>
                        <th>Amount</th>
                        <th>Due Date</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bills.map(bill => (
                        <tr key={bill._id}>
                          <td className="fixed-column student-column" data-label="Student">
                            {bill.student?.name || 'N/A'}
                          </td>
                          <td data-label="Template">{bill.template?.name || 'N/A'}</td>
                          <td data-label="Amount">{formatCurrency(bill.amount)}</td>
                          <td data-label="Due Date">{formatDate(bill.dueDate)}</td>
                          <td data-label="Status" className={getStatusColor(bill.status)}>
                            <span className="status-with-icon">
                              {getStatusIcon(bill.status)}
                              {bill.status}
                            </span>
                          </td>
                          <td data-label="Actions">
                            {bill.status === 'pending' && (
                              <div className="action-buttons">
                                <button
                                  onClick={() => handleRejectBill(bill._id)}
                                  className="action-btn reject-btn"
                                  title="Reject Bill"
                                >
                                  Reject
                                </button>
                                <button
                                  onClick={() => openPaymentModal(bill._id)}
                                  className="action-btn pay-btn"
                                  title="Pay Bill"
                                >
                                  Pay
                                </button>
                              </div>
                            )}
                            {bill.status === 'overdue' && (
                              <div className="action-buttons">
                                <button
                                  onClick={() => openPaymentModal(bill._id)}
                                  className="action-btn pay-btn overdue-pay-btn"
                                  title="Pay Overdue Bill"
                                >
                                  Pay Now
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {/* Pagination Controls */}
                <div className="pagination-controls">
                  <div className="pagination-info">
                    Showing {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} bills
                  </div>
                  <div className="pagination-buttons">
                    <button
                      onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                      disabled={pagination.page === 1}
                      className="pagination-btn"
                    >
                      Previous
                    </button>
                    
                    <span className="pagination-current">
                      Page {pagination.page} of {pagination.pages}
                    </span>
                    
                    <button
                      onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.pages, prev.page + 1) }))}
                      disabled={pagination.page === pagination.pages}
                      className="pagination-btn"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </>
      )}

      {activeTab === 'template' && (
        <BillingTemplateManager />
      )}
      {activeTab === 'generate' && (
        <GenerateBillForm onBillGenerated={fetchBills} />
      )}  
      {activeTab === 'class-payment-management' && (
        <ClassPaymentManagement />
      )}

      {/* Payment Gateway Selection Modal */}
      {showPaymentModal && (
        <div className="modal-overlay" onClick={closePaymentModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Select Payment Method</h3>
              <button className="modal-close-btn" onClick={closePaymentModal}>
                ×
              </button>
            </div>
            <div className="payment-gateway-options">
              <button
                className="payment-gateway-btn"
                onClick={() => handlePayBill(selectedBillId, 'credit-card')}
              >
                <div className="payment-icon">
                  <CreditCardOutlined />
                </div>
                <span>Credit Card</span>
              </button>
              <button
                className="payment-gateway-btn"
                onClick={() => handlePayBill(selectedBillId, 'debit-card')}
              >
                <div className="payment-icon">
                  <CreditCardOutlined />
                </div>
                <span>Debit Card</span>
              </button>
              <button
                className="payment-gateway-btn"
                onClick={() => handlePayBill(selectedBillId, 'net-banking')}
              >
                <div className="payment-icon">
                  <BankOutlined />
                </div>
                <span>Net Banking</span>
              </button>
              <button
                className="payment-gateway-btn"
                onClick={() => handlePayBill(selectedBillId, 'upi')}
              >
                <div className="payment-icon">
                  <MobileOutlined />
                </div>
                <span>UPI</span>
              </button>
              <button
                className="payment-gateway-btn"
                onClick={() => handlePayBill(selectedBillId, 'wallet')}
              >
                <div className="payment-icon">
                  <WalletOutlined />
                </div>
                <span>Wallet</span>
              </button>
            </div>
            <div className="modal-actions">
              <button className="cancel-btn" onClick={closePaymentModal}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillingDashboard;
