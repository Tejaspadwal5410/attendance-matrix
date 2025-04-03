
import { supabase } from '@/integrations/supabase/client';
import { User, UserRole, MOCK_DATA } from '../utils/supabaseClient';
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

export async function fetchStudents(classId?: string, batch?: string): Promise<User[]> {
  try {
    // For demo account, return filtered mock data
    if (MOCK_DATA.users.filter(u => u.role === 'student').length > 0) {
      let filteredStudents = MOCK_DATA.users.filter(u => u.role === 'student');
      
      if (classId) {
        filteredStudents = filteredStudents.filter(s => s.class === classId);
      }
      
      if (batch) {
        filteredStudents = filteredStudents.filter(s => s.batch === batch);
      }
      
      return filteredStudents;
    }
    
    // For real data, query the database
    let query = supabase
      .from('profiles')
      .select('*')
      .eq('role', 'student');
    
    if (classId) {
      query = query.eq('class', classId);
    }
    
    if (batch) {
      query = query.eq('batch', batch);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching students:', error);
      return [];
    }
    
    // Map the profile data to User type, ensuring avatar_url is never null
    return data.map(profile => ({
      id: profile.id,
      email: '', // Email not stored in profiles table
      name: profile.name,
      role: profile.role as UserRole,
      avatar_url: profile.avatar_url || '',
      class: profile.class || null,
      batch: profile.batch || null,
      board: profile.board || null
    }));
  } catch (error) {
    console.error('Error fetching students:', error);
    return [];
  }
}

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

export async function saveAttendanceRecords(
  attendanceData: Record<string, 'present' | 'absent'>, 
  date: string, 
  classId: string,
  batch?: string
): Promise<boolean> {
  try {
    // First, create an array of attendance records from the data
    const records = Object.entries(attendanceData).map(([studentId, status]) => ({
      student_id: studentId,
      class_id: classId,
      date,
      status,
      batch
    }));
    
    if (records.length === 0) {
      toast.error('No attendance records to save');
      return false;
    }
    
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

export async function fetchAttendanceRecords(date: string, classId: string, batch?: string): Promise<any[]> {
  try {
    let query = supabase
      .from('attendance')
      .select('*')
      .eq('date', date)
      .eq('class_id', classId);
      
    if (batch) {
      query = query.eq('batch', batch);
    }
    
    const { data, error } = await query;
    
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

export async function fetchStudentsCount(): Promise<number> {
  try {
    // If using a demo account, return mock data length
    if (MOCK_DATA.users.filter(u => u.role === 'student').length > 0) {
      return MOCK_DATA.users.filter(u => u.role === 'student').length;
    }

    const { count, error } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'student');
    
    if (error) {
      console.error('Error fetching students count:', error);
      toast.error('Failed to fetch student count');
      return 0;
    }
    
    return count || 0;
  } catch (error) {
    console.error('Error fetching students count:', error);
    toast.error('An unexpected error occurred');
    return 0;
  }
}

export async function fetchStudentsBySubject(subjectId: string): Promise<User[]> {
  try {
    // If using mock data
    if (MOCK_DATA.users.filter(u => u.role === 'student').length > 0) {
      // For mock data, just return all students
      return MOCK_DATA.users.filter(u => u.role === 'student');
    }

    // For real data, we need to query students related to the subject
    // This could be through class enrollment or another relationship
    // For now, we'll fetch all students as a fallback
    const { data: students, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'student');
    
    if (error) {
      console.error('Error fetching students by subject:', error);
      return [];
    }
    
    return students.map(student => ({
      id: student.id,
      email: '',
      name: student.name,
      role: student.role as UserRole,
      avatar_url: student.avatar_url || '', // Handle null values by converting to empty string
      class: student.class || null,
      batch: student.batch || null,
      board: student.board || null
    }));
  } catch (error) {
    console.error('Error fetching students by subject:', error);
    return [];
  }
}

export async function validateStudentIds(studentIds: string[]): Promise<string[]> {
  try {
    // For mock data
    if (MOCK_DATA.users.filter(u => u.role === 'student').length > 0) {
      const mockStudentIds = MOCK_DATA.users
        .filter(u => u.role === 'student')
        .map(s => s.id);
      
      return studentIds.filter(id => mockStudentIds.includes(id));
    }

    // For real database, validate student IDs exist in profiles table
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('role', 'student')
      .in('id', studentIds);
    
    if (error) {
      console.error('Error validating student IDs:', error);
      return [];
    }
    
    return data.map(s => s.id);
  } catch (error) {
    console.error('Error validating student IDs:', error);
    return [];
  }
}

export async function addNewStudent(studentData: {
  name: string,
  registerNumber: string,
  class: string,
  batch: string,
  board: string
}): Promise<boolean> {
  try {
    // For demo purposes
    if (MOCK_DATA.users.filter(u => u.role === 'student').length > 0) {
      // Just simulate adding to mock data
      toast.success('Student added successfully (Demo Mode)');
      return true;
    }

    // For real database
    const { error } = await supabase
      .from('profiles')
      .insert({
        id: studentData.registerNumber, // Using register number as ID
        name: studentData.name,
        role: 'student',
        class: studentData.class,
        batch: studentData.batch,
        board: studentData.board,
        avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(studentData.name)}&background=random`
      });
    
    if (error) {
      console.error('Error adding student:', error);
      toast.error('Failed to add student');
      return false;
    }
    
    toast.success('Student added successfully');
    return true;
  } catch (error) {
    console.error('Error adding student:', error);
    toast.error('An unexpected error occurred');
    return false;
  }
}
