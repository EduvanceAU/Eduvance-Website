"use client";
import React, { useEffect, useState } from 'react';

export default function AdminDashboardMySQL() {
  const [subjects, setSubjects] = useState([]);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(null);

  // New Subject Form
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newSubjectCode, setNewSubjectCode] = useState('');
  const [newSubjectType, setNewSubjectType] = useState('');
  const [newUnits, setNewUnits] = useState([]);
  const [newUnitName, setNewUnitName] = useState('');
  const [newUnitCode, setNewUnitCode] = useState('');
  const [newUnitNumber, setNewUnitNumber] = useState('');

  useEffect(() => {
    async function loadSubjects() {
      try {
        const res = await fetch('/api/mysql/subjects_full');
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to load subjects');
        setSubjects(data.subjects || []);
      } catch (e) {
        setMessage(`Subjects fetch failed: ${e.message}`);
        setMessageType('error');
      }
    }
    loadSubjects();
  }, []);

  const handleAddUnit = (e) => {
    e.preventDefault();
    if (!newUnitName || !newUnitCode || !newUnitNumber) return;
    setNewUnits(prev => ([...prev, { name: newUnitName, code: newUnitCode, unit: newUnitNumber }]));
    setNewUnitName(''); setNewUnitCode(''); setNewUnitNumber('');
  };

  const handleRemoveUnit = (idx) => {
    setNewUnits(prev => prev.filter((_, i) => i !== idx));
  };

  async function handleAddSubject(e) {
    e.preventDefault();
    if (!newSubjectName || !newSubjectType) {
      setMessage('All fields are required for adding a subject.');
      setMessageType('error');
      return;
    }
    try {
      // Insert directly into MySQL subjects
      const res = await fetch('/api/mysql/subjects_add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newSubjectName, code: newSubjectCode || null, syllabus_type: newSubjectType, units: newUnits })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add subject');
      setMessage('Subject added successfully.');
      setMessageType('success');
      setNewSubjectName(''); setNewSubjectCode(''); setNewSubjectType(''); setNewUnits([]);
      // Refresh subjects
      const res2 = await fetch('/api/mysql/subjects_full');
      const data2 = await res2.json();
      if (res2.ok) setSubjects(data2.subjects || []);
    } catch (e) {
      setMessage(`Failed to add subject: ${e.message}`);
      setMessageType('error');
    }
  }

  return (
    <div className="pt-20 min-h-screen bg-blue-100 p-6 flex justify-center items-center" style={{ fontFamily: 'Poppins, sans-serif' }}>
      <div className="h-fit bg-white rounded-xl shadow-lg w-full max-w-4xl mx-auto p-4 sm:p-6">
        <h2 className="text-xl font-semibold text-blue-700 mb-4">Admin Dashboard (MySQL)</h2>
        {message && (
          <div className={`mb-4 p-3 rounded text-sm flex items-center gap-2 justify-center ${messageType === 'success' ? 'bg-green-100 text-green-800 border border-green-300' : 'bg-red-100 text-red-800 border border-red-300'}`}>
            <span>{message}</span>
          </div>
        )}

        <form onSubmit={handleAddSubject} className="space-y-4 bg-blue-50 p-4 rounded-2xl border border-blue-100">
          <h3 className="text-xl font-semibold text-blue-700">Add Subject</h3>
          <input type="text" value={newSubjectName} onChange={(e) => setNewSubjectName(e.target.value)} placeholder="Subject Name *" className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition" required />
          <input type="text" value={newSubjectCode} onChange={(e) => setNewSubjectCode(e.target.value)} placeholder="Subject Code (optional)" className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition" />
          <input type="text" value={newSubjectType} onChange={(e) => setNewSubjectType(e.target.value)} placeholder="Syllabus Type * (e.g. IAL, IGCSE)" className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition" required />

          <div className="bg-white border border-blue-200 rounded-lg p-2 mt-2">
            <h4 className="font-semibold text-blue-700 mb-2 text-base">Add Units</h4>
            <div className="flex flex-col sm:flex-row gap-3 mb-2 items-center">
              <input type="text" value={newUnitNumber} onChange={e => setNewUnitNumber(e.target.value)} placeholder="Unit No (Unit 1)" className="text-sm text-gray-500 border p-2 rounded w-full sm:w-1/5" />
              <input type="text" value={newUnitName} onChange={e => setNewUnitName(e.target.value)} placeholder="Unit Name" className="text-sm text-gray-500 border p-2 rounded w-full sm:w-2/5" />
              <input type="text" value={newUnitCode} onChange={e => setNewUnitCode(e.target.value)} placeholder="Code (WPH11)" className="text-sm text-gray-500 border p-2 rounded w-full sm:w-1/5" />
              <button type="button" onClick={handleAddUnit} className="cursor-pointer bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm whitespace-nowrap w-full sm:w-fit">Add</button>
            </div>
            {newUnits.length > 0 && (
              <ul className="list-disc pl-5 mt-2 space-y-1">
                {newUnits.map((unit, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm mb-1">
                    <span className="font-semibold">{unit.unit}</span>: {unit.name} <span className="text-gray-400">({unit.code})</span>
                    <button type="button" onClick={() => handleRemoveUnit(idx)} className="cursor-pointer ml-2 text-red-500 hover:text-red-700 text-xs">Remove</button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <button type="submit" className="cursor-pointer w-full bg-green-600 hover:bg-green-700 transition text-white py-2 rounded-lg flex items-center justify-center gap-2">Add Subject</button>
        </form>
      </div>
    </div>
  );
}


