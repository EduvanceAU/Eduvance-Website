"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabaseClient";

const sessions = [
  { label: "January", value: "January" },
  { label: "May/June", value: "May/June" },
  { label: "Oct/Nov", value: "Oct/Nov" },
];

const examCode = '4PH1' // Updated for IGCSE Physics

const DISPLAY_START_YEAR = 2020;
const DISPLAY_END_YEAR = 2024;
const years = Array.from({ length: DISPLAY_END_YEAR - DISPLAY_START_YEAR + 1 }, (_, i) => DISPLAY_START_YEAR + i);


const units = [
  { name: "Paper 1P (Physics)", code: "1P", unit: "1P" }, // `code` and `unit` now directly match "1P"
  { name: "Paper 1PR (Physics - Practicals)", code: "1PR", unit: "1PR" },
  { name: "Paper 2P (Physics)", code: "2P", unit: "2P" },
  { name: "Paper 2PR (Physics - Practicals)", code: "2PR", unit: "2PR" }, // Assuming "Paper PR" in JSON refers to "2PR"
];


const subjects = [
  { name: "Physics", link: "/sub_links/physics/pastpapers" },
  { name: "Chemistry", link: "/sub_links/chemistry/pastpapers" },
  { name: "Biology", link: "/sub_links/biology/pastpapers" },
  { name: "Maths", link: "/sub_links/maths/pastpapers" },
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

// NEW CONSTANTS FOR SPEC FILTER
const NEW_SPEC_YEAR_START = 2018;
const OLD_SPEC_YEAR_END = 2017; // Equivalent to anything <= 2017

// Define spec options
const specs = [
  { label: 'New Spec', value: 'new' },
  { label: 'Old Spec', value: 'old' },
];

export default function IGCSEPastPapersPage() {
  const subjectName = "Physics";
  const syllabusType = "IGCSE"; // This page is specifically for IGCSE papers

  const [selectedUnits, setSelectedUnits] = useState([]);
  const [papers, setPapers] = useState([]);
  const [selectedYears, setSelectedYears] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showYearDropdown, setShowYearDropdown] = useState(false);
  const [showUnitDropdown, setShowUnitDropdown] = useState(false);
  // NEW STATE FOR SPEC FILTER
  const [selectedSpec, setSelectedSpec] = useState(null); // 'new', 'old', or null
  const [showSpecDropdown, setShowSpecDropdown] = useState(false);

  const yearDropdownRef = useRef(null);
  const unitDropdownRef = useRef(null);
  // NEW REF FOR SPEC FILTER
  const specDropdownRef = useRef(null);


  // Effect to handle clicks outside the dropdowns to close them
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (yearDropdownRef.current && !yearDropdownRef.current.contains(event.target)) {
        setShowYearDropdown(false);
      }
      if (unitDropdownRef.current && !unitDropdownRef.current.contains(event.target)) {
        setShowUnitDropdown(false);
      }
      // NEW: Close spec dropdown if click outside
      if (specDropdownRef.current && !specDropdownRef.current.contains(event.target)) {
        setShowSpecDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []); // Empty dependency array means this runs once on mount

  // Toggle functions for the main filter buttons, also closing the other dropdowns
  const handleToggleYearDropdown = () => {
    setShowYearDropdown(prev => !prev);
    setShowUnitDropdown(false); // Close unit dropdown
    setShowSpecDropdown(false); // NEW: Close spec dropdown
  };

  const handleToggleUnitDropdown = () => {
    setShowUnitDropdown(prev => !prev);
    setShowYearDropdown(false); // Close year dropdown
    setShowSpecDropdown(false); // NEW: Close spec dropdown
  };

  // NEW HANDLER FOR SPEC FILTER
  const handleToggleSpecDropdown = () => {
    setShowSpecDropdown(prev => !prev);
    setShowYearDropdown(false); // Close other dropdowns
    setShowUnitDropdown(false);
  };

  // NEW TOGGLE FUNCTION FOR SPEC (single-select behavior)
  const toggleSpec = (specValue) => {
    setSelectedSpec(prev => (prev === specValue ? null : specValue)); // Toggle selection
  };

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

  // UPDATED useEffect to include Spec filter logic and move existing filters to query
  useEffect(() => {
    async function fetchPapers() {
      setLoading(true);
      setError(null); // Clear previous errors

      const { data: subjectData, error: subjectError } = await supabase
        .from('subjects')
        .select('id')
        .eq('name', subjectName)
        .eq('syllabus_type', syllabusType)
        .single();

      if (subjectError || !subjectData) {
        setError(subjectError || new Error(`Subject "${subjectName}" for syllabus type "${syllabusType}" not found.`));
        setLoading(false);
        return;
      }

      const subjectId = subjectData.id;

      let query = supabase
        .from('papers')
        .select(`
          id,
          unit_code,
          question_paper_link,
          mark_scheme_link,
          examiner_report_link,
          exam_sessions!inner ( session, year )
        `)
        .eq('subject_id', subjectId);

      // --- Filter by selected Units (moved from client-side render filtering) ---
      if (selectedUnits.length > 0) {
        // Convert unit labels (e.g., "1P") to their codes (e.g., "1P") for the query
        const selectedUnitCodes = selectedUnits.map(unitLabel => units.find(u => u.unit === unitLabel)?.code).filter(Boolean);
        if (selectedUnitCodes.length > 0) {
          query = query.in('unit_code', selectedUnitCodes);
        } else {
          // If no valid unit codes found for selected units, return no papers
          setPapers([]);
          setLoading(false);
          return;
        }
      }

      // --- Determine the effective range of years based on Spec filter ---
      let effectiveMinYear = -Infinity; // No lower bound initially
      let effectiveMaxYear = Infinity;  // No upper bound initially

      if (selectedSpec === 'new') {
        effectiveMinYear = NEW_SPEC_YEAR_START; // From 2018 onwards
      } else if (selectedSpec === 'old') {
        effectiveMaxYear = OLD_SPEC_YEAR_END; // Up to 2017
      }

      // Apply these derived min/max years to the query
      if (effectiveMinYear !== -Infinity) {
        query = query.gte('exam_sessions.year', effectiveMinYear);
      }
      if (effectiveMaxYear !== Infinity) {
        query = query.lte('exam_sessions.year', effectiveMaxYear);
      }

      // --- Apply specific years filter, which further refines the results ---
      if (selectedYears.length > 0) {
        // Filter selectedYears to only include those within the current effective spec range
        const validSelectedYears = selectedYears.filter(year =>
          year >= effectiveMinYear && year <= effectiveMaxYear
        );
        if (validSelectedYears.length > 0) {
          query = query.in('exam_sessions.year', validSelectedYears);
        } else {
          // If specific years are chosen but none fall within the determined spec range,
          // then no papers should be shown. Exit early to avoid empty query results.
          setPapers([]);
          setLoading(false);
          return;
        }
      } else if (!selectedSpec) {
        // If neither specific years nor a spec is selected, apply default display range (2020-2024).
        // This ensures the initial view shows papers within the most common range.
        query = query.gte('exam_sessions.year', DISPLAY_START_YEAR)
                     .lte('exam_sessions.year', DISPLAY_END_YEAR);
      }
      // If selectedSpec is active but selectedYears is empty, the effectiveMin/MaxYear filters
      // handle the year range, so no default DISPLAY_START/END_YEAR filter is needed here.

      // --- DO NOT CHANGE THIS ORDER BIT AS PER YOUR REQUEST ---
      // This will order by unit_code ascending as the primary sort from the DB.
      // The year ordering in the UI will still be handled client-side in rendering.
      query = query.order('unit_code', { ascending: true });

      const { data, error: papersError } = await query;

      if (papersError) {
        setError(papersError);
        console.error('Error fetching papers:', papersError.message);
      } else {
        setPapers(data);
      }
      setLoading(false);
    }

    fetchPapers();
  }, [subjectName, syllabusType, selectedUnits, selectedYears, selectedSpec]);


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
  // This groupedPapers will now contain only the data filtered by Supabase
  const groupedPapers = papers.reduce((acc, paper) => {
    const year = paper.exam_sessions?.year;
    const session = paper.exam_sessions?.session;
    const unitCode = paper.unit_code; // 1P, 1PR, etc.

    if (!year || !session) return acc; // Skip if session/year info is missing

    if (!acc[year]) acc[year] = {};
    if (!acc[year][session]) acc[year][session] = {};
    acc[year][session][unitCode] = paper;
    return acc;
  }, {});


  return (
    <main className="min-h-screen bg-white flex flex-col items-center justify-start py-10">
      <div className="w-full max-w-5xl px-4">
        <h1
          className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#000000] mb-8 text-left tracking-[-0.035em]"
          style={{ fontFamily: "Poppins, sans-serif" }}
        >
          IGCSE <span className="bg-[#1A69FA] px-2 py-1 -rotate-1 inline-block"><span className="text-[#FFFFFF]">Physics</span></span> Past Papers
        </h1>

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

        <h3
          className="text-sm sm:text-md lg:text-lg font-[500] leading-6 text-[#707070] mb-8 text-left tracking-[-0.015em]"
          style={{ fontFamily: "Poppins, sans-serif" }}
        >
          Explore our collection of Edexcel IGCSE Level Physics Past Papers and Mark Schemes below. Practicing with IGCSE Physics past papers is one of the most effective ways to pinpoint the topics that need more focus—helping you revise smarter and prepare confidently for your upcoming exam
        </h3>

        <div className="w-full mb-8">
          <h2 className="text-xl font-[550] tracking-tight text-[#000000] mb-4 text-left">
            Filters & Subjects
          </h2>
          <SubjectButtons />
          <div className="flex flex-wrap gap-2">

            {/* Years Filter Button & Dropdown */}
            <div className="relative" ref={yearDropdownRef}>
              <button
                onClick={handleToggleYearDropdown}
                className="px-4 py-2 rounded-lg border cursor-pointer border-gray-400 text-sm font-[501] text-[#153064] hover:bg-gray-50 transition-colors flex items-center"
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
                className="px-4 py-2 rounded-lg border cursor-pointer border-gray-400 text-sm font-[501] text-[#153064] hover:bg-gray-50 transition-colors flex items-center"
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

            {/* NEW SPEC FILTER BUTTON & DROPDOWN */}
            <div className="relative" ref={specDropdownRef}>
              <button
                onClick={handleToggleSpecDropdown}
                className="px-4 py-2 rounded-lg cursor-pointer border border-gray-400 text-sm font-[501] text-[#000000] hover:bg-gray-50 transition-colors flex items-center"
                style={{ fontFamily: "Poppins, sans-serif" }}
              >
                Spec
                {selectedSpec && (
                  <span className="ml-2 text-xs bg-[#000000] text-white px-1.5 py-0.5 rounded-full">
                    {selectedSpec === 'new' ? 'New' : 'Old'}
                  </span>
                )}
              </button>
              {showSpecDropdown && (
                <div className="absolute z-10 bg-white shadow-lg rounded-lg mt-2 py-2 w-48 max-h-60 overflow-y-auto border border-gray-200">
                  {specs.map((specOption) => (
                    <div
                      key={specOption.value}
                      onClick={() => toggleSpec(specOption.value)}
                      className={`cursor-pointer px-4 py-2 text-sm flex items-center transition-colors
                        ${selectedSpec === specOption.value ? 'bg-blue-50 text-blue-700 font-semibold' : 'hover:bg-gray-100 text-gray-900'}`}
                      style={{ fontFamily: "Poppins, sans-serif" }}
                    >
                      {/* Checkbox (visual only, logic is single-select via click) */}
                      <input
                        type="checkbox"
                        checked={selectedSpec === specOption.value}
                        onChange={() => {}} // onChange is required but click handler on div manages state
                        className="form-checkbox h-4 w-4 text-blue-600 rounded mr-2"
                      />
                      <span>{specOption.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* END NEW SPEC FILTER */}

          </div>
        </div>

        <div className="w-full space-y-10">
          {/*
              The rendering logic for years now iterates over the keys of groupedPapers (which are filtered years).
              It also sorts them in descending order for for display.
          */}
          {Object.keys(groupedPapers)
            .sort((a, b) => b - a) // Sort years descending for display
            .map((year) => (
              <div key={year}>
                <h2
                  className="text-2xl font-semibold text-[#153064] mb-4 text-left tracking-tight"
                  style={{ fontFamily: "Poppins, sans-serif" }}
                >
                  {year}
                </h2>

                {/* Outer Card for Each Session */}
                {sessions.map((session) => (
                  // Only render session card if there are papers for it in the grouped data
                  groupedPapers[year][session.value] && Object.keys(groupedPapers[year][session.value]).length > 0 ? (
                    <div
                      key={`${year}-${session.label}-session-card`}
                      className="bg-white rounded-lg shadow-md mb-8 border border-gray-200 overflow-hidden" // Session Card styling, added overflow-hidden
                    >
                      {/* Blue Header for the Session Card */}
                      <div className="bg-[#2871F9] text-white tracking-tight p-4 text-left font-bold text-xl sm:text-2xl"
                          style={{ fontFamily: "Poppins, sans-serif" }}>
                        {session.label} Session {year} {/* Added year here for clarity */}
                      </div>

                      {/* Content area of the Session Card */}
                      <div className="p-6"> {/* Padding for the content inside the card */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"> {/* Grid for Unit Cards */}
                          {/* Iterate over the units from the 'units' array, but only display if paper data exists */}
                          {units
                            .map((unit) => {
                              const paperData = groupedPapers?.[year]?.[session.value]?.[unit.code];

                              // Only render unit card if paper data exists for this unit in this session/year
                              if (paperData) {
                                return (
                                  <div
                                    key={`${year}-${session.label}-${unit.unit}-unit-card`}
                                    className="bg-gray-50 rounded-lg p-4 border border-gray-100 flex flex-col justify-between" // Unit Card styling
                                    style={{ fontFamily: "Poppins, sans-serif" }}
                                  >
                                    <h4 className="text-md font-semibold tracking-tight text-[#333333] mb-3 text-left">
                                      {`${unit.unit}: ${unit.name}`}
                                    </h4>
                                    <div className="space-y-2"> {/* Links container */}
                                      <Link
                                        href={paperData.question_paper_link || "#"}
                                        className={`block text-blue-600 font-medium hover:underline text-left text-sm
                                          ${!paperData.question_paper_link ? 'text-gray-500 tracking-tight cursor-not-allowed opacity-75' : ''}`}
                                        target="_blank"
                                        aria-disabled={!paperData.question_paper_link}
                                        onClick={(e) => !paperData.question_paper_link && e.preventDefault()}
                                      >
                                        Question Paper
                                      </Link>

                                      <Link
                                        href={paperData.mark_scheme_link || "#"}
                                        className={`block text-blue-600 font-medium hover:underline text-left text-sm
                                          ${!paperData.mark_scheme_link ? 'text-gray-500 tracking-tight cursor-not-allowed opacity-75' : ''}`}
                                        target="_blank"
                                        aria-disabled={!paperData.mark_scheme_link}
                                        onClick={(e) => !paperData.mark_scheme_link && e.preventDefault()}
                                      >
                                        Marking Scheme
                                      </Link>

                                      {/* Examiner's Report Link */}
                                      <Link
                                        href={paperData.examiner_report_link || "#"}
                                        className={`block text-blue-600 font-medium hover:underline text-left text-sm
                                          ${!paperData.examiner_report_link ? 'text-gray-500 tracking-tight cursor-not-allowed opacity-75' : ''}`}
                                        target="_blank"
                                        aria-disabled={!paperData.examiner_report_link}
                                        onClick={(e) => !paperData.examiner_report_link && e.preventDefault()}
                                      >
                                        Examiner's Report
                                      </Link>
                                    </div>
                                  </div>
                                );
                              }
                              return null;
                            })}
                        </div>
                      </div>
                    </div>
                  ) : null // Don't render session div if no papers exist for it
                ))}
              </div>
            ))}
        </div>
      </div>
    </main>
  );
}