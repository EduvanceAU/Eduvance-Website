"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

import SmallFoot from '@/components/smallFoot.jsx';

// SubjectButtons component remains largely the same, but its links are now '/subjects/${slug}/IAL/resources'
const SubjectButtons = () => {
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    async function fetchSubjects() {
      const { data, error } = await supabase
        .from('subjects')
        .select('name')
        .order('name', { ascending: true })
        .eq('syllabus_type', 'IAL');
      if (!error && data) {
        setSubjects(data.map(subj => subj.name));
      }
    }
    fetchSubjects();
  }, []);

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {subjects.map((name, index) => {
        const slug = name.toLowerCase().replace(/\s+/g, '-');
        return (
          <Link key={index} href={`/subjects/${slug}/IAL/resources`}> {/* Ensure this href is correct for your routing */}
            <button className="px-4 py-2 cursor-pointer bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition">
              {name}
            </button>
          </Link>
        );
      })}
    </div>
  );
};

export default function IALResources() {
  const router = useRouter();
  const { slug } = router.query; // Get the slug from the URL

  // State for dynamically fetched subject name and exam code
  const [subjectName, setSubjectName] = useState(null);
  const [examCode, setExamCode] = useState(null);

  const [units, setUnits] = useState([]);
  const [expandedUnits, setExpandedUnits] = useState({});
  const [unitResources, setUnitResources] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const toggleUnit = (unit) => {
    setExpandedUnits(prev => ({
      ...prev,
      [unit]: !prev[unit]
    }));
  };

  // --- NEW useEffect for fetching subjectName and examCode ---
  useEffect(() => {
    // Only fetch if slug is available from the router
    if (!slug) return;

    // Convert slug back to approximate subject name for fetching
    // This assumes your subject names are just space-separated words
    const decodedSubjectName = slug.replace(/-/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

    async function fetchSubjectDetails() {
      try {
        const { data, error } = await supabase
          .from('subjects')
          .select('name, code, units') // Select name, code, and units in one go
          .eq('name', decodedSubjectName)
          .eq('syllabus_type', 'IAL')
          .single();

        if (error) {
          console.error('Error fetching subject details:', error.message);
          setError(error);
          setSubjectName('N/A');
          setExamCode('N/A');
          return;
        }

        if (data) {
          setSubjectName(data.name);
          setExamCode(data.code || 'N/A'); // Set exam code, fallback to N/A
          // Also set units here to avoid a duplicate fetch
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
        } else {
          setError(new Error(`Subject "${decodedSubjectName}" not found.`));
          setSubjectName('N/A');
          setExamCode('N/A');
        }
      } catch (err) {
        console.error('An unexpected error occurred while fetching subject details:', err);
        setError(new Error('Failed to load subject details.'));
        setSubjectName('N/A');
        setExamCode('N/A');
      }
    }
    fetchSubjectDetails();
  }, [slug]); // Re-run when the slug changes

  // Fetch resources based on the fetched subjectName
  useEffect(() => {
    // Only proceed if subjectName is available (meaning details have been fetched)
    if (!subjectName || !examCode) return; // Wait for both subjectName and examCode to be set

    setLoading(true);
    const fetchResources = async () => {
      try {
        const { data: subjectData, error: subjectError } = await supabase
          .from('subjects')
          .select('id')
          .eq('name', subjectName)
          .eq('syllabus_type', 'IAL')
          .single();

        if (subjectError || !subjectData) {
          setError(subjectError || new Error(`Subject "computer-science" not found for resource fetching.`));
          setLoading(false);
          return;
        }

        const subjectId = subjectData.id;

        const { data: resources, error: resourcesError } = await supabase
          .from('resources')
          .select('*')
          .eq('subject_id', subjectId)
          .eq('approved', "Approved")
          .order('created_at', { ascending: false });

        if (resourcesError) {
          setError(resourcesError);
          setLoading(false);
          return;
        }

        const groupedResources = {};

        resources.forEach((resource) => {
          const unit = resource.unit_chapter_name || 'General';

          if (!groupedResources[unit]) {
            groupedResources[unit] = [];
          }

          let group = groupedResources[unit].find((grp) => grp.heading === resource.resource_type);
          if (!group) {
            group = { heading: resource.resource_type, links: [] };
            groupedResources[unit].push(group);
          }

          group.links.push({
            name: resource.title,
            url: resource.link,
            description: resource.description,
            contributor: resource.uploaded_by_username,
            last: resource.updated_at
          });
        });
        setUnitResources(groupedResources);
        setLoading(false);
      } catch (error) {
        setError(error);
        setLoading(false);
      }
    };
    fetchResources();
  }, [subjectName, examCode]); // Depend on subjectName and examCode to ensure they are fetched

  // --- Loading State for the entire page ---
  // We are loading if subjectName or examCode are still null, or if resources are being fetched
  if (!subjectName || !examCode || loading) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-xl text-gray-600">Loading resources...</p>
      </main>
    );
  }

  // --- Error State for the entire page ---
  if (error) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-xl text-red-600">Error loading resources: {error.message}</p>
      </main>
    );
  }

  return (
    <>
      <main className="min-h-screen bg-white flex flex-col items-center justify-start py-10 m-10">
        <div className="w-full max-w-5xl px-4">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#000000] mb-8 text-left tracking-[-0.035em]" style={{ fontFamily: "Poppins, sans-serif" }}>
            IAL <span className="bg-[#1A69FA] px-2 py-1 -rotate-1 inline-block"><span className="text-[#FFFFFF]">Computer Science</span></span> Resources
          </h1>

          <div className="inline-flex items-center justify-center px-4 py-2 mb-8 rounded-md" style={{ border: "1.5px solid #DBDBDB", fontFamily: "Poppins, sans-serif" }}>
            <span className="text-md font-medium text-black tracking-tight">
              <span className="font-[501]">Exam code:</span> 4CP0
            </span>
          </div>

          <h3 className="text-sm sm:text-md lg:text-lg font-[500] leading-6 text-[#707070] mb-8 text-left max-w-4xl tracking-[-0.015em]" style={{ fontFamily: "Poppins, sans-serif" }}>
            Access a wide range of Edexcel IAL Computer Science resources—all in one place. Whether you're brushing up on concepts or aiming to master exam strategies, these materials are designed to support your revision and boost your performance
          </h3>

          <div className="w-full mb-8">
            <h2 className="text-xl font-[550] tracking-tight text-[#000000] mb-4 text-left">
              Subjects
            </h2>
            <SubjectButtons />
          </div>

          {/* General Resources */}
          {unitResources["General"] && (
            <div className="cursor-pointer bg-white rounded-lg shadow-md mb-8 border border-gray-200 overflow-hidden">
              <div className="bg-gray-200 text-black tracking-tight p-4 text-left font-bold text-xl sm:text-2xl"
                  style={{ fontFamily: "Poppins, sans-serif" }}>
                General Resources
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                {unitResources["General"].map((resourceGroup, groupIndex) => (
                  resourceGroup.links.map((link, linkIndex) => (
                    <Link key={groupIndex + '-' + linkIndex} href={link.url} style={{ fontFamily: 'Poppins, sans-serif' }}>
                      <div className="cursor-pointer flex flex-col p-5 border h-fit border-gray-200 rounded-2xl shadow-md bg-white hover:shadow-xl transition-shadow duration-200 group sm:min-h-[120px] sm:min-w-[300px]" style={{ position: 'relative' }}>
                        {link.name && (<p className="text-xl font-bold text-[#153064]">{link.name}</p>)}
                        {link.description && (
                          <p className="text-sm text-gray-600 mt-2 border-l-4 mb-2 border-blue-600 pl-2">{link.description}</p>
                        )}
                        <div className="flex flex-col justify-end items-end">
                          {resourceGroup.heading && (<div className="cursor-pointer mt-1 text-xs font-semibold tracking-tight uppercase w-fit px-2 py-0.5 text-green-400 ring ring-green-400 rounded-md hover:bg-green-400 hover:text-white transition-colors">{resourceGroup.heading}</div>)}
                          {link.last && (<p className="text-xs text-gray-600 mt-1 text-right">{link.contributor ? "Shared On ": "Shared On "}{new Date(link.last).toLocaleString(undefined, {year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'})}</p>)}
                        </div>
                        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <svg width="22" height="22" fill="none" stroke="#1A69FA" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                        </div>
                      </div>
                    </Link>))
                ))}
              </div>
            </div>
          )}

          {/* Unit-Based Resources */}
          {units.map((unitData) => (
            <div key={unitData.unit} className="bg-white rounded-lg shadow-md mb-8 border border-gray-200 overflow-hidden">
              <div className="bg-[#2871F9] cursor-pointer text-white tracking-tight p-4 text-left font-bold text-xl sm:text-2xl"
                  style={{ fontFamily: "Poppins, sans-serif" }}
                  onClick={() => toggleUnit(unitData.unit)}>
                {unitData.name}
              </div>
              {expandedUnits[unitData.unit] && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 p-6">
                  {(unitResources[unitData.unit] || []).map((resourceGroup, groupIndex) => (
                    resourceGroup.links.map((link, linkIndex) => (
                      <Link key={groupIndex + '-' + linkIndex} href={link.url} style={{ fontFamily: 'Poppins, sans-serif' }}>
                      <div className="cursor-pointer flex flex-col p-5 border h-fit border-gray-200 rounded-2xl shadow-md bg-white hover:shadow-xl transition-shadow duration-200 group sm:min-h-[120px] sm:min-w-[300px]" style={{ position: 'relative' }}>
                        {link.name && (<p className="text-xl font-bold text-[#153064]">{link.name}</p>)}
                        {link.description && (
                          <p className="text-sm text-gray-600 mt-2 border-l-4 mb-2 border-blue-600 pl-2">{link.description}</p>
                        )}
                        <div className="flex flex-col justify-end items-end">
                          {resourceGroup.heading && (<div className="cursor-pointer mt-1 text-xs font-semibold tracking-tight uppercase w-fit px-2 py-0.5 text-green-400 ring ring-green-400 rounded-md hover:bg-green-400 hover:text-white transition-colors">{resourceGroup.heading}</div>)}
                          {link.last && (<p className="text-xs text-gray-600 mt-1 text-right">{link.contributor ? "Shared On ": "Shared On "}{new Date(link.last).toLocaleString(undefined, {year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'})}</p>)}
                        </div>
                        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <svg width="22" height="22" fill="none" stroke="#1A69FA" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                        </div>
                      </div>
                    </Link>))
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
      <SmallFoot />
    </>
  );
}