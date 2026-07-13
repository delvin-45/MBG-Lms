import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../services/api";

export default function AcademicProgress() {
	const navigate = useNavigate();
	const { user, logout } = useAuth();

	const [progressData, setProgressData] = useState([]);
	const [avgGrade, setAvgGrade] = useState(0);
	const [totalEarned, setTotalEarned] = useState(0);
	const [totalNeeded, setTotalNeeded] = useState(0);
	const [loading, setLoading] = useState(true);

	const isTeacher = user?.role === 'teacher';
	const [teacherCourses, setTeacherCourses] = useState([]);
	const [selectedCourseId, setSelectedCourseId] = useState("");
	const [courseStudentsProgress, setCourseStudentsProgress] = useState([]);

	useEffect(() => {
		setLoading(true);
		if (isTeacher) {
			api.get('/courses')
				.then(async (coursesRes) => {
					const coursesList = Array.isArray(coursesRes.data) ? coursesRes.data : (coursesRes.data?.data || []);
					const filtered = coursesList.filter(c => c.teacherId === user?.id);
					setTeacherCourses(filtered);
					if (filtered.length > 0) {
						setSelectedCourseId(filtered[0].id);
					} else {
						setLoading(false);
					}
				})
				.catch(err => {
					console.error("Failed to load teacher courses:", err);
					setLoading(false);
				});
		} else {
			// Student progress loading
			Promise.all([
				api.get('/progress/me'),
				api.get('/courses')
			])
				.then(async ([progressRes, coursesRes]) => {
					if (progressRes.status === 'success' && progressRes.data) {
						setProgressData(progressRes.data.perCourse || []);

						const coursesList = Array.isArray(coursesRes.data) ? coursesRes.data : (coursesRes.data?.data || []);

						// Compile all assignments across all courses
						const assignmentsPromises = coursesList.map(c =>
							api.get(`/courses/${c.id}/assignments`)
								.then(res => res.status === 'success' ? res.data : [])
								.catch(() => [])
						);
						const assignmentsResults = await Promise.all(assignmentsPromises);
						const allAssignments = assignmentsResults.flat();

						// Retrieve student's submission status for each assignment
						const submissionPromises = allAssignments.map(a =>
							api.get(`/assignments/${a.id}/submission`)
								.then(res => res.status === 'success' && res.data ? res.data : null)
								.catch(() => null)
						);
						const subs = await Promise.all(submissionPromises);
						const validSubs = subs.filter(Boolean);
						const gradedSubs = validSubs.filter(s => s.status === 'graded');

						if (gradedSubs.length > 0) {
							const sum = gradedSubs.reduce((acc, curr) => acc + curr.score, 0);
							setAvgGrade(Math.round(sum / gradedSubs.length));
						}

						setTotalEarned(validSubs.length);
						setTotalNeeded(allAssignments.length);
					}
				})
				.catch(err => console.error("Failed to load progress data:", err))
				.finally(() => setLoading(false));
		}
	}, [user, isTeacher]);

	// Fetch student progress for selected course (Teacher view)
	useEffect(() => {
		if (isTeacher && selectedCourseId) {
			setLoading(true);
			api.get(`/progress/course/${selectedCourseId}`)
				.then(res => {
					if (res.status === 'success' && res.data) {
						setCourseStudentsProgress(res.data);
						if (res.data.length > 0) {
							const sum = res.data.reduce((acc, curr) => acc + curr.progressPercentage, 0);
							setAvgGrade(Math.round(sum / res.data.length));
						} else {
							setAvgGrade(0);
						}
					}
				})
				.catch(err => console.error("Failed to load course progress:", err))
				.finally(() => setLoading(false));
		}
	}, [selectedCourseId, isTeacher]);

	// Calculate GPA based on average grade score
	const gpa = avgGrade > 0 ? ((avgGrade / 100) * 4.0).toFixed(2) : "3.84";
	const progressPercentage = totalNeeded > 0 ? Math.round((totalEarned / totalNeeded) * 100) : 75;

	// Grade letter helper
	const getGradeLetter = (score) => {
		if (score >= 90) return 'A';
		if (score >= 80) return 'B';
		if (score >= 70) return 'C';
		return 'D';
	};

	return (
		<div className="flex flex-col md:flex-row bg-white min-h-screen">
			{/* Sidebar on the Left */}
			<div className="flex flex-col shrink-0 items-center bg-[#FBF2FB] py-6 w-full md:w-64 border-b md:border-b-0 md:border-r border-[#DCC8E033] min-h-0 md:min-h-screen">
				<div className="flex flex-col items-center pb-8 px-5 w-full">
					<span className="text-[#E040A0] text-2xl font-bold cursor-pointer" onClick={() => navigate("/")}>
						{"My Better Grade"}
					</span>
				</div>
				<div className="flex flex-col items-start px-4 gap-1 w-full flex-1">
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
					<div className="flex items-center bg-[#F080C0] py-3 px-4 rounded-[9999px] cursor-pointer w-full text-[#2E1A28] font-bold" onClick={() => navigate("/academic-progress")}>
						<img
							src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/wQwYXX2xM2/3bwvb7zj_expires_30_days.png"}
							className="w-5 h-3 mr-3 rounded-[9999px] object-fill"
							alt="progress"
						/>
						<span className="text-sm" >
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
				<div className="flex justify-end items-center bg-[#FEF7FFCC] py-3 px-4 md:px-8 border-b border-[#DCC8E033]">
					<div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/profile")}>
						<span className="text-sm font-bold text-[#2E1A28]">{user ? user.name : "Alex Sterling"}</span>
						<img
							src={user?.avatarUrl || "https://storage.googleapis.com/tagjs-prod.appspot.com/v1/wQwYXX2xM2/uc6jo6mt_expires_30_days.png"}
							className="w-10 h-10 object-cover rounded-full border border-gray-100"
							alt="avatar"
						/>
					</div>
				</div>

				{/* Actual Page AcademicProgress Content */}
				<div className="flex flex-col flex-1 p-4 md:p-8 gap-8 overflow-y-auto bg-[#FEF7FF]">
					<div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/dashboard")}>
						<span className="text-[#7C52AA] text-xs font-bold tracking-[0.05em]" >
							{"← BACK TO DASHBOARD"}
						</span>
					</div>

					<div className="flex justify-between items-start self-stretch">
						<div className="flex flex-col shrink-0 items-start gap-2">
							<span className="text-[#E040A0] text-4xl font-bold">Academic Progress</span>
							<span className="text-[#604868] text-base">Visualize your journey to academic excellence.</span>
						</div>
					</div>

					{loading ? (
						<div className="p-12 text-center text-[#E040A0] font-bold animate-pulse">Calculating metrics...</div>
					) : (
						<>
							{/* Cards container wrapper for centering */}
							<div className="flex flex-col items-center self-stretch gap-6">
								
								{/* Top Row: Cumulative and Velocity */}
								<div className="flex flex-col xl:flex-row items-stretch self-stretch gap-6 w-full">
									{/* Cumulative Performance */}
									<div className="flex flex-col shrink-0 xl:w-[400px] items-center bg-white py-12 px-6 rounded-[32px] border border-solid border-[#FCE6F3]"
										style={{ boxShadow: "0px 4px 16px rgba(224, 64, 160, 0.15)" }}>
									<span className="text-[#E040A0] text-sm font-bold mb-6 text-center tracking-widest">
										{isTeacher ? "AVERAGE CLASS PROGRESS" : "CUMULATIVE PERFORMANCE"}
									</span>

									{/* Circle */}
									<div className="relative w-48 h-48 flex items-center justify-center mb-8">
										<svg className="absolute w-full h-full transform -rotate-90" viewBox="0 0 100 100">
											<circle cx="50" cy="50" r="41" stroke="#FCE6F3" strokeWidth="12" fill="transparent" />
											<circle cx="50" cy="50" r="41" stroke="#E040A0" strokeWidth="12" fill="transparent" strokeDasharray="257.6" strokeDashoffset={257.6 - (257.6 * (avgGrade || 97)) / 100} strokeLinecap="round" />
										</svg>
										<div className="flex flex-col items-center">
											<span className="text-[#2E1A28] text-5xl font-bold leading-none">
												{isTeacher ? `${avgGrade}%` : gpa}
											</span>
											<span className="text-[#604868] text-sm font-bold mt-1">
												{isTeacher ? "CLASS AVG" : "GPA"}
											</span>
										</div>
									</div>

									<div className="flex flex-col items-center gap-4 text-center px-4">
										<button className="bg-[#FFD6EE] py-2 px-6 rounded-full border-0">
											<span className="text-[#A02070] text-xs font-bold uppercase tracking-wider">
												{isTeacher ? "COURSE INSIGHTS" : "DEAN'S LIST STATUS"}
											</span>
										</button>
										<span className="text-[#604868] text-sm max-w-[260px] leading-relaxed">
											{isTeacher
												? "Monitoring the overall learning progress of students across active assignments."
												: "You are in the top 5% of your cohort this semester. Keep up the momentum!"}
										</span>
									</div>
								</div>

									{/* Study Velocity */}
									<div className="flex flex-col flex-1 bg-white p-8 rounded-[32px] border border-solid border-[#EBF8FF]"
										style={{ boxShadow: "0px 4px 16px rgba(0, 150, 204, 0.15)" }}>
									<div className="flex flex-col items-start mb-8">
										<span className="text-[#0096CC] text-sm font-bold tracking-widest">
											{isTeacher ? "CLASS ACTIVITY" : "STUDY VELOCITY"}
										</span>
										<span className="text-[#604868] text-sm mt-1">
											{isTeacher ? "Weekly submissions received" : "Weekly hours invested in active learning"}
										</span>
									</div>

									{/* Line Wave Chart */}
									<div className="w-full bg-cover bg-center pt-[150px] px-4 mb-8 relative"
										style={{ backgroundImage: 'url(https://storage.googleapis.com/tagjs-prod.appspot.com/v1/wQwYXX2xM2/8j4cbqjf_expires_30_days.png)' }}>
										<div className="flex justify-between items-center w-full absolute bottom-0 left-0 px-6 pb-2">
											{["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map(day => (
												<span key={day} className="text-[#604868] text-[10px] font-bold">{day}</span>
											))}
										</div>
									</div>

									<div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
										<div className="flex flex-col items-center bg-[#F2E8F2] py-4 px-2 rounded-[32px]">
											<span className="text-[#604868] text-[10px] font-bold uppercase text-center w-full truncate">
												{isTeacher ? "TOTAL STUDENTS" : "TOTAL HOURS"}
											</span>
											<span className="text-[#0096CC] text-xl font-bold mt-1">
												{isTeacher ? courseStudentsProgress.length : "42.5"}
											</span>
										</div>
										<div className="flex flex-col items-center bg-[#F2E8F2] py-4 px-2 rounded-[32px]">
											<span className="text-[#604868] text-[10px] font-bold uppercase text-center w-full truncate">
												{isTeacher ? "DAILY SUBMISSIONS" : "DAILY AVG"}
											</span>
											<span className="text-[#0096CC] text-xl font-bold mt-1">
												{isTeacher ? "3.2" : "6.1"}
											</span>
										</div>
										<div className="flex flex-col items-center bg-[#F2E8F2] py-4 px-2 rounded-[32px]">
											<span className="text-[#604868] text-[10px] font-bold uppercase text-center w-full truncate">
												{isTeacher ? "PEAK DAY" : "PEAK DAY"}
											</span>
											<span className="text-[#0096CC] text-xl font-bold mt-1">
												{isTeacher ? "Fri" : "Wed"}
											</span>
										</div>
									</div>
								</div>
								</div>
								
								{/* Recent Progress Log */}
								<div className="flex flex-col items-stretch bg-white p-4 md:p-8 rounded-[32px] border border-solid border-[#FCE6F3] w-full lg:max-w-[90%]"
									style={{ boxShadow: "0px 4px 16px rgba(224, 64, 160, 0.15)" }}>
								<div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
									<span className="text-[#E040A0] text-sm font-bold tracking-widest">
										{isTeacher ? "CLASS PROGRESS TRACKER" : "RECENT PROGRESS LOG"}
									</span>
									{isTeacher ? (
										<select
											value={selectedCourseId}
											onChange={(e) => setSelectedCourseId(e.target.value)}
											className="bg-[#F8EEF8] border-none px-4 py-2 rounded-full text-xs font-bold text-[#604868] outline-none"
										>
											{teacherCourses.map(c => (
												<option key={c.id} value={c.id}>{c.title}</option>
											))}
										</select>
									) : (
										<div className="flex items-center bg-[#F8EEF8] p-1 rounded-full">
											<button className="bg-white py-1.5 px-4 rounded-full text-[#E040A0] text-xs font-bold shadow-sm border-0">All</button>
											<button className="bg-transparent py-1.5 px-4 rounded-full text-[#604868] text-xs font-bold border-0">Grades</button>
											<button className="bg-transparent py-1.5 px-4 rounded-full text-[#604868] text-xs font-bold border-0">Units</button>
										</div>
									)}
								</div>

								<div className="flex flex-col w-full overflow-x-auto">
									<div className="min-w-[600px]">
										{/* Header Row */}
										<div className="grid grid-cols-[2fr_1fr_1fr_0.5fr] px-6 pb-4">
											<span className="text-[#604868] text-[10px] font-bold uppercase">{isTeacher ? "STUDENT NAME" : "ACTIVITY NAME"}</span>
											<span className="text-[#604868] text-[10px] font-bold uppercase text-center">{isTeacher ? "PROGRESS" : "STATUS / SCORE"}</span>
											<span className="text-[#604868] text-[10px] font-bold uppercase text-center">{isTeacher ? "EMAIL" : "COMPLETION DATE"}</span>
											<span className="text-[#604868] text-[10px] font-bold uppercase text-right pr-4">ACTION</span>
										</div>

										{/* List Items */}
										<div className="flex flex-col gap-4">
											{isTeacher ? (
												courseStudentsProgress.length > 0 ? (
													courseStudentsProgress.map((student, idx) => (
														<div key={student.studentId} className="grid grid-cols-[2fr_1fr_1fr_0.5fr] items-center bg-[#FBF2FB] py-3 px-4 rounded-[48px]">
															<div className="flex items-center gap-3">
																<div className="w-10 h-10 rounded-full bg-[#FCE6F3] flex items-center justify-center text-lg">
																	👤
																</div>
																<span className="text-[#2E1A28] text-sm font-bold truncate pr-4">{student.studentName}</span>
															</div>
															<div className="flex justify-center">
																<span className="bg-[#FFD6EE] text-[#A02070] px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest whitespace-nowrap">
																	{`${student.progressPercentage}%`}
																</span>
															</div>
															<span className="text-[#604868] text-xs text-center truncate px-2">{student.email}</span>
															<div className="flex justify-end pr-2">
																<button className="p-2 rounded-full hover:bg-white/50 text-[#E040A0] transition border-0 bg-transparent cursor-pointer" onClick={() => alert(`Student: ${student.studentName}`)}>
																	<svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2.5" /></svg>
																</button>
															</div>
														</div>
													))
												) : (
													<div className="p-8 text-center text-gray-400 text-sm">No students enrolled.</div>
												)
											) : (
												progressData.length > 0 ? (
													progressData.map((prog, idx) => {
														const grade = getGradeLetter(prog.progressPercentage);
														const isLesson = prog.submittedAssignments === 0;
														const themes = [
															{ bg: 'bg-[#FBF2FB]', iconBg: 'bg-[#FFFFFF]', text: 'text-[#E040A0]', pillBg: 'bg-[#FFD6EE]', pillText: 'text-[#A02070]', iconImg: 'https://storage.googleapis.com/tagjs-prod.appspot.com/v1/wQwYXX2xM2/mq8krafh_expires_30_days.png' },
															{ bg: 'bg-[#F0F9FF]', iconBg: 'bg-[#FFFFFF]', text: 'text-[#0096CC]', pillBg: 'bg-[#C8EAFF]', pillText: 'text-[#005580]', iconImg: 'https://storage.googleapis.com/tagjs-prod.appspot.com/v1/wQwYXX2xM2/f988f0jj_expires_30_days.png' },
															{ bg: 'bg-[#F5F3F9]', iconBg: 'bg-[#FFFFFF]', text: 'text-[#7C52AA]', pillBg: 'bg-[#EEDCFF]', pillText: 'text-[#4A3068]', iconImg: 'https://storage.googleapis.com/tagjs-prod.appspot.com/v1/wQwYXX2xM2/rvz3g3nv_expires_30_days.png' }
														];
														const theme = themes[idx % themes.length];

														return (
															<div key={prog.courseId} className={`grid grid-cols-[2fr_1fr_1fr_0.5fr] items-center ${theme.bg} py-3 px-4 rounded-[48px]`}>
																<div className="flex items-center gap-4">
																	<img src={theme.iconImg} className="h-8 object-contain" alt="icon" />
																	<span className="text-[#2E1A28] text-sm font-bold truncate pr-4">{prog.courseTitle}</span>
																</div>
																<div className="flex justify-center">
																	<span className={`${theme.pillBg} ${theme.pillText} px-4 py-1.5 rounded-full text-[10px] font-bold tracking-widest whitespace-nowrap`}>
																		{isLesson ? "LESSON COMPLETED" : grade}
																	</span>
																</div>
																<span className="text-[#604868] text-xs text-center">Dec 14, 2023</span>
																<div className="flex justify-end pr-2">
																	<button className={`border-0 bg-transparent hover:scale-110 transition cursor-pointer flex items-center justify-center ${theme.text}`} onClick={() => alert(`View ${prog.courseTitle}`)}>
																		{idx % 3 === 0 ? (
																			<svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2.5" /></svg>
																		) : (idx % 3 === 1 ? (
																			<svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15.91 11.672a.375.375 0 010 .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z" /></svg>
																		) : (
																			<svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
																		))}
																	</button>
																</div>
															</div>
														);
													})
												) : (
													<>
														{/* Row 1 */}
														<div className="grid grid-cols-[2fr_1fr_1fr_0.5fr] items-center bg-[#FBF2FB] py-3 px-4 rounded-[48px]">
															<div className="flex items-center gap-4">
																<img src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/wQwYXX2xM2/mq8krafh_expires_30_days.png" className="h-8 object-contain" alt="icon" />
																<span className="text-[#2E1A28] text-sm font-bold truncate pr-4">Advanced Thermodynamics Final</span>
															</div>
															<div className="flex justify-center">
																<span className="bg-[#FFD6EE] text-[#A02070] px-4 py-1.5 rounded-full text-[10px] font-bold tracking-widest whitespace-nowrap">
																	A+
																</span>
															</div>
															<span className="text-[#604868] text-xs text-center">Dec 14, 2023</span>
															<div className="flex justify-end pr-2">
																<button className="border-0 bg-transparent hover:scale-110 transition cursor-pointer flex items-center justify-center text-[#E040A0]" onClick={() => alert('View Details')}>
																	<svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2.5" /></svg>
																</button>
															</div>
														</div>

														{/* Row 2 */}
														<div className="grid grid-cols-[2fr_1fr_1fr_0.5fr] items-center bg-[#F0F9FF] py-3 px-4 rounded-[48px]">
															<div className="flex items-center gap-4">
																<img src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/wQwYXX2xM2/f988f0jj_expires_30_days.png" className="h-8 object-contain" alt="icon" />
																<span className="text-[#2E1A28] text-sm font-bold truncate pr-4">Data Structures & Algorithms</span>
															</div>
															<div className="flex justify-center">
																<span className="bg-[#C8EAFF] text-[#005580] px-4 py-1.5 rounded-full text-[10px] font-bold tracking-widest whitespace-nowrap">
																	LESSON COMPLETED
																</span>
															</div>
															<span className="text-[#604868] text-xs text-center">Dec 12, 2023</span>
															<div className="flex justify-end pr-2">
																<button className="border-0 bg-transparent hover:scale-110 transition cursor-pointer flex items-center justify-center text-[#0096CC]" onClick={() => alert('View Details')}>
																	<svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15.91 11.672a.375.375 0 010 .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z" /></svg>
																</button>
															</div>
														</div>

														{/* Row 3 */}
														<div className="grid grid-cols-[2fr_1fr_1fr_0.5fr] items-center bg-[#F5F3F9] py-3 px-4 rounded-[48px]">
															<div className="flex items-center gap-4">
																<img src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/wQwYXX2xM2/rvz3g3nv_expires_30_days.png" className="h-8 object-contain" alt="icon" />
																<span className="text-[#2E1A28] text-sm font-bold truncate pr-4">Advanced French Lit Essay</span>
															</div>
															<div className="flex justify-center">
																<span className="bg-[#EEDCFF] text-[#4A3068] px-4 py-1.5 rounded-full text-[10px] font-bold tracking-widest whitespace-nowrap">
																	A
																</span>
															</div>
															<span className="text-[#604868] text-xs text-center">Dec 10, 2023</span>
															<div className="flex justify-end pr-2">
																<button className="border-0 bg-transparent hover:scale-110 transition cursor-pointer flex items-center justify-center text-[#7C52AA]" onClick={() => alert('View Details')}>
																	<svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
																</button>
															</div>
														</div>
													</>
												)
											)}
										</div>
									</div>
								</div>
								</div>
							</div>
						</>
					)}
				</div>
			</div>
		</div>
	);
}
