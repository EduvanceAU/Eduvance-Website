"use client";
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export default function UploadResource() {
  const [supabaseClient, setSupabaseClient] = useState(null);
  const [staffUser, setStaffUser] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(null);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [unitChapter, setUnitChapter] = useState('');
  const [link, setLink] = useState('');
  const [description, setDescription] = useState('');
  const [resourceType, setResourceType] = useState('note');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [staffUsername, setStaffUsername] = useState('');
  const [activeTab, setActiveTab] = useState('upload');
  const [pendingResources, setPendingResources] = useState([]);
  const [rejectionReasons, setRejectionReasons] = useState({});
  const [watermarkLoading, setWatermarkLoading] = useState({});
  const [submitLoading, setSubmitLoading] = useState(false);

  // Add state for editable links
  const [editedLinks, setEditedLinks] = useState({});
  // Add state for which resource is being edited
  const [editingLinkId, setEditingLinkId] = useState(null);

  // Add state for watermarked files
  const [watermarkedFiles, setWatermarkedFiles] = useState({});

  const resourceCategories = [
    { value: 'note', label: 'Note' },
    { value: 'topic_question', label: 'Topic Questions' },
    { value: 'solved_papers', label: 'Solved Past Paper Questions' },
  ];

  useEffect(() => {
    if (window.supabase && !supabaseClient) {
      const client = window.supabase.createClient(supabaseUrl, supabaseKey);
      setSupabaseClient(client);
    }
  }, []);

  useEffect(() => {
    if (!supabaseClient) return;
    setIsAuthReady(false);
    const { data: subscription } = supabaseClient.auth.onAuthStateChange((_e, session) => {
      setStaffUser(session?.user || null);
      setIsAuthReady(true);
      if (session?.user) {
        supabaseClient
          .from('staff_users')
          .select('username')
          .eq('id', session.user.id)
          .single()
          .then(({ data: staffData }) => {
            setStaffUsername(staffData?.username || '');
          });
        fetchPendingResources();
      }
    });
    supabaseClient.auth.getSession().then(({ data }) => {
      setStaffUser(data?.session?.user || null);
      setIsAuthReady(true);
      if (data?.session?.user) {
        supabaseClient
          .from('staff_users')
          .select('username')
          .eq('id', data.session.user.id)
          .single()
          .then(({ data: staffData }) => {
            setStaffUsername(staffData?.username || '');
          });
        fetchPendingResources();
      }
    });
    return () => subscription?.unsubscribe?.();
  }, [supabaseClient]);

  useEffect(() => {
    if (!supabaseClient) return;
    setLoadingSubjects(true);
    supabaseClient.from('subjects')
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
  }, [supabaseClient]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!supabaseClient) return;
    setLoginLoading(true);
    setMessage("");
    setMessageType(null);
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email: loginEmail,
      password: loginPassword,
    });
    if (error) {
      setMessage(`Login failed: ${error.message}`);
      setMessageType('error');
    } else {
      setStaffUser(data.user);
      setMessage('Logged in successfully!');
      setMessageType('success');
      supabaseClient
        .from('staff_users')
        .select('username')
        .eq('id', data.user.id)
        .single()
        .then(({ data: staffData }) => {
          setStaffUsername(staffData?.username || '');
        });
      fetchPendingResources();
    }
    setLoginLoading(false);
  };

  const handleLogout = async () => {
    if (!supabaseClient) return;
    await supabaseClient.auth.signOut();
    setStaffUser(null);
    setMessage('Logged out.');
    setMessageType('success');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    console.log('handleSubmit called');
    if (!supabaseClient) {
      setMessage('Error: Supabase client not initialized. Please refresh the page or check your connection.');
      setMessageType('error');
      console.error('Supabase client is null in handleSubmit');
      setSubmitLoading(false);
      return;
    }
    if (!title || !link || !selectedSubjectId || !resourceType) {
      setMessage("Fill all required fields");
      setMessageType('error');
      setSubmitLoading(false);
      return;
    }
    if (!supabaseClient || !staffUser) {
      setMessage("Not ready to submit");
      setMessageType('error');
      setSubmitLoading(false);
      return;
    }
    const unitValue = unitChapter.trim() === '' ? 'General' : unitChapter.trim();
    const { data, error } = await supabaseClient
      .from('resources')
      .insert({
        title,
        link,
        description,
        resource_type: resourceType,
        subject_id: selectedSubjectId,
        unit_chapter_name: unitValue,
        uploaded_by_username: staffUsername,
        approved: false
      })
      .select();
    console.log('Insert data:', data, 'Insert error:', error);
    if (error) {
      setMessage(`Submission failed: ${error.message}`);
      setMessageType('error');
      console.error('Resource submission error:', error);
      setSubmitLoading(false);
    } else if (!data || data.length === 0) {
      setMessage('Submission did not return a new resource. Please check your database constraints.');
      setMessageType('error');
      setSubmitLoading(false);
      console.warn('No data returned from insert:', data);
    } else {
      setMessage("✅ Resource added successfully");
      setMessageType('success');
      setTitle(''); setLink(''); setDescription('');
      setTimeout(() => {
        setMessage("");
        setMessageType(null);
      }, 3000);
      setSubmitLoading(false);
    }
  };

  // Fetch pending community resource requests
  const fetchPendingResources = async () => {
    if (!supabaseClient) return;
    const { data, error } = await supabaseClient
      .from('community_resource_requests')
      .select('*')
      .eq('is_approved', false);
    if (!error) setPendingResources(data);
  };

  // Approve a community resource request
  const approveResource = async (id) => {
    if (!supabaseClient) return;
    // Get the request
    const { data, error } = await supabaseClient
      .from('community_resource_requests')
      .update({ is_approved: true, approved_at: new Date().toISOString(), approved_by: staffUsername })
      .eq('id', id)
      .select()
      .single();
    if (!error && data) {
      // Insert into resources table
      await supabaseClient.from('resources').insert({
        title: data.title,
        link: data.link,
        description: data.description,
        resource_type: data.resource_type,
        subject_id: data.subject_id,
        unit_chapter_name: data.unit_chapter_name,
        uploaded_by_username: data.contributor_name || data.contributor_email || 'Community',
        approved: true
      });
      // Remove from pending list
      setPendingResources((prev) => prev.filter((res) => res.id !== id));
    }
  };

  // Reject a community resource request
  const rejectResource = async (id) => {
    if (!supabaseClient || !rejectionReasons[id]) return;
    const { error } = await supabaseClient
      .from('community_resource_requests')
      .update({ rejection_reason: rejectionReasons[id] })
      .eq('id', id);
    if (!error) {
      setPendingResources((prev) => prev.filter((res) => res.id !== id));
    }
  };

  const handleWatermark = async (resource) => {
    setWatermarkLoading((prev) => ({ ...prev, [resource.id]: true }));
    try {
      const res = await fetch('/api/watermark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: resource.link }),
      });
      if (!res.ok) {
        const err = await res.json();
        setMessage(`Watermark failed: ${err.error || res.statusText}`);
        setMessageType('error');
        return;
      }
      const contentDisposition = res.headers.get('Content-Disposition') || '';
      let fileNames = [];
      if (contentDisposition.includes('zip')) {
        // Folder: try to get file list from zip (not possible client-side), so just show generic message
        fileNames = ['All PDFs in folder'];
      } else {
        // Single file: extract filename
        const match = contentDisposition.match(/filename="([^"]+)"/);
        if (match) fileNames = [match[1]];
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileNames[0] || 'watermarked.pdf';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      setMessage('Watermarked PDF downloaded!');
      setMessageType('success');
      setWatermarkedFiles(prev => ({ ...prev, [resource.id]: fileNames }));
    } catch (err) {
      setMessage('Watermark error: ' + err.message);
      setMessageType('error');
    } finally {
      setWatermarkLoading((prev) => ({ ...prev, [resource.id]: false }));
    }
  };

  // Add handler to save edited link
  const handleSaveLink = async (id) => {
    if (!supabaseClient) return;
    const newLink = editedLinks[id];
    if (!newLink) return;
    const { error } = await supabaseClient
      .from('community_resource_requests')
      .update({ link: newLink })
      .eq('id', id);
    if (!error) {
      setPendingResources(prev =>
        prev.map(res => res.id === id ? { ...res, link: newLink } : res)
      );
      setMessage('Link updated!');
      setMessageType('success');
    } else {
      setMessage('Failed to update link: ' + error.message);
      setMessageType('error');
    }
  };

  return (
    <div className={`pt-20 ${!staffUser ? "h-screen":"min-h-screen h-fit "} bg-blue-100 p-6 flex justify-center items-center`} style={{ fontFamily: 'Poppins, sans-serif' }}>      
      <div className="h-fit bg-white rounded-xl shadow-lg w-full max-w-3xl mx-auto p-4 sm:p-6">
        {!staffUser ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <h2 className="text-2xl font-bold mb-2 text-blue-700 flex items-center gap-2">
              <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
              Staff Login
            </h2>
            <input type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} placeholder="Staff Email" className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition" required />
            <input type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} placeholder="Password" className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition" required />
            <button type="submit" className="cursor-pointer w-full bg-blue-600 hover:bg-blue-700 transition text-white py-2 rounded-lg flex items-center justify-center gap-2">{loginLoading ? <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg> : <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>} {loginLoading ? 'Logging in...' : 'Login'}</button>
          </form>
        ) : (
          <>
            {/* <div className="flex space-x-4 border-b mb-4"> */}
            <div className="border-b mb-4 sm:text-base text-xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 sm:px-1 w-full">
              <button onClick={() => setActiveTab('upload')} className={`cursor-pointer py-2 px-4 flex items-center gap-1 rounded-t-lg ${activeTab === 'upload' ? 'border-b-2 border-blue-600 font-semibold text-blue-700 bg-blue-50' : 'text-gray-500 hover:text-blue-600'}`}><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4" /></svg>Upload</button>
              <button onClick={() => setActiveTab('approve')} className={`cursor-pointer py-2 px-4 flex items-center gap-1 rounded-t-lg ${activeTab === 'approve' ? 'border-b-2 border-blue-600 font-semibold text-blue-700 bg-blue-50' : 'text-gray-500 hover:text-blue-600'}`}><svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="currentColor"><path d="M263.72-96Q234-96 213-117.15T192-168v-384q0-29.7 21.15-50.85Q234.3-624 264-624h24v-96q0-79.68 56.23-135.84 56.22-56.16 136-56.16Q560-912 616-855.84q56 56.16 56 135.84v96h24q29.7 0 50.85 21.15Q768-581.7 768-552v384q0 29.7-21.16 50.85Q725.68-96 695.96-96H263.72Zm.28-72h432v-384H264v384Zm216.21-120Q510-288 531-309.21t21-51Q552-390 530.79-411t-51-21Q450-432 429-410.79t-21 51Q408-330 429.21-309t51 21ZM360-624h240v-96q0-50-35-85t-85-35q-50 0-85 35t-35 85v96Zm-96 456v-384 384Z"/></svg>Approve</button>
            </div>
            {message && (
              <div className={`mb-4 p-3 rounded text-sm flex items-center gap-2 justify-center ${messageType === 'success' ? 'bg-green-100 text-green-800 border border-green-300 animate-fade-in' : 'bg-red-100 text-red-800 border border-red-300 animate-fade-in'}`}>
                {messageType === 'success' ? (
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                ) : (
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                )}
                <span>{message}</span>
              </div>
            )}
            {activeTab === 'upload' && (
              <>
                <form onSubmit={handleSubmit} className="space-y-4 bg-blue-50 p-4 rounded-2xl border border-blue-100">
                  <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition" required />
                  {/* Unit/Chapter dropdown or input */}
                  {(() => {
                    const selectedSubject = subjects.find(sub => sub.id === selectedSubjectId);
                    const units = selectedSubject?.units || [];
                    if (Array.isArray(units) && units.length > 0) {
                      return (
                        <select value={unitChapter} onChange={e => setUnitChapter(e.target.value)} className="cursor-pointer w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition">
                          <option value="">Select Unit/Chapter (optional)</option>
                          {units.map((unit, idx) => (
                            <option key={unit.code || unit.name || idx} value={unit.unit || unit.name}>{unit.unit ? `${unit.unit} - ${unit.name}` : unit.name}</option>
                          ))}
                          <option value="General">General</option>
                        </select>
                      );
                    } else {
                      return (
                        <input type="text" value={unitChapter} onChange={(e) => setUnitChapter(e.target.value)} placeholder="Unit/Chapter Name (Optional)" className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition" />
                      );
                    }
                  })()}
                  <input type="url" value={link} onChange={(e) => setLink(e.target.value)} placeholder="Resource Link (URL)" className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition" required />
                  <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description (Optional)" className="min-h-[100px] w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition" rows="3"></textarea>
                  <select value={resourceType} onChange={(e) => setResourceType(e.target.value)} className="cursor-pointer w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition" required>
                    {resourceCategories.map((cat) => <option key={cat.value} value={cat.value}>{cat.label}</option>)}
                  </select>
                  <select value={selectedSubjectId} onChange={(e) => setSelectedSubjectId(e.target.value)} className="cursor-pointer w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition" required>
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
                  </select>
                  <button type="submit" className="cursor-pointer w-full bg-blue-600 hover:bg-blue-700 transition text-white py-2 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed" disabled={submitLoading}>
                    {submitLoading ? (
                      <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7 10l5 5m0 0l5-5m-5 5V4" /></svg>
                    )}
                    {submitLoading ? 'Submitting...' : 'Submit Resource'}
                  </button>
                </form>
              </>
            )}
            {activeTab === 'approve' && (
              <>
                <div className="divide-y divide-blue-100">
                  {pendingResources.length === 0 && <div className="text-gray-500 text-sm py-4">No pending submissions 🎉</div>}
                  {pendingResources.map((res) => (
                    <div key={res.id} className="bg-gray-100 p-4 rounded mb-3 flex flex-col flex-shrink min-w-0 w-full ">
                      <div>
                        <p className="font-bold break-words text-blue-800">{res.title}</p>
                        <p className="text-sm text-gray-600 break-words mb-1">{res.description}</p>
                        {/* Editable link section */}
                        <div className="flex items-center gap-2 mb-1">
                          {editingLinkId === res.id ? (
                            <>
                              <input
                                type="url"
                                value={editedLinks[res.id] !== undefined ? editedLinks[res.id] : res.link}
                                onChange={e => setEditedLinks(prev => ({ ...prev, [res.id]: e.target.value }))}
                                className="border px-2 py-1 rounded-md text-sm flex-1 min-w-0 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
                                placeholder="Resource Link (URL)"
                                autoFocus
                              />
                              <button
                                onClick={() => { handleSaveLink(res.id); setEditingLinkId(null); }}
                                className="bg-blue-500 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs transition flex items-center gap-1"
                                disabled={
                                  (editedLinks[res.id] === undefined || editedLinks[res.id] === res.link || !editedLinks[res.id])
                                }
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                Save
                              </button>
                              <button
                                onClick={() => { setEditingLinkId(null); setEditedLinks(prev => ({ ...prev, [res.id]: res.link })); }}
                                className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-2 py-1 rounded text-xs transition flex items-center gap-1"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                                Cancel
                              </button>
                            </>
                          ) : (
                            <>
                              <a
                                href={res.link}
                                className="text-blue-500 underline text-xs px-2 py-1 rounded hover:bg-blue-100 transition whitespace-nowrap break-all flex-1"
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ minWidth: 0 }}
                              >
                                {res.link}
                              </a>
                              <button
                                onClick={() => { setEditingLinkId(res.id); setEditedLinks(prev => ({ ...prev, [res.id]: res.link })); }}
                                className="p-1 cursor-pointer text-blue-500 hover:text-blue-700 focus:outline-none"
                                title="Edit link"
                              >
                                {/* Upload SVG icon */}
                                <span className="inline-block align-middle">
                                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M6.54415 13.6325L5.59547 13.9487V13.9487L6.54415 13.6325ZM6.41886 13.2566L7.36754 12.9404V12.9404L6.41886 13.2566ZM13.5811 13.2566L12.6325 12.9404V12.9404L13.5811 13.2566ZM13.4558 13.6325L12.5072 13.3162L12.5072 13.3162L13.4558 13.6325ZM2.23463 11.8478L2.61732 10.9239L2.23463 11.8478ZM1.15224 10.7654L0.228361 11.1481H0.228361L1.15224 10.7654ZM5.77888 12.1338L5.27924 13L5.27924 13L5.77888 12.1338ZM5.94303 12.2521L6.60681 11.5042L6.60681 11.5042L5.94303 12.2521ZM14.2211 12.1338L14.7208 13L14.7208 13L14.2211 12.1338ZM14.057 12.2521L14.7208 13L14.057 12.2521ZM18.8478 10.7654L19.7716 11.148L18.8478 10.7654ZM17.7654 11.8478L18.1481 12.7716H18.1481L17.7654 11.8478ZM10 5L10.5812 4.18627L10 3.7711L9.41876 4.18627L10 5ZM4.67544 12V11H4V12V13H4.67544V12ZM16 12V11H15.3246V12V13H16V12ZM6.54415 13.6325L7.49284 13.3162L7.36754 12.9404L6.41886 13.2566L5.47018 13.5728L5.59547 13.9487L6.54415 13.6325ZM13.5811 13.2566L12.6325 12.9404L12.5072 13.3162L13.4558 13.6325L14.4045 13.9487L14.5298 13.5728L13.5811 13.2566ZM11.5585 15V14H8.44152V15V16H11.5585V15ZM13.4558 13.6325L12.5072 13.3162C12.3899 13.6681 12.327 13.8518 12.2689 13.9768C12.2216 14.0784 12.2209 14.0421 12.2792 14L12.864 14.8112L13.4487 15.6225C13.7689 15.3917 13.9541 15.096 14.0823 14.8204C14.1997 14.5681 14.3018 14.2568 14.4045 13.9487L13.4558 13.6325ZM11.5585 15V16C11.8833 16 12.2109 16.0015 12.4873 15.97C12.7893 15.9355 13.1284 15.8533 13.4487 15.6225L12.864 14.8112L12.2792 14C12.3376 13.9579 12.3718 13.9701 12.2605 13.9829C12.1236 13.9985 11.9294 14 11.5585 14V15ZM6.54415 13.6325L5.59547 13.9487C5.69819 14.2568 5.80035 14.5681 5.9177 14.8204C6.04591 15.096 6.23108 15.3917 6.55134 15.6225L7.13605 14.8112L7.72076 14C7.77913 14.0421 7.77836 14.0784 7.73108 13.9768C7.67297 13.8518 7.61012 13.6681 7.49284 13.3162L6.54415 13.6325ZM8.44152 15V14C8.07063 14 7.87643 13.9985 7.73953 13.9829C7.62818 13.9701 7.66239 13.9579 7.72076 14L7.13605 14.8112L6.55134 15.6225C6.8716 15.8533 7.21068 15.9355 7.51266 15.97C7.7891 16.0015 8.11669 16 8.44152 16V15ZM4 12V11C3.52038 11 3.21074 10.9995 2.97376 10.9833C2.74576 10.9677 2.65893 10.9411 2.61732 10.9239L2.23463 11.8478L1.85195 12.7716C2.17788 12.9066 2.50779 12.9561 2.83762 12.9787C3.15846 13.0005 3.54774 13 4 13V12ZM1 9H0C0 9.45226 -0.000541568 9.84154 0.0213497 10.1624C0.0438537 10.4922 0.0933575 10.8221 0.228361 11.1481L1.15224 10.7654L2.07612 10.3827C2.05888 10.3411 2.03227 10.2542 2.01671 10.0262C2.00054 9.78926 2 9.47962 2 9H1ZM2.23463 11.8478L2.61732 10.9239C2.37229 10.8224 2.17761 10.6277 2.07612 10.3827L1.15224 10.7654L0.228361 11.1481C0.532843 11.8831 1.11687 12.4672 1.85195 12.7716L2.23463 11.8478ZM4.67544 12V13C4.98506 13 5.14705 13.0011 5.26255 13.0121C5.35856 13.0214 5.33297 13.031 5.27924 13L5.77888 12.1338L6.27851 11.2675C5.99287 11.1028 5.70607 11.0455 5.4536 11.0213C5.22061 10.9989 4.94684 11 4.67544 11V12ZM6.41886 13.2566L7.36754 12.9404C7.28172 12.6829 7.19616 12.4228 7.10127 12.2089C6.99845 11.977 6.85344 11.723 6.60681 11.5042L5.94303 12.2521L5.27924 13C5.23285 12.9588 5.23389 12.9315 5.27299 13.0197C5.32003 13.1257 5.37227 13.2791 5.47018 13.5728L6.41886 13.2566ZM5.77888 12.1338L5.27924 13L5.27924 13L5.94303 12.2521L6.60681 11.5042C6.50566 11.4144 6.39566 11.3351 6.27851 11.2675L5.77888 12.1338ZM15.3246 12V11C15.0532 11 14.7794 10.9989 14.5464 11.0213C14.2939 11.0455 14.0071 11.1028 13.7215 11.2675L14.2211 12.1338L14.7208 13C14.667 13.031 14.6414 13.0214 14.7375 13.0121C14.8529 13.0011 15.0149 13 15.3246 13V12ZM13.5811 13.2566L14.5298 13.5728C14.6277 13.2791 14.68 13.1257 14.727 13.0197C14.7661 12.9315 14.7672 12.9588 14.7208 13L14.057 12.2521L13.3932 11.5042C13.1466 11.723 13.0015 11.977 12.8987 12.2089C12.8038 12.4228 12.7183 12.6829 12.6325 12.9404L13.5811 13.2566ZM14.2211 12.1338L13.7215 11.2675C13.6043 11.3351 13.4943 11.4144 13.3932 11.5042L14.057 12.2521L14.7208 13L14.7208 13L14.2211 12.1338ZM19 9H18C18 9.47962 17.9995 9.78926 17.9833 10.0262C17.9677 10.2542 17.9411 10.3411 17.9239 10.3827L18.8478 10.7654L19.7716 11.148C19.9066 10.8221 19.9561 10.4922 19.9787 10.1624C20.0005 9.84154 20 9.45226 20 9H19ZM16 12V13C16.4523 13 16.8415 13.0005 17.1624 12.9787C17.4922 12.9561 17.8221 12.9066 18.1481 12.7716L17.7654 11.8478L17.3827 10.9239C17.3411 10.9411 17.2542 10.9677 17.0262 10.9833C16.7893 10.9995 16.4796 11 16 11V12ZM18.8478 10.7654L17.9239 10.3827C17.8224 10.6277 17.6277 10.8224 17.3827 10.9239L17.7654 11.8478L18.1481 12.7716C18.8831 12.4672 19.4672 11.8831 19.7716 11.148L18.8478 10.7654ZM19 3H18V17H19H20V3H19ZM17 19V18H3V19V20H17V19ZM1 17H2V3H1H0V17H1ZM3 1V2H17V1V0H3V1ZM3 19V18C2.44771 18 2 17.5523 2 17H1H0C0 18.6569 1.34315 20 3 20V19ZM19 17H18C18 17.5523 17.5523 18 17 18V19V20C18.6569 20 20 18.6569 20 17H19ZM19 3H20C20 1.34315 18.6569 0 17 0V1V2C17.5523 2 18 2.44772 18 3H19ZM1 3H2C2 2.44772 2.44772 2 3 2V1V0C1.34315 0 0 1.34315 0 3H1ZM6.5 7.5L7.08124 8.31373L10.5812 5.81373L10 5L9.41876 4.18627L5.91876 6.68627L6.5 7.5ZM10 5L9.41876 5.81373L12.9188 8.31373L13.5 7.5L14.0812 6.68627L10.5812 4.18627L10 5ZM10 5H9V11H10H11V5H10Z" fill="#33363F"/>
                                  </svg>
                                </span>
                              </button>
                            </>
                          )}
                        </div>
                        <div className='flex justify-start gap-2 text-xs mb-2 mt-2'>
                          <div className="cursor-pointer w-fit px-4 py-0.5 text-green-400 ring ring-green-400 rounded-md hover:bg-green-400 hover:text-white transition-colors">{res.unit_chapter_name}</div>
                          <div className="cursor-pointer w-fit px-4 py-0.5 text-orange-400 uppercase ring ring-orange-400 rounded-md hover:bg-orange-400 hover:text-white transition-colors">{res.resource_type}</div>
                        </div>
                        <div className="text-xs text-gray-700 mt-1">
                          <span className="font-semibold">Contributor:</span> {res.contributor_name || 'Anonymous'} ({res.contributor_email || 'N/A'})
                        </div>
                      </div>
                      <div className="flex mt-2 flex-wrap flex-col sm:flex-row gap-2">
                        <button onClick={() => approveResource(res.id)} className="cursor-pointer bg-green-500 hover:bg-green-600 transition text-white px-3 py-1 rounded-md flex items-center gap-1"><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>Approve</button>
                        <button onClick={() => handleWatermark(res)} disabled={watermarkLoading[res.id]} className={`cursor-pointer bg-blue-500 hover:bg-blue-600 transition text-white px-3 py-1 rounded-md flex items-center gap-1 ${watermarkLoading[res.id] ? 'opacity-50 cursor-not-allowed' : ''}`}>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                          {watermarkLoading[res.id] ? 'Watermarking...' : 'Watermark'}
                        </button>
                        {/* Show watermarked file(s) below the button */}
                        {watermarkedFiles[res.id] && (
                          <div className="text-green-600 text-xs mt-2">
                            {Array.isArray(watermarkedFiles[res.id]) && watermarkedFiles[res.id].length > 0
                              ? watermarkedFiles[res.id].map((name, idx) => (
                                  <div key={idx}>✅ Watermarked {name}</div>
                                ))
                              : <div>✅ Watermarked {watermarkedFiles[res.id]}</div>}
                          </div>
                        )}
                        <input
                          type="text"
                          placeholder="Rejection reason"
                          value={rejectionReasons[res.id] || ''}
                          onChange={(e) => setRejectionReasons(prev => ({ ...prev, [res.id]: e.target.value }))}
                          className="border px-2 py-1 rounded-md text-sm focus:ring-2 focus:ring-red-200 focus:border-red-400 transition"
                        />
                        <button onClick={() => rejectResource(res.id)} className="cursor-pointer bg-red-500 hover:bg-red-600 transition text-white px-3 py-1 rounded-md flex items-center gap-1"><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>Reject</button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
      {/* Add fade-in animation */}
      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.4s ease;
        }
      `}</style>
    </div>
  );
}