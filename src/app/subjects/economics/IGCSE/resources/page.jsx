"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { createClient } from '@supabase/supabase-js';
import { useReloadOnStuckLoading } from '@/utils/reloadOnStuckLoading';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
// Remove: import { useRouter } from 'next/router';
import SmallFoot from '@/components/smallFoot.jsx';

// At the top, define variables for subjectName, syllabusType, and examCode
const subjectName = 'Economics';
const subjectSlug = subjectName.toLowerCase().replace(/\s+/g, '-');
const examCode = '4EC1';

// Add SubjectButtons component that fetches subjects dynamically
const SubjectButtons = () => {
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    async function fetchSubjects() {
      const { data, error } = await supabase
        .from('subjects')
        .select('name')
        .order('name', { ascending: true })
        .eq('syllabus_type', 'IGCSE');
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
          <Link key={index} href={`/subjects/${slug}/IGCSE/resources`}>
            <button className="px-4 py-2 cursor-pointer bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition">
              {name}
            </button>
          </Link>
        );
      })}
    </div>
  );
};

export default function IGCSEResources() {
  const [units, setUnits] = useState([]);
  const [expandedUnits, setExpandedUnits] = useState({});
  const [unitResources, setUnitResources] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useReloadOnStuckLoading(loading);

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
        .eq('name', subjectName)
        .eq('syllabus_type', 'IGCSE')
        .single();
      if (subjectError || !subjectData) {
        setError(subjectError || new Error('Subject "Physics" not found.'));
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

  useEffect(() => {
    setLoading(true);
    const fetchResources = async () => {
      try {
        const { data: subjectData, error: subjectError } = await supabase
          .from('subjects')
          .select('id')
          .eq('name', subjectName)
          .eq('syllabus_type', 'IGCSE')
          .single();

        if (subjectError || !subjectData) {
          setError(subjectError || new Error('Subject "Physics" not found.'));
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
  }, []);

  if (error) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-xl text-red-600">Error loading resources: {error.message}</p>
      </main>
    );
  }
  function handleTag(event){
    event.stopPropagation(); 
    event.preventDefault();  
    document.querySelectorAll(".allResources").forEach((resource) => {
      if(!resource.classList.contains("hidden")){
        resource.classList.remove("block")
        resource.classList.add("hidden")
      }
      else{
        resource.classList.add("block")
        resource.classList.remove("hidden")
      }
    })
    document.querySelectorAll(`.${event.currentTarget.innerHTML}`).forEach((resource) => {
      const indicator = resource.querySelector("div > div > div")
      if(indicator.classList.contains("text-green-400")){
        indicator.classList.remove("text-green-400", "hover:text-white", "hover:bg-green-400")
        indicator.classList.add("bg-green-400", "text-white")
      }
      else{
        indicator.classList.add("text-green-400", "hover:text-white", "hover:bg-green-400")
        indicator.classList.remove("bg-green-400", "text-white")
      }
      if(!resource.classList.contains("hidden")){
        resource.classList.remove("block")
        resource.classList.add("hidden")
      }
      else{
        resource.classList.add("block")
        resource.classList.remove("hidden")
      }
    })
  }
  return (
    <>
      <main className="min-h-screen bg-white flex flex-col items-center justify-start py-10 m-10">
        <div className="w-full max-w-5xl px-4">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#000000] mb-8 text-left tracking-[-0.035em]" style={{ fontFamily: "Poppins, sans-serif" }}>
            IGCSE <span className="bg-[#1A69FA] px-2 py-1 -rotate-1 inline-block"><span className="text-[#FFFFFF]">Economics</span></span> Resources
          </h1>

          <div className="inline-flex items-center justify-center px-4 py-2 mb-8 rounded-md" style={{ border: "1.5px solid #DBDBDB", fontFamily: "Poppins, sans-serif" }}>
            <span className="text-md font-medium text-black tracking-tight">
              <span className="font-[501]">Exam code:</span> 4EC1
            </span>
          </div>

          <h3 className="text-sm sm:text-md lg:text-lg font-[500] leading-6 text-[#707070] mb-8 text-left max-w-4xl tracking-[-0.015em]" style={{ fontFamily: "Poppins, sans-serif" }}>
            Access a wide range of Edexcel IGCSE Economics resources—all in one place. Whether you're brushing up on concepts or aiming to master exam strategies, these materials are designed to support your revision and boost your performance
          </h3>

          <div className="w-full mb-8">
            <h2 className="text-xl font-[550] tracking-tight text-[#000000] mb-4 text-left">
              Other Resources
            </h2>
            <SubjectButtons />
          </div>

          {/* General Resources */}
          {unitResources["General"] && (
            <div className="bg-white rounded-lg shadow-md mb-8 border border-gray-200 overflow-hidden">
              <div className="bg-gray-200 text-black tracking-tight p-4 text-left font-bold text-xl sm:text-2xl"
                  style={{ fontFamily: "Poppins, sans-serif" }}>  
                General Resources
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                {unitResources["General"].map((resourceGroup, groupIndex) => (
                  resourceGroup.links.map((link, linkIndex) => (
                    <Link key={groupIndex + '-' + linkIndex} href={link.url} style={{ fontFamily: 'Poppins, sans-serif' }} className={`allResources ${resourceGroup.heading} transition-opacity duration-300`}>
                      <div className="cursor-pointer flex flex-col p-5 border h-fit border-gray-200 rounded-2xl shadow-md bg-white hover:shadow-xl transition-shadow duration-200 group sm:min-h-[120px] sm:min-w-[300px]" style={{ position: 'relative' }}>
                        {/* <span className="text-sm font-semibold text-[#1A69FA] mb-1 tracking-tight uppercase" style={{ fontFamily: 'Poppins, sans-serif', letterSpacing: '0.04em' }}>{resourceGroup.heading}</span> */}
                        
                          {link.name && (<p className="text-xl font-bold text-[#153064]">{link.name}</p>)}
                          {link.description && (
                            <p className="text-sm text-gray-600 mt-2 border-l-4 mb-2 border-blue-600 pl-2">{link.description}</p>
                          )}
                          <div className="flex flex-col justify-end items-end">
                            {resourceGroup.heading && (<div className="cursor-pointer mt-1 text-xs font-semibold tracking-tight uppercase w-fit px-2 py-0.5 text-green-400 ring ring-green-400 rounded-md hover:bg-green-400 hover:text-white transition-colors" onClick={handleTag}>{resourceGroup.heading}</div>)}
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
              {/* Session Card styling, added overflow-hidden */}
              <div className="bg-[#2871F9] cursor-pointer text-white tracking-tight p-4 text-left font-bold text-xl sm:text-2xl"
                  style={{ fontFamily: "Poppins, sans-serif" }}
                  onClick={() => toggleUnit(unitData.unit)}>
                {unitData.name}
              </div>
              {expandedUnits[unitData.unit] && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 p-6">
                  {(unitResources[unitData.unit] || []).map((resourceGroup, groupIndex) => (
                    resourceGroup.links.map((link, linkIndex) => (
                      <Link key={groupIndex + '-' + linkIndex} href={link.url} style={{ fontFamily: 'Poppins, sans-serif' }} className={`allResources ${resourceGroup.heading} transition-opacity duration-300`}>
                      <div className="cursor-pointer flex flex-col p-5 border h-fit border-gray-200 rounded-2xl shadow-md bg-white hover:shadow-xl transition-shadow duration-200 group sm:min-h-[120px] sm:min-w-[300px]" style={{ position: 'relative' }}>
                        {/* <span className="text-sm font-semibold text-[#1A69FA] mb-1 tracking-tight uppercase" style={{ fontFamily: 'Poppins, sans-serif', letterSpacing: '0.04em' }}>{resourceGroup.heading}</span> */}
                        
                          {link.name && (<p className="text-xl font-bold text-[#153064]">{link.name}</p>)}
                          {link.description && (
                            <p className="text-sm text-gray-600 mt-2 border-l-4 mb-2 border-blue-600 pl-2">{link.description}</p>
                          )}
                          <div className="flex flex-col justify-end items-end">
                            {resourceGroup.heading && (<div className="cursor-pointer mt-1 text-xs font-semibold tracking-tight uppercase w-fit px-2 py-0.5 text-green-400 ring ring-green-400 rounded-md hover:bg-green-400 hover:text-white transition-colors" onClick={handleTag}>{resourceGroup.heading}</div>)}
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