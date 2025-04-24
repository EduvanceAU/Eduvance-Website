"use client";
import Image from 'next/image';
import Link from "next/link";
import { useState, useEffect } from 'react';

export default function Resources() {
  return (
    <main className="flex w-full h-screen">
      {/* Left Side */}
      <div className="w-1/2 flex items-center justify-center p-10">

      <img
        src="PagesWidget.png"
        alt=" "
        className="w-80 h-auto absolute top-[95px] left-[75px]"
      />

      <img
        src="Underline.png"
        alt=" "
        className="w-auto h-[15px] absolute top-[325px] left-[300px]"
      />

        <h1 className="text-4xl absolute top-[250px] left-[60px] font-semibold text-left leading-[40px] tracking-tighter w-[520px] z-10" style={{ fontFamily: 'Poppins, sans-serif' }}>
          Study materials to level up your exam prep and stay on track
        </h1>

        <h3 className="text-xl absolute top-[370px] left-[60px] font-[550] text-left text-stone-500 leading-[25px] tracking-[-0.015em] w-[640px] z-10" style={{ fontFamily: 'Poppins, sans-serif' }}>
        Our revision resources follow your exam specs closely and cover each topic with clarity. From bite-sized explanations and real exam tips to helpful visuals and examples, everything is built to make your revision smoother and more focused.
        </h3>

        <div className="flex flex-col items-start gap-y-5 absolute top-[500px] left-[60px]">
          <p className="text-xl font-[550] text-left text-stone-600 leading-[20px] tracking-tight w-[640px] z-10" style={{ fontFamily: 'Poppins, sans-serif'}}>✅ ‎‎Clear and concise for faster understanding</p>
          <p className="text-xl font-[550] text-left text-stone-600 leading-[20px] tracking-tight w-[640px] z-10" style={{ fontFamily: 'Poppins, sans-serif'}}>✅ ‎‎Matches your exam board topics</p>
          <p className="text-xl font-[550] text-left text-stone-600 leading-[20px] tracking-tight w-[640px] z-10" style={{ fontFamily: 'Poppins, sans-serif'}}>✅ ‎‎Helps you revise what really matters</p>
        </div>
      </div>

      {/* Right Side */}
      <div className="w-1/2 flex items-center justify-center p-10">
        <h1 className="text-4xl font-semibold text-left leading-[40px] tracking-tighter absolute top-[200px]" style={{ fontFamily: 'Poppins, sans-serif' }}>
          Browse Resources by Subject
        </h1>

        <div className="flex flex-col items-start gap-y-3 absolute top-[280px] left-[800px]">
        <button className="flex items-center justify-between w-[550px] px-6 py-4 bg-[#BAD1FD] rounded-[12px] group hover:bg-[#A8C6FF] transition-all duration-200 border-[#153064] border-1">
          <p
            className="text-xl font-[550] text-[#153064] leading-[20px] tracking-tight text-left"
            style={{ fontFamily: 'Poppins, sans-serif' }}
          >
            Physics Revision Resources
          </p>
          <img
            src="/BArrowR.png"
            alt="Arrow Right"
            className="w-6 h-auto group-hover:translate-x-1 transition-transform duration-200"
          />
        </button>

        <button className="flex items-center justify-between w-[550px] px-6 py-4 bg-[#BAD1FD] rounded-[12px] group hover:bg-[#A8C6FF] transition-all duration-200 border-[#153064] border-1">
          <p
            className="text-xl font-[550] text-[#153064] leading-[20px] tracking-tight text-left"
            style={{ fontFamily: 'Poppins, sans-serif' }}
          >
            Chemistry Revision Resources
          </p>
          <img
            src="/BArrowR.png"
            alt="Arrow Right"
            className="w-6 h-auto group-hover:translate-x-1 transition-transform duration-200"
          />
        </button>

        <button className="flex items-center justify-between w-[550px] px-6 py-4 bg-[#BAD1FD] rounded-[12px] group hover:bg-[#A8C6FF] transition-all duration-200 border-[#153064] border-1">
          <p
            className="text-xl font-[550] text-[#153064] leading-[20px] tracking-tight text-left"
            style={{ fontFamily: 'Poppins, sans-serif' }}
          >
            Biology Revision Resources
          </p>
          <img
            src="/BArrowR.png"
            alt="Arrow Right"
            className="w-6 h-auto group-hover:translate-x-1 transition-transform duration-200"
          />
        </button>

        <button className="flex items-center justify-between w-[550px] px-6 py-4 bg-[#BAD1FD] rounded-[12px] group hover:bg-[#A8C6FF] transition-all duration-200 border-[#153064] border-1">
          <p
            className="text-xl font-[550] text-[#153064] leading-[20px] tracking-tight text-left"
            style={{ fontFamily: 'Poppins, sans-serif' }}
          >
            Mathematics Revision Resources
          </p>
          <img
            src="/BArrowR.png"
            alt="Arrow Right"
            className="w-6 h-auto group-hover:translate-x-1 transition-transform duration-200"
          />
        </button>

        <button className="flex items-center justify-between w-[550px] px-6 py-4 bg-[#BAD1FD] rounded-[12px] group hover:bg-[#A8C6FF] transition-all duration-200 border-[#153064] border-1">
          <p
            className="text-xl font-[550] text-[#153064] leading-[20px] tracking-tight text-left"
            style={{ fontFamily: 'Poppins, sans-serif' }}
          >
            Psychology Revision Resources
          </p>
          <img
            src="/BArrowR.png"
            alt="Arrow Right"
            className="w-6 h-auto group-hover:translate-x-1 transition-transform duration-200"
          />
        </button>

        <button className="flex items-center justify-between w-[550px] px-6 py-4 bg-[#BAD1FD] rounded-[12px] group hover:bg-[#A8C6FF] transition-all duration-200 border-[#153064] border-1">
          <p
            className="text-xl font-[550] text-[#153064] leading-[20px] tracking-tight text-left"
            style={{ fontFamily: 'Poppins, sans-serif' }}
          >
            Geography Revision Resources
          </p>
          <img
            src="/BArrowR.png"
            alt="Arrow Right"
            className="w-6 h-auto group-hover:translate-x-1 transition-transform duration-200"
          />
        </button>
        </div>
      </div>
    </main>
  );
}
