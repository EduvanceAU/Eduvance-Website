"use client";
import Image from 'next/image';
import Link from "next/link";
import { useState, useEffect } from 'react';

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-white relative">

    <nav className="w-full flex justify-between items-center px-6 py-4 z-50 fixed top-0 left-0">
      
      {/* Left Side: Logo and Name */}
      <div className="flex items-center gap-2">
        <Image src="/SmallLogo.png" alt="Eduvance" width={35} height={35} />
        <span className="font-grand-local text-2xl text-black">Eduvance</span>
      </div>

      {/* Center: Nav Links */}
      <div className="flex gap-5">
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

      {/* Gradient Box in Background */}
      <div className="absolute w-[95vw] h-[85vh] bg-gradient-to-b from-[#679CFF] to-[#0C60FB] rounded-2xl shadow-xl z-0" />

      <h1 className="font-grand-local-header text-7xl lg:text-7xl tracking-tight text-center z-10 relative text-white leading-[90px] absolute top-[-20px] left-[15px]">
        Advancing with
        <br />
        ‎ ‎ ‎ ducation
      </h1>

      <h3 className="poppins-semibold text-center z-10 absolute text-white leading-[22px] absolute top-[490px] left-[480px] w-[450px]">
      Education drives progress. Eduvance helps you learn, revise, and stay ahead in your academic journey
      </h3>

      <img
        src="/Logo1.png"
        alt="Eduvance"
        className="w-26 h-auto z-10 absolute top-[360px] left-[510px]"
      />

      <img
        src="Box.png"
        alt=" "
        className="w-180 h-auto z-10 absolute top-[250px] left-1/2 transform -translate-x-1/2"
      />

      <img
        src="DocWidgets.png"
        alt=" "
        className="w-60 h-auto z-10 absolute top-[550px] right-[1150px]"
      />

      <img
        src="bgCrypto.png"
        alt=" "
        className="w-300 h-auto z-10 absolute top-[50px] right-[120px]"
      />

      <a
        href="https://discord.gg/your-invite-code"
        target="_blank"
        rel="noopener noreferrer"
        className="absolute top-[560px] right-[540px]"
      >
        <button className="bg-[#FFFFFF] text-[#428CF9] border-5 border-[#639afe] px-9 py-4 rounded-[16px] text-xl poppins-semibold shadow-lg flex items-center gap-5">
          <img src="/discordLogo.png" alt="Discord" className="w-9 h-auto" />
          Join our Discord Server
        </button>
      </a>

      <div className="absolute top-[240px] right-[450px] flex flex-wrap gap-6 z-10 text-white text-sm poppins-semibold">
        <span>Student Community</span>
        <span>Subject Support</span>
        <span>Revision Guides</span>
        <span>Expert Resources</span>
      </div>

      <div className="overflow-hidden h-[800px] w-full flex justify-center absolute top-[800px]">
        <div className="flex flex-row gap-x-12">
          
          {/* Column 1 - Scroll Up */}
          <div className="scroll-up flex flex-col gap-2 items-center">
            {[...Array(9)].map((_, i) => (
              <img key={i} src="/Page.png" alt="note" className="w-55 h-auto" />
            ))}

            {[...Array(9)].map((_, i) => (
              <img key={i} src="/Page.png" alt="note" className="w-55 h-auto" />
            ))}
          </div>

          {/* Column 2 - Scroll Down */}
          <div className="scroll-down flex flex-col gap-2 items-center">
            {[...Array(9)].map((_, i) => (
              <img key={i} src="/Page.png" alt="note" className="w-55 h-auto" />
            ))}

            {[...Array(9)].map((_, i) => (
              <img key={i} src="/Page.png" alt="note" className="w-55 h-auto" />
            ))}
          </div>

          {/* Column 3 - Scroll Up */}
          <div className="scroll-up flex flex-col gap-2 items-center">
            {[...Array(9)].map((_, i) => (
              <img key={i} src="/Page.png" alt="note" className="w-55 h-auto" />
            ))}

            {[...Array(9)].map((_, i) => (
              <img key={i} src="/Page.png" alt="note" className="w-55 h-auto" />
            ))}
          </div>

          {/* Column 4 - Scroll Down */}
          <div className="scroll-down flex flex-col gap-2 items-center">
            {[...Array(9)].map((_, i) => (
              <img key={i} src="/Page.png" alt="note" className="w-55 h-auto" />
            ))}

            {[...Array(9)].map((_, i) => (
              <img key={i} src="/Page.png" alt="note" className="w-55 h-auto" />
            ))}
          </div>

          {/* Column 5 - Scroll Up */}
          <div className="scroll-up flex flex-col gap-2 items-center">
            {[...Array(9)].map((_, i) => (
              <img key={i} src="/Page.png" alt="note" className="w-55 h-auto" />
            ))}

            {[...Array(9)].map((_, i) => (
              <img key={i} src="/Page.png" alt="note" className="w-55 h-auto" />
            ))}
          </div>

        </div>
      </div>

      <div className="inset-0 flex items-center justify-center absolute top-[1200px]">
        <div className="w-[700px] h-[500px] rounded-full bg-white blur-2xl opacity-100 absolute" />

        <h1
          className="text-5xl font-semibold tracking-[-0.05em] z-10 text-black w-[400px] absolute left-[450px]"
          style={{ fontFamily: 'Poppins, sans-serif' }}
        >
          Study Materials to level up your revision
        </h1>

        <img src="Tags.png" alt="subjects" className="absolute w-35 h-auto z-10 top-[-25px] right-[550px]" />

        <h3 className="absolute top-[80px] left-[450px] font-semibold text-stone-500" style={{ fontFamily: 'Poppins, sans-serif' }}>
          Find revision resources for your Exam Board and Subject
        </h3>

        <Link
          href="/resources"
          className="absolute top-[120px] right-[450px]"
        >
          <button className="bg-[#2D74F8] text-[#FFFFFF] px-6 py-2 rounded-[50px] text-xl poppins-semibold shadow-lg flex items-center gap-2">
            Explore Resources
            <img src="/ArrowR.png" alt="Arrow Right" className="w-6 h-auto" />
          </button>
        </Link>
      </div>

      <div className="absolute top-[1700px] w-full flex flex-col items-center justify-center">
        <div className="px-6 py-0.6 border-2 border-[#4B89FD] rounded-full text-black flex items-center justify-center w-fit font-semibold tracking-[-0.7px] text-lg" style={{ fontFamily: 'Poppins, sans-serif' }}>
          Trusted by +16,700 Students worldwide
        </div>

        <h1 className="font-semibold text-5xl tracking-[-2px] text-center w-[550px] absolute top-[60px]" style={{ fontFamily: 'Poppins, sans-serif' }}>
          Complete Academic Support Ecosystem
        </h1>

        <h3 className="font-medium text-[21px] tracking-[-0.7px] leading-[20px] text-center w-[520px] absolute top-[190px]" style={{ fontFamily: 'Poppins, sans-serif' }}>
          Connect instantly with like-minded learners. Ask questions, share resources, and stay motivated — all in one place
        </h3>

        <a
          href="https://discord.gg/your-invite-code"
          target="_blank"
          rel="noopener noreferrer"
          className="absolute top-[250px] right-[540px]"
        >
          <button className="bg-[#3F82FD] text-[#428CF9] border-5 border-[#B1CCFF] border-opacity-50 px-9 py-3 rounded-full text-xl poppins-semibold flex items-center gap-5 text-[#FFFFFF]" style={{ fontFamily: 'Poppins, sans-serif' }}>
            <img src="/WhiteDiscordLogo.png" alt="Discord" className="w-9 h-auto" />
            Join the community
          </button>
        </a>

        <img src="QuotationMarks.png" className="w-[1200px] h-auto absolute top-[100px]"/>

        <div className="w-full flex justify-center absolute top-[450px]">
          <div className="flex gap-[-100px]">
            {/* Box 1 */}
            <div className="bg-gradient-to-r from-[#347BFF] to-[#2566E2] border border-white rounded-xl p-6 rotate-[-2deg] w-110 -mr-4">
              <p className="text-white text-sm font-light leading-relaxed">
                "Partnering with 00Pixel completely transformed our online presence. They didn’t just deliver a beautiful website—they created a high-performance platform that drives real results. Within three months, our conversions increased by 35%, and the site is optimised to keep that momentum going. If you're looking for a team that combines design with strategy, 00Pixel is the way to go!"
              </p>
              <div className="flex items-center mt-4">
                <img src="/icon1.png" alt="icon" className="w-6 h-6 mr-2" />
                <h3 className="text-white font-semibold text-lg">Headline 1</h3>
              </div>
            </div>

            {/* Box 2 */}
            <div className="bg-gradient-to-r from-[#347BFF] to-[#2566E2] border border-white rounded-xl p-6 rotate-[1deg] w-110 -mr-4">
              <p className="text-white text-sm font-light leading-relaxed">
                "We were struggling to find a web partner who understood our vision—until we found 00Pixel. They built a website that not only looks amazing but is also designed to attract and convert. Since launching, our client inquiries have doubled, and we’re seeing a clear return on investment. Their ability to balance creativity with business goals is rare and invaluable!"
              </p>
              <div className="flex items-center mt-4">
                <img src="/icon2.png" alt="icon" className="w-6 h-6 mr-2" />
                <h3 className="text-white font-semibold text-lg">Headline 2</h3>
              </div>
            </div>

            {/* Box 3 */}
            <div className="bg-gradient-to-r from-[#347BFF] to-[#2566E2] border border-white rounded-xl p-6 rotate-[-1.5deg] w-120">
              <p className="text-white text-sm font-light leading-relaxed">
                "Our website was outdated and failing to generate leads—00Pixel changed everything. From the start, they focused on creating a user-friendly experience while ensuring the backend was optimised for growth. We’ve seen a 40% increase in lead generation and a more seamless process for our customers. If you want a team that’s as invested in your success as you are, 00Pixel is it!"
              </p>
              <div className="flex items-center mt-4">
                <img src="/icon3.png" alt="icon" className="w-6 h-6 mr-2" />
                <h3 className="text-white font-semibold text-lg">Headline 3</h3>
              </div>
            </div>
          </div>
        </div>
        
        <div className="absolute top-[750px] w-full flex flex-col items-center justify-center bg-[#357BFD] w-full h-[800px]">
          <img src="EduvanceFooter.png" className="h-auto w-[1300px] absolute top-[100px] z-10"/>

          <div className="rounded-2xl p-6 w-full max-w-[1350px] mx-auto bg-gradient-to-b from-[#FFFFFF] via-[#FAFCFF] to-[#357BFD] flex flex-col md:flex-row gap-6 shadow-[0px_-10px_30px_#357BFD40]">
            {/* Left Column */}
            <div className="flex-1 flex flex-col items-start">
              <img src="/your-image-path.png" alt="Visual" className="w-32 h-32 object-contain mb-4" />
              <p className="text-[#153064] text-base leading-relaxed tracking-tight font-medium" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur luctus, nulla nec fermentum dictum, lorem justo feugiat justo, nec facilisis nulla tellus in sapien.
              </p>
            </div>

            {/* Right Column - 3 Inner Columns */}
            <div className="flex-[2] grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Column 1 */}
              <div className="flex flex-col">
                <h3 className="text-[#153064] text-lg font-semibold mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>Resources</h3>
                <a href="#" className="text-[#153064] hover:underline">Revision Notes</a>
                <a href="#" className="text-[#153064] hover:underline">Past Papers</a>
                <a href="#" className="text-[#153064] hover:underline">Mark Schemes</a>
              </div>

              {/* Column 2 */}
              <div className="flex flex-col">
                <h3 className="text-[#153064] text-lg font-semibold mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>Guides</h3>
                <a href="#" className="text-[#153064] hover:underline">Exam Tips</a>
                <a href="#" className="text-[#153064] hover:underline">Time Management</a>
                <a href="#" className="text-[#153064] hover:underline">Subject Strategies</a>
              </div>

              {/* Column 3 */}
              <div className="flex flex-col">
                <h3 className="text-[#153064] text-lg font-semibold mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>Community</h3>
                <a href="#" className="text-[#153064] hover:underline">Study Groups</a>
                <a href="#" className="text-[#153064] hover:underline">Discord Server</a>
                <a href="#" className="text-[#153064] hover:underline">Join Events</a>
              </div>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}
