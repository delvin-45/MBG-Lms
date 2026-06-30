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
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });

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
        setTotalUsersCount(resTotal.meta.total);
      }
      
      const resStudent = await api.get('/users?role=student&limit=1');
      if (resStudent.status === 'success' && resStudent.meta) {
        setActiveStudentsCount(resStudent.meta.total);
      }
    } catch (err) {
      console.error('Failed to load admin stats:', err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, search, roleFilter]);

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
      case 'admin': return 'bg-[#F080C033] text-[#2E1A28]';
      case 'teacher': return 'bg-[#40C0EE33] text-[#00334D]';
      default: return 'bg-[#EEDCFF] text-[#2E2040]';
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
              placeholder="Search..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
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

        {/* Dashboard Content area */}
        <div className="flex-1 p-8 flex flex-col gap-8 max-w-[1200px] w-full mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center w-full">
            <div>
              <h1 className="text-[#2E1A28] text-3xl font-black tracking-tight">User Management</h1>
              <p className="text-gray-400 text-sm mt-1">Manage global platform accounts and system access.</p>
            </div>
            <button className="flex items-center bg-[#E040A0] text-white py-3 px-6 gap-2 rounded-full border-0 font-bold text-sm shadow-md hover:bg-[#c03080] transition"
              onClick={() => navigate("/add-user")}>
              <span>+</span>
              <span>Add New User</span>
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-6 w-full">
            <div className="flex p-6 flex-col items-start rounded-[32px] border border-[#E040A015] bg-white shadow-sm w-full">
              <div className="w-12 h-12 rounded-full bg-[#E040A015] flex items-center justify-center text-xl mb-4">
                👥
              </div>
              <span className="text-gray-400 text-xs font-bold uppercase tracking-wider block mb-1">Total Users</span>
              <h3 className="text-[#2E1A28] text-3xl font-black">{totalUsersCount}</h3>
            </div>
            <div className="flex p-6 flex-col items-start rounded-[32px] border border-[#7C52AA15] bg-white shadow-sm w-full">
              <div className="w-12 h-12 rounded-full bg-[#EEDCFF] flex items-center justify-center text-xl mb-4">
                🎓
              </div>
              <span className="text-gray-400 text-xs font-bold uppercase tracking-wider block mb-1">Active Students</span>
              <h3 className="text-[#2E1A28] text-3xl font-black">{activeStudentsCount}</h3>
            </div>
          </div>

          {/* Filters & Search Table bar */}
          <div className="flex flex-col bg-white rounded-[32px] border border-solid border-[#DCC8E055] overflow-hidden shadow-sm mt-4">
            <div className="flex p-6 justify-between items-center border-b border-[#F2E8F2] w-full gap-4">
              <div className="flex items-center bg-[#FBF2FB] py-2 px-4 gap-2 rounded-full border border-gray-100 w-80">
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  className="text-gray-700 bg-transparent text-sm w-full outline-none"
                />
              </div>
              <div className="flex items-center gap-3">
                <select 
                  value={roleFilter}
                  onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
                  className="bg-[#FBF2FB] text-[#604868] text-sm py-2.5 px-6 rounded-full border border-[#DCC8E033] outline-none cursor-pointer font-bold"
                >
                  <option>All Roles</option>
                  <option>Student</option>
                  <option>Teacher</option>
                  <option>Admin</option>
                </select>
              </div>
            </div>

            {/* Perfect Semantics HTML Table */}
            <div className="w-full overflow-x-auto">
              {loading ? (
                <div className="p-12 text-center text-gray-500 font-bold animate-pulse">Loading accounts database...</div>
              ) : usersList.length === 0 ? (
                <div className="p-12 text-center text-gray-400 font-bold">No accounts found matching criteria.</div>
              ) : (
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="bg-[#FBF2FB] border-b border-b-[#F2E8F2]">
                      <th className="py-4 px-6 text-[#604868] font-bold text-xs uppercase tracking-wider">User</th>
                      <th className="py-4 px-6 text-[#604868] font-bold text-xs uppercase tracking-wider">Role</th>
                      <th className="py-4 px-6 text-[#604868] font-bold text-xs uppercase tracking-wider">Phone Number</th>
                      <th className="py-4 px-6 text-[#604868] font-bold text-xs uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {usersList.map((u) => (
                      <tr key={u.id} className="hover:bg-purple-50/20 transition">
                        <td className="py-4 px-6 flex items-center gap-3">
                          <img
                            src={u.avatarUrl || "https://storage.googleapis.com/tagjs-prod.appspot.com/v1/wQwYXX2xM2/uc6jo6mt_expires_30_days.png"}
                            className="rounded-full border-2 border-[#F080C0] w-10 h-10 object-cover"
                            alt={u.fullName}
                          />
                          <div className="flex flex-col">
                            <span className="text-[#2E1A28] text-sm font-bold">{u.fullName}</span>
                            <span className="text-gray-400 text-xs">{u.email}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`text-[10px] font-black py-1 px-3 rounded-full uppercase tracking-wider ${getRoleColor(u.role)}`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-[#604868] text-sm">
                          {u.phoneNumber || "-"}
                        </td>
                        <td className="py-4 px-6 text-right text-xs font-bold">
                          {u.id !== user.id && (
                            <button 
                              onClick={() => handleDeleteUser(u.id)}
                              className="hover:underline bg-transparent border-0 cursor-pointer text-red-500"
                            >
                              Delete
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Pagination footer */}
            <div className="flex p-6 justify-between items-center border-t border-t-[#F2E8F2] w-full text-xs text-[#2E1A28]">
              <span>Showing Page {meta.page} of {meta.totalPages} (Total {meta.total} users)</span>
              <div className="flex items-center gap-2">
                <button 
                  disabled={page <= 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  className="w-8 h-8 rounded-full border border-gray-100 flex items-center justify-center hover:bg-gray-50 bg-white cursor-pointer disabled:opacity-50"
                >
                  ←
                </button>
                <div className="flex items-center gap-1">
                  {[...Array(meta.totalPages || 1)].map((_, i) => (
                    <button 
                      key={i} 
                      onClick={() => setPage(i + 1)}
                      className={`w-8 h-8 rounded-full font-bold ${page === i + 1 ? 'bg-[#E040A0] text-white' : 'text-[#604868] hover:bg-gray-50 bg-transparent'}`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <button 
                  disabled={page >= meta.totalPages}
                  onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
                  className="w-8 h-8 rounded-full border border-gray-100 flex items-center justify-center hover:bg-gray-50 bg-white cursor-pointer disabled:opacity-50"
                >
                  →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
