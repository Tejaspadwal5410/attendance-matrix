
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, User, UserRole, MOCK_DATA } from '../utils/supabaseClient';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signUp: (email: string, password: string, name: string, role: UserRole, avatarUrl?: string) => Promise<void>;
  isTeacher: () => boolean;
  isStudent: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        setLoading(true);
        
        // Check if there's an active session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          // Get user profile data from our profiles table
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          if (profileError || !profileData) {
            console.error('Error fetching user profile:', profileError);
            setUser(null);
          } else {
            setUser({
              id: session.user.id,
              email: session.user.email || '',
              name: profileData.name,
              role: profileData.role as UserRole,
              avatar_url: profileData.avatar_url
            });
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

    // Setup auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session) {
          // Get user profile data from our profiles table
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          if (!profileError && profileData) {
            setUser({
              id: session.user.id,
              email: session.user.email || '',
              name: profileData.name,
              role: profileData.role as UserRole,
              avatar_url: profileData.avatar_url
            });
          }
        } else {
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
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      // For demo, we'll simulate based on the email (you can remove this when ready for real auth)
      if (process.env.NODE_ENV === 'development' && 
          ((email === 'teacher@example.com' && password === 'password') || 
           (email === 'student@example.com' && password === 'password'))) {
        
        const mockUser = email === 'teacher@example.com' 
          ? MOCK_DATA.users.find(u => u.role === 'teacher')
          : MOCK_DATA.users.find(u => u.role === 'student');
          
        if (mockUser) {
          setUser(mockUser);
          toast.success(`${mockUser.role.charAt(0).toUpperCase() + mockUser.role.slice(1)} logged in successfully`);
          return;
        }
      }
      
      // Actual Supabase auth
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) throw error;
      toast.success('Logged in successfully');
    } catch (error: any) {
      toast.error(error.message || 'Login failed');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name: string, role: UserRole, avatarUrl?: string) => {
    try {
      setLoading(true);
      
      // Register with Supabase, including metadata for profiles table
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role,
            avatar_url: avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`
          }
        }
      });
      
      if (error) throw error;
      toast.success('Registration successful! Please check your email to verify your account.');
    } catch (error: any) {
      toast.error(error.message || 'Registration failed');
      console.error('Signup error:', error);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      toast.info('Logged out successfully');
    } catch (error: any) {
      toast.error(error.message || 'Logout failed');
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
    }
  };

  const isTeacher = () => user?.role === 'teacher';
  const isStudent = () => user?.role === 'student';

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut, signUp, isTeacher, isStudent }}>
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
