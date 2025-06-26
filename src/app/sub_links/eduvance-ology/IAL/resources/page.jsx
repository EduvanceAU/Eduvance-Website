"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

const examCode = '8PH0';

const units = [
  { name: "Mechanics and Materials", code: "WPH11", unit: "Unit 1" },
  { name: "Waves and Electricity", code: "WPH12", unit: "Unit 2" },
  { name: "Practical Skills in Eduvance-ology I", code: "WPH13", unit: "Unit 3" },
  { name: "Further Mechanics, Fields and Particles", code: "WPH14", unit: "Unit 4" },
  { name: "Thermodynamics, Radiation, Oscillations and Cosmology", code: "WPH15", unit: "Unit 5" },
  { name: "Practical Skills in Eduvance-ology II", code: "WPH16", unit: "Unit 6" },
];

export default function IALResources() {
  const [unitResources, setUnitResources] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const { data: subjectData, error: subjectError } = await supabase
          .from('subjects')
          .select('id')
          .eq('name', 'Eduvance-ology')
          .eq('syllabus_type', 'IAL')
          .single();

        if (subjectError || !subjectData) {
          setError(subjectError || new Error('Subject "Eduvance-ology" not found.'));
          return;
        }

        const subjectId = subjectData.id;

        const { data: resources, error: resourcesError } = await supabase
          .from('resources')
          .select('*')
          .eq('subject_id', subjectId)
          .order('created_at', { ascending: false });

        if (resourcesError) {
          setError(resourcesError);
          return;
        }

        const groupedResources = {};

        resources.forEach((resource) => {
          const unit = resource.unit_chapter_name?.trim() || 'General';

          if (!groupedResources[unit]) {
            groupedResources[unit] = [];
          }

          let group = groupedResources[unit].find(grp => grp.heading === resource.resource_type);
          if (!group) {
            group = { heading: resource.resource_type, links: [] };
            groupedResources[unit].push(group);
          }

          group.links.push({
            name: resource.title,
            url: resource.link,
            description: resource.description,
          });
        });

        setUnitResources(groupedResources);
      } catch (error) {
        console.error("Error fetching resources:", error);
        setError(error);
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

  return (
    <main className="min-h-screen bg-white flex flex-col items-center justify-start py-10">
      <div className="w-full max-w-7xl px-4">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#000000] mb-8 text-left tracking-[-0.035em]" style={{ fontFamily: "Poppins, sans-serif" }}>
          IAL <span className="bg-[#1A69FA] px-2 py-1 -rotate-1 inline-block"><span className="text-[#FFFFFF]">Eduvance-ology</span></span> Resources
        </h1>

        <div className="inline-flex items-center justify-center px-4 py-2 mb-8 rounded-md" style={{ border: "1.5px solid #DBDBDB", fontFamily: "Poppins, sans-serif" }}>
          <span className="text-md font-medium text-black tracking-tight">
            <span className="font-[501]">Exam code:</span> {examCode}
          </span>
        </div>

        <h3 className="text-sm sm:text-md lg:text-lg font-[500] leading-6 text-[#707070] mb-8 text-left max-w-4xl tracking-[-0.015em]" style={{ fontFamily: "Poppins, sans-serif" }}>
          Access a wide range of Edexcel IAL Level Eduvance-ology resources—all in one place. Whether you're brushing up on concepts or aiming to master exam strategies, these materials are designed to support your revision and boost your performance
        </h3>

        {/* General Resources */}
        {unitResources["General"] && (
          <div className="mb-12">
            <div className="w-full h-16 flex items-center px-6 mb-8 bg-gray-200">
              <h2 className="text-2xl font-semibold tracking-tight text-gray-800" style={{ fontFamily: "Poppins, sans-serif" }}>
                General Resources
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {unitResources["General"].map((resourceGroup, index) => (
                <div key={index} className="flex flex-col p-4 border border-gray-200 rounded-lg">
                  <h4 className="text-lg font-semibold text-[#153064] mb-2" style={{ fontFamily: "Poppins, sans-serif" }}>
                    {resourceGroup.heading}
                  </h4>
                  <ul className="space-y-3">
                    {resourceGroup.links.map((link, linkIndex) => (
                      <li key={linkIndex} className="flex flex-col">
                        <Link href={link.url} className="text-[#1A69FA] hover:underline text-md">
                          {link.name}
                        </Link>
                        {link.description && (
                          <p className="text-sm text-gray-600 mt-1">{link.description}</p>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Unit-Based Resources */}
        {units.map((unitData) => (
          <div key={unitData.code} className="mb-12">
            <div className="w-full h-16 flex items-center px-6 mb-8" style={{ backgroundColor: "#BAD1FD" }}>
              <h2 className="text-2xl font-semibold tracking-tight" style={{ color: "#153064", fontFamily: "Poppins, sans-serif" }}>
                {unitData.unit} {unitData.name}
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {(unitResources[unitData.unit] || []).map((resourceGroup, index) => (
                <div key={index} className="flex flex-col p-4 border border-gray-200 rounded-lg">
                  <h4 className="text-lg font-semibold text-[#153064] mb-2" style={{ fontFamily: "Poppins, sans-serif" }}>
                    {resourceGroup.heading}
                  </h4>
                  <ul className="space-y-3">
                    {resourceGroup.links.map((link, linkIndex) => (
                      <li key={linkIndex} className="flex flex-col">
                        <Link href={link.url} className="text-[#1A69FA] hover:underline text-md">
                          {link.name}
                        </Link>
                        {link.description && (
                          <p className="text-sm text-gray-600 mt-1">{link.description}</p>
                        )}
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
