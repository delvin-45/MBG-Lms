import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../services/api";

export default function DashboardAdmin() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All Roles");
  const [statusFilter, setStatusFilter] = useState("Status: All");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ page: 1, limit: 10, totalData: 0, totalPage: 1 });

  // Stats
  const [totalUsersCount, setTotalUsersCount] = useState(0);
  const [activeStudentsCount, setActiveStudentsCount] = useState(0);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('limit', 10);
      if (search) params.append('search', search);
      if (roleFilter !== 'All Roles') params.append('role', roleFilter.toLowerCase());
      if (statusFilter !== 'Status: All') params.append('status', statusFilter.toLowerCase());

      const res = await api.get(`/users?${params.toString()}`);
      if (res.status === 'success' && res.data) {
        setUsersList(res.data);
        if (res.meta) {
          setMeta(res.meta);
        }
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const resTotal = await api.get('/users?limit=1');
      if (resTotal.status === 'success' && resTotal.meta) {
        setTotalUsersCount(resTotal.meta.totalData);
      }
      
      const resStudent = await api.get('/users?role=student&status=active&limit=1');
      if (resStudent.status === 'success' && resStudent.meta) {
        setActiveStudentsCount(resStudent.meta.totalData);
      }
    } catch (err) {
      console.error('Failed to load admin stats:', err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, search, roleFilter, statusFilter]);

  useEffect(() => {
    loadStats();
  }, []);

  const handleDeleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        const res = await api.delete(`/users/${userId}`);
        if (res.status === 'success') {
          alert("User deleted successfully");
          fetchUsers();
          loadStats();
        }
      } catch (err) {
        alert(err.message || "Failed to delete user");
      }
    }
  };

  const getRoleColor = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin': return 'bg-[#F080C0] text-[#2E1A28]';
      case 'teacher': return 'bg-[#40C0EE] text-[#00334D]';
      default: return 'bg-[#EEDCFF] text-[#2E2040]';
    }
  };

  return (
    <div className="flex flex-col md:flex-row bg-gradient-to-b from-[#FEF7FF] to-white min-h-screen font-sans">
      {/* Left Sidebar */}
      <div className="w-full md:w-[288px] bg-[#FBF2FB] p-4 flex flex-col justify-between shrink-0 min-h-0 md:min-h-screen border-b md:border-b-0 md:border-r border-[#DCC8E033]">
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
          
          <div className="w-[256px] px-6 py-3 bg-[#E040A0] shadow-[0_4px_16px_rgba(224,64,160,0.20)] rounded-full flex items-center gap-3 cursor-pointer" onClick={() => navigate("/dashboard-admin")}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
            </svg>
            <span className="text-white text-base font-bold">User Management</span>
          </div>
        </div>

        <div className="w-[256px] pt-4 mt-auto border-t border-[rgba(220,200,224,0.30)] flex flex-col">
          <div className="w-full px-6 py-3 rounded-full flex items-center gap-3 cursor-pointer hover:bg-red-50 transition" onClick={() => { logout(); navigate('/'); }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="#907898" xmlns="http://www.w3.org/2000/svg">
              <path d="M13 3L11.86 4.14L14.71 7H4V9H14.71L11.86 11.86L13 13L18 8L13 3ZM8 16H2V2H8V0H2C0.9 0 0 0.9 0 2V16C0 17.1 0.9 18 2 18H8V16Z"/>
            </svg>
            <span className="text-[#604868] text-base font-medium">Log Out</span>
          </div>
        </div>
      </div>

      {/* Main Content Area on the Right */}
      <div className="flex flex-col flex-1 min-h-screen">
        {/* Top Navbar */}
        <div className="py-3 md:h-16 px-4 md:px-6 bg-[#FEF7FF] shadow-[0_1px_2px_rgba(0,0,0,0.05)] flex flex-col-reverse sm:flex-row justify-end items-center w-full z-10 gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/profile")}>
              <div className="flex flex-col items-end">
                <span className="text-[#2E1A28] text-xs font-bold leading-tight">{user ? user.name : "Mas Wowok"}</span>
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

        {/* Dashboard Content area */}
        <div className="p-4 md:p-8 flex flex-col gap-8 w-full max-w-[1200px] mx-auto flex-1">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end w-full gap-4">
            <div className="flex flex-col gap-1">
              <h1 className="text-[#2E1A28] text-3xl md:text-4xl font-black leading-tight">User Management</h1>
            </div>
            <button
              className="px-6 py-3 bg-[#E040A0] shadow-[0_4px_16px_rgba(224,64,160,0.30)] rounded-full flex items-center gap-2 hover:bg-[#c03080] transition cursor-pointer"
              onClick={() => navigate("/add-user")}
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="white" xmlns="http://www.w3.org/2000/svg">
                <path d="M14.25 9.75H9.75V14.25H8.25V9.75H3.75V8.25H8.25V3.75H9.75V8.25H14.25V9.75Z"/>
              </svg>
              <span className="text-white text-base font-bold">Add New User</span>
            </button>
          </div>

          {/* Stats Cards */}
          <div className="flex flex-col sm:flex-row gap-6 w-full">
            <div className="flex-1 p-6 bg-white/70 backdrop-blur-sm rounded-[32px] outline outline-1 outline-[rgba(224,64,160,0.10)] flex flex-col items-start shadow-sm">
              <div className="px-3 py-2 bg-[rgba(240,128,192,0.30)] rounded-full mb-4">
                <svg width="24" height="20" viewBox="0 0 24 20" fill="#E040A0" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16 11C17.66 11 18.99 9.66 18.99 8C18.99 6.34 17.66 5 16 5C14.34 5 13 6.34 13 8C13 9.66 14.34 11 16 11ZM8 11C9.66 11 10.99 9.66 10.99 8C10.99 6.34 9.66 5 8 5C6.34 5 5 6.34 5 8C5 9.66 6.34 11 8 11ZM8 13C5.33 13 0 14.34 0 17V20H16V17C16 14.34 10.67 13 8 13ZM16 13C15.71 13 15.38 13.02 15.03 13.05C16.19 13.89 17 15.02 17 17V20H24V17C24 14.34 18.67 13 16 13Z"/>
                </svg>
              </div>
              <span className="text-[#604868] text-sm font-medium mb-1">Total Users</span>
              <h3 className="text-[#2E1A28] text-3xl font-black">{totalUsersCount}</h3>
            </div>
            <div className="flex-1 p-6 bg-white/70 backdrop-blur-sm rounded-[32px] outline outline-1 outline-[rgba(224,64,160,0.10)] flex flex-col items-start shadow-sm">
              <div className="px-3 py-2 bg-[rgba(238,220,255,0.30)] rounded-full mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7C52AA" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                  <path d="M6 12v5c3 3 9 3 12 0v-5"/>
                </svg>
              </div>
              <span className="text-[#604868] text-sm font-medium mb-1">Active Students</span>
              <h3 className="text-[#2E1A28] text-3xl font-black">{activeStudentsCount}</h3>
            </div>
          </div>

          {/* Filters & Search Table bar */}
          <div className="flex flex-col bg-[#FEF7FF] rounded-[32px] outline outline-1 outline-[#F2E8F2] overflow-hidden shadow-sm">
            <div className="p-4 md:p-6 flex flex-col lg:flex-row justify-between items-start lg:items-center border-b border-[#F2E8F2] w-full gap-4">
              <div className="w-full lg:max-w-[384px] px-4 py-2.5 bg-[#FBF2FB] rounded-full outline outline-1 outline-[rgba(220,200,224,0.30)] flex items-center">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="#DCC8E0" xmlns="http://www.w3.org/2000/svg" className="mr-3">
                  <path d="M12.5 11H11.71L11.43 10.73C12.41 9.59 13 8.11 13 6.5C13 2.91 10.09 0 6.5 0C2.91 0 0 2.91 0 6.5C0 10.09 2.91 13 6.5 13C8.11 13 9.59 12.41 10.73 11.43L11 11.71V12.5L16 17.49L17.49 16L12.5 11ZM6.5 11C4.01 11 2 8.99 2 6.5C2 4.01 4.01 2 6.5 2C8.99 2 11 4.01 11 6.5C11 8.99 8.99 11 6.5 11Z"/>
                </svg>
                <input
                  type="text"
                  placeholder="Search by name, email, or ID..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  className="bg-transparent outline-none w-full text-sm text-[#604868] placeholder:text-[#DCC8E0]"
                />
              </div>
              <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                <div className="relative flex-1 min-w-[140px]">
                  <select
                    value={roleFilter}
                    onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
                    className="appearance-none w-full px-6 py-2.5 bg-[#FBF2FB] rounded-full outline outline-1 outline-[rgba(220,200,224,0.30)] text-sm text-[#604868] cursor-pointer outline-none"
                  >
                    <option>All Roles</option>
                    <option>Student</option>
                    <option>Teacher</option>
                    <option>Admin</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 1L5 5L9 1" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
                {/* Status filter */}
                <div className="relative flex-1 min-w-[140px]">
                  <select 
                    value={statusFilter}
                    onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                    className="appearance-none w-full px-6 py-2.5 bg-[#FBF2FB] rounded-full outline outline-1 outline-[rgba(220,200,224,0.30)] text-sm text-[#604868] cursor-pointer outline-none"
                  >
                    <option>Status: All</option>
                    <option>Active</option>
                    <option>Inactive</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 1L5 5L9 1" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
                <div className="p-2.5 bg-[#FBF2FB] rounded-full outline outline-1 outline-[rgba(220,200,224,0.30)] cursor-pointer hover:bg-[#F2E8F2] transition shrink-0">
                  <svg width="18" height="12" viewBox="0 0 18 12" fill="#604868" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7 12H11V10H7V12ZM0 0V2H18V0H0ZM3 7H15V5H3V7Z"/>
                  </svg>
                </div>
              </div>
            </div>

            {/* Perfect Semantics HTML Table */}
            <div className="w-full overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="bg-[rgba(251,242,251,0.50)] border-b border-[#F2E8F2]">
                    <th className="py-4 px-6 text-[#604868] text-xs font-black uppercase tracking-[0.6px]">USER</th>
                    <th className="py-4 px-6 text-[#604868] text-xs font-black uppercase tracking-[0.6px]">ROLE</th>
                    <th className="py-4 px-6 text-[#604868] text-xs font-black uppercase tracking-[0.6px]">DEPARTMENT</th>
                    <th className="py-4 px-6 text-[#604868] text-xs font-black uppercase tracking-[0.6px]">STATUS</th>
                    <th className="py-4 px-6 text-[#604868] text-xs font-black uppercase tracking-[0.6px] text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F2E8F2]">
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="p-12 text-center text-[#604868] font-bold animate-pulse">Loading accounts database...</td>
                    </tr>
                  ) : usersList.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="p-12 text-center text-[#604868] font-bold">No accounts found matching criteria.</td>
                    </tr>
                  ) : (
                    usersList.map((u) => (
                      <tr key={u.id} className="hover:bg-purple-50/20 transition group">
                        <td className="py-4 px-6 flex items-center gap-3">
                          <img
                            src={u.avatarUrl || "https://placehold.co/40x40"}
                            className="w-10 h-10 rounded-full border-2 border-[rgba(240,128,192,0.50)] object-cover"
                            alt={u.fullName}
                          />
                          <div className="flex flex-col">
                            <span className="text-[#2E1A28] text-sm font-bold">{u.fullName}</span>
                            <span className="text-[#DCC8E0] text-xs font-normal">{u.email}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`px-3 py-1 text-[10px] font-black rounded-full uppercase tracking-wider ${getRoleColor(u.role)}`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-[#604868] text-sm font-medium">
                            {u.department || (u.role?.toLowerCase() === 'student' ? 'Computer Science' : 'Operations')}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${u.status === 'inactive' ? 'bg-[#907898]' : 'bg-[#22C55E]'}`}></div>
                            <span className={`text-xs font-bold ${u.status === 'inactive' ? 'text-[#907898]' : 'text-[#16A34A]'}`}>
                              {u.status === 'inactive' ? 'Inactive' : 'Active'}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            {/* Edit Button */}
                            <button onClick={() => navigate(`/edit-user/${u.id}`)} className="p-2 rounded-full hover:bg-gray-100 transition cursor-pointer">
                              <svg width="15" height="15" viewBox="0 0 15 15" fill="#0096CC" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12.92 0L15 2.08L4.37 12.71H2.29V10.63L12.92 0ZM1.25 13.75H13.75V15H1.25V13.75Z"/>
                              </svg>
                            </button>
                            {/* Delete Button */}
                            {u.id !== user?.id && (
                              <button onClick={() => handleDeleteUser(u.id)} className="p-2 rounded-full hover:bg-red-50 transition cursor-pointer">
                                <svg width="14" height="15" viewBox="0 0 14 15" fill="#E53E3E" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M3.5 13.5C3.5 14.32 4.18 15 5 15H9C9.82 15 10.5 14.32 10.5 13.5V3H3.5V13.5ZM11.25 1.5H8.62L7.87 0.75H6.12L5.37 1.5H2.75V2.5H11.25V1.5Z"/>
                                </svg>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination footer */}
            <div className="flex flex-col sm:flex-row p-4 md:p-6 justify-between items-center border-t border-t-[#F2E8F2] w-full gap-4">
              <div className="text-xs text-center sm:text-left">
                <span className="text-[#604868] font-medium">Showing </span>
                <span className="text-[#2E1A28] font-medium">{Math.min(1 + (meta.page - 1) * 10, meta.totalData || 0)}-{Math.min(meta.page * 10, meta.totalData || 0)}</span>
                <span className="text-[#604868] font-medium"> of </span>
                <span className="text-[#2E1A28] font-medium">{meta.totalData || 0}</span>
                <span className="text-[#604868] font-medium"> users</span>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  disabled={page <= 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  className="p-2 rounded-full outline outline-1 outline-[#DCC8E0] disabled:opacity-30 hover:bg-gray-50 transition flex items-center justify-center cursor-pointer"
                >
                  <svg width="8" height="12" viewBox="0 0 8 12" fill="currentColor" className={page <= 1 ? "text-[#DCC8E0]" : "text-[#604868]"} xmlns="http://www.w3.org/2000/svg">
                    <path d="M7.4 10.59L2.83 6L7.4 1.41L6 0L0 6L6 12L7.4 10.59Z"/>
                  </svg>
                </button>
                <div className="flex items-center gap-1">
                  {[...Array(meta.totalPage || 1)].map((_, i) => {
                    const isCurrent = page === i + 1;
                    return (
                      <button 
                        key={i} 
                        onClick={() => setPage(i + 1)}
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold cursor-pointer ${isCurrent ? 'bg-[#E040A0] text-white' : 'text-[#604868] hover:bg-gray-50 bg-transparent'}`}
                      >
                        {i + 1}
                      </button>
                    );
                  })}
                </div>
                <button 
                  disabled={page >= meta.totalPage}
                  onClick={() => setPage(p => Math.min(meta.totalPage, p + 1))}
                  className="p-2 rounded-full outline outline-1 outline-[#DCC8E0] disabled:opacity-30 hover:bg-gray-50 transition flex items-center justify-center cursor-pointer"
                >
                  <svg width="8" height="12" viewBox="0 0 8 12" fill="currentColor" className={page >= meta.totalPage ? "text-[#DCC8E0]" : "text-[#604868]"} xmlns="http://www.w3.org/2000/svg">
                    <path d="M0.6 1.41L5.17 6L0.6 10.59L2 12L8 6L2 0L0.6 1.41Z"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
