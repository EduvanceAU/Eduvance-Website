"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { useSupabaseAuth } from "@/components/client/SupabaseAuthContext";

const examCode = '8CH0';

const units = [
  { name: "Structure, Bonding & Introduction to Organic Chemistry", code: "WCH11", unit: "Unit 1" },
  { name: "Energetics, Group Chemistry, Halogenoalkanes & Alcohols", code: "WCH12", unit: "Unit 2" },
  { name: "Practical Skills in Chemistry I", code: "WCH13", unit: "Unit 3" },
  { name: "Rates, Equilibria & Further Organic Chemistry", code: "WCH14", unit: "Unit 4" },
  { name: "Transition Metals & Organic Nitrogen Chemistry", code: "WCH15", unit: "Unit 5" },
  { name: "Practical Skills in Chemistry II", code: "WCH16", unit: "Unit 6" },
];

export default function IALResources() {
  const { session, user, loading: authLoading } = useSupabaseAuth();
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
  
  const [unitResources, setUnitResources] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLoginPopup, setShowLoginPopup] = useState(false);

  useEffect(() => {
    if (session) setShowLoginPopup(true);
  }, [session]);

  useEffect(() => {
    if (showLoginPopup) {
      const timer = setTimeout(() => setShowLoginPopup(false), 2500);
      return () => clearTimeout(timer);
    }
  }, [showLoginPopup]);

  useEffect(() => {
    if (!session) return;
    setLoading(true);
    const fetchResources = async () => {
      try {
        const { data: subjectData, error: subjectError } = await supabase
          .from('subjects')
          .select('id')
          .eq('name', 'Chemistry')
          .eq('syllabus_type', 'IAL')
          .single();

        if (subjectError || !subjectData) {
          setError(subjectError || new Error('Subject "Chemistry" not found.'));
          setLoading(false);
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
          console.error('Error fetching resources:', resourcesError.message);
          return;
        }

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
        setLoading(false);
      } catch (error) {
        console.error("Error fetching resources:", error);
        setError(error);
        setLoading(false);
      }
    };

    fetchResources();
  }, [session]);

  if (error) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-xl text-red-600">Error loading resources: {error.message}</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white flex flex-col items-center justify-start py-10 m-10">
      <div className="w-full max-w-5xl px-4">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#000000] mb-8 text-left tracking-[-0.035em]" style={{ fontFamily: "Poppins, sans-serif" }}>
          IAL <span className="bg-[#1A69FA] px-2 py-1 -rotate-1 inline-block"><span className="text-[#FFFFFF]">Chemistry</span></span> Resources
        </h1>

        <div className="inline-flex items-center justify-center px-4 py-2 mb-8 rounded-md" style={{ border: "1.5px solid #DBDBDB", fontFamily: "Poppins, sans-serif" }}>
          <span className="text-md font-medium text-black tracking-tight">
            <span className="font-[501]">Exam code:</span> {examCode}
          </span>
        </div>

        <h3 className="text-sm sm:text-md lg:text-lg font-[500] leading-6 text-[#707070] mb-8 text-left max-w-4xl tracking-[-0.015em]" style={{ fontFamily: "Poppins, sans-serif" }}>
          Access a wide range of Edexcel IAL Level Chemistry resources—all in one place. Whether you're brushing up on concepts or aiming to master exam strategies, these materials are designed to support your revision and boost your performance
        </h3>
        {/* Unit-Based Resources */}
        {units.map((unitData) => (
          <div key={unitData.code} className="bg-white rounded-lg shadow-md mb-8 border border-gray-200 overflow-hidden">
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
                    <div key={index} className="flex flex-col p-5 border border-gray-200 rounded-2xl shadow-md bg-white hover:shadow-xl transition-shadow duration-200 group" style={{ minHeight: '120px', position: 'relative' }}>
                      <span className="text-sm font-semibold text-[#1A69FA] mb-1 tracking-tight uppercase" style={{ fontFamily: 'Poppins, sans-serif', letterSpacing: '0.04em' }}>{resourceGroup.heading}</span>
                      <Link href={link.url} className="text-lg font-bold text-[#153064] hover:text-[#1A69FA] transition-colors duration-150 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        {link.name}
                      </Link>
                      {link.description && (
                        <p className="text-sm text-gray-600 mt-1">{link.description}</p>
                      )}
                      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <svg width="22" height="22" fill="none" stroke="#1A69FA" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                      </div>
                    </div>
                  ))
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}
