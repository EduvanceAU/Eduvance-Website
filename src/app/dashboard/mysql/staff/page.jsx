"use client";
import React, { useEffect, useState } from 'react';

export default function StaffDashboardMySQL() {
  const [subjects, setSubjects] = useState([]);
  const [examSessions, setExamSessions] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [loadingExamSessions, setLoadingExamSessions] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(null);

  const [title, setTitle] = useState('');
  const [unitChapter, setUnitChapter] = useState('');
  const [link, setLink] = useState('');
  const [description, setDescription] = useState('');
  const [resourceType, setResourceType] = useState('note');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');

  const [selectedExamSessionId, setSelectedExamSessionId] = useState('');
  const [unitCode, setUnitCode] = useState('');
  const [questionPaperLink, setQuestionPaperLink] = useState('');
  const [markSchemeLink, setMarkSchemeLink] = useState('');
  const [examinerReportLink, setExaminerReportLink] = useState('');

  useEffect(() => {
    async function loadSubjects() {
      setLoadingSubjects(true);
      try {
        const res = await fetch('/api/mysql/subjects_full');
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to load subjects');
        setSubjects(data.subjects || []);
        if (data.subjects?.[0]?.id) setSelectedSubjectId(data.subjects[0].id);
      } catch (e) {
        setMessage(`Subjects fetch failed: ${e.message}`);
        setMessageType('error');
      } finally {
        setLoadingSubjects(false);
      }
    }
    async function loadExamSessions() {
      setLoadingExamSessions(true);
      try {
        const res = await fetch('/api/mysql/exam_sessions');
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to load exam sessions');
        setExamSessions(data.exam_sessions || []);
        if (data.exam_sessions?.[0]?.id) setSelectedExamSessionId(data.exam_sessions[0].id);
      } catch (e) {
        setMessage(`Failed to fetch exam sessions: ${e.message}`);
        setMessageType('error');
      } finally {
        setLoadingExamSessions(false);
      }
    }
    loadSubjects();
    loadExamSessions();
  }, []);

  const resourceCategories = [
    { value: 'note', label: 'Note' },
    { value: 'topic_question', label: 'Topic Questions' },
    { value: 'solved_papers', label: 'Solved Past Paper Questions' },
    { value: 'commonly_asked_questions', label: 'Commonly Asked Questions' },
    { value: 'essay_questions', label: 'Essay Questions' },
    { value: 'assorted_papers', label: 'Assorted Papers' },
    { value: 'youtube_videos', label: 'Youtube Videos' }
  ];

  async function handleSubmitResource(e) {
    e.preventDefault();
    if (!title || !link || !selectedSubjectId || !resourceType) {
      setMessage('Please fill all required fields.');
      setMessageType('error');
      return;
    }
    const unitValue = unitChapter.trim() === '' ? 'General' : unitChapter.trim();
    try {
      const res = await fetch('/api/mysql/resources_insert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject_id: selectedSubjectId,
          resource_type: resourceType,
          title,
          description,
          link,
          unit_chapter_name: unitValue,
          contributor_email: 'staff@example.com',
          approved: 'Approved'
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Submission failed');
      setMessage('✅ Resource added successfully');
      setMessageType('success');
      setTitle(''); setLink(''); setDescription(''); setUnitChapter('');
    } catch (e) {
      setMessage(`Submission failed: ${e.message}`);
      setMessageType('error');
    }
  }

  async function handleSubmitPaper(e) {
    e.preventDefault();
    if (!selectedSubjectId || !selectedExamSessionId || !unitCode) {
      setMessage('Subject, Exam Session, and Unit Code are required.');
      setMessageType('error');
      return;
    }
    try {
      const res = await fetch('/api/mysql/papers_insert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject_id: selectedSubjectId,
          exam_session_id: selectedExamSessionId,
          unit_code: unitCode.trim(),
          question_paper_link: questionPaperLink.trim() || null,
          mark_scheme_link: markSchemeLink.trim() || null,
          examiner_report_link: examinerReportLink.trim() || null
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Paper submission failed');
      setMessage('✅ Past paper added successfully');
      setMessageType('success');
      setUnitCode(''); setQuestionPaperLink(''); setMarkSchemeLink(''); setExaminerReportLink('');
    } catch (e) {
      setMessage(`Past paper submission failed: ${e.message}`);
      setMessageType('error');
    }
  }

  const selectedSubject = subjects.find(sub => sub.id === selectedSubjectId);
  const units = selectedSubject?.units || [];

  return (
    <div className="pt-20 min-h-screen bg-blue-100 p-6 flex justify-center items-center" style={{ fontFamily: 'Poppins, sans-serif' }}>
      <div className="h-fit bg-white rounded-xl shadow-lg w-full max-w-4xl mx-auto p-4 sm:p-6">
        <div className="border-b mb-4 sm:text-base text-xs grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 sm:px-1 w-full">
          <h2 className="text-xl font-semibold text-blue-700">Staff Dashboard (MySQL)</h2>
        </div>
        {message && (
          <div className={`mb-4 p-3 rounded text-sm flex items-center gap-2 justify-center ${messageType === 'success' ? 'bg-green-100 text-green-800 border border-green-300' : 'bg-red-100 text-red-800 border border-red-300'}`}>
            <span>{message}</span>
          </div>
        )}

        <form onSubmit={handleSubmitResource} className="space-y-4 bg-blue-50 p-4 rounded-2xl border border-blue-100 mb-6">
          <h3 className="text-xl font-bold mb-2 text-blue-700">Upload New Resource</h3>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title *" className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition" required />
          {Array.isArray(units) && units.length > 0 ? (
            <select value={unitChapter} onChange={e => setUnitChapter(e.target.value)} className="cursor-pointer w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition">
              <option value="">Select Unit/Chapter (optional)</option>
              {units.map((unit, idx) => (
                <option key={unit.code || unit.name || idx} value={unit.unit || unit.name}>{unit.unit ? `${unit.unit} - ${unit.name}` : unit.name}</option>
              ))}
              <option value="General">General</option>
            </select>
          ) : (
            <input type="text" value={unitChapter} onChange={(e) => setUnitChapter(e.target.value)} placeholder="Unit/Chapter Name (Optional)" className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition" />
          )}
          <input type="url" value={link} onChange={(e) => setLink(e.target.value)} placeholder="Resource Link (URL) *" className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition" required />
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description (Optional)" className="min-h-[100px] w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition" rows="3"></textarea>
          <select value={resourceType} onChange={(e) => setResourceType(e.target.value)} className="cursor-pointer w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition" required>
            {['note','topic_question','solved_papers','commonly_asked_questions','essay_questions','assorted_papers','youtube_videos'].map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <select value={selectedSubjectId} onChange={(e) => setSelectedSubjectId(e.target.value)} className="cursor-pointer w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition" required disabled={loadingSubjects}>
            <option value="">{loadingSubjects ? 'Loading subjects...' : 'Select Subject *'}</option>
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name} ({subject.code}) - {subject.syllabus_type}
              </option>
            ))}
          </select>
          <button type="submit" className="cursor-pointer w-full bg-blue-600 hover:bg-blue-700 transition text-white py-2 rounded-lg flex items-center justify-center gap-2">Submit Resource</button>
        </form>

        <form onSubmit={handleSubmitPaper} className="space-y-4 bg-blue-50 p-4 rounded-2xl border border-blue-100">
          <h3 className="text-xl font-bold mb-2 text-blue-700">Upload New Past Paper</h3>
          <select value={selectedSubjectId} onChange={(e) => setSelectedSubjectId(e.target.value)} className="cursor-pointer w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition" required>
            <option value="">Select Subject *</option>
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name} ({subject.code}) - {subject.syllabus_type}
              </option>
            ))}
          </select>
          <select value={selectedExamSessionId} onChange={(e) => setSelectedExamSessionId(e.target.value)} className="cursor-pointer w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition" required disabled={loadingExamSessions}>
            <option value="">{loadingExamSessions ? 'Loading Exam Sessions...' : 'Select Exam Session *'}</option>
            {examSessions.map((session) => (
              <option key={session.id} value={session.id}>
                {session.session} {session.year}
              </option>
            ))}
          </select>
          {Array.isArray(units) && units.length > 0 ? (
            <select value={unitCode} onChange={e => setUnitCode(e.target.value)} className="cursor-pointer w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition" required>
              <option value="">Select Unit Code *</option>
              {units.map((unit, idx) => (
                <option key={unit.code || idx} value={unit.code}>
                  {unit.unit ? `${unit.unit} - ${unit.name} (${unit.code})` : `${unit.name} (${unit.code})`}
                </option>
              ))}
            </select>
          ) : (
            <input type="text" value={unitCode} onChange={(e) => setUnitCode(e.target.value)} placeholder="Unit Code (e.g., WAC11) *" className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition" required />
          )}
          <input type="url" value={questionPaperLink} onChange={(e) => setQuestionPaperLink(e.target.value)} placeholder="Question Paper Link (URL)" className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition" />
          <input type="url" value={markSchemeLink} onChange={(e) => setMarkSchemeLink(e.target.value)} placeholder="Mark Scheme Link (URL)" className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition" />
          <input type="url" value={examinerReportLink} onChange={(e) => setExaminerReportLink(e.target.value)} placeholder="Examiner Report Link (URL)" className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition" />
          <button type="submit" className="cursor-pointer w-full bg-blue-600 hover:bg-blue-700 transition text-white py-2 rounded-lg flex items-center justify-center gap-2">Add Past Paper</button>
        </form>
      </div>
    </div>
  );
}


