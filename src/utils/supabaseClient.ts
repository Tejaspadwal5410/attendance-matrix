
import { createClient } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

// Use the Supabase client from the integration
export { supabase } from '@/integrations/supabase/client';

// User types that match our database schema
export type UserRole = 'teacher' | 'student';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar_url?: string;
}

export interface Subject {
  id: string;
  name: string;
  class_id: string;
  teacher_id: string;
}

export interface Class {
  id: string;
  name: string;
  teacher_id: string;
}

export interface Attendance {
  id: string;
  student_id: string;
  class_id: string;
  date: string;
  status: 'present' | 'absent';
}

export interface Mark {
  id: string;
  student_id: string;
  subject_id: string;
  marks: number;
  exam_type: 'midterm' | 'final' | 'assignment' | 'quiz';
}

export interface LeaveRequest {
  id: string;
  student_id: string;
  date: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
}

// Enhanced mock data for development
export const MOCK_DATA = {
  users: [
    {
      id: '1',
      email: 'student@example.com',
      name: 'John Doe',
      role: 'student' as UserRole,
      avatar_url: 'https://i.pravatar.cc/150?img=1'
    },
    {
      id: '2',
      email: 'teacher@example.com',
      name: 'Jane Smith',
      role: 'teacher' as UserRole,
      avatar_url: 'https://i.pravatar.cc/150?img=2'
    }
  ],
  classes: [
    { id: '1', name: 'Class 10A', teacher_id: '2' },
    { id: '2', name: 'Class 11B', teacher_id: '2' }
  ],
  subjects: [
    { id: '1', name: 'Mathematics', class_id: '1', teacher_id: '2' },
    { id: '2', name: 'Physics', class_id: '1', teacher_id: '2' },
    { id: '3', name: 'Chemistry', class_id: '1', teacher_id: '2' },
    { id: '4', name: 'Biology', class_id: '2', teacher_id: '2' }
  ],
  attendance: [
    { id: '1', student_id: '1', class_id: '1', date: '2023-06-01', status: 'present' as const },
    { id: '2', student_id: '1', class_id: '1', date: '2023-06-02', status: 'present' as const },
    { id: '3', student_id: '1', class_id: '1', date: '2023-06-03', status: 'absent' as const },
    { id: '4', student_id: '1', class_id: '1', date: '2023-06-04', status: 'present' as const },
    { id: '5', student_id: '1', class_id: '1', date: '2023-06-05', status: 'present' as const },
    { id: '6', student_id: '1', class_id: '2', date: '2023-06-06', status: 'present' as const },
    { id: '7', student_id: '1', class_id: '2', date: '2023-06-07', status: 'absent' as const },
    { id: '8', student_id: '1', class_id: '2', date: '2023-06-08', status: 'present' as const }
  ],
  marks: [
    { id: '1', student_id: '1', subject_id: '1', marks: 85, exam_type: 'midterm' as const },
    { id: '2', student_id: '1', subject_id: '2', marks: 78, exam_type: 'midterm' as const },
    { id: '3', student_id: '1', subject_id: '3', marks: 92, exam_type: 'midterm' as const },
    { id: '4', student_id: '1', subject_id: '1', marks: 79, exam_type: 'final' as const },
    { id: '5', student_id: '1', subject_id: '2', marks: 81, exam_type: 'final' as const },
    { id: '6', student_id: '1', subject_id: '3', marks: 88, exam_type: 'final' as const },
    { id: '7', student_id: '1', subject_id: '4', marks: 75, exam_type: 'midterm' as const },
    { id: '8', student_id: '1', subject_id: '4', marks: 82, exam_type: 'final' as const }
  ],
  leaveRequests: [
    { 
      id: '1', 
      student_id: '1', 
      date: '2023-06-10', 
      reason: 'Medical leave due to fever', 
      status: 'approved' as const 
    },
    { 
      id: '2', 
      student_id: '1', 
      date: '2023-06-15', 
      reason: 'Family function', 
      status: 'pending' as const 
    },
    { 
      id: '3', 
      student_id: '1', 
      date: '2023-06-20', 
      reason: 'Doctor appointment', 
      status: 'pending' as const 
    },
    { 
      id: '4', 
      student_id: '1', 
      date: '2023-06-25', 
      reason: 'Religious ceremony', 
      status: 'rejected' as const 
    }
  ]
};
