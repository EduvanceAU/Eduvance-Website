"use client";

import { useState, useEffect } from "react";

const sessions = [
  { label: "January", value: "January" },
  { label: "May/June", value: "June" },
  { label: "Oct/Nov", value: "November" },
];

const years = Array.from({ length: 10 }, (_, i) => 2015 + i);

const units = [
  { name: "Mechanics and Materials", code: "WPH11/01", unit: "Unit 1" },
  { name: "Waves and Electricity", code: "WPH12/01", unit: "Unit 2" },
  { name: "Practical Skills in Physics I", code: "WPH13/01", unit: "Unit 3" },
  {
    name: "Further Mechanics, Fields and Particles",
    code: "WPH14/01",
    unit: "Unit 4",
  },
  {
    name: "Thermodynamics, Radiation, Oscillations and Cosmology",
    code: "WPH15/01",
    unit: "Unit 5",
  },
  { name: "Practical Skills in Physics II", code: "WPH16/01", unit: "Unit 6" },
];

export default function PastPapersPage() {
  const [selectedUnits, setSelectedUnits] = useState([]);
  const [papers, setPapers] = useState({});
  const [loading, setLoading] = useState({});

  const toggleUnit = (unit) => {
    setSelectedUnits((prev) =>
      prev.includes(unit) ? prev.filter((u) => u !== unit) : [...prev, unit]
    );
  };

  const fetchPapers = async (year, session) => {
    const key = `${year}-${session.value}`;
    if (loading[key] || papers[key]) return;

    setLoading(prev => ({ ...prev, [key]: true }));
    try {
      const response = await fetch(`/api/past-papers?year=${year}&session=${session.value}`);
      const data = await response.json();
      if (data.papers) {
        setPapers(prev => ({ ...prev, [key]: data.papers }));
      }
    } catch (error) {
      console.error('Error fetching papers:', error);
    } finally {
      setLoading(prev => ({ ...prev, [key]: false }));
    }
  };

  const getPaperUrl = (year, session, unit, type) => {
    const key = `${year}-${session.value}`;
    const sessionPapers = papers[key] || [];
    return sessionPapers.find(
      paper => 
        paper.unitCode === unit.code && 
        paper.paperType === type
    )?.paperUrl || '#';
  };

  const filteredUnits =
    selectedUnits.length === 0
      ? units
      : units.filter((unit) => selectedUnits.includes(unit.unit));

  return (
    <main className="min-h-screen bg-white flex flex-col items-start justify-start py-10 px-4 sm:px-6 md:px-12 lg:px-20">
      <h1
        className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#153064] mb-8 w-full max-w-6xl text-left tracking-[-0.035em]"
        style={{ fontFamily: "Poppins, sans-serif" }}
      >
        IAL Physics Past Papers
      </h1>

      <div className="w-full max-w-6xl mb-8">
        <h2 className="text-xl font-semibold text-[#153064] mb-4">
          Filter by Unit
        </h2>
        <div className="flex flex-wrap gap-2">
          {units.map((unit) => (
            <button
              key={unit.unit}
              onClick={() => toggleUnit(unit.unit)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors
                ${
                  selectedUnits.includes(unit.unit)
                    ? "bg-[#153064] text-white"
                    : "bg-gray-100 text-[#153064] hover:bg-gray-200"
                }`}
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              {unit.unit}
            </button>
          ))}
        </div>
      </div>

      <div className="w-full max-w-6xl space-y-10">
        {years.map((year) => (
          <div key={year}>
            <h2
              className="text-2xl font-semibold text-[#153064] mb-4 text-left tracking-tight"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              {year}
            </h2>

            {sessions.map((session) => (
              <div key={`${year}-${session.label}`} className="mb-4">
                <h3
                  className="text-lg tracking-tighter font-medium text-[#153064] mb-2 text-left"
                  style={{ fontFamily: "Poppins, sans-serif" }}
                >
                  {session.label} Session
                </h3>

                <div
                  className="w-full bg-blue-100 rounded-t grid grid-cols-2 px-4 py-2 mb-1 text-[#153064]"
                  style={{ fontFamily: "Poppins, sans-serif" }}
                >
                  <span className="font-semibold text-sm text-left">Exam</span>
                  <span className="font-semibold text-sm text-left">
                    Marking Scheme
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 sm:gap-x-10 gap-y-2">
                  {filteredUnits.map((unit) => (
                    <div
                      key={`${year}-${session.label}-${unit.unit}`}
                      className="contents"
                    >
                      <button
                        onClick={() => fetchPapers(year, session)}
                        className="text-blue-600 font-medium hover:underline text-left max-w-[250px]"
                        style={{ fontFamily: "Poppins, sans-serif" }}
                      >
                        {loading[`${year}-${session.value}`] ? (
                          "Loading..."
                        ) : (
                          <a
                            href={getPaperUrl(year, session, unit, 'QP')}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 font-medium hover:underline"
                          >
                            {`${session.label} ${year} ${unit.unit}: ${unit.name} ${unit.code} (QP)`}
                          </a>
                        )}
                      </button>

                      <button
                        onClick={() => fetchPapers(year, session)}
                        className="text-blue-600 font-medium hover:underline text-left max-w-[250px]"
                        style={{ fontFamily: "Poppins, sans-serif" }}
                      >
                        {loading[`${year}-${session.value}`] ? (
                          "Loading..."
                        ) : (
                          <a
                            href={getPaperUrl(year, session, unit, 'MS')}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 font-medium hover:underline"
                          >
                            {`${session.label} ${year} ${unit.unit}: ${unit.name} ${unit.code} (MS)`}
                          </a>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </main>
  );
}
