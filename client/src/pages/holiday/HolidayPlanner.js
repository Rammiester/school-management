import React, { useState, useEffect } from "react";
import { getHolidays, addHoliday, deleteHoliday, getUsersWithoutLeave, applyForLeave, getLeaveRequests, getLeaveRequestsForUser, updateLeaveStatus } from "../../api/index.js";
import { Calendar } from 'antd';
import dayjs from 'dayjs';
import "./Holiday.css";
import Loading from "../../components/LoadingComponent/Loading.js";
import BackButton from "../../components/BackButton";

const HolidayPlanner = () => {
  const [holidays, setHolidays] = useState([]);
  const [date, setDate] = useState(new Date());
  const [description, setDescription] = useState("");
  const [usersWithoutLeave, setUsersWithoutLeave] = useState([]);
  const [currentUserRole, setCurrentUserRole] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLeaveForm, setShowLeaveForm] = useState(false);
  const [leaveData, setLeaveData] = useState({
    startDate: "",
    endDate: "",
    reason: ""
  });
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [leaveLoading, setLeaveLoading] = useState(false);

  useEffect(() => {
    // Get user role from localStorage
    const storedUser = localStorage.getItem("user");
    let storedUserRole = "";
    let storedUserObject = null;

    if (storedUser) {
      try {
        const userObject = JSON.parse(storedUser);
        storedUserRole = userObject.role;
        storedUserObject = userObject;
      } catch (error) {
        console.error("Error parsing user from localStorage:", error);
      }
    }

    setCurrentUserRole(storedUserRole);
    setCurrentUser(storedUserObject);

    const fetchData = async () => {
      try {
        await fetchHolidays();
        // Fetch users without leave if user is chairman
        if (storedUserRole === "chairman") {
          await fetchUsersWithoutLeave();
        }
        // Fetch leave requests if user is staff/teacher or chairman
        if (storedUserRole === "chairman" || storedUserRole === "teacher" || storedUserRole === "staff") {
          await fetchLeaveRequests();
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const fetchHolidays = async () => {
    try {
      const res = await getHolidays();
      setHolidays(res.data);
    } catch (error) {
      console.error("Error fetching holidays:", error);
    }
  };

  const fetchUsersWithoutLeave = async () => {
    try {
      const res = await getUsersWithoutLeave();
      setUsersWithoutLeave(res.data);
    } catch (error) {
      console.error("Error fetching users without leave:", error);
      // Set to empty array on error to prevent UI issues
      setUsersWithoutLeave([]);
    }
  };

  const fetchLeaveRequests = async () => {
    try {
      if (currentUserRole === "chairman") {
        // Fetch all leave requests for chairman
        const res = await getLeaveRequests();
        setLeaveRequests(res.data);
      } else {
        // Fetch leave requests for current user
        const res = await getLeaveRequestsForUser(currentUser._id);
        setLeaveRequests(res.data);
      }
    } catch (error) {
      console.error("Error fetching leave requests:", error);
    }
  };

  const addHoliday = async (e) => {
    e.preventDefault();
    try {
      const newHoliday = { date, description };
      await addHoliday(newHoliday);
      fetchHolidays();
      setDate(new Date());
      setDescription("");
    } catch (error) {
      console.error("Error adding holiday:", error);
    }
  };

  const deleteHoliday = async (id) => {
    try {
      await deleteHoliday(id);
      fetchHolidays();
    } catch (error) {
      console.error("Error deleting holiday:", error);
    }
  };

  const applyForLeave = async (e) => {
    e.preventDefault();
    try {
      if (!leaveData.startDate || !leaveData.endDate || !leaveData.reason) {
        alert("Please fill in all fields");
        return;
      }

      const leaveRequest = {
        userId: currentUser._id,
        userName: currentUser.name,
        userEmail: currentUser.email,
        role: currentUserRole,
        startDate: leaveData.startDate,
        endDate: leaveData.endDate,
        reason: leaveData.reason
      };

      await applyForLeave(leaveRequest);
      setLeaveData({ startDate: "", endDate: "", reason: "" });
      setShowLeaveForm(false);
      fetchLeaveRequests(); // Refresh leave requests
      alert("Leave request submitted successfully!");
    } catch (error) {
      console.error("Error applying for leave:", error);
      alert("Error submitting leave request. Please try again.");
    }
  };

  const updateLeaveStatus = async (leaveId, status) => {
    try {
      await updateLeaveStatus(leaveId, status);
      fetchLeaveRequests(); // Refresh leave requests
      alert("Leave status updated successfully!");
    } catch (error) {
      console.error("Error updating leave status:", error);
      alert("Error updating leave status. Please try again.");
    }
  };


  // Loading state handling
  if (loading) {
    return (
      <div className="holiday-loading-overlay">
        <Loading message="Loading holidays..." />
      </div>
    );
  }

  return (
    <div>
      <div style={{paddingLeft:'25px'}}><BackButton/></div>
      <div className={`holiday-container ${currentUserRole === "chairman" ? "chairman-view" : "non-chairman-view"}`}>
        <div className="sidebar">
          {currentUserRole === "chairman" && (
            <div className="chairman-view">
              <h3>Users Who Haven't Taken a Holiday</h3>
              <p style={{ fontSize: '0.9rem', marginBottom: '10px', color: 'var(--subtext-light)' }}>
                {usersWithoutLeave.length} user{usersWithoutLeave.length !== 1 ? 's' : ''} found
              </p>
              <ul>
                {usersWithoutLeave.length > 0 ? (
                  usersWithoutLeave.map((user) => (
                    <li key={user._id}>
                      <span>{user.name}</span>
                      <span className="user-status">No leave taken</span>
                    </li>
                  ))
                ) : (
                  <p>No users found without leave.</p>
                )}
              </ul>
            </div>
          )}
          <div className="holiday-list">
            <h2>Upcoming Holidays</h2>
            <ul>
              {holidays.map((holiday) => (
                <li key={holiday._id}>
                  {new Date(holiday.date).toLocaleDateString()} -{" "}
                  {holiday.description}
                  {currentUserRole === "chairman" && (
                    <button onClick={() => deleteHoliday(holiday._id)}>
                      Delete
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>
          {/* Leave Requests Display */}
          {(currentUserRole === "chairman" || currentUserRole === "teacher" || currentUserRole === "staff") && (
            <div className="leave-requests-container">
              <h2>Leave Requests</h2>
              {leaveRequests.length > 0 ? (
                <ul className="leave-requests-list">
                  {leaveRequests.map((leave) => (
                    <li key={leave._id} className={`leave-request-item ${leave.status}`}>
                      <div className="leave-request-info">
                        <strong>{leave.userName}</strong> ({leave.role})
                        <p><strong>From:</strong> {new Date(leave.startDate).toLocaleDateString()}</p>
                        <p><strong>To:</strong> {new Date(leave.endDate).toLocaleDateString()}</p>
                        <p><strong>Reason:</strong> {leave.reason}</p>
                        <p><strong>Status:</strong> <span className={`status ${leave.status}`}>{leave.status}</span></p>
                      </div>
                      {currentUserRole === "chairman" && (
                        <div className="leave-request-actions">
                          <button
                            onClick={() => updateLeaveStatus(leave._id, "approved")}
                            disabled={leave.status !== "pending"}
                            className="approve-btn"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => updateLeaveStatus(leave._id, "rejected")}
                            disabled={leave.status !== "pending"}
                            className="reject-btn"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No leave requests found.</p>
              )}
            </div>
          )}
        </div>
        <main className="main-content">
          {/* Leave Request Form - for staff and teachers */}
          {(currentUserRole === "teacher" || currentUserRole === "staff") && (
            <div className="leave-request-form" >
              <h2>Leave Request</h2>
              {!showLeaveForm ? (
                <button onClick={() => setShowLeaveForm(true)}>Apply for Leave</button>
              ) : (
                <form onSubmit={applyForLeave}>
                  <div className="leave-form-group">
                    <label>Start Date:</label>
                    <input
                      type="date"
                      value={leaveData.startDate}
                      onChange={(e) => setLeaveData({ ...leaveData, startDate: e.target.value })}
                      required
                    />
                  </div>
                  <div className="leave-form-group">
                    <label>End Date:</label>
                    <input
                      type="date"
                      value={leaveData.endDate}
                      onChange={(e) => setLeaveData({ ...leaveData, endDate: e.target.value })}
                      required
                    />
                  </div>
                  <div className="leave-form-group">
                    <label>Reason:</label>
                    <textarea
                      placeholder="Enter reason for leave"
                      value={leaveData.reason}
                      onChange={(e) => setLeaveData({ ...leaveData, reason: e.target.value })}
                      required
                      rows="3"
                    />
                  </div>
                  <div className="leave-form-buttons">
                    <button type="submit">Submit Leave Request</button>
                    <button type="button" onClick={() => setShowLeaveForm(false)}>Cancel</button>
                  </div>
                </form>
              )}
            </div>
          )}
          <div className="calendar-container">
            <Calendar
              fullscreen={false}
              onChange={(newDate) => {
                setDate(newDate.toDate());
              }}
              value={dayjs(date)}
              dateCellRender={(day) => {
                const dayDate = day.toDate();
                const holiday = holidays.find(
                  (h) => new Date(h.date).toDateString() === dayDate.toDateString()
                );
                if (holiday) {
                  return <div className="holiday-description">{holiday.description}</div>;
                }
                return null;
              }}
            />
          </div>
          {currentUserRole === "chairman" && (
            <div className="holiday-form">
              <h2>Add Holiday</h2>
              <form onSubmit={addHoliday}>
                <input
                  type="date"
                  value={date.toISOString().split("T")[0]}
                  onChange={(e) => setDate(new Date(e.target.value))}
                  required
                />
                <input
                  type="text"
                  placeholder="Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
                <button type="submit">Add Holiday</button>
              </form>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default HolidayPlanner;
