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
  // For adding units to a new subject
  const [newUnitName, setNewUnitName] = useState('');
  const [newUnitCode, setNewUnitCode] = useState('');
  const [newUnitNumber, setNewUnitNumber] = useState('');
  const [newUnits, setNewUnits] = useState([]);
  const [editResource, setEditResource] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editLoading, setEditLoading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);
  
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
    supabaseClient.from('subjects').select('id, name, code, syllabus_type, units').then(({ data, error }) => {
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
    const unitValue = unitChapter.trim() === '' ? 'General' : unitChapter.trim();
    const { data, error } = await supabaseClient.from('resources').insert({
      title,
      link,
      description,
      resource_type: resourceType,
      subject_id: selectedSubjectId,
      unit_chapter_name: unitValue,
      uploaded_by_username: staffUsername,
      approved: false
    }).select();
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
      syllabus_type: newSubjectType,
      units: newUnits
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
      setNewUnits([]);
      setNewUnitName('');
      setNewUnitCode('');
      setNewUnitNumber('');
      const { data } = await supabaseClient.from('subjects').select('*');
      setSubjects(data || []);
    }
  };

  // Add a unit to the newUnits array
  const handleAddUnit = (e) => {
    e.preventDefault();
    if (!newUnitName || !newUnitCode || !newUnitNumber) {
      setMessage('All unit fields are required');
      setMessageType('error');
      return;
    }
    setNewUnits((prev) => [
      ...prev,
      { name: newUnitName, code: newUnitCode, unit: newUnitNumber }
    ]);
    setNewUnitName('');
    setNewUnitCode('');
    setNewUnitNumber('');
    setMessage('');
    setMessageType(null);
  };

  // Remove a unit from the newUnits array
  const handleRemoveUnit = (idx) => {
    setNewUnits((prev) => prev.filter((_, i) => i !== idx));
  };

  const openEditResource = (resource) => {
    setEditResource(resource);
    setEditForm({
      title: resource.title || '',
      description: resource.description || '',
      link: resource.link || '',
      unit_chapter_name: resource.unit_chapter_name || '',
      resource_type: resource.resource_type || resource.resourceType || '',
      subject_id: resource.subject_id || '',
    });
    setShowEditModal(true);
  };

  const closeEditResource = () => {
    setEditResource(null);
    setEditForm({});
    setShowEditModal(false);
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const saveEditResource = async () => {
    if (!supabaseClient || !editResource) return;
    setEditLoading(true);
    const { error } = await supabaseClient.from('resources').update({
      title: editForm.title,
      description: editForm.description,
      link: editForm.link,
      unit_chapter_name: editForm.unit_chapter_name,
      resource_type: editForm.resource_type,
      subject_id: editForm.subject_id,
    }).eq('id', editResource.id);
    setEditLoading(false);
    if (error) {
      setMessage(`Failed to update resource: ${error.message}`);
      setMessageType('error');
    } else {
      setMessage('✅ Resource updated successfully');
      setMessageType('success');
      closeEditResource();
      fetchUnapprovedResources();
      fetchLatestResources();
    }
  };

  const deleteApprovedResource = async (id) => {
    if (!supabaseClient) return;
    const { error } = await supabaseClient.from('resources').delete().eq('id', id);
    if (!error) {
      setMessage('❌ Resource deleted');
      setMessageType('error');
      fetchLatestResources();
    }
  };

  // Fetch leaderboard data
  const fetchLeaderboard = async () => {
    if (!supabaseClient) return;
    setLoadingLeaderboard(true);
    // Get all staff users
    const { data: staffUsers, error: staffError } = await supabaseClient
      .from('staff_users')
      .select('id, username, email');
    if (staffError) {
      setMessage('Failed to fetch staff users: ' + staffError.message);
      setMessageType('error');
      setLoadingLeaderboard(false);
      return;
    }
    // Get all resources
    const { data: resources, error: resError } = await supabaseClient
      .from('resources')
      .select('uploaded_by_username, approved');
    if (resError) {
      setMessage('Failed to fetch resources: ' + resError.message);
      setMessageType('error');
      setLoadingLeaderboard(false);
      return;
    }
    // Count uploads and approvals per user
    const stats = staffUsers.map(user => {
      const uploads = resources.filter(r => r.uploaded_by_username === user.username);
      const approved = uploads.filter(r => r.approved === true).length;
      return {
        username: user.username,
        email: user.email,
        uploads: uploads.length,
        approved,
      };
    });
    // Sort by approved desc, then uploads desc
    stats.sort((a, b) => b.approved - a.approved || b.uploads - a.uploads);
    setLeaderboard(stats);
    setLoadingLeaderboard(false);
  };

  // Fetch leaderboard when tab is selected
  useEffect(() => {
    if (activeTab === 'leaderboard') fetchLeaderboard();
    // eslint-disable-next-line
  }, [activeTab, supabaseClient]);

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
            {/* <div className="flex  border-b mb-4 sm:text-base text-xs"> */}
            <div className="border-b mb-4 sm:text-base text-xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 sm:px-1 w-full">
              <button onClick={() => setActiveTab('upload')} className={`cursor-pointer py-2 px-4 flex items-center gap-1 rounded-t-lg ${activeTab === 'upload' ? 'border-b-2 border-blue-600 font-semibold text-blue-700 bg-blue-50' : 'text-gray-500 hover:text-blue-600'}`}><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4" /></svg>Upload</button>
              <button onClick={() => setActiveTab('approve')} className={`cursor-pointer py-2 px-4 flex items-center gap-1 rounded-t-lg ${activeTab === 'approve' ? 'border-b-2 border-blue-600 font-semibold text-blue-700 bg-blue-50' : 'text-gray-500 hover:text-blue-600'}`}><svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="currentColor"><path d="M263.72-96Q234-96 213-117.15T192-168v-384q0-29.7 21.15-50.85Q234.3-624 264-624h24v-96q0-79.68 56.23-135.84 56.22-56.16 136-56.16Q560-912 616-855.84q56 56.16 56 135.84v96h24q29.7 0 50.85 21.15Q768-581.7 768-552v384q0 29.7-21.16 50.85Q725.68-96 695.96-96H263.72Zm.28-72h432v-384H264v384Zm216.21-120Q510-288 531-309.21t21-51Q552-390 530.79-411t-51-21Q450-432 429-410.79t-21 51Q408-330 429.21-309t51 21ZM360-624h240v-96q0-50-35-85t-85-35q-50 0-85 35t-35 85v96Zm-96 456v-384 384Z"/></svg>Approve</button>
              <button onClick={() => setActiveTab('subjects')} className={`cursor-pointer py-2 px-4 flex items-center gap-1 rounded-t-lg ${activeTab === 'subjects' ? 'border-b-2 border-blue-600 font-semibold text-blue-700 bg-blue-50' : 'text-gray-500 hover:text-blue-600'}`}><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>Add Subject</button>
              <button onClick={() => setActiveTab('leaderboard')} className={`cursor-pointer py-2 px-4 flex items-center gap-1 rounded-t-lg ${activeTab === 'leaderboard' ? 'border-b-2 border-blue-600 font-semibold text-blue-700 bg-blue-50' : 'text-gray-500 hover:text-blue-600'}`}><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 17v-2a4 4 0 014-4h10a4 4 0 014 4v2" /><circle cx="12" cy="7" r="4" /></svg>Leaderboard</button>
            </div>
            {message && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className={`mb-4 p-3 rounded text-sm flex items-center gap-2 ${messageType === 'success' ? 'bg-green-100 text-green-800 border border-green-300' : 'bg-red-100 text-red-800 border border-red-300'}`}>{messageType === 'success' ? <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg> : <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>}<span>{message}</span></motion.div>
            )}
            {activeTab === 'upload' && (
              <>
                <form onSubmit={handleSubmit} className="space-y-4 bg-blue-50 p-4 rounded-2xl border border-blue-100">
                  <div className="space-y-2">
                    <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title *" className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition" required />
                    {/* Unit/Chapter dropdown or input */}
                    {(() => {
                      const selectedSubject = subjects.find(sub => sub.id === selectedSubjectId);
                      const units = selectedSubject?.units || [];
                      if (Array.isArray(units) && units.length > 0) {
                        return (
                          <select value={unitChapter} onChange={e => setUnitChapter(e.target.value)} className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition">
                            <option value="">Select Unit/Chapter (optional)</option>
                            {units.map((unit, idx) => (
                              <option key={unit.code || unit.name || idx} value={unit.unit || unit.name}>{unit.unit ? `${unit.unit} - ${unit.name}` : unit.name}</option>
                            ))}
                            <option value="General">General</option>
                          </select>
                        );
                      } else {
                        return (
                          <input type="text" value={unitChapter} onChange={(e) => setUnitChapter(e.target.value)} placeholder="Unit/Chapter (optional)" className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition" />
                        );
                      }
                    })()}
                    <input type="url" value={link} onChange={(e) => setLink(e.target.value)} placeholder="Link *" className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition" required />
                    <span className="text-xs text-gray-500">Paste a valid URL (Google Drive, Dropbox, etc.)</span>
                    <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description (optional)" className="min-h-[100px] w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition"></textarea>
                  </div>
                  <div className="flex flex-col md:flex-row gap-2">
                    <select value={resourceType} onChange={(e) => setResourceType(e.target.value)} className="cursor-pointer w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition">
                      {resourceCategories.map((cat) => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                      ))}
                    </select>
                    <select value={selectedSubjectId} onChange={(e) => setSelectedSubjectId(e.target.value)} className="cursor-pointer w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition">
                      {subjects.map((sub) => (
                        <option key={sub.id} value={sub.id}>{sub.name} ({sub.code}) - {sub.syllabus_type}</option>
                      ))}
                    </select>
                  </div>
                  <button type="submit" className="cursor-pointer w-full bg-blue-600 hover:bg-blue-700 transition text-white py-2 rounded-lg flex items-center justify-center gap-2"><svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7 10l5 5m0 0l5-5m-5 5V4" /></svg>Submit Resource</button>
                </form>
              </>
            )}
            {activeTab === 'approve' && (
              <>
                <div className="divide-y divide-blue-100">
                  {unapprovedResources.length === 0 && <div className="text-gray-500 text-sm py-4">No unapproved resources 🎉</div>}
                  {unapprovedResources.map((res) => {
                    const subject = subjects.find(sub => sub.id === res.subject_id);
                    return (
                      <div key={res.id} className="bg-gray-50 p-4 rounded-lg mb-3 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                        <div className="w-full">
                          <p className="font-bold text-blue-800 text-lg mb-1">{res.title}</p>
                          <p className="text-sm text-gray-600 mb-1">{res.description}</p>
                          <a href={res.link} className="text-blue-500 underline text-sm break-all" target="_blank" rel="noopener noreferrer">{res.link}</a>
                          <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-gray-700">
                            <div><span className="font-semibold">Added by:</span> {res.uploaded_by_username || 'Unknown'}</div>
                            <div><span className="font-semibold">Subject:</span> {subject ? `${subject.name} (${subject.code}) - ${subject.syllabus_type}` : 'Unknown'}</div>
                            <div><span className="font-semibold">Suggested on:</span> {res.created_at ? new Date(res.created_at).toLocaleString() : 'Unknown'}</div>
                            <div><span className="font-semibold">Reviewed by:</span> <span className="italic text-gray-400">Not reviewed yet</span></div>
                            <div><span className="font-semibold">Reviewed at:</span> <span className="italic text-gray-400">Not reviewed yet</span></div>
                          </div>
                        </div>
                        <div className="flex space-x-2 mt-2 md:mt-0">
                          <button onClick={() => approveResource(res.id)} className="cursor-pointer bg-green-500 hover:bg-green-600 transition text-white px-3 py-1 rounded-md flex items-center gap-1"><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>Approve</button>
                          <Dialog>
                            <DialogTrigger asChild>
                              <button onClick={() => openEditResource(res)} className="cursor-pointer bg-yellow-400 hover:bg-yellow-500 transition text-white px-3 py-1 rounded-md flex items-center gap-1"><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 11l6 6M3 17v4h4l12-12a2 2 0 00-2.828-2.828L3 17z" /></svg>Edit</button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md pl-8 pr-8 pt-6 pb-4 max-h-[95vh]">
                              <DialogHeader>
                                <DialogTitle className="text-2xl font-bold text-[#0C58E4]" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                  Edit Resource
                                </DialogTitle>
                              </DialogHeader>
                                <div className="space-y-3">
                                  <input name="title" value={editForm.title} onChange={handleEditFormChange} placeholder="Title" className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition" />
                                  {/* Unit/Chapter dropdown or input for edit modal */}
                                  {(() => {
                                    const selectedSubject = subjects.find(sub => sub.id === editForm.subject_id);
                                    const units = selectedSubject?.units || [];
                                    if (Array.isArray(units) && units.length > 0) {
                                      return (
                                        <select name="unit_chapter_name" value={editForm.unit_chapter_name} onChange={handleEditFormChange} className="cursor-pointer w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition">
                                          <option value="">Select Unit/Chapter (optional)</option>
                                          {units.map((unit, idx) => (
                                            <option key={unit.code || unit.name || idx} value={unit.unit || unit.name}>{unit.unit ? `${unit.unit} - ${unit.name}` : unit.name}</option>
                                          ))}
                                          <option value="General">General</option>
                                        </select>
                                      );
                                    } else {
                                      return (
                                        <input name="unit_chapter_name" value={editForm.unit_chapter_name} onChange={handleEditFormChange} placeholder="Unit/Chapter (optional)" className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition" />
                                      );
                                    }
                                  })()}
                                  <input name="link" value={editForm.link} onChange={handleEditFormChange} placeholder="Link" className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition" />
                                  <textarea name="description" value={editForm.description} onChange={handleEditFormChange} placeholder="Description (optional)" className="min-h-[100px] w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition"></textarea>
                                  <select name="resource_type" value={editForm.resource_type} onChange={handleEditFormChange} className="cursor-pointer w-full p-2 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition">
                                    {resourceCategories.map((cat) => (
                                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                                    ))}
                                  </select>
                                  <select name="subject_id" value={editForm.subject_id} onChange={handleEditFormChange} className="cursor-pointer w-full p-2 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition">
                                    {subjects.map((sub) => (
                                      <option key={sub.id} value={sub.id}>{sub.name} ({sub.code}) - {sub.syllabus_type}</option>
                                    ))}
                                  </select>
                                  <button onClick={saveEditResource} disabled={editLoading} className="cursor-pointer w-full bg-blue-600 hover:bg-blue-700 transition text-white py-2 rounded-lg flex items-center justify-center gap-2 mt-2">{editLoading ? 'Saving...' : 'Save Changes'}</button> 
                                </div>
                            </DialogContent>
                          </Dialog> 
                          <button onClick={() => deleteResource(res.id)} className="cursor-pointer bg-red-500 hover:bg-red-600 transition text-white px-3 py-1 rounded-md flex items-center gap-1"><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>Delete</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
            {activeTab === 'subjects' && (
              <>
                <form onSubmit={handleAddSubject} className="space-y-4 bg-blue-50 p-4 rounded-2xl border border-blue-100">
                  <input type="text" value={newSubjectName} onChange={(e) => setNewSubjectName(e.target.value)} placeholder="Subject Name *" className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition" required />
                  <input type="text" value={newSubjectCode} onChange={(e) => setNewSubjectCode(e.target.value)} placeholder="Subject Code *" className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition" required />
                  <input type="text" value={newSubjectType} onChange={(e) => setNewSubjectType(e.target.value)} placeholder="Syllabus Type *" className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition" required />
                  <span className="text-xs text-gray-500">e.g. IAL, IGCSE, etc.</span>
                  {/* Add Units Section */}
                  <div className="bg-white border border-blue-200 rounded-lg p-2 mt-2">
                    <h4 className="font-semibold text-blue-700 mb-2 text-base">Add Units for subject</h4>
                    <div className="flex flex-row gap-3 mb-2 items-center">
                      <input type="text" value={newUnitNumber} onChange={e => setNewUnitNumber(e.target.value)} placeholder="Unit No (Unit 1)" className="text-sm text-gray-500 border p-2 rounded w-1/5" />
                      <input type="text" value={newUnitName} onChange={e => setNewUnitName(e.target.value)} placeholder="Unit Name" className="text-sm text-gray-500 border p-2 rounded w-2/5" />
                      <input type="text" value={newUnitCode} onChange={e => setNewUnitCode(e.target.value)} placeholder="Code (WPH11)" className="text-sm text-gray-500 border p-2 rounded w-1/5" />
                      <button type="button" onClick={handleAddUnit} className="cursor-pointer bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm whitespace-nowrap">Add</button>
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
                  <button type="submit" className="cursor-pointer w-full bg-green-600 hover:bg-green-700 transition text-white py-2 rounded-lg flex items-center justify-center gap-2"><svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>Add Subject</button>
                </form>
              </>
            )}
            {activeTab === 'leaderboard' && (
              <>
                {loadingLeaderboard ? (
                  <div className="text-gray-500 text-sm py-4">Loading leaderboard...</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-blue-200 rounded-lg">
                      <thead>
                        <tr className="bg-blue-50">
                          <th className="px-4 py-2 text-left text-blue-700 font-semibold">#</th>
                          <th className="px-4 py-2 text-left text-blue-700 font-semibold">Username</th>
                          <th className="px-4 py-2 text-left text-blue-700 font-semibold">Email</th>
                          <th className="px-4 py-2 text-left text-blue-700 font-semibold">Resources Uploaded</th>
                          <th className="px-4 py-2 text-left text-blue-700 font-semibold">Resources Approved</th>
                        </tr>
                      </thead>
                      <tbody>
                        {leaderboard.map((user, idx) => (
                          <tr key={user.username} className={idx === 0 ? 'bg-yellow-100 font-bold' : ''}>
                            <td className="px-4 py-2">{idx + 1}</td>
                            <td className="px-4 py-2">{user.username}</td>
                            <td className="px-4 py-2">{user.email}</td>
                            <td className="px-4 py-2">{user.uploads}</td>
                            <td className="px-4 py-2">{user.approved}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
            {/* Unit/Chapter dropdown or input for edit modal */}
            {showEditModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center transparent bg-opacity-30">
                <div className="bg-white rounded-2xl shadow-2xl backdrop-blur-2xl p-6 w-full max-w-lg relative">
                  <button onClick={closeEditResource} className="cursor-pointer absolute top-2 right-2 text-gray-400 hover:text-red-500 text-xl">&times;</button>
                  <h3 className="text-lg font-semibold mb-4 text-blue-700">Edit Resource</h3>
                  <div className="space-y-3">
                    <input name="title" value={editForm.title} onChange={handleEditFormChange} placeholder="Title" className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition" />
                    {/* Unit/Chapter dropdown or input for edit modal */}
                    {(() => {
                      const selectedSubject = subjects.find(sub => sub.id === editForm.subject_id);
                      const units = selectedSubject?.units || [];
                      if (Array.isArray(units) && units.length > 0) {
                        return (
                          <select name="unit_chapter_name" value={editForm.unit_chapter_name} onChange={handleEditFormChange} className="cursor-pointer w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition">
                            <option value="">Select Unit/Chapter (optional)</option>
                            {units.map((unit, idx) => (
                              <option key={unit.code || unit.name || idx} value={unit.unit || unit.name}>{unit.unit ? `${unit.unit} - ${unit.name}` : unit.name}</option>
                            ))}
                            <option value="General">General</option>
                          </select>
                        );
                      } else {
                        return (
                          <input name="unit_chapter_name" value={editForm.unit_chapter_name} onChange={handleEditFormChange} placeholder="Unit/Chapter (optional)" className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition" />
                        );
                      }
                    })()}
                    <input name="link" value={editForm.link} onChange={handleEditFormChange} placeholder="Link" className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition" />
                    <textarea name="description" value={editForm.description} onChange={handleEditFormChange} placeholder="Description (optional)" className="min-h-[100px] w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition"></textarea>
                    <select name="resource_type" value={editForm.resource_type} onChange={handleEditFormChange} className="cursor-pointer w-full p-2 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition">
                      {resourceCategories.map((cat) => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                      ))}
                    </select>
                    <select name="subject_id" value={editForm.subject_id} onChange={handleEditFormChange} className="cursor-pointer w-full p-2 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition">
                      {subjects.map((sub) => (
                        <option key={sub.id} value={sub.id}>{sub.name} ({sub.code}) - {sub.syllabus_type}</option>
                      ))}
                    </select>
                    <button onClick={saveEditResource} disabled={editLoading} className="cursor-pointer w-full bg-blue-600 hover:bg-blue-700 transition text-white py-2 rounded-lg flex items-center justify-center gap-2 mt-2">{editLoading ? 'Saving...' : 'Save Changes'}</button> 
                  </div>
                </div>
              </div>
            )}
            {latestResources.length > 0 && (
              <div className="mt-8">
                <h2 className="text-xl font-semibold text-blue-700 mb-2 flex items-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="currentColor"><path d="M263.72-96Q234-96 213-117.15T192-168v-384q0-29.7 21.15-50.85Q234.3-624 264-624h24v-96q0-79.68 56.23-135.84 56.22-56.16 136-56.16Q560-912 616-855.84q56 56.16 56 135.84v96h24q29.7 0 50.85 21.15Q768-581.7 768-552v384q0 29.7-21.16 50.85Q725.68-96 695.96-96H263.72Zm.28-72h432v-384H264v384Zm216.21-120Q510-288 531-309.21t21-51Q552-390 530.79-411t-51-21Q450-432 429-410.79t-21 51Q408-330 429.21-309t51 21ZM360-624h240v-96q0-50-35-85t-85-35q-50 0-85 35t-35 85v96Zm-96 456v-384 384Z"/></svg>Latest Approved Resources</h2>
                <div className="divide-y divide-blue-100">
                  {latestResources.map((res) => {
                    const subject = subjects.find(sub => sub.id === res.subject_id);
                    return (
                      <div key={res.id} className="bg-gray-50 p-4 rounded-lg mb-3 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                        <div className="w-full">
                          <p className="font-bold text-blue-800 text-lg mb-1">{res.title}</p>
                          <p className="text-sm text-gray-600 mb-1">{res.description}</p>
                          <a href={res.link} className="text-blue-500 underline text-sm break-all" target="_blank" rel="noopener noreferrer">{res.link}</a>
                          <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-gray-700">
                            <div><span className="font-semibold">Added by:</span> {res.uploaded_by_username || 'Unknown'}</div>
                            <div><span className="font-semibold">Subject:</span> {subject ? `${subject.name} (${subject.code}) - ${subject.syllabus_type}` : 'Unknown'}</div>
                            <div><span className="font-semibold">Suggested on:</span> {res.created_at ? new Date(res.created_at).toLocaleString() : 'Unknown'}</div>
                            <div><span className="font-semibold">Reviewed by:</span> <span className="italic text-gray-400">Not tracked</span></div>
                            <div><span className="font-semibold">Reviewed at:</span> <span className="italic text-gray-400">Not tracked</span></div>
                          </div>
                        </div>
                        <div className="flex space-x-2 mt-2 md:mt-0">
                          <button onClick={() => openEditResource(res)} className="cursor-pointer bg-yellow-400 hover:bg-yellow-500 transition text-white px-3 py-1 rounded-md flex items-center gap-1"><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 11l6 6M3 17v4h4l12-12a2 2 0 00-2.828-2.828L3 17z" /></svg>Edit</button>
                          <button onClick={() => deleteApprovedResource(res.id)} className="cursor-pointer bg-red-500 hover:bg-red-600 transition text-white px-3 py-1 rounded-md flex items-center gap-1"><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>Delete</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}