
import { supabase } from '@/integrations/supabase/client';
import { User, UserRole, MOCK_DATA } from '../supabaseClient';
import { toast } from 'sonner';

export async function fetchUserProfile(userId: string): Promise<User | null> {
  try {
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (profileError || !profileData) {
      console.error('Error fetching user profile:', profileError);
      return null;
    } 

    // Since email is not in the profiles table, we need to get it from the session
    const { data: { session } } = await supabase.auth.getSession();
    const email = session?.user?.email || '';

    return {
      id: userId,
      email: email,
      name: profileData.name,
      role: profileData.role as UserRole,
      avatar_url: profileData.avatar_url || '',
      class: profileData.class || null,
      batch: profileData.batch || null,
      board: profileData.board || null
    };
  } catch (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
}

export function getDemoUser(email: string): User | null {
  if (email === 'teacher@example.com') {
    return MOCK_DATA.users.find(u => u.role === 'teacher') || null;
  } else if (email === 'student@example.com') {
    return MOCK_DATA.users.find(u => u.role === 'student') || null;
  }
  return null;
}

export function getRoleFromUser(user: User | null): {
  isTeacher: boolean;
  isStudent: boolean;
} {
  return {
    isTeacher: user?.role === 'teacher',
    isStudent: user?.role === 'student'
  };
}
