
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

// Use types from the module files
import { AttendanceStatus, AttendanceRecord } from './auth/attendance';
export { AttendanceStatus, AttendanceRecord };

import { StudentRecord } from './auth/students';
export { StudentRecord };

// Export selective utilities with explicit imports
export { 
  fetchAttendanceRecords, 
  saveAttendanceRecords, 
  getMockAttendance, 
  saveMockAttendance 
} from './auth/attendance';

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
