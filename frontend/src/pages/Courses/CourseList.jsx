import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useCourses } from "../../context/CourseContext";
import { api } from "../../services/api";

export default function CourseList() {
	const navigate = useNavigate();
	const { user, logout } = useAuth();
	const { courses, fetchCourses, deleteCourse } = useCourses();
	const isTeacher = user?.role === 'teacher';

	// Category filter tabs
	const [activeTab, setActiveTab] = useState("All Courses");

	// Sort criteria
	const [sortBy, setSortBy] = useState("Recent Activity");
	const [search, setSearch] = useState('');
	const [studentProgress, setStudentProgress] = useState([]);

	// Load student progress if student
	useEffect(() => {
		if (user?.role === 'student') {
			api.get('/progress/me')
				.then(res => {
					if (res.status === 'success' && res.data) {
						setStudentProgress(res.data.perCourse || []);
					}
				})
				.catch(err => console.error('Failed to load student progress:', err));
		}
	}, [user]);

	// Fetch courses when tab/search changes
	useEffect(() => {
		const categoryFilter = activeTab === "All Courses" ? "" : activeTab;
		fetchCourses({ search, category: categoryFilter });
	}, [activeTab, search]);

	// Helper styling functions
	const getCourseColor = (category) => {
		switch (category?.toLowerCase()) {
			case 'design': return '#E040A0';
			case 'tech': return '#0096CC';
			case 'business': return '#7C52AA';
			default: return '#F080C0';
		}
	};

	const getCourseImage = (category) => {
		switch (category?.toLowerCase()) {
			case 'design': return "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=60";
			case 'tech': return "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=500&auto=format&fit=crop&q=60";
			case 'business': return "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500&auto=format&fit=crop&q=60";
			default: return "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=500&auto=format&fit=crop&q=60";
		}
	};

	// Map courses to merge database values with Figma visuals
	const mappedCourses = Array.isArray(courses) ? courses.map(c => {
		const progressObj = studentProgress.find(p => p.courseId === c.id);
		const progressVal = progressObj ? progressObj.progressPercentage : 0;

		return {
			id: c.id,
			title: c.title,
			description: c.description,
			category: c.category || 'General',
			lessons: 8, // mock visual count
			hours: 12, // mock visual count
			progress: progressVal,
			rating: 4.8,
			image: c.thumbnail_url || c.thumbnailUrl || getCourseImage(c.category),
			btnText: user?.role === 'student' ? 'Resume Learning' : 'Manage Course',
			color: getCourseColor(c.category)
		};
	}) : [];

	// Client-side sort logic
	const sortedCourses = [...mappedCourses].sort((a, b) => {
		if (sortBy === "Title A-Z") {
			return a.title.localeCompare(b.title);
		} else if (sortBy === "Progress") {
			return b.progress - a.progress;
		}
		return 0; // default order from API
	});

	return (
		<div className="flex flex-col md:flex-row bg-white min-h-screen font-sans antialiased text-gray-800">
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
					<div className="flex items-center bg-[#F080C0] py-3 px-4 rounded-[9999px] cursor-pointer w-full text-[#2E1A28] font-bold" onClick={() => navigate("/my-courses")}>
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

			{/* Main Content Area on the Right */}
			<div className="flex flex-col flex-1 min-h-screen">
				{/* Actual Page Courses Content */}
				<div className="flex flex-col flex-1 p-4 md:p-8 gap-8 max-w-[1200px] w-full mx-auto">

					{/* Beautiful Goal Status Banner */}
					<div className="bg-gradient-to-r from-[#7C52AA] via-[#9F52AA] to-[#E040A0] rounded-[40px] p-6 md:p-8 text-white flex flex-col sm:flex-row justify-between items-center shadow-lg relative overflow-hidden gap-6 text-center sm:text-left">
						<div className="flex flex-col items-center sm:items-start gap-3 z-10 max-w-full sm:max-w-[60%]">
							<span className="bg-white/20 text-[10px] font-black uppercase tracking-widest py-1 px-3 rounded-full">
								GOAL STATUS
							</span>
							<h2 className="text-3xl font-black tracking-tight leading-8">
								{"You're on fire, Alex!"}<br />
								{"78% of your weekly goal met."}
							</h2>
							<p className="text-white/80 text-sm mt-1 leading-relaxed">
								{"Complete 2 more modules in 'Visual Storytelling' to hit your target for this week. Keep the momentum going!"}
							</p>
							<button className="bg-white text-[#E040A0] hover:bg-gray-50 py-3 px-6 rounded-full font-bold text-sm border-0 transition mt-2 shadow-md"
								onClick={() => {
									const firstCourse = sortedCourses[0];
									if (firstCourse) navigate("/course-detail", { state: { courseId: firstCourse.id } });
									else navigate("/course-detail");
								}}>
								{"Continue Learning"}
							</button>
						</div>

						{/* Circular Progress Gauge */}
						<div className="relative flex items-center justify-center w-36 h-36 bg-white/10 rounded-full border border-white/20 z-10 mr-4 shadow-inner">
							<div className="text-center">
								<div className="text-2xl font-black">78%</div>
								<div className="text-[10px] uppercase font-bold text-white/80 tracking-wider">Progress</div>
								<div className="text-[8px] text-white/60 mt-1">24/30 Hours</div>
							</div>
						</div>
					</div>

					{/* Navigation / Filters Bar */}
					<div className="flex flex-col md:flex-row justify-between items-center w-full mt-4 gap-4">
						<div className="flex flex-wrap justify-center gap-2">
							{["All Courses", "Design", "Tech", "Business"].map((tab) => (
								<button
									key={tab}
									onClick={() => setActiveTab(tab)}
									className={`py-2 px-6 rounded-full font-bold text-sm transition border-0 ${activeTab === tab
											? "bg-[#E040A0] text-white shadow-md"
											: "bg-[#FBF2FB] text-[#604868] hover:bg-[#F2E8F2]"
										}`}
								>
									{tab}
								</button>
							))}
						</div>

						<div className="flex items-center gap-2">
							<span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Sort by:</span>
							<select
								value={sortBy}
								onChange={(e) => setSortBy(e.target.value)}
								className="bg-[#FBF2FB] text-[#604868] text-sm py-2 px-6 rounded-full border border-[#DCC8E033] outline-none cursor-pointer font-bold"
							>
								<option>Recent Activity</option>
								<option>Title A-Z</option>
								<option>Progress</option>
							</select>
						</div>
					</div>

					{/* Courses Grid */}
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
						{sortedCourses.map((course) => (
							<div key={course.id} className="group flex flex-col bg-white rounded-[32px] border border-solid border-[#DCC8E088] shadow-sm hover:shadow-md transition overflow-hidden relative">
								{/* Thumbnail Cover */}
								<div className="h-44 relative bg-gray-150">
									<img
										src={course.image}
										className="w-full h-full object-cover"
										alt={course.title}
									/>
									{/* Tags and badge overlays */}
									<span className="absolute top-4 left-4 bg-white/95 text-[#2E1A28] text-[10px] font-black uppercase tracking-widest py-1 px-3 rounded-full shadow-sm">
										{course.category}
									</span>
									<span className="absolute bottom-4 right-4 bg-white/95 text-yellow-600 text-xs font-black py-1 px-2.5 rounded-full shadow-sm flex items-center gap-1">
										★ {course.rating}
									</span>

									{/* Actions (Teacher only) */}
									{isTeacher && (
										<>
											{/* Edit Button */}
											<button
												className="absolute top-4 right-14 bg-blue-500/90 text-white w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-blue-600 transition-all shadow-md z-10"
												title="Edit Course"
												onClick={(e) => {
													e.stopPropagation();
													navigate("/add-course", { state: { editCourse: course } });
												}}
											>
												<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
											</button>
											{/* Delete Button */}
											<button
												className="absolute top-4 right-4 bg-red-500/90 text-white w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-600 transition-all shadow-md z-10"
												title="Delete Course"
												onClick={async (e) => {
													e.stopPropagation();
													if (window.confirm("Are you sure you want to delete this course?")) {
														try {
															await deleteCourse(course.id);
														} catch (err) {
															alert("Failed to delete course.");
														}
													}
												}}
											>
												✕
											</button>
										</>
									)}
								</div>

								{/* Info */}
								<div className="p-6 flex flex-col flex-1 gap-4">
									<div className="flex flex-col gap-1">
										<h3 className="text-[#2E1A28] text-base font-bold line-clamp-2 min-h-[48px]">
											{course.title}
										</h3>
										<span className="text-gray-400 text-xs mt-1 block">
											{`${course.lessons} Lessons • ${course.hours} Total Hours`}
										</span>
									</div>

									<div className="flex flex-col w-full gap-2 mt-2">
										<div className="flex justify-between items-center text-xs">
											<span className="text-[#604868] font-bold">Course Progress</span>
											<span className="font-extrabold" style={{ color: course.color }}>
												{`${course.progress}%`}
											</span>
										</div>
										<div className="w-full bg-[#ECE2EC] h-2 rounded-full overflow-hidden">
											<div className="h-full rounded-full"
												style={{
													width: `${course.progress}%`,
													backgroundColor: course.color
												}}>
											</div>
										</div>
									</div>

									<button className="flex justify-center bg-[#EEDCFF]/60 hover:bg-[#EEDCFF] py-3.5 w-full rounded-full text-[#7C52AA] font-bold text-sm border-0 transition mt-2"
										onClick={() => navigate("/course-detail", { state: { courseId: course.id } })}>
										{course.btnText}
									</button>
								</div>
							</div>
						))}

						{/* Dotted Placeholder card */}
						<div className="border-2 border-dashed border-[#DCC8E0] bg-[#FBF2FB]/50 rounded-[32px] p-8 text-center flex flex-col items-center justify-center gap-3 h-full min-h-[360px]">
							<div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-gray-400 text-xl shadow-sm">
								✨
							</div>
							<p className="text-gray-400 text-sm max-w-[200px]">
								Explore 500+ premium courses to expand your skill set.
							</p>
						</div>
					</div>
				</div>
			</div>

			{/* Floating plus button for teacher to add course */}
			{isTeacher && (
				<button
					onClick={() => navigate("/add-course")}
					className="fixed bottom-8 right-8 w-16 h-16 rounded-full bg-[#E040A0] text-white flex items-center justify-center text-3xl font-bold shadow-lg hover:bg-[#c03080] transition border-0 cursor-pointer z-50"
				>
					+
				</button>
			)}
		</div>
	)
}
