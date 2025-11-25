import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import Dashboard from './pages/dashboard/Dashboard';
import Students from './pages/student/Students';
import Teachers from './pages/teachers/Teachers';
import StaffPage from './pages/staff/StaffPage';
import HolidayPlanner from './pages/holiday/HolidayPlanner';
import SyllabusTracker from './pages/syllubusTracker/SyllabusTracker';
import Login from './pages/login/Login';
import NotFound from './pages/notFound/NotFound';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/navBar/Navbar';
import WelcomePage from './pages/welcomePage/WelcomePage';
import SignUp from './pages/signUp/SignUp';
import AddRevenue from './pages/revenue/AddRevenue';
import Attendance from './pages/attendance/Attendance';
import Timetable from './pages/timetable/Timetable';
import Finance from './pages/finance/Finance';
import DemoLoading from './components/LoadingComponent/DemoLoading';
import Billing from './pages/billing';
import FeedbackForm from './pages/feedback/FeedbackForm';
import SuperuserControlBase from './pages/feedback/SuperuserControlBase';
import EventsListPage from './pages/events/EventsListPage';
import NoticesListPage from './pages/notices/NoticesListPage';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const [theme, setTheme] = useState('light');
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  // Redirect to dashboard on page reload if user is authenticated and not on dashboard
  useEffect(() => {
    // Only redirect if user is authenticated and not on login/signup/dashboard
    if (user && location.pathname !== '/dashboard' && location.pathname !== '/login' && location.pathname !== '/signup') {
      navigate('/dashboard', { replace: true });
    }
  }, []);

  const hideNavbar = ["/login", "/signup"].includes(location.pathname);

  return (
    <div className="app" style={{ paddingTop: hideNavbar ? 0 : '64px' }}>
      {!hideNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />

        <Route path="/dashboard" element={
          <ProtectedRoute /* allowedRoles={['chairman']} */>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/students" element={<ProtectedRoute><Students /></ProtectedRoute>} />
        <Route path="/teachers" element={<ProtectedRoute><Teachers /></ProtectedRoute>} />
        <Route path="/departments" element={<ProtectedRoute><StaffPage /></ProtectedRoute>} />
        <Route path="/sports" element={<ProtectedRoute><StaffPage /></ProtectedRoute>} />
        <Route path="/arts" element={<ProtectedRoute><StaffPage /></ProtectedRoute>} />
        <Route path="/finance" element={<ProtectedRoute><Finance /></ProtectedRoute>} />
        <Route path="/transport" element={<ProtectedRoute><StaffPage /></ProtectedRoute>} />
        <Route path="/hostel" element={<ProtectedRoute><StaffPage /></ProtectedRoute>} />
        <Route path="/holiday-planner" element={<ProtectedRoute><HolidayPlanner /></ProtectedRoute>} />
        <Route path="/syllabus-tracker" element={<ProtectedRoute><SyllabusTracker /></ProtectedRoute>} />
        <Route path="/welcome" element={<ProtectedRoute><WelcomePage /></ProtectedRoute>} />
        <Route
          path="/add-revenue"
          element={
            <ProtectedRoute allowedRoles="admin">
              <AddRevenue />
            </ProtectedRoute>
          }
        />
        <Route path="/attendance" element={<ProtectedRoute><Attendance /></ProtectedRoute>} />
        <Route path="/404" element={<NotFound />} />
        <Route path="/timetable" element={<ProtectedRoute><Timetable /></ProtectedRoute>} />
        <Route path="/billing" element={<ProtectedRoute><Billing /></ProtectedRoute>} />
        <Route path="/feedback" element={<ProtectedRoute><FeedbackForm /></ProtectedRoute>} />
        <Route path="/superuser-feedback" element={<ProtectedRoute allowedRoles="admin"><SuperuserControlBase /></ProtectedRoute>} />
        <Route path="/events-list" element={<ProtectedRoute><EventsListPage /></ProtectedRoute>} />
        <Route path="/notices-list" element={<ProtectedRoute><NoticesListPage /></ProtectedRoute>} />
        <Route path='loading' element={<DemoLoading/>}/>
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </div>
  );
}

export default App;
