
import React, { createContext, useState, useEffect } from 'react';
import { supabase, User, UserRole, MOCK_DATA } from '../utils/supabaseClient';
import { toast } from 'sonner';
import { AuthContextType } from '../types/auth';
import { fetchUserProfile, getDemoUser, getRoleFromUser } from '../utils/authUtils';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemoAccount, setIsDemoAccount] = useState(false);

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        setLoading(true);
        
        // Check if there's an active session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          const profileData = await fetchUserProfile(session.user.id);
          setUser(profileData);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Session check error:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    // Setup auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session) {
          const profileData = await fetchUserProfile(session.user.id);
          if (profileData) {
            setUser(profileData);
            setIsDemoAccount(false);
          } else {
            setUser(null);
          }
        } else if (!isDemoAccount) {
          setUser(null);
        }
        setLoading(false);
      }
    );

    checkSession();

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [isDemoAccount]);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      // Handle demo accounts with exact matching for both email and password
      if ((email === 'teacher@example.com' || email === 'student@example.com') && password === 'password') {
        const demoUser = getDemoUser(email);
        if (demoUser) {
          setUser(demoUser);
          setIsDemoAccount(true);
          toast.success(`${demoUser.role} demo account logged in successfully`);
          return;
        }
      }
      
      // Regular Supabase auth for non-demo accounts
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        console.error('Login error details:', error);
        toast.error(error.message || 'Login failed');
        throw error; // Re-throw to allow handling in the component
      } else {
        toast.success('Logged in successfully');
        setIsDemoAccount(false);
      }
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || 'Login failed');
      throw error; // Re-throw to allow handling in the component
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name: string, role: UserRole, avatarUrl?: string) => {
    try {
      setLoading(true);
      
      // Generate avatar URL if not provided
      const finalAvatarUrl = avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;
      
      // Register with Supabase, including metadata for profiles table
      const { error, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role,
            avatar_url: finalAvatarUrl
          }
        }
      });
      
      if (error) {
        console.error('Signup error details:', error);
        toast.error(error.message || 'Registration failed');
        throw error; // Re-throw to allow handling in the component
      }
      
      if (data && data.user) {
        toast.success('Registration successful! Please check your email to verify your account.');
      } else {
        toast.error('Something went wrong during registration.');
        throw new Error('Registration failed - no user data returned');
      }
      
      return;
    } catch (error: any) {
      console.error('Signup error:', error);
      toast.error(error.message || 'Registration failed');
      throw error; // Re-throw to allow handling in the component
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      
      // If it's a demo account, just clear the user state
      if (isDemoAccount) {
        setUser(null);
        setIsDemoAccount(false);
        toast.info('Logged out successfully');
        return;
      }
      
      // Regular Supabase signout for non-demo accounts
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Logout error details:', error);
        toast.error(error.message || 'Logout failed');
        throw error;
      } else {
        setUser(null);
        toast.info('Logged out successfully');
      }
    } catch (error: any) {
      console.error('Logout error:', error);
      toast.error(error.message || 'Logout failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const isTeacher = () => user?.role === 'teacher';
  const isStudent = () => user?.role === 'student';
  const isDemoUser = () => isDemoAccount;

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      signIn, 
      signOut, 
      signUp, 
      isTeacher, 
      isStudent, 
      isDemoUser 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export { useAuth } from '../hooks/useAuth';
