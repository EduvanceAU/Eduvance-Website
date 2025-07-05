"use client";
import React, { useState, useEffect } from 'react';

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
      .select('id, name, code, syllabus_type')
      .then(({ data, error }) => {
        if (error) {
          setMessage(`Subjects fetch failed: ${error.message}`);
          setMessageType('error');
        } else {
          setSubjects(data || []);
          if (data?.[0]?.id) setSelectedSubjectId(data[0].id);
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
    console.log('Submit button clicked');
    if (!title || !link || !selectedSubjectId || !resourceType) {
      setMessage("Fill all required fields");
      setMessageType('error');
      return;
    }
    if (!supabaseClient) {
      setMessage("Supabase client not initialized. Please wait and try again.");
      setMessageType('error');
      console.error('Supabase client not initialized');
      return;
    }
    if (!staffUser) {
      setMessage("Not ready to submit");
      setMessageType('error');
      return;
    }
    const unitValue = unitChapter.trim() === '' ? 'General' : unitChapter.trim();
    const { error } = await supabaseClient
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
      });
    if (error) {
      setMessage(`Submission failed: ${error.message}`);
      setMessageType('error');
    } else {
      setMessage("✅ Resource added successfully");
      setMessageType('success');
      setTitle(''); setLink(''); setDescription('');
    }
  };

  const fetchPendingResources = async () => {
    if (!supabaseClient) return;
    const { data, error } = await supabaseClient
      .from('community_resource_requests')
      .select('*')
      .eq('approved', false);
    if (!error) setPendingResources(data);
  };

  const approveResource = async (id) => {
    if (!supabaseClient) return;
    const { data, error } = await supabaseClient
      .from('community_resource_requests')
      .update({ approved: true })
      .eq('id', id)
      .select()
      .single();
    if (!error && data) {
      await supabaseClient.from('resources').insert({
        title: data.title,
        link: data.link,
        description: data.description,
        resource_type: data.resource_type,
        subject_id: data.subject_id,
        unit_chapter_name: data.unit_chapter_name,
        uploaded_by_username: data.uploaded_by_username,
        approved: true
      });
      fetchPendingResources();
    }
  };

  const rejectResource = async (id) => {
    if (!supabaseClient || !rejectionReasons[id]) return;
  
    const { error } = await supabaseClient
      .from('community_resource_requests')
      .update({ rejection_reason: rejectionReasons[id] })
      .eq('id', id);
  
    if (!error) {
      // 🧹 Remove from view if rejection was successful
      setPendingResources((prev) => prev.filter((res) => res.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-blue-100 p-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
      <div className="bg-white rounded-2xl shadow-lg max-w-3xl mx-auto p-6">
        {!staffUser ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <h2 className="text-2xl font-bold mb-2 text-blue-700 flex items-center gap-2">
              <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
              Staff Login
            </h2>
            <input type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} placeholder="Staff Email" className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition" required />
            <input type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} placeholder="Password" className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition" required />
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 transition text-white py-2 rounded-lg flex items-center justify-center gap-2">{loginLoading ? <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg> : <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>} {loginLoading ? 'Logging in...' : 'Login'}</button>
          </form>
        ) : (
          <>
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm text-gray-600">Logged in as <span className="font-semibold text-blue-700">{staffUser.email}</span></p>
              <button onClick={handleLogout} className="text-sm text-blue-600 hover:underline flex items-center gap-1 rounded-md px-2 py-1 transition-colors hover:bg-blue-50"><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7" /></svg>Logout</button>
            </div>
            <div className="flex space-x-4 border-b mb-4">
              <button onClick={() => setActiveTab('upload')} className={`py-2 px-4 flex items-center gap-1 rounded-t-lg ${activeTab === 'upload' ? 'border-b-2 border-blue-600 font-semibold text-blue-700 bg-blue-50' : 'text-gray-500 hover:text-blue-600'}`}><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4" /></svg>Upload Resource</button>
              <button onClick={() => setActiveTab('approve')} className={`py-2 px-4 flex items-center gap-1 rounded-t-lg ${activeTab === 'approve' ? 'border-b-2 border-blue-600 font-semibold text-blue-700 bg-blue-50' : 'text-gray-500 hover:text-blue-600'}`}><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-6a2 2 0 012-2h2a2 2 0 012 2v6m-6 0h6" /></svg>Approve Submissions</button>
            </div>
            {message && (
              <div className={`mb-4 p-3 rounded text-sm flex items-center gap-2 ${messageType === 'success' ? 'bg-green-100 text-green-800 border border-green-300' : 'bg-red-100 text-red-800 border border-red-300'}`}>{messageType === 'success' ? <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg> : <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>}<span>{message}</span></div>
            )}
            {activeTab === 'upload' && (
              <>
                <h2 className="text-xl font-semibold text-blue-700 mb-2 flex items-center gap-2"><svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4" /></svg>Upload Resource</h2>
                <form onSubmit={handleSubmit} className="space-y-4 bg-blue-50 p-4 rounded-2xl border border-blue-100">
                  <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition" required />
                  <input type="text" value={unitChapter} onChange={(e) => setUnitChapter(e.target.value)} placeholder="Unit/Chapter Name (Optional)" className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition" />
                  <input type="url" value={link} onChange={(e) => setLink(e.target.value)} placeholder="Resource Link (URL)" className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition" required />
                  <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description (Optional)" className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition" rows="3"></textarea>
                  <select value={resourceType} onChange={(e) => setResourceType(e.target.value)} className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition" required>
                    {resourceCategories.map((cat) => <option key={cat.value} value={cat.value}>{cat.label}</option>)}
                  </select>
                  <select value={selectedSubjectId} onChange={(e) => setSelectedSubjectId(e.target.value)} className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition" required>
                    {subjects.map((subject) => (
                      <option key={subject.id} value={subject.id}>{subject.name} ({subject.code}) - {subject.syllabus_type}</option>
                    ))}
                  </select>
                  <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 transition text-white py-2 rounded-lg flex items-center justify-center gap-2" disabled={!supabaseClient}><svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7 10l5 5m0 0l5-5m-5 5V4" /></svg>Submit Resource</button>
                </form>
              </>
            )}
            {activeTab === 'approve' && (
              <>
                <h2 className="text-xl font-semibold text-blue-700 mb-2 flex items-center gap-2"><svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-6a2 2 0 012-2h2a2 2 0 012 2v6m-6 0h6" /></svg>Approve Submissions</h2>
                <div className="divide-y divide-blue-100">
                  {pendingResources.length === 0 && <div className="text-gray-500 text-sm py-4">No pending submissions 🎉</div>}
                  {pendingResources.map((res) => (
                    <div key={res.id} className="bg-gray-50 p-4 rounded-lg mb-3 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                      <div>
                        <p className="font-bold text-blue-800">{res.title}</p>
                        <p className="text-sm text-gray-600 mb-1">{res.description}</p>
                        <a href={res.link} className="text-blue-500 underline text-sm break-all" target="_blank" rel="noopener noreferrer">{res.link}</a>
                      </div>
                      <div className="flex flex-col md:flex-row gap-2 mt-2 md:mt-0 items-center">
                        <button onClick={() => approveResource(res.id)} className="bg-green-500 hover:bg-green-600 transition text-white px-3 py-1 rounded-md flex items-center gap-1"><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>Approve</button>
                        <input
                          type="text"
                          placeholder="Rejection reason"
                          value={rejectionReasons[res.id] || ''}
                          onChange={(e) => setRejectionReasons(prev => ({ ...prev, [res.id]: e.target.value }))}
                          className="border px-2 py-1 rounded-md text-sm focus:ring-2 focus:ring-red-200 focus:border-red-400 transition"
                        />
                        <button onClick={() => rejectResource(res.id)} className="bg-red-500 hover:bg-red-600 transition text-white px-3 py-1 rounded-md flex items-center gap-1"><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>Reject</button>
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
