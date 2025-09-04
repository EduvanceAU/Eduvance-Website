"use client";
import React, { useEffect, useState } from 'react';
import { Home } from '@/components/homenav';

export default function ContributorUploadResourceMySQL() {
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

  useEffect(() => {
    async function loadSubjects() {
      setLoadingSubjects(true);
      try {
        const res = await fetch('/api/mysql/subjects_full');
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to load subjects');
        const sorted = (data.subjects || []).sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        setSubjects(sorted);
        if (sorted.length > 0 && !selectedSubjectId) {
          setSelectedSubjectId(sorted[0].id);
        }
      } catch (e) {
        setMessage(`Subjects fetch failed: ${e.message}`);
        setMessageType('error');
      } finally {
        setLoadingSubjects(false);
      }
    }
    loadSubjects();
  }, [selectedSubjectId]);

  const resourceCategories = [
    { value: 'note', label: 'Note' },
    { value: 'topic_question', label: 'Topic Questions' },
    { value: 'solved_papers', label: 'Solved Past Paper Questions' },
    { value: 'commonly_asked_questions', label: 'Commonly Asked Questions' },
    { value: 'essay_questions', label: 'Essay Questions' },
    { value: 'assorted_papers', label: 'Assorted Papers' },
    { value: 'youtube_videos', label: 'Youtube Videos' },
    { value: 'general_as', label: 'General (Purely AS)' },
    { value: 'general_a2', label: 'General (Purely A2)' }
  ];

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title || !link || !selectedSubjectId || !resourceType) {
      setMessage('Fill all required fields');
      setMessageType('error');
      return;
    }
    try {
      const unitValue = unitChapter.trim() === '' ? 'General' : unitChapter.trim();
      const res = await fetch('/api/mysql/community_resource_requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contributor_name: null,
          contributor_email: null,
          title,
          description,
          link,
          resource_type: resourceType,
          unit_chapter_name: unitValue,
          subject_id: selectedSubjectId
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Submission failed');
      setMessage('✅ Resource request submitted for review');
      setMessageType('success');
      setTitle(''); setLink(''); setDescription('');
    } catch (err) {
      setMessage(`Submission failed: ${err.message}`);
      setMessageType('error');
    }
  }

  return (
    <>
      <Home showExtra dontShowload/>
      <div className="pt-20 pr-10 pl-10 pb-10 min-h-screen bg-blue-100 flex items-center justify-center" style={{ fontFamily: 'Poppins, sans-serif' }}>
        <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-9 tracking-[-0.025em]">
          <h2 className="text-xl font-semibold text-gray-800 text-center">Contribute with new resource (MySQL)</h2>

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
                  subjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name} ({subject.code}) - {subject.syllabus_type}
                    </option>
                  ))
                )}
              </select>
            </div>
            <div>
              <label htmlFor="unitChapter" className="block text-sm font-medium text-gray-700">Unit/Chapter Name</label>
              {(() => {
                const selectedSubject = subjects.find(sub => sub.id === selectedSubjectId);
                const units = selectedSubject?.units || [];
                if (Array.isArray(units) && units.length > 0) {
                  return (
                    <select value={unitChapter} onChange={e => setUnitChapter(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                      <option value="">Select Unit/Chapter</option>
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


