
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, User, UserRole, MOCK_DATA } from '../utils/supabaseClient';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  isTeacher: () => boolean;
  isStudent: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // For demo purposes, simulate auth with mock data
    // In a real app, we would use Supabase auth here
    setTimeout(() => {
      setUser(null); // Start with logged out state
      setLoading(false);
    }, 1000);
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      // In a real app, we would use Supabase auth here
      // const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      // if (error) throw error;
      
      // For demo, we'll simulate based on the email
      if (email === 'teacher@example.com' && password === 'password') {
        const teacher = MOCK_DATA.users.find(u => u.role === 'teacher');
        if (teacher) {
          setUser(teacher);
          toast.success('Teacher logged in successfully');
        }
      } else if (email === 'student@example.com' && password === 'password') {
        const student = MOCK_DATA.users.find(u => u.role === 'student');
        if (student) {
          setUser(student);
          toast.success('Student logged in successfully');
        }
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (error) {
      toast.error('Login failed');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      // In a real app: await supabase.auth.signOut();
      setUser(null);
      toast.info('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
    }
  };

  const isTeacher = () => user?.role === 'teacher';
  const isStudent = () => user?.role === 'student';

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut, isTeacher, isStudent }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
