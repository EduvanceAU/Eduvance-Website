"use client";

import Link from "next/link";
import { useState } from "react";

const units = [
  { name: "IAL Biology", code: "8PH0", unit: "IAL" },
  { name: "Molecules, Diet, Transport & Health", code: "WBI11", unit: "Unit 1" },
  { name: "Cells, Development, Biodiversity & Conservation", code: "WBI12", unit: "Unit 2" },
  { name: "Practical Skills in Biology I", code: "WBI13", unit: "Unit 3" },
  { name: "Genetics, Evolution & Ecology", code: "WBI14", unit: "Unit 4" },
  { name: "Respiration, Internal Environment, Coordination & Gene Technology", code: "WBI15", unit: "Unit 5" },
  { name: "Practical Biology & Investigation Skills", code: "WBI16", unit: "Unit 6" },
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
    <main className="min-h-screen bg-white flex flex-col items-center justify-start py-10 m-10">
      <div className="w-full max-w-7xl px-4">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#000000] mb-8 text-left tracking-[-0.035em]" style={{ fontFamily: "Poppins, sans-serif" }}>
          IAL <span className="bg-[#1A69FA] px-2 py-1 -rotate-1 inline-block"><span className="text-[#FFFFFF]">Biology</span></span> Community Notes
        </h1>

        <div className="inline-flex items-center justify-center px-4 py-2 mb-8 rounded-md" style={{ border: "1.5px solid #DBDBDB", fontFamily: "Poppins, sans-serif" }}>
          <span className="text-md font-medium text-black tracking-tight">
            <span className="font-[501]">Exam code:</span> {examCode}
          </span>
        </div>

        <h3 className="text-sm sm:text-md lg:text-lg font-[500] leading-6 text-[#707070] mb-8 text-left max-w-4xl tracking-[-0.015em]" style={{ fontFamily: "Poppins, sans-serif" }}>
          Explore our collection of Edexcel IAL Biology community-contributed resources, including detailed notes, explanations, and revision tips. These resources are perfect for deepening your understanding, clarifying tricky concepts, and supporting your study alongside past papers.
        </h3>

        {/* Subjects Buttons */}
        <div className="w-full mb-8">
          <h2 className="text-xl font-[550] tracking-tight text-[#000000] mb-4 text-left">
            Subjects
          </h2>
          <SubjectButtons />
        </div>

        {/* Dynamic Units Rendering */}
        {units.slice(1).map((unitData) => (
          <div key={unitData.code} className="mb-12">
            {/* Divider */}
            <div className="w-full h-16 flex items-center px-6 mb-8" style={{ backgroundColor: "#BAD1FD" }}>
              <h2 className="text-2xl font-semibold tracking-tight" style={{ color: "#153064", fontFamily: "Poppins, sans-serif" }}>
                {unitData.unit} {unitData.name}
              </h2>
            </div>

            {/* Notes Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Placeholder notes, replace with dynamic data if available */}
              <div className="flex flex-col p-4 border border-gray-200 rounded-lg">
                <h4 className="text-lg font-semibold text-[#153064] mb-2" style={{ fontFamily: "Poppins, sans-serif" }}>
                  Community Notes
                </h4>
                <ul className="space-y-3">
                  <li className="flex flex-col">
                    <Link href="#" className="text-[#1A69FA] hover:underline text-md">
                      Link to Note 1
                    </Link>
                    <p className="text-sm text-gray-600 mt-1">Description for Note 1</p>
                  </li>
                  <li className="flex flex-col">
                    <Link href="#" className="text-[#1A69FA] hover:underline text-md">
                      Link to Note 2
                    </Link>
                    <p className="text-sm text-gray-600 mt-1">Description for Note 2</p>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}