import { createClient } from '@supabase/supabase-js';

// Use placeholder values that are valid URL format for development
// Replace these with your actual Supabase credentials when ready
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

// Initialize Supabase client with a valid URL and key format
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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

// Mock data for development until Supabase is set up
export const MOCK_DATA = {
  currentUser: {
    id: '1',
    email: 'user@example.com',
    name: 'John Doe',
    role: 'student' as UserRole,
    avatar_url: 'https://i.pravatar.cc/150?img=1'
  },
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
    { id: '5', student_id: '1', class_id: '1', date: '2023-06-05', status: 'present' as const }
  ],
  marks: [
    { id: '1', student_id: '1', subject_id: '1', marks: 85, exam_type: 'midterm' as const },
    { id: '2', student_id: '1', subject_id: '2', marks: 78, exam_type: 'midterm' as const },
    { id: '3', student_id: '1', subject_id: '3', marks: 92, exam_type: 'midterm' as const },
    { id: '4', student_id: '1', subject_id: '1', marks: 79, exam_type: 'final' as const },
    { id: '5', student_id: '1', subject_id: '2', marks: 81, exam_type: 'final' as const },
    { id: '6', student_id: '1', subject_id: '3', marks: 88, exam_type: 'final' as const }
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
    }
  ]
};
