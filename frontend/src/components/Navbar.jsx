import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="flex justify-between items-center bg-white py-4 px-8 border-b">
      <Link to="/" className="text-[#E040A0] text-xl font-bold">My Better Grade</Link>
      <div className="flex gap-4 items-center">
        <Link to="/" className="text-gray-600 hover:text-[#E040A0]">Home</Link>
        {user ? (
          <>
            <Link to={user.role === 'admin' ? '/dashboard-admin' : '/dashboard'} className="text-gray-600 hover:text-[#E040A0]">Dashboard</Link>
            <span className="text-sm font-medium text-gray-500">Hello, {user.name} ({user.role})</span>
            <button onClick={() => { logout(); navigate('/'); }} className="text-red-500 hover:underline">Log Out</button>
          </>
        ) : (
          <>
            <Link to="/login" className="text-gray-600 hover:text-[#E040A0]">Log In</Link>
            <Link to="/register" className="text-gray-600 hover:text-[#E040A0]">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}
