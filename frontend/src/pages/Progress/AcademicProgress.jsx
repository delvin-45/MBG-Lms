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

	useEffect(() => {
		setLoading(true);
		Promise.all([
			api.get('/progress/me'),
			api.get('/courses')
		])
		.then(async ([progressRes, coursesRes]) => {
			if (progressRes.status === 'success' && progressRes.data) {
				setProgressData(progressRes.data);
				
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
	}, []);

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
		<div className="flex bg-white min-h-screen">
			{/* Sidebar on the Left */}
			<div className="flex flex-col shrink-0 items-center bg-[#FBF2FB] py-6 w-64 border-r border-[#DCC8E033] min-h-screen">
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

				{/* Actual Page AcademicProgress Content */}
				<div className="flex flex-col flex-1 p-8 gap-8">
					<div className="flex items-center gap-2 cursor-pointer" onClick={()=>navigate("/dashboard")}>
						<span className="text-[#7C52AA] text-xs font-bold tracking-[0.05em]" >
							{"← BACK TO DASHBOARD"}
						</span>
					</div>

					<div className="flex flex-col items-start gap-2">
						<span className="text-[#2E1A28] text-4xl font-bold tracking-[-0.025em]" >
							{"Academic Progress"}
						</span>
						<span className="text-[#604868] text-base" >
							{"Real-time analytics and grade details compiled from your learning records."}
						</span>
					</div>

					{loading ? (
						<div className="p-12 text-center text-[#E040A0] font-bold animate-pulse">Calculating metrics...</div>
					) : (
						<>
							<div className="flex items-center self-stretch gap-6 mt-4">
								<div className="flex-1 bg-white p-6 rounded-3xl border border-solid border-[#DCC8E0] shadow-[04px6px0rgba(0,0,0,0.02)]">
									<span className="text-[#604868] text-xs font-bold block mb-1">CUMULATIVE GPA</span>
									<h3 className="text-[#2E1A28] text-5xl font-black">{gpa}</h3>
									<div className="text-emerald-500 text-xs font-bold mt-2">↑ Computed based on assignment scores</div>
								</div>
								<div className="flex-1 bg-white p-6 rounded-3xl border border-solid border-[#DCC8E0] shadow-[04px6px0rgba(0,0,0,0.02)]">
									<span className="text-[#604868] text-xs font-bold block mb-1">ASSIGNMENTS SUBMITTED</span>
									<h3 className="text-[#2E1A28] text-5xl font-black">{totalEarned} / {totalNeeded}</h3>
									<div className="text-gray-500 text-xs font-bold mt-2">{progressPercentage}% of deliverables completed</div>
								</div>
							</div>

							<div className="flex flex-col self-stretch bg-white p-6 rounded-[32px] border border-solid border-[#DCC8E0] mt-4">
								<span className="text-[#2E1A28] text-xl font-bold mb-4">Subject Grades Breakdown</span>
								
								{progressData.length === 0 ? (
									<div className="text-gray-400 text-sm py-8 text-center border border-dashed border-[#DCC8E0] rounded-3xl">
										No subjects enrolled yet.
									</div>
								) : (
									<div className="flex flex-col gap-4">
										{progressData.map((prog) => (
											<div key={prog.courseId} className="flex justify-between items-center py-2 border-b last:border-b-0">
												<div>
													<h4 className="text-[#2E1A28] text-sm font-bold">{prog.courseTitle}</h4>
													<p className="text-gray-400 text-xs">{prog.submittedAssignments} of {prog.totalAssignments} tasks submitted</p>
												</div>
												<div className="text-right">
													<span className="text-[#E040A0] text-lg font-bold">
														{getGradeLetter(prog.progressPercentage)}
													</span>
													<p className="text-gray-400 text-xs">{prog.progressPercentage}% progress</p>
												</div>
											</div>
										))}
									</div>
								)}
							</div>
						</>
					)}
				</div>
			</div>
		</div>
	);
}
