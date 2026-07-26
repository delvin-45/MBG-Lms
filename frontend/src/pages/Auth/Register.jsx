import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Register() {
	const navigate = useNavigate();
	const { register, login } = useAuth();
	const [firstName, setFirstName] = useState('');
	const [lastName, setLastName] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [role, setRole] = useState('student'); // 'student' or 'teacher'
	const [error, setError] = useState('');

	const handleRegister = async () => {
		setError('');
		if (!firstName.trim() || !lastName.trim()) {
			setError("First Name and Last Name tidak boleh kosong");
			return;
		}
		if (!email.trim()) {
			setError("Email tidak boleh kosong");
			return;
		}
		if (password.length < 8) {
			setError("Password must be at least 8 characters");
			return;
		}

		try {
			const fullName = `${firstName.trim()} ${lastName.trim()}`;
			const response = await register(fullName, email, password, role, "");
			if (response.status === 'success') {
				// Auto login after successful registration
				const loggedUser = await login(email, password);
				if (loggedUser.role === 'admin') {
					navigate('/dashboard-admin');
				} else {
					navigate('/dashboard');
				}
			} else {
				setError(response.message || 'Registration failed');
			}
		} catch (err) {
			setError(err.message || 'Registration failed');
		}
	};

	return (
		<div className="min-h-screen bg-[#FEF7FF] flex flex-col justify-between py-4 px-4 sm:px-6">
			{/* Top Bar */}
			<div className="w-full max-w-3xl mx-auto flex justify-between items-center py-2 px-2">
				<span className="text-[#E040A0] text-2xl font-bold tracking-tight cursor-pointer" onClick={() => navigate("/")}>
					My Better Grade
				</span>
				<div className="flex items-center gap-1.5 text-xs sm:text-sm">
					<span className="text-[#604868]">Already have an account?</span>
					<button 
						className="text-[#E040A0] font-bold hover:underline bg-transparent border-0 cursor-pointer p-0"
						onClick={() => navigate("/login")}
					>
						Log in
					</button>
				</div>
			</div>

			{/* Main Register Card Container */}
			<div className="w-full max-w-xl mx-auto my-auto py-2">
				<div className="bg-white p-6 sm:p-8 rounded-[32px] border border-[#E040A01A] shadow-[0_20px_50px_rgba(224,64,160,0.12)] flex flex-col gap-5">
					{/* Header */}
					<div className="flex flex-col items-center text-center gap-1">
						<h1 className="text-[#2E1A28] text-2xl sm:text-3xl font-extrabold tracking-tight">
							Join MBG Learning
						</h1>
						<p className="text-[#604868] text-xs sm:text-sm">
							Create your academic profile in seconds.
						</p>
						{error && (
							<div className="w-full max-w-md text-red-500 text-xs font-semibold bg-red-50 py-2 px-3 rounded-lg border border-red-200 mt-2 text-center">
								{error}
							</div>
						)}
					</div>

					{/* Form Items */}
					<div className="flex flex-col gap-4">
						{/* Role Selection */}
						<div className="flex flex-col gap-1.5">
							<span className="text-[#604868] text-xs font-bold px-1 uppercase tracking-wider">
								I am a...
							</span>
							<div className="grid grid-cols-2 gap-3">
								<div
									className={`flex items-center gap-3 p-3 rounded-2xl border-2 cursor-pointer transition-all ${role === 'student' ? 'border-[#E040A0] bg-[#FEF7FF] shadow-sm' : 'border-[#DCC8E0]/60 bg-white hover:border-[#E040A0]/40'}`}
									onClick={() => setRole('student')}
								>
									<img
										src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/wQwYXX2xM2/p5244a9y_expires_30_days.png"}
										className="w-9 h-9 rounded-lg object-cover shrink-0"
										alt="student"
									/>
									<div className="flex flex-col">
										<span className="text-[#2E1A28] text-xs sm:text-sm font-bold">Student</span>
										<span className="text-[#604868] text-[10px] leading-tight">Track grades & ace exams</span>
									</div>
								</div>

								<div
									className={`flex items-center gap-3 p-3 rounded-2xl border-2 cursor-pointer transition-all ${role === 'teacher' ? 'border-[#E040A0] bg-[#FEF7FF] shadow-sm' : 'border-[#DCC8E0]/60 bg-white hover:border-[#E040A0]/40'}`}
									onClick={() => setRole('teacher')}
								>
									<img
										src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/wQwYXX2xM2/raqjkfpt_expires_30_days.png"}
										className="w-9 h-9 rounded-lg object-cover shrink-0"
										alt="teacher"
									/>
									<div className="flex flex-col">
										<span className="text-[#2E1A28] text-xs sm:text-sm font-bold">Teacher</span>
										<span className="text-[#604868] text-[10px] leading-tight">Manage courses & insights</span>
									</div>
								</div>
							</div>
						</div>

						{/* First Name & Last Name */}
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
							<div className="flex flex-col gap-1">
								<label className="text-[#604868] text-xs font-bold px-1">First Name</label>
								<input
									placeholder="E.g. Seraphina"
									value={firstName}
									onChange={(e) => setFirstName(e.target.value)}
									className="text-[#2E1A28] bg-[#FBF2FB] text-sm py-2.5 px-4 rounded-full border border-[#DCC8E0] focus:border-[#E040A0] focus:ring-2 focus:ring-[#E040A022] outline-none transition w-full placeholder:text-[#604868]/50"
								/>
							</div>
							<div className="flex flex-col gap-1">
								<label className="text-[#604868] text-xs font-bold px-1">Last Name</label>
								<input
									placeholder="E.g. Sterling"
									value={lastName}
									onChange={(e) => setLastName(e.target.value)}
									className="text-[#2E1A28] bg-[#FBF2FB] text-sm py-2.5 px-4 rounded-full border border-[#DCC8E0] focus:border-[#E040A0] focus:ring-2 focus:ring-[#E040A022] outline-none transition w-full placeholder:text-[#604868]/50"
								/>
							</div>
						</div>

						{/* Academic Email */}
						<div className="flex flex-col gap-1">
							<label className="text-[#604868] text-xs font-bold px-1">Academic Email</label>
							<div className="flex items-center bg-[#FBF2FB] py-2.5 px-4 gap-3 rounded-full border border-[#DCC8E0] focus-within:border-[#E040A0] focus-within:ring-2 focus-within:ring-[#E040A022] transition">
								<img
									src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/wQwYXX2xM2/lypvtfbj_expires_30_days.png"}
									className="w-4 h-4 object-contain opacity-70"
									alt="email"
								/>
								<input
									type="email"
									placeholder="you@university.edu"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									className="bg-transparent text-sm text-[#2E1A28] outline-none w-full placeholder:text-[#604868]/50"
								/>
							</div>
						</div>

						{/* Password */}
						<div className="flex flex-col gap-1">
							<label className="text-[#604868] text-xs font-bold px-1">Password</label>
							<div className="flex items-center bg-[#FBF2FB] py-2.5 px-4 gap-3 rounded-full border border-[#DCC8E0] focus-within:border-[#E040A0] focus-within:ring-2 focus-within:ring-[#E040A022] transition">
								<img
									src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/wQwYXX2xM2/rtx2r47x_expires_30_days.png"}
									className="w-4 h-4 object-contain opacity-70"
									alt="password"
								/>
								<input
									type="password"
									placeholder="Min. 8 characters"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									className="bg-transparent text-sm text-[#2E1A28] outline-none w-full placeholder:text-[#604868]/50"
								/>
							</div>
						</div>

						{/* Terms Checkbox */}
						<div className="flex items-start px-1 gap-2 mt-0.5">
							<input type="checkbox" id="terms" className="w-4 h-4 mt-0.5 rounded text-[#E040A0] focus:ring-[#E040A0] accent-[#E040A0] cursor-pointer" defaultChecked />
							<label htmlFor="terms" className="text-[#604868] text-xs leading-normal select-none cursor-pointer">
								I agree to the Terms of Service and Privacy Policy. I understand this is a premium educational environment.
							</label>
						</div>

						{/* Submit Button */}
						<button 
							className="w-full bg-[#E040A0] hover:bg-[#c03080] py-3 rounded-full text-white font-bold text-base shadow-[0_4px_16px_rgba(224,64,160,0.3)] hover:shadow-[0_6px_20px_rgba(224,64,160,0.4)] transition-all flex items-center justify-center gap-2 cursor-pointer mt-1 active:scale-[0.99]"
							onClick={handleRegister}
						>
							<span>Create Account</span>
							<img
								src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/wQwYXX2xM2/dzvb3lyq_expires_30_days.png"}
								className="w-4 h-4 object-contain"
								alt="arrow"
							/>
						</button>
					</div>
				</div>
			</div>

			{/* Footer */}
			<div className="w-full text-center py-2 flex flex-col items-center gap-1.5">
				<p className="text-[#604868] text-xs font-medium">
					Empowering over 50,000 students globally.
				</p>
				<div className="flex items-center justify-center gap-5 text-[#907898] text-[10px] font-bold">
					<button className="hover:text-[#E040A0] transition bg-transparent border-0 cursor-pointer" onClick={() => navigate("/")}>HELP CENTER</button>
					<span>•</span>
					<button className="hover:text-[#E040A0] transition bg-transparent border-0 cursor-pointer" onClick={() => navigate("/")}>SYSTEM STATUS</button>
					<span>•</span>
					<button className="hover:text-[#E040A0] transition bg-transparent border-0 cursor-pointer" onClick={() => navigate("/")}>SECURITY</button>
				</div>
			</div>
		</div>
	);
}

