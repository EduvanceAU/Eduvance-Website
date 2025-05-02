"use client";
import Image from 'next/image';
import Link from "next/link";
import { useState, useEffect } from 'react';

// Reusable components
const TestimonialCard = ({ content, icon, headline, rotation }) => (
  <div className={`bg-gradient-to-r from-[#347BFF] to-[#2566E2] border border-white rounded-xl p-6 ${rotation} w-full md:w-110 mx-2 md:mx-0 h-full`}>
    <p className="text-white text-sm font-light leading-relaxed">
      {content}
    </p>
    <div className="flex items-center mt-4">
      <img src={icon} alt={headline} className="w-6 h-6 mr-2" />
      <h3 className="text-white font-semibold text-lg">{headline}</h3>
    </div>
  </div>
);

const ScrollingColumn = ({ direction, count = 9 }) => (
  <div className={`${direction} flex flex-col gap-2 items-center`}>
    {[...Array(count)].map((_, i) => (
      <img key={`first-${i}`} src="/Page.png" alt="note" className="w-55 h-auto" />
    ))}
    {[...Array(count)].map((_, i) => (
      <img key={`second-${i}`} src="/Page.png" alt="note" className="w-55 h-auto" />
    ))}
  </div>
);

export default function Home() {
  return (
    <main className="min-h-screen bg-white relative overflow-x-hidden">
      {/* Responsive Navigation */}
      <nav className="w-full h-[60px] flex justify-between items-center px-4 md:px-6 py-4 z-50 fixed top-0 left-0 bg-white bg-opacity-95">
        {/* Left Side: Logo and Name */}
        <div className="flex items-center gap-2">
          <Image src="/SmallLogo.png" alt="Eduvance" width={35} height={35} />
          <span className="font-grand-local text-2xl text-black">Eduvance</span>
        </div>
        
        {/* Center: Nav Links - Hidden on mobile, shown on larger screens */}
        <div className="hidden md:flex gap-5 flex-wrap justify-center">
          <Link href="#" className="text-[#555555] text-base poppins-semibold hover:text-black transition">
            About Edexcel
          </Link>
          <Link href="#" className="text-[#555555] text-base poppins-semibold hover:text-black transition">
            IAL Edexcel Resources
          </Link>
          <Link href="#" className="text-[#555555] text-base poppins-semibold hover:text-black transition">
            IGCSE Edexcel Resources
          </Link>
          <Link href="#" className="text-[#555555] text-base poppins-semibold hover:text-black transition">
            More
          </Link>
        </div>

        {/* Right Side: Join Now Button */}
        <div>
          <button className="bg-[#1871F2] text-white border-2 border-white px-4 py-1 rounded-[10px] hover:bg-blue-700 transition text-base poppins-semibold shadow-lg">
            Join Now
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="w-full min-h-screen flex flex-col relative pt-16">
        {/* Gradient Box in Background */}
        <div className="absolute top-[80px] w-[95vw] h-[85vh] bg-gradient-to-b from-[#4E8CFF] to-[#0C60FB] rounded-2xl shadow-xl z-0 left-1/2 transform -translate-x-1/2" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col items-center justify-center gap-12">

            <img src="Headline.png" className="w-[800px] h-auto relative top-[130px]" />

            <h3 className="font-semibold text-center z-10 relative text-white leading-[22px] absolute top-[80px] w-[550px] text-xl">
              Education drives progress. Eduvance helps you learn, revise, and stay ahead in your academic journey
            </h3>

            {/* Discord Button */}
            <a
              href="https://discord.gg/your-invite-code"
              target="_blank"
              rel="noopener noreferrer"
            >
              <button className="bg-[#FFFFFF] text-[#428CF9] border-5 border-[#639afe] px-9 py-4 rounded-[16px] text-xl poppins-semibold shadow-lg flex items-center gap-5 relative top-[70px]">
                <img src="/discordLogo.png" alt="Discord" className="w-9 h-auto" />
                Join our Discord Server
              </button>
            </a>

            <img
              src="bgCrypto.png"
              alt=" "
              className="w-300 h-auto relative top-[-550px] right-[20px]"
            />
            <img
              src="DocWidgets.png"
              alt=" "
              className="w-75 h-auto relative top-[-950px] right-[550px]"
            />
          </div>
        </div>
      </section>

      {/* Scrolling Papers Section */}
      <section className="w-full overflow-hidden py-16 relative top-[-1000px]">
        <div className="overflow-hidden h-[800px] w-full flex justify-center">
          <div className="flex flex-row gap-x-6 md:gap-x-12">
            <ScrollingColumn direction="scroll-up" />
            <ScrollingColumn direction="scroll-down" />
            <ScrollingColumn direction="scroll-up" />
            <ScrollingColumn direction="scroll-down" className="hidden md:flex" />
            <ScrollingColumn direction="scroll-up" className="hidden lg:flex" />
          </div>
        </div>
      </section>

      {/* Study Materials Section */}
      <section className="w-full py-24 relative top-[-1500px]">
        <div className="relative flex items-center justify-center text-center top-[-200px]">
          {/* Blurred Background */}
          <div className="w-[700px] h-[500px] rounded-full bg-white blur-2xl opacity-100 absolute" />

          {/* Heading + Button */}
          <div className="relative z-10 max-w-xl mx-auto">
            <h1
              className="text-4xl lg:text-5xl font-semibold tracking-[-0.05em] text-black"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              Study Materials to level up your revision
            </h1>

            <h3 className="mt-4 font-[600] text-[#878787] tracking-[-0.5px] text-xl" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Find revision resources for your Exam Board and Subject
            </h3>

            <Link href="/resources" className="inline-block mt-6">
              <button className="bg-[#2D74F8] text-[#FFFFFF] px-6 py-2 rounded-[50px] text-xl poppins-semibold shadow-lg flex items-center gap-2">
                Explore Resources
                <img src="/ArrowR.png" alt="Arrow Right" className="w-6 h-auto" />
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="w-full py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-block px-6 py-0.6 border-2 border-[#4B89FD] rounded-full text-black font-semibold tracking-[-0.7px] text-lg mb-8" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Trusted by +16,700 Students worldwide
            </div>
            
            <h1 className="font-semibold text-5xl tracking-[-2px] max-w-[550px] mx-auto" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Complete Academic Support Ecosystem
            </h1>
            
            <h3 className="font-medium text-[21px] tracking-[-0.7px] leading-[20px] max-w-[520px] mx-auto mt-8" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Connect instantly with like-minded learners. Ask questions, share resources, and stay motivated — all in one place
            </h3>
            
            <a
              href="https://discord.gg/your-invite-code"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-8"
            >
              <button className="bg-[#3F82FD] text-white border-5 border-[#B1CCFF] border-opacity-50 px-9 py-3 rounded-full text-xl poppins-semibold flex items-center gap-5" style={{ fontFamily: 'Poppins, sans-serif' }}>
                <img src="/WhiteDiscordLogo.png" alt="Discord" className="w-9 h-auto" />
                Join the community
              </button>
            </a>
          </div>
          
          <div className="relative">
            <img src="QuotationMarks.png" className="w-[1200px] h-auto mx-auto absolute top-[-50px] left-1/2 transform -translate-x-1/2" />
            
            <div className="flex flex-col lg:flex-row gap-[-100px] items-stretch justify-center mt-24">
              <TestimonialCard 
                content="Partnering with 00Pixel completely transformed our online presence. They didn't just deliver a beautiful website—they created a high-performance platform that drives real results. Within three months, our conversions increased by 35%, and the site is optimised to keep that momentum going. If you're looking for a team that combines design with strategy, 00Pixel is the way to go!"
                icon="/icon1.png"
                headline="Headline 1"
                rotation="rotate-[-2deg]"
              />
              
              <TestimonialCard 
                content="We were struggling to find a web partner who understood our vision—until we found 00Pixel. They built a website that not only looks amazing but is also designed to attract and convert. Since launching, our client inquiries have doubled, and we're seeing a clear return on investment. Their ability to balance creativity with business goals is rare and invaluable!"
                icon="/icon2.png"
                headline="Headline 2"
                rotation="rotate-[1deg]"
              />
              
              <TestimonialCard 
                content="Our website was outdated and failing to generate leads—00Pixel changed everything. From the start, they focused on creating a user-friendly experience while ensuring the backend was optimised for growth. We've seen a 40% increase in lead generation and a more seamless process for our customers. If you want a team that's as invested in your success as you are, 00Pixel is it!"
                icon="/icon3.png"
                headline="Headline 3"
                rotation="rotate-[-1.5deg]"
              />
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer Section */}
      <footer className="w-full bg-[#357BFD] pt-24 pb-8 mt-24">
        <div className="container mx-auto px-4 relative">
          <img src="EduvanceFooter.png" className="h-auto w-[1300px] max-w-full mx-auto mb-16" />

          <div className="rounded-2xl p-6 w-full max-w-[1350px] mx-auto h-auto lg:h-[500px] bg-gradient-to-b from-[#FFFFFF] via-[#FAFCFF] to-[#357BFD] flex flex-col lg:flex-row gap-8 shadow-[0px_-10px_30px_#357BFD40]">
            {/* Left Column */}
            <div className="w-full lg:w-1/3 flex flex-col items-start mt-[60px]">
              <img src="BiggerLogo.png" className="w-auto h-15 object-contain mb-4" />
              <p className="text-[#757575] text-base leading-5 tracking-tight font-medium" style={{ fontFamily: 'Poppins, sans-serif' }}>
                A growing student-led community built for learners across AS, A Levels, AP, and undergrad programs. From revision and learning resources to solving your doubts, we're here to make education easier, smarter, and more connected
              </p>
            </div>

            {/* Right Column - 3 Inner Columns */}
            <div className="w-full lg:w-2/3 grid grid-cols-1 sm:grid-cols-3 gap-1 mt-[70px]">
              {/* Column 1 */}
              <div className="flex flex-col">
                <h3 className="text-black tracking-[-0.6px] text-lg font-[550] mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>Navigation</h3>
                <a href="#" className="text-[#757575] tracking-[-0.5px] font-medium" style={{ fontFamily: 'Poppins, sans-serif' }}>Home</a>
                <a href="#" className="text-[#757575] tracking-[-0.5px] font-medium" style={{ fontFamily: 'Poppins, sans-serif' }}>Resources</a>
                <a href="#" className="text-[#757575] tracking-[-0.5px] font-medium" style={{ fontFamily: 'Poppins, sans-serif' }}>Past Papers</a>
                <a href="#" className="text-[#757575] tracking-[-0.5px] font-medium" style={{ fontFamily: 'Poppins, sans-serif' }}>Match with a Tutor</a>
                <a href="#" className="text-[#757575] tracking-[-0.5px] font-medium" style={{ fontFamily: 'Poppins, sans-serif' }}>About</a>
                <a href="#" className="text-[#757575] tracking-[-0.5px] font-medium" style={{ fontFamily: 'Poppins, sans-serif' }}>Community</a>
              </div>

              {/* Column 2 */}
              <div className="flex flex-col">
                <h3 className="text-black tracking-[-0.6px] text-lg font-[550] mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>Legal Info</h3>
                <a href="#" className="text-[#757575] tracking-[-0.5px] font-medium" style={{ fontFamily: 'Poppins, sans-serif' }}>Community Guidelines</a>
                <a href="#" className="text-[#757575] tracking-[-0.5px] font-medium" style={{ fontFamily: 'Poppins, sans-serif' }}>Terms of Services</a>
                <a href="#" className="text-[#757575] tracking-[-0.5px] font-medium" style={{ fontFamily: 'Poppins, sans-serif' }}>Privacy Policy</a>
              </div>

              {/* Column 3 */}
              <div className="flex flex-col">
                <h3 className="text-black tracking-[-0.6px] text-lg font-[550] mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>Join the Community</h3>
                <a href="" className="text-[#757575] tracking-[-0.5px] font-medium" style={{ fontFamily: 'Poppins, sans-serif' }}>Join the Discord Server</a>
                <a href="#" className="text-[#757575] tracking-[-0.5px] font-medium" style={{ fontFamily: 'Poppins, sans-serif' }}>Become a community contributor</a>
                <a href="#" className="text-[#757575] tracking-[-0.5px] font-medium" style={{ fontFamily: 'Poppins, sans-serif' }}>Become a tutor</a>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col lg:flex-row justify-between items-center mt-8">
            <img src="DocsFooter.png" className="h-auto w-[350px] max-w-full mb-8 lg:mb-0" />
            <img src="CardWidgets.png" className="h-auto w-[425px] max-w-full" />
          </div>
        </div>
      </footer>
    </main>
  );
}