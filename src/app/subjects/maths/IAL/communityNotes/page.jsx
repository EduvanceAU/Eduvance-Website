"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { useSupabaseAuth } from "@/components/client/SupabaseAuthContext";

const subjects = [
  { name: "Physics", link: "/subjects/physics/IAL/communityNotes" },
  { name: "Chemistry", link: "/subjects/chemistry/IAL/communityNotes" },
  { name: "Biology", link: "/subjects/biology/IAL/communityNotes" },
  { name: "Maths", link: "/subjects/maths/IAL/communityNotes" },
];

const SubjectButtons = () => {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {subjects.map((subject, index) => (
        <Link key={index} href={subject.link}>
          <button className="px-4 py-2 cursor-pointer bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition">
            {subject.name}
          </button>
        </Link>
      ))}
    </div>
  );
};

export default function IALCommunityNotesPage() {
  const examCode = '8PH0';
  const { session, user, loading: authLoading } = useSupabaseAuth();
  const [units, setUnits] = useState([]);
  const [expandedUnits, setExpandedUnits] = useState({});
  const [unitNotes, setUnitNotes] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const toggleUnit = (unit) => {
    setExpandedUnits(prev => ({
      ...prev,
      [unit]: !prev[unit]
    }));
  };

  // Fetch units from subject table
  useEffect(() => {
    const fetchUnits = async () => {
      const { data: subjectData, error: subjectError } = await supabase
        .from('subjects')
        .select('units')
        .eq('name', 'Mathematics')
        .eq('syllabus_type', 'IAL')
        .single();
      if (subjectError || !subjectData) {
        setError(subjectError || new Error('Subject "Mathematics" not found.'));
        return;
      }
      let fetchedUnits = subjectData.units || [];
      // Sort by unit number if possible, fallback to name
      fetchedUnits.sort((a, b) => {
        const getUnitNum = (u) => {
          const match = (u.unit || '').match(/Unit\s*(\d+)/i);
          return match ? parseInt(match[1], 10) : Number.MAX_SAFE_INTEGER;
        };
        const numA = getUnitNum(a);
        const numB = getUnitNum(b);
        if (numA !== numB) return numA - numB;
        return (a.name || '').localeCompare(b.name || '');
      });
      setUnits(fetchedUnits);
      setExpandedUnits(fetchedUnits.reduce((acc, unit) => {
        acc[unit.unit] = true;
        return acc;
      }, {}));
    };
    fetchUnits();
  }, []);
  return (
    <main className="min-h-screen bg-white flex flex-col items-center justify-start py-10">
      <div className="w-full max-w-5xl px-4">
        <h1
          className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#000000] mb-8 text-left tracking-[-0.035em]"
          style={{ fontFamily: "Poppins, sans-serif" }}
        >
          IAL <span className="bg-[#1A69FA] px-2 py-1 -rotate-1 inline-block"><span className="text-[#FFFFFF]">Mathematics</span></span> Community Notes
        </h1>

        <h3
          className="text-sm sm:text-md lg:text-lg font-[500] leading-6 text-[#707070] mb-8 text-left tracking-[-0.015em]"
          style={{ fontFamily: "Poppins, sans-serif" }}
        >
          Explore our collection of Edexcel A Level Mathematics community-contributed resources, including detailed notes, explanations, and revision tips. These resources are perfect for deepening your understanding, clarifying tricky concepts, and supporting your study alongside past papers.
        </h3>

        <div
          className="inline-flex items-center justify-center px-4 py-2 mb-8 rounded-md shadow-xl"
          style={{
            border: "1.5px solid #DBDBDB",
            fontFamily: "Poppins, sans-serif",
          }}
        >
          <span className="text-md font-medium text-black tracking-tight">
            <span className="font-[501]">Exam code:</span> {examCode}
          </span>
        </div>

        <div className="w-full mb-8">
          <h2 className="text-xl font-[550] tracking-tight text-[#000000] mb-4 text-left">
            Subjects
          </h2>
          <SubjectButtons />
          <div className="flex flex-wrap gap-2">
          </div>
        </div>

        <div className="w-full space-y-10">
          {units.map((unit) => (
            <div
              key={unit.unit}
              className="bg-white rounded-lg shadow-md mb-8 border border-gray-200 overflow-hidden"
            >
              <div
                className="bg-[#2871F9] text-white tracking-tight p-4 text-left font-bold text-xl sm:text-2xl cursor-pointer"
                style={{ fontFamily: "Poppins, sans-serif" }}
                onClick={() => toggleUnit(unit.unit)}
              >
                {unit.name}
              </div>

              {expandedUnits[unit.unit] && (
                <div className="p-6">
                  {/* Add your links here, for example: */}
                  <ul className="list-disc list-inside">
                    <li>
                      <Link
                        href="#"
                        className="text-blue-600 hover:underline"
                      >
                        Link to Note 1
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="#"
                        className="text-blue-600 hover:underline"
                      >
                        Link to Note 2
                      </Link>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
