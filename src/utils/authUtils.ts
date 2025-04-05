
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

// Use proper type exports to avoid isolatedModules error
export type { AttendanceStatus, AttendanceRecord } from './auth/attendance';
export type { StudentRecord } from './auth/students';
export type { BoardOption, BatchOption } from './auth/education';

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
export { fetchBoards, fetchBatches, getMockBoards, getMockBatches } from './auth/education';
