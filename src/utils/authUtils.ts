
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

// New function to fetch students from the database
export async function fetchStudents(): Promise<User[]> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'student');
    
    if (error) {
      console.error('Error fetching students:', error);
      return [];
    }
    
    // Map the profile data to User type
    return data.map(profile => ({
      id: profile.id,
      email: '', // Email not stored in profiles table
      name: profile.name,
      role: profile.role as UserRole,
      avatar_url: profile.avatar_url
    }));
  } catch (error) {
    console.error('Error fetching students:', error);
    return [];
  }
}

// New function to fetch classes from the database
export async function fetchClasses(): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('classes')
      .select('*');
    
    if (error) {
      console.error('Error fetching classes:', error);
      return [];
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching classes:', error);
    return [];
  }
}

// New function to save attendance records to the database
export async function saveAttendanceRecords(
  attendanceData: Record<string, 'present' | 'absent'>, 
  date: string, 
  classId: string
): Promise<boolean> {
  try {
    // First, create an array of attendance records from the data
    const records = Object.entries(attendanceData).map(([studentId, status]) => ({
      student_id: studentId,
      class_id: classId,
      date,
      status
    }));
    
    // Insert the records into the database
    const { error } = await supabase
      .from('attendance')
      .upsert(records, { 
        onConflict: 'student_id,class_id,date',
        ignoreDuplicates: false 
      });
    
    if (error) {
      console.error('Error saving attendance records:', error);
      toast.error('Failed to save attendance records');
      return false;
    }
    
    toast.success('Attendance records saved successfully');
    return true;
  } catch (error) {
    console.error('Error saving attendance records:', error);
    toast.error('An unexpected error occurred');
    return false;
  }
}

// New function to fetch attendance records for a specific date and class
export async function fetchAttendanceRecords(date: string, classId: string): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('attendance')
      .select('*')
      .eq('date', date)
      .eq('class_id', classId);
    
    if (error) {
      console.error('Error fetching attendance records:', error);
      return [];
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching attendance records:', error);
    return [];
  }
}
