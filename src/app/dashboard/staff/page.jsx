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
        is_approved: true
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
      .eq('is_approved', false);
    if (!error) setPendingResources(data);
  };

  const approveResource = async (id) => {
    if (!supabaseClient) return;
    const { data, error } = await supabaseClient
      .from('community_resource_requests')
      .update({ is_approved: true })
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
        is_approved: true
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
      <div className="bg-white rounded-xl shadow-lg max-w-xl mx-auto p-6 mt-20">
        {!staffUser ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} placeholder="Staff Email" className="w-full border p-2 rounded" required />
            <input type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} placeholder="Password" className="w-full border p-2 rounded" required />
            <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded">{loginLoading ? 'Logging in...' : 'Login'}</button>
          </form>
        ) : (
          <>
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm text-gray-600">Logged in as {staffUser.email}</p>
              <button onClick={handleLogout} className="text-sm text-blue-600 hover:underline">Logout</button>
            </div>
            <div className="flex space-x-4 border-b mb-4">
              <button onClick={() => setActiveTab('upload')} className={`py-2 px-4 ${activeTab === 'upload' ? 'border-b-2 border-blue-600 font-semibold' : 'text-gray-500'}`}>Upload Resource</button>
              <button onClick={() => setActiveTab('approve')} className={`py-2 px-4 ${activeTab === 'approve' ? 'border-b-2 border-blue-600 font-semibold' : 'text-gray-500'}`}>Approve Submissions</button>
            </div>
            {message && (
              <div className={`mb-4 p-3 rounded text-sm ${messageType === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{message}</div>
            )}
            {activeTab === 'upload' && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className="w-full border p-2 rounded" required />
                <input type="text" value={unitChapter} onChange={(e) => setUnitChapter(e.target.value)} placeholder="Unit/Chapter Name (Optional)" className="w-full border p-2 rounded" />
                <input type="url" value={link} onChange={(e) => setLink(e.target.value)} placeholder="Resource Link (URL)" className="w-full border p-2 rounded" required />
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description (Optional)" className="w-full border p-2 rounded" rows="3"></textarea>
                <select value={resourceType} onChange={(e) => setResourceType(e.target.value)} className="w-full border p-2 rounded" required>
                  {resourceCategories.map((cat) => <option key={cat.value} value={cat.value}>{cat.label}</option>)}
                </select>
                <select value={selectedSubjectId} onChange={(e) => setSelectedSubjectId(e.target.value)} className="w-full border p-2 rounded" required>
                  {subjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>{subject.name} ({subject.code}) - {subject.syllabus_type}</option>
                  ))}
                </select>
                <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded">Submit Resource</button>
              </form>
            )}
            {activeTab === 'approve' && (
              <div>
                {pendingResources.map((res) => (
                  <div key={res.id} className="bg-gray-100 p-4 rounded mb-3">
                    <p className="font-bold">{res.title}</p>
                    <p className="text-sm text-gray-600">{res.description}</p>
                    <a href={res.link} className="text-blue-500 underline text-sm" target="_blank" rel="noopener noreferrer">{res.link}</a>
                    <div className="flex space-x-2 mt-2">
                      <button onClick={() => approveResource(res.id)} className="bg-green-500 text-white px-3 py-1 rounded">Approve</button>
                      <input
                        type="text"
                        placeholder="Rejection reason"
                        value={rejectionReasons[res.id] || ''}
                        onChange={(e) => setRejectionReasons(prev => ({ ...prev, [res.id]: e.target.value }))}
                        className="border px-2 py-1 rounded text-sm"
                      />
                      <button onClick={() => rejectResource(res.id)} className="bg-red-500 text-white px-3 py-1 rounded">Reject</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}