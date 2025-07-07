"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

const units = [
  { name: "IAL Physics", code: "8PH0", unit: "IAL" },
  { name: "Mechanics and Materials", code: "WPH11", unit: "Unit 1" },
  { name: "Waves and Electricity", code: "WPH12", unit: "Unit 2" },
  { name: "Practical Skills in Physics I", code: "WPH13", unit: "Unit 3" },
  { name: "Further Mechanics, Fields and Particles", code: "WPH14", unit: "Unit 4" },
  { name: "Thermodynamics, Radiation, Oscillations and Cosmology", code: "WPH15", unit: "Unit 5" },
  { name: "Practical Skills in Physics II", code: "WPH16", unit: "Unit 6" },
];

const subjects = [
  { name: "Physics", link: "/sub_links/physics/IAL/communityNotes" },
  { name: "Chemistry", link: "/sub_links/chemistry/IAL/communityNotes" },
  { name: "Biology", link: "/sub_links/biology/IAL/communityNotes" },
  { name: "Maths", link: "/sub_links/maths/IAL/communityNotes" },
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
  const examCode = "8PH0";
  const [expandedUnits, setExpandedUnits] = useState(units.reduce((acc, unit) => {
    acc[unit.unit] = true;
    return acc;
  }, {}));
  const [notes, setNotes] = useState([]);

  const toggleUnit = (unit) => {
    setExpandedUnits((prev) => ({
      ...prev,
      [unit]: !prev[unit],
    }));
  };

  useEffect(() => {
    const fetchNotes = async () => {
      const { data, error } = await supabase
        .from("community_resource_requests")
        .select("title, link, unit_chapter_name, subject_id")
        .eq("is_approved", true);

      if (error) {
        console.error("Error fetching notes:", error);
        return;
      }

      // Filter to only Physics subject and map notes by unit
      const physicsSubjectId = "147cf381-568e-4594-b9d1-6d624c91fa80"; // replace this
      const filtered = data.filter(
        (note) =>
          note.subject_id === physicsSubjectId &&
          note.unit_chapter_name &&
          units.some((u) => u.unit === note.unit_chapter_name)
      );

      setNotes(filtered);
    };

    fetchNotes();
  }, []);

  return (
    <main className="min-h-screen bg-white flex flex-col items-center justify-start py-10 m-10">
      <div className="w-full max-w-5xl px-4">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#000000] mb-8 text-left tracking-[-0.035em]" style={{ fontFamily: "Poppins, sans-serif" }}>
          IAL <span className="bg-[#1A69FA] px-2 py-1 -rotate-1 inline-block"><span className="text-[#FFFFFF]">Physics</span></span> Community Notes
        </h1>

        <h3 className="text-sm sm:text-md lg:text-lg font-[500] leading-6 text-[#707070] mb-8 text-left tracking-[-0.015em]" style={{ fontFamily: "Poppins, sans-serif" }}>
          Explore our collection of Edexcel A Level Physics community-contributed resources, including detailed notes, explanations, and revision tips. These resources are perfect for deepening your understanding, clarifying tricky concepts, and supporting your study alongside past papers.
        </h3>

        <div className="inline-flex items-center justify-center px-4 py-2 mb-8 rounded-md shadow-xl" style={{ border: "1.5px solid #DBDBDB", fontFamily: "Poppins, sans-serif" }}>
          <span className="text-md font-medium text-black tracking-tight">
            <span className="font-[501]">Exam code:</span> {examCode}
          </span>
        </div>

        <div className="w-full mb-8">
          <h2 className="text-xl font-[550] tracking-tight text-[#000000] mb-4 text-left">Subjects</h2>
          <SubjectButtons />
        </div>

        <div className="w-full space-y-10">
          {units.map((unit) => {
            const unitNotes = notes.filter((note) => note.unit_chapter_name === unit.unit);
            return (
              <div key={unit.unit} className="bg-white rounded-lg shadow-md mb-8 border border-gray-200 overflow-hidden">
                <div
                  className="bg-[#2871F9] text-white tracking-tight p-4 text-left font-bold text-xl sm:text-2xl cursor-pointer"
                  style={{ fontFamily: "Poppins, sans-serif" }}
                  onClick={() => toggleUnit(unit.unit)}
                >
                  {unit.name}
                </div>

                {expandedUnits[unit.unit] && (
                  <div className="p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {unitNotes.length === 0 ? (
                        <p className="text-gray-500 font-medium text-sm col-span-full">No notes submitted for this unit yet.</p>
                      ) : (
                        unitNotes.map((note, idx) => (
                          <div
                            key={idx}
                            className="flex flex-col p-5 border border-gray-200 rounded-2xl shadow-md bg-white hover:shadow-xl transition-shadow duration-200 group"
                            style={{ minHeight: '100px', position: 'relative' }}
                          >
                            <span className="text-sm font-semibold text-[#1A69FA] mb-1 tracking-tight uppercase" style={{ fontFamily: 'Poppins, sans-serif', letterSpacing: '0.04em' }}>
                              Note
                            </span>
                            <Link href={note.link} target="_blank" className="text-lg font-bold text-[#153064] hover:text-[#1A69FA] transition-colors duration-150 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                              {note.title}
                            </Link>
                            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                              <svg width="22" height="22" fill="none" stroke="#1A69FA" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
