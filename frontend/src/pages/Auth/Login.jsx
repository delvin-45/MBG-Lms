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

	const handleLogin = async () => {
		setError('');
		try {
			const loggedUser = await login(email, password);
			setShowSplash(true);

			// Stage loading messages for transition effects
			setTimeout(() => {
				setLoadingText("Configuring workspace...");
			}, 8000);

			setTimeout(() => {
				if (loggedUser.role === 'admin') {
					navigate('/dashboard-admin');
				} else {
					navigate('/dashboard');
				}
			}, 1800); // 1.8 seconds classy splash delay
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
						<div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#E040A0] to-[#7C52AA] flex items-center justify-center shadow-[00px24px30px_#E040A055]">
							<span className="text-white text-3xl font-black">M</span>
						</div>
					</div>

					{/* Brand Name with Gradient */}
					<div className="flex flex-col items-center gap-1 mt-4">
						<span className="text-3xl font-black bg-gradient-to-r from-[#E040A0] via-[#F080C0] to-[#7C52AA] bg-clip-text text-transparent tracking-wide">
							My Better Grade
						</span>
					</div>
				</div>
			)}

			{/* Main Login Screen */}
			<div className="flex flex-col bg-white min-h-screen">
				<div className="self-stretch bg-white flex-1 flex flex-col">
					<div className="flex items-stretch self-stretch flex-1 min-h-screen">
						<div className="flex flex-1 flex-col items-start pt-36"
							style={{
								background: "linear-gradient(180deg, #E040A099, #E040A000)"
							}}>
							<span className="text-white text-6xl font-bold w-[356px] mb-auto ml-16 mt-6" >
								{"Focus on\nwhat matters."}
							</span>
							<div className="w-[357px] h-[136px] mb-16 ml-16">
							</div>
						</div>
						<div className="flex flex-1 flex-col items-center justify-center bg-[#FEF7FF] py-[81px] gap-[50px]">
							<img
								src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/wQwYXX2xM2/34x7tigk_expires_30_days.png"}
								className="w-[90px] h-[110px] object-fill"
								alt="brand logo"
							/>
							<div className="flex flex-col items-center gap-10">
								<div className="flex flex-col items-start pr-[254px]">
									<div className="flex flex-col items-center pb-4">
										<span className="text-[#E040A0] text-2xl font-bold cursor-pointer" onClick={() => navigate("/")}>
											{"My Better Grade"}
										</span>
									</div>
									<span className="text-[#2E1A28] text-3xl font-bold" >
										{"Welcome back!"}
									</span>
									<div className="flex flex-col items-start pt-2">
										<span className="text-[#604868] text-base" >
											{"Please enter your details to sign in."}
										</span>
										{error && (
											<span className="text-red-500 text-sm font-bold mt-2">
												{error}
											</span>
										)}
									</div>
								</div>
								<div className="flex flex-col items-center pt-2 gap-6">
									<div className="flex flex-col items-start gap-2">
										<div className="flex flex-col items-start pr-[337px] ml-4">
											<span className="text-[#604868] text-sm font-bold" >
												{"Email Address"}
											</span>
										</div>
										<div className="flex items-center bg-[#FBF2FB] py-[17px] px-5 gap-[17px] rounded-[9999px] border border-solid border-[#DCC8E0] w-[420px]">
											<img
												src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/wQwYXX2xM2/4ajxz4oh_expires_30_days.png"}
												className="w-5 h-6 object-fill"
												alt="email"
											/>
											<input
												type="email"
												value={email}
												onChange={(e) => setEmail(e.target.value)}
												className="bg-transparent text-base text-[#2E1A28] outline-none w-full"
												placeholder="name@university.edu"
											/>
										</div>
									</div>
									<div className="flex flex-col items-start gap-2">
										<div className="flex items-center ml-4 w-[420px]">
											<span className="text-[#604868] text-sm font-bold mr-[250px]" >
												{"Password"}
											</span>
											<span className="text-[#0096CC] text-xs font-bold cursor-pointer" onClick={() => alert("Contact admin to reset password")}>
												{"Forgot?"}
											</span>
										</div>
										<div className="flex items-center bg-[#FBF2FB] py-[17px] px-5 rounded-[9999px] border border-solid border-[#DCC8E0] w-[420px]">
											<img
												src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/wQwYXX2xM2/20gfakqm_expires_30_days.png"}
												className="w-4 h-6 mr-[21px] object-fill"
												alt="password"
											/>
											<input
												type={showPassword ? "text" : "password"}
												value={password}
												onChange={(e) => setPassword(e.target.value)}
												className="bg-transparent text-base text-[#2E1A28] outline-none w-full"
												placeholder="••••••••"
											/>
											<button
												type="button"
												className="focus:outline-none text-[#604868] hover:text-[#E040A0] transition ml-2 shrink-0"
												onClick={() => setShowPassword(!showPassword)}
											>
												<svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
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
									<div className="flex items-center w-[420px]">
										<input type="checkbox" className="w-5 h-5 ml-4 mr-2" defaultChecked />
										<span className="text-[#604868] text-sm" >
											{"Remember me for 30 days"}
										</span>
									</div>
									<button className="flex items-center bg-[#E040A0] justify-center py-4 w-[420px] gap-2.5 rounded-[9999px] border-0 text-white font-bold text-lg cursor-pointer hover:bg-[#c03080] transition"
										style={{
											boxShadow: "0px 4px 16px #E040A033"
										}}
										onClick={handleLogin}>
										<span>{"Sign In"}</span>
										<img
											src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/wQwYXX2xM2/l4luhnlf_expires_30_days.png"}
											className="w-4 h-4 rounded-[9999px] object-fill"
											alt="arrow icon"
										/>
									</button>
								</div>
								<div className="flex flex-col items-center bg-[#FEF7FF] px-4">
									<span className="text-[#604868] text-xs font-bold" >
										{"OR CONTINUE WITH"}
									</span>
								</div>
								<div className="flex items-center gap-4">
									<button className="flex shrink-0 items-center bg-transparent text-left py-[13px] px-[67px] gap-3 rounded-[9999px] border border-solid border-[#DCC8E0]"
										onClick={() => alert("Pressed!")}>
										<img
											src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/wQwYXX2xM2/ys6yrnam_expires_30_days.png"}
											className="w-5 h-5 rounded-[9999px] object-fill"
											alt="google"
										/>
										<span className="text-[#2E1A28] text-sm font-bold" >
											{"Google"}
										</span>
									</button>
									<button className="flex shrink-0 items-center bg-transparent text-left py-[13px] px-[71px] gap-3 rounded-[9999px] border border-solid border-[#DCC8E0]"
										onClick={() => alert("Pressed!")}>
										<img
											src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/wQwYXX2xM2/qorhxdkl_expires_30_days.png"}
											className="w-5 h-5 rounded-[9999px] object-fill"
											alt="apple"
										/>
										<span className="text-[#2E1A28] text-sm font-bold" >
											{"Apple"}
										</span>
									</button>
								</div>
								<div className="flex flex-col items-center pt-2 cursor-pointer" onClick={() => navigate("/register")}>
									<span className="text-[#604868] text-base hover:underline" >
										{"Don't have an account? "}
										<strong className="text-[#E040A0] hover:underline font-bold">{"Create an account"}</strong>
									</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
