
// Export selective utilities with aliases to avoid circular references
export { fetchAttendanceRecords, saveAttendanceRecords, getMockAttendance, saveMockAttendance } from './auth/attendance';
export { fetchStudents, fetchStudentsBySubject, validateStudentIds, getMockStudents, getMockStudentsBySubject, addNewStudent } from './auth/students';
export { fetchClasses } from './auth/classes';
export { fetchUserProfile, getDemoUser, getRoleFromUser } from './auth/userProfile';

// Export type definitions
export type { Attendance } from './auth/attendance';
export type { User, UserRole } from './auth/students';
