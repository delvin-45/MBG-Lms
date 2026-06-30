import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../services/api";

export default function Profile() {
	const navigate = useNavigate();
	const { user, logout } = useAuth();

	const isAdmin = user?.role === 'admin';
	const isTeacher = user?.role === 'teacher';

	const [progressData, setProgressData] = useState([]);
	const [stats, setStats] = useState({
		totalCourses: 0,
		completedTasks: 0
	});

	useEffect(() => {
		if (user?.role === 'student') {
			api.get('/progress/me')
				.then(res => {
					if (res.status === 'success' && res.data) {
						setProgressData(res.data);
						const total = res.data.length;
						const completed = res.data.reduce((acc, curr) => acc + curr.submittedAssignments, 0);
						setStats({ totalCourses: total, completedTasks: completed });
					}
				})
				.catch(err => console.error(err));
		}
	}, [user]);

	// Mock timeline list matching Figma
	const recentActivities = [
		{
			id: 1,
			type: "Account Status",
			desc: "Logged in successfully to My Better Grade LMS.",
			timestamp: "JUST NOW",
			color: "bg-[#E040A0]",
			timeColor: "text-[#E040A0] bg-[#E040A011]",
			icon: "🔑"
		},
		{
			id: 2,
			type: "Profile Loaded",
			desc: "Successfully retrieved account verification data.",
			timestamp: "TODAY",
			color: "bg-[#7C52AA]",
			timeColor: "text-[#7C52AA] bg-[#7C52AA11]",
			icon: "👤"
		}
	];

	return (
		<div className="flex bg-white min-h-screen font-sans antialiased text-gray-800">
			{/* Sidebar on the Left */}
			<div className="flex flex-col shrink-0 items-center bg-[#FBF2FB] py-6 w-64 border-r border-[#DCC8E033] min-h-screen">
				<div className="flex flex-col items-center pb-8 px-5 w-full">
					<span className="text-[#E040A0] text-2xl font-bold cursor-pointer" onClick={() => navigate("/")}>
						{"My Better Grade"}
					</span>
					{isAdmin && (
						<span className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">Admin Panel</span>
					)}
				</div>
				<div className="flex flex-col items-start px-4 gap-1 w-full flex-1">
					{isAdmin ? (
						<>
							{/* Admin Sidebar Links */}
							<div className="flex items-center py-3 px-4 rounded-[9999px] cursor-pointer w-full hover:bg-purple-50" onClick={() => navigate("/dashboard-admin")}>
								<span className="text-lg mr-3">👥</span>
								<span className="text-[#604868] text-sm" >
									{"User Management"}
								</span>
							</div>
						</>
					) : (
						<>
							{/* Student/Teacher Sidebar Links */}
							<div className="flex items-center py-3 px-4 rounded-[9999px] cursor-pointer w-full hover:bg-purple-50" onClick={() => navigate("/dashboard")}>
								<img
									src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/wQwYXX2xM2/gi80hvh9_expires_30_days.png"} 
									className="w-[18px] h-[18px] mr-3 rounded-[9999px] object-fill"
									alt="dashboard"
								/>
								<span className="text-[#604868] text-sm" >
									{"Dashboard"}
								</span>
							</div>
							<div className="flex items-center py-3 px-4 rounded-[9999px] cursor-pointer w-full hover:bg-purple-50" onClick={() => navigate("/my-courses")}>
								<img
									src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/wQwYXX2xM2/3jiucock_expires_30_days.png"} 
									className="w-[22px] h-[18px] mr-3 rounded-[9999px] object-fill"
									alt="courses"
								/>
								<span className="text-[#604868] text-sm" >
									{"My Courses"}
								</span>
							</div>
							<div className="flex items-center py-3 px-4 rounded-[9999px] cursor-pointer w-full hover:bg-purple-50" onClick={() => navigate("/assignments")}>
								<img
									src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/wQwYXX2xM2/vkctf8kg_expires_30_days.png"} 
									className="w-[18px] h-5 mr-3 rounded-[9999px] object-fill"
									alt="assignments"
								/>
								<span className="text-[#604868] text-sm" >
									{"Assignments"}
								</span>
							</div>
							<div className="flex items-center py-3 px-4 rounded-[9999px] cursor-pointer w-full hover:bg-purple-50" onClick={() => navigate("/academic-progress")}>
								<img
									src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/wQwYXX2xM2/3bwvb7zj_expires_30_days.png"} 
									className="w-5 h-3 mr-3 rounded-[9999px] object-fill"
									alt="progress"
								/>
								<span className="text-[#604868] text-sm" >
									{"Progress"}
								</span>
							</div>
						</>
					)}

					{/* Profile Link (Active) */}
					<div className="flex items-center bg-[#F080C0] py-3 px-4 rounded-[9999px] cursor-pointer w-full" onClick={() => navigate("/profile")}>
						<img
							src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/wQwYXX2xM2/csujep64_expires_30_days.png"} 
							className="w-4 h-4 mr-3 rounded-[9999px] object-fill"
							alt="profile"
						/>
						<span className="text-[#2E1A28] text-sm font-bold" >
							{"Profile"}
						</span>
					</div>

					{/* Settings Link */}
					<div className="flex items-center py-3 px-4 rounded-[9999px] cursor-pointer w-full hover:bg-purple-50" onClick={() => navigate("/settings")}>
						<img
							src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/wQwYXX2xM2/pi44b171_expires_30_days.png"} 
							className="w-5 h-5 mr-3 rounded-[9999px] object-fill"
							alt="settings"
						/>
						<span className="text-[#604868] text-sm" >
							{"Settings"}
						</span>
					</div>

					<div className="flex items-center py-3 px-4 rounded-[9999px] cursor-pointer w-full mt-auto text-red-500 hover:bg-red-50 font-bold" onClick={() => { logout(); navigate('/'); }}>
						<span className="text-sm" >
							{"Log Out"}
						</span>
					</div>
				</div>
			</div>

			{/* Main Content Area on the Right */}
			<div className="flex flex-col flex-1 min-h-screen">
				{/* Top Nav */}
				<div className="flex justify-between items-center bg-[#FEF7FFCC] py-3 px-8 border-b border-[#DCC8E033] h-16">
					<div className="flex items-center bg-white py-2 px-3 gap-2 rounded-full border border-[#DCC8E055] w-96">
						<img
							src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/wQwYXX2xM2/ccrkzlm2_expires_30_days.png"} 
							className="w-[18px] h-6 object-fill"
							alt="search"
						/>
						<input
							type="text"
							placeholder="Search..."
							className="text-gray-700 bg-transparent text-sm w-full outline-none"
						/>
					</div>
					<div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/profile")}>
						<span className="text-sm font-bold text-[#2E1A28]">{user ? user.name : "Alex Sterling"}</span>
						<img
							src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/wQwYXX2xM2/uc6jo6mt_expires_30_days.png"} 
							className="w-10 h-10 object-fill rounded-full"
							alt="avatar"
						/>
					</div>
				</div>

				{/* Actual Page Profile Content */}
				<div className="flex flex-col flex-1 p-8 gap-8 max-w-[1200px] w-full mx-auto">
					
					{/* Header Profile Info card */}
					<div className="flex justify-between items-center bg-white p-6 rounded-[32px] border border-solid border-[#DCC8E033] shadow-sm w-full gap-8">
						<div className="flex items-center gap-6">
							<div className="relative w-24 h-24 rounded-full border-4 border-[#E040A0] bg-slate-100 flex-shrink-0">
								<img
									src={user?.avatarUrl || "https://storage.googleapis.com/tagjs-prod.appspot.com/v1/wQwYXX2xM2/uc6jo6mt_expires_30_days.png"} 
									className="w-full h-full object-cover rounded-full"
									alt="profile big"
								/>
								<button 
									className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#E040A0] text-white flex items-center justify-center text-xs border-2 border-white cursor-pointer hover:bg-[#c03080] transition"
									onClick={() => navigate('/settings')}
								>
									✎
								</button>
							</div>
							
							<div className="flex flex-col items-start gap-1">
								<h1 className="text-[#2E1A28] text-3xl font-black tracking-tight">
									{user ? user.name : "Mas Wowok"}
								</h1>
								<div className="flex flex-wrap items-center gap-2 mt-1">
									<span className="text-gray-400 text-xs font-semibold">{user?.email}</span>
									<span className="bg-[#0096CC15] text-[#0096CC] text-[10px] font-black uppercase tracking-wider py-1 px-3 rounded-full">
										{user ? user.role : "Student"} Role
									</span>
									{user?.phoneNumber && (
										<span className="text-gray-400 text-xs">📞 {user.phoneNumber}</span>
									)}
								</div>
							</div>
						</div>
					</div>

					{/* Academic Performance & Advisors Grid */}
					{!isAdmin && (
						<div className="grid grid-cols-[1.8fr_1fr] gap-8 items-start">
							
							{/* Academic Performance card */}
							<div className="bg-white p-6 rounded-[32px] border border-solid border-[#DCC8E088] shadow-sm flex flex-col gap-6">
								<div className="flex justify-between items-center border-b pb-4">
									<h3 className="text-[#2E1A28] text-lg font-bold">Academic Status</h3>
								</div>

								<div className="grid grid-cols-2 gap-4">
									{/* GPA Card */}
									<div className="bg-[#FBF2FB] p-5 rounded-2xl text-center flex flex-col justify-between items-center min-h-[140px] border border-gray-50">
										<span className="text-[10px] text-gray-400 font-bold uppercase">Enrolled Catalog</span>
										<h4 className="text-[#2E1A28] text-2xl font-black mt-2">
											{stats.totalCourses} <span className="text-xs text-gray-400 font-normal">courses</span>
										</h4>
									</div>

									{/* Credits Card */}
									<div className="bg-[#FBF2FB] p-5 rounded-2xl text-center flex flex-col justify-between items-center min-h-[140px] border border-gray-50">
										<span className="text-[10px] text-gray-400 font-bold uppercase">Submitted Tasks</span>
										<h4 className="text-[#7C52AA] text-2xl font-black mt-2">{stats.completedTasks}</h4>
									</div>
								</div>
							</div>

							{/* Course Advisors card */}
							<div className="bg-white p-6 rounded-[32px] border border-solid border-[#DCC8E088] shadow-sm flex flex-col gap-6">
								<h3 className="text-[#2E1A28] text-lg font-bold border-b pb-4">Course Advisors</h3>
								
								<div className="flex justify-between items-center p-4 bg-[#FBF2FB] rounded-2xl border border-gray-50 w-full">
									<div className="flex items-center gap-3">
										<img
											src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/wQwYXX2xM2/uc6jo6mt_expires_30_days.png"} 
											className="w-10 h-10 object-fill rounded-full border"
											alt="advisor"
										/>
										<div>
											<h4 className="text-[#2E1A28] text-sm font-bold">Gilang Gumelar</h4>
											<p className="text-gray-400 text-xs">Senior Advisor</p>
										</div>
									</div>
									<button className="w-9 h-9 rounded-full bg-white hover:bg-gray-50 flex items-center justify-center text-[#E040A0] shadow-sm border border-gray-150 cursor-pointer transition">
										💬
									</button>
								</div>
							</div>
						</div>
					)}

					{/* Recent Activity Timeline Section */}
					<div className="bg-white p-6 rounded-[32px] border border-solid border-[#DCC8E088] shadow-sm w-full flex flex-col gap-6">
						<h3 className="text-[#2E1A28] text-lg font-bold border-b pb-4">Recent Activity</h3>
						
						<div className="flex flex-col gap-6 pl-4 border-l-2 border-gray-100 ml-4 relative">
							{recentActivities.map((act) => (
								<div key={act.id} className="relative flex justify-between items-start gap-4">
									<div className={`absolute -left-[27px] top-1 w-[12px] h-[12px] rounded-full border-2 border-white ${act.color}`}></div>
									
									<div className="flex flex-col gap-1">
										<h4 className="text-[#2E1A28] text-sm font-bold">{act.type}</h4>
										<p className="text-gray-400 text-xs">{act.desc}</p>
									</div>
									<span className={`text-[10px] font-bold py-1 px-3 rounded-full uppercase tracking-wider ${act.timeColor}`}>
										{act.timestamp}
									</span>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
