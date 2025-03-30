
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

  useEffect(() => {
    const checkSession = async () => {
      try {
        setLoading(true);
        
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          const profileData = await fetchUserProfile(session.user.id);
          if (profileData) {
            setUser(profileData);
          } else {
            setUser(null);
          }
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

    return () => {
      subscription.unsubscribe();
    };
  }, [isDemoAccount]);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      if ((email === 'teacher@example.com' || email === 'student@example.com') && password === 'password') {
        const demoUser = getDemoUser(email);
        if (demoUser) {
          setUser(demoUser);
          setIsDemoAccount(true);
          toast.success(`${demoUser.role} demo account logged in successfully`);
          return { error: null };
        }
      }
      
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        console.error('Login error details:', error);
        toast.error(error.message || 'Login failed');
        return { error: error as unknown as Error };
      } else {
        toast.success('Logged in successfully');
        setIsDemoAccount(false);
        return { error: null };
      }
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || 'Login failed');
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name: string, role: UserRole, avatarUrl?: string) => {
    try {
      setLoading(true);
      
      const finalAvatarUrl = avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;
      
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
        return { error: error as unknown as Error };
      }
      
      if (data && data.user) {
        toast.success('Registration successful! Please check your email to verify your account.');
        return { error: null };
      } else {
        const customError = new Error('Registration failed - no user data returned');
        toast.error('Something went wrong during registration.');
        return { error: customError };
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      toast.error(error.message || 'Registration failed');
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      
      if (isDemoAccount) {
        setUser(null);
        setIsDemoAccount(false);
        toast.info('Logged out successfully');
        return { error: null };
      }
      
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Logout error details:', error);
        toast.error(error.message || 'Logout failed');
        return { error: error as unknown as Error };
      } else {
        setUser(null);
        toast.info('Logged out successfully');
        return { error: null };
      }
    } catch (error: any) {
      console.error('Logout error:', error);
      toast.error(error.message || 'Logout failed');
      return { error };
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
