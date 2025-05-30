
import { supabase } from '@/integrations/supabase/client';
import { MOCK_DATA } from '../supabaseClient';
import type { UserRole } from '../authUtils';
import { toast } from 'sonner';

// Define types locally to avoid circular references
export interface StudentRecord {
  id: string;
  name: string;
  role: UserRole;
  avatar_url?: string;
  class?: string | null;
  batch?: string | null;
  board?: string | null;
  register_number?: string | null;
}

// Define a properly typed function for validateStudentIds
export async function validateStudentIds(studentIds: string[]): Promise<string[]> {
  try {
    if (studentIds.length === 0) return [];
    
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

export async function fetchStudents(classId?: string, batch?: string): Promise<StudentRecord[]> {
  try {
    console.log('Fetching students with filters:', { classId, batch });
    
    // For demo/development mode, use mock data
    if (process.env.NODE_ENV === 'development') {
      console.log('Using mock student data');
      let filteredStudents = MOCK_DATA.users.filter(u => u.role === 'student');
      
      if (classId) {
        filteredStudents = filteredStudents.filter(s => s.class === classId);
      }
      
      if (batch) {
        filteredStudents = filteredStudents.filter(s => s.batch === batch);
      }
      
      return filteredStudents.map(u => ({
        id: u.id,
        name: u.name,
        role: 'student' as const,
        avatar_url: u.avatar_url,
        class: u.class,
        batch: u.batch,
        board: u.board
      }));
    }
    
    // For production mode, use Supabase
    let query = supabase
      .from('profiles')
      .select('*')
      .eq('role', 'student');
    
    // Apply filters if provided
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
    
    // Use explicit typing to avoid recursive type issues
    return (data || []).map((profile) => {
      const student: StudentRecord = {
        id: profile.id,
        name: profile.name || '',
        role: 'student',
        avatar_url: profile.avatar_url || '',
        // Handle potentially missing properties
        class: profile.class || null,
        batch: profile.batch || null,
        board: profile.board || null,
        register_number: profile.register_number || null
      };
      return student;
    });
  } catch (error) {
    console.error('Error fetching students:', error);
    return [];
  }
}

export async function fetchStudentsBySubject(subjectId: string): Promise<StudentRecord[]> {
  try {
    // Get the class ID for this subject
    const { data: subjectData, error: subjectError } = await supabase
      .from('subjects')
      .select('class_id')
      .eq('id', subjectId)
      .single();
    
    if (subjectError || !subjectData) {
      console.error('Error fetching subject:', subjectError);
      return [];
    }
    
    const classId = subjectData.class_id;
    
    // Now get all students in this class
    const { data: studentsData, error: studentsError } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'student')
      .eq('class', classId);
    
    if (studentsError) {
      console.error('Error fetching students:', studentsError);
      return [];
    }
    
    // Fix type issues by explicitly defining the return type
    return (studentsData || []).map((profile: any) => {
      const student: StudentRecord = {
        id: profile.id,
        name: profile.name || '',
        role: 'student',
        avatar_url: profile.avatar_url || '',
        // Handle potentially missing properties
        class: profile.class || null,
        batch: profile.batch || null,
        board: profile.board || null
      };
      return student;
    });
  } catch (error) {
    console.error('Error fetching students by subject:', error);
    return [];
  }
}

export function getMockStudents(): StudentRecord[] {
  return MOCK_DATA.users
    .filter(u => u.role === 'student')
    .map(u => ({
      id: u.id,
      name: u.name,
      role: 'student' as const,
      avatar_url: u.avatar_url,
      class: u.class,
      batch: u.batch,
      board: u.board
    }));
}

export function getMockStudentsBySubject(subjectId: string): StudentRecord[] {
  // Get the class for this subject
  const subject = MOCK_DATA.subjects.find(s => s.id === subjectId);
  if (!subject) return [];
  
  // Get all students in this class
  return MOCK_DATA.users
    .filter(u => u.role === 'student' && u.class === subject.class_id)
    .map(u => ({
      id: u.id,
      name: u.name,
      role: 'student' as const,
      avatar_url: u.avatar_url,
      class: u.class,
      batch: u.batch,
      board: u.board
    }));
}

// Add function to add a new student with email/password registration
export async function addNewStudent(student: {
  name: string;
  email: string;
  password: string;
  registerNumber: string;
  class: string;
  batch: string;
  board: string;
}): Promise<boolean> {
  try {
    console.log('Adding new student:', { ...student, password: '***' });
    
    // For demo mode, we'll log the details and return success
    if (process.env.NODE_ENV === 'development') {
      console.log('Would create student with auth:', {
        email: student.email,
        password: '[REDACTED]',
        name: student.name,
        role: 'student',
        class: student.class,
        batch: student.batch,
        board: student.board,
        register_number: student.registerNumber
      });
      
      // For demo mode, return true to simulate success
      toast.info('In production, this would create a real student account');
      return true;
    }
    
    // In production: Create a new user with Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email: student.email,
      password: student.password,
      options: {
        data: {
          name: student.name,
          role: 'student',
          class: student.class,
          batch: student.batch,
          board: student.board,
          register_number: student.registerNumber
        }
      }
    });
    
    if (error) {
      console.error('Error adding student with auth:', error);
      toast.error(error.message);
      return false;
    }
    
    // If successful and we have a user, add record to the students table
    if (data?.user) {
      // Use proper typing for the insert operation
      type StudentInsert = {
        id: string;
        name: string;
        email: string;
        register_number: string;
        class: string;
        batch: string;
        board: string;
      };
      
      const { error: insertError } = await supabase
        .from('students')
        .insert({
          id: data.user.id,
          name: student.name,
          email: student.email,
          register_number: student.registerNumber,
          class: student.class,
          batch: student.batch,
          board: student.board
        } as StudentInsert);
      
      if (insertError) {
        console.error('Error adding student to students table:', insertError);
        // We've created the auth entry but failed to add to students table
        return false;
      }
    }
    
    console.log('Successfully created student with auth');
    return true;
  } catch (error) {
    console.error('Error adding student:', error);
    return false;
  }
}
