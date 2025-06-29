"use client";
import { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function Chemistry() {
  const [selected, setSelected] = useState('option1');
  const [hoveredSidebarItem, setHoveredSidebarItem] = useState(null);
  const [isHeaderHovered, setIsHeaderHovered] = useState(false);
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);

  const isDimmed = isHeaderHovered || isSidebarHovered;

  return (
    <div className="flex min-h-screen bg-white">
      {/* Sidebar */}
      <div 
        className="fixed left-0 top-0 h-full w-76 bg-white shadow-lg z-30 flex flex-col"
        onMouseEnter={() => setIsSidebarHovered(true)}
        onMouseLeave={() => setIsSidebarHovered(false)}
      >
        {/* Logo/Image */}
        <div className="flex justify-center pt-8 mb-8">
          <img 
            src="/LightmodeLogo.png" 
            alt="Eduvance Logo" 
            className="w-44 h-22 object-contain"
          />
        </div>

        {/* Choose your exam board header */}
        <h2 className="text-lg font-semibold tracking-[-1px] text-[#153064] mb-6 px-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
          Choose your exam board
        </h2>

        {/* Sidebar Navigation */}
        <div className="flex flex-col px-4 space-y-2">
          <div
            className={`relative px-4 py-3 rounded-lg cursor-pointer transition-all duration-200 ${
              hoveredSidebarItem === 'igcse' ? 'bg-[#BAD1FD]' : ''
            }`}
            onMouseEnter={() => setHoveredSidebarItem('igcse')}
            onMouseLeave={() => setHoveredSidebarItem(null)}
          >
            <div className="flex items-center justify-between">
              <span className="text-[#153064] tracking-[-0.5px] font-medium" style={{ fontFamily: 'Poppins, sans-serif' }}>
                IGCSE
              </span>
              {hoveredSidebarItem === 'igcse' && (
                <ChevronRight size={16} className="text-[#153064]" />
              )}
            </div>
          </div>

          <div
            className={`relative px-4 py-3 rounded-lg cursor-pointer transition-all duration-200 ${
              hoveredSidebarItem === 'as' ? 'bg-[#BAD1FD]' : ''
            }`}
            onMouseEnter={() => setHoveredSidebarItem('as')}
            onMouseLeave={() => setHoveredSidebarItem(null)}
          >
            <div className="flex items-center justify-between">
              <span className="text-[#153064] tracking-[-0.5px] font-medium" style={{ fontFamily: 'Poppins, sans-serif' }}>
                AS Levels
              </span>
              {hoveredSidebarItem === 'as' && (
                <ChevronRight size={16} className="text-[#153064]" />
              )}
            </div>
          </div>

          <div
            className={`relative px-4 py-3 rounded-lg cursor-pointer transition-all duration-200 ${
              hoveredSidebarItem === 'a2' ? 'bg-[#BAD1FD]' : ''
            }`}
            onMouseEnter={() => setHoveredSidebarItem('a2')}
            onMouseLeave={() => setHoveredSidebarItem(null)}
          >
            <div className="flex items-center justify-between">
              <span className="text-[#153064] tracking-[-0.5px] font-medium" style={{ fontFamily: 'Poppins, sans-serif' }}>
                A2 Levels
              </span>
              {hoveredSidebarItem === 'a2' && (
                <ChevronRight size={16} className="text-[#153064]" />
              )}
            </div>
          </div>
        </div>

        {/* Subjects Section */}
        <div className="mt-8 px-4">
          <h3 className="text-lg font-semibold tracking-[-1px] text-[#153064] mb-4 px-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Subjects
          </h3>
          <div className="space-y-1">
            {['Biology', 'Physics', 'Mathematics', 'Chemistry', 'Business', 'Economics'].map((subject) => (
              <Link
                key={subject}
                href={`/sub_links/${subject.toLowerCase()}`}
                className="block px-4 py-2 text-[#153064] tracking-[-0.5px] cursor-pointer hover:bg-[#BAD1FD] rounded transition-colors duration-200"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                {subject}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Header */}
      <div 
        className="fixed top-0 left-64 right-0 h-16 bg-white shadow-sm z-20"
        onMouseEnter={() => setIsHeaderHovered(true)}
        onMouseLeave={() => setIsHeaderHovered(false)}
      >
      </div>

      {/* Main Content */}
      <div className={`ml-64 mt-16 flex-1 transition-all duration-300 ${isDimmed ? 'opacity-30' : 'opacity-100'}`}>
        <main className="flex flex-col w-full min-h-screen relative">
          {/* Banner Image - Responsive width */}
          <div className="hidden md:block lg:block xl:block w-full h-[210px] relative">
            <img 
              src="/Chem_Banner.png" 
              alt="Chemistry" 
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex flex-col items-center w-full px-4 sm:px-6 md:px-8 lg:px-16 xl:px-24 pt-16 md:pt-20 relative">

            <h1 className="block md:hidden text-4xl font-semibold tracking-tighter text-[#153064] mb-4 mt-[-20px]" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Chemistry
            </h1>
            <h3 className="font-semibold text-xl text-[#153064] tracking-[-1px] mb-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
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
                    IAL Chemistry Resources
                  </h3>
              
                  {/* Resource Cards - Flex wrap for responsive layout */}
                  <div className="flex flex-wrap justify-center md:justify-between gap-4 md:gap-6 mb-8">
                    <Link
                      href="/sub_links/chemistry/IAL/communityNotes"
                      className="hover-tint w-full sm:w-[calc(50%-8px)] md:w-[calc(33.33%-16px)] h-40 rounded-xl font-[550] tracking-[-0.5px] border-[1.5px] border-[#153064] flex items-end justify-start pl-4 pb-4 text-[#153064] hover:bg-[#BAD1FD] transition-all duration-300 cursor-pointer"
                      style={{ backgroundImage: "url('/Notes Background.png')", backgroundSize: 'cover', backgroundPosition: 'center' }}
                    >
                      Community Notes
                    </Link>

                    <Link
                      href="/sub_links/chemistry/IAL/resources"
                      className="hover-tint w-full sm:w-[calc(50%-8px)] md:w-[calc(33.33%-16px)] h-40 rounded-xl font-[550] tracking-[-0.5px] border-[1.5px] border-[#153064] flex items-end justify-start pl-4 pb-4 text-[#153064] hover:bg-[#BAD1FD] transition-all duration-300 cursor-pointer"
                      style={{ backgroundImage: "url('/PPQ Background.png')", backgroundSize: 'cover', backgroundPosition: 'center' }}
                    >
                      Eduvance Resources
                    </Link>

                    <Link
                      href="/sub_links/chemistry/IAL/pastpapers"
                      className="hover-tint w-full sm:w-[calc(50%-8px)] md:w-[calc(33.33%-16px)] h-40 rounded-xl font-[550] tracking-[-0.5px] border-[1.5px] border-[#153064] flex items-end justify-start pl-4 pb-4 text-[#153064] hover:bg-[#BAD1FD] transition-all duration-300 cursor-pointer"
                      style={{ backgroundImage: "url('/Papers Background.png')", backgroundSize: 'cover', backgroundPosition: 'center' }}
                    >
                      Past Papers
                    </Link>

                  </div>
                                  </>
              ) : (
                <>
                  <h3 className="font-semibold text-xl md:text-2xl text-[#153064] tracking-[-1px] mb-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    IGCSE Chemistry Resources
                  </h3>
              
                  {/* Resource Cards - Flex wrap for responsive layout */}
                  <div className="flex flex-wrap justify-center md:justify-between gap-4 md:gap-6 mb-8">
                    <Link
                      href="/sub_links/chemistry/IGCSE/communityNotes"
                      className="hover-tint w-full sm:w-[calc(50%-8px)] md:w-[calc(33.33%-16px)] h-40 rounded-xl font-[550] tracking-[-0.5px] border-[1.5px] border-[#153064] flex items-end justify-start pl-4 pb-4 text-[#153064] hover:bg-[#BAD1FD] transition-all duration-300 cursor-pointer"
                      style={{ backgroundImage: "url('/Notes Background.png')", backgroundSize: 'cover', backgroundPosition: 'center' }}
                    >
                      Community Notes
                    </Link>

                    <Link
                      href="/sub_links/chemistry/IGCSE/resources"
                      className="hover-tint w-full sm:w-[calc(50%-8px)] md:w-[calc(33.33%-16px)] h-40 rounded-xl font-[550] tracking-[-0.5px] border-[1.5px] border-[#153064] flex items-end justify-start pl-4 pb-4 text-[#153064] hover:bg-[#BAD1FD] transition-all duration-300 cursor-pointer"
                      style={{ backgroundImage: "url('/PPQ Background.png')", backgroundSize: 'cover', backgroundPosition: 'center' }}
                    >
                      Eduvance Resources
                    </Link>

                    <Link
                      href="/sub_links/chemistry/IGCSE/pastpapers"
                      className="hover-tint w-full sm:w-[calc(50%-8px)] md:w-[calc(33.33%-16px)] h-40 rounded-xl font-[550] tracking-[-0.5px] border-[1.5px] border-[#153064] flex items-end justify-start pl-4 pb-4 text-[#153064] hover:bg-[#BAD1FD] transition-all duration-300 cursor-pointer"
                      style={{ backgroundImage: "url('/Papers Background.png')", backgroundSize: 'cover', backgroundPosition: 'center' }}
                    >
                      Past Papers
                    </Link>

                  </div>
                </>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}