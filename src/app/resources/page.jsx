"use client";

import Link from "next/link";
import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';

export default function Resources() {
  const [session, setSession] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) return;
    setLoading(true);
    supabase
      .from('subjects')
      .select('name, syllabus_type')
      .then(({ data, error }) => {
        if (!error) {
          // Deduplicate by subject name
          const unique = {};
          data.forEach((subj) => {
            if (!unique[subj.name]) unique[subj.name] = subj;
          });
          setSubjects(Object.values(unique));
        }
        setLoading(false);
      });
  }, [session]);

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Auth 
          supabaseClient={supabase} 
          appearance={{ theme: ThemeSupa }} 
          providers={['google', 'discord']} 
          redirectTo={typeof window !== 'undefined' ? `${window.location.origin}/resources` : undefined}
        />
      </div>
    );
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  const generatePath = (subjectName) => {
    return `/sub_links/${subjectName.toLowerCase().replace(/\s+/g, "-")}`;
  };

  return (
    <main className="flex flex-col lg:flex-row w-full min-h-screen">
      {/* Left Side */}
      <div className="w-full lg:w-1/2 flex flex-col items-start justify-center gap-6 px-10 py-16 relative">
        <div className="relative w-full h-[250px] sm:h-[200px] md:h-[180px] lg:h-[150px]">
          {/* PagesWidget at 5% from top, 0% from left */}
          <img
            src="PagesWidget.png"
            alt="Pages Widget"
            className="absolute top-[5%] left-0 w-80 h-auto"
          />

          {/* Underline at 60% from left, 40% from top */}
          <img
            src="Underline.png"
            alt="Underline"
            className="absolute top-[155%] sm:top-[165%] left-[38%] w-auto h-[15px]"
          />
        </div>

        <h1 className="text-4xl font-semibold text-left leading-[40px] tracking-tighter z-10 max-w-[520px]" style={{ fontFamily: 'Poppins, sans-serif' }}>
          Study materials to level up your exam prep and stay on track
        </h1>

        <h3 className="text-xl font-[550] text-left text-stone-500 leading-[25px] tracking-[-0.015em] z-10 max-w-[640px]" style={{ fontFamily: 'Poppins, sans-serif' }}>
          Our revision resources follow your exam specs closely and cover each topic with clarity. From bite-sized explanations and real exam tips to helpful visuals and examples, everything is built to make your revision smoother and more focused.
        </h3>

        <div className="flex flex-col items-start gap-y-2 z-10">
          <p className="text-xl font-[550] text-stone-600" style={{ fontFamily: 'Poppins, sans-serif' }}>✅ ‎‎Clear and concise for faster understanding</p>
          <p className="text-xl font-[550] text-stone-600" style={{ fontFamily: 'Poppins, sans-serif' }}>✅ ‎‎Matches your exam board topics</p>
          <p className="text-xl font-[550] text-stone-600" style={{ fontFamily: 'Poppins, sans-serif' }}>✅ ‎‎Helps you revise what really matters</p>
        </div>
      </div>

      {/* Right Side */}
      <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-start justify-center gap-6 px-10 py-16">
        <h1 className="text-4xl font-semibold leading-[40px] tracking-tighter" style={{ fontFamily: 'Poppins, sans-serif' }}>
          Browse Resources by Subject
        </h1>

        <div className="flex flex-col items-start gap-y-3">
          {subjects.map((subject) => (
            <Link key={subject.name} href={generatePath(subject.name)}>
              <button className="flex items-center justify-between w-[90vw] max-w-[550px] px-6 py-4 bg-[#BAD1FD] rounded-[12px] group hover:bg-[#A8C6FF] transition-all duration-200 border-[#153064] border-1">
                <p
                  className="text-xl font-[550] text-[#153064]"
                  style={{ fontFamily: "Poppins, sans-serif" }}
                >
                  {subject.name} Revision Resources
                </p>
                <img
                  src="/BArrowR.png"
                  alt="Arrow Right"
                  className="w-6 h-auto group-hover:translate-x-1 transition-transform duration-200"
                />
              </button>
            </Link>
          ))}
        </div>
        <button className="mt-8 px-4 py-2 bg-red-500 text-white rounded-lg" onClick={() => supabase.auth.signOut()}>Sign Out</button>
      </div>
    </main>
  );
}
