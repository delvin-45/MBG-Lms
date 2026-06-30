import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../services/api";

export default function CourseDetail() {
	const navigate = useNavigate();
	const location = useLocation();
	const { user, logout } = useAuth();
	
	const courseId = location.state?.courseId;
	
	const [course, setCourse] = useState(null);
	const [materials, setMaterials] = useState([]);
	const [assignments, setAssignments] = useState([]);
	const [progressVal, setProgressVal] = useState(0);
	const [loading, setLoading] = useState(true);

	// Load course info, materials, and assignments
	useEffect(() => {
		if (courseId) {
			setLoading(true);
			Promise.all([
				api.get(`/courses/${courseId}`),
				api.get(`/courses/${courseId}/materials`),
				api.get(`/courses/${courseId}/assignments`)
			])
			.then(([courseRes, materialsRes, assignmentsRes]) => {
				if (courseRes.status === 'success') setCourse(courseRes.data);
				if (materialsRes.status === 'success') setMaterials(materialsRes.data);
				if (assignmentsRes.status === 'success') setAssignments(assignmentsRes.data);
			})
			.catch(err => console.error('Failed to load course details:', err))
			.finally(() => setLoading(false));
		}
	}, [courseId]);

	// Fetch student's progress for this course
	useEffect(() => {
		if (user?.role === 'student' && courseId) {
			api.get('/progress/me')
				.then(res => {
					if (res.status === 'success' && res.data) {
						const progressObj = res.data.find(p => String(p.courseId) === String(courseId));
						if (progressObj) {
							setProgressVal(progressObj.progressPercentage);
						}
					}
				})
				.catch(err => console.error('Failed to fetch student progress:', err));
		}
	}, [user, courseId]);

	if (!courseId) {
		return (
			<div className="flex flex-col items-center justify-center min-h-screen bg-[#FEF7FF] p-8 gap-4">
				<span className="text-xl font-bold text-gray-500">No course selected</span>
				<button 
					className="bg-[#E040A0] text-white py-2 px-6 rounded-full font-bold text-sm border-0"
					onClick={() => navigate('/my-courses')}
				>
					Back to Courses
				</button>
			</div>
		);
	}

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-screen bg-[#FEF7FF]">
				<span className="text-lg font-bold text-[#E040A0] animate-pulse">Loading course detail...</span>
			</div>
		);
	}

	return (
		<div className="flex bg-white min-h-screen font-sans">
			{/* Left Sidebar */}
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
					<div className="flex items-center bg-[#E040A0] py-3 px-4 rounded-[9999px] cursor-pointer w-full text-[#2E1A28] font-bold" onClick={() => navigate("/my-courses")}>
						<img
							src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/wQwYXX2xM2/3jiucock_expires_30_days.png"} 
							className="w-[22px] h-[18px] mr-3 rounded-[9999px] object-fill"
							alt="courses"
						/>
						<span className="text-sm" >
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

			{/* Main Content Area */}
			<div className="flex flex-col flex-1 min-h-screen">
				{/* Top Bar Navbar */}
				<div className="flex justify-between items-center bg-white py-3 px-8 border-b border-gray-100">
					<span className="text-[#E040A0] text-xl font-bold cursor-pointer" onClick={() => navigate("/my-courses")}>
						My Better Grade
					</span>
					<div className="flex items-center gap-6">
						<div className="flex items-center bg-[#FBF2FB] py-2 px-3 gap-2 rounded-full border border-[#DCC8E055] w-96">
							<img
								src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/wQwYXX2xM2/ccrkzlm2_expires_30_days.png"} 
								className="w-[18px] h-6 object-fill"
								alt="search"
							/>
							<input
								type="text"
								placeholder="Search lessons..."
								className="text-gray-700 bg-transparent text-sm w-full outline-none"
							/>
						</div>
						
						{/* Notification Bell */}
						<button className="relative w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center border-0 text-lg">
							🔔
							<span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-[#E040A0] rounded-full border-2 border-white"></span>
						</button>

						<div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/profile")}>
							<span className="text-sm font-bold text-[#2E1A28]">{user ? user.name : "Alex Sterling"}</span>
							<img
								src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/wQwYXX2xM2/uc6jo6mt_expires_30_days.png"} 
								className="w-10 h-10 object-fill rounded-full"
								alt="avatar"
							/>
						</div>
					</div>
				</div>

				{/* Course Detail Content Layout */}
				<div className="flex flex-col flex-1 p-8 gap-8">
					
					{/* Progress Indicator at the Top */}
					<div className="flex items-center justify-between w-full">
						<div className="flex items-center gap-2 cursor-pointer" onClick={()=>navigate("/my-courses")}>
							<span className="text-[#7C52AA] text-xs font-bold tracking-[0.05em]" >
								← BACK TO COURSES
							</span>
						</div>
						{user?.role === 'student' && (
							<div className="flex items-center gap-3">
								<div className="w-64 bg-gray-100 h-2.5 rounded-full overflow-hidden">
									<div className="h-full bg-[#E040A0] rounded-full" style={{ width: `${progressVal}%` }}></div>
								</div>
								<span className="text-[#E040A0] text-sm font-bold">{progressVal}% COMPLETED</span>
							</div>
						)}
					</div>

					{/* Banner Section */}
					<div className="relative rounded-[32px] overflow-hidden shadow-lg h-72 bg-gradient-to-r from-purple-950 via-purple-900 to-indigo-950 flex items-center p-12 text-white">
						<div className="absolute right-0 top-0 w-[450px] h-full opacity-20 bg-cover bg-center"
							style={{
								backgroundImage: 'url(https://storage.googleapis.com/tagjs-prod.appspot.com/v1/wQwYXX2xM2/burfd4f8_expires_30_days.png)',
							}}
						/>
						<div className="flex flex-col items-start gap-4 z-10 max-w-[60%]">
							<span className="bg-[#E040A0] text-white text-[10px] font-black py-1 px-3 rounded-full uppercase tracking-wider">
								EXPERT TRACK
							</span>
							<h2 className="text-4xl font-extrabold tracking-tight">
								{course ? course.title : "Course Details"}
							</h2>
							<div className="flex items-center gap-4 text-xs text-gray-300">
								<span>👤 {course ? course.teacherName : "Teacher"}</span>
								<span>👥 {course ? course.totalStudent : 0} Enrolled</span>
							</div>
							<button className="flex items-center gap-2 bg-[#E040A0] hover:bg-[#c03080] py-3 px-6 rounded-full font-bold text-sm text-white shadow-md transition mt-2 border-0"
								onClick={() => alert("Enjoy this premium learning content.")}>
								<span>Learn Now</span>
								<span>▶</span>
							</button>
						</div>
					</div>

					{/* Bottom Curriculum and Sidebar grid */}
					<div className="grid grid-cols-[1.8fr_1fr] gap-10">
						
						{/* Left Column: Learning Materials */}
						<div className="flex flex-col gap-6">
							<div className="flex items-center justify-between border-b pb-4">
								<h3 className="text-[#2E1A28] text-2xl font-black">Learning Materials</h3>
								<div className="flex gap-2">
									<span className="bg-[#EEDCFF] text-[#7C52AA] text-xs font-bold py-1.5 px-3 rounded-full">
										{materials.length} Materials
									</span>
								</div>
							</div>

							<div className="flex flex-col gap-4">
								{materials.length === 0 ? (
									<div className="text-gray-400 text-sm py-8 text-center bg-white rounded-3xl border border-dashed border-[#DCC8E0]">
										No learning materials available for this course yet.
									</div>
								) : (
									materials.map((material) => (
										<div key={material.id} className="rounded-3xl border border-solid border-[#DCC8E055] bg-white p-6 shadow-[04px12px0rgba(0,0,0,0.02)] flex justify-between items-center">
											<div className="flex flex-col gap-1">
												<span className="text-[#2E1A28] text-base font-bold">{material.title}</span>
												<span className="text-gray-500 text-sm mt-1">{material.description || 'No description provided'}</span>
												<span className="text-xs bg-purple-50 text-[#7C52AA] font-bold px-2.5 py-0.5 rounded-full w-fit uppercase tracking-widest mt-2 block">
													{material.type}
												</span>
											</div>
											{material.content && (
												<a 
													href={material.content} 
													target="_blank" 
													rel="noopener noreferrer" 
													className="bg-[#EEDCFF] text-[#7C52AA] hover:bg-[#EEDCFF]/80 py-2.5 px-6 rounded-full font-bold text-sm transition"
												>
													Open Resource
												</a>
											)}
										</div>
									))
								)}
							</div>
						</div>

						{/* Right Column: Upcoming Tasks */}
						<div className="flex flex-col bg-[#FEF7FFCC] p-6 rounded-[32px] border border-solid border-[#DCC8E0] shadow-sm h-fit">
							<div className="flex items-center justify-between border-b pb-4 mb-6">
								<h3 className="text-[#2E1A28] text-lg font-black flex items-center gap-2">
									<span>📋</span>
									<span>Assignments</span>
								</h3>
								<span className="bg-[#FFE8E8] text-[#E53E3E] text-xs font-bold py-1 px-2.5 rounded-full">
									{assignments.length} Total
								</span>
							</div>

							<div className="flex flex-col gap-5 mb-8">
								{assignments.length === 0 ? (
									<div className="text-gray-400 text-xs py-4 text-center">
										No assignments for this course.
									</div>
								) : (
									assignments.map((assign) => (
										<div key={assign.id} className="flex flex-col border-l-4 border-[#7C52AA] pl-3 py-1 cursor-pointer hover:bg-purple-50/50 rounded-r-lg p-1"
											onClick={() => {
												if (user?.role === 'student') {
													navigate('/submit-assignment', { state: { assignmentId: assign.id, assignmentTitle: assign.title } });
												} else if (user?.role === 'teacher') {
													navigate('/assignments');
												}
											}}>
											<span className="text-[#7C52AA] text-[10px] font-bold">DUE: {new Date(assign.deadline).toLocaleString()}</span>
											<span className="text-[#2E1A28] text-sm font-bold">{assign.title}</span>
											<span className="text-gray-400 text-[10px] mt-0.5">{assign.description || 'No description'}</span>
										</div>
									))
								)}
							</div>

							<button className="flex items-center justify-center bg-[#E040A0] text-white py-3.5 w-full rounded-full border-0 font-bold text-sm shadow-[04px16px0rgba(224,64,160,0.15)] hover:bg-[#c03080] transition"
								onClick={() => navigate("/assignments")}>
								View All Assignments
							</button>
						</div>

					</div>
				</div>
			</div>
		</div>
	);
}
