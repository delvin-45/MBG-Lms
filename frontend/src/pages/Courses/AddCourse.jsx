import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useCourses } from "../../context/CourseContext";

export default function AddCourse() {
	const navigate = useNavigate();
	const { user } = useAuth();
	const { addCourse } = useCourses();

	// Form states
	const [title, setTitle] = useState('');
	const [category, setCategory] = useState('Design');
	const [tags, setTags] = useState('');
	const [modules, setModules] = useState(12);
	const [duration, setDuration] = useState('48h Total');
	const [description, setDescription] = useState('');
	const [thumbnail, setThumbnail] = useState(null);

	const handlePublish = async (e) => {
		e.preventDefault();
		if (!title) {
			alert("Please enter a course title.");
			return;
		}
		try {
			await addCourse({
				title,
				description,
				category
			});
			alert("Course published successfully!");
			navigate("/my-courses");
		} catch (err) {
			alert(err.message || "Failed to publish course");
		}
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
							onClick={() => navigate("/my-courses")}
							className="flex items-center justify-center w-10 h-10 rounded-full bg-[#E040A015] hover:bg-[#E040A025] transition border-0 text-[#E040A0] text-xl font-bold"
						>
							←
						</button>
						<div className="flex flex-col">
							<h1 className="text-[#E040A0] text-2xl font-black leading-7">
								Create New Course
							</h1>
							<p className="text-gray-400 text-xs mt-0.5">
								Design and publish your learning experience
							</p>
						</div>
					</div>

					{/* Close Button */}
					<button 
						type="button"
						onClick={() => navigate("/my-courses")}
						className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 transition text-gray-500 font-bold border-0 text-sm"
					>
						✕
					</button>
				</div>

				{/* Two-Column Content */}
				<div className="grid grid-cols-[1.8fr_1fr] gap-10">
					
					{/* Left Column: Form Fields */}
					<form onSubmit={handlePublish} className="flex flex-col gap-6">
						{/* Course Title */}
						<div className="flex flex-col gap-2">
							<label className="text-[#604868] text-xs font-bold uppercase tracking-wider ml-1">Course Title</label>
							<input
								type="text"
								placeholder="e.g. Advanced UI Design Systems"
								value={title}
								onChange={(e) => setTitle(e.target.value)}
								className="text-gray-800 bg-[#FBF2FB] text-base py-4 px-6 rounded-full border border-transparent w-full outline-none focus:border-[#E040A0] transition"
							/>
						</div>

						{/* Category & Tags */}
						<div className="grid grid-cols-2 gap-6">
							<div className="flex flex-col gap-2">
								<label className="text-[#604868] text-xs font-bold uppercase tracking-wider ml-1">Category</label>
								<select
									value={category}
									onChange={(e) => setCategory(e.target.value)}
									className="text-gray-800 bg-[#FBF2FB] text-base py-4 px-6 rounded-full border border-transparent w-full outline-none focus:border-[#E040A0] transition appearance-none cursor-pointer"
								>
									<option value="Design">Design</option>
									<option value="Tech">Tech</option>
									<option value="Business">Business</option>
									<option value="Marketing">Marketing</option>
								</select>
							</div>
							<div className="flex flex-col gap-2">
								<label className="text-[#604868] text-xs font-bold uppercase tracking-wider ml-1">Tags</label>
								<input
									type="text"
									placeholder="Add tags..."
									value={tags}
									onChange={(e) => setTags(e.target.value)}
									className="text-gray-800 bg-[#FBF2FB] text-base py-4 px-6 rounded-full border border-transparent w-full outline-none focus:border-[#E040A0] transition"
								/>
							</div>
						</div>

						{/* Total Modules & Total Duration */}
						<div className="grid grid-cols-2 gap-6">
							<div className="flex flex-col gap-2">
								<label className="text-[#604868] text-xs font-bold uppercase tracking-wider ml-1">Total Modules</label>
								<div className="flex items-center justify-between bg-[#FBF2FB] py-3.5 px-6 rounded-full w-full">
									<input
										type="text"
										value={`${modules} Modules`}
										readOnly
										className="bg-transparent text-gray-800 text-base outline-none w-full"
									/>
									<div className="flex items-center gap-2">
										<button 
											type="button" 
											onClick={() => setModules(prev => Math.max(1, prev - 1))}
											className="w-6 h-6 flex items-center justify-center rounded-full bg-white hover:bg-gray-100 text-gray-600 font-bold border-0"
										>
											-
										</button>
										<button 
											type="button"
											onClick={() => setModules(prev => prev + 1)}
											className="w-6 h-6 flex items-center justify-center rounded-full bg-white hover:bg-gray-100 text-gray-600 font-bold border-0"
										>
											+
										</button>
									</div>
								</div>
							</div>
							<div className="flex flex-col gap-2">
								<label className="text-[#604868] text-xs font-bold uppercase tracking-wider ml-1">Total Duration</label>
								<div className="flex items-center bg-[#FBF2FB] py-3.5 px-6 rounded-full w-full">
									<input
										type="text"
										placeholder="e.g. 48h Total"
										value={duration}
										onChange={(e) => setDuration(e.target.value)}
										className="bg-transparent text-gray-800 text-base outline-none w-full"
									/>
									<span className="text-gray-400 text-lg">🕒</span>
								</div>
							</div>
						</div>

						{/* Description */}
						<div className="flex flex-col gap-2">
							<label className="text-[#604868] text-xs font-bold uppercase tracking-wider ml-1">Description</label>
							<div className="rounded-[24px] border border-solid border-[#DCC8E055] overflow-hidden bg-white">
								{/* Simple Toolbar */}
								<div className="flex gap-4 p-3 bg-[#FBF2FB] border-b border-[#DCC8E022] text-gray-500 font-serif text-sm">
									<span className="font-bold cursor-pointer hover:text-black">B</span>
									<span className="italic cursor-pointer hover:text-black">I</span>
									<span className="cursor-pointer hover:text-black">List</span>
								</div>
								<textarea
									placeholder="Describe what students will learn..."
									rows={4}
									value={description}
									onChange={(e) => setDescription(e.target.value)}
									className="text-gray-800 text-base py-4 px-6 w-full outline-none resize-none border-0"
								/>
							</div>
						</div>

						{/* Thumbnail Upload */}
						<div className="flex flex-col gap-2">
							<label className="text-[#604868] text-xs font-bold uppercase tracking-wider ml-1">Course Thumbnail</label>
							<div className="flex flex-col items-center justify-center border-2 border-dashed border-[#DCC8E0] bg-[#FBF2FB] rounded-[32px] p-6 text-center cursor-pointer hover:bg-[#F2E8F2] transition relative h-32">
								<img 
									src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/wQwYXX2xM2/pcnzhulp_expires_30_days.png"
									className="w-8 h-8 object-fill mb-2 opacity-75"
									alt="upload"
								/>
								<div className="text-sm font-bold text-[#E040A0]">Drag and drop or click to upload</div>
								<div className="text-[10px] text-gray-400 mt-1">Recommended: 1600x900px (PNG, JPG)</div>
								<input
									type="file"
									className="absolute inset-0 opacity-0 cursor-pointer"
									onChange={(e) => {
										if (e.target.files && e.target.files[0]) {
											setThumbnail(URL.createObjectURL(e.target.files[0]));
										}
									}}
								/>
							</div>
						</div>
					</form>

					{/* Right Column: Card Preview */}
					<div className="flex flex-col gap-4">
						<span className="text-[#604868] text-xs font-bold uppercase tracking-wider ml-1">Card Preview</span>
						
						{/* Course Card Preview Box */}
						<div className="bg-[#FEF7FFCC] p-6 rounded-[32px] border border-solid border-[#DCC8E0] shadow-md flex flex-col gap-6">
							{/* Live Card Image */}
							<div className="w-full h-40 bg-[#FBF2FB] rounded-2xl flex items-center justify-center border border-dashed border-[#DCC8E055] overflow-hidden relative">
								{thumbnail ? (
									<img src={thumbnail} className="w-full h-full object-cover" alt="Course thumbnail" />
								) : (
									<div className="flex flex-col items-center justify-center text-[#DCC8E0]">
										<span className="text-4xl">🖼️</span>
									</div>
								)}
							</div>

							{/* Live Card Info */}
							<div className="flex flex-col items-start w-full">
								<span className="text-[#E040A0] text-xs font-bold uppercase tracking-widest block mb-1">
									{category}
								</span>
								<h3 className="text-[#2E1A28] text-base font-bold truncate w-full">
									{title || "Untitled Course"}
								</h3>
								<span className="text-[#604868] text-xs block mt-1">
									{`${modules} Modules • ${duration}`}
								</span>
							</div>

							{/* Progress Bar placeholder */}
							<div className="flex flex-col w-full gap-2">
								<div className="flex justify-between items-center text-xs text-gray-400">
									<span>Progress</span>
									<span>0%</span>
								</div>
								<div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
									<div className="h-full bg-[#E040A0] w-0"></div>
								</div>
							</div>

							{/* Preview Action Button */}
							<button className="flex justify-center bg-transparent py-3 w-full rounded-full border-2 border-solid border-[#E040A0] text-[#E040A0] font-bold text-sm">
								Resume Learning
							</button>
						</div>
					</div>
				</div>

				{/* Footer Action Buttons */}
				<div className="flex justify-end items-center gap-4 pt-6 border-t border-gray-100 mt-2">
					<button
						type="button"
						onClick={() => navigate("/my-courses")}
						className="py-3 px-8 rounded-full bg-[#ECE2EC] hover:bg-[#dcd0dc] text-[#604868] font-bold text-base border-0 transition"
					>
						Save Draft
					</button>
					<button
						type="button"
						onClick={handlePublish}
						className="flex items-center gap-2 py-3 px-10 rounded-full bg-[#E040A0] hover:bg-[#c03080] text-white font-bold text-base shadow-[04px16px0rgba(224,64,160,0.15)] border-0 transition"
					>
						<span>🚀</span>
						<span>Publish Course</span>
					</button>
				</div>
			</div>
		</div>
	);
}
