"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { createClient } from '@supabase/supabase-js'; // Use createClient here
import { useRouter } from 'next/router'; // Use 'next/router' for useRouter in app directory components
// Removed: import { useSupabaseAuth } from "@/components/client/SupabaseAuthContext"; // Not used in this specific component for authentication
import SmallFoot from '@/components/smallFoot.jsx';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const sessions = [
  { label: "January", value: "January" },
  { label: "May/June", value: "May/June" },
  { label: "Oct/Nov", value: "Oct/Nov" },
];

// Removed: const subjectName = '{subjectName}'; // Will be dynamic
// Removed: const subjectSlug = subjectName.toLowerCase().replace(/\s+/g, '-'); // Will be derived from router
// Removed: const examCode = '{examCode}'; // Will be dynamic

const DISPLAY_START_YEAR = 2020;
const DISPLAY_END_YEAR = 2024;
const years = Array.from({ length: DISPLAY_END_YEAR - DISPLAY_START_YEAR + 1 }, (_, i) => DISPLAY_START_YEAR + i);

// SubjectButtons component that fetches subjects dynamically
const SubjectButtons = () => {
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    async function fetchSubjects() {
      console.debug('SubjectButtons: Attempting to fetch subjects for IGCSE.');
      const { data, error } = await supabase
        .from('subjects')
        .select('name')
        .order('name', { ascending: true })
        .eq('syllabus_type', 'IGCSE');
      if (!error && data) {
        setSubjects(data.map(subj => subj.name));
        console.debug('SubjectButtons: Successfully fetched subjects:', data.map(subj => subj.name));
      } else if (error) {
        console.error('SubjectButtons: Error fetching subjects:', error.message);
      } else {
        console.warn('SubjectButtons: No data returned for subjects.');
      }
    }
    fetchSubjects();
  }, []);

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {subjects.map((name, index) => {
        const slug = name.toLowerCase().replace(/\s+/g, '-');
        return (
          <Link key={index} href={`/subjects/${slug}/IGCSE/pastpapers`}>
            <button className="px-4 py-2 cursor-pointer bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition">
              {name}
            </button>
          </Link>
        );
      })}
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
  const router = useRouter();
  const { slug } = router.query; // Get the slug from the URL

  // State to hold dynamically fetched subjectName and examCode
  const [subjectName, setSubjectName] = useState(null);
  const [examCode, setExamCode] = useState(null);

  const [selectedUnits, setSelectedUnits] = useState([]);
  const [papers, setPapers] = useState([]);
  const [selectedYears, setSelectedYears] = useState([]);
  const [error, setError] = useState(null);
  const [units, setUnits] = useState([]);
  const [expandedUnits, setExpandedUnits] = useState({});
  // const { session } = useSupabaseAuth(); // Commented out as session is not directly used here

  const [showYearDropdown, setShowYearDropdown] = useState(false);
  const [showUnitDropdown, setShowUnitDropdown] = useState(false);
  const [selectedSpec, setSelectedSpec] = useState(null);
  const [showSpecDropdown, setShowSpecDropdown] = useState(false);

  const yearDropdownRef = useRef(null);
  const unitDropdownRef = useRef(null);
  const specDropdownRef = useRef(null);
  const pastPaperLinksContainerRef = useRef(null); // Ref for the main container of past paper links

  // --- NEW useEffect for fetching subjectName, examCode, and units ---
  useEffect(() => {
    // Only fetch if slug is available from the router
    if (!slug) return;

    // Convert slug back to approximate subject name for fetching
    // This assumes your subject names are just space-separated words (e.g., 'physics' -> 'Physics')
    const decodedSubjectName = slug.replace(/-/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    console.debug('fetchSubjectDetails: Decoded subject name from slug:', decodedSubjectName);

    async function fetchSubjectDetails() {
      setError(null); // Clear previous errors related to subject details
      try {
        const { data, error: subjectError } = await supabase
          .from('subjects')
          .select('name, code, units') // Select name, code, and units in one go
          .eq('name', decodedSubjectName)
          .eq('syllabus_type', 'IGCSE')
          .single();

        if (subjectError) {
          console.error('Error fetching subject details:', subjectError.message);
          setError(subjectError);
          setSubjectName('N/A');
          setExamCode('N/A');
          setUnits([]);
          return;
        }

        if (data) {
          setSubjectName(data.name);
          setExamCode(data.code || 'N/A'); // Set exam code, fallback to N/A
          console.debug('fetchSubjectDetails: Successfully fetched subject name and exam code:', data.name, data.code);

          // Process and set units
          let fetchedUnits = data.units || [];
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
          console.debug('fetchSubjectDetails: Successfully processed units:', fetchedUnits);
        } else {
          setError(new Error(`Subject "${decodedSubjectName}" not found.`));
          setSubjectName('N/A');
          setExamCode('N/A');
          setUnits([]);
          console.warn(`fetchSubjectDetails: No data returned for subject "${decodedSubjectName}".`);
        }
      } catch (err) {
        console.error('An unexpected error occurred while fetching subject details:', err);
        setError(new Error('Failed to load subject details.'));
        setSubjectName('N/A');
        setExamCode('N/A');
        setUnits([]);
      }
    }
    fetchSubjectDetails();
  }, [slug]); // Re-run when the slug changes

  // Function to fetch papers
  useEffect(() => {
    // Only fetch papers if subjectName has been successfully set (meaning subject details are loaded)
    if (!subjectName || !examCode || !router.isReady) { // Add router.isReady to ensure query params are parsed
      console.debug('fetchPapers: Skipping fetch because subjectName/examCode not ready or router not ready.');
      return;
    }

    const fetchPapersData = async () => {
      console.debug('fetchPapers: Attempting to fetch past papers...');
      setError(null); // Clear any previous errors

      try {
        // We already have subjectName, so we just need its ID for filtering papers
        const { data: subjectData, error: subjectError } = await supabase
          .from('subjects')
          .select('id')
          .eq('name', subjectName)
          .eq('syllabus_type', 'IGCSE')
          .single();

        if (subjectError || !subjectData) {
          const errMsg = subjectError ? subjectError.message : `Subject ID for "${subjectName}" not found for papers.`;
          setError(new Error(errMsg));
          console.error('fetchPapers: Error fetching subject ID:', errMsg);
          setPapers([]);
          return;
        }

        const subjectId = subjectData.id;
        console.debug('fetchPapers: Subject ID found for papers:', subjectId);

        const { data, error: papersError } = await supabase
          .from('papers')
          .select(`
            id,
            unit_code,
            question_paper_link,
            mark_scheme_link,
            examiner_report_link,
            exam_sessions!inner ( session, year )
          `)
          .eq('subject_id', subjectId)
          .order('unit_code', { ascending: true });

        if (papersError) {
          setError(papersError);
          console.error('fetchPapers: Error fetching papers data:', papersError.message);
        } else if (data && data.length > 0) {
          setPapers(data);
          console.debug('fetchPapers: Successfully fetched papers:', data);
        } else {
          setPapers([]); // Ensure papers array is empty if no data
          console.warn('fetchPapers: No past papers found for the selected subject.');
        }
      } catch (err) {
        console.error('fetchPapers: An unexpected error occurred during paper fetch:', err);
        setError(new Error('An unexpected error occurred while fetching papers.'));
      } finally {
        // Set loading to false after papers are fetched or an error occurs
        // This is crucial to prevent the 'Loading' message from persisting
        // if this was managed by a higher-level `loading` state.
        // For simplicity, this `useEffect` directly manages its loading aspect if needed,
        // but the main component's loading state (`!subjectName || !examCode || loading`) handles overall.
      }
    };
    fetchPapersData();
  }, [subjectName, examCode, router.isReady]); // Depend on subjectName, examCode, and router.isReady


  // Effect to handle clicks outside the dropdowns to close them
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (yearDropdownRef.current && !yearDropdownRef.current.contains(event.target)) {
        setShowYearDropdown(false);
      }
      if (unitDropdownRef.current && !unitDropdownRef.current.contains(event.target)) {
        setShowUnitDropdown(false);
      }
      if (specDropdownRef.current && !specDropdownRef.current.contains(event.target)) {
        setShowSpecDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Check if past paper links are displayed and re-fetch if not
  useEffect(() => {
    const checkAndRefetchPastPapers = () => {
      console.debug('checkAndRefetchPastPapers: Checking for past paper links in the DOM...');
      if (pastPaperLinksContainerRef.current) {
        const paperLinks = pastPaperLinksContainerRef.current.querySelectorAll('.space-y-2 a');
        console.debug(`checkAndRefetchPastPapers: Found ${paperLinks.length} potential past paper links.`);

        if (paperLinks.length === 0 && papers.length === 0 && !error && subjectName && examCode) {
          console.warn('checkAndRefetchPastPapers: No past paper links found in the DOM and no papers in state. Re-fetching papers...');
          // Trigger re-fetch for papers explicitly if nothing showed up and no error
          // This calls the `useEffect` above which will re-run `fetchPapersData`
          setPapers([]); // Reset papers to trigger a re-fetch of data if needed
        } else if (paperLinks.length > 0) {
          console.debug('checkAndRefetchPastPapers: Past paper links are displayed.');
        } else if (error) {
          console.debug('checkAndRefetchPastPapers: An error has prevented papers from loading, no re-fetch triggered.');
        }
      } else {
        console.debug('checkAndRefetchPastPapers: Past paper links container ref not yet available.');
      }
    };

    const timer = setTimeout(checkAndRefetchPastPapers, 1500); // 1.5 seconds delay

    return () => clearTimeout(timer); // Clean up the timer
  }, [papers, error, subjectName, examCode]); // Re-run this effect when `papers` or `error` state changes, or subject info is ready

  // Toggle functions for the main filter buttons, also closing the other dropdowns
  const handleToggleYearDropdown = () => {
    console.debug('Toggle Year Dropdown button clicked.');
    setShowYearDropdown(prev => !prev);
    setShowUnitDropdown(false); // Close unit dropdown
    setShowSpecDropdown(false); // Close spec dropdown
  };

  const handleToggleUnitDropdown = () => {
    console.debug('Toggle Unit Dropdown button clicked.');
    setShowUnitDropdown(prev => !prev);
    setShowYearDropdown(false); // Close year dropdown
    setShowSpecDropdown(false); // Close spec dropdown
  };

  const handleToggleSpecDropdown = () => {
    console.debug('Toggle Spec Dropdown button clicked.');
    setShowSpecDropdown(prev => !prev);
    setShowYearDropdown(false); // Close other dropdowns
    setShowUnitDropdown(false);
  };

  const toggleSpec = (specValue) => {
    console.debug(`Toggling spec to: ${specValue}. Current selected spec: ${selectedSpec}`);
    setSelectedSpec(prev => (prev === specValue ? null : specValue)); // Toggle selection
  };

  const toggleUnit = (unit) => {
    console.debug(`Toggling unit: ${unit}. Current selected units:`, selectedUnits);
    setSelectedUnits((prev) =>
      prev.includes(unit) ? prev.filter((u) => u !== unit) : [...prev, unit]
    );
  };

  const toggleYear = (year) => {
    console.debug(`Toggling year: ${year}. Current selected years:`, selectedYears);
    setSelectedYears((prev) =>
      prev.includes(year) ? prev.filter((y) => y !== year) : [...prev, year]
    );
  };

  // Filter papers based on selected filters
  const filteredPapers = papers && papers.filter(paper => {
    let includePaper = true;

    // Unit filter
    if (selectedUnits.length > 0) {
      // Find the unit code from the 'units' state (which has full unit details)
      const selectedUnitCodes = selectedUnits.map(unitLabel => {
        const unitObj = units.find(u => u.unit === unitLabel);
        return unitObj ? unitObj.code : null;
      }).filter(Boolean); // Filter out any nulls if unit not found

      if (!selectedUnitCodes.includes(paper.unit_code)) {
        includePaper = false;
      }
    }

    // Spec filter
    if (selectedSpec === 'new') {
      if (paper.exam_sessions?.year < NEW_SPEC_YEAR_START) {
        includePaper = false;
      }
    } else if (selectedSpec === 'old') {
      if (paper.exam_sessions?.year > OLD_SPEC_YEAR_END) {
        includePaper = false;
      }
    }

    // Year filter
    if (selectedYears.length > 0) {
      if (!selectedYears.includes(paper.exam_sessions?.year)) {
        includePaper = false;
      }
    }
    console.debug(`Paper ${paper.id} (Unit: ${paper.unit_code}, Year: ${paper.exam_sessions?.year}, Session: ${paper.exam_sessions?.session}) filter result: ${includePaper}`);
    return includePaper;
  });

  // Group papers by year and session for easier rendering
  const groupedPapers = filteredPapers.reduce((acc, paper) => {
    const year = paper.exam_sessions?.year;
    const session = paper.exam_sessions?.session;
    const unitCode = paper.unit_code;

    if (!year || !session || !unitCode) return acc; // Ensure all necessary keys exist

    if (!acc[year]) acc[year] = {};
    if (!acc[year][session]) acc[year][session] = {};
    acc[year][session][unitCode] = paper;
    return acc;
  }, {});
  console.debug('Grouped papers:', groupedPapers);


  // Overall Loading State for the component
  // We're loading if router isn't ready, or subjectName/examCode haven't been fetched yet, or an error occurred during subject fetch
  if (!router.isReady || !subjectName || !examCode || error) {
    // If an error occurred during initial subject details fetch, display it
    if (error) {
      return (
        <main className="min-h-screen bg-white flex items-center justify-center">
          <p className="text-xl text-red-600">Error loading subject details: {error.message}</p>
        </main>
      );
    }
    // Otherwise, show generic loading
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-xl text-gray-600">Loading resources...</p>
      </main>
    );
  }

  return (
    <>
      <main className="min-h-screen bg-white flex flex-col items-center justify-start py-10 m-10">
        <div className="w-full max-w-5xl px-4">
          <h1
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#000000] mb-8 text-left tracking-[-0.035em]"
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            IGCSE <span className="bg-[#1A69FA] px-2 py-1 -rotate-1 inline-block"><span className="text-[#FFFFFF]">{subjectName}</span></span> Past Papers
          </h1>

          <div
            className="inline-flex items-center justify-center px-4 py-2 mb-8 rounded-md shadow-xl"
            style={{
              border: "1.5px solid #DBDBDB",
              fontFamily: "Poppins, sans-serif",
            }}
          >
            <span className="text-md font-medium text-black tracking-tight">
              <span className="font-[501]">Exam code:</span> {examCode} {/* This now uses the state */}
            </span>
          </div>

          <h3
            className="text-sm sm:text-md lg:text-lg font-[500] leading-6 text-[#707070] mb-8 text-left tracking-[-0.015em]"
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            Explore our collection of Edexcel IGCSE {subjectName} Past Papers and Mark Schemes below. Practicing with IGCSE {subjectName} past papers is one of the most effective ways to pinpoint the topics that need more focus—helping you revise smarter and prepare confidently for your upcoming exam
          </h3>

          <div className="w-full mb-8">
            <h2 className="text-xl font-[550] tracking-tight text-[#000000] mb-4 text-left">
              Subjects
            </h2>
            <SubjectButtons />
          </div>

          <div className="w-full mb-8">
            <h2 className="text-xl font-[550] tracking-tight text-[#000000] mb-4 text-left">
              Filters
            </h2>
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
                    <span className="ml-2 text-xs bg-[#153064] text-white px-1.5 py-0.5 rounded-full">
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

          <div className="w-full space-y-10" ref={pastPaperLinksContainerRef}> {/* Assign ref here */}
            {/*
                The rendering logic for years now iterates over the keys of groupedPapers (which are filtered years).
                It also sorts them in descending order for display.
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
                                      // Updated key to use paperData.id for uniqueness
                                      key={paperData.id}
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
                                          onClick={(e) => {
                                            if (!paperData.question_paper_link) {
                                              e.preventDefault();
                                              console.warn(`Question Paper link for ${unit.unit} - ${year} ${session.label} is missing.`);
                                            } else {
                                              console.debug(`Question Paper link clicked for ${unit.unit} - ${year} ${session.label}`);
                                            }
                                          }}
                                        >
                                          Question Paper
                                        </Link>

                                        <Link
                                          href={paperData.mark_scheme_link || "#"}
                                          className={`block text-blue-600 font-medium hover:underline text-left text-sm
                                            ${!paperData.mark_scheme_link ? 'text-gray-500 tracking-tight cursor-not-allowed opacity-75' : ''}`}
                                          target="_blank"
                                          aria-disabled={!paperData.mark_scheme_link}
                                          onClick={(e) => {
                                            if (!paperData.mark_scheme_link) {
                                              e.preventDefault();
                                              console.warn(`Marking Scheme link for ${unit.unit} - ${year} ${session.label} is missing.`);
                                            } else {
                                              console.debug(`Marking Scheme link clicked for ${unit.unit} - ${year} ${session.label}`);
                                            }
                                          }}
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
                                          onClick={(e) => {
                                            if (!paperData.examiner_report_link) {
                                              e.preventDefault();
                                              console.warn(`Examiner's Report link for ${unit.unit} - ${year} ${session.label} is missing.`);
                                            } else {
                                              console.debug(`Examiner's Report link clicked for ${unit.unit} - ${year} ${session.label}`);
                                            }
                                          }}
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
                  {/* Provide feedback if no papers found after filtering for a year */}
                  {Object.keys(groupedPapers[year]).length === 0 && (
                    <p className="text-gray-500 text-center py-4">No papers found for {year} with current filters.</p>
                  )}
                </div>
              ))}
            {/* Provide feedback if no papers found at all after all filters */}
            {Object.keys(groupedPapers).length === 0 && !error && papers.length > 0 && (
                <p className="text-gray-500 text-center py-4">No papers match the selected filters. Try adjusting your selections.</p>
            )}
            {Object.keys(groupedPapers).length === 0 && !error && papers.length === 0 && (
                <p className="text-gray-500 text-center py-4">No past papers available for this subject yet.</p>
            )}
          </div>
        </div>
      </main>
      <SmallFoot />
    </>
  );
}