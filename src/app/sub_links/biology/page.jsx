"use client";
import Image from 'next/image';
import Link from "next/link";
import { useState, useEffect } from 'react';

export default function Biology() {

  const [selected, setSelected] = useState('option1');

  return (
    <main className="flex w-full h-screen">
      <img src="/Bio_Banner.png" alt="Biology" className="w-full h-[210px]"/>

      <div className="absolute top-[300px] left-[100px] flex flex-col items-center gap-8">
        <h3 className="font-semibold text-2xl text-[#153064] tracking-[-1px] absolute top-[-50px] left-[1px]" style={{ fontFamily: 'Poppins, sans-serif' }}>
          Choose your exam board
        </h3>
        {/* Selection Bar */}
        <div className="flex rounded-[15px] bg-[#F2F6FF] border-[#153064] border-2 p-1 w-[1200px] h-[65px] justify-between">
          <button
            onClick={() => setSelected('option1')}
            className={`w-1/2 py-2 text-center rounded-[10px] transition-all ease-in-out duration-500 ${
              selected === 'option1' ? 'bg-[#D0E0FF] shadow-md font-semibold text-xl tracking-[-0.75px]' : ''
            }`} style={{ fontFamily: 'Poppins, sans-serif' }}
          >
            International A Levels
          </button>
          <button
            onClick={() => setSelected('option2')}
            className={`w-1/2 py-2 text-center rounded-[10px] transition-all ease-in-out duration-500 ${
              selected === 'option2' ? 'bg-[#D0E0FF] shadow-md font-semibold text-xl tracking-[-0.75px]' : 'bg transparent'
            }`} style={{ fontFamily: 'Poppins, sans-serif' }}
          >
            IGCSEs
            </button>
        </  div>
          
        {/* Conditional content below */}
        <div className="mt-10 transition-all duration-500 ease-in-out w-full flex justify-center">
          {selected === "option1" ? (
            <>
              <h3 className="font-semibold text-2xl text-[#153064] tracking-[-1px] absolute top-[90px] left-[1px]" style={{ fontFamily: 'Poppins, sans-serif' }}>
                IAL Biology Resources
              </h3>
          
              <div className="absolute top-[-20px] flex justify-center items-center space-x-8 mt-40">
                <Link href="/page1" className="w-95 h-40 bg-[#F2F6FF] rounded-xl border-[1.5px] border-[#153064] flex items-end justify-start pl-4 pb-4 text-[#153064] hover:bg-[#BAD1FD] transition-all duration-300 cursor-pointer">
                  Revision Notes
                </Link>
          
                <Link href="/page2" className="w-95 h-40 bg-[#F2F6FF] rounded-xl border-[1.5px] border-[#153064] flex items-end justify-start pl-4 pb-4 text-[#153064] hover:bg-[#BAD1FD] transition-all duration-300 cursor-pointer">
                  Exam Questions
                </Link>
          
                <Link href="/sub_links/biology/pastpapers" className="w-95 h-40 bg-[#F2F6FF] rounded-xl border-[1.5px] border-[#153064] flex items-end justify-start pl-4 pb-4 text-[#153064] hover:bg-[#BAD1FD] transition-all duration-300 cursor-pointer">
                  Past Papers
                </Link>
              </div>

              <Link href="/sub_links/psychology">
                <button className="absolute top-[320px] left-[-1px] flex items-center justify-between w-[1205px] px-6 py-4 bg-[#BAD1FD] rounded-[12px] group hover:bg-[#A8C6FF] transition-all duration-200 border-[#153064] border-1">
                  <p className="text-xl font-[550] text-[#153064] leading-[20px] tracking-tight text-left" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    International A Level Biology Course Overview
                  </p>
                </button>
              </Link>

              <Link href="/sub_links/psychology">
                <button className="absolute top-[390px] left-[-1px] flex items-center justify-between w-[1205px] px-6 py-4 bg-[#BAD1FD] rounded-[12px] group hover:bg-[#A8C6FF] transition-all duration-200 border-[#153064] border-1">
                  <p className="text-xl font-[550] text-[#153064] leading-[20px] tracking-tight text-left" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    International A Level Biology Course Specifications
                  </p>
                </button>
              </Link>
            </>
          ) : (
            <>
              <h3 className="font-semibold text-2xl text-[#153064] tracking-[-1px] absolute top-[90px] left-[1px]" style={{ fontFamily: 'Poppins, sans-serif' }}>
                IGCSE Biology Resources
              </h3>
          
              <div className="absolute top-[-20px] flex justify-center items-center space-x-8 mt-40">
                <Link href="/page1" className="w-95 h-40 bg-[#F2F6FF] rounded-xl border-[1.5px] border-[#153064] flex items-end justify-start pl-4 pb-4 text-[#153064] hover:bg-[#BAD1FD] transition-all duration-300 cursor-pointer">
                  Revision Notes
                </Link>
          
                <Link href="/page2" className="w-95 h-40 bg-[#F2F6FF] rounded-xl border-[1.5px] border-[#153064] flex items-end justify-start pl-4 pb-4 text-[#153064] hover:bg-[#BAD1FD] transition-all duration-300 cursor-pointer">
                  Exam Questions
                </Link>
          
                <Link href="/page3" className="w-95 h-40 bg-[#F2F6FF] rounded-xl border-[1.5px] border-[#153064] flex items-end justify-start pl-4 pb-4 text-[#153064] hover:bg-[#BAD1FD] transition-all duration-300 cursor-pointer">
                  Past Papers
                </Link>
              </div>

              <Link href="/sub_links/psychology">
                <button className="absolute top-[320px] left-[-1px] flex items-center justify-between w-[1205px] px-6 py-4 bg-[#BAD1FD] rounded-[12px] group hover:bg-[#A8C6FF] transition-all duration-200 border-[#153064] border-1">
                  <p className="text-xl font-[550] text-[#153064] leading-[20px] tracking-tight text-left" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    International GCSE Biology Course Overview
                  </p>
                </button>
              </Link>

              <Link href="/sub_links/psychology">
                <button className="absolute top-[390px] left-[-1px] flex items-center justify-between w-[1205px] px-6 py-4 bg-[#BAD1FD] rounded-[12px] group hover:bg-[#A8C6FF] transition-all duration-200 border-[#153064] border-1">
                  <p className="text-xl font-[550] text-[#153064] leading-[20px] tracking-tight text-left" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    International GCSE Biology Course Specifications
                  </p>
                </button>
              </Link>
            </>
          )}
        </div>

      </div>
    </main>
  );
}