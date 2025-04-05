
import { supabase } from '@/integrations/supabase/client';
import { UserRole, StudentRecord } from '../authUtils';

// Import MOCK_DATA directly to avoid circular references
import { MOCK_DATA } from '../supabaseClient';

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

export async function fetchStudents(classId?: string, batch?: string) {
  try {
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
    
    // Fix type issues by explicitly defining the return type
    return (data || []).map((profile) => {
      const student: StudentRecord = {
        id: profile.id,
        name: profile.name,
        role: profile.role as UserRole,
        avatar_url: profile.avatar_url || '',
        // Provide default values for potentially missing properties
        class: 'class' in profile ? profile.class : null,
        batch: 'batch' in profile ? profile.batch : null,
        board: 'board' in profile ? profile.board : null
      };
      return student;
    });
  } catch (error) {
    console.error('Error fetching students:', error);
    return [];
  }
}

export async function fetchStudentsBySubject(subjectId: string) {
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
    return (studentsData || []).map((profile) => {
      const student: StudentRecord = {
        id: profile.id,
        name: profile.name,
        role: 'student' as UserRole,
        avatar_url: profile.avatar_url || '',
        // Provide default values for potentially missing properties
        class: 'class' in profile ? profile.class : null,
        batch: 'batch' in profile ? profile.batch : null,
        board: 'board' in profile ? profile.board : null
      };
      return student;
    });
  } catch (error) {
    console.error('Error fetching students by subject:', error);
    return [];
  }
}

export function getMockStudents() {
  return MOCK_DATA.users.filter(u => u.role === 'student');
}

export function getMockStudentsBySubject(subjectId: string) {
  // Get the class for this subject
  const subject = MOCK_DATA.subjects.find(s => s.id === subjectId);
  if (!subject) return [];
  
  // Get all students in this class
  return MOCK_DATA.users.filter(u => 
    u.role === 'student' && u.class === subject.class_id
  );
}

// Add function to add a new student
export async function addNewStudent(student: {
  registerNumber: string;
  name: string;
  class: string;
  batch: string;
  board: string;
}): Promise<boolean> {
  try {
    // In a real app, we would create a user in auth and then add to profiles
    // For demo purposes, we'll just show a success
    console.log('Would add student:', student);
    
    // For demo mode, return true to simulate success
    return true;
  } catch (error) {
    console.error('Error adding student:', error);
    return false;
  }
}
