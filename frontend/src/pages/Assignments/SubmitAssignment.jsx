import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../services/api";

export default function SubmitAssignment() {
	const navigate = useNavigate();
	const location = useLocation();
	const { user, logout } = useAuth();
	
	// Router state variables
	const initialAssignmentId = location.state?.assignmentId || '';
	const initialAssignmentTitle = location.state?.assignmentTitle || '';

	// Form states
	const [assignmentsList, setAssignmentsList] = useState([]);
	const [selectedAssignmentId, setSelectedAssignmentId] = useState(initialAssignmentId);
	const [note, setNote] = useState('');
	const [file, setFile] = useState(null);
	const [fileName, setFileName] = useState('');
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(false);

	// Load all active assignments to populate the dropdown
	useEffect(() => {
		api.get('/courses')
			.then(async (res) => {
				if (res.status === 'success' && res.data) {
					const coursesList = Array.isArray(res.data) ? res.data : (res.data.data || []);
					const assignmentsPromises = coursesList.map(c => 
						api.get(`/courses/${c.id}/assignments`)
							.then(resAss => resAss.status === 'success' ? resAss.data.map(a => ({ ...a, courseTitle: c.title })) : [])
							.catch(() => [])
					);
					const results = await Promise.all(assignmentsPromises);
					const allAssignments = results.flat();
					
					// Filter out assignments that are already graded or submitted
					// For simplicity, we keep them all but show due status
					setAssignmentsList(allAssignments);
					if (!selectedAssignmentId && allAssignments.length > 0) {
						setSelectedAssignmentId(allAssignments[0].id);
					}
				}
			})
			.catch(err => console.error("Failed to load assignments dropdown list:", err));
	}, [selectedAssignmentId]);

	// Handler Pengumpulan Tugas: Mengemas file ke FormData dan mengirim POST /assignments/:id/submit
	const handleSubmit = async (e) => {
		e.preventDefault();
		setError('');
		
		if (!selectedAssignmentId) {
			setError("Silakan pilih tugas yang ingin dikumpulkan.");
			return;
		}
		if (!file) {
			setError("Silakan unggah file jawaban Anda.");
			return;
		}

		setLoading(true);
		try {
			// Masukkan file ke FormData (multipart/form-data) untuk dikirim via api.js
			const formData = new FormData();
			formData.append('file', file);
			formData.append('note', note);

			const res = await api.post(`/assignments/${selectedAssignmentId}/submit`, formData);
			if (res.status === 'success') {
				alert("Tugas berhasil dikumpulkan!");
				navigate("/assignments");
			} else {
				setError(res.message || "Gagal mengumpulkan tugas.");
			}
		} catch (err) {
			setError(err.message || "Failed to submit assignment.");
		} finally {
			setLoading(false);
		}
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
			<div className="flex flex-col flex-1 min-h-screen">
				{/* Top Nav */}
				<div className="flex justify-between items-center bg-[#FEF7FFCC] py-3 px-8 border-b border-[#DCC8E033]">
					<div className="flex items-center bg-white py-2 px-3 gap-2 rounded-full border border-[#DCC8E055] w-96">
						<img
							src={"/assets/image_ccrkzlm2.png"} 
							className="w-[18px] h-6 object-contain"
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
							src={user?.avatarUrl || "/assets/default-avatar.png"} 
							className="w-10 h-10 object-cover rounded-full border border-gray-100"
							alt="avatar"
						/>
					</div>
				</div>

				{/* Actual Page SubmitAssignment Content */}
				<div className="flex flex-col flex-1 p-8 gap-8">
					<div className="flex items-center gap-2 cursor-pointer" onClick={()=>navigate("/assignments")}>
						<span className="text-[#7C52AA] text-xs font-bold tracking-[0.05em]" >
							{"← BACK TO ASSIGNMENTS"}
						</span>
					</div>

					<div className="flex flex-col items-start gap-2">
						<span className="text-[#2E1A28] text-4xl font-bold tracking-[-0.025em]" >
							{"Submit Assignment"}
						</span>
						<span className="text-[#604868] text-base" >
							{"Submit your course deliverables directly to your instructor for evaluation."}
						</span>
					</div>

					{error && (
						<div className="text-red-500 text-sm font-bold bg-red-50 border border-red-200 py-3.5 px-6 rounded-full w-[680px] text-center">
							{error}
						</div>
					)}

					<form onSubmit={handleSubmit} className="flex p-8 flex-col items-start rounded-[48px] border border-[#ECE2EC] bg-[#FEF7FF] shadow-[04px16px0rgba(224,64,160,0.15)] w-[680px] gap-6">
						<div className="flex flex-col gap-2 w-full">
							<label className="text-[#7C52AA] text-sm font-bold ml-1">Select Assignment</label>
							<select
								value={selectedAssignmentId}
								onChange={(e) => setSelectedAssignmentId(e.target.value)}
								className="text-[#2E1A28] bg-white text-base py-4 px-6 rounded-full border border-solid border-[#DCC8E0] w-full outline-none focus:border-[#E040A0] font-bold"
							>
								{assignmentsList.map(a => (
									<option key={a.id} value={a.id}>
										{a.courseTitle} — {a.title}
									</option>
								))}
							</select>
						</div>

						<div className="flex flex-col gap-2 w-full">
							<label className="text-[#7C52AA] text-sm font-bold ml-1">Upload Work File</label>
							<div className="flex items-center justify-between border border-dashed border-[#DCC8E0] bg-[#FBF2FB] rounded-3xl p-6 w-full cursor-pointer hover:bg-purple-50 transition relative">
								<div className="flex items-center gap-3">
									<img
										src="/Image (deadline icon).png"
										className="w-8 h-10 object-contain"
										alt="upload icon"
									/>
									<div>
										<div className="text-[#2E1A28] text-sm font-bold">
											{fileName ? fileName : "Drag & drop files here, or click to browse"}
										</div>
										<div className="text-gray-500 text-xs">Supports PDF, DOCX, JPG, PNG, or ZIP (Max 10MB)</div>
									</div>
								</div>
								<input
									type="file"
									className="absolute inset-0 opacity-0 cursor-pointer"
									onChange={(e) => {
										if (e.target.files && e.target.files[0]) {
											setFile(e.target.files[0]);
											setFileName(e.target.files[0].name);
										}
									}}
								/>
							</div>
						</div>

						<div className="flex flex-col gap-2 w-full">
							<label className="text-[#7C52AA] text-sm font-bold ml-1">Submission Notes (Optional)</label>
							<textarea
								placeholder="Add notes for your teacher..."
								rows={4}
								value={note}
								onChange={(e) => setNote(e.target.value)}
								className="text-[#2E1A28] bg-white text-base py-4 px-6 rounded-[24px] border border-solid border-[#DCC8E0] w-full outline-none focus:border-[#E040A0] resize-none"
							/>
						</div>

						<div className="flex justify-end gap-4 w-full mt-4">
							<button
								type="button"
								onClick={() => navigate("/assignments")}
								className="py-3 px-8 text-[#604868] font-bold hover:underline bg-transparent border-0 cursor-pointer"
							>
								Cancel
							</button>
							<button
								type="submit"
								disabled={loading}
								className="py-3 px-10 rounded-full bg-[#E040A0] text-white font-bold shadow-[04px16px0rgba(224,64,160,0.15)] hover:bg-[#c03080] transition disabled:opacity-50 border-0 cursor-pointer"
							>
								{loading ? "Uploading..." : "Submit Assignment"}
							</button>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
}
