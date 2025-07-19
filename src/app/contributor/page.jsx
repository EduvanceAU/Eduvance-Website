// This page allows anyone to add resources to the Supabase DB (no login required)
"use client";
import React, { useState, useEffect } from 'react';
import { Home } from '@/components/homenav';
import { supabase } from '@/lib/supabaseClient';

export default function ContributorUploadResource() {
  const [subjects, setSubjects] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(null);

  const [title, setTitle] = useState('');
  const [unitChapter, setUnitChapter] = useState('');
  const [link, setLink] = useState('');
  const [description, setDescription] = useState('');
  const [resourceType, setResourceType] = useState('note');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');

  const resourceCategories = [
    { value: 'note', label: 'Note' },
    { value: 'topic_question', label: 'Topic Questions' },
    { value: 'solved_papers', label: 'Solved Past Paper Questions' },
  ];

  // Fetch subjects
  useEffect(() => {
    setLoadingSubjects(true);
    supabase
      .from('subjects')
      .select('id, name, code, syllabus_type, units')
      .order('name', { ascending: true })
      .then(({ data, error }) => {
        if (error) {
          setMessage(`Subjects fetch failed: ${error.message}`);
          setMessageType('error');
        } else {
          // Sort units for each subject
          const sortedSubjects = (data || []).map(sub => {
            let units = sub.units || [];
            units.sort((a, b) => {
              const getUnitNum = (u) => {
                const match = (u.unit || '').match(/Unit\s*(\d+)/i);
                return match ? parseInt(match[1], 10) : Number.MAX_SAFE_INTEGER;
              };
              const numA = getUnitNum(a);
              const numB = getUnitNum(b);
              if (numA !== numB) return numA - numB;
              return (a.name || '').localeCompare(b.name || '');
            });
            return { ...sub, units };
          });
          setSubjects(sortedSubjects);
          if (sortedSubjects?.[0]?.id) setSelectedSubjectId(sortedSubjects[0].id);
        }
        setLoadingSubjects(false);
      });
  }, []);

  // Resource upload handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !link || !selectedSubjectId || !resourceType) {
      setMessage("Fill all required fields");
      setMessageType('error');
      return;
    }
  
    const unitValue = unitChapter.trim() === '' ? 'General' : unitChapter.trim();
  
    const { error } = await supabase
      .from('community_resource_requests')
      .insert({
        contributor_name: "Anonymous Contributor", // You can make this dynamic
        contributor_email: "anonymous@example.com", // Optional input field can be added
        title,
        link,
        description,
        resource_type: resourceType,
        subject_id: selectedSubjectId,
        unit_chapter_name: unitValue,
        is_approved: false,
        submitter_ip: null, // can be handled via Supabase Edge Functions if needed
      });
  
    if (error) {
      setMessage(`Submission failed: ${error.message}`);
      setMessageType('error');
    } else {
      setMessage("✅ Resource request submitted for review");
      setMessageType('success');
      setTitle(''); setLink(''); setDescription(''); setUnitChapter('');
    }
  };

  return (
    <>
      <Home showExtra/>
      <div className="pt-20 pr-10 pl-10 pb-10 min-h-screen bg-blue-100 flex items-center justify-center" style={{ fontFamily: 'Poppins, sans-serif' }}>
        <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-8 tracking-[-0.025em]">
          <h2 className="text-2xl font-semibold text-gray-800 text-center">Contribute with new resource</h2>

          {message && (
            <div className={`p-3 rounded-md text-sm ${
              messageType === 'success' ? 'bg-green-50 border border-green-200 text-green-800' :
              'bg-red-50 border border-red-200 text-red-800'
            }`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title *</label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="e.g., Physics Chapter 1 Notes"
                required
              />
            </div>
            <div>
              <label htmlFor="unitChapter" className="block text-sm font-medium text-gray-700">
                Unit/Chapter Name (Optional)
              </label>
              {/* Unit/Chapter dropdown or input */}
              {(() => {
                const selectedSubject = subjects.find(sub => sub.id === selectedSubjectId);
                const units = selectedSubject?.units || [];
                if (Array.isArray(units) && units.length > 0) {
                  return (
                    <select value={unitChapter} onChange={e => setUnitChapter(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                      <option value="">Select Unit/Chapter (optional)</option>
                      {units.map((unit, idx) => (
                        <option key={unit.code || unit.name || idx} value={unit.unit || unit.name}>{unit.unit ? `${unit.unit} - ${unit.name}` : unit.name}</option>
                      ))}
                      <option value="General">General</option>
                    </select>
                  );
                } else {
                  return (
                    <input
                      type="text"
                      id="unitChapter"
                      value={unitChapter}
                      onChange={(e) => setUnitChapter(e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="e.g., Unit 1: Kinematics"
                    />
                  );
                }
              })()}
              <p className="text-xs text-gray-500 mt-1">Leave blank if it applies to the whole subject (will be marked as "General")</p>
            </div>
            <div>
              <label htmlFor="link" className="block text-sm font-medium text-gray-700">Resource Link (URL) *</label>
              <input
                type="url"
                id="link"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="e.g., https://docs.google.com/..."
                required
              />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description (Optional)</label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows="3"
                className="min-h-[100px] mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm resize-y"
                placeholder="A brief summary of the resource content."
              ></textarea>
            </div>
            <div>
              <label htmlFor="resourceType" className="block text-sm font-medium text-gray-700">Resource Type *</label>
              <select
                id="resourceType"
                value={resourceType}
                onChange={(e) => setResourceType(e.target.value)}
                className="cursor-pointer mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                required
              >
                {resourceCategories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700">Subject *</label>
              <select
                id="subject"
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                className="cursor-pointer mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                required
                disabled={loadingSubjects || subjects.length === 0}
              >
                {loadingSubjects ? (
                  <option>Loading subjects...</option>
                ) : (
                  <>
                    <optgroup label="IAL">
                      {subjects
                        .filter((subject) => subject.syllabus_type === "IAL")
                        .map((subject) => (
                          <option key={subject.id} value={subject.id}>
                            {subject.name} ({subject.code}) - {subject.syllabus_type}
                          </option>
                        ))}
                    </optgroup>

                    <optgroup label="IGCSE">
                      {subjects
                        .filter((subject) => subject.syllabus_type === "IGCSE")
                        .map((subject) => (
                          <option key={subject.id} value={subject.id}>
                            {subject.name} ({subject.code}) - {subject.syllabus_type}
                          </option>
                        ))}
                    </optgroup>
                  </>
                )}
              </select>
            </div>
            <button
              type="submit"
              className="cursor-pointer w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition"
              disabled={loadingSubjects || subjects.length === 0}
            >
              Submit Resource
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
