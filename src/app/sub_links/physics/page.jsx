"use client";
import { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function Physics() {
  const [selected, setSelected] = useState('option1');
  const [hoveredSidebarItem, setHoveredSidebarItem] = useState(null);
  const [isHeaderHovered, setIsHeaderHovered] = useState(false);
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const isDimmed = isHeaderHovered || isSidebarHovered;

  // Disable scrolling on mount
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  return (
    <div className="flex min-h-screen bg-white overflow-hidden">
      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-full z-30 flex flex-col bg-white transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-6'}`}
        onMouseEnter={() => setIsSidebarHovered(true)}
        onMouseLeave={() => setIsSidebarHovered(false)}
      >
        {/* Sidebar Toggle Button */}
        <button
          className="absolute -right-4 top-6 z-40 bg-white border border-[#0C58E4] rounded-full p-1 shadow transition-all duration-300 focus:outline-none"
          style={{ width: 32, height: 32 }}
          onClick={() => setSidebarOpen((open) => !open)}
        >
          {sidebarOpen ? <ChevronLeft size={20} className="text-[#0C58E4]" /> : <ChevronRight size={20} className="text-[#0C58E4]" />}
        </button>
        {sidebarOpen && (
          <>
            {/* Logo/Image */}
            <div className="flex justify-left pt-8 mb-3">
              <img
                src="/BlueSolo.png"
                alt="Eduvance Logo"
                className="w-33 h-11 object-contain"
              />
            </div>

            {/* Choose your exam board header */}
            <h2 className="text-lg font-semibold tracking-[-1px] text-[#0C58E4] mb-6 px-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
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
                  <span className="text-[#000000] tracking-[-0.5px] font-medium" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    IGCSE
                  </span>
                  {hoveredSidebarItem === 'igcse' && (
                    <ChevronRight size={16} className="text-[#000000]" />
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
                  <span className="text-[#000000] tracking-[-0.5px] font-medium" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    AS Levels
                  </span>
                  {hoveredSidebarItem === 'as' && (
                    <ChevronRight size={16} className="text-[#000000]" />
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
                  <span className="text-[#000000] tracking-[-0.5px] font-medium" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    A2 Levels
                  </span>
                  {hoveredSidebarItem === 'a2' && (
                    <ChevronRight size={16} className="text-[#000000]" />
                  )}
                </div>
              </div>
            </div>

            {/* Subjects Section */}
            <div className="mt-8 px-4">
              <h3 className="text-lg font-semibold tracking-[-1px] text-[#0C58E4] mb-4 px-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Subjects
              </h3>
              <div className="space-y-1">
                {['Biology', 'Physics', 'Mathematics', 'Chemistry', 'Business', 'Economics'].map((subject) => (
                  <Link
                    key={subject}
                    href={`/sub_links/${subject.toLowerCase()}`}
                    className="block px-4 py-2 text-[#000000] tracking-[-0.5px] cursor-pointer hover:bg-[#BAD1FD] rounded transition-colors duration-200"
                    style={{ fontFamily: 'Poppins, sans-serif' }}
                  >
                    {subject}
                  </Link>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Header */}
      <div
        className={`fixed top-0 ${sidebarOpen ? 'left-64' : 'left-6'} right-0 h-16 bg-white shadow-sm z-20 transition-all duration-300`}
        onMouseEnter={() => setIsHeaderHovered(true)}
        onMouseLeave={() => setIsHeaderHovered(false)}
      >
      </div>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-6'} mt-16 flex-1 ${isDimmed ? 'opacity-30' : 'opacity-100'}`}>
        {/* Custom Banner Header */}
        <div
          className="w-full h-[210px] relative flex items-center bg-cover bg-center bg-no-repeat transition-all duration-300"
          style={{ backgroundImage: "url('/Banner.png')" }}
        >
          <h1 className="text-white font-grand-local text-xl md:text-7xl ml-17 tracking-[-1px]">
            Physics
          </h1>
        </div>
        
        <main className="flex flex-col w-full min-h-screen relative">

          <div className={`flex flex-col items-center w-full pt-12 md:pt-9 relative transition-all duration-300 px-4 sm:px-6 md:px-8 lg:px-16 xl:px-24}`}>
            <h3 className="self-start font-semibold text-xl md:text-2xl text-[#0C58E4] tracking-[-1px] mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Choose Your Exam Board
            </h3>

            {/* Selection Bar - Responsive width */}
            <div className="flex rounded-[15px] bg-[#F2F6FF] border-[#0C58E4] border-2 p-1 w-full max-w-[1200px] h-[65px] justify-between mb-10">
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
            <div className={`w-full ${sidebarOpen ? 'max-w-[1200px]' : 'max-w-[1440px]'} transition-all duration-500 ease-in-out`}>
              {selected === "option1" ? (
                <>
                  <h3 className="font-semibold text-xl md:text-2xl text-[#0C58E4] tracking-[-1px] mb-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    IAL Physics Resources
                  </h3>
                  {/* Resource Cards - Flex row for single-line layout (IAL) */}
                  <div className="flex flex-row flex-nowrap overflow-x-auto gap-4 md:gap-6 mb-8 px-1 w-full">
                    <Link
                      href="/sub_links/physics/IAL/communityNotes"
                      className={`transition-all duration-300 ${
                                  sidebarOpen ? 'min-w-[241px]' : 'min-w-[300px]'
                                } h-40 rounded-xl font-[550] tracking-[-0.5px] border-[1.5px] border-[#0C58E4] flex items-end justify-start pl-4 pb-4 text-black hover:text-[#0C58E4] hover:bg-[#CEE0FF] bg-blend-multiply cursor-pointer`}
                      style={{ backgroundImage: "url('/Notes Background.png')", backgroundSize: 'cover', backgroundPosition: 'center' }}
                    >
                      Community Notes
                    </Link>
                    <Link
                      href="/sub_links/physics/IAL/resources"
                      className={`transition-all duration-300 ${
                                  sidebarOpen ? 'min-w-[241px]' : 'min-w-[300px]'
                                } h-40 rounded-xl font-[550] tracking-[-0.5px] border-[1.5px] border-[#0C58E4] flex items-end justify-start pl-4 pb-4 text-black hover:text-[#0C58E4] hover:bg-[#CEE0FF] bg-blend-multiply cursor-pointer`}
                      style={{ backgroundImage: "url('/PPQ Background.png')", backgroundSize: 'cover', backgroundPosition: 'center' }}
                    >
                      Eduvance Resources
                    </Link>
                    <Link
                      href="/sub_links/physics/IAL/pastpapers"
                      className={`transition-all duration-300 ${
                                  sidebarOpen ? 'min-w-[241px]' : 'min-w-[300px]'
                                } h-40 rounded-xl font-[550] tracking-[-0.5px] border-[1.5px] border-[#0C58E4] flex items-end justify-start pl-4 pb-4 text-black hover:text-[#0C58E4] hover:bg-[#CEE0FF] bg-blend-multiply cursor-pointer`}
                      style={{ backgroundImage: "url('/Papers Background.png')", backgroundSize: 'cover', backgroundPosition: 'center' }}
                    >
                      Past Papers
                    </Link>
                    <a
                      href="/sub_links/physics/IAL/pastpapers"
                      className={`transition-all duration-300 ${
                                  sidebarOpen ? 'min-w-[241px]' : 'min-w-[300px]'
                                } h-40 rounded-xl font-[550] tracking-[-0.5px] border-[1.5px] border-[#0C58E4] flex items-end justify-start pl-4 pb-4 text-black hover:text-[#0C58E4] hover:bg-[#CEE0FF] bg-blend-multiply cursor-pointer`}
                      style={{ backgroundImage: "url('/Share Notes Background.png')", backgroundSize: 'cover', backgroundPosition: 'center' }}
                    >
                      Share Your Notes
                    </a>
                  </div>
                </>
              ) : (
                <>
                  <h3 className="font-semibold text-xl md:text-2xl text-[#0C58E4] tracking-[-1px] mb-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    IGCSE Physics Resources
                  </h3>
                  {/* Resource Cards - Flex row for single-line layout (IAL) */}
                  <div className="flex flex-row flex-nowrap overflow-x-auto gap-4 md:gap-6 mb-8 px-1 w-full">
                    <Link
                      href="/sub_links/physics/IGCSE/communityNotes"
                      className={`transition-all duration-300 ${
                                  sidebarOpen ? 'min-w-[241px]' : 'min-w-[300px]'
                                } h-40 rounded-xl font-[550] tracking-[-0.5px] border-[1.5px] border-[#0C58E4] flex items-end justify-start pl-4 pb-4 text-black hover:text-[#0C58E4] hover:bg-[#CEE0FF] bg-blend-multiply cursor-pointer`}
                      style={{ backgroundImage: "url('/Notes Background.png')", backgroundSize: 'cover', backgroundPosition: 'center' }}
                    >
                      Community Notes
                    </Link>
                    <Link
                      href="/sub_links/physics/IGCSE/resources"
                      className={`transition-all duration-300 ${
                                  sidebarOpen ? 'min-w-[241px]' : 'min-w-[300px]'
                                } h-40 rounded-xl font-[550] tracking-[-0.5px] border-[1.5px] border-[#0C58E4] flex items-end justify-start pl-4 pb-4 text-black hover:text-[#0C58E4] hover:bg-[#CEE0FF] bg-blend-multiply cursor-pointer`}
                      style={{ backgroundImage: "url('/PPQ Background.png')", backgroundSize: 'cover', backgroundPosition: 'center' }}
                    >
                      Eduvance Resources
                    </Link>
                    <Link
                      href="/sub_links/physics/IGCSE/pastpapers"
                      className={`transition-all duration-300 ${
                                  sidebarOpen ? 'min-w-[241px]' : 'min-w-[300px]'
                                } h-40 rounded-xl font-[550] tracking-[-0.5px] border-[1.5px] border-[#0C58E4] flex items-end justify-start pl-4 pb-4 text-black hover:text-[#0C58E4] hover:bg-[#CEE0FF] bg-blend-multiply cursor-pointer`}
                      style={{ backgroundImage: "url('/Papers Background.png')", backgroundSize: 'cover', backgroundPosition: 'center' }}
                    >
                      Past Papers
                    </Link>
                    <a
                      href="/sub_links/physics/IGCSE/pastpapers"
                      className={`transition-all duration-300 ${
                                  sidebarOpen ? 'min-w-[241px]' : 'min-w-[300px]'
                                } h-40 rounded-xl font-[550] tracking-[-0.5px] border-[1.5px] border-[#0C58E4] flex items-end justify-start pl-4 pb-4 text-black hover:text-[#0C58E4] hover:bg-[#CEE0FF] bg-blend-multiply cursor-pointer`}
                      style={{ backgroundImage: "url('/Share Notes Background.png')", backgroundSize: 'cover', backgroundPosition: 'center' }}
                    >
                      Share Your Notes
                    </a>
                  </div>
                </>
              )}
            </div>

            {/* Always-visible slim buttons below the cards */}
            <div className="flex flex-wrap justify-between gap-4 w-full">
              <a
                href="https://discord.gg/Eduvance"
                className="w-full h-14 rounded-xl bg-[#F2F6FF] font-[550] tracking-[-0.5px] border-[1.5px] border-[#0C58E4] flex items-center justify-start pl-4 text-black hover:text-[#0C58E4] hover:bg-[#BAD1FD] bg-blend-multiply transition-all duration-300"
              >
                <img src="/ServerIcon.png" alt="Contribute" className="w-5 h-4 mr-4" />
                Join Our Discord Server
              </a>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}