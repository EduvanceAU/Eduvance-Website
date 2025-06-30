"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';

const examCode = '8PH0';

const units = [
  { name: "Mechanics and Materials", code: "WPH11", unit: "Unit 1" },
  { name: "Waves and Electricity", code: "WPH12", unit: "Unit 2" },
  { name: "Practical Skills in Physics I", code: "WPH13", unit: "Unit 3" },
  { name: "Further Mechanics, Fields and Particles", code: "WPH14", unit: "Unit 4" },
  { name: "Thermodynamics, Radiation, Oscillations and Cosmology", code: "WPH15", unit: "Unit 5" },
  { name: "Practical Skills in Physics II", code: "WPH16", unit: "Unit 6" },
];

export default function IALResources() {
  const [session, setSession] = useState(null);
  const [unitResources, setUnitResources] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLoginPopup, setShowLoginPopup] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) setShowLoginPopup(true);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) setShowLoginPopup(true);
    });
    return () => subscription.unsubscribe();
  }, []);

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
          .eq('name', 'Physics')
          .eq('syllabus_type', 'IAL')
          .single();

        if (subjectError || !subjectData) {
          setError(subjectError || new Error('Subject "Physics" not found.'));
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
          setLoading(false);
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
        setLoading(false);
      } catch (error) {
        console.error("Error fetching resources:", error);
        setError(error);
        setLoading(false);
      }
    };

    fetchResources();
  }, [session]);

  if (!session) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <Auth 
          supabaseClient={supabase} 
          appearance={{ theme: ThemeSupa }} 
          providers={['google', 'discord']} 
          redirectTo={typeof window !== 'undefined' ? window.location.href : undefined}
        />
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-xl text-red-600">Error loading resources: {error.message}</p>
      </main>
    );
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <main className="min-h-screen bg-white flex flex-col items-center justify-start py-10">
      <div className="w-full max-w-7xl px-4">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#000000] mb-8 text-left tracking-[-0.035em]" style={{ fontFamily: "Poppins, sans-serif" }}>
          IAL <span className="bg-[#1A69FA] px-2 py-1 -rotate-1 inline-block"><span className="text-[#FFFFFF]">Physics</span></span> Resources
        </h1>

        <div className="inline-flex items-center justify-center px-4 py-2 mb-8 rounded-md" style={{ border: "1.5px solid #DBDBDB", fontFamily: "Poppins, sans-serif" }}>
          <span className="text-md font-medium text-black tracking-tight">
            <span className="font-[501]">Exam code:</span> {examCode}
          </span>
        </div>

        <h3 className="text-sm sm:text-md lg:text-lg font-[500] leading-6 text-[#707070] mb-8 text-left max-w-4xl tracking-[-0.015em]" style={{ fontFamily: "Poppins, sans-serif" }}>
          Access a wide range of Edexcel IAL Level Physics resources—all in one place. Whether you're brushing up on concepts or aiming to master exam strategies, these materials are designed to support your revision and boost your performance
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
              {unitResources["General"].map((resourceGroup, groupIndex) => (
                resourceGroup.links.map((link, linkIndex) => (
                  <div
                    key={groupIndex + '-' + linkIndex}
                    className="flex flex-col p-5 border border-gray-200 rounded-2xl shadow-md bg-white hover:shadow-xl transition-shadow duration-200 group"
                    style={{ minHeight: '120px', position: 'relative' }}
                  >
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
              {(unitResources[unitData.unit] || []).map((resourceGroup, groupIndex) => (
                resourceGroup.links.map((link, linkIndex) => (
                  <div
                    key={groupIndex + '-' + linkIndex}
                    className="flex flex-col p-5 border border-gray-200 rounded-2xl shadow-md bg-white hover:shadow-xl transition-shadow duration-200 group"
                    style={{ minHeight: '120px', position: 'relative' }}
                  >
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
          </div>
        ))}
      </div>

      {showLoginPopup && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg animate-slide-in-fade-out">
            Successfully logged in!
          </div>
          <style jsx>{`
            .animate-slide-in-fade-out {
              animation: slideInFadeOut 2.5s forwards;
            }
            @keyframes slideInFadeOut {
              0% { opacity: 0; transform: translateY(-20px); }
              10% { opacity: 1; transform: translateY(0); }
              90% { opacity: 1; transform: translateY(0); }
              100% { opacity: 0; transform: translateY(-20px); }
            }
          `}</style>
        </div>
      )}
    </main>
  );
}
