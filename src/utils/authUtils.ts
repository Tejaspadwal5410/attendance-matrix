
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
export { 
  fetchStudents, 
  fetchStudentsBySubject, 
  getMockStudents, 
  getMockStudentsBySubject, 
  addNewStudent,
  validateStudentIds 
} from './auth/students';
export { fetchClasses } from './auth/classes';
export { fetchUserProfile, getDemoUser, getRoleFromUser } from './auth/userProfile';
