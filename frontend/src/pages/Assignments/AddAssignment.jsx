import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../services/api";

export default function AddAssignment() {
	const navigate = useNavigate();
	const location = useLocation();
	const { user } = useAuth();
	
	const editAssignment = location.state?.editAssignment;

	// Form states
	const [coursesList, setCoursesList] = useState([]);
	const [selectedCourseId, setSelectedCourseId] = useState('');
	const [title, setTitle] = useState('');
	const [dueDate, setDueDate] = useState('');
	const [points, setPoints] = useState(100);
	const [description, setDescription] = useState('');
	const [error, setError] = useState('');

	useEffect(() => {
		api.get('/courses')
			.then(res => {
				if (res.status === 'success' && res.data) {
					const list = Array.isArray(res.data) ? res.data : (res.data.data || []);
					const teacherCourses = list.filter(c => c.teacherId === user?.id || user?.role === 'admin');
					setCoursesList(teacherCourses);
					if (teacherCourses.length > 0 && !editAssignment) {
						setSelectedCourseId(teacherCourses[0].id);
					}
				}
			})
			.catch(err => console.error("Failed to load teacher's courses:", err));
	}, [user, editAssignment]);

	useEffect(() => {
		if (editAssignment) {
			setTitle(editAssignment.title || '');
			setDescription(editAssignment.description || '');
			setPoints(editAssignment.maxScore || 100);
			setSelectedCourseId(editAssignment.courseId || '');
			if (editAssignment.deadline) {
				const d = new Date(editAssignment.deadline);
				const tzoffset = (new Date()).getTimezoneOffset() * 60000;
				const localISOTime = (new Date(d - tzoffset)).toISOString().slice(0, 16);
				setDueDate(localISOTime);
			}
		}
	}, [editAssignment]);

	const handlePublish = async (e) => {
		e.preventDefault();
		setError('');
		if (!title) {
			setError("Please enter an assignment title.");
			return;
		}
		if (!selectedCourseId) {
			setError("Please select an associated course.");
			return;
		}
		if (!dueDate) {
			setError("Please select a due date.");
			return;
		}

		try {
			// Convert local datetime input (YYYY-MM-DDTHH:mm) to ISO format
			const deadlineISO = new Date(dueDate).toISOString();
			
			let res;
			if (editAssignment) {
				res = await api.put(`/assignments/${editAssignment.id}`, {
					title,
					description,
					deadline: deadlineISO,
					maxScore: points
				});
			} else {
				res = await api.post(`/courses/${selectedCourseId}/assignments`, {
					title,
					description,
					deadline: deadlineISO,
					maxScore: points
				});
			}

			if (res.status === 'success') {
				alert(`Assignment "${title}" ${editAssignment ? 'updated' : 'published'} successfully!`);
				navigate("/assignments");
			} else {
				setError(res.message || `Failed to ${editAssignment ? 'update' : 'publish'} assignment`);
			}
		} catch (err) {
			setError(err.message || `Failed to ${editAssignment ? 'update' : 'publish'} assignment`);
		}
	};

	const getSelectedCourseTitle = () => {
		const c = coursesList.find(item => String(item.id) === String(selectedCourseId));
		return c ? c.title : 'No Course Selected';
	};

	return (
		<div className="flex items-center justify-center min-h-screen bg-[#E5DFE9] p-8 font-sans">
			{/* Centered White Card Modal */}
			<div className="w-[1024px] bg-white rounded-[40px] shadow-2xl overflow-hidden p-10 flex flex-col gap-8 relative border border-[#DCC8E088]">
				
				{/* Header */}
				<div className="flex items-center justify-between pb-2 border-b border-gray-100">
					<div className="flex items-center gap-4">
						{/* Back Button */}
						<button 
							type="button"
							onClick={() => navigate("/assignments")}
							className="flex items-center justify-center w-10 h-10 rounded-full bg-[#E040A015] hover:bg-[#E040A025] transition border-0 text-[#E040A0] text-xl font-bold cursor-pointer"
						>
							←
						</button>
						<div className="flex flex-col">
							<h1 className="text-[#E040A0] text-2xl font-black leading-7">
								{editAssignment ? 'Edit Assignment' : 'Create New Assignment'}
							</h1>
							<p className="text-gray-400 text-xs mt-0.5">
								{editAssignment ? 'Modify your existing class task' : 'Design and publish your class tasks & quizzes'}
							</p>
						</div>
					</div>

					{/* Close Button */}
					<button 
						type="button"
						onClick={() => navigate("/assignments")}
						className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 transition text-gray-500 font-bold border-0 text-sm cursor-pointer"
					>
						✕
					</button>
				</div>

				{error && (
					<div className="text-red-500 text-sm font-bold bg-red-50 border border-red-200 py-3.5 px-6 rounded-full w-full text-center">
						{error}
					</div>
				)}

				{/* Two-Column Content */}
				<div className="grid grid-cols-[1.8fr_1fr] gap-10">
					
					{/* Left Column: Form Fields */}
					<form onSubmit={handlePublish} className="flex flex-col gap-6">
						{/* Assignment Title */}
						<div className="flex flex-col gap-2">
							<label className="text-[#604868] text-xs font-bold uppercase tracking-wider ml-1">Assignment Title</label>
							<input
								type="text"
								placeholder="e.g. Typography Hierarchy Quiz"
								value={title}
								onChange={(e) => setTitle(e.target.value)}
								className="text-gray-800 bg-[#FBF2FB] text-base py-4 px-6 rounded-full border border-transparent w-full outline-none focus:border-[#E040A0] transition"
							/>
						</div>

						{/* Selected Course */}
						<div className="flex flex-col gap-2">
							<label className="text-[#604868] text-xs font-bold uppercase tracking-wider ml-1">Associated Course</label>
							<select
								value={selectedCourseId}
								onChange={(e) => setSelectedCourseId(e.target.value)}
								disabled={!!editAssignment}
								className={`text-gray-800 bg-[#FBF2FB] text-base py-4 px-6 rounded-full border border-transparent w-full outline-none focus:border-[#E040A0] transition font-bold ${editAssignment ? 'opacity-70 cursor-not-allowed' : 'appearance-none cursor-pointer'}`}
							>
								{coursesList.map((course) => (
									<option key={course.id} value={course.id}>
										{course.title}
									</option>
								))}
							</select>
						</div>

						{/* Due Date & Max Score */}
						<div className="grid grid-cols-2 gap-6">
							<div className="flex flex-col gap-2">
								<label className="text-[#604868] text-xs font-bold uppercase tracking-wider ml-1">Due Date & Time</label>
								<div className="flex items-center bg-[#FBF2FB] py-3.5 px-6 rounded-full w-full">
									<input
										type="datetime-local"
										value={dueDate}
										onChange={(e) => setDueDate(e.target.value)}
										className="bg-transparent text-gray-800 text-base outline-none w-full border-0 cursor-pointer font-bold"
									/>
								</div>
							</div>
							<div className="flex flex-col gap-2">
								<label className="text-[#604868] text-xs font-bold uppercase tracking-wider ml-1">Max Score (Points)</label>
								<div className="flex items-center justify-between bg-[#FBF2FB] py-3.5 px-6 rounded-full w-full">
									<input
										type="text"
										value={`${points} Points`}
										readOnly
										className="bg-transparent text-gray-800 text-base outline-none w-full border-0"
									/>
									<div className="flex items-center gap-2">
										<button 
											type="button" 
											onClick={() => setPoints(prev => Math.max(10, prev - 10))}
											className="w-6 h-6 flex items-center justify-center rounded-full bg-white hover:bg-gray-100 text-gray-600 font-bold border-0 cursor-pointer"
										>
											-
										</button>
										<button 
											type="button"
											onClick={() => setPoints(prev => prev + 10)}
											className="w-6 h-6 flex items-center justify-center rounded-full bg-white hover:bg-gray-100 text-gray-600 font-bold border-0 cursor-pointer"
										>
											+
										</button>
									</div>
								</div>
							</div>
						</div>

						{/* Description */}
						<div className="flex flex-col gap-2">
							<label className="text-[#604868] text-xs font-bold uppercase tracking-wider ml-1">Submission instructions</label>
							<div className="rounded-[24px] border border-solid border-[#DCC8E055] overflow-hidden bg-white">
								{/* Toolbar */}
								<div className="flex gap-4 p-3 bg-[#FBF2FB] border-b border-[#DCC8E022] text-gray-500 font-serif text-sm">
									<span className="font-bold cursor-pointer hover:text-black">B</span>
									<span className="italic cursor-pointer hover:text-black">I</span>
									<span className="cursor-pointer hover:text-black">List</span>
								</div>
								<textarea
									placeholder="Describe the assignment rules and criteria..."
									rows={4}
									value={description}
									onChange={(e) => setDescription(e.target.value)}
									className="text-gray-800 text-base py-4 px-6 w-full outline-none resize-none border-0"
								/>
							</div>
						</div>
					</form>

					{/* Right Column: Card Preview */}
					<div className="flex flex-col gap-4">
						<span className="text-[#604868] text-xs font-bold uppercase tracking-wider ml-1">Card Preview</span>
						
						{/* Assignment Card Preview Box */}
						<div className="bg-[#FEF7FFCC] p-6 rounded-[32px] border border-solid border-[#DCC8E0] shadow-md flex flex-col gap-6">
							{/* Live Card Info */}
							<div className="flex flex-col items-start w-full">
								<span className="text-[#E040A0] text-xs font-bold uppercase tracking-widest block mb-1">
									{getSelectedCourseTitle()}
								</span>
								<h3 className="text-[#2E1A28] text-base font-bold truncate w-full">
									{title || "Untitled Assignment"}
								</h3>
								<span className="text-gray-400 text-xs block mt-1">
									Max Score: {points} Points
								</span>
							</div>

							<div className="flex gap-3 bg-[#FFE8E8] text-[#E53E3E] rounded-2xl p-4 font-bold border border-solid border-[#E53E3E33]">
								<div>
									<div className="text-[10px] uppercase">DUE DATE</div>
									<div className="text-sm">{dueDate ? new Date(dueDate).toLocaleString() : 'No Due Date Set'}</div>
								</div>
							</div>

							{/* Preview Action Button */}
							<button className="flex justify-center bg-transparent py-3 w-full rounded-full border-2 border-solid border-[#E040A0] text-[#E040A0] font-bold text-sm border-0">
								Submit Now
							</button>
						</div>
					</div>
				</div>

				{/* Footer Action Buttons */}
				<div className="flex justify-end items-center gap-4 pt-6 border-t border-gray-100 mt-2">
					<button
						type="button"
						onClick={() => navigate("/assignments")}
						className="py-3 px-8 rounded-full bg-[#ECE2EC] hover:bg-[#dcd0dc] text-[#604868] font-bold text-base border-0 transition cursor-pointer"
					>
						Cancel
					</button>
					<button
						type="button"
						onClick={handlePublish}
						className="flex items-center gap-2 py-3 px-10 rounded-full bg-[#E040A0] hover:bg-[#c03080] text-white font-bold text-base shadow-[04px16px0rgba(224,64,160,0.15)] border-0 transition cursor-pointer"
					>
						<span>🚀</span>
						<span>{editAssignment ? 'Update Assignment' : 'Publish Assignment'}</span>
					</button>
				</div>
			</div>
		</div>
	);
}
