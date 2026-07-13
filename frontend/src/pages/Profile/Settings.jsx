import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../services/api";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function Settings() {
	const navigate = useNavigate();
	const { user, logout, updateUserInfo } = useAuth();
	const isAdmin = user?.role === 'admin';

	const [activeSubTab, setActiveSubTab] = useState("Account");

	// Profile Form states
	const [firstName, setFirstName] = useState('');
	const [lastName, setLastName] = useState('');
	const [email, setEmail] = useState('');
	const [phoneNumber, setPhoneNumber] = useState('');
	const [bio, setBio] = useState('Honors CS student at Evergreen University. Passionate about AI and educational tech.');
	const [avatarFile, setAvatarFile] = useState(null);
	const [avatarPreview, setAvatarPreview] = useState('');
	const [error, setError] = useState('');
	const [successMsg, setSuccessMsg] = useState('');

	const fileInputRef = React.useRef(null);

	// Password change states
	const [showPassForm, setShowPassForm] = useState(false);
	const [currentPassword, setCurrentPassword] = useState('');
	const [newPassword, setNewPassword] = useState('');
	const [passError, setPassError] = useState('');
	const [passSuccess, setPassSuccess] = useState('');
	const [showOldPassword, setShowOldPassword] = useState(false);
	const [showNewPassword, setShowNewPassword] = useState(false);

	useEffect(() => {
		if (user) {
			const name = user.name || user.fullName || '';
			const parts = name.split(' ');
			setFirstName(parts[0] || 'Alex');
			setLastName(parts.slice(1).join(' ') || 'Johnson');
			setEmail(user.email || 'alex.j@mbg-student.com');
			setPhoneNumber(user.phoneNumber || '');
			setAvatarPreview(user.avatarUrl || '');
		}
	}, [user]);

	const handleAvatarChange = (e) => {
		const file = e.target.files[0];
		if (file) {
			setAvatarFile(file);
			setAvatarPreview(URL.createObjectURL(file));
		}
	};

	const handleSaveChanges = async (e) => {
		e.preventDefault();
		setError('');
		setSuccessMsg('');

		const combinedName = `${firstName} ${lastName}`.trim();
		const formData = new FormData();
		formData.append('fullName', combinedName);
		formData.append('phoneNumber', phoneNumber);
		if (avatarFile) {
			formData.append('avatar', avatarFile);
		}

		try {
			const res = await api.put('/users/profile', formData);
			if (res.status === 'success') {
				setSuccessMsg("Profile updated successfully!");
				if (typeof updateUserInfo === 'function') {
					updateUserInfo({
						name: res.data?.fullName || combinedName,
						phoneNumber: res.data?.phoneNumber || phoneNumber,
						avatarUrl: res.data?.avatarUrl || user.avatarUrl
					});
				}
			} else {
				setError(res.message || "Failed to update profile.");
			}
		} catch (err) {
			setError(err.message || "Failed to update profile.");
		}
	};

	const handleChangePassword = async (e) => {
		e.preventDefault();
		setPassError('');
		setPassSuccess('');

		if (!currentPassword || !newPassword) {
			setPassError("Please fill in both current and new passwords.");
			return;
		}

		try {
			const res = await api.put('/users/change-password', {
				oldPassword: currentPassword,
				newPassword
			});
			if (res.status === 'success') {
				setPassSuccess("Password updated successfully!");
				setCurrentPassword('');
				setNewPassword('');
				setTimeout(() => setShowPassForm(false), 2000);
			} else {
				setPassError(res.message || "Failed to change password.");
			}
		} catch (err) {
			setPassError(err.message || "Failed to change password.");
		}
	};

	return (
		<div className="flex flex-col md:flex-row bg-white min-h-screen font-sans antialiased text-gray-800">
			{/* Sidebar on the Left */}
			<div className="flex flex-col shrink-0 items-center bg-[#FBF2FB] py-6 w-full md:w-64 border-b md:border-b-0 md:border-r border-[#DCC8E033] min-h-0 md:min-h-screen">
				<div className="flex flex-col items-center pb-8 px-5 w-full">
					<span className="text-[#E040A0] text-2xl font-bold cursor-pointer" onClick={() => navigate("/")}>
						{"My Better Grade"}
					</span>
					{isAdmin && (
						<span className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">Admin Panel</span>
					)}
				</div>
				<div className="flex flex-col items-start px-4 gap-1 w-full flex-1">
					{isAdmin ? (
						<>
							{/* Admin Sidebar Links */}
							<div className="flex items-center py-3 px-4 rounded-[9999px] cursor-pointer w-full hover:bg-purple-50" onClick={() => navigate("/dashboard-admin")}>
								<span className="text-lg mr-3">👥</span>
								<span className="text-[#604868] text-sm" >
									{"User Management"}
								</span>
							</div>
						</>
					) : (
						<>
							{/* Student/Teacher Sidebar Links */}
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
						</>
					)}

					{/* Profile Link */}
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

					{/* Settings Link (Active) */}
					<div className="flex items-center bg-[#F080C0] py-3 px-4 rounded-[9999px] cursor-pointer w-full text-[#2E1A28] font-bold" onClick={() => navigate("/settings")}>
						<img
							src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/wQwYXX2xM2/pi44b171_expires_30_days.png"}
							className="w-5 h-5 mr-3 rounded-[9999px] object-fill"
							alt="settings"
						/>
						<span className="text-sm" >
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
				<div className="flex flex-col-reverse sm:flex-row justify-between items-center bg-[#FEF7FFCC] py-3 px-4 md:px-8 border-b border-[#DCC8E033] gap-4">
					<div className="flex items-center bg-white py-2 px-3 gap-2 rounded-full border border-[#DCC8E055] w-full max-w-96">
						<img
							src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/wQwYXX2xM2/ccrkzlm2_expires_30_days.png"}
							className="w-[18px] h-6 object-fill"
							alt="search"
						/>
						<input
							type="text"
							placeholder="Search..."
							className="text-gray-700 bg-transparent text-sm w-full outline-none"
						/>
					</div>
					<div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/profile")}>
						<span className="text-sm font-bold text-[#2E1A28]">{user ? user.name : "Mas Wowok"}</span>
						<img
							src={user?.avatarUrl || "https://storage.googleapis.com/tagjs-prod.appspot.com/v1/wQwYXX2xM2/uc6jo6mt_expires_30_days.png"}
							className="w-10 h-10 object-cover rounded-full border border-gray-100"
							alt="avatar"
						/>
					</div>
				</div>

				{/* Actual Page Settings Content */}
				<div className="flex flex-col flex-1 p-4 md:p-8 gap-6 max-w-[1200px] w-full mx-auto">
					{/* Header */}
					<div>
						<h1 className="text-[#2E1A28] text-4xl font-extrabold tracking-tight">Account Settings</h1>
						<p className="text-[#604868] text-base mt-1">Manage your profile, preferences, and account security.</p>
					</div>

					{/* Tabs filter */}
					<div className="flex gap-8 border-b border-gray-200 w-full mt-4">
						{["Account", "Privacy"].map((subTab) => (
							<button
								key={subTab}
								onClick={() => setActiveSubTab(subTab)}
								className={`py-3 px-4 font-bold text-sm bg-transparent border-0 border-b-2 transition cursor-pointer ${activeSubTab === subTab
										? "border-[#E040A0] text-[#E040A0]"
										: "border-transparent text-gray-400 hover:text-[#E040A0]"
									}`}
							>
								{subTab}
							</button>
						))}
					</div>

					{/* Alert messages */}
					{successMsg && (
						<div className="text-emerald-600 text-sm font-bold bg-emerald-50 border border-emerald-200 py-3.5 px-6 rounded-full w-full text-center">
							{successMsg}
						</div>
					)}
					{error && (
						<div className="text-red-500 text-sm font-bold bg-red-50 border border-red-200 py-3.5 px-6 rounded-full w-full text-center">
							{error}
						</div>
					)}

					{/* Form Grid */}
					<div className="flex flex-col lg:grid lg:grid-cols-[1.8fr_1fr] gap-8 items-start mt-4 w-full">

						{/* Left Side: Profile Information */}
						<form onSubmit={handleSaveChanges} className="bg-white p-8 rounded-[40px] border border-solid border-[#DCC8E0]/30 shadow-[0px_8px_32px_rgba(224,64,160,0.03)] flex flex-col gap-6">
							<div className="flex justify-between items-center border-b border-gray-100 pb-5">
								<div className="flex items-center gap-2.5">
									<span className="text-[#E040A0] text-xl flex items-center justify-center">
										<svg className="w-5.5 h-5.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
										</svg>
									</span>
									<h3 className="text-[#2E1A28] text-lg font-heading font-black">{"Profile Information"}</h3>
								</div>
								<span className="text-[#E040A0] text-sm font-heading font-black hover:underline cursor-pointer">
									{"Edit All"}
								</span>
							</div>

							<div className="flex flex-col md:flex-row items-center md:items-start gap-8 mt-2 w-full">
								<div className="flex flex-col items-center gap-2">
									<img
										src={avatarPreview || "https://storage.googleapis.com/tagjs-prod.appspot.com/v1/wQwYXX2xM2/uc6jo6mt_expires_30_days.png"}
										className="w-[100px] h-[100px] min-w-[100px] min-h-[100px] max-w-[100px] max-h-[100px] rounded-full border-2 border-white object-cover shadow-[0px_4px_16px_rgba(0,0,0,0.08)] cursor-pointer hover:scale-105 transition"
										alt="avatar preview"
										onClick={() => fileInputRef.current?.click()}
									/>
									<input
										type="file"
										ref={fileInputRef}
										onChange={handleAvatarChange}
										accept="image/*"
										className="hidden"
									/>
									<span
										className="text-[#604868] hover:text-[#E040A0] text-xs font-heading font-black cursor-pointer transition select-none mt-1"
										onClick={() => fileInputRef.current?.click()}
									>
										{"Update Photo"}
									</span>
								</div>

								<div className="flex-1 flex flex-col gap-5 w-full">
									<div className="flex flex-col sm:flex-row gap-4 w-full">
										<div className="flex-1 flex flex-col gap-1.5">
											<label className="text-brand-grayText text-xs font-heading font-black uppercase tracking-wider">{"First Name"}</label>
											<input
												type="text"
												value={firstName}
												onChange={(e) => setFirstName(e.target.value)}
												className="bg-[#F5EEF6]/60 text-gray-800 text-sm py-3 px-5 rounded-[16px] border border-transparent outline-none focus:border-[#E040A0] transition font-bold"
											/>
										</div>
										<div className="flex-1 flex flex-col gap-1.5">
											<label className="text-brand-grayText text-xs font-heading font-black uppercase tracking-wider">{"Last Name"}</label>
											<input
												type="text"
												value={lastName}
												onChange={(e) => setLastName(e.target.value)}
												className="bg-[#F5EEF6]/60 text-gray-800 text-sm py-3 px-5 rounded-[16px] border border-transparent outline-none focus:border-[#E040A0] transition font-bold"
											/>
										</div>
									</div>

									<div className="flex flex-col gap-1.5">
										<label className="text-brand-grayText text-xs font-heading font-black uppercase tracking-wider">{"Email Address"}</label>
										<input
											type="email"
											value={email}
											readOnly
											className="bg-[#F5EEF6]/60 text-[#604868] text-sm py-3 px-5 rounded-[16px] border border-transparent outline-none cursor-not-allowed font-bold"
										/>
									</div>

									<div className="flex flex-col gap-1.5">
										<label className="text-brand-grayText text-xs font-heading font-black uppercase tracking-wider">{"Bio"}</label>
										<textarea
											value={bio}
											onChange={(e) => setBio(e.target.value)}
											className="bg-[#F5EEF6]/60 text-gray-800 text-sm py-3.5 px-5 rounded-[16px] border border-transparent outline-none focus:border-[#E040A0] transition font-semibold resize-none h-24"
										/>
									</div>
								</div>
							</div>

							<div className="flex justify-end mt-4">
								<button type="submit" className="bg-[#E040A0] hover:bg-[#c03080] text-white py-3.5 px-10 rounded-full font-heading font-black text-sm border-0 transition shadow-md cursor-pointer">
									{"Save Changes"}
								</button>
							</div>
						</form>

						{/* Right Side: Academic */}
						<div className="bg-white p-8 rounded-[40px] border border-solid border-[#DCC8E0]/30 shadow-[0px_8px_32px_rgba(224,64,160,0.02)] flex flex-col gap-5">
							<div className="flex items-center gap-2.5 pb-4 border-b border-gray-100">
								<span className="text-[#0096CC] text-xl flex items-center justify-center">
									<svg className="w-5.5 h-5.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
									</svg>
								</span>
								<h3 className="text-[#2E1A28] text-base font-heading font-black">{"Academic"}</h3>
							</div>

							<div className="flex items-center gap-4.5 p-4.5 bg-[#F5EEF6]/60 rounded-[20px] border border-[#DCC8E0]/10">
								<div className="w-11 h-11 rounded-full bg-[#EBF8FF] text-[#0096CC] flex items-center justify-center border-2 border-white shadow-sm flex-shrink-0">
									<svg className="w-5.5 h-5.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12h-15M21 9v12H3V9z" />
									</svg>
								</div>
								<div>
									<h4 className="text-[#2E1A28] text-sm font-heading font-black">{"President University"}</h4>
								</div>
							</div>
						</div>
					</div>

					{/* Security & Access */}
					<div className="bg-white p-6 md:p-8 rounded-[32px] md:rounded-[40px] border border-solid border-[#DCC8E0]/30 shadow-[0_8px_32px_rgba(224,64,160,0.02)] w-full flex flex-col gap-5 mt-2">
						<div className="flex items-center gap-2.5 border-b border-gray-100 pb-5">
							<span className="text-[#7C52AA] text-xl flex items-center justify-center">
								<svg className="w-5.5 h-5.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
								</svg>
							</span>
							<h3 className="text-[#2E1A28] text-lg font-heading font-black">{"Security & Access"}</h3>
						</div>

						{showPassForm ? (
							<form onSubmit={handleChangePassword} className="flex flex-col gap-4 max-w-md p-6 bg-[#FEF7FF] rounded-[24px] border border-[#7C52AA]/15 shadow-sm">
								{passSuccess && <div className="text-emerald-600 text-xs font-bold">{passSuccess}</div>}
								{passError && <div className="text-red-500 text-xs font-bold">{passError}</div>}

								<div className="flex flex-col gap-1.5">
									<label className="text-xs font-bold text-[#604868]">{"Current Password"}</label>
									<div className="relative w-full">
										<input
											type={showOldPassword ? "text" : "password"}
											value={currentPassword}
											onChange={(e) => setCurrentPassword(e.target.value)}
											className="bg-white text-sm py-2.5 pl-4 pr-10 rounded-full border border-[#DCC8E0] w-full"
										/>
										<div 
											className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer hover:text-gray-600"
											onClick={() => setShowOldPassword(!showOldPassword)}
										>
											{showOldPassword ? <FaEyeSlash /> : <FaEye />}
										</div>
									</div>
								</div>
								<div className="flex flex-col gap-1.5">
									<label className="text-xs font-bold text-[#604868]">{"New Password"}</label>
									<div className="relative w-full">
										<input
											type={showNewPassword ? "text" : "password"}
											value={newPassword}
											onChange={(e) => setNewPassword(e.target.value)}
											className="bg-white text-sm py-2.5 pl-4 pr-10 rounded-full border border-[#DCC8E0] w-full"
										/>
										<div 
											className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer hover:text-gray-600"
											onClick={() => setShowNewPassword(!showNewPassword)}
										>
											{showNewPassword ? <FaEyeSlash /> : <FaEye />}
										</div>
									</div>
								</div>
								<div className="flex justify-end gap-3 mt-2">
									<button
										type="button"
										className="text-gray-500 text-xs hover:underline bg-transparent border-0 cursor-pointer"
										onClick={() => setShowPassForm(false)}
									>
										{"Cancel"}
									</button>
									<button
										type="submit"
										className="bg-[#7C52AA] text-white text-xs py-2 px-6 rounded-full hover:bg-[#604085] transition border-0 cursor-pointer"
									>
										{"Update Password"}
									</button>
								</div>
							</form>
						) : (
							<div className="flex justify-between items-center p-5 bg-[#F5EEF6]/60 rounded-[20px] border border-[#DCC8E0]/10 w-full">
								<div>
									<h4 className="text-[#2E1A28] text-sm font-heading font-black">{"Change Password"}</h4>
									<p className="text-brand-grayText text-xs font-semibold mt-0.5">{"Last updated 3 months ago"}</p>
								</div>
								<button type="button" className="border-2 border-solid border-[#7C52AA] text-[#7C52AA] hover:bg-[#7C52AA]/5 py-2.5 px-6 rounded-full font-heading font-black text-xs bg-transparent cursor-pointer transition"
									onClick={() => setShowPassForm(true)}>
									{"Update"}
								</button>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
