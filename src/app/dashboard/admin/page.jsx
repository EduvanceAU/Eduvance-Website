"use client";
import React, { useState, useEffect } from 'react';
// Removed 'motion' import as we're replacing the custom message display
// import { motion } from 'framer-motion'; 

import { supabase } from '@/lib/supabaseClient';

// Import the usePopup hook from your utility file
import { usePopup } from '@/components/ui/PopupNotification';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export default function AdminDashboard() {
  const showPopup = usePopup(); // Initialize the showPopup function

  const [supabaseClient, setSupabaseClient] = useState(null);
  const [staffUser, setStaffUser] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(true);
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
  const [newSubjectType, setNewSubjectType] = useState(''); // Corrected initialization
  // For adding units to a new subject
  const [newUnitName, setNewUnitName] = useState('');
  const [newUnitCode, setNewUnitCode] = useState('');
  const [newUnitNumber, setNewUnitNumber] = useState('');
  const [newUnits, setNewUnits] = useState([]);
  const [editResource, setEditResource] = useState(null);
  const [editForm, setEditForm] = useState({}); // Corrected initialization
  const [editLoading, setEditLoading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);

  // Moderation View State
  const [modType, setModType] = useState('resource'); // 'resource' or 'community'
  const [modSubject, setModSubject] = useState('');
  const [modQualification, setModQualification] = useState('');
  const [modResults, setModResults] = useState([]);
  const [modLoading, setModLoading] = useState(false);
  // Moderation edit modal state
  const [modEditItem, setModEditItem] = useState(null);
  const [modEditForm, setModEditForm] = useState({});
  const [modEditLoading, setModEditLoading] = useState(false);

  // NEW: State variables for Past Papers
  const [selectedExamSessionId, setSelectedExamSessionId] = useState(''); // Stores the UUID of the selected session
  const [unitCode, setUnitCode] = useState(''); // e.g., 'WAC11' from dropdown or text input
  const [questionPaperLink, setQuestionPaperLink] = useState('');
  const [markSchemeLink, setMarkSchemeLink] = useState('');
  const [examinerReportLink, setExaminerReportLink] = useState('');
  const [examSessions, setExamSessions] = useState([]); // To store fetched exam sessions
  const [loadingExamSessions, setLoadingExamSessions] = useState(true);
  const [pastPaperSubmitLoading, setPastPaperSubmitLoading] = useState(false);

  const [staffUsers, setStaffUsers] = useState([]); // All staff users
  const [loadingStaffUsers, setLoadingStaffUsers] = useState(true);
  const [newUserData, setNewUserData] = useState({ username: '', email: '', password: '', role: 'moderator' });
  const [selectedUserIdForUpdate, setSelectedUserIdForUpdate] = useState('');
  const [selectedUserNewRole, setSelectedUserNewRole] = useState('moderator');
  const [selectedUserIdForRemove, setSelectedUserIdForRemove] = useState('');
  const [userActionLoading, setUserActionLoading] = useState(false);

  // Watermarking States
  const [watermarkLoading, setWatermarkLoading] = useState({});
  const [watermarkedFiles, setWatermarkedFiles] = useState({});

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
      
      // Update database to set is_watermarked to true after successful watermark
      try {
        const { error: updateError } = await supabase
          .from('community_resource_requests')
          .update({ is_watermarked: true })
          .eq('id', resource.id);
        
        if (updateError) {
          console.error('Error updating watermark status:', updateError);
          // Don't fail the whole operation, just log the error
          setMessage('Watermarked PDF downloaded! (Note: Status update failed)');
        } else {
          setMessage('Watermarked PDF downloaded!');
        }
      } catch (dbError) {
        console.error('Database update error:', dbError);
        setMessage('Watermarked PDF downloaded! (Note: Status update failed)');
      }
      
      setMessageType('success');
      setWatermarkedFiles(prev => ({ ...prev, [resource.id]: fileNames }));
      
    } catch (err) {
      setMessage('Watermark error: ' + err.message);
      setMessageType('error');
    } finally {
      setWatermarkLoading((prev) => ({ ...prev, [resource.id]: false }));
    }
  };


  // Helper function to get approval status display
  const getApprovalStatus = (approved) => {
    switch (approved) {
      case 'Approved':
        return { text: 'Approved', color: 'text-green-600', bgColor: 'bg-green-100' };
      case 'Pending':
        return { text: 'Pending', color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
      case 'Unapproved':
        return { text: 'Unapproved', color: 'text-red-600', bgColor: 'bg-red-100' };
      case null:
      case undefined:
        return { text: 'Not Set', color: 'text-gray-600', bgColor: 'bg-gray-100' };
      default:
        return { text: approved?.toString() || 'Unknown', color: 'text-gray-600', bgColor: 'bg-gray-100' };
    }
  };

  // Delete moderation item
  const handleModDelete = async (item) => {
    if (!supabaseClient) return;
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    const table = modType === 'resource' ? 'resources' : 'community_resource_requests';
    const { error } = await supabaseClient.from(table).delete().eq('id', item.id);
    if (!error) {
        setModResults((prev) => prev.filter((r) => r.id !== item.id));
        showPopup({ type: 'rejectSuccess', subText: 'Item deleted.' }); // Using rejectSuccess for a delete type
    } else {
        showPopup({ type: 'fetchError', subText: `Failed to delete item: ${error.message}` });
    }
  };

  // Open edit modal for moderation
  const handleModEdit = (item) => {
    setModEditItem(item);
    setModEditForm({ ...item });
  };

  // Save moderation edit
  const saveModEdit = async () => {
    if (!supabaseClient || !modEditItem) return;
    setModEditLoading(true);
    const table = modType === 'resource' ? 'resources' : 'community_resource_requests';
    const idField = 'id';
    // Only send editable fields
    const editableFields = { ...modEditForm };
    delete editableFields.id;
    if (modType === 'resource') {
      delete editableFields.created_at;
      delete editableFields.updated_at;
    } else {
      delete editableFields.submitted_at;
      delete editableFields.approved_at;
    }
    const { error } = await supabaseClient.from(table).update(editableFields).eq(idField, modEditItem.id);
    setModEditLoading(false);
    if (error) {
      showPopup({ type: 'fetchError', subText: `Failed to update: ${error.message}` });
    } else {
      showPopup({ type: 'resourceEdited', subText: 'Item updated successfully.' });
      setModEditItem(null);
      setModEditForm({});
      // Refresh moderation results
      // (re-run the moderation query)
      setModLoading(true);
      let query;
      if (modType === 'resource') {
        query = supabaseClient.from('resources').select('*');
      } else {
        query = supabaseClient.from('community_resource_requests').select('*');
      }
      if (modSubject) {
        const subjectIds = subjects.filter(s => s.name === modSubject).map(s => s.id);
        if (subjectIds.length > 0) query = query.in('subject_id', subjectIds);
        else query = query.eq('subject_id', '');
      }
      if (modQualification) {
        const filteredSubjects = subjects.filter(s => s.syllabus_type === modQualification);
        const subjectIds = filteredSubjects.map(s => s.id);
        if (subjectIds.length > 0) query = query.in('subject_id', subjectIds);
        else query = query.eq('subject_id', '');
      }
      query.order('created_at', { ascending: false }).then(({ data }) => {
        setModResults(data || []);
        setModLoading(false);
      });
    }
  };

  // Edit form change handler
  const handleModEditFormChange = (e) => {
    const { name, value } = e.target;
    setModEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const resourceCategories = [
    { value: 'note', label: 'Note' },
    { value: 'topic_question', label: 'Topic Question' },
    { value: 'marking_scheme', label: 'Marking Scheme' },
    { value: 'extra_resource', label: 'Extra Resource' },
    { value: 'essay_questions', label: 'Essay Questions' },
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
        fetchExamSessions(); // Fetch exam sessions when authenticated
        fetchStaffUsers(); // NEW: Fetch staff users when authenticated
      } else {
        setStaffUsername('');
        setStaffUsers([]); // Clear users on logout
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
        fetchExamSessions(); // Fetch exam sessions when authenticated
        fetchStaffUsers(); // NEW: Fetch staff users when authenticated
      } else {
        setStaffUsername('');
        setStaffUsers([]); // Clear users on logout
      }
    });
    return () => subscription?.unsubscribe?.();
  }, [supabaseClient]);

  useEffect(() => {
    if (!supabaseClient) return;
    setLoadingSubjects(true);
    supabaseClient.from('subjects').select('id, name, code, syllabus_type, units').order('name', { ascending: true }).then(({ data, error }) => {
      if (error) {
        showPopup({ type: 'fetchError', subText: `Subjects fetch failed: ${error.message}` });
      } else {
        setSubjects(data || []);
        if (data?.[0]?.id) setSelectedSubjectId(data[0].id);
      }
      setLoadingSubjects(false);
    });
  }, [supabaseClient]);

  // NEW: Fetch exam sessions
  const fetchExamSessions = async () => {
    if (!supabaseClient) return;
    setLoadingExamSessions(true);
    const { data, error } = await supabaseClient
      .from('exam_sessions')
      .select('id, session, year') // CORRECTED: Select 'session' and 'year'
      .order('year', { ascending: false }) // Order by year descending
      .order('session', { ascending: false }); // Then by session descending (e.g., Oct/Nov before May/June)
    if (error) {
      console.error("Failed to fetch exam sessions:", error.message);
      showPopup({ type: 'fetchError', subText: `Failed to fetch exam sessions: ${error.message}` });
    } else {
      setExamSessions(data || []);
      if (data?.length > 0) {
        setSelectedExamSessionId(data[0].id);
      }
    }
    setLoadingExamSessions(false);
  };

  const fetchLatestResources = async () => {
    if (!supabaseClient) return;
    const { data, error } = await supabaseClient.from('resources').select('*').order('created_at', { ascending: false }).limit(5);
    if (error) {
      // Not showing a popup for background fetches, only for user-initiated actions
      console.error("Failed to fetch latest resources:", error.message);
    } else {
      setLatestResources(data);
    }
  };

  const fetchUnapprovedResources = async () => {
    if (!supabaseClient) return;
    // Fetch resources with 'Pending' status for the approve section
    const { data, error } = await supabaseClient.from('resources').select('*').eq('approved', "Pending");
    if (error) {
      // Not showing a popup for background fetches
      console.error("Failed to fetch unapproved resources:", error.message);
    } else {
      setUnapprovedResources(data);
    }
  };

  // NEW: Fetch all staff users
  const fetchStaffUsers = async () => {
    if (!supabaseClient) return;
    setLoadingStaffUsers(true);
    const { data, error } = await supabaseClient.from('staff_users').select('id, username, email, role, created_at').order('created_at', { ascending: false });
    if (error) {
      showPopup({ type: 'fetchError', subText: `Failed to fetch staff users: ${error.message}` });
    } else {
      setStaffUsers(data || []);
    }
    setLoadingStaffUsers(false);
  };

  const approveResource = async (id) => {
    if (!supabaseClient) return;
    const currentTime = new Date().toISOString();

    // Optimistically update the local state first
    setUnapprovedResources((prev) =>
      prev.map((res) =>
        res.id === id
          ? { ...res, approved: "Approved", updated_at: currentTime }
          : res
      )
    );

    const { error } = await supabaseClient.from('resources').update({
      approved: "Approved",
      updated_at: currentTime
    }).eq('id', id);

    if (!error) {
      // Remove from unapproved list after successful update
      setTimeout(() => {
        setUnapprovedResources((prev) => prev.filter((res) => res.id !== id));
      }, 1000); // Show the approved status for 1 second before removing
      fetchLatestResources();
      showPopup({ type: 'approveSuccess' });
    } else {
      // Revert the optimistic update if there was an error
      setUnapprovedResources((prev) =>
        prev.map((res) =>
          res.id === id
            ? { ...res, approved: "Pending", updated_at: res.updated_at }
            : res
        )
      );
      showPopup({ type: 'fetchError', subText: `Failed to approve resource: ${error.message}` });
    }
  };

  const rejectResource = async (id) => {
    if (!supabaseClient) return;
    const currentTime = new Date().toISOString();

    // Optimistically update the local state first
    setUnapprovedResources((prev) =>
      prev.map((res) =>
        res.id === id
          ? { ...res, approved: "Unapproved", updated_at: currentTime }
          : res
      )
    );

    const { error } = await supabaseClient.from('resources').update({
      approved: "Unapproved",
      updated_at: currentTime
    }).eq('id', id);

    if (!error) {
      // Remove from pending list after successful update
      setTimeout(() => {
        setUnapprovedResources((prev) => prev.filter((res) => res.id !== id));
      }, 1000); // Show the rejected status for 1 second before removing
      fetchLatestResources();
      showPopup({ type: 'rejectSuccess' });
    } else {
      // Revert the optimistic update if there was an error
      setUnapprovedResources((prev) =>
        prev.map((res) =>
          res.id === id
            ? { ...res, approved: "Pending", updated_at: res.updated_at }
            : res
        )
      );
      showPopup({ type: 'fetchError', subText: `Failed to reject resource: ${error.message}` });
    }
  };

  const deleteResource = async (id) => {
    if (!supabaseClient) return;
    const { error } = await supabaseClient.from('resources').delete().eq('id', id);
    if (!error) {
      setUnapprovedResources((prev) => prev.filter((res) => res.id !== id));
      fetchLatestResources();
      showPopup({ type: 'rejectSuccess', subText: 'Resource deleted.' }); // Using rejectSuccess for a delete type
    } else {
      showPopup({ type: 'fetchError', subText: `Failed to delete resource: ${error.message}` });
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!supabaseClient) return;
    setLoginLoading(true);
    const { data, error } = await supabaseClient.auth.signInWithPassword({ email: loginEmail, password: loginPassword });
    if (!error) {
      setStaffUser(data.user);
      showPopup({ type: 'loginSuccess' });
    } else {
      showPopup({ type: 'fetchError', subText: `Login failed: ${error.message}` });
    }
    setLoginLoading(false);
  };

  const handleLogout = async () => {
    if (!supabaseClient) return;
    const { error } = await supabaseClient.auth.signOut();
    if (!error) {
      setStaffUser(null);
      showPopup({ type: 'logoutSuccess' });
    } else {
      showPopup({ type: 'fetchError', subText: `Logout failed: ${error.message}` });
    }
  };

  const [submitLoading, setSubmitLoading] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    if (!supabaseClient) {
      showPopup({ type: 'fetchError', subText: 'Supabase client not initialized. Please refresh the page or check your connection.' });
      setSubmitLoading(false);
      return;
    }
    if (!title || !link || !selectedSubjectId || !resourceType) {
      showPopup({ type: 'validationError', subText: 'Please fill all required fields.' });
      setSubmitLoading(false);
      return;
    }
    // Ensure link starts with http:// or https://
    let safeLink = link.trim();
    if (!/^https?:\/\//i.test(safeLink)) {
      // If it doesn't start with www., add it
      if (!/^www\./i.test(safeLink)) {
        safeLink = 'www.' + safeLink;
      }
      safeLink = 'https://' + safeLink;
    }
    const unitValue = unitChapter.trim() === '' ? 'General' : unitChapter.trim();
    const { data, error } = await supabaseClient.from('resources').insert({
      title,
      link: safeLink,
      description,
      resource_type: resourceType,
      subject_id: selectedSubjectId,
      unit_chapter_name: unitValue,
      uploaded_by_username: staffUsername,
      approved: "Approved" // Automatically set to Approved
    }).select();
    if (error) {
      showPopup({ type: 'fetchError', subText: `Submission failed: ${error.message}` });
      setSubmitLoading(false);
    } else if (!data || data.length === 0) {
      showPopup({ type: 'fetchError', subText: 'Submission did not return a new resource. Please check your database constraints.' });
      setSubmitLoading(false);
    } else {
      showPopup({ type: 'uploadSuccess' });
      setTitle('');
      setLink('');
      setDescription('');
      fetchUnapprovedResources();
      fetchLatestResources();
      setSubmitLoading(false);
    }
  };

  // NEW: Handle Past Paper Submission
  const handlePaperSubmit = async (e) => {
    e.preventDefault();
    setPastPaperSubmitLoading(true);

    if (!supabaseClient) {
      showPopup({ type: 'fetchError', subText: 'Supabase client not initialized. Please refresh the page or check your connection.' });
      setPastPaperSubmitLoading(false);
      return;
    }

    if (!selectedSubjectId || !selectedExamSessionId || !unitCode || !questionPaperLink) {
      showPopup({ type: 'validationError', subText: 'Subject, Exam Session, Unit Code, and Question Paper Link are required.' });
      setPastPaperSubmitLoading(false);
      return;
    }

    // Basic URL validation
    const validateLink = (link) => {
        if (!link) return null; // Optional links can be empty
        let safeLink = link.trim();
        if (!/^https?:\/\//i.test(safeLink)) {
            if (!/^www\./i.test(safeLink)) {
                safeLink = 'www.' + safeLink;
            }
            safeLink = 'https://' + safeLink;
        }
        return safeLink;
    };

    const safeQPLink = validateLink(questionPaperLink);
    const safeMSLink = validateLink(markSchemeLink);
    const safeERLink = validateLink(examinerReportLink);

    if (!safeQPLink) {
        showPopup({ type: 'validationError', subText: 'Question Paper Link is required and must be a valid URL.' });
        setPastPaperSubmitLoading(false);
        return;
    }

    const { data, error } = await supabaseClient.from('papers').insert({ // Changed from 'past_papers' to 'papers' based on schema
      subject_id: selectedSubjectId,
      exam_session_id: selectedExamSessionId,
      unit_code: unitCode,
      question_paper_link: safeQPLink,
      mark_scheme_link: safeMSLink,
      examiner_report_link: safeERLink,
      uploaded_by_username: staffUsername,
      // You might want an 'approved' field for past papers as well, defaulting to 'Approved'
      // approved: "Approved"
    }).select();

    if (error) {
      showPopup({ type: 'fetchError', subText: `Past Paper submission failed: ${error.message}` });
      setPastPaperSubmitLoading(false);
    } else if (!data || data.length === 0) {
      showPopup({ type: 'fetchError', subText: 'Past Paper submission did not return a new record. Please check your database constraints.' });
      setPastPaperSubmitLoading(false);
    } else {
      showPopup({ type: 'uploadSuccess', subText: 'Past paper uploaded successfully!' });
      // Clear form fields
      setSelectedExamSessionId('');
      setUnitCode('');
      setQuestionPaperLink('');
      setMarkSchemeLink('');
      setExaminerReportLink('');
      // Optionally re-fetch past papers if you have a display for them
      setPastPaperSubmitLoading(false);
    }
  };

  const handleAddSubject = async (e) => {
    e.preventDefault();
    if (!newSubjectName || !newSubjectCode || !newSubjectType) {
      showPopup({ type: 'validationError', subText: 'All fields are required for adding a subject.' });
      return;
    }
    const { error } = await supabaseClient.from('subjects').insert({
      name: newSubjectName,
      code: newSubjectCode,
      syllabus_type: newSubjectType,
      units: newUnits
    });
    if (error) {
      showPopup({ type: 'fetchError', subText: `Failed to add subject: ${error.message}` });
    } else {
      showPopup({ type: 'approveSuccess', subText: 'Subject added successfully.' }); // Using approveSuccess for adding a subject
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
      showPopup({ type: 'validationError', subText: 'All unit fields are required.' });
      return;
    }
    setNewUnits((prev) => [
      ...prev,
      { name: newUnitName, code: newUnitCode, unit: newUnitNumber }
    ]);
    setNewUnitName('');
    setNewUnitCode('');
    setNewUnitNumber('');
    // No popup here as it's an in-form action
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
      approved: resource.approved || 'Pending', // Add approved status to edit form
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
      approved: editForm.approved, // Include approved status in update
    }).eq('id', editResource.id);
    setEditLoading(false);
    if (error) {
      showPopup({ type: 'fetchError', subText: `Failed to update resource: ${error.message}` });
    } else {
      showPopup({ type: 'resourceEdited' });
      closeEditResource();
      fetchUnapprovedResources();
      fetchLatestResources();
    }
  };

  const deleteApprovedResource = async (id) => {
    if (!supabaseClient) return;
    const { error } = await supabaseClient.from('resources').delete().eq('id', id);
    if (!error) {
      showPopup({ type: 'rejectSuccess', subText: 'Resource deleted.' }); // Using rejectSuccess for a delete type
      fetchLatestResources();
    } else {
      showPopup({ type: 'fetchError', subText: `Failed to delete resource: ${error.message}` });
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
      showPopup({ type: 'fetchError', subText: 'Failed to fetch staff users for leaderboard: ' + staffError.message });
      setLoadingLeaderboard(false);
      return;
    }
    // Get all resources
    const { data: resources, error: resError } = await supabaseClient
      .from('resources')
      .select('uploaded_by_username, approved');
    if (resError) {
      showPopup({ type: 'fetchError', subText: 'Failed to fetch resources for leaderboard: ' + resError.message });
      setLoadingLeaderboard(false);
      return;
    }
    // Count uploads and approvals per user
    const stats = staffUsers.map(user => {
      const uploads = resources.filter(r => r.uploaded_by_username === user.username);
      const approved = uploads.filter(r => r.approved === "Approved").length;
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

  // Fetch moderation data when filters change or tab is selected
  useEffect(() => {
    if (activeTab !== 'moderation') return;
    if (!supabaseClient) return;
    setModLoading(true);
    let query;
    if (modType === 'resource') {
      query = supabaseClient.from('resources').select('*');
    } else {
      query = supabaseClient.from('community_resource_requests').select('*');
    }
    // Filter by subject
    if (modSubject) {
      // Find all subject IDs with this name
      const subjectIds = subjects.filter(s => s.name === modSubject).map(s => s.id);
      if (subjectIds.length > 0) query = query.in('subject_id', subjectIds);
      else query = query.eq('subject_id', ''); // No results
    }
    // Filter by qualification
    if (modQualification) {
      const filteredSubjects = subjects.filter(s => s.syllabus_type === modQualification);
      const subjectIds = filteredSubjects.map(s => s.id);
      if (subjectIds.length > 0) query = query.in('subject_id', subjectIds);
      else query = query.eq('subject_id', ''); // No results
    }
    query.order('created_at', { ascending: false }).then(({ data, error }) => {
      setModResults(data || []);
      setModLoading(false);
      if (error) {
        showPopup({ type: 'fetchError', subText: `Failed to fetch moderation data: ${error.message}` });
      }
    });
  }, [modType, modSubject, modQualification, activeTab, supabaseClient, subjects]);

  // Find the selected subject to get its units for the past paper unit code dropdown
  const currentSelectedSubject = subjects.find(s => s.id === selectedSubjectId);
  const unitsForSelectedSubject = currentSelectedSubject?.units || [];

  // NEW: User Management Functions
  const handleNewUserChange = (e) => {
    const { name, value } = e.target;
    setNewUserData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddStaffUser = async (e) => {
    e.preventDefault();
    setUserActionLoading(true);
  
    const { username, email, password, role } = newUserData;
  
    if (!username || !email || !password || !role) {
      showPopup({ type: 'validationError', subText: 'All fields are required to add a user.' });
      setUserActionLoading(false);
      return;
    }
  
    try {
      // Make a fetch request to your new backend API route
      // For Next.js App Router at src/app/api/staff-users/route.js, the path is simply /api/staff-users
      const response = await fetch('/api/staff-users', { // <-- **THIS LINE IS CHANGED**
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password, role }), // Send plain password to backend
      });
  
      const result = await response.json(); // Parse the JSON response from your API
  
      if (response.ok) { // Check if the HTTP status is 2xx (success)
        showPopup({ type: 'approveSuccess', subText: result.message || 'User added successfully!' });
        setNewUserData({ username: '', email: '', password: '', role: 'moderator' }); // Reset form
        fetchStaffUsers(); // Refresh the user list in the UI
      } else {
        // Handle errors returned from your backend API
        showPopup({ type: 'fetchError', subText: result.message || 'Failed to add user.' });
      }
    } catch (error) {
      // Handle network errors or other unexpected issues
      console.error('Error adding staff user:', error);
      showPopup({ type: 'fetchError', subText: `An unexpected error occurred: ${error.message}` });
    } finally {
      setUserActionLoading(false); // Always stop loading, regardless of success or failure
    }
  };
  

  const handleUpdateStaffUserRole = async (e) => {
    e.preventDefault();
    setUserActionLoading(true);
    if (!supabaseClient) {
      showPopup({ type: 'fetchError', subText: 'Supabase client not initialized.' });
      setUserActionLoading(false);
      return;
    }
    if (!selectedUserIdForUpdate || !selectedUserNewRole) {
      showPopup({ type: 'validationError', subText: 'Please select a user and a new role.' });
      setUserActionLoading(false);
      return;
    }

    const { error } = await supabaseClient.from('staff_users').update({
      role: selectedUserNewRole
    }).eq('id', selectedUserIdForUpdate);

    if (error) {
      showPopup({ type: 'fetchError', subText: `Failed to update user role: ${error.message}` });
    } else {
      showPopup({ type: 'resourceEdited', subText: 'User role updated successfully!' });
      setSelectedUserIdForUpdate('');
      setSelectedUserNewRole('moderator');
      fetchStaffUsers(); // Refresh the user list
    }
    setUserActionLoading(false);
  };

  const handleRemoveStaffUser = async (e) => {
    e.preventDefault();
    setUserActionLoading(true);
    if (!supabaseClient) {
      showPopup({ type: 'fetchError', subText: 'Supabase client not initialized.' });
      setUserActionLoading(false);
      return;
    }
    if (!selectedUserIdForRemove) {
      showPopup({ type: 'validationError', subText: 'Please select a user to remove.' });
      setUserActionLoading(false);
      return;
    }

    // Confirm deletion
    if (!window.confirm('Are you sure you want to permanently remove this user? This action cannot be undone.')) {
      setUserActionLoading(false);
      return;
    }

    const { error } = await supabaseClient.from('staff_users').delete().eq('id', selectedUserIdForRemove);

    if (error) {
      showPopup({ type: 'fetchError', subText: `Failed to remove user: ${error.message}` });
    } else {
      showPopup({ type: 'rejectSuccess', subText: 'User removed successfully!' });
      setSelectedUserIdForRemove('');
      fetchStaffUsers(); // Refresh the user list
    }
    setUserActionLoading(false);
  };


  return (
    <div className={`pt-20 ${!staffUser ? "h-screen":"min-h-screen h-fit "} bg-blue-100 p-6 flex justify-center items-center`} style={{ fontFamily: 'Poppins, sans-serif' }}>
      <div className="h-fit bg-white rounded-xl shadow-lg w-full max-w-5xl mx-auto p-4 sm:p-6">
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
            <div className="border-b mb-4 sm:text-base text-xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 sm:px-1 w-full">
                <button onClick={() => setActiveTab('upload')} className={`cursor-pointer py-2 px-4 flex items-center gap-1 rounded-t-lg ${activeTab === 'upload' ? 'border-b-2 border-blue-600 font-semibold text-blue-700 bg-blue-50' : 'text-gray-500 hover:text-blue-600'}`}><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4" /></svg>Upload</button>
                <button onClick={() => setActiveTab('past_papers')} className={`cursor-pointer py-2 px-4 flex items-center gap-1 rounded-t-lg ${activeTab === 'past_papers' ? 'border-b-2 border-blue-600 font-semibold text-blue-700 bg-blue-50' : 'text-gray-500 hover:text-blue-600'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#666666"><path d="M288-168v-432q0-30.08 21-51.04T360-672h432q29.7 0 50.85 21.15Q864-629.7 864-600v312L672-96H360q-29.7 0-50.85-21.15Q288-138.3 288-168ZM98-703q-5-29 12.5-54t46.5-30l425-76q29-5 53.5 12.5T665-804l11 60h-73l-9-48-425 76 47 263v228q-16-7-27.5-21.08Q177-260.16 174-278L98-703Zm262 103v432h264v-168h168v-264H360Zm216 216Z"/></svg>
                    Past Papers
                </button>
                <button onClick={() => setActiveTab('approve')} className={`cursor-pointer py-2 px-4 flex items-center gap-1 rounded-t-lg ${activeTab === 'approve' ? 'border-b-2 border-blue-600 font-semibold text-blue-700 bg-blue-50' : 'text-gray-500 hover:text-blue-600'}`}><svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="currentColor"><path d="M263.72-96Q234-96 213-117.15T192-168v-384q0-29.7 21.15-50.85Q234.3-624 264-624h24v-96q0-79.68 56.23-135.84 56.22-56.16 136-56.16Q560-912 616-855.84q56 56.16 56 135.84v96h24q29.7 0 50.85 21.15Q768-581.7 768-552v384q0 29.7-21.16 50.85Q725.68-96 695.96-96H263.72Zm.28-72h432v-384H264v384Zm216.21-120Q510-288 531-309.21t21-51Q552-390 530.79-411t-51-21Q450-432 429-410.79t-21 51Q408-330 429.21-309t51 21ZM360-624h240v-96q0-50-35-85t-85-35q-50 0-85 35t-35 85v96Zm-96 456v-384 384Z"/></svg>Approve</button>
                <button onClick={() => setActiveTab('subjects')} className={`cursor-pointer py-2 px-4 flex items-center gap-1 rounded-t-lg ${activeTab === 'subjects' ? 'border-b-2 border-blue-600 font-semibold text-blue-700 bg-blue-50' : 'text-gray-500 hover:text-blue-600'}`}><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>Add Subject</button>
                <button onClick={() => setActiveTab('leaderboard')} className={`cursor-pointer py-2 px-4 flex items-center gap-1 rounded-t-lg ${activeTab === 'leaderboard' ? 'border-b-2 border-blue-600 font-semibold text-blue-700 bg-blue-50' : 'text-gray-500 hover:text-blue-600'}`}><svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#666666"><path d="m290-96-50-50 264-264 144 144 213-214 51 51-264 264-144-144L290-96Zm-122-48q-30 0-51-21.15T96-216v-528q0-29 21.5-50.5T168-816h528q29 0 50.5 21.5T768-744v160H168v440Zm0-512h528v-88H168v88Zm0 0v-88 88Z"/></svg>Leaderboard</button>
                <button onClick={() => setActiveTab('moderation')} className={`cursor-pointer py-2 px-4 flex items-center gap-1 rounded-t-lg ${activeTab === 'moderation' ? 'border-b-2 border-blue-600 font-semibold text-blue-700 bg-blue-50' : 'text-gray-500 hover:text-blue-600'}`}><svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#666666"><path d="m376-336 104-79 104 79-40-128 104-82H521.07L480-672l-41.07 126H312l104 82-40 128ZM480-96q-135-33-223.5-152.84Q168-368.69 168-515v-229l312-120 312 120v229q0 146.31-88.5 266.16Q615-129 480-96Zm0-75q104-32.25 172-129t68-215v-180l-240-92-240 92v180q0 118.25 68 215t172 129Zm0-308Z"/></svg>Moderation View</button>
                {/* NEW: User Management Tab Button */}
                <button onClick={() => setActiveTab('users')} className={`cursor-pointer py-2 px-4 flex items-center gap-1 rounded-t-lg ${activeTab === 'users' ? 'border-b-2 border-blue-600 font-semibold text-blue-700 bg-blue-50' : 'text-gray-500 hover:text-blue-600'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#666666"><path d="M480-480q-60 0-102-42t-42-102q0-60 42-102t102-42q60 0 102 42t42 102q0 60-42 102t-102 42ZM192-192v-96q0-23 12.5-43.5T239-366q55-32 116.29-49 61.29-17 124.5-17t124.71 17Q666-398 721-366q22 13 34.5 34t12.5 44v96H192Zm72-72h432v-24q0-5.18-3.03-9.41-3.02-4.24-7.97-6.59-46-28-98-42t-107-14q-55 0-107 14t-98 42q-5 4-8 7.72-3 3.73-3 8.28v24Zm216.21-288Q510-552 531-573.21t21-51Q552-654 530.79-675t-51-21Q450-696 429-674.79t-21 51Q408-594 429.21-573t51 21Zm-.21-72Zm0 360Z"/></svg>
                    User Management
                </button>
            </div>
            {/* Removed the old message display div */}
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
                          <input type="text" value={unitChapter} onChange={(e) => setUnitChapter(e.target.value)} placeholder="Unit/Chapter (optional)" className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition" />
                        );
                      }
                    })()}
                    <span className="text-xs text-gray-500">Paste any URL format (www.abc.com, abc.com, https://www.abc.com, etc.):</span>
                    <input type="text" value={link} onChange={(e) => setLink(e.target.value)} placeholder="Link *" className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition" required />
                    <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description (optional)" className="min-h-[100px] w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition"></textarea>
                  </div>
                  <div className="flex flex-col md:flex-row gap-2">
                    <select value={resourceType} onChange={(e) => setResourceType(e.target.value)} className="cursor-pointer w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition">
                      {resourceCategories.map((cat) => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                      ))}
                    </select>
                    <select value={selectedSubjectId} onChange={(e) => setSelectedSubjectId(e.target.value)} className="cursor-pointer w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition">
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
                  </div>
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

            {/* NEW: Past Papers Tab Content */}
            {activeTab === 'past_papers' && (
              <>
                <form onSubmit={handlePaperSubmit} className="space-y-4 bg-blue-50 p-4 rounded-2xl border border-blue-100">
                  <h3 className="text-xl font-semibold text-blue-700 mb-4">Upload Past Paper</h3>
                  <div className="flex flex-col md:flex-row gap-2">
                    <select value={selectedSubjectId} onChange={(e) => setSelectedSubjectId(e.target.value)} className="cursor-pointer w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition" required>
                      <option value="">Select Subject *</option>
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
                    <select value={selectedExamSessionId} onChange={(e) => setSelectedExamSessionId(e.target.value)} className="cursor-pointer w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition" required disabled={loadingExamSessions}>
                      <option value="">{loadingExamSessions ? 'Loading Exam Sessions...' : 'Select Exam Session *'}</option>
                      {examSessions.map((session) => (
                        <option key={session.id} value={session.id}>
                          {session.session} {session.year} {/* CORRECTED: Display session and year */}
                        </option>
                      ))}
                    </select>
                  </div>
                  {/* Unit Code input - can be a dropdown if subjects have units, otherwise a text input */}
                  {(() => {
                    const selectedSubject = subjects.find(sub => sub.id === selectedSubjectId);
                    const units = selectedSubject?.units || [];
                    if (Array.isArray(units) && units.length > 0) {
                      return (
                        <select value={unitCode} onChange={e => setUnitCode(e.target.value)} className="cursor-pointer w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition" required>
                          <option value="">Select Unit Code *</option>
                          {units.map((unit, idx) => (
                            <option key={unit.code || unit.name || idx} value={unit.code}>{unit.unit ? `${unit.unit} - ${unit.name} (${unit.code})` : `${unit.name} (${unit.code})`}</option>
                          ))}
                          {/* Option for subjects without specific units, if applicable for past papers */}
                          {/* <option value="General">General</option> */}
                        </select>
                      );
                    } else {
                      return (
                        <input type="text" value={unitCode} onChange={(e) => setUnitCode(e.target.value)} placeholder="Unit Code (e.g., WAC11) *" className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition" required />
                      );
                    }
                  })()}

                  <span className="text-xs text-gray-500">Paste any URL format (www.abc.com, abc.com, https://www.abc.com, etc.):</span>
                  <input type="text" value={questionPaperLink} onChange={(e) => setQuestionPaperLink(e.target.value)} placeholder="Question Paper Link *" className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition" required />
                  <input type="text" value={markSchemeLink} onChange={(e) => setMarkSchemeLink(e.target.value)} placeholder="Mark Scheme Link (optional)" className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition" />
                  <input type="text" value={examinerReportLink} onChange={(e) => setExaminerReportLink(e.target.value)} placeholder="Examiner Report Link (optional)" className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition" />
                  <button type="submit" className="cursor-pointer w-full bg-blue-600 hover:bg-blue-700 transition text-white py-2 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed" disabled={pastPaperSubmitLoading}>
                    {pastPaperSubmitLoading ? (
                      <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7 10l5 5m0 0l5-5m-5 5V4" /></svg>
                    )}
                    {pastPaperSubmitLoading ? 'Submitting...' : 'Upload Past Paper'}
                  </button>
                </form>
              </>
            )}

            {activeTab === 'approve' && (
              <>
                <div className="divide-y divide-blue-100">
                  {unapprovedResources.length === 0 && <div className="text-gray-500 text-sm py-4">No pending resources 🎉</div>}
                  {unapprovedResources.map((res) => {
                    const subject = subjects.find(sub => sub.id === res.subject_id);
                    const approvalStatus = getApprovalStatus(res.approved);
                    return (
                      <div key={res.id} className="bg-gray-50 p-4 rounded-lg mb-3 flex flex-col gap-2">
                        <div className="w-full">
                          <p className="font-bold text-blue-800 text-lg mb-1">{res.title}</p>
                          <p className="text-sm text-gray-600 mb-1">{res.description}</p>
                          <a href={res.link} className="text-blue-500 underline text-sm break-all" target="_blank" rel="noopener noreferrer">{res.link}</a>
                          <div className="mt-2 mb-2 grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-gray-700">
                            <div><span className="font-semibold">Added by:</span> {res.uploaded_by_username || 'Unknown'}</div>
                            <div><span className="font-semibold">Subject:</span> {subject ? `${subject.name} (${subject.code}) - ${subject.syllabus_type}` : 'Unknown'}</div>
                            <div><span className="font-semibold">Suggested on:</span> {res.created_at ? new Date(res.created_at).toLocaleString() : 'Unknown'}</div>
                            <div><span className="font-semibold">Status:</span> <span className={`font-semibold px-2 py-1 rounded text-xs ${approvalStatus.bgColor} ${approvalStatus.color}`}>{approvalStatus.text}</span></div>
                            <div><span className="font-semibold">Last updated:</span> {res.updated_at ? new Date(res.updated_at).toLocaleString() : 'Unknown'}</div>
                          </div>
                          <div className='flex justify-start gap-2 text-xs mb-2'>
                            <div className="cursor-pointer w-fit px-4 py-0.5 text-green-400 ring ring-green-400 rounded-md hover:bg-green-400 hover:text-white transition-colors">{res.unit_chapter_name}</div>
                            <div className="cursor-pointer w-fit px-4 py-0.5 text-orange-400 uppercase ring ring-orange-400 rounded-md hover:bg-orange-400 hover:text-white transition-colors">{res.resource_type}</div>
                          </div>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-2">
                          <button onClick={() => approveResource(res.id)} className="cursor-pointer bg-green-500 hover:bg-green-600 transition text-white px-3 py-1 rounded-md flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                            Approve
                          </button>
                          <button onClick={() => rejectResource(res.id)} className="cursor-pointer bg-orange-500 hover:bg-orange-600 transition text-white px-3 py-1 rounded-md flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Reject
                          </button>
                          <button onClick={() => openEditResource(res)} className="cursor-pointer bg-yellow-400 hover:bg-yellow-500 transition text-white px-3 py-1 rounded-md flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#FFFFFF">
                              <path d="M192-396v-72h288v72H192Zm0-150v-72h432v72H192Zm0-150v-72h432v72H192Zm336 504v-113l210-209q7.26-7.41 16.13-10.71Q763-528 771.76-528q9.55 0 18.31 3.5Q798.83-521 806-514l44 45q6.59 7.26 10.29 16.13Q864-444 864-435.24t-3.29 17.92q-3.3 9.15-10.71 16.32L641-192H528Zm288-243-45-45 45 45ZM576-240h45l115-115-22-23-22-22-116 115v45Zm138-138-22-22 44 45-22-23Z"/>
                            </svg>
                            Edit
                          </button>
                          
                          {/* Watermark Button */}
                          <button 
                            onClick={() => handleWatermark(res)} 
                            disabled={watermarkLoading[res.id]} 
                            className={`cursor-pointer bg-blue-500 hover:bg-blue-600 transition text-white px-3 py-1 rounded-md flex items-center gap-1 ${watermarkLoading[res.id] ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                            </svg>
                            {watermarkLoading[res.id] ? 'Watermarking...' : 'Watermark'}
                          </button>
                          
                          <button onClick={() => deleteResource(res.id)} className="cursor-pointer bg-red-500 hover:bg-red-600 transition text-white px-3 py-1 rounded-md flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Delete
                          </button>
                        </div>

                        {/* Watermark Success Indicator */}
                        {watermarkedFiles[res.id] && (
                          <div className="text-green-600 text-xs mt-2 w-full">
                            {Array.isArray(watermarkedFiles[res.id]) && watermarkedFiles[res.id].length > 0
                              ? watermarkedFiles[res.id].map((name, idx) => (
                                  <div key={idx}>✅ Watermarked {name}</div>
                                ))
                              : <div>✅ Watermarked {watermarkedFiles[res.id]}</div>}
                          </div>
                        )}
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
                    <h4 className="font-semibold text-blue-700 mb-2 text-base">Add Units for Subject</h4>
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
            {activeTab === 'moderation' && (
              <>
                <div className="mb-4 flex flex-wrap gap-3 items-center">
                  <select value={modType} onChange={e => setModType(e.target.value)} className="cursor-pointer border p-2 rounded-md">
                    <option value="resource">Eduvance Resource</option>
                    <option value="community">Community Notes</option>
                  </select>
                  <select value={modSubject} onChange={e => setModSubject(e.target.value)} className="cursor-pointer border p-2 rounded-md">
                    <option value="">All Subjects</option>
                    {[...new Set(subjects.map(sub => sub.name))].map(name => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                  </select>
                  <select value={modQualification} onChange={e => setModQualification(e.target.value)} className="cursor-pointer border p-2 rounded-md">
                    <option value="">All Qualifications</option>
                    {[...new Set(subjects.map(s => s.syllabus_type))].map(q => (
                      <option key={q} value={q}>{q}</option>
                    ))}
                  </select>
                </div>
                {modLoading ? (
                  <div className="text-gray-500 text-sm py-4">Loading...</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {modResults.length === 0 && <div className="text-gray-500 text-sm col-span-full">No results found.</div>}
                    {modResults.map((item) => {
                      const subject = subjects.find(sub => sub.id === item.subject_id);
                      const approvalStatus = getApprovalStatus(item.approved);
                      return (
                        <div key={item.id} className="bg-blue-50 border border-blue-200 rounded-lg pb-10 p-4 shadow-sm flex flex-col gap-2 relative">
                          <div className="font-bold text-blue-800 text-lg mb-1">{item.title}</div>
                          <div className="text-sm text-gray-600 mb-1">{item.description}</div>
                          <a href={item.link} className="text-blue-500 underline text-sm break-all" target="_blank" rel="noopener noreferrer">{item.link}</a>
                          <div className="grid grid-cols-2 gap-2 text-xs text-gray-700 mt-2">
                            <div><span className="font-semibold">Subject:</span> {subject ? `${subject.name} (${subject.code}) - ${subject.syllabus_type}` : 'Unknown'}</div>
                            <div><span className="font-semibold">Unit/Chapter:</span> {item.unit_chapter_name || 'General'}</div>
                            <div><span className="font-semibold">Type:</span> {item.resource_type}</div>
                            {modType === 'resource' ? (
                              <>
                                <div><span className="font-semibold">Uploaded by:</span> {item.uploaded_by_username || 'Unknown'}</div>
                                <div><span className="font-semibold">Created at:</span> {item.created_at ? new Date(item.created_at).toLocaleString() : 'Unknown'}</div>
                                <div><span className="font-semibold">Status:</span> <span className={`font-semibold px-2 py-1 rounded text-xs ${approvalStatus.bgColor} ${approvalStatus.color}`}>{approvalStatus.text}</span></div>
                              </>
                            ) : (
                              <>
                                <div><span className="font-semibold">Contributor:</span> {item.contributor_name} ({item.contributor_email})</div>
                                <div><span className="font-semibold">Submitted at:</span> {item.submitted_at ? new Date(item.submitted_at).toLocaleString() : 'Unknown'}</div>
                                <div><span className="font-semibold">Likes:</span> {item.like_count || 0} &nbsp; <span className="font-semibold">Dislikes:</span> {item.dislike_count || 0}</div>
                                <div><span className="font-semibold">Approved:</span> {item.is_approved ? 'Yes' : 'No'}</div>
                                {item.rejection_reason && <div><span className="font-semibold">Rejection Reason:</span> {item.rejection_reason}</div>}
                              </>
                            )}
                          </div>
                          <div className="flex gap-2 m-2 absolute bottom-0 right-0">
                            <button onClick={() => handleModEdit(item)} className="cursor-pointer bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded text-xs">Edit</button>
                            <button onClick={() => handleModDelete(item)} className="cursor-pointer bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs">Delete</button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
            {/* Unit/Chapter dropdown or input for edit modal */}
            {showEditModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-xs animate-fade-in bg-black/10">
                <div className="bg-white rounded-2xl p-6 w-full max-w-lg relative shadow-2xl">
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
                    <select name="approved" value={editForm.approved} onChange={handleEditFormChange} className="cursor-pointer w-full p-2 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition">
                      <option value="Approved">Approved</option>
                      <option value="Pending">Pending</option>
                      <option value="Unapproved">Unapproved</option>
                    </select>
                      <button onClick={saveEditResource} disabled={editLoading} className="cursor-pointer w-full bg-blue-600 hover:bg-blue-700 transition text-white py-2 rounded-lg flex items-center justify-center gap-2 mt-2">{editLoading ? 'Saving...' : 'Save Changes'}</button>
                  </div>
                </div>
              </div>
            )}
            {/* Moderation Edit Modal */}
            {modEditItem && (
              <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-xs animate-fade-in bg-black/10">
                <div className="bg-white rounded-2xl m-10 p-6 w-full h-[90vh] overflow-y-scroll overscroll-none overflow-x-hidden max-w-lg relative shadow-2xl">
                  <button onClick={() => setModEditItem(null)} className="cursor-pointer absolute top-2 right-2 text-gray-400 hover:text-red-500 text-xl">&times;</button>
                  <h3 className="text-lg font-semibold mb-4 text-blue-700">Edit {modType === 'resource' ? 'Resource' : 'Community Note'}</h3>
                  <div className="space-y-3">
                    <h4 className="text-blue-600 font-semibold text-base mb-2 mt-2">Main Info</h4>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input name="title" value={modEditForm.title || ''} onChange={handleModEditFormChange} placeholder="Title" className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition" />
                    <label className="block text-sm font-medium text-gray-700 mb-1 mt-2">Description</label>
                    <input name="description" value={modEditForm.description || ''} onChange={handleModEditFormChange} placeholder="Description" className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition" />
                    <label className="block text-sm font-medium text-gray-700 mb-1 mt-2">Link</label>
                    <input name="link" value={modEditForm.link || ''} onChange={handleModEditFormChange} placeholder="Link" className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition" />
                    <label className="block text-sm font-medium text-gray-700 mb-1 mt-2">Unit/Chapter</label>
                    <input name="unit_chapter_name" value={modEditForm.unit_chapter_name || ''} onChange={handleModEditFormChange} placeholder="Unit/Chapter" className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition" />
                    <label className="block text-sm font-medium text-gray-700 mb-1 mt-2">Type</label>
                    <input name="resource_type" value={modEditForm.resource_type || ''} onChange={handleModEditFormChange} placeholder="Type" className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition" />
                    {modType === 'resource' && (
                      <>
                        <label className="block text-sm font-medium text-gray-700 mb-1 mt-2">Approval Status</label>
                        <select name="approved" value={modEditForm.approved || 'Pending'} onChange={handleModEditFormChange} className="cursor-pointer w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition">
                          <option value="Approved">Approved</option>
                          <option value="Pending">Pending</option>
                          <option value="Unapproved">Unapproved</option>
                        </select>
                      </>
                    )}
                    {modType === 'community' && (
                      <>
                        <h4 className="text-blue-600 font-semibold text-base mb-2 mt-4">Contributor Info</h4>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Contributor Name</label>
                        <input name="contributor_name" value={modEditForm.contributor_name || ''} onChange={handleModEditFormChange} placeholder="Contributor Name" className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition" />
                        <label className="block text-sm font-medium text-gray-700 mb-1 mt-2">Contributor Email</label>
                        <input name="contributor_email" value={modEditForm.contributor_email || ''} onChange={handleModEditFormChange} placeholder="Contributor Email" className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition" />
                        <label className="block text-sm font-medium text-gray-700 mb-1 mt-2">Rejection Reason</label>
                        <input name="rejection_reason" value={modEditForm.rejection_reason || ''} onChange={handleModEditFormChange} placeholder="Rejection Reason" className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition" />
                      </>
                    )}
                    <button onClick={saveModEdit} disabled={modEditLoading} className="cursor-pointer w-full bg-blue-600 hover:bg-blue-700 transition text-white py-2 rounded-lg flex items-center justify-center gap-2 mt-2">{modEditLoading ? 'Saving...' : 'Save Changes'}</button>
                  </div>
                </div>
              </div>
            )}
            {/* NEW: User Management Tab Content */}
            {activeTab === 'users' && (
              <>
                <div className="space-y-6">
                  {/* Add New User Section */}
                  <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                    <h3 className="text-xl font-semibold text-blue-700 mb-4">Add New Staff User</h3>
                    <form onSubmit={handleAddStaffUser} className="space-y-3">
                      <div>
                        <label htmlFor="newUserUsername" className="block text-sm font-medium text-gray-700">Username</label>
                        <input
                          type="text"
                          id="newUserUsername"
                          name="username"
                          value={newUserData.username}
                          onChange={handleNewUserChange}
                          className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition"
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="newUserEmail" className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                          type="email"
                          id="newUserEmail"
                          name="email"
                          value={newUserData.email}
                          onChange={handleNewUserChange}
                          className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition"
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="newUserPassword" className="block text-sm font-medium text-gray-700">Password</label>
                        <input
                          type="password"
                          id="newUserPassword"
                          name="password"
                          value={newUserData.password}
                          onChange={handleNewUserChange}
                          className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition"
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="newUserRole" className="block text-sm font-medium text-gray-700">Role</label>
                        <select
                          id="newUserRole"
                          name="role"
                          value={newUserData.role}
                          onChange={handleNewUserChange}
                          className="cursor-pointer w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition"
                        >
                          <option value="moderator">Moderator</option>
                          <option value="admin">Admin</option>
                          <option value="editor">Editor</option>
                          <option value="viewer">Viewer</option>
                        </select>
                      </div>
                      <button type="submit" className="cursor-pointer w-full bg-blue-600 hover:bg-blue-700 transition text-white py-2 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed" disabled={userActionLoading}>
                        {userActionLoading ? (
                          <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                        )}
                        {userActionLoading ? 'Adding User...' : 'Add User'}
                      </button>
                    </form>
                  </div>

                  {/* Update User Role Section */}
                  <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                    <h3 className="text-xl font-semibold text-blue-700 mb-4">Update Staff User Role</h3>
                    <form onSubmit={handleUpdateStaffUserRole} className="space-y-3">
                      <div>
                        <label htmlFor="updateUserSelect" className="block text-sm font-medium text-gray-700">Select User</label>
                        <select
                          id="updateUserSelect"
                          value={selectedUserIdForUpdate}
                          onChange={(e) => setSelectedUserIdForUpdate(e.target.value)}
                          className="cursor-pointer w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition"
                          required
                        >
                          <option value="">Select a user</option>
                          {staffUsers.map(user => (
                            <option key={user.id} value={user.id}>{user.username} ({user.email})</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label htmlFor="updateUserRole" className="block text-sm font-medium text-gray-700">New Role</label>
                        <select
                          id="updateUserRole"
                          value={selectedUserNewRole}
                          onChange={(e) => setSelectedUserNewRole(e.target.value)}
                          className="cursor-pointer w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition"
                        >
                          <option value="moderator">Moderator</option>
                          <option value="admin">Admin</option>
                          <option value="editor">Editor</option>
                          <option value="viewer">Viewer</option>
                        </select>
                      </div>
                      <button type="submit" className="cursor-pointer w-full bg-green-600 hover:bg-green-700 transition text-white py-2 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed" disabled={userActionLoading}>
                        {userActionLoading ? (
                          <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        )}
                        {userActionLoading ? 'Updating Role...' : 'Update Role'}
                      </button>
                    </form>
                  </div>

                  {/* Remove User Section */}
                  <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                    <h3 className="text-xl font-semibold text-blue-700 mb-4">Remove Staff User</h3>
                    <form onSubmit={handleRemoveStaffUser} className="space-y-3">
                      <div>
                        <label htmlFor="removeUserSelect" className="block text-sm font-medium text-gray-700">Select User</label>
                        <select
                          id="removeUserSelect"
                          value={selectedUserIdForRemove}
                          onChange={(e) => setSelectedUserIdForRemove(e.target.value)}
                          className="cursor-pointer w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition"
                          required
                        >
                          <option value="">Select a user</option>
                          {staffUsers.map(user => (
                            <option key={user.id} value={user.id}>{user.username} ({user.email})</option>
                          ))}
                        </select>
                      </div>
                      <button type="submit" className="cursor-pointer w-full bg-red-600 hover:bg-red-700 transition text-white py-2 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed" disabled={userActionLoading}>
                        {userActionLoading ? (
                          <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        )}
                        {userActionLoading ? 'Removing User...' : 'Remove User'}
                      </button>
                    </form>
                  </div>

                  {/* Current Staff Users List */}
                  <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                    <h3 className="text-xl font-semibold text-blue-700 mb-4">Current Staff Users</h3>
                    {loadingStaffUsers ? (
                      <div className="text-gray-500 text-sm py-4">Loading users...</div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="min-w-full bg-white border border-blue-200 rounded-lg">
                          <thead>
                            <tr className="bg-blue-50">
                              <th className="px-4 py-2 text-left text-blue-700 font-semibold">Username</th>
                              <th className="px-4 py-2 text-left text-blue-700 font-semibold">Email</th>
                              <th className="px-4 py-2 text-left text-blue-700 font-semibold">Role</th>
                              <th className="px-4 py-2 text-left text-blue-700 font-semibold">Created At</th>
                            </tr>
                          </thead>
                          <tbody>
                            {staffUsers.length === 0 ? (
                              <tr>
                                <td colSpan="4" className="px-4 py-2 text-center text-gray-500">No staff users found.</td>
                              </tr>
                            ) : (
                              staffUsers.map(user => (
                                <tr key={user.id} className="border-t border-blue-100">
                                  <td className="px-4 py-2">{user.username}</td>
                                  <td className="px-4 py-2">{user.email}</td>
                                  <td className="px-4 py-2 capitalize">{user.role}</td>
                                  <td className="px-4 py-2">{new Date(user.created_at).toLocaleDateString()}</td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
            {latestResources.length > 0 && (
              <div className="mt-8">
                <h2 className="text-xl font-semibold text-blue-700 mb-2 flex items-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="currentColor"><path d="M263.72-96Q234-96 213-117.15T192-168v-384q0-29.7 21.15-50.85Q234.3-624 264-624h24v-96q0-79.68 56.23-135.84 56.22-56.16 136-56.16Q560-912 616-855.84q56 56.16 56 135.84v96h24q29.7 0 50.85 21.15Q768-581.7 768-552v384q0 29.7-21.16 50.85Q725.68-96 695.96-96H263.72Zm.28-72h432v-384H264v384Zm216.21-120Q510-288 531-309.21t21-51Q552-390 530.79-411t-51-21Q450-432 429-410.79t-21 51Q408-330 429.21-309t51 21ZM360-624h240v-96q0-50-35-85t-85-35q-50 0-85 35t-35 85v96Zm-96 456v-384 384Z"/></svg>Latest Resources</h2>
                <div className="divide-y divide-blue-100">
                  {latestResources.map((res) => {
                    const subject = subjects.find(sub => sub.id === res.subject_id);
                    const approvalStatus = getApprovalStatus(res.approved);
                    return (
                      <div key={res.id} className="bg-gray-50 p-4 rounded-lg mb-3 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                        <div className="w-full">
                          <p className="font-bold text-blue-800 text-lg mb-1">{res.title}</p>
                          <p className="text-sm text-gray-600 mb-1">{res.description}</p>
                          <a href={res.link} className="text-blue-500 underline text-sm break-all" target="_blank" rel="noopener noreferrer">{res.link}</a>
                          <div className="mt-2 mb-2 grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-gray-700">
                            <div><span className="font-semibold">Added by:</span> {res.uploaded_by_username || 'Unknown'}</div>
                            <div><span className="font-semibold">Subject:</span> {subject ? `${subject.name} (${subject.code}) - ${subject.syllabus_type}` : 'Unknown'}</div>
                            <div><span className="font-semibold">Suggested on:</span> {res.created_at ? new Date(res.created_at).toLocaleString() : 'Unknown'}</div>
                            <div><span className="font-semibold">Status:</span> <span className={`font-semibold px-2 py-1 rounded text-xs ${approvalStatus.bgColor} ${approvalStatus.color}`}>{approvalStatus.text}</span></div>
                            <div><span className="font-semibold">Last updated:</span> {res.updated_at ? new Date(res.updated_at).toLocaleString() : 'Unknown'}</div>
                          </div>
                          <div className='flex justify-start gap-2 text-xs'>
                            <div className="cursor-pointer w-fit px-4 py-0.5 text-green-400 ring ring-green-400 rounded-md hover:bg-green-400 hover:text-white transition-colors">{res.unit_chapter_name}</div>
                            <div className="cursor-pointer w-fit px-4 py-0.5 text-orange-400 uppercase ring ring-orange-400 rounded-md hover:bg-orange-400 hover:text-white transition-colors">{res.resource_type}</div>
                          </div>
                        </div>
                        <div className="flex space-x-2 sm:mt-2 md:mt-0">
                          <button onClick={() => openEditResource(res)} className="cursor-pointer bg-yellow-400 hover:bg-yellow-500 transition text-white px-3 py-1 rounded-md flex items-center gap-1"><svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#FFFFFF"><path d="M192-396v-72h288v72H192Zm0-150v-72h432v72H192Zm0-150v-72h432v72H192Zm336 504v-113l210-209q7.26-7.41 16.13-10.71Q763-528 771.76-528q9.55 0 18.31 3.5Q798.83-521 806-514l44 45q6.59 7.26 10.29 16.13Q864-444 864-435.24t-3.29 17.92q-3.3 9.15-10.71 16.32L641-192H528Zm288-243-45-45 45 45ZM576-240h45l115-115-22-23-22-22-116 115v45Zm138-138-22-22 44 45-22-23Z"/></svg>Edit</button>
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
