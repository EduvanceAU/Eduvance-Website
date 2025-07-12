"use client";
import Image from 'next/image';
import Link from "next/link";
import { useState, useEffect } from 'react';

export default function Eduvanceology() {
  const [selected, setSelected] = useState('option1');

  return (
    <main className="flex flex-col w-full min-h-screen relative">
      {/* Banner Image - Responsive width */}
      <div className="hidden md:block lg:block xl:block w-full h-[210px] relative">
        <Image 
          src="/Eduvance-ology_Banner.svg" 
          alt="Eduvance-ology" 
          fill
          priority
          className="object-cover"
        />
      </div>

      <div className="flex flex-col items-center w-full px-4 sm:px-6 md:px-8 lg:px-16 xl:px-24 pt-16 md:pt-20 relative">

        <h1 className="block md:hidden text-4xl font-semibold tracking-tighter text-[#153064] mb-4 mt-[-20px]" style={{ fontFamily: 'Poppins, sans-serif' }}>
          Eduvance-ology
        </h1>

        <h3 className="font-semibold text-xl md:text-2xl text-[#153064] tracking-[-1px] mb-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
          Choose your exam board
        </h3>
        
        {/* Selection Bar - Responsive width */}
        <div className="flex rounded-[15px] bg-[#F2F6FF] border-[#153064] border-2 p-1 w-full max-w-[1200px] h-[65px] justify-between mb-10">
          <button
            onClick={() => setSelected('option1')}
            className={`w-1/2 py-2 text-center rounded-[10px] transition-all ease-in-out duration-500 text-sm md:text-base lg:text-xl ${
              selected === 'option1' ? 'bg-[#D0E0FF] shadow-md font-semibold tracking-[-0.75px]' : ''
            }`} 
            style={{ fontFamily: 'Poppins, sans-serif' }}
          >
            International A Levels
          </button>
          <button
            onClick={() => setSelected('option2')}
            className={`w-1/2 py-2 text-center rounded-[10px] transition-all ease-in-out duration-500 text-sm md:text-base lg:text-xl ${
              selected === 'option2' ? 'bg-[#D0E0FF] shadow-md font-semibold tracking-[-0.75px]' : 'bg transparent'
            }`} 
            style={{ fontFamily: 'Poppins, sans-serif' }}
          >
            IGCSEs
          </button>
        </div>
        
        {/* Conditional content */}
        <div className="w-full max-w-[1200px] transition-all duration-500 ease-in-out">
          {selected === "option1" ? (
            <>
              <h3 className="font-semibold text-xl md:text-2xl text-[#153064] tracking-[-1px] mb-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
                IAL Eduvance-ology Resources
              </h3>
          
              {/* Resource Cards - Flex wrap for responsive layout */}
              <div className="flex flex-wrap justify-center md:justify-between gap-4 md:gap-6 mb-8">
                <Link
                  href="/subjects/physics/IAL/communityNotes"
                  className="hover-tint w-full sm:w-[calc(50%-8px)] md:w-[calc(33.33%-16px)] h-40 rounded-xl font-[550] tracking-[-0.5px] border-[1.5px] border-[#153064] flex items-end justify-start pl-4 pb-4 text-[#153064] hover:bg-[#BAD1FD] transition-all duration-300 cursor-pointer"
                  style={{ backgroundImage: "url('/Notes Background.svg')", backgroundSize: 'cover', backgroundPosition: 'center' }}
                >
                  Community Notes
                </Link>

                <Link
                  href="/subjects/physics/IAL/resources"
                  className="hover-tint w-full sm:w-[calc(50%-8px)] md:w-[calc(33.33%-16px)] h-40 rounded-xl font-[550] tracking-[-0.5px] border-[1.5px] border-[#153064] flex items-end justify-start pl-4 pb-4 text-[#153064] hover:bg-[#BAD1FD] transition-all duration-300 cursor-pointer"
                  style={{ backgroundImage: "url('/PPQ Background.svg')", backgroundSize: 'cover', backgroundPosition: 'center' }}
                >
                  Eduvance Resources
                </Link>

                <Link
                  href="/subjects/physics/IAL/pastpapers"
                  className="hover-tint w-full sm:w-[calc(50%-8px)] md:w-[calc(33.33%-16px)] h-40 rounded-xl font-[550] tracking-[-0.5px] border-[1.5px] border-[#153064] flex items-end justify-start pl-4 pb-4 text-[#153064] hover:bg-[#BAD1FD] transition-all duration-300 cursor-pointer"
                  style={{ backgroundImage: "url('/Papers Background.svg')", backgroundSize: 'cover', backgroundPosition: 'center' }}
                >
                  Past Papers
                </Link>
              </div>

              {/* Course buttons - Stacked vertically on mobile */}
              <div className="flex flex-col gap-4 mb-8">
                <Link href="/subjects/psychology">
                  <button className="flex items-center justify-between w-full px-4 sm:px-6 py-4 bg-[#BAD1FD] rounded-[12px] group hover:bg-[#A8C6FF] transition-all duration-200 border-[#153064] border-1">
                    <p className="text-base md:text-lg lg:text-xl font-[550] text-[#153064] leading-tight tracking-tight text-left" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      International A Level Eduvance-ology Course Overview
                    </p>
                  </button>
                </Link>

                <Link href="/subjects/psychology">
                  <button className="flex items-center justify-between w-full px-4 sm:px-6 py-4 bg-[#BAD1FD] rounded-[12px] group hover:bg-[#A8C6FF] transition-all duration-200 border-[#153064] border-1">
                    <p className="text-base md:text-lg lg:text-xl font-[550] text-[#153064] leading-tight tracking-tight text-left" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      International A Level Eduvance-ology Course Specifications
                    </p>
                  </button>
                </Link>
              </div>
            </>
          ) : (
            <>
              <h3 className="font-semibold text-xl md:text-2xl text-[#153064] tracking-[-1px] mb-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
                IGCSE Eduvance-ology Resources
              </h3>
          
              {/* Resource Cards - Flex wrap for responsive layout */}
              <div className="flex flex-wrap justify-center md:justify-between gap-4 md:gap-6 mb-8">
                <Link
                  href="/page1"
                  className="hover-tint w-full sm:w-[calc(50%-8px)] md:w-[calc(33.33%-16px)] h-40 rounded-xl font-[550] tracking-[-0.5px] border-[1.5px] border-[#153064] flex items-end justify-start pl-4 pb-4 text-[#153064] hover:bg-[#BAD1FD] transition-all duration-300 cursor-pointer"
                  style={{ backgroundImage: "url('/Notes Background.svg')", backgroundSize: 'cover', backgroundPosition: 'center' }}
                >
                  Community Notes
                </Link>

                <Link
                  href="/page2"
                  className="hover-tint w-full sm:w-[calc(50%-8px)] md:w-[calc(33.33%-16px)] h-40 rounded-xl font-[550] tracking-[-0.5px] border-[1.5px] border-[#153064] flex items-end justify-start pl-4 pb-4 text-[#153064] hover:bg-[#BAD1FD] transition-all duration-300 cursor-pointer"
                  style={{ backgroundImage: "url('/PPQ Background.svg')", backgroundSize: 'cover', backgroundPosition: 'center' }}
                >
                  Eduvance Resources
                </Link>

                <Link
                  href="/subjects/physics/IGCSE/pastpapers"
                  className="hover-tint w-full sm:w-[calc(50%-8px)] md:w-[calc(33.33%-16px)] h-40 rounded-xl font-[550] tracking-[-0.5px] border-[1.5px] border-[#153064] flex items-end justify-start pl-4 pb-4 text-[#153064] hover:bg-[#BAD1FD] transition-all duration-300 cursor-pointer"
                  style={{ backgroundImage: "url('/Papers Background.svg')", backgroundSize: 'cover', backgroundPosition: 'center' }}
                >
                  Past Papers
                </Link>
              </div>

              {/* Course buttons - Stacked vertically on mobile */}
              <div className="flex flex-col gap-4 mb-8">
                <Link href="/subjects/psychology">
                  <button className="flex items-center justify-between w-full px-4 sm:px-6 py-4 bg-[#BAD1FD] rounded-[12px] group hover:bg-[#A8C6FF] transition-all duration-200 border-[#153064] border-1">
                    <p className="text-base md:text-lg lg:text-xl font-[550] text-[#153064] leading-tight tracking-tight text-left" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      International GCSE Eduvance-ology Course Overview
                    </p>
                  </button>
                </Link>

                <Link href="/subjects/psychology">
                  <button className="flex items-center justify-between w-full px-4 sm:px-6 py-4 bg-[#BAD1FD] rounded-[12px] group hover:bg-[#A8C6FF] transition-all duration-200 border-[#153064] border-1">
                    <p className="text-base md:text-lg lg:text-xl font-[550] text-[#153064] leading-tight tracking-tight text-left" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      International GCSE Eduvance-ology Course Specifications
                    </p>
                  </button>
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}