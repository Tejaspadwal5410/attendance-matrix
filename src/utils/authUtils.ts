
// Export explicit types to avoid circular references
export type UserRole = 'teacher' | 'student';

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

export interface Attendance {
  id: string;
  student_id: string;
  class_id: string;
  date: string;
  status: 'present' | 'absent';
  batch?: string | null;
}

// Define isolated types for functions to avoid circular dependencies
export type StudentRecord = {
  id: string;
  name: string;
  role: UserRole;
  avatar_url?: string;
  class?: string | null;
  batch?: string | null;
  board?: string | null;
};

export type AttendanceRecord = {
  id: string;
  student_id: string;
  class_id: string;
  date: string;
  status: 'present' | 'absent';
  batch?: string | null;
};

// Export selective utilities with explicit imports
export { fetchAttendanceRecords, saveAttendanceRecords, getMockAttendance, saveMockAttendance } from './auth/attendance';
export { fetchStudents, fetchStudentsBySubject, validateStudentIds, getMockStudents, getMockStudentsBySubject, addNewStudent } from './auth/students';
export { fetchClasses } from './auth/classes';
export { fetchUserProfile, getDemoUser, getRoleFromUser } from './auth/userProfile';

// Function to validate student IDs moved here to avoid circular references
export async function validateStudentIds(studentIds: string[]): Promise<string[]> {
  try {
    if (studentIds.length === 0) return [];
    
    // Import MOCK_DATA directly to avoid circular references
    const { MOCK_DATA } = await import('./supabaseClient');
    
    // For mock mode, return all student IDs in the mock data that match
    const mockStudentIds = MOCK_DATA.users
      .filter(u => u.role === 'student')
      .map(u => u.id);
    
    return studentIds.filter(id => mockStudentIds.includes(id));
    
    // In a real app, we would query the database here
  } catch (error) {
    console.error('Error in validateStudentIds:', error);
    return [];
  }
}
