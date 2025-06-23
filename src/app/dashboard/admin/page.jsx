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
  const [latestResources, setLatestResources] = useState([]);
  const [unapprovedResources, setUnapprovedResources] = useState([]);

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

  return (
    <div className="min-h-screen bg-blue-100 flex flex-col items-center justify-start p-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-8 space-y-6 tracking-[-0.025em] mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 text-center">Upload New Resource</h2>
        {message && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className={`p-3 rounded-md text-sm ${messageType === 'success' ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'}`}>{message}</motion.div>
        )}
        {!staffUser ? (
          <form onSubmit={handleLogin} className="space-y-4 mb-4">
            <div>
              <label htmlFor="loginEmail" className="block text-sm font-medium text-gray-700">Staff Email</label>
              <input type="email" id="loginEmail" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required disabled={loginLoading} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
            </div>
            <div>
              <label htmlFor="loginPassword" className="block text-sm font-medium text-gray-700">Password</label>
              <input type="password" id="loginPassword" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required disabled={loginLoading} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
            </div>
            <button type="submit" disabled={loginLoading} className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition">{loginLoading ? 'Logging in...' : 'Login as Staff'}</button>
          </form>
        ) : (
          <>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Logged in as: {staffUser.email}</span>
              <button onClick={handleLogout} className="text-xs text-blue-600 hover:underline">Logout</button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title *</label>
                <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
              </div>
              <div>
                <label htmlFor="unitChapter" className="block text-sm font-medium text-gray-700">Unit/Chapter (optional)</label>
                <input type="text" id="unitChapter" value={unitChapter} onChange={(e) => setUnitChapter(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
              </div>
              <div>
                <label htmlFor="link" className="block text-sm font-medium text-gray-700">Link *</label>
                <input type="url" id="link" value={link} onChange={(e) => setLink(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description (optional)</label>
                <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm resize-y"></textarea>
              </div>
              <div>
                <label htmlFor="resourceType" className="block text-sm font-medium text-gray-700">Type *</label>
                <select id="resourceType" value={resourceType} onChange={(e) => setResourceType(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                  {resourceCategories.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700">Subject *</label>
                <select id="subject" value={selectedSubjectId} onChange={(e) => setSelectedSubjectId(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                  {subjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>{subject.name} ({subject.code}) - {subject.syllabus_type}</option>
                  ))}
                </select>
              </div>
              <button type="submit" disabled={!supabaseClient || !isAuthReady} className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition">Submit Resource</button>
            </form>
          </>
        )}
      </div>
      {staffUser && unapprovedResources.length > 0 && (
        <div className="w-full max-w-3xl space-y-4">
          <h3 className="text-xl font-semibold text-gray-800">Unapproved Resources</h3>
          {unapprovedResources.map((res) => (
            <div key={res.id} className="bg-white shadow rounded-md p-4 space-y-2">
              <div className="text-md font-semibold text-gray-900">{res.title}</div>
              <p className="text-sm text-gray-600">{res.description}</p>
              <a href={res.link} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-500 underline">{res.link}</a>
              <div className="flex gap-3 pt-2">
                <button onClick={() => approveResource(res.id)} className="px-4 py-1 bg-green-500 text-white rounded-md hover:bg-green-600">Approve</button>
                <button onClick={() => deleteResource(res.id)} className="px-4 py-1 bg-red-500 text-white rounded-md hover:bg-red-600">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
