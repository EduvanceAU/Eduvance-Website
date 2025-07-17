"use client"

import { supabase } from './lib/supabaseClient';
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
    <main className="min-h-screen bg-white p-8 pt-16">
      <h1 className="text-2xl font-bold mb-6 text-[#0C58E4]">IAL Subjects</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {subjects.map(subject => (
          <Link
            key={subject}
            href={`/subjects/${subject.toLowerCase()}?choice=option1`}
            className="block px-4 py-3 bg-[#BAD1FD] rounded-lg text-black font-semibold hover:bg-[#0C58E4] hover:text-white transition-colors duration-200"
          >
            {subject}
          </Link>
        ))}
      </div>
    </main>
  );
} 