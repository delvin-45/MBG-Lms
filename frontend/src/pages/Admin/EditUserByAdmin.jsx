import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../services/api";

export default function EditUserByAdmin() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, logout } = useAuth();

  // Form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('');
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get(`/users/${id}`);
        if (response.status === 'success' && response.data) {
          const u = response.data;
          setFullName(u.fullName || '');
          setEmail(u.email || '');
          setRole(u.role || '');
          setStatus(u.status || 'active');
          setAvatarPreview(u.avatarUrl || null);
        } else {
          setError("Failed to fetch user data.");
        }
      } catch (err) {
        setError(err.message || "Failed to fetch user data.");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchUser();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!fullName || !email || !role) {
      setError("Please fill in all required fields (Full Name, Email, Role).");
      return;
    }
    
    try {
      const response = await api.put(`/users/${id}`, {
        fullName,
        email,
        role,
        status,
        avatarUrl: avatarPreview || null,
      });
      if (response.status === 'success') {
        alert(`User ${fullName} updated successfully!`);
        navigate("/dashboard-admin");
      } else {
        setError(response.message || "Failed to update user.");
      }
    } catch (err) {
      setError(err.message || "Failed to update user.");
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError('Ukuran gambar tidak boleh melebihi 2MB.');
        return;
      }
      if (!['image/jpeg', 'image/png'].includes(file.type)) {
        setError('Format gambar harus JPG atau PNG.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FEF7FF]">
        <span className="text-[#E040A0] font-bold text-xl animate-pulse">Loading user data...</span>
      </div>
    );
  }

  return (
    <div className="flex bg-gradient-to-b from-[#FEF7FF] to-white min-h-screen font-sans">
      {/* Left Sidebar */}
      <div className="w-[288px] bg-[#FBF2FB] p-4 flex flex-col justify-between shrink-0 min-h-screen border-r border-[#DCC8E033]">
        <div className="flex flex-col gap-1 w-full">
          <div className="h-[71px] px-4 flex items-center gap-3 mb-4 cursor-pointer" onClick={() => navigate("/")}>
            <div className="w-12 h-12 relative bg-[#E040A0] rounded-full flex justify-center items-center shadow-md overflow-hidden shrink-0">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} className="w-full h-full object-cover" alt="avatar" />
              ) : (
                <span className="text-white text-2xl font-black">{user?.name ? user.name.charAt(0).toUpperCase() : 'M'}</span>
              )}
            </div>
            <div className="flex flex-col flex-1 overflow-hidden">
              <span className="text-[#E040A0] text-xl font-black leading-tight line-clamp-2 break-words" title={user?.name || "MBG Admin"}>{user?.name || "MBG Admin"}</span>
            </div>
          </div>
          
          <div className="w-[256px] px-6 py-3 bg-[#F080C0] shadow-md rounded-full flex items-center gap-3 cursor-pointer hover:bg-[#E040A0] transition" onClick={() => navigate("/dashboard-admin")}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="#2E1A28" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
            </svg>
            <span className="text-[#2E1A28] text-base font-bold">User Management</span>
          </div>
        </div>

        <div className="w-[256px] pt-4 mt-auto border-t border-[rgba(220,200,224,0.30)] flex flex-col">
          <div className="w-full px-6 py-3 rounded-full flex items-center gap-3 cursor-pointer hover:bg-red-50 transition" onClick={() => { logout(); navigate('/'); }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="#907898" xmlns="http://www.w3.org/2000/svg">
              <path d="M13 3L11.86 4.14L14.71 7H4V9H14.71L11.86 11.86L13 13L18 8L13 3ZM8 16H2V2H8V0H2C0.9 0 0 2V16C0 17.1 0.9 18 2 18H8V16Z"/>
            </svg>
            <span className="text-[#604868] text-base font-medium">Log Out</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-h-screen">
        {/* Top Navbar */}
        <div className="h-16 px-6 bg-[#FEF7FF] shadow-[0_1px_2px_rgba(0,0,0,0.05)] flex justify-between items-center w-full z-10">
          <div className="w-[400px] px-4 py-2 bg-[#F2E8F2] rounded-full flex items-center">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="#DCC8E0" xmlns="http://www.w3.org/2000/svg" className="mr-2">
              <path d="M12.5 11H11.71L11.43 10.73C12.41 9.59 13 8.11 13 6.5C13 2.91 10.09 0 6.5 0C2.91 0 0 2.91 0 6.5C0 10.09 2.91 13 6.5 13C8.11 13 9.59 12.41 10.73 11.43L11 11.71V12.5L16 17.49L17.49 16L12.5 11ZM6.5 11C4.01 11 2 8.99 2 6.5C2 4.01 4.01 2 6.5 2C8.99 2 11 4.01 11 6.5C11 8.99 8.99 11 6.5 11Z"/>
            </svg>
            <input
              type="text"
              placeholder="Global search..."
              className="bg-transparent outline-none w-full text-sm text-[#604868] placeholder:text-[#DCC8E0]"
            />
          </div>
          <div className="flex items-center gap-4">
            <div className="w-px h-8 bg-[#DCC8E0]"></div>
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/profile")}>
              <div className="flex flex-col items-end">
                <span className="text-[#2E1A28] text-xs font-bold leading-tight">{user ? user.name : "Admin User"}</span>
                <span className="text-[#E040A0] text-[10px] font-medium leading-tight">{user ? user.role : "Super Admin"}</span>
              </div>
              <img
                src={user?.avatarUrl || "https://placehold.co/40x40"}
                className="w-10 h-10 rounded-full border-2 border-[#F080C0] object-cover"
                alt="avatar"
              />
            </div>
          </div>
        </div>

        {/* Form Content area */}
        <div className="p-8 flex flex-col gap-6 w-full max-w-[1200px] mx-auto flex-1">
          {/* Header */}
          <div className="flex items-center gap-2">
            <div className="w-1 h-3 bg-zinc-300 rounded-full"></div>
            <span className="text-slate-500 text-xs font-bold uppercase tracking-wide">EDIT USER</span>
          </div>
          <div className="flex flex-col gap-1">
            <h1 className="text-stone-800 text-4xl font-black leading-tight">Edit User</h1>
            <p className="text-zinc-600 text-base font-medium">Update the profile for this user account.</p>
          </div>

          {error && (
            <div className="text-red-500 text-sm font-bold bg-red-50 border border-red-200 py-3 px-6 rounded-full w-full text-center">
              {error}
            </div>
          )}

          {/* Main Form Container */}
          <div className="mt-2 relative bg-[#FEF7FF] rounded-[48px] p-8 outline outline-1 outline-gray-200 shadow-[0_4px_16px_rgba(224,64,160,0.15)] overflow-hidden">
            {/* Aesthetic blur circle */}
            <div className="w-48 h-48 absolute -top-10 -right-10 bg-[#E040A0]/10 rounded-full blur-[40px] pointer-events-none" />

            <form onSubmit={handleSubmit} className="flex gap-10 relative z-10 w-full">
              <div className="flex-1 flex flex-col gap-6 w-full">
                
                {/* Row 1: Full Name & Email */}
                <div className="flex w-full gap-6">
                  {/* Full Name */}
                  <div className="flex-1 flex flex-col gap-2">
                    <label className="text-[#DCC8E0] text-sm font-bold ml-1">Full Name</label>
                    <div className="relative w-full">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center text-[#E040A0]">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                          <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                      </div>
                      <input
                        type="text"
                        placeholder="e.g. Arabella Rose"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full pl-[50px] pr-4 py-3 bg-[#FBF2FB] rounded-full text-stone-800 text-base placeholder:text-[#DCC8E0] outline-none focus:ring-2 focus:ring-[#E040A0]/30 transition"
                      />
                    </div>
                  </div>

                  {/* Email Address */}
                  <div className="flex-1 flex flex-col gap-2">
                    <label className="text-[#DCC8E0] text-sm font-bold ml-1">Email Address</label>
                    <div className="relative w-full">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center text-[#E040A0]">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                          <polyline points="22,6 12,13 2,6"></polyline>
                        </svg>
                      </div>
                      <input
                        type="email"
                        placeholder="arabella@bettergrade.edu"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-[50px] pr-4 py-3 bg-[#FBF2FB] rounded-full text-stone-800 text-base placeholder:text-[#DCC8E0] outline-none focus:ring-2 focus:ring-[#E040A0]/30 transition"
                      />
                    </div>
                  </div>
                </div>

                {/* Row 2: User Role & Department */}
                <div className="flex w-full gap-6">
                  {/* User Role */}
                  <div className="flex-1 flex flex-col gap-2">
                    <label className="text-[#DCC8E0] text-sm font-bold ml-1">User Role</label>
                    <div className="relative w-full">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center text-[#E040A0]">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                        </svg>
                      </div>
                      <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className={`w-full pl-[50px] pr-10 py-3 bg-[#FBF2FB] rounded-full text-base outline-none focus:ring-2 focus:ring-[#E040A0]/30 transition appearance-none cursor-pointer ${role === "" ? "text-[#DCC8E0]" : "text-stone-800"}`}
                      >
                        <option value="" disabled>Select a role</option>
                        <option value="student">Student</option>
                        <option value="teacher">Instructor</option>
                        <option value="admin">Administrator</option>
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none flex items-center justify-center text-gray-500">
                        <svg width="12" height="8" viewBox="0 0 12 8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 1L6 6L11 1"></path>
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div className="flex-1"></div>
                </div>

                {/* Row 3: Status */}
                <div className="flex w-full gap-6">
                  {/* Status */}
                  <div className="flex-1 flex flex-col gap-2">
                    <label className="text-[#DCC8E0] text-sm font-bold ml-1">Account Status</label>
                    <div className="relative w-full">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center text-[#E040A0]">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                          <polyline points="22 4 12 14.01 9 11.01"></polyline>
                        </svg>
                      </div>
                      <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className={`w-full pl-[50px] pr-10 py-3 bg-[#FBF2FB] rounded-full text-base outline-none focus:ring-2 focus:ring-[#E040A0]/30 transition appearance-none cursor-pointer ${status === "" ? "text-[#DCC8E0]" : "text-stone-800"}`}
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none flex items-center justify-center text-gray-500">
                        <svg width="12" height="8" viewBox="0 0 12 8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 1L6 6L11 1"></path>
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div className="flex-1"></div>
                </div>

                <div className="flex justify-end items-center gap-4 mt-6 pt-6 border-t border-[#FBF2FB]">
                  <button
                    type="button"
                    onClick={() => navigate("/dashboard-admin")}
                    className="px-8 py-3 rounded-full text-zinc-600 text-base font-bold transition hover:bg-gray-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-10 py-3 bg-[#E040A0] text-white text-base font-bold rounded-full shadow-[0_4px_16px_rgba(224,64,160,0.30)] hover:bg-[#c03080] transition cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>
              </div>

              {/* Right Side: Profile Image & Info */}
              <div className="w-[320px] flex flex-col gap-6">
                
                {/* Profile Image Box */}
                <div className="p-6 bg-[#FBF2FB] rounded-[48px] shadow-[0_4px_16px_rgba(124,82,170,0.15)] outline outline-1 outline-gray-200 flex flex-col items-center gap-6">
                  <div className="text-center text-slate-500 text-lg font-bold">Profile Image</div>
                  <div className="relative">
                    <div className="w-36 h-36 bg-[#FBF2FB] rounded-full outline outline-4 outline-[#f472b6]/50 flex flex-col justify-center items-center gap-1 overflow-hidden cursor-pointer hover:bg-pink-50 transition relative group">
                      {avatarPreview ? (
                        <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex flex-col items-center gap-1">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f472b6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="17 8 12 3 7 8"></polyline>
                            <line x1="12" y1="3" x2="12" y2="15"></line>
                          </svg>
                          <span className="text-[#f472b6] text-[10px] font-bold uppercase mt-1">UPLOAD PHOTO</span>
                        </div>
                      )}
                      {avatarPreview && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-white text-xs font-bold uppercase">Change Photo</span>
                        </div>
                      )}
                      <input type="file" accept="image/png, image/jpeg" onChange={handleAvatarChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                    </div>
                    {/* Floating Add icon */}
                    <div className="absolute right-0 bottom-0 w-10 h-10 bg-slate-500 rounded-full outline outline-4 outline-white flex justify-center items-center shadow-lg pointer-events-none">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                      </svg>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 w-full">
                    <div className="w-full p-3 bg-white/60 rounded-[32px] flex flex-col gap-1">
                      <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-wide">FORMAT</span>
                      <span className="text-stone-800 text-sm font-medium">JPG /PNG,(Max 2MB)</span>
                    </div>
                    <div className="w-full p-3 bg-white/60 rounded-[32px] border-l-4 border-[#E040A0] flex flex-col gap-1">
                      <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-wide">RECOMMENDED</span>
                      <span className="text-stone-800 text-sm font-medium">Min dimensions 400x400px</span>
                    </div>
                  </div>
                </div>

                {/* Privilege Control Box */}
                <div className="p-5 bg-sky-400/10 rounded-[32px] outline outline-1 outline-sky-400/30 flex items-start gap-3">
                  <div className="mt-0.5 text-sky-600 shrink-0">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="16" x2="12" y2="12"></line>
                      <line x1="12" y1="8" x2="12.01" y2="8"></line>
                    </svg>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <span className="text-sky-950 text-sm font-bold">Privilege Control</span>
                    <span className="text-sky-950/80 text-xs leading-5">
                      System administrators have full access to platform settings and financial data. Choose user roles carefully to maintain security protocols.
                    </span>
                  </div>
                </div>

              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
