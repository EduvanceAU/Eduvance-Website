"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { useSupabaseAuth } from "@/components/client/SupabaseAuthContext";
import SmallFoot from '@/components/smallFoot.jsx';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import {Frown} from 'lucide-react'
import { useParams, usePathname } from 'next/navigation'; // Add usePathname

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
          <Link key={index} href={`/subjects/${slug}/IAL/communityNotes`}>
            <button className="px-4 py-2 cursor-pointer bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition">
              {name}
            </button>
          </Link>
        );
      })}
    </div>
  );
};

function LikeDislikeButtons({ noteId, likeCount = 0, dislikeCount = 0, userVote, onVote }) {
  return (
    <div className="flex items-center gap-3 mt-3">
      <button
        className={`flex items-center px-2 py-1 rounded hover:bg-blue-100 transition ${userVote === 'like' ? 'bg-blue-200' : ''}`}
        onClick={() => onVote(userVote === 'like' ? null : 'like')}
        aria-label="Like"
      >
        <span role="img" aria-label="thumbs up" className="mr-1">👍</span> {likeCount}
      </button>
      <button
        className={`flex items-center px-2 py-1 rounded hover:bg-red-100 transition ${userVote === 'dislike' ? 'bg-red-200' : ''}`}
        onClick={() => onVote(userVote === 'dislike' ? null : 'dislike')}
        aria-label="Dislike"
      >
        <span role="img" aria-label="thumbs down" className="mr-1">👎</span> {dislikeCount}
      </button>
    </div>
  );
}

function clamp(n) { return n < 0 ? 0 : n; }

export default function IALCommunityNotesPage() {
  const params = useParams();
  const pathname = usePathname(); // Alternative way to get URL info
  
  // Multiple ways to extract the slug
  const getSlugFromParams = () => {
    console.log('Debug - Raw params:', params);
    console.log('Debug - Pathname:', pathname);
    
    // Method 1: Direct from params
    if (params?.slug) {
      const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;
      console.log('Debug - Slug from params.slug:', slug);
      return slug;
    }
    
    // Method 2: From pathname parsing
    if (pathname) {
      const pathParts = pathname.split('/');
      console.log('Debug - Path parts:', pathParts);
      const subjectIndex = pathParts.findIndex(part => part === 'subjects');
      if (subjectIndex !== -1 && pathParts[subjectIndex + 1]) {
        const slug = pathParts[subjectIndex + 1];
        console.log('Debug - Slug from pathname:', slug);
        return slug;
      }
    }
    
    // Method 3: From URL directly (client-side only)
    if (typeof window !== 'undefined') {
      const urlPath = window.location.pathname;
      console.log('Debug - Window pathname:', urlPath);
      const match = urlPath.match(/\/subjects\/([^\/]+)/);
      if (match) {
        const slug = match[1];
        console.log('Debug - Slug from window.location:', slug);
        return slug;
      }
    }
    
    console.log('Debug - No slug found');
    return null;
  };

  const [slug, setSlug] = useState(null);
  const [subjectName, setSubjectName] = useState(null);
  const [examCode, setExamCode] = useState(null);
  const { session, user, loading: authLoading } = useSupabaseAuth();
  const [units, setUnits] = useState([]);
  const [expandedUnits, setExpandedUnits] = useState({});
  const [unitNotes, setUnitNotes] = useState({});
  const [userVotes, setUserVotes] = useState(() => {
    if (typeof window !== 'undefined') {
      const votes = localStorage.getItem('community_note_votes');
      return votes ? JSON.parse(votes) : {};
    }
    return {};
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // Extract slug on mount and when params change
  useEffect(() => {
    const extractedSlug = getSlugFromParams();
    console.log('Debug - Extracted slug:', extractedSlug);
    setSlug(extractedSlug);
  }, [params, pathname]);

  // Debug logging for loading states
  useEffect(() => {
    console.log('Debug - Loading states:', {
      authLoading,
      loading,
      subjectName,
      examCode,
      slug,
      session: !!session,
      params,
      pathname
    });
  }, [authLoading, loading, subjectName, examCode, slug, session, params, pathname]);

  const toggleUnit = (unit) => {
    setExpandedUnits(prev => ({
      ...prev,
      [unit]: !prev[unit]
    }));
  };

  // Effect to derive subjectName from slug and fetch examCode
  useEffect(() => {
    console.log('Debug - Slug effect triggered:', { slug });
    
    if (!slug) {
      console.log('Debug - No slug, staying in loading state');
      return; // Don't set loading to true here, let it resolve naturally
    }

    const derivedSubjectName = slug
      .replace(/-/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    console.log('Debug - Derived subject name:', derivedSubjectName);
    setSubjectName(derivedSubjectName);

    async function fetchExamCodeForSubject() {
      console.log('Debug - Fetching exam code for:', derivedSubjectName);
      setError(null);
      
      try {
        // First try exact match
        let { data, error } = await supabase
          .from('subjects')
          .select('code, name')
          .eq('name', derivedSubjectName)
          .eq('syllabus_type', 'IAL')
          .single();

        console.log('Debug - Exact match result:', { data, error });

        // If exact match fails, try case-insensitive search
        if (error || !data) {
          console.log('Debug - Trying case-insensitive search...');
          const { data: flexibleData, error: flexibleError } = await supabase
            .from('subjects')
            .select('code, name')
            .ilike('name', derivedSubjectName)
            .eq('syllabus_type', 'IAL')
            .limit(1)
            .single();

          console.log('Debug - Flexible search result:', { flexibleData, flexibleError });
          
          if (flexibleError || !flexibleData) {
            // If still no match, try partial match
            console.log('Debug - Trying partial match search...');
            const { data: partialData, error: partialError } = await supabase
              .from('subjects')
              .select('code, name')
              .ilike('name', `%${derivedSubjectName}%`)
              .eq('syllabus_type', 'IAL')
              .limit(1);

            console.log('Debug - Partial search result:', { partialData, partialError });

            if (partialError || !partialData || partialData.length === 0) {
              console.warn(`Subject "${derivedSubjectName}" not found in database`);
              setExamCode('N/A');
              // Don't set error - just continue with N/A
            } else {
              console.log('Debug - Found with partial match:', partialData[0]);
              setExamCode(partialData[0].code || 'N/A');
              setSubjectName(partialData[0].name); // Use the actual DB name
            }
          } else {
            console.log('Debug - Found with flexible search:', flexibleData);
            setExamCode(flexibleData.code || 'N/A');
            setSubjectName(flexibleData.name); // Use the actual DB name
          }
        } else {
          console.log('Debug - Exact match found:', data);
          setExamCode(data.code || 'N/A');
          setSubjectName(data.name); // Use the actual DB name
        }
        
      } catch (err) {
        console.error('Unexpected error while fetching exam code:', err);
        setExamCode('N/A');
        // Don't set error for exam code issues - continue loading
      }
    }
    
    fetchExamCodeForSubject();
  }, [slug]);

  // Fetch units from subject table
  useEffect(() => {
    console.log('Debug - Units effect triggered:', { subjectName, authLoading });
    
    if (!subjectName || authLoading) {
      console.log('Debug - Waiting for subject name or auth to load');
      return;
    }

    const fetchUnits = async () => {
      console.log('Debug - Fetching units for:', subjectName);
      
      const { data: subjectData, error: subjectError } = await supabase
        .from('subjects')
        .select('units')
        .eq('name', subjectName)
        .eq('syllabus_type', 'IAL')
        .single();
        
      console.log('Debug - Units response:', { subjectData, subjectError });
        
      if (subjectError || !subjectData) {
        console.error('Debug - Units fetch failed:', subjectError);
        setError(subjectError || new Error(`Subject not found: ${subjectName}`));
        return;
      }
      
      let fetchedUnits = subjectData.units || [];
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
      
      console.log('Debug - Units processed:', fetchedUnits);
      setUnits(fetchedUnits);
      setExpandedUnits(fetchedUnits.reduce((acc, unit) => {
        acc[unit.unit] = true;
        return acc;
      }, {}));
    };
    
    fetchUnits();
  }, [authLoading, subjectName]);

  // Fetch notes
  useEffect(() => {
    console.log('Debug - Notes effect triggered:', { subjectName, authLoading });
    
    if (!subjectName || authLoading) {
      console.log('Debug - Waiting for subject name or auth for notes');
      return;
    }

    async function fetchNotes() {
      console.log('Debug - Fetching notes for:', subjectName);
      setError(null);
      
      // Get subject id for subjectName IAL
      const { data: subjectData, error: subjectError } = await supabase
        .from('subjects')
        .select('id')
        .eq('name', subjectName)
        .eq('syllabus_type', 'IAL')
        .single();
        
      console.log('Debug - Subject ID response:', { subjectData, subjectError });
        
      if (subjectError || !subjectData) {
        console.error('Debug - Subject ID fetch failed:', subjectError);
        setError(subjectError || new Error(`Subject not found: ${subjectName}`));
        setLoading(false);
        return;
      }
      
      const subjectId = subjectData.id;
      console.log('Debug - Subject ID:', subjectId);
      
      // Fetch approved community notes for this subject
      const { data: notes, error: notesError } = await supabase
        .from('community_resource_requests')
        .select('*, like_count, dislike_count')
        .eq('subject_id', subjectId)
        .eq('approved', "Approved")
        .order('submitted_at', { ascending: false });
        
      console.log('Debug - Notes response:', { notes, notesError });
        
      if (notesError) {
        console.error('Debug - Notes fetch failed:', notesError);
        setError(notesError);
        setLoading(false);
        return;
      }
      
      // Group notes by unit
      const grouped = {};
      notes.forEach((note) => {
        const unit = note.unit_chapter_name || 'General';
        if (!grouped[unit]) grouped[unit] = [];
        grouped[unit].push(note);
      });
      
      console.log('Debug - Grouped notes:', grouped);
      setUnitNotes(grouped);
      
      // Update userVotes from localStorage
      setUserVotes((prev) => {
        const updated = { ...prev };
        notes.forEach(note => {
          if (updated[note.id] === undefined) {
            updated[note.id] = null;
          }
        });
        if (typeof window !== 'undefined') {
          localStorage.setItem('community_note_votes', JSON.stringify(updated));
        }
        return updated;
      });
      
      console.log('Debug - Notes fetch complete, setting loading to false');
      setLoading(false);
    }
    
    fetchNotes();
  }, [session, authLoading, subjectName]);

  // Timeout fallback to prevent infinite loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading && !error) {
        console.warn('Debug - Timeout reached, forcing loading to false');
        setLoading(false);
        if (!examCode) {
          setExamCode('N/A');
        }
      }
    }, 15000); // 15 second timeout

    return () => clearTimeout(timeout);
  }, [loading, error, examCode]);

  // Debug the final loading condition
  const shouldShowLoading = authLoading || loading || !subjectName;
  console.log('Debug - Should show loading:', {
    shouldShowLoading,
    authLoading,
    loading,
    subjectName: !!subjectName,
    examCode: !!examCode,
    slug: !!slug
  });

  // Render loading state
  if (shouldShowLoading) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600">Loading Eduvance notes...</p>
          <p className="text-sm text-gray-400 mt-2">
            Auth: {authLoading ? 'Loading' : 'Ready'} | 
            Data: {loading ? 'Loading' : 'Ready'} | 
            Subject: {subjectName ? 'Ready' : 'Missing'} | 
            Code: {examCode || 'Missing'} |
            Slug: {slug || 'Missing'}
          </p>
          <p className="text-xs text-gray-300 mt-1">
            URL: {typeof window !== 'undefined' ? window.location.pathname : 'SSR'}
          </p>
        </div>
      </main>
    );
  }

  // Handle authentication state
  if (!session) {
    return (
      <main className="min-h-screen bg-white flex flex-col items-center justify-center">
        <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4 text-center">Sign in to view Eduvance Notes</h2>
          <Auth supabaseClient={supabase} appearance={{ theme: ThemeSupa }} providers={["google"]}
            redirectTo={typeof window !== 'undefined' ? window.location.href : undefined}
          />
        </div>
      </main>
    );
  }

  // Handle error state
  if (error) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-red-600">Error loading Eduvance notes: {error.message}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500"
          >
            Retry
          </button>
        </div>
      </main>
    );
  }

  return (
    <>
      <main className="min-h-screen bg-white flex flex-col items-center justify-start py-10 m-10">
        <div className="w-full max-w-5xl px-4">
          {/* AVAILABILITY SIGN - UNBLURRED */}
          <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-xs animate-fade-in bg-black/10">
            <div className="flex items-center flex-col justify-center bg-white rounded-xl mx-5 p-10 text-center">
              <span className="flex items-center justify-center gap-2 flex-wrap sm:flex-nowrap"><Frown className="stroke-[#1A69FA]"/> <p>Eduvance Notes are unavailable at the moment</p></span>
              <p>Keep an eye out on our Discord Server for the release date!</p>
            </div>
          </div>
          {/* BLURRED CONTENT WRAPPER */}
          <div className="blur-sm pointer-events-none select-none">
            <h1
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#000000] mb-8 text-left tracking-[-0.035em]"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              IAL <span className="bg-[#1A69FA] px-2 py-1 -rotate-1 inline-block"><span className="text-[#FFFFFF]">{subjectName}</span></span> Eduvance Notes
            </h1>

            <div
              className="inline-flex items-center justify-center px-4 py-2 mb-8 rounded-md shadow-xl"
              style={{
                border: "1.5px solid #DBDBDB",
                fontFamily: "Poppins, sans-serif",
              }}
            >
              <span className="text-md font-medium text-black tracking-tight">
                <span className="font-[501]">Exam code:</span> {examCode || 'N/A'}
              </span>
            </div>

            <h3
              className="text-sm sm:text-md lg:text-lg font-[500] leading-6 text-[#707070] mb-8 text-left max-w-4xl tracking-[-0.015em]"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              Explore our collection of Edexcel A Level {subjectName} community-contributed resources, including detailed notes, explanations, and revision tips. These resources are perfect for deepening your understanding, clarifying tricky concepts, and supporting your study alongside past papers.
            </h3>

            <div className="w-full mb-8">
              <h2 className="text-xl font-[550] tracking-tight text-[#000000] mb-4 text-left">
                Subjects
              </h2>
              <SubjectButtons />
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 p-6">
                      {(unitNotes[unit.unit] || []).length === 0 ? (
                        <div className="col-span-full text-gray-500 text-center">No Eduvance notes for this unit yet.</div>
                      ) : (
                        unitNotes[unit.unit].map((note) => (
                          <div key={note.id} className="flex flex-col p-5 border border-gray-200 rounded-2xl shadow-md bg-white hover:shadow-xl transition-shadow duration-200 group" style={{ minHeight: '120px', position: 'relative' }}>
                            <span className="text-sm font-semibold text-[#1A69FA] tracking-tight uppercase mb-1" style={{ fontFamily: 'Poppins, sans-serif', letterSpacing: '0.04em' }}>{note.resource_type}</span>
                            <Link href={note.link} className="text-lg font-bold text-[#153064] hover:text-[#1A69FA] transition-colors duration-150" style={{ fontFamily: 'Poppins, sans-serif' }} target="_blank" rel="noopener noreferrer">
                              {note.title}
                            </Link>
                            {note.description && <p className="text-sm text-gray-600 mt-2 border-l-4 mb-2 border-blue-600 pl-2">{note.description}</p>}
                            <div className="flex flex-col justify-end items-end mt-2">
                              <div className="cursor-pointer mt-1 text-xs font-semibold tracking-tight uppercase w-fit px-2 py-0.5 text-green-400 ring ring-green-400 rounded-md hover:bg-green-400 hover:text-white transition-colors">{note.resource_type}</div>
                              {note.submitted_at && <p className="text-xs text-gray-600 mt-1 text-right">Shared On {new Date(note.submitted_at).toLocaleString(undefined, {year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'})}</p>}
                            </div>
                            <LikeDislikeButtons
                              noteId={note.id}
                              likeCount={note.like_count}
                              dislikeCount={note.dislike_count}
                              userVote={userVotes[note.id] || null}
                              onVote={async (type) => {
                                const prevVote = userVotes[note.id] || null;
                                let newLikeCount = note.like_count || 0;
                                let newDislikeCount = note.dislike_count || 0;
                                if (type === null) {
                                  if (prevVote === 'like') newLikeCount = clamp(newLikeCount - 1);
                                  if (prevVote === 'dislike') newDislikeCount = clamp(newDislikeCount - 1);
                                } else if (type === 'like') {
                                  if (prevVote === 'like') {
                                    newLikeCount = clamp(newLikeCount - 1);
                                    type = null;
                                  } else {
                                    newLikeCount = newLikeCount + 1;
                                    if (prevVote === 'dislike') newDislikeCount = clamp(newDislikeCount - 1);
                                  }
                                } else if (type === 'dislike') {
                                  if (prevVote === 'dislike') {
                                    newDislikeCount = clamp(newDislikeCount - 1);
                                    type = null;
                                  } else {
                                    newDislikeCount = newDislikeCount + 1;
                                    if (prevVote === 'like') newLikeCount = clamp(newLikeCount - 1);
                                  }
                                }
                                await supabase
                                  .from('community_resource_requests')
                                  .update({ like_count: newLikeCount, dislike_count: newDislikeCount })
                                  .eq('id', note.id);
                                setUnitNotes((prev) => {
                                  const updated = { ...prev };
                                  updated[unit.unit] = updated[unit.unit].map((n) =>
                                    n.id === note.id
                                      ? { ...n, like_count: newLikeCount, dislike_count: newDislikeCount }
                                      : n
                                  );
                                  return updated;
                                });
                                setUserVotes((prev) => {
                                  const updated = { ...prev, [note.id]: type };
                                  if (!type) delete updated[note.id];
                                  if (typeof window !== 'undefined') {
                                    localStorage.setItem('community_note_votes', JSON.stringify(updated));
                                  }
                                  return updated;
                                });
                              }}
                            />
                            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                              <svg width="22" height="22" fill="none" stroke="#1A69FA" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <SmallFoot />
    </>
  );
}