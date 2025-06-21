"use client";
import React, { useState, useEffect } from 'react';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export default function UploadResource() {
  const [supabaseClient, setSupabaseClient] = useState(null);
  const [staffUser, setStaffUser] = useState(null); // Store staff user session
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(null);

  // Login form state
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
    // eslint-disable-next-line
  }, []); // Only run once on mount

  // Listen for auth state changes
  useEffect(() => {
    if (!supabaseClient) return;
    setIsAuthReady(false);
    const { data: subscription } = supabaseClient.auth.onAuthStateChange((_e, session) => {
      setStaffUser(session?.user || null);
      setIsAuthReady(true);
      // Fetch username if user is logged in
      if (session?.user) {
        supabaseClient
          .from('staff_users')
          .select('username')
          .eq('id', session.user.id)
          .single()
          .then(({ data: staffData, error: staffError }) => {
            if (!staffError && staffData) {
              setStaffUsername(staffData.username);
            } else {
              setStaffUsername('');
            }
          });
      } else {
        setStaffUsername('');
      }
    });
    // Check initial session
    supabaseClient.auth.getSession().then(({ data }) => {
      setStaffUser(data?.session?.user || null);
      setIsAuthReady(true);
      if (data?.session?.user) {
        supabaseClient
          .from('staff_users')
          .select('username')
          .eq('id', data.session.user.id)
          .single()
          .then(({ data: staffData, error: staffError }) => {
            if (!staffError && staffData) {
              setStaffUsername(staffData.username);
            } else {
              setStaffUsername('');
            }
          });
      } else {
        setStaffUsername('');
      }
    });
    return () => subscription?.unsubscribe?.();
  }, [supabaseClient]);

  // Fetch subjects
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

  // Staff login handler
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
      // Fetch username from staff_users
      supabaseClient
        .from('staff_users')
        .select('username')
        .eq('id', data.user.id)
        .single()
        .then(({ data: staffData, error: staffError }) => {
          if (!staffError && staffData) {
            setStaffUsername(staffData.username);
          } else {
            setStaffUsername('');
          }
        });
    }
    setLoginLoading(false);
  };

  // Staff logout handler
  const handleLogout = async () => {
    if (!supabaseClient) return;
    await supabaseClient.auth.signOut();
    setStaffUser(null);
    setMessage('Logged out.');
    setMessageType('success');
  };

  // Resource upload handler
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

  return (
    <div className="min-h-screen bg-blue-100 flex items-center justify-center p-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-8 space-y-6 tracking-[-0.025em]">
        <h2 className="text-2xl font-semibold text-gray-800 text-center">Upload New Resource</h2>

        {message && (
          <div className={`p-3 rounded-md text-sm ${
            messageType === 'success' ? 'bg-green-50 border border-green-200 text-green-800' :
            'bg-red-50 border border-red-200 text-red-800'
          }`}>
            {message}
          </div>
        )}

        {/* Staff login form if not logged in */}
        {!staffUser && (
          <form onSubmit={handleLogin} className="space-y-4 mb-4">
            <div>
              <label htmlFor="loginEmail" className="block text-sm font-medium text-gray-700">Staff Email</label>
              <input
                type="email"
                id="loginEmail"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                required
                disabled={loginLoading}
              />
            </div>
            <div>
              <label htmlFor="loginPassword" className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                id="loginPassword"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                required
                disabled={loginLoading}
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition"
              disabled={loginLoading}
            >
              {loginLoading ? 'Logging in...' : 'Login as Staff'}
            </button>
          </form>
        )}

        {/* Show upload form if staff is logged in */}
        {staffUser && (
          <>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Logged in as: {staffUser.email}</span>
              <button onClick={handleLogout} className="text-xs text-blue-600 hover:underline">Logout</button>
            </div>
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
                  disabled={!supabaseClient || !isAuthReady}
                />
              </div>
              <div>
                <label htmlFor="unitChapter" className="block text-sm font-medium text-gray-700">
                  Unit/Chapter Name (Optional)
                </label>
                <input
                  type="text"
                  id="unitChapter"
                  value={unitChapter}
                  onChange={(e) => setUnitChapter(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="e.g., Unit 1: Kinematics"
                  disabled={!supabaseClient || !isAuthReady}
                />
                <p className="text-xs text-gray-500 mt-1">Leave blank if it applies to the whole subject (will be marked as "General")</p>
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
                  disabled={!supabaseClient || !isAuthReady}
                />
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description (Optional)</label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows="3"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm resize-y"
                  placeholder="A brief summary of the resource content."
                  disabled={!supabaseClient || !isAuthReady}
                ></textarea>
              </div>
              <div>
                <label htmlFor="resourceType" className="block text-sm font-medium text-gray-700">Resource Type *</label>
                <select
                  id="resourceType"
                  value={resourceType}
                  onChange={(e) => setResourceType(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  required
                  disabled={!supabaseClient || !isAuthReady}
                >
                  {resourceCategories.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700">Subject *</label>
                <select
                  id="subject"
                  value={selectedSubjectId}
                  onChange={(e) => setSelectedSubjectId(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  required
                  disabled={loadingSubjects || subjects.length === 0 || !supabaseClient || !isAuthReady}
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
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition"
                disabled={!supabaseClient || !isAuthReady}
              >
                Submit Resource
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
