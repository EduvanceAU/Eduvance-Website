"use client"; // This directive marks the component as a Client Component in Next.js

import React, { useState, useEffect } from 'react';
// Import useRouter for navigation in Next.js.
// Note: useRouter from 'next/navigation' is for the App Router.
// If you are using the Pages Router, you would use 'next/router'.
import { useRouter } from 'next/navigation';
// Import Supabase client library directly
import { createClient } from '@supabase/supabase-js';
// Import Lucide React icons directly
import { User, LogIn, UserPlus, LogOut, Loader2 } from 'lucide-react';

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
 * This component provides forms for staff sign-up and sign-in using Supabase's built-in authentication.
 * It also demonstrates how to access user session information and link to a custom staff_profiles table.
 */
export default function StaffAuthPage() {
  const router = useRouter(); // Initialize the router for navigation

  // State variables for managing authentication flow and UI
  const [session, setSession] = useState(null); // Stores the current Supabase session
  const [email, setEmail] = useState('');       // Input for email
  const [password, setPassword] = useState(''); // Input for password
  const [message, setMessage] = useState('');   // Messages to display to the user (success/error)
  const [loading, setLoading] = useState(false); // Loading indicator for async operations
  // The currentPage state is now less critical for routing but can be used for UI states
  const [currentPage, setCurrentPage] = useState('auth'); // Controls which view is shown ('auth' or 'dashboard')

  // --- Supabase Auth State Listener and Redirection ---
  // This useEffect hook runs once on component mount to establish the Supabase auth listener.
  // It checks for an existing session and updates the component's state accordingly.
  // It also handles redirection if a session is found.
  useEffect(() => {
    const authHandler = async () => {
      // If Supabase client failed to initialize, display a message and return.
      if (!supabase) {
        setMessage("Supabase client not initialized. Please check your URL and API key.");
        return;
      }

      // Fetch the current session immediately on component load.
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);

      // If a session exists, redirect the user away from the login page to the dashboard.
      if (session) {
        router.replace('/dashboard'); // Use replace to prevent going back to login via browser history
      }

      // Set up a listener for real-time authentication state changes.
      // This will automatically update `session` state when a user signs in, signs out, etc.
      const { data: authListener } = supabase.auth.onAuthStateChange(
        (_event, newSession) => {
          setSession(newSession);
          // If a new session is established (user logs in or confirms email), redirect to dashboard
          if (newSession) {
            router.replace('/dashboard');
          }
          // If session becomes null (user logs out), this component (if still rendered)
          // will naturally show the login forms.
        }
      );

      // Cleanup function: Unsubscribe from the auth listener when the component unmounts
      return () => {
        if (authListener && authListener.subscription) {
            authListener.subscription.unsubscribe();
        }
      };
    };

    authHandler();
  }, [router]); // Add router to dependencies to ensure effect re-runs if router object changes (though unlikely)

  // --- Authentication Handlers ---

  /**
   * Handles the staff sign-up process.
   * Uses Supabase's `signUp` method to create a new user account.
   * Supabase will send a confirmation email with a link that respects your
   * "Redirect URL(s)" setting in the Supabase dashboard.
   * @param {Event} e The submit event from the form.
   */
  const handleSignUp = async (e) => {
    e.preventDefault(); // Prevent default form submission
    setLoading(true);   // Set loading state to true
    setMessage('');     // Clear previous messages

    // Ensure Supabase client is initialized before proceeding
    if (!supabase) {
        setMessage("Supabase client not initialized.");
        setLoading(false);
        return;
    }

    try {
      // Call Supabase's signUp method with email and password.
      // Supabase handles password hashing and storage securely.
      // For email confirmation, the redirection is primarily configured in Supabase dashboard.
      const { data, error } = await supabase.auth.signUp({ email, password });

      if (error) {
          throw error; // Propagate any Supabase errors
      }

      if (data.user) {
        setMessage('Sign-up successful! Check your email for a confirmation link.');
        setEmail('');    // Clear email input
        setPassword(''); // Clear password input
      }
    } catch (error) {
      setMessage(`Sign-up error: ${error.message}`); // Display error message
    } finally {
      setLoading(false); // Set loading state back to false
    }
  };

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
      // Call Supabase's signInWithPassword method.
      // Supabase verifies the password securely against its stored hash.
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
          throw error;
      }

      if (data.user) {
        setMessage('Sign-in successful! Redirecting to dashboard...');
        setEmail('');
        setPassword('');
        router.replace('/dashboard'); // Redirect to dashboard after successful sign-in
      } else {
         // This else block might be hit if, for example, the email is unconfirmed.
         setMessage('Sign-in failed. Please check your credentials or confirm your email.');
      }
    } catch (error) {
      setMessage(`Sign-in error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles the staff sign-out process.
   * Uses Supabase's `signOut` method to log out the current user.
   * On successful sign-out, the user will be redirected to the login page.
   */
  const handleSignOut = async () => {
    setLoading(true);
    setMessage('');

    if (!supabase) {
        setMessage("Supabase client not initialized.");
        setLoading(false);
        return;
    }

    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
          throw error;
      }
      setMessage('You have been signed out. Redirecting to login...');
      // After sign-out, redirect back to the authentication page (current page '/')
      router.replace('/');
    } catch (error) {
      setMessage(`Sign-out error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // --- Staff Profile Management (Example) ---
  /**
   * Illustrative function to add a staff profile to a custom `staff_profiles` table.
   * In a real application, you would call this after a user signs up or if additional
   * staff-specific details are needed.
   * @param {string} userId The UUID of the Supabase user (from `session.user.id`).
   * @param {string} role The staff member's role.
   * @param {string} department The staff member's department.
   */
  const addStaffProfile = async (userId, role, department) => {
    if (!supabase) {
        setMessage("Supabase client not initialized. Cannot add staff profile.");
        return;
    }
    try {
      // Insert a new row into your 'staff_profiles' table.
      // The `user_id` links this custom profile to the Supabase authentication user.
      const { data, error } = await supabase
        .from('staff_profiles') // Replace with your actual table name if different
        .insert([{ user_id: userId, role, department }]);

      if (error) throw error;
      console.log('Staff profile added:', data);
      setMessage('Staff profile added successfully!');
    } catch (error) {
      console.error('Error adding staff profile:', error.message);
      setMessage(`Error adding staff profile: ${error.message}`);
    }
  };

  // Example useEffect hook: This demonstrates how you might conditionally add a staff profile
  // after a new user signs up or signs in, based on some criteria (e.g., a specific email).
  // In a production app, this logic would likely be more sophisticated (e.g., a dedicated form).
  useEffect(() => {
    // Only run if there's an active session and a specific condition is met (e.g., a new staff email).
    // Uncomment and modify this section if you need to automatically add profiles.
    // if (session?.user && session.user.email === 'newstaff@example.com') {
    //   addStaffProfile(session.user.id, 'Manager', 'Sales');
    // }
  }, [session]); // Rerun when the session object changes

  // --- Render Logic ---
  // If a session exists, this component will trigger a redirect.
  // Otherwise, it will render the authentication forms.
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
              Your Supabase User ID: <span className="font-mono bg-gray-100 p-1 rounded text-sm break-all">{session.user.id}</span>
            </p>
            <p className="text-gray-600 mb-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
              This ID can be used to link to your custom `staff_profiles` table.
            </p>

            {currentPage === 'dashboard' && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="text-lg font-medium text-blue-700 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>Staff Dashboard</h3>
                <p className="text-gray-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  This is where you would display staff-specific content,
                  fetched from your `staff_profiles` table based on the `user_id`.
                </p>
                <button
                  onClick={handleSignOut}
                  className="mt-6 w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200"
                  disabled={loading}
                  style={{ fontFamily: 'Poppins, sans-serif' }}
                >
                  {loading ? (
                    <Loader2 className="animate-spin mr-2" size={20} />
                  ) : (
                    LogIn && <LogOut className="mr-2" size={20} /> // Use LogOut icon for sign out
                  )}
                  Sign Out
                </button>
              </div>
            )}

            {/* Button to switch back to dashboard if currently on auth view while logged in */}
            {currentPage === 'auth' && (
              <button
                onClick={() => setCurrentPage('dashboard')}
                className="mt-6 w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                Go to Dashboard
              </button>
            )}

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

            <div className="text-center text-gray-500 mb-4">
              Or
            </div>

            {/* Sign-Up Button */}
            <button
              onClick={handleSignUp}
              className="w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
              style={{ fontFamily: 'Poppins, sans-serif' }}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="animate-spin mr-2" size={20} />
              ) : (
                UserPlus && <UserPlus className="mr-2" size={20} /> // Use UserPlus icon for sign up
              )}
              Sign Up
            </button>

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
