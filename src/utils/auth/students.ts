
import { supabase } from '@/integrations/supabase/client';
import { User, MOCK_DATA } from '../supabaseClient';

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
    
    // Transform data to match User type
    const students: User[] = data.map(profile => {
      return {
        id: profile.id,
        email: '', // Email is not stored in profiles table
        name: profile.name,
        role: 'student',
        avatar_url: profile.avatar_url || '',
        class: profile.class || null,
        batch: profile.batch || null,
        board: profile.board || null
      };
    });
    
    return students;
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
    
    // Transform data to match User type
    const students: User[] = studentsData.map(profile => {
      return {
        id: profile.id,
        email: '', // Email is not stored in profiles table
        name: profile.name,
        role: 'student',
        avatar_url: profile.avatar_url || '',
        class: profile.class || null,
        batch: profile.batch || null,
        board: profile.board || null
      };
    });
    
    return students;
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
