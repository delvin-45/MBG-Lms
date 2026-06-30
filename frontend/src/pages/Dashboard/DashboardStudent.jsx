import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useCourses } from "../../context/CourseContext";
import { api } from "../../services/api";

export default function DashboardStudent() {
	const navigate = useNavigate();
	const { user, logout } = useAuth();
	const { courses } = useCourses();

	const [studentProgress, setStudentProgress] = useState([]);
	const [completedTasksCount, setCompletedTasksCount] = useState(0);
	const [deadlines, setDeadlines] = useState([]);

	// Fetch student progress info
	useEffect(() => {
		if (user?.role === 'student') {
			api.get('/progress/me')
				.then(res => {
					if (res.status === 'success' && res.data) {
						setStudentProgress(res.data);
						// Sum of all submitted assignments
						const totalSubmitted = res.data.reduce((acc, curr) => acc + curr.submittedAssignments, 0);
						setCompletedTasksCount(totalSubmitted);
					}
				})
				.catch(err => console.error('Failed to load student progress:', err));
		}
	}, [user]);

	// Fetch upcoming deadlines from course assignments
	useEffect(() => {
		if (courses.length > 0) {
			Promise.all(
				courses.slice(0, 4).map(c => 
					api.get(`/courses/${c.id}/assignments`)
						.then(res => {
							if (res.status === 'success' && res.data) {
								return res.data.map(a => ({ ...a, courseTitle: c.title }));
							}
							return [];
						})
						.catch(() => [])
				)
			)
			.then(results => {
				const merged = results.flat();
				// Sort by deadline ascending, filtering out past deadlines
				const now = new Date();
				const upcoming = merged
					.filter(a => new Date(a.deadline) > now)
					.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
				setDeadlines(upcoming.slice(0, 3));
			})
			.catch(err => console.error('Failed to load assignments for deadlines:', err));
		}
	}, [courses]);

	// Helper functions
	const getProgressColor = (category) => {
		switch (category?.toLowerCase()) {
			case 'design': return '#E040A0';
			case 'tech': return '#0096CC';
			case 'business': return '#7C52AA';
			default: return '#F080C0';
		}
	};

	// Determine active courses list for current user
	const myCourses = user?.role === 'teacher' 
		? courses.filter(c => c.teacherId === user.id)
		: courses;

	// Total students for teacher
	const totalEnrolledStudents = user?.role === 'teacher'
		? myCourses.reduce((acc, curr) => acc + (curr.totalStudent || 0), 0)
		: 0;

	// Date Formatter helper for deadlines
	const formatDeadlineDate = (dateStr) => {
		const d = new Date(dateStr);
		const month = d.toLocaleString('en-US', { month: 'short' }).toUpperCase();
		const day = d.getDate();
		return { month, day };
	};

	const formatDeadlineTimeLeft = (dateStr) => {
		const diffMs = new Date(dateStr) - new Date();
		const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
		if (diffHrs < 24) {
			return `URGENT • ${diffHrs} HOURS LEFT`;
		}
		const diffDays = Math.floor(diffHrs / 24);
		return `UPCOMING • ${diffDays} DAYS`;
	};

	return (
		<div className="flex bg-white min-h-screen">
			{/* Sidebar on the Left */}
			<div className="flex flex-col shrink-0 items-center bg-[#FBF2FB] py-6 w-64 border-r border-[#DCC8E033] min-h-screen">
				<div className="flex flex-col items-center pb-8 px-5 w-full">
					<span className="text-[#E040A0] text-2xl font-bold cursor-pointer" onClick={() => navigate("/")}>
						{"My Better Grade"}
					</span>
				</div>
				<div className="flex flex-col items-start px-4 gap-1 w-full flex-1">
					<div className="flex items-center bg-[#F080C0] py-3 px-4 rounded-[9999px] cursor-pointer w-full" onClick={() => navigate("/dashboard")}>
						<img
							src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/wQwYXX2xM2/gi80hvh9_expires_30_days.png"}
							className="w-[18px] h-[18px] mr-3 rounded-[9999px] object-fill"
							alt="dashboard"
						/>
						<span className="text-[#2E1A28] text-sm font-bold" >
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
					<div className="flex items-center py-3 px-4 rounded-[9999px] cursor-pointer w-full hover:bg-purple-50" onClick={() => navigate("/profile")}>
						<img
							src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/wQwYXX2xM2/csujep64_expires_30_days.png"}
							className="w-4 h-4 mr-3 rounded-[9999px] object-fill"
							alt="profile"
						/>
						<span className="text-[#604868] text-sm" >
							{"Profile"}
						</span>
					</div>
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
				<div className="flex justify-between items-center bg-[#FEF7FFCC] py-3 px-8 border-b border-[#DCC8E033]">
					<div className="flex items-center bg-white py-2 px-3 gap-2 rounded-full border border-[#DCC8E055] w-96">
						<img
							src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/wQwYXX2xM2/ccrkzlm2_expires_30_days.png"}
							className="w-[18px] h-6 object-fill"
							alt="search"
						/>
						<input
							type="text"
							placeholder="Search courses, notes..."
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

				{/* Actual Page Dashboard Content */}
				<div className="flex flex-1 p-8 gap-8">
					<div className="flex flex-col flex-1 gap-8">
						<div className="flex flex-col items-start gap-2">
							<span className="text-[#2E1A28] text-4xl font-bold" >
								{`Welcome back, ${user ? user.name : 'Learner'}.`}
							</span>
							<span className="text-[#604868] text-base" >
								{user?.role === 'teacher'
									? "Manage your active course catalog, publish course materials, and grade upcoming student assignments."
									: "You've completed your goals for this week. Keep up the great work and track your progress."}
							</span>
						</div>

						<div className="flex gap-6">
							<div className="flex flex-col items-start bg-[#ECE2EC] py-6 px-6 gap-1 rounded-[32px] w-[260px]"
								style={{
									boxShadow: "0px 4px 16px #E040A033"
								}}>
								<div className="flex items-start justify-between w-full">
									<img
										src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/wQwYXX2xM2/1xajzymy_expires_30_days.png"}
										className="w-[38px] h-[41px] object-fill"
										alt="stats"
									/>
									<span className="text-[#E040A0] text-xs font-bold" >
										{user?.role === 'teacher' ? "Active Catalog" : "All Courses"}
									</span>
								</div>
								<span className="text-[#2E1A28] text-3xl font-bold mt-3" >
									{myCourses.length}
								</span>
								<span className="text-[#604868] text-sm" >
									{user?.role === 'teacher' ? "Courses Taught" : "Active Courses"}
								</span>
							</div>

							<div className="flex flex-col items-start bg-[#ECE2EC] py-6 px-6 gap-1 rounded-[32px] w-[260px]"
								style={{
									boxShadow: "0px 4px 16px #7C52AA33"
								}}>
								<div className="flex items-start justify-between w-full">
									<img
										src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/wQwYXX2xM2/orfvngqw_expires_30_days.png"}
										className="w-9 h-[39px] object-fill"
										alt="stats"
									/>
									<span className="text-[#7C52AA] text-xs font-bold" >
										{user?.role === 'teacher' ? "Cohorts" : "Activity"}
									</span>
								</div>
								<span className="text-[#2E1A28] text-3xl font-bold mt-3" >
									{user?.role === 'teacher' ? totalEnrolledStudents : completedTasksCount}
								</span>
								<span className="text-[#604868] text-sm" >
									{user?.role === 'teacher' ? "Enrolled Students" : "Completed Tasks"}
								</span>
							</div>
						</div>

						<div className="flex flex-col gap-6">
							<div className="flex justify-between items-center w-full">
								<span className="text-[#2E1A28] text-2xl font-bold" >
									{"Recent Courses"}
								</span>
								<span className="text-[#E040A0] text-sm font-bold cursor-pointer hover:underline" onClick={() => navigate("/my-courses")}>
									{"View All"}
								</span>
							</div>
							
							{myCourses.length === 0 ? (
								<div className="text-gray-400 text-sm py-12 text-center bg-white rounded-3xl border border-dashed border-[#DCC8E0]">
									No courses found in the catalog.
								</div>
							) : (
								<div className="grid grid-cols-2 gap-6">
									{myCourses.slice(0, 4).map((course) => {
										const progressObj = studentProgress.find(p => p.courseId === course.id);
										const progressVal = progressObj ? progressObj.progressPercentage : 0;
										
										return (
											<div key={course.id} className="flex flex-col items-center bg-white p-[21px] gap-4 rounded-[32px] border border-solid border-[#DCC8E0]"
												style={{
													boxShadow: "0px 4px 6px #0000001A"
												}}>
												<div className="flex items-center w-full">
													<img
														src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/wQwYXX2xM2/z07ushx4_expires_30_days.png"}
														className="w-12 h-12 mr-3 object-fill"
														alt="course icon"
													/>
													<div className="flex flex-col items-start">
														<span className="text-[#2E1A28] text-base font-bold truncate w-[180px]" >
															{course.title}
														</span>
														<span className="text-[#604868] text-xs" >
															{`${course.category || 'General'} • 8 Modules`}
														</span>
													</div>
												</div>
												{user?.role === 'student' && (
													<div className="flex flex-col w-full pb-2 gap-2">
														<div className="flex justify-between items-center">
															<span className="text-[#604868] text-xs font-bold" >
																{"Progress"}
															</span>
															<span className="text-xs font-bold" style={{ color: getProgressColor(course.category) }}>
																{`${progressVal}%`}
															</span>
														</div>
														<div className="w-full bg-[#ECE2EC] h-3 rounded-[9999px] overflow-hidden">
															<div className="h-full rounded-[9999px]"
																style={{
																	width: `${progressVal}%`,
																	backgroundColor: getProgressColor(course.category)
																}}>
															</div>
														</div>
													</div>
												)}
												<button className="flex justify-center bg-transparent py-3.5 w-full rounded-[9999px] border-2 border-solid font-bold text-sm"
													style={{
														borderColor: getProgressColor(course.category),
														color: getProgressColor(course.category)
													}}
													onClick={() => navigate("/course-detail", { state: { courseId: course.id } })}>
													{user?.role === 'student' ? "Resume Learning" : "Manage Course"}
												</button>
											</div>
										);
									})}
								</div>
							)}
						</div>
					</div>

					{/* Right Sidebar - Deadlines & Study Buddy */}
					<div className="flex flex-col w-80 bg-white p-6 rounded-[32px] border border-solid border-[#DCC8E0] h-fit">
						<div className="flex items-center justify-between mb-6">
							<span className="text-[#2E1A28] text-xl font-bold" >
								{"Deadlines"}
							</span>
							<img
								src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/wQwYXX2xM2/pcnzhulp_expires_30_days.png"}
								className="w-[26px] h-[31px] object-fill"
								alt="deadline icon"
							/>
						</div>
						
						<div className="flex flex-col gap-6 mb-8">
							{deadlines.length === 0 ? (
								<div className="text-gray-400 text-xs py-4 text-center">
									No upcoming deadlines.
								</div>
							) : (
								deadlines.map((dead) => {
									const { month, day } = formatDeadlineDate(dead.deadline);
									return (
										<div key={dead.id} className="flex gap-3 cursor-pointer hover:bg-purple-50/50 p-1 rounded-lg"
											onClick={() => navigate('/submit-assignment', { state: { assignmentId: dead.id, assignmentTitle: dead.title } })}>
											<div className="flex flex-col items-center bg-[#FFE8E8] py-1 px-3 rounded-2xl border border-solid border-[#E53E3E33] h-fit">
												<span className="text-[#E53E3E] text-[10px] font-bold">{month}</span>
												<span className="text-[#E53E3E] text-base font-bold">{day}</span>
											</div>
											<div>
												<span className="text-[#E53E3E] text-[10px] font-bold block mb-0.5">{formatDeadlineTimeLeft(dead.deadline)}</span>
												<span className="text-[#2E1A28] text-sm font-bold block truncate w-48">{dead.title}</span>
												<span className="text-[#604868] text-xs block mt-1 truncate w-48">{dead.courseTitle}</span>
											</div>
										</div>
									);
								})
							)}
						</div>
						
						<button className="flex items-center justify-center bg-[#E040A0] text-white py-3.5 w-full gap-2 rounded-full border-0 font-bold text-sm shadow-[04px16px0rgba(224,64,160,0.3)] hover:bg-[#c03080] transition mb-8"
							onClick={() => navigate("/assignments")}>
							<img
								src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/wQwYXX2xM2/zntxl7q1_expires_30_days.png"}
								className="w-[11px] h-[11px] rounded-[9999px] object-fill"
								alt="add"
							/>
							<span>{"View All Tasks"}</span>
						</button>
						<div className="flex flex-col gap-3">
							<span className="text-[#2E1A28] text-base font-bold">Study Buddy</span>
							<div className="flex items-center -space-x-2">
								<img
									src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/wQwYXX2xM2/v4gcynqy_expires_30_days.png"}
									className="w-8 h-8 object-fill rounded-full"
									alt="buddy"
								/>
								<img
									src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/wQwYXX2xM2/379qbetl_expires_30_days.png"}
									className="w-8 h-8 object-fill rounded-full"
									alt="buddy"
								/>
								<img
									src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/wQwYXX2xM2/e12v8wcb_expires_30_days.png"}
									className="w-8 h-8 object-fill rounded-full"
									alt="buddy"
								/>
								<div className="flex items-center justify-center bg-[#FBF2FB] text-[#7C52AA] text-xs font-bold w-8 h-8 rounded-full border border-[#DCC8E0]">
									{"+12"}
								</div>
							</div>
							<span className="text-[#604868] text-xs">Connect with classmates to share notes.</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
