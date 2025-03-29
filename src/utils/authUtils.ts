
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

// Function to fetch students from the database
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

// Function to fetch classes from the database
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

// Function to save attendance records to the database
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

// Function to fetch attendance records for a specific date and class
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

// New function to save marks to the database
export async function saveMarks(
  studentId: string,
  subjectId: string,
  marks: number,
  examType: 'midterm' | 'final' | 'assignment' | 'quiz'
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('marks')
      .upsert(
        {
          student_id: studentId,
          subject_id: subjectId,
          marks,
          exam_type: examType
        },
        {
          onConflict: 'student_id,subject_id,exam_type',
          ignoreDuplicates: false
        }
      );

    if (error) {
      console.error('Error saving marks:', error);
      toast.error('Failed to save marks');
      return false;
    }

    toast.success('Marks saved successfully');
    return true;
  } catch (error) {
    console.error('Error saving marks:', error);
    toast.error('An unexpected error occurred');
    return false;
  }
}

// Function to fetch marks for a specific student and subject
export async function fetchStudentMarks(studentId: string, subjectId?: string): Promise<any[]> {
  try {
    let query = supabase
      .from('marks')
      .select('*, subjects(name)')
      .eq('student_id', studentId);
    
    if (subjectId) {
      query = query.eq('subject_id', subjectId);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching student marks:', error);
      return [];
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching student marks:', error);
    return [];
  }
}

// Function to fetch subjects for a class
export async function fetchSubjectsForClass(classId: string): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('subjects')
      .select('*')
      .eq('class_id', classId);
    
    if (error) {
      console.error('Error fetching subjects:', error);
      return [];
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching subjects:', error);
    return [];
  }
}

// Function to submit a leave request
export async function submitLeaveRequest(
  studentId: string,
  date: string,
  reason: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('leave_requests')
      .insert({
        student_id: studentId,
        date,
        reason,
        status: 'pending'
      });
    
    if (error) {
      console.error('Error submitting leave request:', error);
      toast.error('Failed to submit leave request');
      return false;
    }
    
    toast.success('Leave request submitted successfully');
    return true;
  } catch (error) {
    console.error('Error submitting leave request:', error);
    toast.error('An unexpected error occurred');
    return false;
  }
}

// Function to update the status of a leave request
export async function updateLeaveRequestStatus(
  requestId: string,
  status: 'approved' | 'rejected'
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('leave_requests')
      .update({ status })
      .eq('id', requestId);
    
    if (error) {
      console.error('Error updating leave request:', error);
      toast.error('Failed to update leave request');
      return false;
    }
    
    toast.success(`Leave request ${status} successfully`);
    return true;
  } catch (error) {
    console.error('Error updating leave request:', error);
    toast.error('An unexpected error occurred');
    return false;
  }
}

// Function to fetch leave requests for a student
export async function fetchStudentLeaveRequests(studentId: string): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('leave_requests')
      .select('*')
      .eq('student_id', studentId);
    
    if (error) {
      console.error('Error fetching student leave requests:', error);
      return [];
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching student leave requests:', error);
    return [];
  }
}

// Function to fetch all leave requests for a teacher
export async function fetchAllLeaveRequests(): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('leave_requests')
      .select('*, profiles(name)')
      .order('date', { ascending: false });
    
    if (error) {
      console.error('Error fetching leave requests:', error);
      return [];
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching leave requests:', error);
    return [];
  }
}
