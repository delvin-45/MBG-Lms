import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Login() {
	const navigate = useNavigate();
	const { login } = useAuth();
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');

	const handleLogin = async () => {
		setError('');
		if (!email.trim() || !password) {
			setError("Email and Password cannot be empty");
			return;
		}

		try {
			const loggedUser = await login(email, password);
			if (loggedUser.role === 'admin') {
				navigate('/dashboard-admin');
			} else {
				navigate('/dashboard');
			}
		} catch (err) {
			setError(err.message || 'Login failed');
		}
	};

	return (
		<div className="flex flex-col bg-white min-h-screen">
			<div className="flex flex-col items-start self-stretch bg-white">
				<div className="flex justify-between items-center self-stretch py-6 px-8 mb-3">
					<span className="text-[#E040A0] text-3xl font-bold cursor-pointer" onClick={() => navigate("/")}>
						{"My Better Grade"}
					</span>
					<div className="flex shrink-0 items-center gap-[5px]">
						<span className="text-[#604868] text-sm font-bold" >
							{"Don't have an account?"}
						</span>
						<span className="text-[#E040A0] text-sm font-bold underline cursor-pointer" onClick={() => navigate("/register")}>
							{"Register"}
						</span>
					</div>
				</div>
				<div className="flex flex-col items-center self-stretch mb-8 mt-12">
					<div className="flex flex-col items-center bg-[#FFFFFFCC] p-8 md:p-[49px] gap-10 rounded-[48px] border border-solid border-[#E040A01A] w-full max-w-[500px] mx-auto"
						style={{
							boxShadow: "0px 20px 50px #E040A01A"
						}}>
						<div className="flex flex-col items-center gap-3 w-full text-center">
							<span className="text-[#2E1A28] text-4xl md:text-5xl font-bold" >
								{"Welcome Back"}
							</span>
							<span className="text-[#604868] text-base md:text-lg" >
								{"Log in to your academic profile."}
							</span>
							{error && (
								<span className="text-red-500 text-sm font-bold mt-2 self-center">
									{error}
								</span>
							)}
						</div>
						<div className="flex flex-col items-center gap-8 w-full">
							<div className="flex flex-col items-center gap-6 w-full">
								<div className="flex flex-col items-start gap-2 w-full">
									<span className="text-[#604868] text-sm font-bold pl-1" >
										{"Academic Email"}
									</span>
									<div className="flex items-center bg-[#FFFFFF80] py-4 px-5 gap-[18px] rounded-[9999px] border-2 border-solid border-[#DCC8E0] w-full">
										<img
											src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/wQwYXX2xM2/lypvtfbj_expires_30_days.png"}
											className="w-5 h-6 object-fill"
                                            alt="Email Icon"
										/>
										<input
											type="email"
											placeholder="you@university.edu"
											value={email}
											onChange={(e) => setEmail(e.target.value)}
											className="bg-transparent text-base text-[#2E1A28] outline-none w-full"
										/>
									</div>
								</div>
								<div className="flex flex-col items-start gap-2 w-full">
									<span className="text-[#604868] text-sm font-bold pl-1" >
										{"Password"}
									</span>
									<div className="flex items-center bg-[#FFFFFF80] py-4 px-5 gap-[22px] rounded-[9999px] border-2 border-solid border-[#DCC8E0] w-full">
										<img
											src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/wQwYXX2xM2/rtx2r47x_expires_30_days.png"}
											className="w-4 h-6 object-fill"
                                            alt="Password Icon"
										/>
										<input
											type="password"
											placeholder="Your password"
											value={password}
											onChange={(e) => setPassword(e.target.value)}
                                            onKeyDown={(e) => { if (e.key === 'Enter') handleLogin(); }}
											className="bg-transparent text-base text-[#2E1A28] outline-none w-full"
										/>
									</div>
								</div>
							</div>
							<button className="flex items-center justify-center bg-[#F080C0] py-[18px] w-full gap-[11px] rounded-[9999px] border-0 text-[#2E1A28] text-lg font-bold cursor-pointer hover:bg-[#E040A0] transition mt-2"
								style={{
									boxShadow: "0px 8px 20px #F080C04D"
								}}
								onClick={handleLogin}>
								<span>{"Log In"}</span>
								<img
									src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/wQwYXX2xM2/dzvb3lyq_expires_30_days.png"}
									className="w-4 h-4 rounded-[9999px] object-fill"
                                    alt="Login Arrow"
								/>
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
