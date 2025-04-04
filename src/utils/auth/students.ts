
import { supabase } from '@/integrations/supabase/client';
import { User, UserRole } from '../authUtils';

// Import MOCK_DATA directly to avoid circular references
import { MOCK_DATA } from '../supabaseClient';

export async function validateStudentIds(studentIds: string[]): Promise<string[]> {
  try {
    if (studentIds.length === 0) return [];
    
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('role', 'student')
      .in('id', studentIds);
    
    if (error) {
      console.error('Error validating student IDs:', error);
      return [];
    }
    
    // Return array of valid student IDs
    return data.map(profile => profile.id);
  } catch (error) {
    console.error('Error in validateStudentIds:', error);
    return [];
  }
}

export async function fetchStudents(classId?: string, batch?: string): Promise<User[]> {
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
    
    // Use explicit type assertions to avoid recursion
    return (data || []).map((record: any) => ({
      id: record.id,
      email: '', // Email is not stored in profiles table
      name: record.name,
      role: record.role as UserRole,
      avatar_url: record.avatar_url || '',
      class: record.class || null,
      batch: record.batch || null,
      board: record.board || null
    }));
  } catch (error) {
    console.error('Error fetching students:', error);
    return [];
  }
}

export async function fetchStudentsBySubject(subjectId: string): Promise<User[]> {
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
    
    // Use explicit type assertions to avoid recursion
    return (studentsData || []).map((record: any) => ({
      id: record.id,
      email: '', // Email is not stored in profiles table
      name: record.name,
      role: 'student' as UserRole,
      avatar_url: record.avatar_url || '',
      class: record.class || null,
      batch: record.batch || null,
      board: record.board || null
    }));
  } catch (error) {
    console.error('Error fetching students by subject:', error);
    return [];
  }
}

export function getMockStudents(): User[] {
  return MOCK_DATA.users.filter(u => u.role === 'student');
}

export function getMockStudentsBySubject(subjectId: string): User[] {
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
