"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

const examCode = '8PH0';

const units = [
  { name: "Molecules, Diet, Transport & Health", code: "WBI11", unit: "Unit 1" },
  { name: "Cells, Development, Biodiversity & Conservation", code: "WBI12", unit: "Unit 2" },
  { name: "Practical Skills in Biology I", code: "WBI13", unit: "Unit 3" },
  { name: "Genetics, Evolution & Ecology", code: "WBI14", unit: "Unit 4" },
  { name: "Respiration, Internal Environment, Coordination & Gene Technology", code: "WBI15", unit: "Unit 5" },
  { name: "Practical Biology & Investigation Skills", code: "WBI16", unit: "Unit 6" },
];

export default function IALResources() {
  const [unitResources, setUnitResources] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResources = async () => {
      try {
        // First get the subject ID
        const { data: subjectData, error: subjectError } = await supabase
          .from('subjects')
          .select('id')
          .eq('name', 'Biology')
          .eq('syllabus_type', 'IAL')
          .single();

        if (subjectError || !subjectData) {
          setError(subjectError || new Error('Subject "Biology" not found.'));
          return;
        }

        const subjectId = subjectData.id;

        // Then fetch resources for this subject
        const { data: resources, error: resourcesError } = await supabase
          .from('resources')
          .select('*')
          .eq('subject_id', subjectId)
          .order('created_at', { ascending: false });

        if (resourcesError) {
          setError(resourcesError);
          console.error('Error fetching resources:', resourcesError.message);
          return;
        }

        // Group resources by unit and resource type
        const groupedResources = {};

        resources.forEach((resource) => {
          // Extract unit from title or use a default if not found
          const unitMatch = resource.title.match(/Unit\s*\d+/i);
          const unit = unitMatch ? unitMatch[0] : 'General';
          
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
            description: resource.description
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
    <main className="min-h-screen bg-white flex flex-col items-center justify-start py-10 m-10">
      <div className="w-full max-w-7xl px-4">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#000000] mb-8 text-left tracking-[-0.035em]" style={{ fontFamily: "Poppins, sans-serif" }}>
          IAL <span className="bg-[#1A69FA] px-2 py-1 -rotate-1 inline-block"><span className="text-[#FFFFFF]">Biology</span></span> Resources
        </h1>

        <div className="inline-flex items-center justify-center px-4 py-2 mb-8 rounded-md" style={{ border: "1.5px solid #DBDBDB", fontFamily: "Poppins, sans-serif" }}>
          <span className="text-md font-medium text-black tracking-tight">
            <span className="font-[501]">Exam code:</span> {examCode}
          </span>
        </div>

        <h3 className="text-sm sm:text-md lg:text-lg font-[500] leading-6 text-[#707070] mb-8 text-left max-w-4xl tracking-[-0.015em]" style={{ fontFamily: "Poppins, sans-serif" }}>
          Access a wide range of Edexcel IAL Level Biology resources—all in one place. Whether you're brushing up on concepts or aiming to master exam strategies, these materials are designed to support your revision and boost your performance
        </h3>

        {/* Dynamic Units Rendering */}
        {units.map((unitData) => (
          <div key={unitData.code} className="mb-12">
            {/* Divider */}
            <div className="w-full h-16 flex items-center px-6 mb-8" style={{ backgroundColor: "#BAD1FD" }}>
              <h2 className="text-2xl font-semibold tracking-tight" style={{ color: "#153064", fontFamily: "Poppins, sans-serif" }}>
                {unitData.unit} {unitData.name}
              </h2>
            </div>

            {/* Resources Grid */}
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
