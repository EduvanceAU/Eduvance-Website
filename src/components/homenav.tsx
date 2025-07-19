"use client";
import Image from 'next/image';
import Link from "next/link";
import { useState, useRef, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import BlueSolo from '@/assets/png/BlueSolo.png'
import SmallLogo from '@/assets/png/SmallLogo.png'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useSupabaseAuth } from '@/components/client/SupabaseAuthContext';

// Dropdown component
const NavDropdown = ({ labelMain, labelSmall, items }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        aria-label='access-dropdown'
        onClick={() => setIsOpen(!isOpen)}
        className="cursor-pointer text-[#555555] text-sm sm:text-base lg:text-lg font-semibold hover:text-black transition tracking-[-1px] flex items-center gap-1"
      >
        <p className='max-[1055px]:hidden min-[1055px]:block'>{labelMain}</p>
        <p className='max-[665px]:hidden min-[1055px]:hidden max-[1055px]:block'>{labelSmall}</p>
        <svg
          className={`max-[665px]:hidden w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isOpen && (
        <div className="absolute z-50 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
          <div className="py-1" role="menu" aria-orientation="vertical">
            {items.map((item, index) => (
              <Link
                key={index}
                href={item.href}
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                role="menuitem"
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

function Home(props) {
  const [subjects, setSubjects] = useState([]);
  const [NonUniqueSubjects, setNQSubjects] = useState([]);
  useEffect(() => {
    // Dynamically generating subject list for sidebar
      supabase
      .from('subjects')
      .select('name, syllabus_type')
      .order('name', { ascending: true })
      .then(({ data, error }) => {
        if (!error) {
          setNQSubjects(data);
          const subject_list = [...new Set(data.map(item => item.name))];
          setSubjects(subject_list.sort());
        }
      });
    }, []);
  let extra: React.ReactNode = null;
  if (props.showExtra){
    extra = (<div className="mt-8 px-4">
        <h3 className="text-lg font-semibold tracking-[-1px] text-[#0C58E4] mb-4 px-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
          Eduvance Services
        </h3>
        <div className="space-y-1">
          {[
            { name: 'Study Tools', href: '/studyTools' },
            { name: 'Past Papers', href: '/pastPapers' },
            { name: 'Community Notes', href: '/communityNotes' },
            { name: 'Eduvance Resources', href: '/resources' },
            { name: 'Share Your Notes!', href: '/contributor' },
          ].map((tool) => (
            <Link
              key={tool.name}
              href={tool.href}
              className="block px-4 py-2 text-[#000000] tracking-[-0.5px] cursor-pointer hover:bg-[#BAD1FD] rounded transition-colors duration-200"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              {tool.name}
            </Link>
          ))}
        </div>
      </div>)
  }
  const { session } = useSupabaseAuth();
  const [selected, setSelected] = useState('option1');
  const [hoveredSidebarItem, setHoveredSidebarItem] = useState(null);
  const [isHeaderHovered, setIsHeaderHovered] = useState(false);
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  // const [showLogoutPopup, setShowLogoutPopup] = useState(false);
  const prevSessionRef = useRef(null);
  const loginPopupShownRef = useRef(false);

  useEffect(() => {
    // Only show login popup if previous session was null and new session is not null, and popup hasn't been shown yet in sessionStorage
    if (!prevSessionRef.current && session && !sessionStorage.getItem('loginPopupShown')) {
      setShowLoginPopup(true);
      sessionStorage.setItem('loginPopupShown', 'true');
    }
    // Reset the flag if the user logs out
    if (!session) {
      sessionStorage.removeItem('loginPopupShown');
    }
    prevSessionRef.current = session;
  }, [session]);

  // Handle login popup auto-hide
  useEffect(() => {
    if (showLoginPopup) {
      const timer = setTimeout(() => setShowLoginPopup(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [showLoginPopup]);
  // Handle logout popup auto-hide
  // useEffect(() => {
  //   if (showLogoutPopup) {
  //     const timer = setTimeout(() => setShowLogoutPopup(false), 1500);
  //     return () => clearTimeout(timer);
  //   }
  // }, [showLogoutPopup]);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Logout failed:', error.message);
      return;
    }
  
    // Clear session manually
    // setSession(null); // This line is removed as session is now managed by useSupabaseAuth
    // setShowLogoutPopup(true); // This line is removed as showLogoutPopup is removed
    setShowLoginPopup(false);  
    sessionStorage.removeItem('loginPopupShown');
  };

  return (
    <main className="bg-white relative overflow-x-hidden">
      
      <nav className="w-full h-[60px] flex justify-between items-center px-4 md:px-6 py-4 z-50 fixed top-0 left-0 bg-white bg-opacity-95">
        {/* 👈 Left Side: Sidebar Button + Logo in one group */}
        <div className="flex items-center gap-2">
          <button
            aria-label='sidebar-adjustment'
            className="cursor-pointer flex items-center justify-center w-10 h-10 rounded-full hover:bg-[#BAD1FD] transition-colors duration-200"
            onClick={() => setSidebarOpen(true)}
          >
            <svg className="w-6 h-6 text-[#0C58E4]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <Link href="/">
            <Image src={SmallLogo} alt="Eduvance" width={35} height={35} />
          </Link>
          <Link href="/">
            <span className="font-grand-local text-xl sm:text-2xl text-black">Eduvance</span>
          </Link>
        </div>

        {/* Center Links - Hidden on sm */}
        <div className="hidden sm:flex flex-wrap gap-3 sm:gap-4 md:gap-5 justify-center items-center">
          <NavDropdown
            labelMain="About"
            labelSmall="About"
            items={[
              { label: "About Eduvance", href: "/about/eduvance" },
              { label: "About Edexcel", href: "/about/edexcel" },
              { label: "Exam Structure", href: "/about/exam-structure" },
              { label: "Grading System", href: "/about/grading" },
            ]}
          />
          <NavDropdown
            labelMain="IAL Edexcel Resources"
            labelSmall="IAL"
            items={NonUniqueSubjects
                    .filter((subject) => subject.syllabus_type === "IAL")
                    .map((subject) => ({label: subject.name, href: `/subjects/${subject.name.toLowerCase()}/IAL/resources`,
                    }))
                  }/>
          <NavDropdown
            labelMain="IGCSE Edexcel Resources"
            labelSmall="IGCSE"
            items={NonUniqueSubjects
                    .filter((subject) => subject.syllabus_type === "IGCSE")
                    .map((subject) => ({label: subject.name, href: `/subjects/${subject.name.toLowerCase()}/IGCSE/resources`,
                    }))
                  }/>
          <NavDropdown
            labelMain="More"
            labelSmall="More"
            items={[
              { label: "Contact Us", href: "/contact" },
              { label: "FAQ", href: "/faq" },
              { label: "Community Guidelines", href: "/guidelines" },
              { label: "Privacy Policy", href: "/privacy" },
              { label: "Terms of Service", href: "/terms" },
            ]}
          />
        </div>

        {/* Auth Section */}
        <div className="flex items-center gap-3">
          {!session ? (
            <>
              <Dialog>
                <DialogTrigger asChild>
                  <button
                    className="text-[#0C58E4] cursor-pointer tracking-[-0.5px] font-semibold px-3 py-1 rounded transition hover:underline"
                    style={{ fontFamily: 'Poppins, sans-serif' }}
                  >
                    Log In  
                  </button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md pl-8 pr-8 pt-6 pb-4 max-h-[95vh]">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-[#0C58E4]" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        Welcome to Eduvance
                    </DialogTitle>
                    <DialogDescription className="text-gray-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      Sign in to access all corresponding resources
                    </DialogDescription>
                    <Auth 
                        supabaseClient={supabase} 
                        appearance={{ 
                          theme: ThemeSupa,
                          variables: {
                            default: {
                              colors: {
                                brand: '#0C58E4',
                                brandAccent: '#0846b8',
                              }
                            }
                          }
                        }} 
                        providers={['google', 'discord']} 
                        redirectTo={typeof window !== 'undefined' ? window.location.href : undefined}
                      />
                  </DialogHeader>
                </DialogContent>
              </Dialog>
              <Dialog>
                <DialogTrigger asChild>
                  <button 
                    style={{ fontFamily: 'Poppins, sans-serif' }}
                    className="bg-[#1871F2] cursor-pointer text-white border-2 border-white px-4 py-1 rounded-[10px] hover:bg-blue-700 transition text-sm sm:text-base poppins-semibold shadow-lg">
                    Join Now
                  </button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md pl-8 pr-8 pt-6 pb-4 max-h-[95vh]">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-[#0C58E4]" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      Welcome to Eduvance
                    </DialogTitle>
                    <DialogDescription className="text-gray-600" style={{ fontFamily: 'Poppins, sans-serif' }}>                      
                      Sign up now to access all corresponding resources
                    </DialogDescription>
                    <Auth 
                        supabaseClient={supabase} 
                        appearance={{ 
                          theme: ThemeSupa,
                          variables: {
                            default: {
                              colors: {
                                brand: '#0C58E4',
                                brandAccent: '#0846b8',
                              }
                            }
                          }
                        }} 
                        providers={['google', 'discord']} 
                        redirectTo={typeof window !== 'undefined' ? window.location.href : undefined}
                      />
                  </DialogHeader>
                </DialogContent>
              </Dialog>   
            </>
          ) : (
            <>
              
              {session.user?.user_metadata?.avatar_url ? <img className='border-[#1871F2] p-0.5 border-2 rounded-full w-10 h-10' src={session.user?.user_metadata?.avatar_url}/>: <span className="text-[#0C58E4] tracking-[-0.5px] font-semibold px-3 py-1 rounded hidden lg:block">{session.user?.email}</span>}
              
              <button
                className="text-[#0C58E4] cursor-pointer tracking-[-0.5px] font-semibold px-3 py-1 rounded transition hover:underline"
                onClick={handleLogout}
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                Log Out
              </button>
            </>
          )}
        </div>
      </nav>
    
      {/* Login Success Popup */}
      {showLoginPopup && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg animate-slide-in-fade-out">
            Successfully logged in!
          </div>
          <style jsx>{`
            .animate-slide-in-fade-out {
              animation: slideInFadeOut 2.5s forwards;
            }
            @keyframes slideInFadeOut {
              0% { opacity: 0; transform: translateY(-20px); }
              10% { opacity: 1; transform: translateY(0); }
              90% { opacity: 1; transform: translateY(0); }
              100% { opacity: 0; transform: translateY(-20px); }
            }
          `}</style>
        </div>
      )}
      {/* Logout Success Popup */}
      {/* {showLogoutPopup && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-red-800 text-white px-6 py-3 rounded-lg shadow-lg animate-slide-in-fade-out">
            You are not logged in!
          </div>
          <style jsx>{`
            .animate-slide-in-fade-out {
              animation: slideInFadeOut 2.5s forwards;
            }
            @keyframes slideInFadeOut {
              0% { opacity: 0; transform: translateY(-20px); }
              10% { opacity: 1; transform: translateY(0); }
              90% { opacity: 1; transform: translateY(0); }
              100% { opacity: 0; transform: translateY(-20px); }
            }
          `}</style>
        </div>
      )} */}
      {/* Custom Sidebar - Slide-in from left */}
      {/* Scroll Ability */}
      <div data-sidebar={sidebarOpen ? 'open' : 'closed'} className={`sidebarWheel overflow-y-scroll overscroll-none fixed top-0 left-0 h-full bg-white z-50 flex flex-col shadow-lg transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out`} style={{ width: '300px', minWidth: '300px' }}>
        <div className="flex justify-between items-center p-4">
          {/* Logo/Image */}
          <Link href="/">
            <Image
              src={BlueSolo}
              alt="Eduvance Logo"
              className="w-11 h-11 object-contain"
            />
          </Link>
          {/* Close Button */}
          <button onClick={() => setSidebarOpen(false)} className="cursor-pointer w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#BAD1FD]">
            <svg className="w-6 h-6 text-[#153064]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>          
        </div>
        {/* Choose your exam board header */}
        <h2 className="text-lg font-semibold tracking-[-1px] text-[#0C58E4] mb-6 px-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
          Choose your exam qualification
        </h2>
        {/* Sidebar Navigation */}
        <div className="flex flex-col px-4 space-y-2">
          <div
            className={`relative px-4 py-3 rounded-lg cursor-pointer transition-all duration-200 ${
              hoveredSidebarItem === 'igcse' ? 'bg-[#BAD1FD]' : ''
            }`}
            onMouseEnter={() => setHoveredSidebarItem('igcse')}
            onMouseLeave={() => setHoveredSidebarItem(null)}
            onClick={() => {
              setSidebarOpen(false);
              window.location.href = '/IGCSE';
            }}
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
            onClick={() => {
              setSidebarOpen(false);
              window.location.href = '/IAL';
            }}
          >
            <div className="flex items-center justify-between">
              <span className="text-[#000000] tracking-[-0.5px] font-medium" style={{ fontFamily: 'Poppins, sans-serif' }}>
                IAL
              </span>
              {hoveredSidebarItem === 'as' && (
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
            {subjects.map((subject) => (
              <Link
                key={subject}
                href={`/subjects/${subject.toLowerCase()}`}
                className="block px-4 py-2 text-[#000000] tracking-[-0.5px] cursor-pointer hover:bg-[#BAD1FD] rounded transition-colors duration-200"
                style={{ fontFamily: 'Poppins, sans-serif' }}
                onClick={() => setSidebarOpen(false)}
              >
                {subject}
              </Link>
            ))}
          </div>
        </div>
        {extra}
      </div>
    </main>
  );
};
export {Home}
