"use client";

import Link from "next/link";
import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import {Home} from '@/components/homenav'
export default function Resources() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    supabase
      .from('subjects')
      .select('name, syllabus_type')
      .order('name', { ascending: true })
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
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  const generatePath = (subjectName) => {
    return `/subjects/${subjectName.toLowerCase().replace(/\s+/g, "-")}`;
  };

  return (
    <>
    <Home showExtra/>
    <main className="flex flex-col lg:flex-row w-full min-h-screen px-4 py-4">
      {/* Left Side */}
      <div className="w-full lg:w-1/2 flex flex-col items-start justify-center gap-6 px-10 py-5 lg:py-16 relative">
        <div className="relative w-full h-[250px] sm:h-[200px] md:h-[180px] lg:h-[150px]">
          {/* PagesWidget at 5% from top, 0% from left */}
          <img
            src="PagesWidget.svg"
            alt="Pages Widget"
            className="absolute top-[5%] left-0 w-80 h-auto"
          />
        </div>

        <h1 className="text-4xl font-semibold text-left leading-[40px] tracking-tighter z-10 max-w-[520px]" style={{ fontFamily: 'Poppins, sans-serif' }}>
          Study materials to level up your exam prep and <span className="underline decoration-6 decoration-[#246dfd] underline-offset-8">stay on track</span>
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
      <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-start justify-center gap-6 px-10 py-5 lg:py-16">
        <h1 className="text-4xl font-semibold leading-[40px] tracking-tighter" style={{ fontFamily: 'Poppins, sans-serif' }}>
          Browse Resources by Subject
        </h1>

        <div className="flex flex-col items-start gap-y-3">
          {subjects.map((subject) => (
            <a key={subject.name} href={generatePath(subject.name)}>
              <button className="cursor-pointer flex items-center justify-between w-[90vw] max-w-[550px] px-6 py-4 bg-[#BAD1FD] rounded-[12px] group hover:bg-[#A8C6FF] transition-all duration-200 border-[#153064] border-1">
                <p
                  className="text-xl font-[550] text-[#153064]"
                  style={{ fontFamily: "Poppins, sans-serif" }}
                >
                  {subject.name} <span className="hidden sm:inline">Revision Resources</span>
                </p>
                <img
                  src="/BArrowR.svg"
                  alt="Arrow Right"
                  className="w-6 h-auto group-hover:translate-x-1 transition-transform duration-200"
                />
              </button>
            </a>
          ))}
        </div>
      </div>
    </main>
    </>
  );
}
