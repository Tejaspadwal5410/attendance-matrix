
export * from './attendance';
export * from './classes';
// Explicitly re-export with an alias to avoid conflict
export { 
  fetchStudents, 
  fetchStudentsBySubject, 
  validateStudentIds, 
  getMockStudents, 
  getMockStudentsBySubject,
  addNewStudent,
  type User as StudentUser,
  type UserRole as StudentUserRole
} from './students';
export {
  fetchUserProfile,
  getDemoUser,
  getRoleFromUser,
  type User as ProfileUser,
  type UserRole as ProfileUserRole
} from './userProfile';

