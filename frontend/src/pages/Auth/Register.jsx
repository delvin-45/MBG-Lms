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
		<div className="flex flex-col bg-white">
			<div className="flex flex-col items-start self-stretch bg-white">
				<div className="flex justify-between items-center self-stretch py-6 px-8 mb-3">
					<span className="text-[#E040A0] text-3xl font-bold cursor-pointer" onClick={()=>navigate("/")}>
						{"My Better Grade"}
					</span>
					<div className="flex shrink-0 items-center gap-[5px]">
						<span className="text-[#604868] text-sm font-bold" >
							{"Already have an account?"}
						</span>
						<span className="text-[#E040A0] text-sm font-bold underline cursor-pointer" onClick={()=>navigate("/login")}>
							{"Log in"}
						</span>
					</div>
				</div>
				<div className="flex flex-col items-center self-stretch mb-8">
					<div className="flex flex-col items-start bg-[#FFFFFFCC] p-[49px] gap-10 rounded-[48px] border border-solid border-[#E040A01A]" 
						style={{
							boxShadow: "0px 20px 50px #E040A01A"
						}}>
						<div className="flex flex-col items-center gap-3">
							<div className="flex flex-col items-start px-[91px]">
								<span className="text-[#2E1A28] text-5xl font-bold" >
									{"Join MBG Learning"}
								</span>
							</div>
							<div className="flex flex-col items-start px-[73px]">
								<span className="text-[#604868] text-lg" >
									{"Create your premium academic profile in seconds."}
								</span>
								{error && (
									<span className="text-red-500 text-sm font-bold mt-2 self-center">
										{error}
									</span>
								)}
							</div>
						</div>
						<div className="flex flex-col items-center gap-8">
							<div className="flex flex-col items-start pt-0.5 gap-[18px]">
								<span className="text-[#604868] text-sm font-bold ml-1 mr-[508px]" >
									{"I AM A..."}
								</span>
								<div className="flex items-center gap-4">
									<div 
										className={`flex flex-col shrink-0 items-center py-[26px] px-[65px] gap-3 rounded-[32px] border-2 border-solid cursor-pointer hover:border-[#E040A0] transition ${role === 'student' ? 'border-[#E040A0] bg-[#FEF7FF]' : 'border-[#DCC8E0] bg-white'}`}
										onClick={() => setRole('student')}
									>
										<img
											src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/wQwYXX2xM2/p5244a9y_expires_30_days.png"} 
											className="w-14 h-14 rounded-[32px] object-fill"
										/>
										<div className="flex flex-col items-center">
											<div className="flex flex-col items-start px-[38px]">
												<span className="text-[#2E1A28] text-lg font-bold" >
													{"Student"}
												</span>
											</div>
											<span className="text-[#604868] text-xs" >
												{"Track grades & ace exams"}
											</span>
										</div>
									</div>
									<div 
										className={`flex flex-col shrink-0 items-center py-[26px] px-[63px] gap-3 rounded-[32px] border-2 border-solid cursor-pointer hover:border-[#E040A0] transition ${role === 'teacher' ? 'border-[#E040A0] bg-[#FEF7FF]' : 'border-[#DCC8E0] bg-white'}`}
										onClick={() => setRole('teacher')}
									>
										<img
											src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/wQwYXX2xM2/raqjkfpt_expires_30_days.png"} 
											className="w-14 h-14 rounded-[32px] object-fill"
										/>
										<div className="flex flex-col items-center">
											<div className="flex flex-col items-start px-[41px]">
												<span className="text-[#2E1A28] text-lg font-bold" >
													{"Teacher"}
												</span>
											</div>
											<span className="text-[#604868] text-xs" >
												{"Manage courses & insights"}
											</span>
										</div>
									</div>
								</div>
							</div>
							<div className="flex items-center gap-6">
								<div className="flex flex-col shrink-0 items-center gap-2">
									<div className="flex flex-col items-start pl-1 pr-[199px]">
										<span className="text-[#604868] text-sm font-bold" >
											{"First Name"}
										</span>
									</div>
									<input
										placeholder={"E.g. Seraphina"}
										value={firstName}
										onChange={(event)=>setFirstName(event.target.value)}
										className="text-[#2E1A28] bg-[#FFFFFF80] text-base py-[17px] px-[22px] rounded-[9999px] border-2 border-solid border-[#DCC8E0] w-[270px] outline-none"
									/>
								</div>
								<div className="flex flex-col shrink-0 items-center gap-2">
									<div className="flex flex-col items-start pl-1 pr-[200px]">
										<span className="text-[#604868] text-sm font-bold" >
											{"Last Name"}
										</span>
									</div>
									<input
										placeholder={"E.g. Sterling"}
										value={lastName}
										onChange={(event)=>setLastName(event.target.value)}
										className="text-[#2E1A28] bg-[#FFFFFF80] text-base py-[17px] px-[22px] rounded-[9999px] border-2 border-solid border-[#DCC8E0] w-[270px] outline-none"
									/>
								</div>
							</div>
							<div className="flex flex-col items-center gap-6">
								<div className="flex flex-col items-center gap-2">
									<div className="flex flex-col items-start pl-1 pr-[462px]">
										<span className="text-[#604868] text-sm font-bold" >
											{"Academic Email"}
										</span>
									</div>
									<div className="flex items-center bg-[#FFFFFF80] py-4 px-5 gap-[18px] rounded-[9999px] border-2 border-solid border-[#DCC8E0] w-[560px]">
										<img
											src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/wQwYXX2xM2/lypvtfbj_expires_30_days.png"} 
											className="w-5 h-6 object-fill"
										/>
										<input
											type="email"
											placeholder="you@university.edu"
											value={email}
											onChange={(e)=>setEmail(e.target.value)}
											className="bg-transparent text-base text-[#2E1A28] outline-none w-full"
										/>
									</div>
								</div>
								<div className="flex flex-col items-center gap-2">
									<div className="flex flex-col items-start pl-1 pr-[507px]">
										<span className="text-[#604868] text-sm font-bold" >
											{"Password"}
										</span>
									</div>
									<div className="flex items-center bg-[#FFFFFF80] py-4 px-5 gap-[22px] rounded-[9999px] border-2 border-solid border-[#DCC8E0] w-[560px]">
										<img
											src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/wQwYXX2xM2/rtx2r47x_expires_30_days.png"} 
											className="w-4 h-6 object-fill"
										/>
										<input
											type="password"
											placeholder="Min. 8 characters"
											value={password}
											onChange={(e)=>setPassword(e.target.value)}
											className="bg-transparent text-base text-[#2E1A28] outline-none w-full"
										/>
									</div>
								</div>
							</div>
							<div className="flex items-start px-2 gap-3 w-[560px]">
								<input type="checkbox" className="w-5 h-5" defaultChecked />
								<div className="flex flex-col shrink-0 items-start pr-[79px]">
									<span className="text-[#604868] text-xs" >
										{"I agree to the Terms of Service and Privacy Policy. I understand this is a premium educational environment."}
									</span>
								</div>
							</div>
							<button className="flex items-center justify-center bg-[#F080C0] py-[18px] w-[560px] gap-[11px] rounded-[9999px] border-0 text-[#2E1A28] text-lg font-bold" 
								style={{
									boxShadow: "0px 8px 20px #F080C04D"
								}}
								onClick={handleRegister}>
								<span>{"Create Account"}</span>
								<img
									src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/wQwYXX2xM2/dzvb3lyq_expires_30_days.png"} 
									className="w-4 h-4 rounded-[9999px] object-fill"
								/>
							</button>
						</div>
					</div>
				</div>
				<div className="flex flex-col items-center self-stretch">
					<div className="flex flex-col items-start px-48">
						<span className="text-[#604868] text-sm" >
							{"Empowering over 50,000 students globally."}
						</span>
					</div>
				</div>
				<div className="flex items-start ml-[138px]">
					<div className="w-32 h-16 mr-[216px]">
					</div>
					<span className="text-[#907898] text-xs font-bold mt-4 mr-[27px] cursor-pointer" onClick={()=>navigate("/")}>
						{"HELP CENTER"}
					</span>
					<span className="text-[#907898] text-xs font-bold mt-4 mr-[26px] cursor-pointer" onClick={()=>navigate("/")}>
						{"SYSTEM STATUS"}
					</span>
					<span className="text-[#907898] text-xs font-bold mt-4 cursor-pointer" onClick={()=>navigate("/")}>
						{"SECURITY"}
					</span>
				</div>
			</div>
		</div>
	)
}
