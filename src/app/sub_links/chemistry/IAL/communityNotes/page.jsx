"use client";

import Link from "next/link";
import { useState } from "react";

const units = [
  { name: "IAL Chemistry", code: "8PH0", unit: "IAL" },
  { name: "Structure, Bonding & Introduction to Organic Chemistry", code: "WCH11", unit: "Unit 1" },
  { name: "Energetics, Group Chemistry, Halogenoalkanes & Alcohols", code: "WCH12", unit: "Unit 2" },
  { name: "Practical Skills in Chemistry I", code: "WCH13", unit: "Unit 3" },
  { name: "Rates, Equilibria & Further Organic Chemistry", code: "WCH14", unit: "Unit 4" },
  { name: "Transition Metals & Organic Nitrogen Chemistry", code: "WCH15", unit: "Unit 5" },
  { name: "Practical Skills in Chemistry II", code: "WCH16", unit: "Unit 6" },
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
  const examCode = '8PH0';
  const [expandedUnits, setExpandedUnits] = useState(units.reduce((acc, unit) => {
    acc[unit.unit] = true;
    return acc;
  }, {}));

  const toggleUnit = (unit) => {
    setExpandedUnits(prev => ({
      ...prev,
      [unit]: !prev[unit]
    }));
  };
  return (
    <main className="min-h-screen bg-white flex flex-col items-center justify-start py-10">
      <div className="w-full max-w-5xl px-4">
        <h1
          className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#000000] mb-8 text-left tracking-[-0.035em]"
          style={{ fontFamily: "Poppins, sans-serif" }}
        >
          IAL <span className="bg-[#1A69FA] px-2 py-1 -rotate-1 inline-block"><span className="text-[#FFFFFF]">Chemistry</span></span> Community Notes
        </h1>

        <h3
          className="text-sm sm:text-md lg:text-lg font-[500] leading-6 text-[#707070] mb-8 text-left tracking-[-0.015em]"
          style={{ fontFamily: "Poppins, sans-serif" }}
        >
          Explore our collection of Edexcel A Level Chemistry community-contributed resources, including detailed notes, explanations, and revision tips. These resources are perfect for deepening your understanding, clarifying tricky concepts, and supporting your study alongside past papers.
        </h3>

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

        <div className="w-full mb-8">
          <h2 className="text-xl font-[550] tracking-tight text-[#000000] mb-4 text-left">
            Subjects
          </h2>
          <SubjectButtons />
          <div className="flex flex-wrap gap-2">
          </div>
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
                <div className="p-6">
                  {/* Add your links here, for example: */}
                  <ul className="list-disc list-inside">
                    <li>
                      <Link
                        href="#"
                        className="text-blue-600 hover:underline"
                      >
                        Link to Note 1
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="#"
                        className="text-blue-600 hover:underline"
                      >
                        Link to Note 2
                      </Link>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
