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
const subjectName = 'Biology';
const subjectSlug = subjectName.toLowerCase().replace(/\s+/g, '-');
const examCode = '4BI1';

// Color mapping function for specific tags
const getTagColorClass = (tagName) => {
  const tagColors = {
    'note': 'bg-blue-100 text-blue-800',
    'essay_questions': 'bg-green-100 text-green-800',
    'assorted_papers': 'bg-orange-100 text-orange-800',
    'youtube_videos': 'bg-red-100 text-red-800',
    'topic_question': 'bg-yellow-100 text-yellow-800',
    'commonly_asked_questions': 'bg-pink-100 text-pink-800',
    'solved_papers': 'bg-indigo-100 text-indigo-800',
    'extra_resource': 'bg-teal-100 text-teal-800',
  };
  
  // Return specific color if mapped, otherwise use a default
  return tagColors[tagName.toLowerCase()] || 'bg-gray-100 text-gray-800';
};

// Function to get background color for the icon
const getTagIconColor = (tagName) => {
  const iconColors = {
    'note': 'bg-blue-500',
    'essay_questions': 'bg-green-500',
    'assorted_papers': 'bg-orange-500',
    'youtube_videos': 'bg-red-500',
    'topic_question': 'bg-yellow-500',
    'commonly_asked_questions': 'bg-pink-500',
    'solved_papers': 'bg-indigo-500',
    'extra_resource': 'bg-teal-500',
  };
  
  return iconColors[tagName.toLowerCase()] || 'bg-gray-400';
};

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
        // Define the subjects you want to hide for IGCSE pages only
        const subjectsToHide = ['Economics', 'Further Mathematics', 'Information Technology'];
        
        // Filter the fetched data to exclude the specified subjects
        const filteredSubjects = data.filter(subj => !subjectsToHide.includes(subj.name));
        
        setSubjects(filteredSubjects.map(subj => subj.name));
      }
    }
    fetchSubjects();
  }, []);

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {subjects.map((name, index) => {
        const slug = name.toLowerCase().replace(/\s+/g, '-');
        return (
          <Link key={index} href={`/subjects/${slug}/IGCSE/communityNotes`}>
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
  const [selectedTags, setSelectedTags] = useState([]);

  const [isTagsDropdownOpen, setIsTagsDropdownOpen] = useState(false);
  // Function to toggle tag selection
  const toggleTag = (tagName) => {
    if (selectedTags.includes(tagName)) {
      setSelectedTags(selectedTags.filter(t => t !== tagName));
    } else {
      setSelectedTags([...selectedTags, tagName]);
    }
  };

  const [tag, setTag] = useState([]);

  function handleTag(event){
    event.stopPropagation(); 
    event.preventDefault(); 
    if(tag === null){
      setTag(event.currentTarget.innerHTML) 
    }
    else{
      setTag(null)
    }
  }

  useReloadOnStuckLoading(loading);

  // Helper function to format tag names
  function formatTagName(name) {
    if (!name) return '';
    return name.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  }

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
      fetchedUnits = fetchedUnits.filter(unit =>
        !unit.unit?.includes('R') && !unit.name?.includes('R')
      );
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
        // Only initialize units that might have resources
        acc[unit.unit] = false;
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
          .from('community_resource_requests')
          .select('*')
          .eq('subject_id', subjectId)
          .order('title', { ascending: true })
          .eq('approved', "Approved")
          .order('submitted_at', { ascending: false });

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

  useEffect(() => {
    if (Object.keys(unitResources).length > 0) {
      setExpandedUnits(prev => {
        const newExpandedUnits = { ...prev };
        
        // Only expand units that have resources
        Object.keys(unitResources).forEach(unitName => {
          if (unitResources[unitName] && unitResources[unitName].length > 0) {
            newExpandedUnits[unitName] = true;
          }
        });
        
        return newExpandedUnits;
      });
    }
  }, [unitResources]); // This runs after unitResources is populated
  
  return (
    <>
      <main className="min-h-screen bg-white flex flex-col items-center justify-start py-10 m-10">
        <div className="w-full max-w-5xl px-4">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#000000] mb-8 text-left tracking-[-0.035em]" style={{ fontFamily: "Poppins, sans-serif" }}>
            IGCSE <span className="bg-[#1A69FA] px-2 py-1 -rotate-1 inline-block"><span className="text-[#FFFFFF]">Biology</span></span> Community Notes
          </h1>

          <div className="inline-flex items-center justify-center px-4 py-2 mb-8 rounded-md" style={{ border: "1.5px solid #DBDBDB", fontFamily: "Poppins, sans-serif" }}>
            <span className="text-md font-medium text-black tracking-tight">
              <span className="font-[501]">Exam code:</span> 4BI1
            </span>
          </div>

          <h3 className="text-sm sm:text-md lg:text-lg font-[500] leading-6 text-[#707070] mb-8 text-left max-w-4xl tracking-[-0.015em]" style={{ fontFamily: "Poppins, sans-serif" }}>
            Access a wide range of Edexcel IGCSE Biology resources—all in one place. Whether you're brushing up on concepts or aiming to master exam strategies, these materials are designed to support your revision and boost your performance
          </h3>

          <div className="w-full mb-8">
            <h2 className="text-xl font-[550] tracking-tight text-[#000000] mb-4 text-left">
              Other Community Notes
            </h2>
            <SubjectButtons />

            <div className="relative inline-block text-left">
              <button
                onClick={() => setIsTagsDropdownOpen(!isTagsDropdownOpen)}
                className="px-4 py-2 rounded-lg border cursor-pointer border-gray-400 text-sm font-[501] text-[#153064] hover:bg-gray-50 transition-colors flex items-center"
                style={{ fontFamily: "Poppins, sans-serif" }}
              >
                {tag.length > 0 ? (
                  <>
                    {tag.length === 1 ? formatTagName(tag[0]) : `${tag.length} Tags Selected`}
                    <div className="flex ml-2 space-x-1">
                      {tag.slice(0, 3).map((selectedTag) => (
                        <span
                          key={selectedTag}
                          className="text-xs bg-green-400 text-white p-0.5 rounded-full"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" height="16px" viewBox="0 -960 960 960" width="16px" fill="white">
                            <path d="M480-80 240-480l240-400 240 400L480-80Zm0-156 147-244-147-244-147 244 147 244Zm0-244Z"/>
                          </svg>
                        </span>
                      ))}
                      {tag.length > 3 && (
                        <span className="text-xs bg-gray-400 text-white px-1.5 py-0.5 rounded-full">
                          +{tag.length - 3}
                        </span>
                      )}
                    </div>
                  </>
                ) : (
                  "Filter by Tag"
                )}
              </button>
              {isTagsDropdownOpen && (
                <div className="absolute z-10 bg-white shadow-lg rounded-lg mt-2 py-2 min-w-max w-full max-w-xs max-h-60 overflow-y-auto border border-gray-200">
                  {/* Dynamically generate dropdown items based on unique tags */}
                  {Object.keys(unitResources).reduce((tags, unit) => {
                    const unitTags = unitResources[unit].map(group => group.heading);
                    return [...new Set([...tags, ...unitTags])];
                  }, []).map((uniqueTag, index) => (
                    <div
                      key={uniqueTag}
                      onClick={() => {
                        setTag(prev => 
                          prev.includes(uniqueTag) 
                            ? prev.filter(t => t !== uniqueTag)
                            : [...prev, uniqueTag]
                        );
                      }}
                      className={`cursor-pointer px-4 py-2 text-sm flex items-center transition-colors
                        ${tag.includes(uniqueTag) ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-100 text-gray-900'}`}
                      style={{ fontFamily: "Poppins, sans-serif" }}
                    >
                      <input
                        type="checkbox"
                        checked={tag.includes(uniqueTag)}
                        onChange={() => {}}
                        className="form-checkbox h-4 w-4 text-blue-600 rounded mr-2"
                      />
                      <span className={`mr-2 px-2 py-0.5 rounded-full text-xs font-semibold ${getTagColorClass(uniqueTag)}`}>
                        {formatTagName(uniqueTag)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
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
                    <Link key={groupIndex + '-' + linkIndex} href={link.url} style={{ fontFamily: 'Poppins, sans-serif' }} className={`${tag.length === 0 || tag.includes(resourceGroup.heading) ? "block" : "hidden"}`}>
                      <div className="cursor-pointer flex flex-col p-5 border h-fit border-gray-200 rounded-2xl shadow-md bg-white hover:shadow-xl transition-shadow duration-200 group sm:min-h-[120px] sm:min-w-[300px]" style={{ position: 'relative' }}>
                        
                        <div className="inline-flex justify-between">
                          {link.name && (<p className="text-xl font-bold text-[#153064]">{link.name}</p>)}
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <svg width="22" height="22" fill="none" stroke="#1A69FA" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                          </div>
                        </div>
                        {link.description && (
                          <p className="text-sm text-gray-600 mt-2 border-l-4 mb-2 border-blue-600 pl-2">{link.description}</p>
                        )}
                        <div className="flex flex-col justify-end items-end">
                          {resourceGroup.heading && (
                            <div 
                              className={`cursor-pointer mt-1 text-xs font-semibold tracking-tight uppercase w-fit px-2 py-0.5 rounded-md transition-colors ${
                                tag.includes(resourceGroup.heading)
                                  ? "bg-green-400 text-white" 
                                  : "ring ring-green-400 text-green-400 sm:hover:bg-green-400 sm:hover:text-white"
                              }`} 
                              onClick={(e) => { 
                                e.preventDefault(); 
                                setTag(prev => 
                                  prev.includes(resourceGroup.heading) 
                                    ? prev.filter(t => t !== resourceGroup.heading)
                                    : [...prev, resourceGroup.heading]
                                ); 
                              }}
                            >
                              {formatTagName(resourceGroup.heading)}
                            </div>
                          )}
                          {link.last && (<p className="text-xs text-gray-600 mt-1 text-right">{link.contributor ? "Shared On ": "Shared On "}{new Date(link.last).toLocaleString(undefined, {year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'})}</p>)}
                        </div>
                        
                      </div>
                    </Link>))
                ))}
              </div>
            </div>
          )}

          {/* Unit-Based Resources */}
          {units
            .filter(unitData => unitResources[unitData.unit] && unitResources[unitData.unit].length > 0)
            .map((unitData) => (
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
                      <Link key={groupIndex + '-' + linkIndex} href={link.url} style={{ fontFamily: 'Poppins, sans-serif' }} className={`${tag.length === 0 || tag.includes(resourceGroup.heading) ? "block" : "hidden"}`}>
                      <div className="cursor-pointer flex flex-col p-5 border h-fit border-gray-200 rounded-2xl shadow-md bg-white hover:shadow-xl transition-shadow duration-200 group sm:min-h-[120px] sm:min-w-[300px]" style={{ position: 'relative' }}>
                        {/* <span className="text-sm font-semibold text-[#1A69FA] mb-1 tracking-tight uppercase" style={{ fontFamily: 'Poppins, sans-serif', letterSpacing: '0.04em' }}>{resourceGroup.heading}</span> */}
                        
                          <div className="inline-flex justify-between">
                            {link.name && (<p className="text-xl font-bold text-[#153064]">{link.name}</p>)}
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                              <svg width="22" height="22" fill="none" stroke="#1A69FA" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                            </div>
                          </div>
                          {link.description && (
                            <p className="text-sm text-gray-600 mt-2 border-l-4 mb-2 border-blue-600 pl-2">{link.description}</p>
                          )}
                          <div className="flex flex-col justify-end items-end">
                            {resourceGroup.heading && (
                              <div 
                                className={`cursor-pointer mt-1 text-xs font-semibold tracking-tight uppercase w-fit px-2 py-0.5 rounded-md transition-colors ${
                                  tag.includes(resourceGroup.heading)
                                    ? "bg-green-400 text-white" 
                                    : "ring ring-green-400 text-green-400 sm:hover:bg-green-400 sm:hover:text-white"
                                }`} 
                                onClick={(e) => { 
                                  e.preventDefault(); 
                                  setTag(prev => 
                                    prev.includes(resourceGroup.heading) 
                                      ? prev.filter(t => t !== resourceGroup.heading)
                                      : [...prev, resourceGroup.heading]
                                  ); 
                                }}
                              >
                                {formatTagName(resourceGroup.heading)}
                              </div>
                            )}
                            {link.last && (<p className="text-xs text-gray-600 mt-1 text-right">{link.contributor ? "Shared On ": "Shared On "}{new Date(link.last).toLocaleString(undefined, {year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'})}</p>)}
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