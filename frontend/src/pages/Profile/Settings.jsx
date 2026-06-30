import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../services/api";

export default function Settings() {
	const navigate = useNavigate();
	const { user, logout, updateUserInfo } = useAuth();
	const isAdmin = user?.role === 'admin';

	const [activeSubTab, setActiveSubTab] = useState("Account");

	// Profile Form states
	const [fullName, setFullName] = useState('');
	const [email, setEmail] = useState('');
	const [phoneNumber, setPhoneNumber] = useState('');
	const [error, setError] = useState('');
	const [successMsg, setSuccessMsg] = useState('');

	// Password change states
	const [showPassForm, setShowPassForm] = useState(false);
	const [currentPassword, setCurrentPassword] = useState('');
	const [newPassword, setNewPassword] = useState('');
	const [passError, setPassError] = useState('');
	const [passSuccess, setPassSuccess] = useState('');

	useEffect(() => {
		if (user) {
			setFullName(user.name || user.fullName || '');
			setEmail(user.email || '');
			setPhoneNumber(user.phoneNumber || '');
		}
	}, [user]);

	const handleSaveChanges = async (e) => {
		e.preventDefault();
		setError('');
		setSuccessMsg('');

		try {
			const res = await api.put('/users/profile', {
				fullName,
				phoneNumber
			});
			if (res.status === 'success') {
				setSuccessMsg("Profile updated successfully!");
				if (typeof updateUserInfo === 'function') {
					updateUserInfo({ name: fullName, phoneNumber });
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
				currentPassword,
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
		<div className="flex bg-white min-h-screen font-sans antialiased text-gray-800">
			{/* Sidebar on the Left */}
			<div className="flex flex-col shrink-0 items-center bg-[#FBF2FB] py-6 w-64 border-r border-[#DCC8E033] min-h-screen">
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
				<div className="flex justify-between items-center bg-[#FEF7FFCC] py-3 px-8 border-b border-[#DCC8E033] h-16">
					<div className="flex items-center bg-white py-2 px-3 gap-2 rounded-full border border-[#DCC8E055] w-96">
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
							src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/wQwYXX2xM2/uc6jo6mt_expires_30_days.png"} 
							className="w-10 h-10 object-fill rounded-full"
							alt="avatar"
						/>
					</div>
				</div>

				{/* Actual Page Settings Content */}
				<div className="flex flex-col flex-1 p-8 gap-6 max-w-[1200px] w-full mx-auto">
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
								className={`py-3 px-4 font-bold text-sm bg-transparent border-0 border-b-2 transition cursor-pointer ${
									activeSubTab === subTab 
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
					<div className="grid grid-cols-[1.8fr_1fr] gap-8 items-start mt-4">
						
						{/* Left Side: Profile Information */}
						<form onSubmit={handleSaveChanges} className="bg-white p-8 rounded-[32px] border border-solid border-[#DCC8E088] shadow-sm flex flex-col gap-6">
							<div className="flex justify-between items-center border-b pb-4">
								<h3 className="text-[#2E1A28] text-lg font-bold flex items-center gap-2">
									<span>👤</span> Profile Information
								</h3>
							</div>

							<div className="flex items-center gap-6">
								<div className="flex flex-col items-center">
									<img
										src={user?.avatarUrl || "https://storage.googleapis.com/tagjs-prod.appspot.com/v1/wQwYXX2xM2/uc6jo6mt_expires_30_days.png"} 
										className="w-20 h-20 rounded-full border-2 border-[#E040A0] object-cover"
										alt="avatar preview"
									/>
								</div>

								<div className="flex-1 flex flex-col gap-4">
									<div className="flex flex-col gap-2">
										<label className="text-gray-400 text-xs font-bold uppercase tracking-wider">Full Name</label>
										<input
											type="text"
											value={fullName}
											onChange={(e) => setFullName(e.target.value)}
											className="bg-[#FBF2FB] text-gray-800 text-sm py-3 px-5 rounded-full border border-transparent outline-none focus:border-[#E040A0] transition font-bold"
										/>
									</div>

									<div className="flex flex-col gap-2">
										<label className="text-gray-400 text-xs font-bold uppercase tracking-wider">Email Address (Read-only)</label>
										<input
											type="email"
											value={email}
											readOnly
											className="bg-gray-50 text-gray-400 text-sm py-3 px-5 rounded-full border border-transparent outline-none cursor-not-allowed"
										/>
									</div>

									<div className="flex flex-col gap-2">
										<label className="text-gray-400 text-xs font-bold uppercase tracking-wider">Phone Number</label>
										<input
											type="text"
											value={phoneNumber}
											onChange={(e) => setPhoneNumber(e.target.value)}
											className="bg-[#FBF2FB] text-gray-800 text-sm py-3 px-5 rounded-full border border-transparent outline-none focus:border-[#E040A0] transition"
										/>
									</div>
								</div>
							</div>

							<div className="flex justify-end mt-2">
								<button type="submit" className="bg-[#E040A0] hover:bg-[#c03080] text-white py-3 px-8 rounded-full font-bold text-sm border-0 transition shadow-sm cursor-pointer">
									Save Changes
								</button>
							</div>
						</form>

						{/* Right Side: Linked Accounts */}
						<div className="bg-white p-6 rounded-[32px] border border-solid border-[#DCC8E088] shadow-sm flex flex-col gap-6">
							<h3 className="text-[#2E1A28] text-lg font-bold border-b pb-4 flex items-center gap-2">
								<span>🔗</span> Linked Accounts
							</h3>

							<div className="flex flex-col gap-4">
								<div className="flex justify-between items-center p-4 bg-[#FBF2FB] rounded-2xl border border-gray-50">
									<div className="flex items-center gap-3">
										<span className="text-xl">🏛</span>
										<div>
											<h4 className="text-[#2E1A28] text-xs font-bold">President University</h4>
											<p className="text-emerald-500 text-[10px] font-bold">Connected</p>
										</div>
									</div>
									<span className="text-emerald-500 text-base font-bold">✓</span>
								</div>
							</div>
						</div>
					</div>

					{/* Security & Access */}
					<div className="bg-white p-6 rounded-[32px] border border-solid border-[#DCC8E088] shadow-sm w-full flex flex-col gap-4 mt-2">
						<h3 className="text-[#2E1A28] text-lg font-bold border-b pb-4 flex items-center gap-2">
							<span>🛡</span> Security & Access
						</h3>
						
						{showPassForm ? (
							<form onSubmit={handleChangePassword} className="flex flex-col gap-4 max-w-md p-4 bg-[#FEF7FF] rounded-2xl border border-[#7C52AA22]">
								{passSuccess && <div className="text-emerald-600 text-xs font-bold">{passSuccess}</div>}
								{passError && <div className="text-red-500 text-xs font-bold">{passError}</div>}
								
								<div className="flex flex-col gap-1">
									<label className="text-xs font-bold text-[#604868]">Current Password</label>
									<input
										type="password"
										value={currentPassword}
										onChange={(e) => setCurrentPassword(e.target.value)}
										className="bg-white text-sm py-2 px-4 rounded-full border border-[#DCC8E0]"
									/>
								</div>
								<div className="flex flex-col gap-1">
									<label className="text-xs font-bold text-[#604868]">New Password</label>
									<input
										type="password"
										value={newPassword}
										onChange={(e) => setNewPassword(e.target.value)}
										className="bg-white text-sm py-2 px-4 rounded-full border border-[#DCC8E0]"
									/>
								</div>
								<div className="flex justify-end gap-2 mt-2">
									<button 
										type="button" 
										className="text-gray-500 text-xs hover:underline bg-transparent border-0 cursor-pointer"
										onClick={() => setShowPassForm(false)}
									>
										Cancel
									</button>
									<button 
										type="submit" 
										className="bg-[#7C52AA] text-white text-xs py-2 px-6 rounded-full hover:bg-[#604085] transition border-0 cursor-pointer"
									>
										Update Password
									</button>
								</div>
							</form>
						) : (
							<div className="flex justify-between items-center p-4 bg-[#FEF7FF] rounded-2xl border border-[#7C52AA22] w-full">
								<div>
									<h4 className="text-[#2E1A28] text-sm font-bold">Change Password</h4>
									<p className="text-gray-400 text-xs mt-0.5">Keep your account secure with regular updates</p>
								</div>
								<button type="button" className="border-2 border-solid border-[#7C52AA] text-[#7C52AA] hover:bg-[#7C52AA]/5 py-2.5 px-6 rounded-full font-bold text-xs bg-transparent cursor-pointer transition"
									onClick={() => setShowPassForm(true)}>
									Update
								</button>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
