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

      <h1 className="font-grand-local-header text-7xl lg:text-7xl tracking-tight text-center z-10 relative text-white leading-[90px] absolute top-[-40px] left-[15px]">
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
        className="w-26 h-auto z-10 absolute top-90 right-202"
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

    </main>
  );
}
