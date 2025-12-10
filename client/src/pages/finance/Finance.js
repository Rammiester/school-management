// pages/finance/Finance.js
import React, { useState, useEffect, useRef } from "react";
import {
  Segmented,
  Card,
  Row,
  Col,
  Statistic,
  Tag,
  DatePicker,
  Button,
  Space,
  Select,
  Input,
} from "antd";
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  FilterOutlined,
  BarChartOutlined,
  DollarOutlined,
  FileSearchOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import FinanceRequests from "./FinanceRequests";
import ChairmanReview from "./ChairmanReview";
import BackButton from "../../components/BackButton";
import { getFinanceStats } from "../../services/financeService";
import RevenueExpensesChart from "../../charts/RevenueExpenseChart";
import TotalRevenueChart from "../../charts/TotalRevenueChart";
import TotalExpenseChart from "../../charts/TotalExpenseChart";
import {
  getFinanceSummary,
  getRevenueExpenseData,
  getRevenueBreakdown,
  getExpenseBreakdown,
} from "../../api";
import dayjs from "dayjs";
import EnhancedLoading from "../../components/LoadingComponent/EnhancedLoading";

// SegmentedButton component with auto-scroll functionality
const SegmentedButton = ({ options, value, onChange }) => {
  const buttonRefs = useRef({});

  const handleButtonClick = (optionValue) => {
    // Store reference to the button element for scrolling
    const buttonElement = buttonRefs.current[optionValue];
    if (buttonElement) {
      // Scroll to the button with smooth behavior
      buttonElement.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
    // Call the original onChange handler
    onChange(optionValue);
  };

  return (
    <div className="segmented-container">
      {options.map((option) => (
        <button
          key={option.value}
          ref={(el) => (buttonRefs.current[option.value] = el)}
          className={`segmented-button ${
            value === option.value ? "active" : ""
          }`}
          onClick={() => handleButtonClick(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};

const Finance = () => {
  const [summaryData, setSummaryData] = useState({
    totalRevenue: 0,
    totalExpenses: 0,
    netProfit: 0,
    pendingRequests: 0,
  });
  const [revenueExpenseData, setRevenueExpenseData] = useState([]);
  const [totalRevenueData, setTotalRevenueData] = useState([]);
  const [totalExpenseData, setTotalExpenseData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingStates, setLoadingStates] = useState({
    summary: false,
    revenueExpense: false,
    revenueBreakdown: false,
    expenseBreakdown: false,
    all: true,
  });
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState([
    dayjs().subtract(5, "month"),
    dayjs(),
  ]); // Default to now to past 4 months
  const [activeTab, setActiveTab] = useState("requests");
  const [requestTypeFilter, setRequestTypeFilter] = useState("");
  const options = [
    { label: "Full view", value: "view" },
    { label: "Finance Requests", value: "requests" },
    { label: "Review Request", value: "review" },
  ];
  
  // Get user role from localStorage
  const getUserRole = () => {
    try {
      const userString = localStorage.getItem("user");
      if (userString) {
        const userData = JSON.parse(userString);
        return userData.role;
      }
      return null;
    } catch (error) {
      console.error("Error getting user role:", error);
      return null;
    }
  };

  const userRole = getUserRole();

  // New type arrays for chart visibility
  const revenueTypes = [
    "school fee",
    "hostel fee",
    "uniform fee",
    "other fees",
    "donation",
    "grant",
    "transport", // keep if transport sometimes considered revenue in your context
  ];
  const expenseTypes = [
    "salary",
    "food",
    "admin office",
    "housekeeping",
    "stationary",
    "other",
    "transport",
  ];

  // Hide 'Full view' and 'Review Request' options for non-chairman users
  const filteredOptions =
    userRole === "chairman"
      ? options
      : options.filter(
          (option) => option.value !== "view" && option.value !== "review"
        );

  const getDateRangeParams = () => {
    if (!dateRange || dateRange.length !== 2) {
      return { startDate: null, endDate: null };
    }
    const [startDate, endDate] = dateRange;
    return {
      startDate: startDate.toISOString().split("T")[0],
      endDate: endDate.toISOString().split("T")[0],
    };
  };

  const fetchFinanceData = async () => {
    try {
      setLoadingStates((prev) => ({ ...prev, all: true }));
      const { startDate, endDate } = getDateRangeParams();

      // Set individual loading states
      setLoadingStates((prev) => ({
        ...prev,
        summary: true,
        revenueExpense: true,
        revenueBreakdown: true,
        expenseBreakdown: true,
      }));

      const [summaryResponse, revenueExpenseResponse] = await Promise.all([
        getFinanceSummary(startDate, endDate, requestTypeFilter).finally(() =>
          setLoadingStates((prev) => ({ ...prev, summary: false }))
        ),
        getRevenueExpenseData(startDate, endDate, requestTypeFilter).finally(
          () => setLoadingStates((prev) => ({ ...prev, revenueExpense: false }))
        ),
      ]);

      // Always fetch breakdown data for the current filter
      const [revenueBreakdownResponse, expenseBreakdownResponse] =
        await Promise.all([
          getRevenueBreakdown(startDate, endDate, requestTypeFilter).finally(
            () =>
              setLoadingStates((prev) => ({ ...prev, revenueBreakdown: false }))
          ),
          getExpenseBreakdown(startDate, endDate, requestTypeFilter).finally(
            () =>
              setLoadingStates((prev) => ({ ...prev, expenseBreakdown: false }))
          ),
        ]);

      const summary = summaryResponse.data;
      setSummaryData({
        totalRevenue: summary.totalRevenue,
        totalExpenses: summary.totalExpenses,
        netProfit: summary.netProfit,
        pendingRequests: summary.pendingRequests,
      });

      // set revenueExpense data as-is (the chart component is resilient to envelope vs array)
      setRevenueExpenseData(revenueExpenseResponse.data);
      console.log(
        "Fetched Revenue and Expense Data:",
        revenueExpenseResponse.data
      );

      setTotalRevenueData(
        revenueBreakdownResponse?.data ? [revenueBreakdownResponse.data] : []
      );
      setTotalExpenseData(
        expenseBreakdownResponse?.data ? [expenseBreakdownResponse.data] : []
      );
      setLoading(false);
      setLoadingStates((prev) => ({ ...prev, all: false }));
    } catch (err) {
      console.error("Error fetching finance data:", err);
      setError(err.message);
      setLoading(false);
      setLoadingStates((prev) => ({ ...prev, all: false }));
    }
  };

  useEffect(() => {
    fetchFinanceData();
  }, [dateRange, requestTypeFilter]);

  const handleRequestTypeFilterChange = (value) => {
    setRequestTypeFilter(value);
  };

  if (loading || loadingStates.all) {
    return (
      <div
        className="finance-container"
        style={{
          minHeight: "500px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <EnhancedLoading size="large" message="Loading finance data..." />
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="finance-container"
        style={{
          minHeight: "500px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center", color: "var(--accent-color)" }}>
          <h3>Error loading finance data</h3>
          <p>{error}</p>
          <button
            onClick={fetchFinanceData}
            style={{
              marginTop: "1rem",
              padding: "0.5rem 1rem",
              backgroundColor: "var(--primary-color)",
              color: "var(--text-light-color)",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const formattedSummaryData = [
    {
      name: "Total Revenue",
      value: `₹${summaryData.totalRevenue.toLocaleString()}`,
    },
    {
      name: "Total Expenses",
      value: `₹${summaryData.totalExpenses.toLocaleString()}`,
    },
    { name: "Net Profit", value: `${summaryData.netProfit.toLocaleString()}` },
    { name: "Pending Requests", value: summaryData.pendingRequests },
  ];

  // Determine which charts to show
  const isAll = requestTypeFilter === "";
  const isExpenseOnly =
    requestTypeFilter && expenseTypes.includes(requestTypeFilter);
  const isRevenueOnly =
    requestTypeFilter && revenueTypes.includes(requestTypeFilter);
  const chartShowMode = isExpenseOnly
    ? "expenses"
    : isRevenueOnly
    ? "revenue"
    : "both";

  return (
    <div className="finance-container">
      <BackButton />
      <div>
        <div>
          <SegmentedButton
            options={filteredOptions}
            value={activeTab}
            onChange={setActiveTab}
          />
        </div>
        <div className="finance-content">
          {activeTab === "view" && (
            <div>
              <div
                className="finance-date-range-selector"
                style={{ display: "flex", gap: "10px" }}
              >
                <div style={{ marginBottom: "10px" }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "5px",
                      color: "var(--text-light-color)",
                    }}
                  >
                    Date Range
                  </label>
                  <DatePicker.RangePicker
                    value={dateRange}
                    onChange={(dates) => setDateRange(dates)}
                    style={{ width: "300px" }}
                    format="YYYY-MM-DD"
                    placeholder={["Start date", "End date"]}
                    className="finance-datepicker"
                  />
                </div>
                <div style={{ marginBottom: "10px" }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "5px",
                      color: "var(--text-light-color)",
                    }}
                  >
                    Request Type
                  </label>
                  <select
                    value={requestTypeFilter}
                    onChange={(e) =>
                      handleRequestTypeFilterChange(e.target.value)
                    }
                    style={{
                      padding: "4px 11px",
                      borderRadius: "6px",
                      backgroundColor: "var(--input-background-color)",
                      color: "var(--text-light-color)",
                      border: "1px solid var(--border-color) !important",
                      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                      height: "42px",
                      transition:
                        "border-color 0.3s ease, box-shadow 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.borderColor = "var(--primary-color)";
                      e.target.style.boxShadow =
                        "0 2px 8px rgba(0, 0, 0, 0.15)";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.borderColor = "var(--border-color)";
                      e.target.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.1)";
                    }}
                  >
                    <option value="">All</option>
                    <option value="transport">Transport</option>
                    <option value="salary">Salary</option>
                    <option value="food">Food</option>
                    <option value="admin office">Admin Office</option>
                    <option value="housekeeping">Housekeeping</option>
                    <option value="stationary">Stationary</option>
                    <option value="other">Other</option>
                    <option value="school fee">School Fee</option>
                    <option value="hostel fee">Hostel Fee</option>
                    <option value="uniform fee">Uniform Fee</option>
                    <option value="other fees">Other Fees</option>
                    <option value="donation">Donation</option>
                    <option value="grant">Grant</option>
                  </select>
                </div>
              </div>

              <div className="finance-summary-row">
                {formattedSummaryData.map((item, index) => (
                  <div className="finance-summary-item" key={index}>
                    <div>
                      <Statistic
                        title={item.name}
                        value={item.value}
                        valueStyle={{
                          color:
                            index === 0
                              ? "var(--modal-secondary-color)"
                              : index === 1
                              ? "var(--accent-color)"
                              : index === 2
                              ? "var(--secondary-color)"
                              : "var(--primary-color)",
                        }}
                        prefix={
                          index === 0 ? (
                            <ArrowUpOutlined />
                          ) : index === 1 ? (
                            <ArrowDownOutlined />
                          ) : index === 2 ? (
                            "₹"
                          ) : (
                            <FileSearchOutlined />
                          )
                        }
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Chart area & conditional breakdowns */}
              {!loadingStates.revenueExpense &&
                (() => {
                  const isCombinedVisible = isAll; // show combined main chart only when "All" selected
                  const showMode = chartShowMode; // 'both' | 'revenue' | 'expenses'

                  return (
                    <>
                      {isCombinedVisible && (
                        <div className="finance-chart-container">
                          <h3 className="finance-chart-title">
                            Revenue and Expense Breakdown{" "}
                            {requestTypeFilter
                              ? `(${
                                  requestTypeFilter.charAt(0).toUpperCase() +
                                  requestTypeFilter.slice(1)
                                })`
                              : ""}
                          </h3>
                          {!loadingStates.revenueExpense && (
                            <RevenueExpensesChart
                              data={revenueExpenseData}
                              requestTypeFilter={requestTypeFilter}
                              showOnly={showMode}
                            />
                          )}
                        </div>
                      )}
                     {console.log('Chart flags -> isAll:', isAll, 'isExpenseOnly:', isExpenseOnly, 'isRevenueOnly:', isRevenueOnly, 'requestTypeFilter:', requestTypeFilter)}
                      {/* When All: show both breakdowns side-by-side */}
                      {isAll && (
                        <div className="finance-breakdown-container">
                          <div className="finance-breakdown-item">
                            <h3 className="finance-chart-title">
                              Total Revenue Breakdown
                            </h3>
                            {loadingStates.revenueBreakdown && (
                              <EnhancedLoading
                                size="medium"
                                message="Loading revenue breakdown..."
                              />
                            )}
                            {!loadingStates.revenueBreakdown &&
                              totalRevenueData.length > 0 && (
                                <TotalRevenueChart data={totalRevenueData} />
                              )}
                          </div>

                          <div className="finance-breakdown-item">
                            <h3 className="finance-chart-title">
                              Total Expense Breakdown
                            </h3>
                            {loadingStates.expenseBreakdown && (
                              <EnhancedLoading
                                size="medium"
                                message="Loading expense breakdown..."
                              />
                            )}
                            {!loadingStates.expenseBreakdown &&
                              totalExpenseData.length > 0 && (
                                <TotalExpenseChart data={totalExpenseData} />
                              )}
                          </div>
                        </div>
                      )}

                      {/* If a single expense type is selected -> show only expense breakdown (full width) */}
                      {isExpenseOnly && (
                        <div className="finance-breakdown-container">
                          <div
                            className="finance-breakdown-item"
                            style={{ width: "100%" }}
                          >
                            <h3 className="finance-chart-title">
                              Total Expense Breakdown
                            </h3>
                            {loadingStates.expenseBreakdown ? (
                              <EnhancedLoading
                                size="medium"
                                message="Loading expense breakdown..."
                              />
                            ) : (
                              totalExpenseData.length > 0 && (
                                <TotalExpenseChart data={totalExpenseData} />
                              )
                            )}
                          </div>
                        </div>
                      )}

                      {/* If a single revenue type is selected -> show only revenue breakdown (full width) */}
                      {isRevenueOnly && (
                        <div className="finance-breakdown-container">
                          <div
                            className="finance-breakdown-item"
                            style={{ width: "100%" }}
                          >
                            <h3 className="finance-chart-title">
                              Total Revenue Breakdown
                            </h3>
                            {loadingStates.revenueBreakdown ? (
                              <EnhancedLoading
                                size="medium"
                                message="Loading revenue breakdown..."
                              />
                            ) : (
                              totalRevenueData.length > 0 && (
                                <TotalRevenueChart data={totalRevenueData} />
                              )
                            )}
                          </div>
                        </div>
                      )}
                    </>
                  );
                })()}
            </div>
          )}
          {activeTab === "requests" && <FinanceRequests />}
          {activeTab === "review" && (
            <ChairmanReview fetchFinanceData={fetchFinanceData} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Finance;
