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
    console.log('handleSubmit called');
    if (!supabaseClient) {
      setMessage('Error: Supabase client not initialized. Please refresh the page or check your connection.');
      setMessageType('error');
      console.error('Supabase client is null in handleSubmit');
      return;
    }
    if (!title || !link || !selectedSubjectId || !resourceType) {
      setMessage("Fill all required fields");
      setMessageType('error');
      return;
    }
    if (!supabaseClient || !staffUser) {
      setMessage("Not ready to submit");
      setMessageType('error');
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
        is_approved: true
      })
      .select();
    console.log('Insert data:', data, 'Insert error:', error);
    if (error) {
      setMessage(`Submission failed: ${error.message}`);
      setMessageType('error');
      console.error('Resource submission error:', error);
    } else if (!data || data.length === 0) {
      setMessage('Submission did not return a new resource. Please check your database constraints.');
      setMessageType('error');
      console.warn('No data returned from insert:', data);
    } else {
      setMessage("✅ Resource added successfully");
      setMessageType('success');
      setTitle(''); setLink(''); setDescription('');
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
              <div className={`mb-4 p-3 rounded text-sm flex items-center gap-2 ${messageType === 'success' ? 'bg-green-100 text-green-800 border border-green-300' : 'bg-red-100 text-red-800 border border-red-300'}`}>{messageType === 'success' ? <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg> : <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>}<span>{message}</span></div>
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
                  <button type="submit" className="cursor-pointer w-full bg-blue-600 hover:bg-blue-700 transition text-white py-2 rounded-lg flex items-center justify-center gap-2"><svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7 10l5 5m0 0l5-5m-5 5V4" /></svg>Submit Resource</button>
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
                        <a href={res.link} className="text-blue-500 underline text-sm break-all" target="_blank" rel="noopener noreferrer">{res.link}</a>
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
    </div>
  );
}