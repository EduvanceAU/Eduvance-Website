"use client";
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export default function AdminDashboard() {
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
  const [latestResources, setLatestResources] = useState([]);
  const [unapprovedResources, setUnapprovedResources] = useState([]);
  const [activeTab, setActiveTab] = useState('upload');
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newSubjectCode, setNewSubjectCode] = useState('');
  const [newSubjectType, setNewSubjectType] = useState('');

  const resourceCategories = [
    { value: 'note', label: 'Note' },
    { value: 'topic_question', label: 'Topic Question' },
    { value: 'marking_scheme', label: 'Marking Scheme' },
    { value: 'extra_resource', label: 'Extra Resource' },
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
        supabaseClient.from('staff_users').select('username').eq('id', session.user.id).single().then(({ data: staffData }) => {
          setStaffUsername(staffData?.username || '');
        });
        fetchLatestResources();
        fetchUnapprovedResources();
      } else {
        setStaffUsername('');
      }
    });
    supabaseClient.auth.getSession().then(({ data }) => {
      setStaffUser(data?.session?.user || null);
      setIsAuthReady(true);
      if (data?.session?.user) {
        supabaseClient.from('staff_users').select('username').eq('id', data.session.user.id).single().then(({ data: staffData }) => {
          setStaffUsername(staffData?.username || '');
        });
        fetchLatestResources();
        fetchUnapprovedResources();
      } else {
        setStaffUsername('');
      }
    });
    return () => subscription?.unsubscribe?.();
  }, [supabaseClient]);

  useEffect(() => {
    if (!supabaseClient) return;
    setLoadingSubjects(true);
    supabaseClient.from('subjects').select('id, name, code, syllabus_type').then(({ data, error }) => {
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

  const fetchLatestResources = async () => {
    if (!supabaseClient) return;
    const { data, error } = await supabaseClient.from('resources').select('*').order('created_at', { ascending: false }).limit(5);
    if (!error) setLatestResources(data);
  };

  const fetchUnapprovedResources = async () => {
    if (!supabaseClient) return;
    const { data, error } = await supabaseClient.from('resources').select('*').eq('approved', false);
    if (!error) setUnapprovedResources(data);
  };

  const approveResource = async (id) => {
    if (!supabaseClient) return;
    const { error } = await supabaseClient.from('resources').update({ approved: true }).eq('id', id);
    if (!error) {
      setUnapprovedResources((prev) => prev.filter((res) => res.id !== id));
      fetchLatestResources();
      setMessage("✅ Resource approved successfully");
      setMessageType("success");
    }
  };

  const deleteResource = async (id) => {
    if (!supabaseClient) return;
    const { error } = await supabaseClient.from('resources').delete().eq('id', id);
    if (!error) {
      setUnapprovedResources((prev) => prev.filter((res) => res.id !== id));
      fetchLatestResources();
      setMessage("❌ Resource deleted");
      setMessageType("error");
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!supabaseClient) return;
    setLoginLoading(true);
    const { data, error } = await supabaseClient.auth.signInWithPassword({ email: loginEmail, password: loginPassword });
    if (!error) {
      setStaffUser(data.user);
      setMessage('Logged in successfully!');
      setMessageType('success');
    } else {
      setMessage(`Login failed: ${error.message}`);
      setMessageType('error');
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
    if (!title || !link || !selectedSubjectId || !resourceType) {
      setMessage("Fill all required fields");
      setMessageType('error');
      return;
    }
    const unitValue = unitChapter.trim() === '' ? 'General' : unitChapter.trim();
    const { error } = await supabaseClient.from('resources').insert({
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
      setTitle('');
      setLink('');
      setDescription('');
      fetchUnapprovedResources();
      fetchLatestResources();
    }
  };

  const handleAddSubject = async (e) => {
    e.preventDefault();
    if (!newSubjectName || !newSubjectCode || !newSubjectType) {
      setMessage('All fields are required for adding a subject');
      setMessageType('error');
      return;
    }
    const { error } = await supabaseClient.from('subjects').insert({
      name: newSubjectName,
      code: newSubjectCode,
      syllabus_type: newSubjectType
    });
    if (error) {
      setMessage(`Failed to add subject: ${error.message}`);
      setMessageType('error');
    } else {
      setMessage('✅ Subject added successfully');
      setMessageType('success');
      setNewSubjectName('');
      setNewSubjectCode('');
      setNewSubjectType('');
      const { data } = await supabaseClient.from('subjects').select('*');
      setSubjects(data || []);
    }
  };

  return (  
    <div className={`pt-20 ${!staffUser ? "h-screen":"min-h-screen h-fit "} bg-blue-100 p-6 flex justify-center items-center`} style={{ fontFamily: 'Poppins, sans-serif' }}>      
      <div className="h-fit bg-white rounded-xl shadow-lg w-full max-w-3xl mx-auto p-4 sm:p-6">
        {!staffUser ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <h2 className="text-2xl font-bold mb-2 text-blue-700 flex items-center gap-2">
              <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
              Admin Login
            </h2>
            <input type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} placeholder="Staff Email" className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition" required />
            <input type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} placeholder="Password" className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition" required />
            <button type="submit" className="cursor-pointer w-full bg-blue-600 hover:bg-blue-700 transition text-white py-2 rounded-lg flex items-center justify-center gap-2">{loginLoading ? <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg> : <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>} {loginLoading ? 'Logging in...' : 'Login'}</button>
          </form>
        ) : (
          <>
            <div className="flex  border-b mb-4 sm:text-base text-xs">
              <button onClick={() => setActiveTab('upload')} className={`cursor-pointer py-2 px-4 flex items-center gap-1 rounded-t-lg ${activeTab === 'upload' ? 'border-b-2 border-blue-600 font-semibold text-blue-700 bg-blue-50' : 'text-gray-500 hover:text-blue-600'}`}><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4" /></svg>Upload Resource</button>
              <button onClick={() => setActiveTab('approve')} className={`cursor-pointer py-2 px-4 flex items-center gap-1 rounded-t-lg ${activeTab === 'approve' ? 'border-b-2 border-blue-600 font-semibold text-blue-700 bg-blue-50' : 'text-gray-500 hover:text-blue-600'}`}><svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="currentColor"><path d="M263.72-96Q234-96 213-117.15T192-168v-384q0-29.7 21.15-50.85Q234.3-624 264-624h24v-96q0-79.68 56.23-135.84 56.22-56.16 136-56.16Q560-912 616-855.84q56 56.16 56 135.84v96h24q29.7 0 50.85 21.15Q768-581.7 768-552v384q0 29.7-21.16 50.85Q725.68-96 695.96-96H263.72Zm.28-72h432v-384H264v384Zm216.21-120Q510-288 531-309.21t21-51Q552-390 530.79-411t-51-21Q450-432 429-410.79t-21 51Q408-330 429.21-309t51 21ZM360-624h240v-96q0-50-35-85t-85-35q-50 0-85 35t-35 85v96Zm-96 456v-384 384Z"/></svg>Approve Resources</button>
              <button onClick={() => setActiveTab('subjects')} className={`cursor-pointer py-2 px-4 flex items-center gap-1 rounded-t-lg ${activeTab === 'subjects' ? 'border-b-2 border-blue-600 font-semibold text-blue-700 bg-blue-50' : 'text-gray-500 hover:text-blue-600'}`}><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>Add Subject</button>
            </div>
            {message && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className={`mb-4 p-3 rounded text-sm flex items-center gap-2 ${messageType === 'success' ? 'bg-green-100 text-green-800 border border-green-300' : 'bg-red-100 text-red-800 border border-red-300'}`}>{messageType === 'success' ? <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg> : <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>}<span>{message}</span></motion.div>
            )}
            {activeTab === 'upload' && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title *" className="w-full border p-2 rounded" required />
                <input type="text" value={unitChapter} onChange={(e) => setUnitChapter(e.target.value)} placeholder="Unit/Chapter (optional)" className="w-full border p-2 rounded" />
                <input type="url" value={link} onChange={(e) => setLink(e.target.value)} placeholder="Link *" className="w-full border p-2 rounded" required />
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description (optional)" className="w-full border p-2 rounded min-h-[100px]"></textarea>
                <select value={resourceType} onChange={(e) => setResourceType(e.target.value)} className="w-full border p-2 rounded">
                  {resourceCategories.map((cat) => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
                <select value={selectedSubjectId} onChange={(e) => setSelectedSubjectId(e.target.value)} className="w-full border p-2 rounded">
                  {subjects.map((sub) => (
                    <option key={sub.id} value={sub.id}>{sub.name} ({sub.code}) - {sub.syllabus_type}</option>
                  ))}
                </select>
                <button type="submit" className="cursor-pointer w-full bg-blue-600 text-white py-2 rounded">Submit Resource</button>
              </form>
            )}
            {activeTab === 'approve' && (
              <div className="flex flex-col flex-wrap min-w-0 w-full">
                {unapprovedResources.map((res) => (
                  <div key={res.id} className="bg-gray-100 p-4 rounded mb-3 flex flex-col flex-shrink min-w-0 w-full ">
                    <p className="font-bold break-words">{res.title}</p>
                    <p className="text-sm text-gray-600 break-words">{res.description}</p>
                    <a href={res.link} className="text-blue-500 underline text-sm break-all" target="_blank" rel="noopener noreferrer">{res.link}</a>
                    <div className="flex space-x-2 mt-2 flex-wrap">
                      <button onClick={() => approveResource(res.id)} className="cursor-pointer bg-green-500 text-white px-3 py-1 rounded">Approve</button>
                      <button onClick={() => deleteResource(res.id)} className="cursor-pointer bg-red-500 text-white px-3 py-1 rounded">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {activeTab === 'subjects' && (
              <form onSubmit={handleAddSubject} className="space-y-4">
                <input type="text" value={newSubjectName} onChange={(e) => setNewSubjectName(e.target.value)} placeholder="Subject Name *" className="w-full border p-2 rounded" required />
                <input type="text" value={newSubjectCode} onChange={(e) => setNewSubjectCode(e.target.value)} placeholder="Subject Code *" className="w-full border p-2 rounded" required />
                <input type="text" value={newSubjectType} onChange={(e) => setNewSubjectType(e.target.value)} placeholder="Syllabus Type *" className="w-full border p-2 rounded" required />
                <button type="submit" className="cursor-pointer w-full bg-green-600 text-white py-2 rounded">Add Subject</button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}
