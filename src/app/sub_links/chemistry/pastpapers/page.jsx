"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabaseClient";

const sessions = [
  { label: "January", value: "January" },
  { label: "May/June", value: "June" },
  { label: "Oct/Nov", value: "October" }, 
];

const DISPLAY_START_YEAR = 2020;
const DISPLAY_END_YEAR = 2024;
const years = Array.from({ length: DISPLAY_END_YEAR - DISPLAY_START_YEAR + 1 }, (_, i) => DISPLAY_START_YEAR + i);

const units = [
  { name: "Organic Chemistry", code: "WCH11", unit: "Unit 1" },
  { name: "Inorganic Chemistry", code: "WCH12", unit: "Unit 2" },
  { name: "Physical Chemistry", code: "WCH13", unit: "Unit 3" },
  { name: "Practical Skills in Chemistry I", code: "WCH14", unit: "Unit 4" },
  { name: "Practical Skills in Chemistry II", code: "WCH15", unit: "Unit 5" },
];

// Define a simple color palette for the dropdown items
const colorPalette = [
  "bg-blue-100 text-blue-700",
  "bg-green-100 text-green-700",
  "bg-yellow-100 text-yellow-700",
  "bg-red-100 text-red-700",
  "bg-purple-100 text-purple-700",
  "bg-indigo-100 text-indigo-700",
  "bg-pink-100 text-pink-700",
  "bg-teal-100 text-teal-700",
];

// Helper to get a consistent color class based on index
const getColorClass = (index) => {
  return colorPalette[index % colorPalette.length];
};

export default function PastPapersPage() {
  const subjectName = "Chemistry";
  const [selectedUnits, setSelectedUnits] = useState([]);
  const [papers, setPapers] = useState([]);
  const [selectedYears, setSelectedYears] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showYearDropdown, setShowYearDropdown] = useState(false);
  const [showUnitDropdown, setShowUnitDropdown] = useState(false);

  const yearDropdownRef = useRef(null);
  const unitDropdownRef = useRef(null);

  // Effect to handle clicks outside the dropdowns to close them
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (yearDropdownRef.current && !yearDropdownRef.current.contains(event.target)) {
        setShowYearDropdown(false);
      }
      if (unitDropdownRef.current && !unitDropdownRef.current.contains(event.target)) {
        setShowUnitDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []); // Empty dependency array means this runs once on mount

  // Toggle functions for the main filter buttons, also closing the other dropdown
  const handleToggleYearDropdown = () => {
    setShowYearDropdown(prev => !prev);
    setShowUnitDropdown(false); // Close unit dropdown if year dropdown is opened
  };

  const handleToggleUnitDropdown = () => {
    setShowUnitDropdown(prev => !prev);
    setShowYearDropdown(false); // Close year dropdown if unit dropdown is opened
  };

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

  const toggleYear = (year) => {
    setSelectedYears((prev) =>
      prev.includes(year) ? prev.filter((y) => y !== year) : [...prev, year]
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
        IAL Chemistry Past Papers
      </h1>

      <div className="w-full max-w-6xl mb-8">
        <h2 className="text-xl font-semibold text-[#153064] mb-4">
          Filters
        </h2>
        <div className="flex flex-wrap gap-2">

          {/* Years Filter Button & Dropdown */}
          <div className="relative" ref={yearDropdownRef}>
            <button
              onClick={handleToggleYearDropdown}
              className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-[#153064] hover:bg-gray-50 transition-colors flex items-center"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              Years
              {selectedYears.length > 0 && (
                <span className="ml-2 text-xs bg-[#153064] text-white px-1.5 py-0.5 rounded-full">
                  {selectedYears.length}
                </span>
              )}
            </button>
            {showYearDropdown && (
              <div className="absolute z-10 bg-white shadow-lg rounded-lg mt-2 py-2 w-48 max-h-60 overflow-y-auto border border-gray-200">
                  {years.sort((a, b) => b - a).map((year, index) => (
                  <div
                    key={year}
                    onClick={() => toggleYear(year)}
                    className={`cursor-pointer px-4 py-2 text-sm flex items-center transition-colors
                      ${selectedYears.includes(year) ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-100 text-gray-900'}`}
                    style={{ fontFamily: "Poppins, sans-serif" }}
                  >
                    {/* Square Checkbox */}
                    <input
                      type="checkbox"
                      checked={selectedYears.includes(year)}
                      onChange={() => {}} // onChange is required but we handle click on div
                      className="form-checkbox h-4 w-4 text-blue-600 rounded mr-2"
                    />
                    {/* Colored Pill for Year */}
                    <span className={`mr-2 px-2 py-0.5 rounded-full text-xs font-semibold ${getColorClass(index)}`}>
                      {year}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Units Filter Button & Dropdown */}
          <div className="relative" ref={unitDropdownRef}>
            <button
              onClick={handleToggleUnitDropdown}
              className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-[#153064] hover:bg-gray-50 transition-colors flex items-center"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              Units
              {selectedUnits.length > 0 && (
                <span className="ml-2 text-xs bg-[#153064] text-white px-1.5 py-0.5 rounded-full">
                  {selectedUnits.length}
                </span>
              )}
            </button>
            {showUnitDropdown && (
              <div className="absolute z-10 bg-white shadow-lg rounded-lg mt-2 py-2 w-max max-h-60 overflow-y-auto border border-gray-200">
                {units.map((unit, index) => (
                  <div
                    key={unit.unit}
                    onClick={() => toggleUnit(unit.unit)}
                    className={`cursor-pointer px-4 py-2 text-sm flex items-center transition-colors
                      ${selectedUnits.includes(unit.unit) ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-100 text-gray-900'}`}
                    style={{ fontFamily: "Poppins, sans-serif" }}
                  >
                    {/* Square Checkbox */}
                    <input
                      type="checkbox"
                      checked={selectedUnits.includes(unit.unit)}
                      onChange={() => {}} // onChange is required but we handle click on div
                      className="form-checkbox h-4 w-4 text-blue-600 rounded mr-2"
                    />
                    {/* Colored Pill for Unit */}
                    <span className={`mr-2 px-2 py-0.5 rounded-full text-xs font-semibold ${getColorClass(index)}`}>
                      {unit.unit}
                    </span>
                    <span>{unit.name}</span> {/* Full unit name */}
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>

      <div className="w-full max-w-6xl space-y-10">
        {years.sort((a, b) => b - a).filter(year => selectedYears.length === 0 || selectedYears.includes(year)).map((year) => ( 
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
                      return null;
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