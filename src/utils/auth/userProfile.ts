
import { supabase } from '@/integrations/supabase/client';
import { UserRole, MOCK_DATA } from '../supabaseClient';

// Define User type locally to avoid circular references
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar_url: string;
  class?: string | null;
  batch?: string | null;
  board?: string | null;
}

// Define ProfileResponse type locally to avoid circular references
interface ProfileResponse {
  id: string;
  name: string;
  avatar_url?: string | null;
  role: string;
  class?: string | null;
  batch?: string | null;
  board?: string | null;
  created_at: string;
}

export async function fetchUserProfile(userId: string): Promise<User | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error || !data) {
      console.error('Error fetching user profile:', error);
      return null;
    }
    
    const profile = data as ProfileResponse;
    
    return {
      id: profile.id,
      email: '', // Email is not stored in profiles table
      name: profile.name,
      role: profile.role as UserRole, // Use type assertion to match UserRole enum
      avatar_url: profile.avatar_url || '',
      class: profile.class || null,
      batch: profile.batch || null,
      board: profile.board || null
    };
  } catch (error) {
    console.error('Error in fetchUserProfile:', error);
    return null;
  }
}

export function getDemoUser(email: string): User | null {
  // For demo purposes, return a mockup user based on email
  if (email === 'teacher@example.com') {
    return {
      id: 'demo-teacher-id',
      email: 'teacher@example.com',
      name: 'Demo Teacher',
      role: 'teacher',
      avatar_url: 'https://ui-avatars.com/api/?name=Demo+Teacher&background=random',
      class: null,
      batch: null,
      board: null
    };
  } else if (email === 'student@example.com') {
    return {
      id: 'demo-student-id',
      email: 'student@example.com',
      name: 'Demo Student',
      role: 'student',
      avatar_url: 'https://ui-avatars.com/api/?name=Demo+Student&background=random',
      class: '10',
      batch: 'A',
      board: 'CBSE'
    };
  }
  
  return null;
}

export function getRoleFromUser(user: any): 'teacher' | 'student' | null {
  if (!user) return null;
  
  // Check if role is in app_metadata
  if (user.app_metadata && user.app_metadata.role) {
    return user.app_metadata.role;
  }
  
  // Check if role is in user_metadata
  if (user.user_metadata && user.user_metadata.role) {
    return user.user_metadata.role;
  }
  
  // Check if role is directly on the user object (for demo users)
  if (user.role) {
    return user.role;
  }
  
  return null;
}
