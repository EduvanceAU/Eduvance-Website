"use client"; // This directive marks the component as a Client Component in Next.js

import React, { useState, useEffect } from 'react';
// Import useRouter for navigation in Next.js.
// Note: useRouter from 'next/navigation' is for the App Router.
// If you are using the Pages Router, you would use 'next/router'.
import { useRouter } from 'next/navigation';
// Import Supabase client library directly
import { createClient } from '@supabase/supabase-js';
// Import Lucide React icons directly
import { User, LogIn, Loader2 } from 'lucide-react';

// --- Supabase Configuration ---
// For a production Next.js application, these should be securely stored as
// environment variables and accessed using process.env.NEXT_PUBLIC_VARIABLE_NAME.
// Replace the placeholder values with your actual Supabase project URL and Anon Key.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'YOUR_SUPABASE_PROJECT_URL';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

// Initialize Supabase client outside the component to prevent re-initialization on re-renders.
// This also ensures it's ready before the component tries to use it.
let supabase = null;
try {
    // Basic validation to prevent "Failed to construct 'URL': Invalid URL" errors.
    // The URL must start with 'http' and both key and URL must be present.
    if (supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith('http')) {
        supabase = createClient(supabaseUrl, supabaseAnonKey);
    } else {
        // Log an error if the Supabase configuration is invalid.
        // In a deployed Next.js app, ensure these environment variables are correctly set.
        console.error("Supabase URL or Anon Key is invalid. Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set correctly in your environment variables.");
    }
} catch (e) {
    // Catch any errors during the client initialization process.
    console.error("Error initializing Supabase client:", e.message);
}


/**
 * Staff Authentication Page Component.
 * This component provides a form for staff sign-in using Supabase's built-in authentication.
 * It handles redirection upon successful login and displays messages.
 */
export default function StaffAuthPage() {
  const router = useRouter(); // Initialize the router for navigation

  // State variables for managing authentication flow and UI
  const [session, setSession] = useState(null); // Stores the current Supabase session
  const [email, setEmail] = useState('');       // Input for email
  const [password, setPassword] = useState(''); // Input for password
  const [message, setMessage] = useState('');   // Messages to display to the user (success/error)
  const [loading, setLoading] = useState(false); // Loading indicator for async operations

  // --- Supabase Auth State Listener and Redirection ---
  // This useEffect hook runs once on component mount to establish the Supabase auth listener.
  // It checks for an existing session and updates the component's state accordingly.
  // It also handles redirection if a session is found, keeping the login page exclusively for logging in.
  useEffect(() => {
    const authHandler = async () => {
      if (!supabase) {
        setMessage("Supabase client not initialized. Please check your URL and API key.");
        return;
      }

      // Fetch the current session immediately on component load.
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);

      // If a session exists, fetch the user's role and redirect accordingly
      if (session) {
        setLoading(true);
        const { data: staffData, error: staffError } = await supabase
          .from('staff_users')
          .select('role')
          .eq('id', session.user.id)
          .single();
        setLoading(false);
        if (!staffError && staffData) {
          if (staffData.role === 'admin') {
            router.replace('/dashboard/admin');
          } else {
            router.replace('/dashboard/staff');
          }
        } else {
          // fallback if role can't be determined
          router.replace('/dashboard/staff');
        }
      }

      // Set up a listener for real-time authentication state changes.
      const { data: authListener } = supabase.auth.onAuthStateChange(
        async (_event, newSession) => {
          setSession(newSession);
          if (newSession) {
            setLoading(true);
            const { data: staffData, error: staffError } = await supabase
              .from('staff_users')
              .select('role')
              .eq('id', newSession.user.id)
              .single();
            setLoading(false);
            if (!staffError && staffData) {
              if (staffData.role === 'admin') {
                router.replace('/dashboard/admin');
              } else {
                router.replace('/dashboard/staff');
              }
            } else {
              router.replace('/dashboard/staff');
            }
          }
        }
      );

      // Cleanup function
      return () => {
        if (authListener && authListener.subscription) {
            authListener.subscription.unsubscribe();
        }
      };
    };

    authHandler();
  }, [router]);

  /**
   * Handles the staff sign-in process.
   * Uses Supabase's `signInWithPassword` method to authenticate an existing user.
   * On successful sign-in, the user will be redirected to the dashboard page.
   * @param {Event} e The submit event from the form.
   */
  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (!supabase) {
        setMessage("Supabase client not initialized.");
        setLoading(false);
        return;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
          throw error;
      }

      if (data.user) {
        // Fetch role and redirect accordingly
        const { data: staffData, error: staffError } = await supabase
          .from('staff_users')
          .select('role')
          .eq('id', data.user.id)
          .single();
        if (!staffError && staffData) {
          if (staffData.role === 'admin') {
            setMessage('Sign-in successful! Redirecting to admin dashboard...');
            router.replace('/dashboard/admin');
          } else {
            setMessage('Sign-in successful! Redirecting to staff dashboard...');
            router.replace('/dashboard/staff');
          }
        } else {
          setMessage('Sign-in successful! Redirecting to staff dashboard...');
          router.replace('/dashboard/staff');
        }
        setEmail('');
        setPassword('');
      } else {
         setMessage('Sign-in failed. Please check your credentials or confirm your email.');
      }
    } catch (error) {
      setMessage(`Sign-in error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // the authenticated experience on the dashboard page, not the login page.
  // Their functionality would be on the /dashboard page.

  // If a session exists, this component will trigger a redirect to /dashboard.
  // Otherwise, it will render only the sign-in form.
  return (
    // Main container for the authentication interface, styled with Tailwind CSS
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center p-4 font-[Inter]">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md border border-blue-200">
        <h1 className="text-3xl font-bold text-center text-blue-600 mb-6 tracking-[-1px]" style={{ fontFamily: 'Poppins, sans-serif' }}>
          Staff Authentication
        </h1>

        {session ? (
          // Conditional rendering: If session exists, user is already logged in.
          // This section will briefly show before the redirect to dashboard.
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center justify-center" style={{ fontFamily: 'Poppins, sans-serif' }}>
              {/* Render User icon only if it's successfully imported */}
              {User && <User className="mr-2 text-blue-500" size={24} />} Welcome, {session.user.email}!
            </h2>
            <p className="text-gray-600 mb-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
              You are already logged in. Redirecting to your dashboard...
            </p>
            {/* Display messages - SUCCESS/INFO message (green) */}
            {message && !message.includes('error') && !message.includes('failed') && (
              <p className="mt-4 text-sm text-green-600 bg-green-50 p-3 rounded-lg border border-green-200" style={{ fontFamily: 'Poppins, sans-serif' }}>{message}</p>
            )}
            {/* Display messages - ERROR message (red) */}
            {message && (message.includes('error') || message.includes('failed')) && (
              <p className="mt-4 text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200" style={{ fontFamily: 'Poppins, sans-serif' }}>{message}</p>
            )}
          </div>
        ) : (
          // Conditional rendering: Show authentication forms if no user is logged in
          <>
            {/* Sign-In Form */}
            <form onSubmit={handleSignIn} className="space-y-4 mb-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="staff@example.com"
                  required
                  style={{ fontFamily: 'Poppins, sans-serif' }}
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter your password"
                  required
                  style={{ fontFamily: 'Poppins, sans-serif' }}
                />
              </div>
              <button
                type="submit"
                className="w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                style={{ fontFamily: 'Poppins, sans-serif' }}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="animate-spin mr-2" size={20} />
                ) : (
                  LogIn && <LogIn className="mr-2" size={20} /> // Use LogIn icon for sign in
                )}
                Sign In
              </button>
            </form>

            {/* Display messages - SUCCESS/INFO message (green) */}
            {message && !message.includes('error') && !message.includes('failed') && (
              <p className="mt-4 text-sm text-green-600 bg-green-50 p-3 rounded-lg border border-green-200" style={{ fontFamily: 'Poppins, sans-serif' }}>{message}</p>
            )}
            {/* Display messages - ERROR message (red) */}
            {message && (message.includes('error') || message.includes('failed')) && (
              <p className="mt-4 text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200" style={{ fontFamily: 'Poppins, sans-serif' }}>{message}</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
