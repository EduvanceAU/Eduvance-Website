"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

const sessions = [
  { label: "January", value: "January" },
  { label: "May/June", value: "June" },
  { label: "Oct/Nov", value: "October" }, 
];

const currentYear = new Date().getFullYear();
const years = Array.from({ length: currentYear + 1 - 2015 + 1 }, (_, i) => 2015 + i);

const units = [
  { name: "Mechanics and Materials", code: "WPH11", unit: "Unit 1" },
  { name: "Waves and Electricity", code: "WPH12", unit: "Unit 2" },
  { name: "Practical Skills in Physics I", code: "WPH13", unit: "Unit 3" },
  { name: "Further Mechanics, Fields and Particles", code: "WPH14", unit: "Unit 4" },
  { name: "Thermodynamics, Radiation, Oscillations and Cosmology", code: "WPH15", unit: "Unit 5" },
  { name: "Practical Skills in Physics II", code: "WPH16", unit: "Unit 6" },
];

export default function PastPapersPage() {
  const subjectName = "Physics";
  const [selectedUnits, setSelectedUnits] = useState([]);
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchPapers() {
      setLoading(true);
      const { data: subjectData, error: subjectError } = await supabase
        .from('subjects')
        .select('id')
        .eq('name', subjectName)
        .single();

      if (subjectError || !subjectData) {
        setError(subjectError || new Error(`Subject "${subjectName}" not found.`));
        setLoading(false);
        return;
      }

      const subjectId = subjectData.id;

      const { data, error } = await supabase
        .from('papers')
        .select(`
          id,
          unit_code,
          question_paper_link,
          mark_scheme_link,
          examiner_report_link,
          exam_sessions ( session, year )
        `)
        .eq('subject_id', subjectId)
        .order('unit_code', { ascending: true });

      if (error) {
        setError(error);
        console.error('Error fetching papers:', error.message);
      } else {
        setPapers(data);
      }
      setLoading(false);
    }

    fetchPapers();
  }, [subjectName]); // Re-fetch if subjectName changes (though it's constant here)

  const toggleUnit = (unit) => {
    setSelectedUnits((prev) =>
      prev.includes(unit) ? prev.filter((u) => u !== unit) : [...prev, unit]
    );
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-xl text-[#153064]">Loading past papers...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-xl text-red-600">Error loading past papers: {error.message}</p>
      </main>
    );
  }

  // Group papers by year and session for easier rendering
  const groupedPapers = papers.reduce((acc, paper) => {
    const year = paper.exam_sessions?.year;
    const session = paper.exam_sessions?.session;
    const unitCode = paper.unit_code; // WPH11, WPH12, etc.

    if (!year || !session) return acc; // Skip if session/year info is missing

    if (!acc[year]) acc[year] = {};
    if (!acc[year][session]) acc[year][session] = {};
    acc[year][session][unitCode] = paper;
    return acc;
  }, {});


  return (
    <main className="min-h-screen bg-white flex flex-col items-start justify-start py-10 px-4 sm:px-6 md:px-12 lg:px-20">
      <h1
        className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#153064] mb-8 w-full max-w-6xl text-left tracking-[-0.035em]"
        style={{ fontFamily: "Poppins, sans-serif" }}
      >
        IAL Physics Past Papers
      </h1>

      <div className="w-full max-w-6xl mb-8">
        <h2 className="text-xl font-semibold text-[#153064] mb-4">
          Filter by Unit
        </h2>
        <div className="flex flex-wrap gap-2">
          {units.map((unit) => (
            <button
              key={unit.unit}
              onClick={() => toggleUnit(unit.unit)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors
                ${
                  selectedUnits.includes(unit.unit)
                    ? "bg-[#153064] text-white"
                    : "bg-gray-100 text-[#153064] hover:bg-gray-200"
                }`}
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              {unit.unit}
            </button>
          ))}
        </div>
      </div>

      <div className="w-full max-w-6xl space-y-10">
        {years.map((year) => (
          <div key={year}>
            <h2
              className="text-2xl font-semibold text-[#153064] mb-4 text-left tracking-tight"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              {year}
            </h2>

            {sessions.map((session) => (
              <div key={`${year}-${session.label}`} className="mb-4">
                <h3
                  className="text-lg tracking-tighter font-medium text-[#153064] mb-2 text-left"
                  style={{ fontFamily: "Poppins, sans-serif" }}
                >
                  {session.label} Session
                </h3>

                <div
                  className="w-full bg-blue-100 rounded-t grid grid-cols-2 px-4 py-2 mb-1 text-[#153064]"
                  style={{ fontFamily: "Poppins, sans-serif" }}
                >
                  <span className="font-semibold text-sm text-left">Exam</span>
                  <span className="font-semibold text-sm text-left">
                    Marking Scheme
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 sm:gap-x-10 gap-y-2">
                  {/* Iterate over the units that are *actually* found for this year and session */}
                  {units
                    .filter(unit => selectedUnits.length === 0 || selectedUnits.includes(unit.unit))
                    .map((unit) => {
                      const paperData = groupedPapers?.[year]?.[session.value]?.[unit.code];

                      // Only render if paper data exists and matches filter
                      if (paperData) {
                        return (
                          <div
                            key={`${year}-${session.label}-${unit.unit}`}
                            className="contents"
                          >
                            <Link
                              href={paperData.question_paper_link || "#"}
                              className={`text-blue-600 font-medium hover:underline text-left max-w-[250px]
                                ${!paperData.question_paper_link ? 'text-gray-500 cursor-not-allowed opacity-75' : ''}`}
                              target="_blank"
                              style={{ fontFamily: "Poppins, sans-serif" }}
                              aria-disabled={!paperData.question_paper_link}
                              onClick={(e) => !paperData.question_paper_link && e.preventDefault()}
                            >
                              {`${session.label} ${year} ${unit.unit}: ${unit.name} (QP)`}
                            </Link>

                            <Link
                              href={paperData.mark_scheme_link || "#"}
                              className={`text-blue-600 font-medium hover:underline text-left max-w-[250px]
                                ${!paperData.mark_scheme_link ? 'text-gray-500 cursor-not-allowed opacity-75' : ''}`}
                              target="_blank"
                              style={{ fontFamily: "Poppins, sans-serif" }}
                              aria-disabled={!paperData.mark_scheme_link}
                              onClick={(e) => !paperData.mark_scheme_link && e.preventDefault()}
                            >
                              {`${session.label} ${year} ${unit.unit}: ${unit.name} (MS)`}
                            </Link>
                          </div>
                        );
                      }
                      return null; // Don't render if no data for this specific paper
                    })}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </main>
  );
}