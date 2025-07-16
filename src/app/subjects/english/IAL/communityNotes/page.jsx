"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { useSupabaseAuth } from "@/components/client/SupabaseAuthContext";
import SmallFoot from '@/components/smallFoot.jsx';

const SubjectButtons = () => {
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    async function fetchSubjects() {
      const { data, error } = await supabase
        .from('subjects')
        .select('name')
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

export default function IALCommunityNotesPage() {
  const examCode = 'ENG';
  const subjectName = 'English';
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
        .eq('name', subjectName)
        .eq('syllabus_type', 'IAL')
        .single();
      if (subjectError || !subjectData) {
        setError(subjectError || new Error('Subject "English" not found.'));
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
    async function fetchNotes() {
      setLoading(true);
      setError(null);
      // Get subject id for English IAL
      const { data: subjectData, error: subjectError } = await supabase
        .from('subjects')
        .select('id')
        .eq('name', subjectName)
        .eq('syllabus_type', 'IAL')
        .single();
      if (subjectError || !subjectData) {
        setError(subjectError || new Error('Subject "English" not found.'));
        setLoading(false);
        return;
      }
      const subjectId = subjectData.id;
      // Fetch approved community notes for this subject
      const { data: notes, error: notesError } = await supabase
        .from('community_resource_requests')
        .select('*')
        .eq('subject_id', subjectId)
        .eq('is_approved', true)
        .order('submitted_at', { ascending: false });
      if (notesError) {
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
      setUnitNotes(grouped);
      setLoading(false);
    }
    fetchNotes();
  }, [session]);

  if (error) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-xl text-red-600">Error loading community notes: {error.message}</p>
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
            IAL <span className="bg-[#1A69FA] px-2 py-1 -rotate-1 inline-block"><span className="text-[#FFFFFF]">English</span></span> Community Notes
          </h1>

          <div
            className="inline-flex items-center justify-center px-4 py-2 mb-8 rounded-md shadow-xl"
            style={{
              border: "1.5px solid #DBDBDB",
              fontFamily: "Poppins, sans-serif",
            }}
          >
            <span className="text-md font-medium text-black tracking-tight">
              <span className="font-[501]">Exam code:</span> ENG
            </span>
          </div>

          <h3
            className="text-sm sm:text-md lg:text-lg font-[500] leading-6 text-[#707070] mb-8 text-left tracking-[-0.015em]"
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            Explore our collection of Edexcel A Level English community-contributed resources, including detailed notes, explanations, and revision tips. These resources are perfect for deepening your understanding, clarifying tricky concepts, and supporting your study alongside past papers.
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
                      <div className="col-span-full text-gray-500 text-center">No community notes for this unit yet.</div>
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
                            <p className="text-xs text-gray-600 mt-1 text-right">Shared by {note.contributor_name || 'Anonymous'}{note.contributor_email ? ` (${note.contributor_email})` : ''}</p>
                            {note.submitted_at && <p className="text-xs text-gray-600 mt-1 text-right">Shared On {new Date(note.submitted_at).toLocaleString(undefined, {year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'})}</p>}
                          </div>
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
      </main>
      <SmallFoot />
    </>
  );
}
