import React from "react";
import { useNavigate } from "react-router-dom";

export default function HomeLandingPage() {
	const navigate = useNavigate();
	return (
		<div className="flex flex-col bg-white">
			<div className="self-stretch bg-white">
				<div className="flex justify-between items-center self-stretch bg-[#FFFFFFCC] pt-[18px] pb-[19px] px-6">
					<div className="flex shrink-0 items-center">
						<img
							src={"/logo.png"}
							alt="MBG Logo"
							className="w-9 h-11 mr-3 object-contain transition-transform duration-300 hover:scale-105"
						/>
						<span className="text-[#E040A0] text-2xl font-bold mr-14" >
							{"My Better Grade"}
						</span>
					</div>
					<div className="flex shrink-0 items-center">
						<span
							className="text-[#E040A0] text-base font-bold mr-[41px] cursor-pointer"
							onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
						>
							{"Home"}
						</span>
						<span
							className="text-[#604868] hover:text-[#E040A0] text-base mr-10 cursor-pointer"
							onClick={() => navigate("/login")}
						>
							{"Courses"}
						</span>
						<span
							className="text-[#604868] hover:text-[#E040A0] text-base mr-[41px] cursor-pointer"
							onClick={() => window.scrollTo({ top: 1200, behavior: 'smooth' })}
						>
							{"About"}
						</span>
						<span
							className="text-[#604868] hover:text-[#E040A0] text-base cursor-pointer"
							onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
						>
							{"Contact"}
						</span>
					</div>
					<button className="flex flex-col shrink-0 items-start bg-[#E040A0] text-left py-2.5 px-8 border-0 hover:bg-[#c03080] transition rounded-full"
						style={{
							boxShadow: "0px 4px 6px #E040A040"
						}}
						onClick={() => navigate("/login")}>
						<span className="text-white text-base font-bold" >
							{"Get Started"}
						</span>
					</button>
				</div>
				<div className="flex flex-col self-stretch mb-[168px]">
					<div className="self-stretch bg-[#00000000] pt-16 mb-[1px]">
						<div className="flex flex-col lg:flex-row items-center self-stretch mb-[49px] mx-6 gap-16">
							<div className="flex flex-1 flex-col items-start pr-3">
								<button className="flex items-center bg-[#E040A01A] text-left py-1.5 px-4 gap-2 border-0 rounded-full"
									onClick={() => alert("Pressed!")}>
									<span className="w-2.5 h-2.5 rounded-full bg-[#E040A0] animate-pulse inline-block"></span>
									<span className="text-[#E040A0] text-xs font-bold" >
										{"THE PREMIUM LEARNING EXPERIENCE"}
									</span>
								</button>
								<div className="flex flex-col items-start self-stretch pt-8">
									<span className="text-[#2E1A28] text-5xl md:text-7xl font-bold w-full max-w-[521px]" >
										{"Study Smarter,\nGet Better\nGrades."}
									</span>
								</div>
								<div className="flex flex-col items-start self-stretch pt-8">
									<span className="text-[#604868] text-lg w-full max-w-[473px]" >
										{"Elevate your academic journey with a refined platform\ndesigned for excellence. Track your progress, master new\nskills, and achieve your goals with Luxe Learning tools."}
									</span>
								</div>
								<div className="flex flex-col items-center pt-8">
									<div className="flex flex-col items-center pt-2">
										<button className="flex flex-col items-start bg-[#E040A0] text-left py-4 px-10 border-0 hover:bg-[#c03080] transition rounded-full"
											style={{
												boxShadow: "0px 8px 10px #E040A040"
											}}
											onClick={() => navigate("/register")}>
											<span className="text-white text-base font-bold" >
												{"Start Learning Today"}
											</span>
										</button>
									</div>
								</div>
							</div>
							<div className="flex flex-1 flex-col items-start pl-3">
								<button className="flex flex-col w-full items-start bg-[#FFFFFF00] text-left p-3 rounded-[48px] border-[12px] border-solid border-[#FFFFFF80]"
									style={{
										boxShadow: "0px 25px 50px #00000040"
									}}
									onClick={() => alert("Pressed!")}>
									<div className="flex flex-col w-full items-start bg-cover bg-center h-[400px] md:h-[512px] justify-end p-6 rounded-[48px]"
										style={{
											backgroundImage: 'url("/Student studying.png")',
										}}
									>
										<img
											src={"/Container.png"}
											alt="Goal Reached Container"
											className="mb-4 object-contain max-w-[260px] md:max-w-[320px] drop-shadow-2xl hover:scale-105 transition-transform duration-300"
										/>
									</div>
								</button>
							</div>
						</div>
						<div className="self-stretch bg-[#E040A0] h-[37px] mb-2.5">
						</div>
					</div>
					<div className="flex justify-between items-center self-stretch mb-[191px] mx-6">
						<div className="w-[141px] h-[60px]">
						</div>
						<div className="w-[101px] h-[60px]">
						</div>
						<div className="w-[135px] h-[60px]">
						</div>
						<div className="w-[171px] h-[60px]">
						</div>
					</div>
					<div className="flex flex-col lg:flex-row items-center self-stretch mb-[156px] mx-6 gap-16">
						<div className="flex flex-1 flex-col items-start py-[1px] gap-[31px]">
							<div className="flex flex-col items-start self-stretch">
								<span className="text-[#2E1A28] text-4xl md:text-5xl font-bold w-full max-w-[512px]" >
									{"Your Education,\nBeautifully Organized."}
								</span>
							</div>
							<div className="flex flex-col self-stretch">
								<span className="text-[#604868] text-lg w-full max-w-[500px]" >
									{"A centralized ecosystem for all your lectures, notes, and study\nmaterials. Our intuitive dashboard provides a cinematic view of your\nacademic universe."}
								</span>
							</div>
							<button className="flex flex-col items-start bg-[#E040A0] text-left py-3 px-8 border-0 rounded-full"
								onClick={() => navigate("/my-courses")}>
								<span className="text-white text-base font-bold" >
									{"Explore Features"}
								</span>
							</button>
						</div>
						<img
							src={"/02.png"}
							alt="Your Education Organized"
							className="flex-1 w-full md:w-auto h-auto md:h-[524px] object-contain rounded-[32px] shadow-xl hover:shadow-2xl transition-all duration-300"
						/>
					</div>
					<div className="flex flex-col lg:flex-row items-center self-stretch bg-[#FBF2FB] py-12 md:py-24 px-6 mb-[76px] gap-16">
						<div className="flex-1 w-full bg-[#FFFFFF00] p-[41px] rounded-[48px]"
							style={{
								boxShadow: "0px 8px 10px #0000001A"
							}}>
							<div className="flex justify-between items-center self-stretch mb-[23px]">
								<span className="text-[#2E1A28] text-xl font-bold" >
									{"Study Progress"}
								</span>
								<span className="text-[#7C52AA] text-base font-bold" >
									{"85%"}
								</span>
							</div>
							<div className="items-start self-stretch bg-[#7C52AA1A] mb-6 ">
								<div className="bg-[#7C52AA] w-[375px] h-3 ">
								</div>
							</div>
							<div className="flex justify-center items-center self-stretch gap-4">
								<div className="flex flex-col shrink-0 items-start bg-[#FEF7FF] py-[19px] px-5 gap-[3px] rounded-2xl">
									<div className="flex flex-col items-start pr-[81px]">
										<span className="text-[#604868] text-xs font-bold" >
											{"HOURS STUDIED"}
										</span>
									</div>
									<div className="flex flex-col items-start pr-[116px]">
										<span className="text-[#2E1A28] text-2xl font-bold" >
											{"124.5"}
										</span>
									</div>
								</div>
								<div className="flex flex-col shrink-0 items-start bg-[#FEF7FF] py-[19px] px-5 gap-[3px] rounded-2xl">
									<div className="flex flex-col items-start pr-[89px]">
										<span className="text-[#604868] text-xs font-bold" >
											{"QUIZZES DONE"}
										</span>
									</div>
									<div className="flex flex-col items-start pr-[146px]">
										<span className="text-[#2E1A28] text-2xl font-bold" >
											{"42"}
										</span>
									</div>
								</div>
							</div>
						</div>
						<div className="flex flex-1 flex-col items-start pt-[1px]">
							<div className="flex flex-col items-start bg-[#7C52AA1A] py-1 px-4 mb-[31px] rounded-full">
								<span className="text-[#7C52AA] text-xs font-bold" >
									{"SMART TRACKING"}
								</span>
							</div>
							<div className="flex flex-col items-start self-stretch pt-[1px] mb-8">
								<span className="text-[#2E1A28] text-5xl font-bold" >
									{"Monitor Your Growth."}
								</span>
							</div>
							<div className="flex flex-col items-start self-stretch mb-[30px]">
								<span className="text-[#604868] text-lg w-full max-w-[510px]" >
									{"Dynamic milestone tracking that visualizes your academic path and\nkeeps you motivated every step of the way. Identify strengths and\nimprove focus areas."}
								</span>
							</div>
							<div className="flex items-center py-[1px] gap-[9px] cursor-pointer group" onClick={() => navigate("/academic-progress")}>
								<span className="text-[#7C52AA] text-lg font-bold group-hover:underline" >
									{"View My Progress"}
								</span>
								<svg className="w-5 h-5 text-[#7C52AA] transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
								</svg>
							</div>
						</div>
					</div>
					<div className="flex flex-col items-center self-stretch bg-[#FDF2F5] py-16 md:py-[93px] px-6 md:px-48 mb-[135px] gap-8">
						<svg className="w-12 h-9 text-[#E040A0] opacity-80" fill="currentColor" viewBox="0 0 32 32">
							<path d="M10 8c-3.3 0-6 2.7-6 6v10h10V14H6c0-2.2 1.8-4 4-4V8zm16 0c-3.3 0-6 2.7-6 6v10h10V14h-8c0-2.2 1.8-4 4-4V8z"/>
						</svg>
						<div className="flex flex-col items-center self-stretch pt-[7px]">
							<span className="text-[#2E1A28] text-3xl md:text-5xl font-bold text-center w-full max-w-[776px]" >
								{"\"The beautiful thing about learning is\nthat no one can take it away from\nyou.\""}
							</span>
						</div>
						<div className="flex flex-col items-center self-stretch">
							<span className="text-[#604868] text-xl font-bold" >
								{"— B.B. KING"}
							</span>
						</div>
					</div>
					<button className="flex flex-col items-center self-stretch text-left py-16 md:py-[95px] mx-6 rounded-[64px] border-0"
						style={{
							background: "linear-gradient(180deg, #F080C0, #E040A0)"
						}}
						onClick={() => navigate("/register")}>
						<div className="flex flex-col items-center gap-10 px-6">
							<span className="text-white text-4xl md:text-6xl font-bold text-center" >
								{"Ready to Outshine?"}
							</span>
							<span className="text-white text-lg md:text-xl text-center w-full max-w-[552px]" >
								{"Join thousands of high-achievers who have transformed their grades\nand their futures with My Better Grade."}
							</span>
							<div className="flex flex-col items-start bg-white py-5 px-12 hover:bg-white/95 transition rounded-full"
								style={{
									boxShadow: "0px 8px 10px #0000001A"
								}}>
								<span className="text-[#E040A0] text-xl font-bold" >
									{"Join Learning"}
								</span>
							</div>
						</div>
					</button>
				</div>
				<div className="flex flex-col self-stretch bg-[#F2E8F2] pt-12 md:pt-20 pb-12 md:pb-[177px] px-6 gap-16">
					<div className="flex flex-col md:flex-row items-start self-stretch gap-16">
						<div className="flex-1 w-full">
							<div className="flex items-center self-stretch mb-[31px] gap-2">
								<img
									src={"/logo.png"}
									alt="MBG Logo"
									className="w-[21px] h-8 object-contain"
								/>
								<span className="text-[#E040A0] text-xl font-bold" >
									{"MBG"}
								</span>
							</div>
							<div className="flex flex-col items-start self-stretch mb-[30px]">
								<span className="text-[#604868] text-sm w-[215px]" >
									{"The world's most elegant learning\nmanagement system for the modern\nstudent."}
								</span>
							</div>
							<div className="flex items-center self-stretch py-[1px] gap-4">
							</div>
						</div>
						<div className="flex flex-1 flex-col pb-16 gap-8">
							<div className="flex flex-col items-start self-stretch">
								<span className="text-[#2E1A28] text-xs font-bold" >
									{"PLATFORM"}
								</span>
							</div>
							<div className="flex flex-col self-stretch gap-4">
								<div className="flex flex-col items-start self-stretch">
									<span className="text-[#604868] text-sm" >
										{"Features"}
									</span>
								</div>
								<div className="flex flex-col items-start self-stretch">
									<span className="text-[#604868] text-sm" >
										{"Integrations"}
									</span>
								</div>
								<div className="flex flex-col items-start self-stretch">
									<span className="text-[#604868] text-sm" >
										{"Solutions"}
									</span>
								</div>
							</div>
						</div>
						<div className="flex flex-1 flex-col pb-16 gap-8">
							<div className="flex flex-col items-start self-stretch">
								<span className="text-[#2E1A28] text-xs font-bold" >
									{"RESOURCES"}
								</span>
							</div>
							<div className="flex flex-col self-stretch gap-4">
								<div className="flex flex-col items-start self-stretch">
									<span className="text-[#604868] text-sm" >
										{"Documentation"}
									</span>
								</div>
								<div className="flex flex-col items-start self-stretch">
									<span className="text-[#604868] text-sm" >
										{"Student Guides"}
									</span>
								</div>
								<div className="flex flex-col items-start self-stretch">
									<span className="text-[#604868] text-sm" >
										{"Help Center"}
									</span>
								</div>
							</div>
						</div>
						<div className="flex flex-1 flex-col pb-[54px] gap-6">
							<div className="flex flex-col items-start self-stretch">
								<span className="text-[#2E1A28] text-xs font-bold" >
									{"STAY INSPIRED"}
								</span>
							</div>
							<div className="flex flex-col items-start self-stretch">
								<span className="text-[#604868] text-sm w-[197px]" >
									{"Stay updated with the latest in learning\nexcellence."}
								</span>
							</div>
							<div className="flex justify-between items-center self-stretch bg-white p-1.5 border border-solid border-[#DCC8E080] shadow-sm rounded-full">
								<span className="text-gray-400 text-sm ml-[20px]" >
									{"Your email address"}
								</span>
								<button className="w-9 h-8 mr-1 flex items-center justify-center bg-[#E040A0] rounded-full text-white hover:bg-[#c03080] transition">
									<svg className="w-4 h-4 transform -rotate-45 ml-0.5" fill="currentColor" viewBox="0 0 20 20">
										<path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"/>
									</svg>
								</button>
							</div>
						</div>
					</div>
					<div className="flex justify-between items-start self-stretch pt-[41px]">
						<span className="text-[#604868] text-[10px] font-bold" >
							{"© 2026 MY BETTER GRADE. DESIGNED FOR EXCELLENCE."}
						</span>
						<div className="flex shrink-0 items-center gap-8">
							<span className="text-[#604868] text-[10px] font-bold" >
								{"PRIVACY POLICY"}
							</span>
							<span className="text-[#604868] text-[10px] font-bold" >
								{"TERMS OF SERVICE"}
							</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
