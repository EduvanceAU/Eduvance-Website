"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";

const examCode = '8PH0'

const units = [
  { name: "Mechanics and Materials", code: "WPH11", unit: "Unit 1" },
  { name: "Waves and Electricity", code: "WPH12", unit: "Unit 2" },
  { name: "Practical Skills in Physics I", code: "WPH13", unit: "Unit 3" },
  { name: "Further Mechanics, Fields and Particles", code: "WPH14", unit: "Unit 4" },
  { name: "Thermodynamics, Radiation, Oscillations and Cosmology", code: "WPH15", unit: "Unit 5" },
  { name: "Practical Skills in Physics II", code: "WPH16", unit: "Unit 6" },
];

export default function IALResources() {
  // This state will hold your links data, structured by unit
  const [unitResources, setUnitResources] = useState({
    "Unit 1": [
      { heading: "Mechanics", links: [{ name: "Kinematics", url: "#" }, { name: "Forces", url: "#" }, { name: "Energy", url: "#" }] },
      { heading: "Materials", links: [{ name: "Properties of Materials", url: "#" }, { name: "Deformation", url: "#" }] },
    ],
    "Unit 2": [
      { heading: "Waves", links: [{ name: "Wave Properties", url: "#" }, { name: "Superposition", url: "#" }] },
      { heading: "Electricity", links: [{ name: "Circuits", url: "#" }, { name: "Current and Voltage", url: "#" }] },
      { heading: "Magnetism", links: [{ name: "Magnetic Fields", url: "#" }] },
    ],
    // Add more units and their respective resources here
    "Unit 3": [
      { heading: "Practical Skills", links: [{ name: "Experimental Design", url: "#" }, { name: "Data Analysis", url: "#" }] },
    ],
    "Unit 4": [
      { heading: "Further Mechanics", links: [{ name: "Momentum", url: "#" }, { name: "Circular Motion", url: "#" }] },
      { heading: "Fields", links: [{ name: "Gravitational Fields", url: "#" }, { name: "Electric Fields", url: "#" }] },
      { heading: "Particles", links: [{ name: "Particle Physics Intro", url: "#" }] },
    ],
    "Unit 5": [
      { heading: "Thermodynamics", links: [{ name: "Thermal Physics", url: "#" }] },
      { heading: "Radiation", links: [{ name: "Radioactivity", url: "#" }] },
      { heading: "Oscillations", links: [{ name: "Simple Harmonic Motion", url: "#" }] },
      { heading: "Cosmology", links: [{ name: "Universe", url: "#" }] },
    ],
    "Unit 6": [
      { heading: "Advanced Practical Skills", links: [{ name: "Advanced Experiments", url: "#" }] },
    ],
  });

  return (
    <main className="min-h-screen bg-white flex flex-col items-center justify-start py-10">
      <div className="w-full max-w-7xl px-4">
        <h1
          className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#000000] mb-8 text-left tracking-[-0.035em]"
          style={{ fontFamily: "Poppins, sans-serif" }}
        >
          IAL <span className="bg-[#1A69FA] px-2 py-1 -rotate-1 inline-block"><span className="text-[#FFFFFF]">Physics</span></span> Resources
        </h1>

        <div
          className="inline-flex items-center justify-center px-4 py-2 mb-8 rounded-md"
          style={{
            border: "1.5px solid #DBDBDB",
            fontFamily: "Poppins, sans-serif",
          }}
        >
          <span className="text-md font-medium text-black tracking-tight">
            <span className="font-[501]">Exam code:</span> {examCode}
          </span>
        </div>

        <h3
          className="text-sm sm:text-md lg:text-lg font-[500] leading-6 text-[#707070] mb-8 text-left max-w-4xl tracking-[-0.015em]"
          style={{ fontFamily: "Poppins, sans-serif" }}
        >
          Access a wide range of Edexcel IAL Level Physics resources—all in one place. Whether you’re brushing up on concepts or aiming to master exam strategies, these materials are designed to support your revision and boost your performance
        </h3>

        {/* Unit Dividers and Resources */}
        {units.map((unitData) => (
          <div key={unitData.code} className="mb-12">
            {/* Divider */}
            <div
              className="w-full h-16 flex items-center px-6 mb-8" // Increased height (h-16) and padding (px-6)
              style={{ backgroundColor: "#BAD1FD" }}
            >
              <h2
                className="text-2xl font-semibold tracking-tight" // Added tracking-tight and slightly larger text (text-2xl)
                style={{ color: "#153064", fontFamily: "Poppins, sans-serif" }}
              >
                {unitData.unit} {unitData.name}
              </h2>
            </div>

            {/* Resources Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {unitResources[unitData.unit] &&
                unitResources[unitData.unit].map((resourceGroup, index) => (
                  <div key={index} className="flex flex-col p-4 border border-gray-200 rounded-lg"> {/* Removed shadow and reduced vertical padding (p-4) */}
                    <h4 className="text-lg font-semibold text-[#153064] mb-2" style={{ fontFamily: "Poppins, sans-serif" }}> {/* Reduced mb- */}
                      {resourceGroup.heading}
                    </h4>
                    <ul className="space-y-1"> {/* Reduced space-y- */}
                      {resourceGroup.links.map((link, linkIndex) => (
                        <li key={linkIndex}>
                          <Link href={link.url} className="text-[#1A69FA] hover:underline text-md">
                            {link.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}