import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../services/api";

export default function TambahUserByAdmin() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [avatar, setAvatar] = useState(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!fullName || !email || !role) {
      setError("Please fill in all required fields (Full Name, Email, Role).");
      return;
    }
    
    try {
      const response = await api.post('/users', {
        fullName,
        email,
        password: 'password123', // default seeded password for administrative creation
        role,
        phoneNumber
      });
      if (response.status === 'success') {
        alert(`User ${fullName} created successfully! Password: password123`);
        navigate("/dashboard-admin");
      } else {
        setError(response.message || "Failed to create user.");
      }
    } catch (err) {
      setError(err.message || "Failed to create user.");
    }
  };

  return (
    <div className="flex bg-white min-h-screen font-sans">
      {/* Left Sidebar */}
      <div className="flex flex-col shrink-0 items-center bg-[#FBF2FB] py-6 w-64 border-r border-[#DCC8E033] min-h-screen">
        <div className="flex flex-col items-center pb-8 px-5 w-full">
          <span className="text-[#E040A0] text-2xl font-bold cursor-pointer" onClick={() => navigate("/")}>
            {"My Better Grade"}
          </span>
          <span className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">Admin Panel</span>
        </div>
        <div className="flex flex-col items-start px-4 gap-1 w-full flex-1">
          {/* Active User Management */}
          <div className="flex items-center bg-[#E040A0] py-3 px-4 rounded-[9999px] cursor-pointer w-full text-white shadow-md" onClick={() => navigate("/dashboard-admin")}>
            <span className="text-lg mr-3">👥</span>
            <span className="text-sm font-bold" >
              {"User Management"}
            </span>
          </div>
          {/* Log Out */}
          <div className="flex items-center py-3 px-4 rounded-[9999px] cursor-pointer w-full mt-auto text-red-500 hover:bg-red-50 font-bold" onClick={() => { logout(); navigate('/'); }}>
            <span className="text-sm" >
              {"Log Out"}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Area on the Right */}
      <div className="flex flex-col flex-1 min-h-screen bg-[#FEF7FF]">
        {/* Top Navbar */}
        <div className="flex justify-between items-center bg-white py-3 px-8 border-b border-gray-100 h-16">
          <div className="flex items-center bg-[#FBF2FB] py-2 px-3 gap-2 rounded-full border border-[#DCC8E055] w-96">
            <input
              type="text"
              placeholder="Global search..."
              className="text-gray-700 bg-transparent text-sm w-full outline-none"
            />
          </div>
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/profile")}>
            <div className="text-right">
              <span className="text-xs font-bold text-[#2E1A28] block">{user ? user.name : "Admin"}</span>
              <span className="text-[10px] text-[#E040A0] uppercase block">{user ? user.role : "Super Admin"}</span>
            </div>
            <img
              src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/wQwYXX2xM2/uc6jo6mt_expires_30_days.png"} 
              className="w-10 h-10 object-fill rounded-full border-2 border-[#F080C0]"
              alt="avatar"
            />
          </div>
        </div>

        {/* Form content */}
        <div className="flex-1 p-8 flex flex-col gap-8 max-w-[1024px] w-full mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4">
            <button 
              type="button" 
              onClick={() => navigate("/dashboard-admin")}
              className="w-10 h-10 rounded-full bg-[#E040A015] text-[#E040A0] hover:bg-[#E040A025] font-bold text-xl flex items-center justify-center border-0 transition"
            >
              ←
            </button>
            <div>
              <span className="text-[#E040A0] text-xs font-bold uppercase tracking-widest">Add New User</span>
              <h1 className="text-[#2E1A28] text-3xl font-black tracking-tight mt-0.5">Add New User</h1>
              <p className="text-gray-400 text-sm mt-1">Create a new profile for students, instructors, or administrators.</p>
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm font-bold bg-red-50 border border-red-200 py-3 px-6 rounded-full w-full text-center">
              {error}
            </div>
          )}

          {/* Form grid */}
          <form onSubmit={handleSubmit} className="grid grid-cols-[1.8fr_1fr] gap-10 bg-white p-8 rounded-[40px] border border-solid border-[#DCC8E055] shadow-sm">
            {/* Left side inputs */}
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-[#604868] text-xs font-bold uppercase tracking-wider ml-1">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Arabella Rose"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="text-gray-800 bg-[#FBF2FB] text-base py-4 px-6 rounded-full border border-transparent w-full outline-none focus:border-[#E040A0] transition"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[#604868] text-xs font-bold uppercase tracking-wider ml-1">Email Address</label>
                <input
                  type="email"
                  placeholder="arabella@bettergrade.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="text-gray-800 bg-[#FBF2FB] text-base py-4 px-6 rounded-full border border-transparent w-full outline-none focus:border-[#E040A0] transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-[#604868] text-xs font-bold uppercase tracking-wider ml-1">User Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="text-gray-800 bg-[#FBF2FB] text-base py-4 px-6 rounded-full border border-transparent w-full outline-none focus:border-[#E040A0] transition appearance-none cursor-pointer"
                  >
                    <option value="">Select a role</option>
                    <option value="student">Student</option>
                    <option value="teacher">Teacher (Instructor)</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[#604868] text-xs font-bold uppercase tracking-wider ml-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="e.g. 08123456789"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="text-gray-800 bg-[#FBF2FB] text-base py-4 px-6 rounded-full border border-transparent w-full outline-none focus:border-[#E040A0] transition"
                  />
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => navigate("/dashboard-admin")}
                  className="py-3 px-8 text-[#604868] font-bold hover:underline bg-transparent border-0"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-3 px-10 rounded-full bg-[#E040A0] hover:bg-[#c03080] text-white font-bold shadow-[04px16px0rgba(224,64,160,0.15)] border-0 transition"
                >
                  Create User
                </button>
              </div>
            </div>

            {/* Right side: avatar preview info */}
            <div className="flex flex-col gap-4">
              <span className="text-[#604868] text-xs font-bold uppercase tracking-wider ml-1">User Avatar</span>
              
              <div className="border-2 border-dashed border-[#DCC8E0] bg-[#FBF2FB] rounded-[32px] p-6 text-center cursor-pointer hover:bg-[#F2E8F2] transition relative flex flex-col items-center justify-center gap-4 h-64">
                {avatar ? (
                  <img src={avatar} className="w-24 h-24 rounded-full border-2 border-[#E040A0] object-cover" alt="preview" />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center text-gray-400 text-3xl">
                    👤
                  </div>
                )}
                <div className="flex flex-col gap-1">
                  <div className="text-[#E040A0] text-xs font-bold font-sans">Avatar will be default initially</div>
                  <div className="text-[10px] text-gray-400">Can be updated by user in Profile Settings</div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
