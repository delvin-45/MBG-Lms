import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Login() {
	const navigate = useNavigate();
	const { login } = useAuth();
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [showSplash, setShowSplash] = useState(false);
	const [loadingText, setLoadingText] = useState("Securing premium learning environment...");
	const [error, setError] = useState('');
	const [showPassword, setShowPassword] = useState(false);

	// Handler Eksekusi Login: Panggil AuthContext.login, tampilkan Splash Screen 1.8s, lalu redirect sesuai role
	const handleLogin = async () => {
		setError('');
		try {
			// Tembak API Login via AuthContext
			const loggedUser = await login(email, password);
			setShowSplash(true); // Tampilkan animasi Splash Screen

			// Beri jeda animasi 1.8 detik sebelum pindah halaman
			setTimeout(() => {
				if (loggedUser.role === 'admin') {
					navigate('/dashboard-admin'); // Admin ke Dashboard Admin
				} else {
					navigate('/dashboard'); // Student/Teacher ke Dashboard Biasa
				}
			}, 1800);
		} catch (err) {
			setError(err.message || 'Email/username atau password salah');
		}
	};

	return (
		<div className="relative min-h-screen bg-[#FEF7FF]">
			{/* Classy Splash Screen Overlay */}
			{showSplash && (
				<div className="fixed inset-0 bg-[#FFD6EE] z-50 flex flex-col items-center justify-center gap-6 animate-fade-in duration-300">
					{/* Logo & Ring Spinner */}
					<div className="relative flex items-center justify-center">
						{/* Double glowing rings */}
						<div className="absolute w-28 h-28 rounded-full border-4 border-t-[#E040A0] border-r-transparent border-b-[#7C52AA] border-l-transparent animate-spin duration-1000"></div>
						<div className="absolute w-24 h-24 rounded-full border-4 border-t-transparent border-r-[#0096CC] border-b-transparent border-l-[#ECE2EC] animate-spin duration-1000" style={{ animationDirection: 'reverse' }}></div>

						{/* Logo Monogram */}
						<div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#E040A0] to-[#7C52AA] flex items-center justify-center shadow-[0_10px_25px_rgba(224,64,160,0.35)]">
							<span className="text-white text-3xl font-black">M</span>
						</div>
					</div>

					{/* Brand Name with Gradient */}
					<div className="flex flex-col items-center gap-1 mt-4">
						<span className="text-3xl font-black bg-gradient-to-r from-[#E040A0] via-[#F080C0] to-[#7C52AA] bg-clip-text text-transparent tracking-wide">
							My Better Grade
						</span>
						<span className="text-[#604868] text-sm font-medium animate-pulse">
							{loadingText}
						</span>
					</div>
				</div>
			)}

			{/* Main Login Screen */}
			<div className="flex min-h-screen bg-[#FEF7FF]">
				{/* Left Hero Side (Unchanged Original Design) */}
				<div 
					className="hidden lg:flex flex-1 flex-col items-start pt-36"
					style={{
						background: "linear-gradient(180deg, #E040A099, #E040A000)"
					}}
				>
					<span className="text-white text-6xl font-bold w-[356px] mb-auto ml-16 mt-6 whitespace-pre-line">
						{"Focus on\nwhat matters."}
					</span>
					<div className="w-[357px] h-[136px] mb-16 ml-16">
					</div>
				</div>

				{/* Right Side with Card Wrapped Form */}
				<div className="flex-1 flex flex-col items-center justify-center bg-[#FEF7FF] p-4 sm:p-6 lg:p-8 min-h-screen">
					{/* White Form Card */}
					<div className="w-full max-w-[430px] bg-white rounded-[32px] p-6 sm:p-8 border border-[#E040A01A] shadow-[0_20px_50px_rgba(224,64,160,0.12)] flex flex-col items-center gap-5 my-auto">
						{/* Logo */}
						<img
							src={"/logo.png"}
							className="w-[75px] h-[92px] object-contain cursor-pointer"
							alt="brand logo"
							onClick={() => navigate("/")}
						/>

						{/* Brand & Heading */}
						<div className="flex flex-col items-center text-center w-full">
							<span className="text-[#E040A0] text-xl font-bold cursor-pointer" onClick={() => navigate("/")}>
								My Better Grade
							</span>
							<h2 className="text-[#2E1A28] text-2xl sm:text-3xl font-bold mt-1">
								Welcome back!
							</h2>
							<p className="text-[#604868] text-xs sm:text-sm mt-0.5">
								Please enter your details to sign in.
							</p>

							{error && (
								<div className="w-full text-red-500 text-xs font-semibold bg-red-50 py-2 px-3 rounded-lg border border-red-200 mt-2 text-center">
									{error}
								</div>
							)}
						</div>

						{/* Form Inputs Container */}
						<div className="w-full flex flex-col gap-4">
							{/* Email Field */}
							<div className="flex flex-col gap-1">
								<label className="text-[#604868] text-xs font-bold px-1">
									Email Address
								</label>
								<div className="flex items-center bg-[#FBF2FB] py-3 px-4 gap-3 rounded-full border border-[#DCC8E0] focus-within:border-[#E040A0] focus-within:ring-2 focus-within:ring-[#E040A022] transition w-full">
									<img
										src={"/login Image (email).png"}
										className="w-4 h-5 object-contain opacity-70"
										alt="email"
									/>
									<input
										type="email"
										value={email}
										onChange={(e) => setEmail(e.target.value)}
										className="bg-transparent text-sm text-[#2E1A28] outline-none w-full placeholder:text-[#604868]/50"
										placeholder="name@university.edu"
									/>
								</div>
							</div>

							{/* Password Field */}
							<div className="flex flex-col gap-1">
								<div className="flex justify-between items-center px-1">
									<label className="text-[#604868] text-xs font-bold">
										Password
									</label>
									<button
										type="button"
										className="text-[#0096CC] text-xs font-bold hover:underline cursor-pointer"
										onClick={() => alert("Silakan hubungi administrator untuk mereset kata sandi Anda.")}
									>
										Forgot?
									</button>
								</div>
								<div className="flex items-center bg-[#FBF2FB] py-3 px-4 gap-3 rounded-full border border-[#DCC8E0] focus-within:border-[#E040A0] focus-within:ring-2 focus-within:ring-[#E040A022] transition w-full">
									<img
										src={"/login Image (password).png"}
										className="w-4 h-5 object-contain opacity-70"
										alt="password"
									/>
									<input
										type={showPassword ? "text" : "password"}
										value={password}
										onChange={(e) => setPassword(e.target.value)}
										className="bg-transparent text-sm text-[#2E1A28] outline-none w-full placeholder:text-[#604868]/50"
										placeholder="••••••••"
									/>
									<button
										type="button"
										className="focus:outline-none text-[#604868] hover:text-[#E040A0] transition shrink-0"
										onClick={() => setShowPassword(!showPassword)}
									>
										<svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
											{showPassword ? (
												<path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"></path>
											) : (
												<path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"></path>
											)}
											{!showPassword && <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"></circle>}
										</svg>
									</button>
								</div>
							</div>

							{/* Remember Me */}
							<div className="flex items-center px-1">
								<input
									type="checkbox"
									id="remember-me"
									className="w-4 h-4 rounded text-[#E040A0] focus:ring-[#E040A0] accent-[#E040A0] cursor-pointer"
									defaultChecked
								/>
								<label htmlFor="remember-me" className="text-[#604868] text-xs ml-2 cursor-pointer select-none">
									Remember me for 30 days
								</label>
							</div>

							{/* Sign In Button */}
							<button
								className="w-full bg-[#E040A0] hover:bg-[#c03080] py-3 rounded-full text-white font-bold text-base shadow-[0_4px_16px_rgba(224,64,160,0.3)] hover:shadow-[0_6px_20px_rgba(224,64,160,0.4)] transition-all flex items-center justify-center gap-2 cursor-pointer mt-1 active:scale-[0.99]"
								onClick={handleLogin}
							>
								<span>Sign In</span>
								<img
									src={"/login Image (arrow icon).png"}
									className="w-4 h-4 object-contain"
									alt="arrow icon"
								/>
							</button>
						</div>

						{/* Divider */}
						<div className="w-full flex items-center my-0.5">
							<div className="flex-1 border-t border-[#DCC8E0]/60"></div>
							<span className="px-3 text-[#604868]/70 text-[10px] font-bold tracking-wider uppercase">
								OR CONTINUE WITH
							</span>
							<div className="flex-1 border-t border-[#DCC8E0]/60"></div>
						</div>

						{/* Social Buttons */}
						<div className="grid grid-cols-2 gap-3 w-full">
							<button
								className="flex items-center justify-center gap-2 py-2 px-4 rounded-full border border-[#DCC8E0] bg-white hover:bg-[#FBF2FB] transition text-xs font-bold text-[#2E1A28] cursor-pointer"
								onClick={() => alert("Fitur Google Sign-In segera hadir!")}
							>
								<img
									src={"/Image (google).png"}
									className="w-4 h-4 object-contain"
									alt="google"
								/>
								<span>Google</span>
							</button>
							<button
								className="flex items-center justify-center gap-2 py-2 px-4 rounded-full border border-[#DCC8E0] bg-white hover:bg-[#FBF2FB] transition text-xs font-bold text-[#2E1A28] cursor-pointer"
								onClick={() => alert("Fitur Apple Sign-In segera hadir!")}
							>
								<img
									src={"/Image (apple).png"}
									className="w-4 h-4 object-contain"
									alt="apple"
								/>
								<span>Apple</span>
							</button>
						</div>

						{/* Register Link */}
						<div className="text-center mt-1">
							<p className="text-[#604868] text-xs">
								Don't have an account?{" "}
								<button
									className="text-[#E040A0] hover:underline font-bold bg-transparent border-0 cursor-pointer p-0"
									onClick={() => navigate("/register")}
								>
									Create an account
								</button>
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

