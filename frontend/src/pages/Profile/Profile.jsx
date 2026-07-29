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
						setProgressData(res.data.perCourse || []);
						const total = res.data.totalCourse || 0;
						const completed = res.data.completedAssignment || 0;
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
		<div className="flex flex-col md:flex-row bg-white min-h-screen md:h-screen md:overflow-hidden font-sans antialiased text-gray-800">
			{/* Sidebar on the Left */}
			<div className="flex flex-col shrink-0 items-center bg-[#FBF2FB] py-6 w-full md:w-64 border-b md:border-b-0 md:border-r border-[#DCC8E033] md:h-screen md:sticky md:top-0 z-30 overflow-y-auto">
				<div className="flex flex-col items-center pb-8 px-5 w-full">
					<span className="text-[#E040A0] text-2xl font-bold cursor-pointer hover:opacity-80 transition-opacity" onClick={() => navigate("/")}>
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
							<div className="flex items-center py-3 px-4 cursor-pointer w-[calc(100%-1.5rem)] mx-3 rounded-full hover:bg-purple-50 transition-colors" onClick={() => navigate("/dashboard-admin")}>
								<span className="text-lg mr-3">👥</span>
								<span className="text-[#604868] text-sm font-medium" >
									{"User Management"}
								</span>
							</div>
						</>
					) : (
						<>
							{/* Student/Teacher Sidebar Links */}
							<div className="flex items-center py-3 px-4 cursor-pointer w-[calc(100%-1.5rem)] mx-3 rounded-full hover:bg-purple-50 transition-colors" onClick={() => navigate("/dashboard")}>
								<img
									src={"/Image (dashboard)_margin.png"}
									className="w-5 h-5 mr-3.5 object-contain shrink-0"
									alt="dashboard"
								/>
								<span className="text-[#604868] text-sm font-medium" >
									{"Dashboard"}
								</span>
							</div>
							<div className="flex items-center py-3 px-4 cursor-pointer w-[calc(100%-1.5rem)] mx-3 rounded-full hover:bg-purple-50 transition-colors" onClick={() => navigate("/my-courses")}>
								<img
									src={"/Image (courses)_margin.png"}
									className="w-5 h-5 mr-3.5 object-contain shrink-0"
									alt="courses"
								/>
								<span className="text-[#604868] text-sm font-medium" >
									{"My Courses"}
								</span>
							</div>
							<div className="flex items-center py-3 px-4 cursor-pointer w-[calc(100%-1.5rem)] mx-3 rounded-full hover:bg-purple-50 transition-colors" onClick={() => navigate("/assignments")}>
								<img
									src={"/Image (assignments)_margin.png"}
									className="w-5 h-5 mr-3.5 object-contain shrink-0"
									alt="assignments"
								/>
								<span className="text-[#604868] text-sm font-medium" >
									{"Assignments"}
								</span>
							</div>
							<div className="flex items-center py-3 px-4 cursor-pointer w-[calc(100%-1.5rem)] mx-3 rounded-full hover:bg-purple-50 transition-colors" onClick={() => navigate("/academic-progress")}>
								<img
									src={"/Image (progress)_margin.png"}
									className="w-5 h-5 mr-3.5 object-contain shrink-0"
									alt="progress"
								/>
								<span className="text-[#604868] text-sm font-medium" >
									{"Progress"}
								</span>
							</div>
						</>
					)}

					{/* Profile Link (Active) */}
					<div className="flex items-center bg-[#F080C0] py-3 px-4 cursor-pointer w-[calc(100%-1.5rem)] mx-3 rounded-full shadow-sm" onClick={() => navigate("/profile")}>
						<img
							src={"/Image (profile)_margin.png"}
							className="w-5 h-5 mr-3.5 object-contain shrink-0"
							alt="profile"
						/>
						<span className="text-[#2E1A28] text-sm font-bold" >
							{"Profile"}
						</span>
					</div>

					{/* Settings Link */}
					<div className="flex items-center py-3 px-4 cursor-pointer w-[calc(100%-1.5rem)] mx-3 rounded-full hover:bg-purple-50 transition-colors" onClick={() => navigate("/settings")}>
						<img
							src={"/Image (settings)_margin.png"}
							className="w-5 h-5 mr-3.5 object-contain shrink-0"
							alt="settings"
						/>
						<span className="text-[#604868] text-sm font-medium" >
							{"Settings"}
						</span>
					</div>

					<div className="flex items-center py-3 px-4 cursor-pointer w-[calc(100%-1.5rem)] mx-3 rounded-full mt-auto text-red-500 hover:bg-red-50 font-bold transition-colors" onClick={() => { logout(); navigate('/'); }}>
						<span className="text-sm" >
							{"Log Out"}
						</span>
					</div>
				</div>
			</div>

			{/* Main Content Area on the Right */}
			<div className="flex flex-col flex-1 h-full md:h-screen overflow-y-auto bg-[#FEF7FF]/30">
				{/* Top Nav (Search removed, only profile on right) */}
				<div className="flex justify-end items-center bg-white py-4 px-6 md:px-10 border-b border-gray-100 shadow-sm w-full h-[72px]">
					<div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => navigate("/profile")}>
						<span className="text-sm font-bold text-[#2E1A28]">{user ? user.name : "ganjar 18%"}</span>
						<img
							src={user?.avatarUrl || "/assets/default-avatar.png"}
							className="w-10 h-10 object-cover rounded-full border-2 border-white shadow-sm"
							alt="avatar"
						/>
					</div>
				</div>

				{/* Actual Page Profile Content */}
				<div className="flex flex-col flex-1 p-6 md:p-10 gap-8 max-w-[900px] w-full mx-auto">

					{/* Header Profile Info card */}
					<div className="flex flex-col sm:flex-row items-center sm:items-start bg-white p-8 md:p-10 rounded-[32px] md:rounded-[40px] border border-gray-50 shadow-[0_12px_40px_rgba(224,64,160,0.06)] w-full gap-8 transition-all">
						<div className="flex flex-col sm:flex-row items-center sm:items-center gap-8 w-full">
							{/* Premium Profile Avatar with gradient border */}
							<div className="relative w-[120px] h-[120px] min-w-[120px] min-h-[120px] max-w-[120px] max-h-[120px] rounded-full p-[3px] bg-gradient-to-tr from-[#7C52AA] via-[#E040A0] to-[#E040A0] flex-shrink-0 flex items-center justify-center shadow-lg">
								<img
									src={user?.avatarUrl || "/assets/default-avatar.png"}
									className="w-full h-full object-cover rounded-full border-[3px] border-white flex-shrink-0"
									alt="profile big"
								/>
								<button
									className="absolute bottom-0 right-1 w-9 h-9 rounded-full bg-[#7C52AA] text-white flex items-center justify-center border-2 border-white cursor-pointer hover:bg-[#604085] hover:scale-105 transition-all shadow-md"
									onClick={() => navigate('/settings')}
								>
									<svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
									</svg>
								</button>
							</div>

							<div className="flex flex-col items-center sm:items-start gap-4 w-full">
								<h1 className="text-[#2E1A28] text-4xl font-heading font-black tracking-tight leading-none text-center sm:text-left">
									{user ? user.name : "ganjar 18%"}
								</h1>
								{/* Figma Style Profile Badges */}
								<div className="flex flex-col gap-3 w-full items-center sm:items-start">
									<div className="flex flex-wrap justify-center sm:justify-start items-center gap-3 w-full">
										<div className="bg-[#F5EEF6] text-[#604868] text-xs font-heading font-bold py-2 px-4 rounded-full flex items-center gap-1.5 border border-[#DCC8E0]/20 shadow-sm">
											<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z" />
											</svg>
											<span>{`ID: MBG-${user?.id?.toString().slice(0, 8) || "2024-8891"}`}</span>
										</div>
										<div className="bg-[#E6F4FA] text-[#0096CC] text-xs font-heading font-bold py-2 px-4 rounded-full flex items-center gap-1.5 border border-[#DCC8E0]/20 shadow-sm">
											<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" d="M4.263 15.918a9 9 0 0015.474 0M12 3v13.5M12 3L7.5 7.5M12 3l4.5 4.5M19.5 18a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
											</svg>
											<span>{"3rd Year Computer Science"}</span>
										</div>
									</div>
									<div className="flex flex-wrap justify-center sm:justify-start items-center w-full">
										<div className="bg-[#FCE6F3] text-[#E040A0] text-xs font-heading font-bold py-2 px-4 rounded-full flex items-center gap-1.5 border border-[#DCC8E0]/20 shadow-sm">
											<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
												<path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
											</svg>
											<span>{"pekanbaru, Indonesia"}</span>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>

					{/* Recent Activity Timeline Section */}
					<div className="bg-white p-8 md:p-10 rounded-[32px] md:rounded-[40px] border border-gray-50 shadow-[0_12px_40px_rgba(224,64,160,0.04)] w-full flex flex-col gap-6 text-left relative transition-all">

						{/* Card Title with clock icon */}
						<div className="flex items-center gap-3 border-b border-gray-50 pb-6">
							<span className="text-[#E040A0] text-xl flex items-center justify-center bg-[#FFEBF5] p-2 rounded-xl">
								<svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
								</svg>
							</span>
							<h3 className="text-[#2E1A28] text-xl font-heading font-black">{"Recent Activity"}</h3>
						</div>

						{/* Vertical Timeline Container */}
						<div className="relative flex flex-col mt-2">
							{/* Vertical Line passing through all items */}
							<div className="absolute left-6 top-6 bottom-8 w-[2px] bg-[#E040A0]/10 rounded-full"></div>

							{/* Timeline Item 1 */}
							<div className="relative flex flex-col sm:flex-row items-center justify-between pl-20 py-5 gap-4 hover:bg-[#FEF7FF]/50 transition-colors rounded-2xl group">
								{/* Icon circle */}
								<div className="absolute left-[9px] top-[24px] w-10 h-10 rounded-full bg-[#FFEBF5] text-[#E040A0] flex items-center justify-center border-[3px] border-white z-10 shadow-sm group-hover:scale-110 transition-transform">
									<svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
									</svg>
								</div>

								<div className="flex flex-col gap-1.5 w-full">
									<h4 className="text-[#2E1A28] text-base font-heading font-black tracking-tight">{"Assignment Submitted"}</h4>
									<p className="text-[#604868] text-xs font-semibold">{"Human-Computer Interaction: Final Project Draft"}</p>
								</div>

								<div className="bg-[#FFEBF5] text-[#E040A0] font-heading font-bold text-[10px] py-1.5 px-4 rounded-full uppercase tracking-wider whitespace-nowrap">
									{"TODAY, 10:24 AM"}
								</div>
							</div>

							{/* Timeline Item 2 */}
							<div className="relative flex flex-col sm:flex-row items-center justify-between pl-20 py-5 gap-4 hover:bg-[#FEF7FF]/50 transition-colors rounded-2xl group">
								{/* Icon circle */}
								<div className="absolute left-[9px] top-[24px] w-10 h-10 rounded-full bg-[#F2EDFA] text-[#7C52AA] flex items-center justify-center border-[3px] border-white z-10 shadow-sm group-hover:scale-110 transition-transform">
									<svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499c.151-.29.444-.492.776-.492s.624.202.776.492l2.36 4.78 5.25.762c.323.047.587.278.679.59a.837.837 0 01-.22.813l-3.8 3.7.9 5.228a.837.837 0 01-1.217.884l-4.693-2.47-4.693 2.47a.837.837 0 01-1.217-.884l.9-5.228-3.8-3.7a.837.837 0 01-.22-.813c.092-.312.356-.543.679-.59l5.25-.762 2.36-4.78z" />
									</svg>
								</div>

								<div className="flex flex-col gap-1.5 w-full">
									<h4 className="text-[#2E1A28] text-base font-heading font-black tracking-tight">{"Grade Published"}</h4>
									<p className="text-[#604868] text-xs font-semibold">
										{"Advanced Algorithms: Midterm Exam — "}
										<span className="text-[#7C52AA] font-black">{"A+ (98/100)"}</span>
									</p>
								</div>

								<div className="text-[#2E1A28] font-heading font-black text-[11px] py-1 tracking-wider uppercase whitespace-nowrap">
									{"YESTERDAY"}
								</div>
							</div>

							{/* Timeline Item 3 */}
							<div className="relative flex flex-col sm:flex-row items-center justify-between pl-20 py-5 gap-4 hover:bg-[#FEF7FF]/50 transition-colors rounded-2xl group">
								{/* Icon circle */}
								<div className="absolute left-[9px] top-[24px] w-10 h-10 rounded-full bg-[#EBF8FF] text-[#0096CC] flex items-center justify-center border-[3px] border-white z-10 shadow-sm group-hover:scale-110 transition-transform">
									<svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 21.75z" />
									</svg>
								</div>

								<div className="flex flex-col gap-1.5 w-full">
									<h4 className="text-[#2E1A28] text-base font-heading font-black tracking-tight">{"Tuition Payment Success"}</h4>
									<p className="text-[#604868] text-xs font-semibold">{"Spring Semester 2024 installment processed successfully."}</p>
								</div>

								<div className="text-[#2E1A28] font-heading font-black text-[11px] py-1 tracking-wider uppercase whitespace-nowrap">
									{"FEB 12, 2024"}
								</div>
							</div>

							{/* Timeline Item 4 */}
							<div className="relative flex flex-col sm:flex-row items-center justify-between pl-20 py-5 gap-4 hover:bg-[#FEF7FF]/50 transition-colors rounded-2xl group">
								{/* Icon circle */}
								<div className="absolute left-[9px] top-[24px] w-10 h-10 rounded-full bg-[#F5EEF6] text-[#604868] flex items-center justify-center border-[3px] border-white z-10 shadow-sm group-hover:scale-110 transition-transform">
									<svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" d="M4.263 15.918a9 9 0 0015.474 0M12 3v13.5M12 3L7.5 7.5M12 3l4.5 4.5M19.5 18a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
									</svg>
								</div>

								<div className="flex flex-col gap-1.5 w-full">
									<h4 className="text-[#2E1A28] text-base font-heading font-black tracking-tight">{"Course Completed"}</h4>
									<p className="text-[#604868] text-xs font-semibold">{"Database Systems II: Foundations & Optimization"}</p>
								</div>

								<div className="text-[#2E1A28] font-heading font-black text-[11px] py-1 tracking-wider uppercase whitespace-nowrap">
									{"FEB 08, 2024"}
								</div>
							</div>

						</div>

						{/* Action button at bottom */}
						<div className="flex justify-center mt-6 pt-6 border-t border-gray-100">
							<span className="text-[#E040A0] text-sm font-heading font-bold hover:text-[#c03080] cursor-pointer flex items-center gap-2 transition-colors hover:underline">
								{"View Full Activity Log →"}
							</span>
						</div>

					</div>
				</div>
			</div>
		</div>
	);
}
