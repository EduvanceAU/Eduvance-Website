"use client"

import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function IALSubjectsPage() {
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    supabase
      .from('subjects')
      .select('name')
      .eq('syllabus_type', 'IAL')
      .order('name', { ascending: true })
      .then(({ data, error }) => {
        if (!error) {
          setSubjects([...new Set(data.map(item => item.name))]);
        }
      });
  }, []);

  return (
    <main className="flex items-center justify-center pt-5">      
      <div className="w-full flex flex-col items-center justify-center gap-6 px-10 py-5 lg:py-16">
        <h1 className="text-4xl font-semibold leading-[40px] tracking-tighter" style={{ fontFamily: 'Poppins, sans-serif' }}>
          Our <span className="bg-[#0C58E4] text-white py-[1.5] px-1 -rotate-1 inline-block">IAL</span> Subject List
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full">
          {subjects.map((subject) => (
            <a key={subject.name} href={`/subjects/${subject.toLowerCase()}?choice=option1`}>
              <div className="cursor-pointer flex items-center justify-between px-6 w-full py-4 bg-[#BAD1FD] rounded-[12px] group hover:bg-[#A8C6FF] transition-all duration-200 border-[#153064] border-1">
                <p
                  className="text-xl font-[550] text-[#153064]"
                  style={{ fontFamily: "Poppins, sans-serif" }}
                >
                  {subject}
                </p>
                <img
                  src="/BArrowR.svg"
                  alt="Arrow Right"
                  className="w-6 h-auto group-hover:translate-x-1 transition-transform duration-200"
                />
              </div>
            </a>
          ))}
        </div>
      </div>
    </main>
  );
} 