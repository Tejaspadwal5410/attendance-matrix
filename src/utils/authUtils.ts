
import { supabase, User, UserRole, MOCK_DATA } from '../utils/supabaseClient';
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
    // or just leave it empty as it's not displayed in the UI
    const { data: { session } } = await supabase.auth.getSession();
    const email = session?.user?.email || '';

    return {
      id: userId,
      email: email,
      name: profileData.name,
      role: profileData.role as UserRole,
      avatar_url: profileData.avatar_url
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
