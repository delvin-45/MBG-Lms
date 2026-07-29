import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../services/api";

export default function AssignmentList() {
	const navigate = useNavigate();
	const { user, logout } = useAuth();
	const isTeacher = user?.role === 'teacher';

	// Filters tab state
	const [activeFilter, setActiveFilter] = useState("Pending");

	// Focus Mode Pomodoro Timer state
	const [timeLeft, setTimeLeft] = useState(1500); // 25:00 in seconds
	const [timerRunning, setTimerRunning] = useState(false);

	// Fitur Pomodoro Focus Mode: Mengurangi timeLeft tiap 1 detik & membersihkan interval saat unmount (mencegah memory leak)
	useEffect(() => {
		let interval = null;
		if (timerRunning && timeLeft > 0) {
			interval = setInterval(() => {
				setTimeLeft((prev) => prev - 1);
			}, 1000);
		} else if (timeLeft === 0) {
			setTimerRunning(false);
			alert("Sesi fokus Pomodoro selesai!");
		}
		// Cleanup function: Matikan timer dari RAM jika user pindah halaman
		return () => clearInterval(interval);
	}, [timerRunning, timeLeft]);

	const formatTime = (seconds) => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
	};

	const handleResetTimer = () => {
		setTimerRunning(false);
		setTimeLeft(1500);
	};

	// State for dynamic assignments and submissions
	const [courses, setCourses] = useState([]);
	const [assignments, setAssignments] = useState([]);
	const [submissions, setSubmissions] = useState([]);
	const [gradesInput, setGradesInput] = useState({});
	const [loading, setLoading] = useState(true);

	// Load courses and compile assignments
	const loadData = async () => {
		setLoading(true);
		try {
			// 1. Fetch courses
			const courseRes = await api.get('/courses');
			if (courseRes.status === 'success' && courseRes.data) {
				const coursesList = Array.isArray(courseRes.data) ? courseRes.data : (courseRes.data.data || []);
				setCourses(coursesList);

				// 2. Fetch assignments for each course
				const assignmentsPromises = coursesList.map(c =>
					api.get(`/courses/${c.id}/assignments`)
						.then(res => res.status === 'success' ? res.data.map(a => ({ ...a, courseTitle: c.title, courseCategory: c.category })) : [])
						.catch(() => [])
				);
				const results = await Promise.all(assignmentsPromises);
				const mergedAssignments = results.flat();

				// 3. If student, fetch their submission for each assignment
				if (user?.role === 'student') {
					const submissionPromises = mergedAssignments.map(a =>
						api.get(`/assignments/${a.id}/submission`)
							.then(res => res.status === 'success' && res.data ? { assignmentId: a.id, submission: res.data } : null)
							.catch(() => null)
					);
					const subs = await Promise.all(submissionPromises);
					const assignmentWithSubs = mergedAssignments.map(a => {
						const subObj = subs.find(s => s?.assignmentId === a.id);
						return { ...a, submission: subObj ? subObj.submission : null };
					});
					setAssignments(assignmentWithSubs);
				} else if (isTeacher) {
					// 4. If teacher, fetch submissions for all their assignments
					const teacherCourses = coursesList.filter(c => c.teacherId === user.id);
					const teacherAssignments = mergedAssignments.filter(a => teacherCourses.some(tc => tc.id === a.courseId));
					setAssignments(teacherAssignments);

					const submissionPromises = teacherAssignments.map(a =>
						api.get(`/assignments/${a.id}/submissions`)
							.then(res => res.status === 'success' && res.data ? res.data.map(s => ({ ...s, assignmentTitle: a.title })) : [])
							.catch(() => [])
					);
					const subsResults = await Promise.all(submissionPromises);
					setSubmissions(subsResults.flat());
				} else {
					setAssignments(mergedAssignments);
				}
			}
		} catch (err) {
			console.error("Failed to load assignments page data:", err);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadData();
	}, [user]);

	const handleGradeSubmit = async (submissionId) => {
		const score = gradesInput[submissionId];
		if (!score || isNaN(score) || score < 0 || score > 100) {
			alert("Please enter a valid grade between 0 and 100.");
			return;
		}

		try {
			const res = await api.put(`/assignments/submissions/${submissionId}/grade`, { score: Number(score) });
			if (res.status === 'success') {
				alert("Grade submitted successfully!");
				loadData(); // reload
			} else {
				alert(res.message || "Failed to submit grade");
			}
		} catch (err) {
			alert(err.message || "Failed to submit grade");
		}
	};

	const handleDeleteAssignment = async (assignmentId) => {
		if (window.confirm("Are you sure you want to delete this assignment?")) {
			try {
				const res = await api.delete(`/assignments/${assignmentId}`);
				if (res.status === 'success') {
					alert("Assignment deleted successfully");
					loadData();
				} else {
					alert(res.message || "Failed to delete assignment");
				}
			} catch (err) {
				alert(err.message || "Failed to delete assignment");
			}
		}
	};

	// Determine filtered assignments for student
	const getFilteredAssignments = () => {
		if (user?.role !== 'student') return assignments;
		return assignments.filter(task => {
			if (activeFilter === "Pending") {
				// No submission yet
				return !task.submission;
			} else if (activeFilter === "Submitted") {
				// Submitted but not graded yet
				return task.submission && task.submission.status === 'submitted';
			} else if (activeFilter === "Completed") {
				// Graded
				return task.submission && task.submission.status === 'graded';
			}
			return true;
		});
	};

	// Determine filtered submissions for teacher
	const getFilteredSubmissions = () => {
		return submissions.filter(sub => {
			if (activeFilter === "Pending") {
				return sub.status === 'submitted';
			} else if (activeFilter === "Completed") {
				return sub.status === 'graded';
			}
			return true; // "Submitted" shows all
		});
	};

	// Helper visual stylers
	const getCategoryColors = (category) => {
		switch (category?.toLowerCase()) {
			case 'design': return "bg-[#E040A01A] text-[#E040A0] border-[#E040A0]";
			case 'tech': return "bg-[#0096CC1A] text-[#0096CC] border-[#0096CC]";
			case 'business': return "bg-[#7C52AA1A] text-[#7C52AA] border-[#7C52AA]";
			default: return "bg-gray-100 text-gray-500 border-gray-400";
		}
	};

	const getCourseButtonColor = (category) => {
		switch (category?.toLowerCase()) {
			case 'design': return "bg-[#E040A0] hover:bg-[#c03080]";
			case 'tech': return "bg-[#0096CC] hover:bg-[#007ba8]";
			case 'business': return "bg-[#7C52AA] hover:bg-[#604085]";
			default: return "bg-gray-500 hover:bg-gray-600";
		}
	};

	const filteredTasks = getFilteredAssignments();
	const filteredSubs = getFilteredSubmissions().sort((a, b) => new Date(a.submittedAt) - new Date(b.submittedAt));

	return (
		<div className="flex flex-col md:flex-row bg-white min-h-screen md:h-screen md:overflow-hidden font-sans antialiased text-gray-800">
			{/* Sidebar on the Left */}
			<div className="flex flex-col shrink-0 items-center bg-[#FBF2FB] py-6 w-full md:w-64 border-b md:border-b-0 md:border-r border-[#DCC8E033] md:h-screen md:sticky md:top-0 z-30 overflow-y-auto">
				<div className="flex flex-col items-center pb-8 px-5 w-full">
					<span className="text-[#E040A0] text-2xl font-bold cursor-pointer" onClick={() => navigate("/")}>
						{"My Better Grade"}
					</span>
				</div>
				<div className="flex flex-col items-start px-4 gap-1 w-full flex-1">
					<div className="flex items-center py-3 px-4 cursor-pointer w-[calc(100%-1.5rem)] mx-3 rounded-full hover:bg-purple-50" onClick={() => navigate("/dashboard")}>
						<img
							src={"/Image (dashboard)_margin.png"}
							className="w-5 h-5 mr-3.5 object-contain shrink-0"
							alt="dashboard"
						/>
						<span className="text-[#604868] text-sm" >
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
					<div className="flex items-center bg-[#F080C0] py-3 px-4 cursor-pointer w-[calc(100%-1.5rem)] mx-3 rounded-full text-[#2E1A28] font-bold" onClick={() => navigate("/assignments")}>
						<img
							src={"/Image (assignments)_margin.png"}
							className="w-5 h-5 mr-3.5 object-contain shrink-0"
							alt="assignments"
						/>
						<span className="text-sm" >
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
				<div className="flex justify-end items-center bg-[#FEF7FFCC] py-3 px-8 border-b border-[#DCC8E033] h-16 w-full shrink-0">
					<div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/profile")}>
						<span className="text-sm font-bold text-[#2E1A28]">{user ? user.name : "Alex Sterling"}</span>
						<img
							src={user?.avatarUrl || "/assets/default-avatar.png"}
							className="w-10 h-10 object-cover rounded-full border border-gray-100"
							alt="avatar"
						/>
					</div>
				</div>

				{/* Actual Page Assignments Content */}
				<div className="flex flex-1 p-6 md:p-8 gap-6 md:gap-8 max-w-[1200px] w-full mx-auto">

					{/* Left Assignments List Column */}
					<div className="flex flex-col flex-1 min-w-0 gap-6">

						{/* Header row */}
						<div className="flex flex-col items-start w-full gap-4 border-b border-[#DCC8E022] pb-4">
							<div className="w-full">
								<h1 className="text-[#2E1A28] text-3xl md:text-4xl font-extrabold tracking-tight">Assignments</h1>
								<p className="text-[#604868] text-sm mt-1 leading-relaxed">
									{isTeacher
										? "Manage assignments catalog and grade student submissions."
										: "Stay on top of your academic journey."}
								</p>
							</div>

							<div className="flex flex-wrap items-center gap-3 shrink-0 w-full mt-2">
								{isTeacher && (
									<button
										className="bg-[#E040A0] text-white py-2 px-5 rounded-full font-bold text-sm border-0 shadow-md hover:bg-[#c03080] transition flex items-center gap-2 cursor-pointer"
										onClick={() => navigate("/add-assignment")}
									>
										<svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
										Add Assignment
									</button>
								)}
								{/* Filter Pill Tabs */}
								<div className="flex bg-[#FBF2FB] p-1 rounded-full border border-[#DCC8E033] w-fit">
									{["Pending", "Submitted", "Completed"].map((tab) => (
										<button
											key={tab}
											onClick={() => setActiveFilter(tab)}
											className={`py-1.5 px-4 rounded-full font-bold text-[11px] border-0 transition ${activeFilter === tab
													? "bg-white text-[#E040A0] shadow-sm"
													: "text-[#604868] hover:text-[#E040A0] bg-transparent cursor-pointer"
												}`}
										>
											{tab}
										</button>
									))}
								</div>
							</div>
						</div>

						{loading ? (
							<div className="p-12 text-center text-gray-500 font-bold animate-pulse">Loading assignments...</div>
						) : (
							<>
								{/* Submissions Section for Teacher */}
								{isTeacher && (
									<div className="flex flex-col gap-4">
										<h3 className="text-[#2E1A28] text-lg font-bold flex items-center gap-2">
											📝 Submissions ({activeFilter} List)
										</h3>

										{filteredSubs.length === 0 ? (
											<div className="text-gray-400 text-sm py-8 text-center bg-white rounded-[32px] border border-[#DCC8E088]">No submissions found matching filter.</div>
										) : (
											<div className="flex flex-col gap-4">
												{filteredSubs.map((sub) => (
													<div key={sub.id} className="bg-white p-5 rounded-[24px] border border-solid border-[#DCC8E088] shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
														<div className="min-w-0 flex-1">
															<span className="bg-[#EEDCFF] text-[#7C52AA] text-[10px] font-black py-1 px-3 rounded-full uppercase tracking-wider block w-fit mb-2">
																{sub.assignmentTitle}
															</span>
															<h4 className="text-[#2E1A28] text-lg font-extrabold truncate">{sub.studentName}</h4>
															<p className="text-[#604868] font-semibold text-xs mt-1 flex items-center gap-2 truncate">
																<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>
																Submitted: {new Date(sub.submittedAt).toLocaleDateString()}
																<a
																	href={sub.fileUrl}
																	target="_blank"
																	rel="noopener noreferrer"
																	className="text-[#0096CC] hover:underline font-bold flex items-center gap-1 ml-2"
																>
																	<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
																	View Work
																</a>
															</p>
															{sub.note && <p className="text-gray-500 text-xs italic mt-2 text-left">Note: "{sub.note}"</p>}
														</div>

														<div className="flex flex-wrap items-center gap-3 shrink-0 w-full md:w-auto justify-start md:justify-end mt-2 md:mt-0">
															{sub.status === "graded" ? (
																<div className="text-right">
																	<span className="text-emerald-500 font-extrabold text-xl">{sub.score} / 100</span>
																	<p className="text-gray-400 text-[10px] uppercase font-bold mt-0.5 tracking-wider">GRADED</p>
																</div>
															) : (
																<>
																	<div className="flex items-center rounded-full px-4 py-2 bg-[#F5EEF6] border border-transparent w-28">
																		<input
																			type="number"
																			placeholder="Grade"
																			min="0"
																			max="100"
																			value={gradesInput[sub.id] || ''}
																			onChange={(e) => setGradesInput({ ...gradesInput, [sub.id]: e.target.value })}
																			className="bg-transparent text-sm font-bold w-full outline-none text-[#2E1A28] placeholder-gray-400"
																		/>
																	</div>
																	<button className="bg-[#E040A0] text-white py-2 px-5 rounded-full font-bold text-sm shadow-sm hover:bg-[#c03080] border-0 transition cursor-pointer"
																		onClick={() => handleGradeSubmit(sub.id)}>
																		Submit Grade
																	</button>
																</>
															)}
														</div>
													</div>
												))}
											</div>
										)}
									</div>
								)}

								{/* Assignments Cards list */}
								<div className="flex flex-col gap-4 mt-2">
									<h3 className="text-[#2E1A28] text-xl font-bold">
										{isTeacher ? "Catalog of Published Assignments" : "Active Tasks & Homework"}
									</h3>

									<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
										{filteredTasks.length === 0 ? (
											<div className="text-gray-400 text-sm py-12 text-center bg-white rounded-3xl border border-dashed border-[#DCC8E0] col-span-full">
												No assignments found matching criteria.
											</div>
										) : (
											filteredTasks.map((task) => (
												<div key={task.id} className="group bg-white p-6 rounded-[32px] border border-solid border-[#DCC8E088] shadow-sm hover:shadow-md transition flex flex-col justify-between items-start gap-4 relative overflow-hidden h-full">
													{/* Colored left bar */}
													<div className="absolute left-0 top-0 bottom-0 w-2" style={{ backgroundColor: getCourseButtonColor(task.courseCategory) }}></div>

													{/* Actions (Teacher only) */}
													{isTeacher && (
														<>
															<button
																className="absolute top-4 right-14 bg-blue-500/90 text-white w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-blue-600 transition-all shadow-md z-10 cursor-pointer"
																title="Edit Assignment"
																onClick={(e) => {
																	e.stopPropagation();
																	navigate("/add-assignment", { state: { editAssignment: task } });
																}}
															>
																<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
															</button>
															<button
																className="absolute top-4 right-4 bg-red-500/90 text-white w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-600 transition-all shadow-md z-10 cursor-pointer"
																title="Delete Assignment"
																onClick={(e) => {
																	e.stopPropagation();
																	handleDeleteAssignment(task.id);
																}}
															>
																<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
															</button>
														</>
													)}

													<div className="flex flex-col items-start gap-3 pl-2 w-full mt-2 md:mt-0">
														<div className="flex justify-between items-center w-full">
															<span className={`${getCategoryColors(task.courseCategory)} text-[10px] font-black tracking-widest uppercase py-1 px-3 rounded-full border`}>
																{task.courseTitle}
															</span>

															<div className="text-right">
																<span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block leading-none">MAX SCORE</span>
																<span className="text-xl font-black text-[#E040A0]" style={{ color: getCourseButtonColor(task.courseCategory) }}>{task.maxScore}</span>
															</div>
														</div>

														<h3 className="text-[#2E1A28] text-lg font-extrabold mt-1 truncate w-full">
															{task.title}
														</h3>

														<p className="text-gray-500 text-sm leading-relaxed line-clamp-2">
															{task.description || "No description provided."}
														</p>
													</div>

													{/* Bottom Row */}
													<div className="flex items-center justify-between w-full pl-2 mt-2 pt-4 border-t border-[#DCC8E033]">
														<span className="text-[#604868] text-xs font-semibold flex items-center gap-1">
															⏱ Due: {new Date(task.deadline).toLocaleDateString()}
														</span>

														{/* For student submission statuses */}
														{user?.role === 'student' && (
															<div>
																{task.submission ? (
																	task.submission.status === 'graded' ? (
																		<span className="text-emerald-500 font-bold text-sm">Graded: {task.submission.score}</span>
																	) : (
																		<span className="text-[#7C52AA] text-xs font-bold bg-[#EEDCFF] py-1 px-3 rounded-full">Submitted</span>
																	)
																) : (
																	<button
																		className={`${getCourseButtonColor(task.courseCategory)} text-white py-2 px-5 rounded-full font-bold text-xs border-0 transition shadow-sm cursor-pointer`}
																		onClick={() => navigate("/submit-assignment", { state: { assignmentId: task.id, assignmentTitle: task.title } })}
																	>
																		Submit Now
																	</button>
																)}
															</div>
														)}
													</div>
												</div>
											))
										)}

										{/* Teacher "Publish New Assignment" dashed card */}
										{isTeacher && (
											<div
												className="bg-[#FEF7FF]/50 p-6 rounded-[32px] border-2 border-dashed border-[#DCC8E0] hover:border-[#E040A0] transition flex flex-col justify-center items-center gap-3 cursor-pointer min-h-[200px]"
												onClick={() => navigate("/add-assignment")}
											>
												<div className="w-10 h-10 rounded-full bg-white border border-[#DCC8E0] flex items-center justify-center text-[#604868] text-xl font-light">
													+
												</div>
												<span className="text-[#604868] font-bold text-sm">Publish New Assignment</span>
											</div>
										)}
									</div>
								</div>
							</>
						)}
					</div>

					{/* Right Sidebar Focus Mode & Motivation Column */}
					<div className="flex flex-col w-72 md:w-80 gap-6 shrink-0">

						{/* Focus Mode Pomodoro Card */}
						<div className={`${isTeacher ? 'bg-[#F080C0]' : 'bg-[#E040A0]'} rounded-[32px] p-6 text-center flex flex-col items-center gap-6 shadow-xl relative overflow-hidden`}>
							<div className="absolute -right-16 -top-16 w-40 h-40 rounded-full bg-white/10 blur-xl"></div>

							<h3 className={`text-lg font-bold ${isTeacher ? 'text-[#2E1A28]' : 'text-white'}`}>Focus Mode</h3>

							{/* Glowing Timer Circle */}
							<div className={`w-36 h-36 rounded-full border-[6px] ${isTeacher ? 'border-[#2E1A28]' : 'border-white/20'} flex items-center justify-center relative shadow-inner`}>
								<span className={`text-4xl font-black tracking-widest relative z-10 ${isTeacher ? 'text-[#2E1A28]' : 'text-white'}`}>
									{formatTime(timeLeft)}
								</span>
							</div>

							<p className={`text-xs ${isTeacher ? 'text-[#2E1A28]/80' : 'text-white/80'}`}>Ready for a deep work session?</p>

							{/* Actions */}
							<div className="flex items-center gap-3 w-full">
								<button
									className={`flex-1 bg-white hover:bg-gray-50 py-3 rounded-full font-bold text-sm border-0 transition shadow-sm cursor-pointer ${isTeacher ? 'text-[#F080C0]' : 'text-[#E040A0]'}`}
									onClick={() => setTimerRunning(!timerRunning)}
								>
									{timerRunning ? "Pause" : "Start"}
								</button>
								<button
									className={`w-11 h-11 ${isTeacher ? 'bg-white/30 text-white hover:bg-white/40' : 'bg-white/20 text-white hover:bg-white/30'} rounded-full border-0 flex items-center justify-center cursor-pointer transition text-lg`}
									onClick={handleResetTimer}
								>
									⟲
								</button>
							</div>
						</div>

						{/* Aesthetic Motivational Card */}
						<div className="bg-white rounded-[32px] border border-solid border-[#DCC8E088] shadow-sm overflow-hidden flex flex-col">
							<div className="h-36 relative bg-gray-150">
								<img
									src="https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=500&auto=format&fit=crop&q=60"
									className="w-full h-full object-cover"
									alt="motivation plant"
								/>
							</div>
							<div className="p-5 flex flex-col gap-2">
								<div className="text-pink-500 text-sm">★★★★★</div>
								<h4 className="text-[#2E1A28] text-sm font-bold">
									{isTeacher ? `Keep up the guidance, Coach!` : `Keep on learning, ${user?.name || "Mas Wowok"}!`}
								</h4>
								<p className="text-gray-400 text-[11px] leading-relaxed">
									{isTeacher
										? "Manage your dashboard metrics and grade assignments on time to motivate your student class cohort."
										: "Your study schedule is set up for success today. Take breaks and remain focused."}
								</p>
							</div>
						</div>

						{/* Weekly Overview Card */}
						<div className="bg-[#FEF7FF] rounded-[32px] border border-solid border-[#DCC8E088] p-5 shadow-sm flex flex-col gap-4">
							<div className="flex items-center gap-2">
								<span className="text-lg">📊</span>
								<h4 className="text-[#2E1A28] text-sm font-bold">LMS Overview</h4>
							</div>
							<div className="grid grid-cols-2 gap-4">
								<div className="bg-white p-4 rounded-2xl text-center border border-gray-100 flex flex-col justify-center items-center">
									<span className="text-[10px] text-gray-400 font-bold uppercase">
										ASSIGNMENTS
									</span>
									<span className="text-[#2E1A28] text-xl font-bold mt-1">{assignments.length}</span>
								</div>
								<div className="bg-white p-4 rounded-2xl text-center border border-gray-100 flex flex-col justify-center items-center">
									<span className="text-[10px] text-gray-400 font-bold uppercase">
										COURSES
									</span>
									<span className="text-[#7C52AA] text-xl font-bold mt-1">{courses.length}</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
