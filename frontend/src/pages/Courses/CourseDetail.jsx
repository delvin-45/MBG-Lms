import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../services/api";

export default function CourseDetail() {
	const navigate = useNavigate();
	const location = useLocation();
	const params = useParams();
	const { user, logout } = useAuth();

	// Support both location.state and URL params
	const courseId = location.state?.courseId || params?.courseId;

	const [course, setCourse] = useState(null);
	const [materials, setMaterials] = useState([]);
	const [assignments, setAssignments] = useState([]);
	const [progressVal, setProgressVal] = useState(0);
	const [loading, setLoading] = useState(true);
	const [openModules, setOpenModules] = useState({ 0: true });

	const getCourseImage = (category) => {
		switch (category?.toLowerCase()) {
			case 'design': return "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=60";
			case 'tech': return "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=500&auto=format&fit=crop&q=60";
			case 'business': return "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500&auto=format&fit=crop&q=60";
			default: return "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=500&auto=format&fit=crop&q=60";
		}
	};

	// Material Management States
	const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);
	const [editingMaterialId, setEditingMaterialId] = useState(null);
	const [matTitle, setMatTitle] = useState('');
	const [matType, setMatType] = useState('video');
	const [matDesc, setMatDesc] = useState('');
	const [matContent, setMatContent] = useState('');
	const [matFile, setMatFile] = useState(null);

	const openAddMaterial = () => {
		setEditingMaterialId(null);
		setMatTitle(''); setMatType('video'); setMatDesc(''); setMatContent(''); setMatFile(null);
		setIsMaterialModalOpen(true);
	};

	const openEditMaterial = (e, mat) => {
		e.stopPropagation();
		setEditingMaterialId(mat.id);
		setMatTitle(mat.title); setMatType(mat.type); setMatDesc(mat.description || ''); setMatContent(mat.content || ''); setMatFile(null);
		setIsMaterialModalOpen(true);
	};

	const handleSaveMaterial = async (e) => {
		e.preventDefault();
		if (!matTitle || !matType) return alert('Title and Type are required');
		try {
			const formData = new FormData();
			formData.append('title', matTitle);
			formData.append('type', matType);
			if (matDesc) formData.append('description', matDesc);
			if (matFile) {
				formData.append('materialFile', matFile);
			} else if (matContent) {
				formData.append('content', matContent);
			}

			if (editingMaterialId) {
				const res = await api.put(`/materials/${editingMaterialId}`, formData);
				if (res.status === 'success') {
					setMaterials(prev => prev.map(m => m.id === editingMaterialId ? { ...m, ...res.data } : m));
				}
			} else {
				const res = await api.post(`/courses/${courseId}/materials`, formData);
				if (res.status === 'success' || res.status === 201) {
					const matList = await api.get(`/courses/${courseId}/materials`);
					if (matList.status === 'success') {
						setMaterials(Array.isArray(matList.data) ? matList.data : []);
					}
				}
			}
			setIsMaterialModalOpen(false);
		} catch (err) {
			alert('Failed to save material');
		}
	};

	const handleDeleteMaterial = async (e, id) => {
		e.stopPropagation();
		if (!window.confirm("Are you sure you want to delete this material?")) return;
		try {
			await api.delete(`/materials/${id}`);
			setMaterials(prev => prev.filter(m => m.id !== id));
		} catch (err) {
			alert('Failed to delete material');
		}
	};

	// Load course info, materials, and assignments
	useEffect(() => {
		if (!courseId) {
			setLoading(false);
			return;
		}
		setLoading(true);

		const loadData = async () => {
			try {
				// Load course info
				const courseRes = await api.get(`/courses/${courseId}`);
				console.log('COURSE RES:', courseRes);
				if (courseRes.status === 'success') setCourse(courseRes.data);
			} catch (err) { console.error('Failed to load course:', err); }

			try {
				// Load materials
				const materialsRes = await api.get(`/courses/${courseId}/materials`);
				console.log('MATERIALS RES:', materialsRes);
				if (materialsRes.status === 'success') {
					const matList = Array.isArray(materialsRes.data) ? materialsRes.data : [];
					console.log('MAT LIST TO SET:', matList);
					setMaterials(matList);
				}
			} catch (err) { console.error('Failed to load materials:', err); }

			try {
				// Load assignments
				const assignmentsRes = await api.get(`/courses/${courseId}/assignments`);
				console.log('ASSIGNMENTS RES:', assignmentsRes);
				if (assignmentsRes.status === 'success') {
					setAssignments(Array.isArray(assignmentsRes.data) ? assignmentsRes.data : []);
				}
			} catch (err) { console.error('Failed to load assignments:', err); }

			setLoading(false);
		};

		loadData();
	}, [courseId]);

	// Fetch student's progress for this course
	useEffect(() => {
		if (user?.role === 'student' && courseId) {
			api.get('/progress/me')
				.then(res => {
					if (res.status === 'success' && res.data) {
						const progressObj = (res.data.perCourse || []).find(p => String(p.courseId) === String(courseId));
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
		<div className="flex flex-col md:flex-row bg-white min-h-screen font-sans">
			{/* Left Sidebar */}
			<div className="flex flex-col shrink-0 items-center bg-[#FBF2FB] py-6 w-full md:w-64 border-b md:border-b-0 md:border-r border-[#DCC8E033] min-h-0 md:min-h-screen">
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
					<div className="flex items-center bg-[#E040A0] py-3 px-4 cursor-pointer w-[calc(100%-1.5rem)] mx-3 rounded-full text-[#2E1A28] font-bold" onClick={() => navigate("/my-courses")}>
						<img
							src={"/Image (courses)_margin.png"}
							className="w-5 h-5 mr-3.5 object-contain shrink-0"
							alt="courses"
						/>
						<span className="text-sm" >
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

			{/* Main Content Area */}
			<div className="flex flex-col flex-1 min-h-screen w-full">
				{/* Course Detail Content Layout */}
				<div className="flex flex-col flex-1 p-4 md:p-8 gap-8 w-full max-w-[1200px] mx-auto">

					{/* Progress Indicator at the Top */}
					<div className="flex items-center justify-between w-full">
						<div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/my-courses")}>
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
					<div className="relative rounded-[32px] md:rounded-[40px] overflow-hidden min-h-[300px] md:h-[340px] flex items-end p-6 md:p-12 text-white"
						style={{
							backgroundColor: "#5a1f34"
						}}>
						<div className="absolute inset-0 bg-cover bg-center"
							style={{
								backgroundImage: `url(${JSON.parse(localStorage.getItem('mbg_thumbnails') || '{}')[courseId] || course?.thumbnail_url || course?.thumbnailUrl || getCourseImage(course?.category) || '/assets/image_burfd4f8.png'})`,
							}}
						/>
						<div className="absolute inset-0 bg-gradient-to-t from-[#2a0815]/90 via-[#4a1d2d]/40 to-transparent"></div>

						<div className="flex flex-col md:flex-row justify-between items-start md:items-end w-full z-10 gap-6">
							<div className="flex flex-col items-start gap-3 max-w-full md:max-w-[60%]">
								<span className="bg-[#E040A0] text-white text-[10px] font-black py-1.5 px-4 rounded-full uppercase tracking-wider">
									EXPERT TRACK
								</span>
								<h2 className="text-3xl md:text-[42px] font-extrabold tracking-tight leading-tight">
									{course ? course.title : "UI/UX Design Systems"}
								</h2>
								<div className="flex items-center gap-6 text-sm font-semibold text-gray-200">
									<span className="flex items-center gap-2">
										<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
										{course ? course.teacherName : "Prof. Elena Vance"}
									</span>
									<span className="flex items-center gap-2">
										<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
										{course ? course.totalStudent : "1,248"} Enrolled
									</span>
								</div>
							</div>
							<button className="flex items-center gap-2 bg-[#E040A0] hover:bg-[#c03080] py-3.5 px-6 rounded-full font-bold text-sm text-white shadow-[0px_4px_16px_rgba(224,64,160,0.4)] transition border-0 cursor-pointer"
								onClick={() => alert("Enjoy this premium learning content.")}>
								<span>Continue Learning</span>
								<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
							</button>
						</div>
					</div>

					{/* Bottom Curriculum and Sidebar grid */}
					<div className="flex flex-col lg:grid lg:grid-cols-[1.8fr_1fr] gap-8 lg:gap-10">

						{/* Left Column: Learning Materials */}
						<div className="flex flex-col gap-6">
							<div className="flex items-center justify-between pb-2">
								<h3 className="text-[#2E1A28] text-2xl font-extrabold tracking-tight">Curriculum</h3>
								<div className="flex gap-3">
									<span className="bg-[#F3E8FF] text-[#7C52AA] text-[10px] font-bold py-1.5 px-3 rounded-full uppercase tracking-wider">
										{materials.length} Modules
									</span>
									{user?.role === 'teacher' && (
										<button onClick={openAddMaterial} className="bg-[#E040A0] text-white text-[10px] font-bold py-1.5 px-4 rounded-full uppercase tracking-wider hover:bg-[#c03080] transition shadow-sm">
											+ Add Material
										</button>
									)}
								</div>
							</div>

							<div className="flex flex-col gap-4">
								{materials.length === 0 ? (
									<div className="text-gray-400 text-sm py-8 text-center bg-white rounded-3xl border border-dashed border-[#DCC8E0]">
										No learning materials available for this course yet.
									</div>
								) : (
									materials.map((material, index) => {
										const isOpen = openModules[index];
										const toggleModule = () => {
											setOpenModules(prev => ({ ...prev, [index]: !prev[index] }));
										};

										return (
											<div key={material.id} className="flex flex-col rounded-[24px] border border-solid border-[#DCC8E088] bg-white p-6 shadow-sm hover:border-[#E040A0] transition">
												<div className="flex items-center justify-between cursor-pointer" onClick={toggleModule}>
													<div className="flex items-center gap-4">
														<div className={`w-10 h-10 rounded-full flex items-center justify-center ${index % 2 === 0 ? 'bg-[#FFE5F1] text-[#E040A0]' : 'bg-[#F4F0FF] text-[#7C52AA]'}`}>
															<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
														</div>
														<div className="flex flex-col gap-0.5">
															<span className="text-[#2E1A28] text-sm font-extrabold">{material.title}</span>
															<span className="text-gray-500 text-xs font-semibold">{material.type} • {material.description || '2h 30m'}</span>
														</div>
													</div>
													<div className="flex items-center gap-3">
														{user?.role === 'teacher' && (
															<div className="flex gap-2">
																<button onClick={(e) => openEditMaterial(e, material)} className="text-blue-500 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 p-1.5 rounded-full transition" title="Edit Material">
																	<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
																</button>
																<button onClick={(e) => handleDeleteMaterial(e, material.id)} className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-1.5 rounded-full transition" title="Delete Material">
																	<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
																</button>
															</div>
														)}
														<svg className={`w-5 h-5 text-gray-400 transform transition ${isOpen ? '' : 'rotate-180'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"></path></svg>
													</div>
												</div>

												{isOpen && (
													<div className="mt-6 flex flex-col gap-3 border-t border-gray-100 pt-5">
														<div className="flex justify-between items-center bg-[#FFF0F7] px-5 py-3.5 rounded-xl border border-[#E040A0] shadow-sm cursor-pointer" onClick={() => window.open(material.content, '_blank')}>
															<div className="flex items-center gap-4">
																<div className="w-[18px] h-[18px] border-2 border-[#E040A0] rounded-full flex items-center justify-center text-[#E040A0] text-[8px] pl-[1px]">▶</div>
																<span className="text-[13px] text-[#E040A0] font-bold">Open This Resource</span>
															</div>
															<span className="text-[11px] font-bold text-[#E040A0] bg-[#FCE6F3] px-2 py-0.5 rounded-full">In Progress</span>
														</div>
													</div>
												)}
											</div>
										);
									})
								)}
							</div>
						</div>

						{/* Right Column: Upcoming Tasks */}
						<div className="flex flex-col bg-[#FBF2FB] p-7 rounded-[32px] border border-solid border-[#DCC8E0] h-fit shadow-sm">
							<div className="flex items-center justify-between pb-2 mb-6">
								<h3 className="text-[#7C52AA] text-lg font-extrabold flex items-center gap-2">
									<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
									<span>Assignments</span>
								</h3>
								<span className="bg-[#EEDCFF] text-[#7C52AA] text-[10px] font-bold py-1 px-3 rounded-full uppercase tracking-wider">
									{assignments.length} Due
								</span>
							</div>

							<div className="flex flex-col gap-4 mb-8">
								{assignments.length === 0 ? (
									<div className="text-gray-400 text-xs py-4 text-center">
										No assignments for this course.
									</div>
								) : (
									assignments.map((assign, index) => {
										const colors = [
											{ bg: "bg-[#E040A0]", text: "text-[#E040A0]" },
											{ bg: "bg-[#00D4FF]", text: "text-[#00D4FF]" },
											{ bg: "bg-[#7C52AA]", text: "text-[#7C52AA]" }
										];
										const color = colors[index % colors.length];
										return (
											<div key={assign.id} className="flex flex-col bg-white p-5 rounded-[24px] border border-solid border-[#DCC8E088] shadow-sm relative overflow-hidden cursor-pointer hover:shadow-md transition"
												onClick={() => {
													if (user?.role === 'student') navigate('/submit-assignment', { state: { assignmentId: assign.id, assignmentTitle: assign.title } });
													else navigate('/assignments');
												}}>
												<div className={`absolute left-0 top-0 bottom-0 w-1.5 ${color.bg}`}></div>
												<div className="flex justify-between items-center mb-1.5">
													<span className={`${color.text} text-[9px] font-black uppercase tracking-[0.2em]`}>TASK {index + 1}</span>
													<span className="text-gray-400 text-[10px] font-bold">{new Date(assign.deadline).toLocaleDateString()}</span>
												</div>
												<span className="text-[#2E1A28] text-sm font-extrabold mb-1 truncate leading-tight">{assign.title}</span>
												<span className="text-gray-400 text-[11px] font-medium truncate">{assign.description || 'Module Assessment'}</span>
											</div>
										);
									})
								)}
							</div>

							<button className="flex items-center justify-center bg-transparent border-2 border-solid border-[#EEDCFF] text-[#7C52AA] py-3.5 w-full  font-bold text-[13px] hover:bg-[#EEDCFF]/50 transition"
								onClick={() => navigate("/assignments")}>
								View All Deadlines
							</button>
						</div>
					</div>
				</div>
			</div>

			{/* Material Modal */}
			{isMaterialModalOpen && (
				<div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
					<div className="bg-white rounded-[32px] w-full max-w-[600px] p-8 shadow-2xl relative">
						<button 
							type="button"
							onClick={() => setIsMaterialModalOpen(false)}
							className="absolute top-6 right-6 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition"
						>
							✕
						</button>
						<h2 className="text-2xl font-black text-[#2E1A28] mb-6">{editingMaterialId ? 'Edit Material' : 'Add New Material'}</h2>
						
						<form onSubmit={handleSaveMaterial} className="flex flex-col gap-4">
							<div className="flex flex-col gap-1">
								<label className="text-xs font-bold text-[#604868] uppercase">Title</label>
								<input type="text" required value={matTitle} onChange={e => setMatTitle(e.target.value)} className="bg-[#FBF2FB] px-4 py-3 rounded-xl outline-none focus:border-[#E040A0] border border-transparent" placeholder="Material Title" />
							</div>

							<div className="flex gap-4">
								<div className="flex flex-col gap-1 flex-1">
									<label className="text-xs font-bold text-[#604868] uppercase">Type</label>
									<select value={matType} onChange={e => setMatType(e.target.value)} className="bg-[#FBF2FB] px-4 py-3 rounded-xl outline-none focus:border-[#E040A0] border border-transparent cursor-pointer">
										<option value="video">Video</option>
										<option value="document">Document / PDF</option>
										<option value="quiz">Quiz</option>
										<option value="link">Link</option>
									</select>
								</div>
							</div>

							<div className="flex flex-col gap-1">
								<label className="text-xs font-bold text-[#604868] uppercase">Content or File</label>
								<div className="flex flex-col gap-2">
									<input type="text" value={matContent} onChange={e => setMatContent(e.target.value)} disabled={!!matFile} placeholder="URL or Text Content" className={`bg-[#FBF2FB] px-4 py-3 rounded-xl outline-none focus:border-[#E040A0] border border-transparent ${matFile ? 'opacity-50' : ''}`} />
									<div className="text-center text-xs text-gray-400 font-bold">OR</div>
									<div className="relative border-2 border-dashed border-[#E040A055] bg-[#FFF0F7] rounded-xl p-4 text-center hover:bg-[#FCE6F3] transition cursor-pointer">
										<input type="file" onChange={e => { if(e.target.files[0]) { setMatFile(e.target.files[0]); setMatContent(''); } }} className="absolute inset-0 opacity-0 cursor-pointer" />
										<span className="text-[#E040A0] font-bold">{matFile ? matFile.name : 'Upload File (PDF/Doc/MP4)'}</span>
									</div>
									{matFile && (
										<button type="button" onClick={() => setMatFile(null)} className="text-red-500 text-xs font-bold self-start bg-red-50 px-2 py-1 rounded">Remove File</button>
									)}
								</div>
							</div>

							<div className="flex flex-col gap-1">
								<label className="text-xs font-bold text-[#604868] uppercase">Short Description (Optional)</label>
								<input type="text" value={matDesc} onChange={e => setMatDesc(e.target.value)} className="bg-[#FBF2FB] px-4 py-3 rounded-xl outline-none focus:border-[#E040A0] border border-transparent" placeholder="E.g. 2h 30m" />
							</div>

							<button type="submit" className="mt-4 bg-[#E040A0] hover:bg-[#c03080] text-white font-bold py-3.5 rounded-full transition shadow-md">
								{editingMaterialId ? 'Save Changes' : 'Add Material'}
							</button>
						</form>
					</div>
				</div>
			)}
		</div>
	);
}
