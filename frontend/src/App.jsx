import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CourseProvider } from './context/CourseContext';

// Pages
import HomeLandingPage from './pages/HomeLandingPage';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import DashboardStudent from './pages/Dashboard/DashboardStudent';
import DashboardAdmin from './pages/Dashboard/DashboardAdmin';
import TambahUserByAdmin from './pages/Admin/TambahUserByAdmin';
import EditUserByAdmin from './pages/Admin/EditUserByAdmin';
import CourseList from './pages/Courses/CourseList';
import CourseDetail from './pages/Courses/CourseDetail';
import AddCourse from './pages/Courses/AddCourse';
import AssignmentList from './pages/Assignments/AssignmentList';
import SubmitAssignment from './pages/Assignments/SubmitAssignment';
import AcademicProgress from './pages/Progress/AcademicProgress';
import Profile from './pages/Profile/Profile';
import Settings from './pages/Profile/Settings';
import AddAssignment from './pages/Assignments/AddAssignment';

// 1. Penjaga Rute Umum: Wajib Login dulu. Kalau belum login, paksa lempar ke /login
function ProtectedRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

// 2. Penjaga Rute Khusus Admin: Hanya role 'admin' yang bisa masuk. Kalau bukan, lempar ke /dashboard
function AdminRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return user.role === 'admin' ? children : <Navigate to="/dashboard" replace />;
}

// 3. Penjaga Rute Student & Teacher: Hanya role 'student' atau 'teacher' yang boleh masuk
function StudentOrTeacherRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return (user.role === 'student' || user.role === 'teacher') ? children : <Navigate to="/dashboard-admin" replace />;
}

// Pengarah Otomatis Dashboard: Mengarahkan user ke layar dashboard yang sesuai dengan role-nya
function DashboardRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'admin') {
    return <Navigate to="/dashboard-admin" replace />;
  }
  return <Navigate to="/dashboard" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <CourseProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomeLandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Role-based Dashboards */}
            <Route
              path="/dashboard"
              element={
                <StudentOrTeacherRoute>
                  <DashboardStudent />
                </StudentOrTeacherRoute>
              }
            />
            <Route
              path="/dashboard-admin"
              element={
                <AdminRoute>
                  <DashboardAdmin />
                </AdminRoute>
              }
            />

            {/* Admin Actions */}
            <Route
              path="/add-user"
              element={
                <AdminRoute>
                  <TambahUserByAdmin />
                </AdminRoute>
              }
            />
            <Route
              path="/edit-user/:id"
              element={
                <AdminRoute>
                  <EditUserByAdmin />
                </AdminRoute>
              }
            />

            {/* Teacher Actions */}
            <Route
              path="/add-course"
              element={
                <StudentOrTeacherRoute>
                  <AddCourse />
                </StudentOrTeacherRoute>
              }
            />
            <Route
              path="/add-assignment"
              element={
                <StudentOrTeacherRoute>
                  <AddAssignment />
                </StudentOrTeacherRoute>
              }
            />

            {/* Common Protected Routes */}
            <Route
              path="/my-courses"
              element={
                <ProtectedRoute>
                  <CourseList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/course-detail"
              element={
                <ProtectedRoute>
                  <CourseDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />

            {/* Student/Teacher Specific Routes */}
            <Route
              path="/assignments"
              element={
                <StudentOrTeacherRoute>
                  <AssignmentList />
                </StudentOrTeacherRoute>
              }
            />
            <Route
              path="/submit-assignment"
              element={
                <StudentOrTeacherRoute>
                  <SubmitAssignment />
                </StudentOrTeacherRoute>
              }
            />
            <Route
              path="/academic-progress"
              element={
                <StudentOrTeacherRoute>
                  <AcademicProgress />
                </StudentOrTeacherRoute>
              }
            />

            {/* Fallbacks */}
            <Route path="/dashboard-redirect" element={<DashboardRedirect />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </CourseProvider>
    </AuthProvider>
  );
}
