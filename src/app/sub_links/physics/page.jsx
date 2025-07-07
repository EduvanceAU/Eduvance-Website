"use client";
import { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { supabase } from './client/supabaseClient';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';

export default function Physics() {
  const [selected, setSelected] = useState('option1');
  const [hoveredSidebarItem, setHoveredSidebarItem] = useState(null);
  const [isHeaderHovered, setIsHeaderHovered] = useState(false);
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const isDimmed = isHeaderHovered || isSidebarHovered;

  // Disable scrolling on mount
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
      if (session) setShowLoginPopup(true);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, _session) => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setLoading(false);
      if (session) {
        setShowLoginPopup(true);
        setShowAuthModal(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Handle login popup auto-hide
  useEffect(() => {
    if (showLoginPopup) {
      const timer = setTimeout(() => setShowLoginPopup(false), 2500);
      return () => clearTimeout(timer);
    }
  }, [showLoginPopup]);

  const handleLogin = () => {
    setShowAuthModal(true);
  };

  const handleJoin = () => {
    setShowAuthModal(true);
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Logout failed:', error.message);
      return;
    }
  
    // Clear session manually
    setSession(null);
    setShowLoginPopup(false);
  };

  const closeAuthModal = () => {
    setShowAuthModal(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-xl text-[#0C58E4]">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-white overflow-hidden">
      {/* Header */}
      <div
        className={`fixed top-0 left-0 right-0 h-16 bg-white shadow-sm z-20 transition-all duration-300 flex items-center justify-between px-4`}
        onMouseEnter={() => setIsHeaderHovered(true)}
        onMouseLeave={() => setIsHeaderHovered(false)}
      >
        {/* Center Image Button */}
        <Link href="/" className="absolute left-1/2 transform -translate-x-1/2">
          <img
            src="/LightmodeLogo2.png"
            alt="Home Logo"
            className="h-10 w-auto object-contain cursor-pointer"
          />
        </Link>

        {/* Auth Section */}
        <div className="flex items-center gap-3">
          {!session ? (
            <>
              <button
                className="text-[#0C58E4] tracking-[-0.5px] font-semibold px-3 py-1 rounded transition hover:underline"
                onClick={handleLogin}
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                Log In
              </button>
              <button
                className="bg-[#0C58E4] tracking-[-0.5px] text-white font-semibold px-4 py-2 rounded-full transition hover:bg-[#0846b8]"
                onClick={handleJoin}
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                Join now for free
              </button>
            </>
          ) : (
            <>
              <span className="text-[#0C58E4] tracking-[-0.5px] font-semibold px-3 py-1 rounded">
                {session.user?.user_metadata?.full_name || session.user?.email}
              </span>
              <button
                className="text-[#0C58E4] tracking-[-0.5px] font-semibold px-3 py-1 rounded transition hover:underline"
                onClick={handleLogout}
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                Log Out
              </button>
            </>
          )}
        </div>
      </div>

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 relative">
            <button
              onClick={closeAuthModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-[#0C58E4] mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Welcome to Eduvance
              </h2>
              <p className="text-gray-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Sign in to access all Physics resources
              </p>
            </div>
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
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className={`transition-all duration-300 flex-1`}>
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
                  {/* Resource Cards - Full width, stacked on small screens */}
                  <div className="flex flex-col md:flex-row flex-wrap gap-4 md:gap-6 mb-8 w-full">
                    <Link
                      href="/sub_links/physics/IAL/communityNotes"
                      className={`transition-all duration-300 ${
                                  sidebarOpen ? 'min-w-[255px]' : 'min-w-[300px]'
                                } h-40 rounded-xl font-[550] tracking-[-0.5px] border-[1.5px] border-[#0C58E4] flex items-end justify-start pl-4 pb-4 text-black hover:text-[#0C58E4] hover:bg-[#CEE0FF] bg-blend-multiply cursor-pointer`}
                      style={{ backgroundImage: "url('/Notes Background.png')", backgroundSize: 'cover', backgroundPosition: 'center' }}
                    >
                      Community Notes
                    </Link>
                    <Link
                      href="/sub_links/physics/IAL/resources"
                      className={`transition-all duration-300 ${
                                  sidebarOpen ? 'min-w-[255px]' : 'min-w-[300px]'
                                } h-40 rounded-xl font-[550] tracking-[-0.5px] border-[1.5px] border-[#0C58E4] flex items-end justify-start pl-4 pb-4 text-black hover:text-[#0C58E4] hover:bg-[#CEE0FF] bg-blend-multiply cursor-pointer`}
                      style={{ backgroundImage: "url('/PPQ Background.png')", backgroundSize: 'cover', backgroundPosition: 'center' }}
                    >
                      Eduvance Resources
                    </Link>
                    <Link
                      href="/sub_links/physics/IAL/pastpapers"
                      className={`transition-all duration-300 ${
                                  sidebarOpen ? 'min-w-[250px]' : 'min-w-[300px]'
                                } h-40 rounded-xl font-[550] tracking-[-0.5px] border-[1.5px] border-[#0C58E4] flex items-end justify-start pl-4 pb-4 text-black hover:text-[#0C58E4] hover:bg-[#CEE0FF] bg-blend-multiply cursor-pointer`}
                      style={{ backgroundImage: "url('/Papers Background.png')", backgroundSize: 'cover', backgroundPosition: 'center' }}
                    >
                      Past Papers
                    </Link>
                    <a
                      href="../../contributor/"
                      className={`transition-all duration-300 ${
                                  sidebarOpen ? 'min-w-[255px]' : 'min-w-[300px]'
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
                  {/* Resource Cards - Full width, stacked on small screens */}
                  <div className="flex flex-col md:flex-row flex-wrap gap-4 md:gap-6 mb-8 w-full">
                    <Link
                      href="/sub_links/physics/IGCSE/communityNotes"
                      className={`transition-all duration-300 ${
                                  sidebarOpen ? 'min-w-[255px]' : 'min-w-[300px]'
                                } h-40 rounded-xl font-[550] tracking-[-0.5px] border-[1.5px] border-[#0C58E4] flex items-end justify-start pl-4 pb-4 text-black hover:text-[#0C58E4] hover:bg-[#CEE0FF] bg-blend-multiply cursor-pointer`}
                      style={{ backgroundImage: "url('/Notes Background.png')", backgroundSize: 'cover', backgroundPosition: 'center' }}
                    >
                      Community Notes
                    </Link>
                    <Link
                      href="/sub_links/physics/IGCSE/resources"
                      className={`transition-all duration-300 ${
                                  sidebarOpen ? 'min-w-[255px]' : 'min-w-[300px]'
                                } h-40 rounded-xl font-[550] tracking-[-0.5px] border-[1.5px] border-[#0C58E4] flex items-end justify-start pl-4 pb-4 text-black hover:text-[#0C58E4] hover:bg-[#CEE0FF] bg-blend-multiply cursor-pointer`}
                      style={{ backgroundImage: "url('/PPQ Background.png')", backgroundSize: 'cover', backgroundPosition: 'center' }}
                    >
                      Eduvance Resources
                    </Link>
                    <Link
                      href="/sub_links/physics/IGCSE/pastpapers"
                      className={`transition-all duration-300 ${
                                  sidebarOpen ? 'min-w-[255px]' : 'min-w-[300px]'
                                } h-40 rounded-xl font-[550] tracking-[-0.5px] border-[1.5px] border-[#0C58E4] flex items-end justify-start pl-4 pb-4 text-black hover:text-[#0C58E4] hover:bg-[#CEE0FF] bg-blend-multiply cursor-pointer`}
                      style={{ backgroundImage: "url('/Papers Background.png')", backgroundSize: 'cover', backgroundPosition: 'center' }}
                    >
                      Past Papers
                    </Link>
                    <a
                      href="../../contributor/"
                      className={`transition-all duration-300 ${
                                  sidebarOpen ? 'min-w-[255px]' : 'min-w-[300px]'
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
    </div>
  );
}