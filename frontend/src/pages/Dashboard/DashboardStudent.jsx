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
						setStudentProgress(res.data.perCourse || []);
						// Sum of all submitted assignments
						const totalSubmitted = res.data.completedAssignment || 0;
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
		<div className="flex flex-col md:flex-row bg-white min-h-screen md:h-screen md:overflow-hidden">
			{/* Sidebar on the Left */}
			<div className="flex flex-col shrink-0 items-center bg-[#FBF2FB] py-6 w-full md:w-64 border-b md:border-b-0 md:border-r border-[#DCC8E033] md:h-screen md:sticky md:top-0 z-30 overflow-y-auto">
				<div className="flex flex-col items-center pb-8 px-5 w-full">
					<span className="text-[#E040A0] text-2xl font-bold cursor-pointer" onClick={() => navigate("/")}>
						{"My Better Grade"}
					</span>
				</div>
				<div className="flex flex-col items-start px-4 gap-1 w-full flex-1">
					<div className="flex items-center bg-[#F080C0] py-3 px-4 cursor-pointer w-[calc(100%-1.5rem)] mx-3 rounded-full" onClick={() => navigate("/dashboard")}>
						<img
							src={"/Image (dashboard)_margin.png"}
							className="w-5 h-5 mr-3.5 object-contain shrink-0"
							alt="dashboard"
						/>
						<span className="text-[#2E1A28] text-sm font-bold" >
							{"Dashboard"}
						</span>
					</div>
					<div className="flex items-center py-3 px-4 cursor-pointer w-[calc(100%-1.5rem)] mx-3 rounded-full hover:bg-purple-50" onClick={() => navigate("/my-courses")}>
						<img
							src={"/Image (courses)_margin.png"}
							className="w-5 h-5 mr-3.5 object-contain shrink-0"
							alt="courses"
						/>
						<span className="text-[#604868] text-sm" >
							{"My Courses"}
						</span>
					</div>
					<div className="flex items-center py-3 px-4 cursor-pointer w-[calc(100%-1.5rem)] mx-3 rounded-full hover:bg-purple-50" onClick={() => navigate("/assignments")}>
						<img
							src={"/Image (assignments)_margin.png"}
							className="w-5 h-5 mr-3.5 object-contain shrink-0"
							alt="assignments"
						/>
						<span className="text-[#604868] text-sm" >
							{"Assignments"}
						</span>
					</div>
					<div className="flex items-center py-3 px-4 cursor-pointer w-[calc(100%-1.5rem)] mx-3 rounded-full hover:bg-purple-50" onClick={() => navigate("/academic-progress")}>
						<img
							src={"/Image (progress)_margin.png"}
							className="w-5 h-5 mr-3.5 object-contain shrink-0"
							alt="progress"
						/>
						<span className="text-[#604868] text-sm" >
							{"Progress"}
						</span>
					</div>
					<div className="flex items-center py-3 px-4 cursor-pointer w-[calc(100%-1.5rem)] mx-3 rounded-full hover:bg-purple-50" onClick={() => navigate("/profile")}>
						<img
							src={"/Image (profile)_margin.png"}
							className="w-5 h-5 mr-3.5 object-contain shrink-0"
							alt="profile"
						/>
						<span className="text-[#604868] text-sm" >
							{"Profile"}
						</span>
					</div>
					<div className="flex items-center py-3 px-4 cursor-pointer w-[calc(100%-1.5rem)] mx-3 rounded-full hover:bg-purple-50" onClick={() => navigate("/settings")}>
						<img
							src={"/Image (settings)_margin.png"}
							className="w-5 h-5 mr-3.5 object-contain shrink-0"
							alt="settings"
						/>
						<span className="text-[#604868] text-sm" >
							{"Settings"}
						</span>
					</div>
					<div className="flex items-center py-3 px-4 cursor-pointer w-[calc(100%-1.5rem)] mx-3 rounded-full mt-auto text-red-500 hover:bg-red-50 font-bold" onClick={() => { logout(); navigate('/'); }}>
						<span className="text-sm" >
							{"Log Out"}
						</span>
					</div>
				</div>
			</div>

			{/* Main Content Area on the Right */}
			<div className="flex flex-col flex-1 h-full md:h-screen overflow-y-auto">
				{/* Top Nav */}
				<div className="flex justify-end items-center bg-[#FEF7FFCC] py-3 px-4 md:px-8 border-b border-[#DCC8E033] h-16 shrink-0">
					<div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/profile")}>
						<span className="text-sm font-bold text-[#2E1A28]">{user ? user.name : "Alex Sterling"}</span>
						<img
							src={user?.avatarUrl || "/assets/default-avatar.png"}
							className="w-10 h-10 object-cover rounded-full border border-gray-100"
							alt="avatar"
						/>
					</div>
				</div>

				{/* Actual Page Dashboard Content */}
				<div className="flex flex-col xl:flex-row flex-1 p-4 md:p-8 gap-8">
					<div className="flex flex-col flex-1 gap-8 w-full xl:w-auto">
						<div className="flex flex-col items-start gap-2">
							<span className="text-[#2E1A28] text-4xl font-bold" >
								{`Welcome back, ${user ? user.name : 'Learner'}.`}
							</span>
							<span className="text-[#604868] text-base" >
								{user?.role === 'teacher'
									? "Manage your active course catalog, publish course materials, and grade upcoming student assignments."
									: "You've completed 85% of your weekly goals. Your next lecture starts in 45 minutes."}
							</span>
						</div>

						<div className="flex flex-col sm:flex-row gap-6 w-full">
							{/* Card 1: Active Courses */}
							<div className="flex flex-col items-start bg-[#F3EEF5] pt-6 pb-7 px-7 gap-1 rounded-[36px] w-full sm:w-[260px] relative overflow-hidden"
								style={{
									boxShadow: "0px 4px 16px rgba(224, 64, 160, 0.05)"
								}}>
								<div className="flex items-center justify-between w-full">
									{/* Circle icon container */}
									<div className="w-12 h-12 rounded-full bg-[#FCE6F3] flex items-center justify-center">
										<svg className="w-6 h-6 text-[#E040A0]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.62 48.62 0 0112 20.904a48.62 48.62 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84a50.58 50.58 0 00-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342"></path>
										</svg>
									</div>
									<span className="text-[#E040A0] text-xs font-bold" >
										{user?.role === 'teacher' ? "Active Catalog" : "+2 this week"}
									</span>
								</div>
								<span className="text-[#2E1A28] text-4xl font-extrabold mt-3" >
									{user?.role === 'teacher' ? myCourses.length : 12}
								</span>
								<span className="text-[#604868] text-sm font-semibold" >
									{user?.role === 'teacher' ? "Courses Taught" : "Active Courses"}
								</span>
								{/* Pink stripe at the bottom */}
								<div className="absolute bottom-0 left-0 right-0 h-[6px] bg-[#E040A0]" />
							</div>

							{/* Card 2: Completed Tasks */}
							<div className="flex flex-col items-start bg-[#F3EEF5] pt-6 pb-7 px-7 gap-1 rounded-[36px] w-full sm:w-[260px] relative overflow-hidden"
								style={{
									boxShadow: "0px 4px 16px rgba(124, 82, 170, 0.05)"
								}}>
								<div className="flex items-center justify-between w-full">
									{/* Circle icon container */}
									<div className="w-12 h-12 rounded-full bg-[#EAE2F6] flex items-center justify-center">
										<svg className="w-6 h-6 text-[#7C52AA]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
										</svg>
									</div>
									<span className="text-[#7C52AA] text-xs font-bold" >
										{user?.role === 'teacher' ? "Cohorts" : "88% Done"}
									</span>
								</div>
								<span className="text-[#2E1A28] text-4xl font-extrabold mt-3" >
									{user?.role === 'teacher' ? totalEnrolledStudents : (completedTasksCount || 45)}
								</span>
								<span className="text-[#604868] text-sm font-semibold" >
									{user?.role === 'teacher' ? "Enrolled Students" : "Completed Tasks"}
								</span>
								{/* Purple stripe at the bottom */}
								<div className="absolute bottom-0 left-0 right-0 h-[6px] bg-[#7C52AA]" />
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
								<div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
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
														src={"/Image (course icon)_margin.png"}
														className="w-12 h-12 mr-3 object-contain shrink-0"
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
														<div className="w-full bg-[#ECE2EC] h-3  overflow-hidden">
															<div className="h-full "
																style={{
																	width: `${progressVal}%`,
																	backgroundColor: getProgressColor(course.category)
																}}>
															</div>
														</div>
													</div>
												)}
												<button 
													className="w-full py-2.5 rounded-full border-2 border-[#C6519E] text-[#C6519E] font-bold text-sm bg-white hover:bg-[#C6519E] hover:text-white transition cursor-pointer mt-2"
													onClick={() => navigate("/course-detail", { state: { courseId: course.id } })}
												>
													Resume Learning
												</button>
											</div>
										);
									})}
								</div>
							)}
						</div>
					</div>

					{/* Right Sidebar - Deadlines & Study Buddy */}
					<div className="flex flex-col w-full xl:w-80 bg-white p-6 rounded-[32px] border border-solid border-[#DCC8E0] h-fit">
						<div className="flex items-center justify-between mb-6">
							<span className="text-[#2E1A28] text-xl font-bold" >
								{"Deadlines"}
							</span>
							<img
								src={"/Image (deadline icon).png"}
								className="w-7 h-7 object-contain shrink-0"
								alt="deadline icon"
							/>
						</div>

						<div className="flex flex-col mb-8">
							{deadlines.length === 0 ? (
								<div className="text-gray-400 text-xs py-4 text-center">
									No upcoming deadlines.
								</div>
							) : (
								deadlines.map((dead, index) => {
									const { month, day } = formatDeadlineDate(dead.deadline);
									const isLast = index === deadlines.length - 1;
									const themes = [
										{ bg: "bg-[#FFE8E8]", border: "border-[#E53E3E33]", text: "text-[#E53E3E]", tag: "URGENT" },
										{ bg: "bg-[#F3E8FF]", border: "border-[#9333EA33]", text: "text-[#7C52AA]", tag: "UPCOMING" },
										{ bg: "bg-[#E0F2FE]", border: "border-[#0284C733]", text: "text-[#0284C7]", tag: "NORMAL" }
									];
									const theme = themes[index % themes.length];

									return (
										<div key={dead.id} className="flex gap-4 cursor-pointer hover:bg-purple-50/50 rounded-lg"
											onClick={() => navigate('/submit-assignment', { state: { assignmentId: dead.id, assignmentTitle: dead.title } })}>
											<div className="flex flex-col items-center shrink-0 w-[52px]">
												<div className={`flex flex-col items-center ${theme.bg} py-1 w-full rounded-[14px] border border-solid ${theme.border} h-fit z-10`}>
													<span className={`${theme.text} text-[10.5px] font-bold`}>{month}</span>
													<span className={`${theme.text} text-lg font-bold`}>{day}</span>
												</div>
												{!isLast && (
													<div className="w-[2px] flex-1 bg-[#DCC8E0] mt-3 mb-[-20px] opacity-70"></div>
												)}
											</div>
											<div className={`flex flex-col ${!isLast ? 'pb-8' : 'pb-0'} pt-0.5`}>
												<span className={`${theme.text} text-[10px] font-bold block mb-1 uppercase tracking-wide`}>
													{theme.tag} • {formatDeadlineTimeLeft(dead.deadline)}
												</span>
												<span className="text-[#2E1A28] text-sm font-bold block truncate w-48 leading-snug">
													{dead.courseTitle || 'General Course'}
												</span>
												<span className="text-[#604868] text-xs block mt-1 line-clamp-2 w-48 leading-relaxed">
													{dead.title}
												</span>
											</div>
										</div>
									);
								})
							)}
						</div>

						<button 
							className="flex items-center justify-center bg-[#C6519E] text-white py-3.5 w-full gap-2 rounded-full border-0 font-bold text-sm shadow-[0px_4px_16px_rgba(198,81,158,0.3)] hover:bg-[#b0408b] hover:scale-[1.02] active:scale-95 transition cursor-pointer"
							onClick={() => navigate("/assignments")}>
							<svg className="w-4 h-4 shrink-0 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"></path>
							</svg>
							<span>{"Add New Task"}</span>
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
