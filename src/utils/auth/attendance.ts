
import { supabase } from '@/integrations/supabase/client';
import { MOCK_DATA } from '../supabaseClient';
import { toast } from 'sonner';

// Define Attendance type locally to break circular references
export interface Attendance {
  id: string;
  student_id: string;
  class_id: string;
  date: string;
  status: 'present' | 'absent';
  batch?: string | null;
}

export async function fetchAttendanceRecords(
  date: string,
  classId: string, 
  batch?: string
): Promise<Attendance[]> {
  try {
    let query = supabase
      .from('attendance')
      .select('*')
      .eq('date', date)
      .eq('class_id', classId);
      
    if (batch) {
      query = query.eq('batch', batch);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching attendance:', error);
      toast.error('Failed to load attendance records');
      return [];
    }
    
    // Use explicit type casting to break the circular reference
    return (data || []) as Attendance[];
  } catch (error) {
    console.error('Error in fetchAttendanceRecords:', error);
    return [];
  }
}

export async function saveAttendanceRecords(
  attendanceData: Record<string, 'present' | 'absent'>,
  date: string,
  classId: string,
  batch?: string
): Promise<boolean> {
  try {
    const records = Object.entries(attendanceData).map(([studentId, status]) => ({
      student_id: studentId,
      class_id: classId,
      date,
      status,
      batch: batch || null
    }));
    
    // First, delete any existing records for the same date, class, and batch
    const { error: deleteError } = await supabase
      .from('attendance')
      .delete()
      .eq('date', date)
      .eq('class_id', classId)
      .eq('batch', batch || '');
      
    if (deleteError) {
      console.error('Error deleting existing attendance:', deleteError);
      toast.error('Failed to update attendance records');
      return false;
    }
    
    // Then, insert the new records
    const { error: insertError } = await supabase
      .from('attendance')
      .insert(records);
      
    if (insertError) {
      console.error('Error inserting attendance:', insertError);
      toast.error('Failed to save attendance records');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in saveAttendanceRecords:', error);
    return false;
  }
}

export function getMockAttendance(date: string, classId: string, batch?: string): Attendance[] {
  return MOCK_DATA.attendance.filter(
    a => a.date === date && a.class_id === classId && (!batch || a.batch === batch)
  );
}

export function saveMockAttendance(
  attendanceData: Record<string, 'present' | 'absent'>,
  date: string,
  classId: string,
  batch?: string
): boolean {
  try {
    // In a real app, this would update the database
    console.log('Saving attendance:', { attendanceData, date, classId, batch });
    return true;
  } catch (error) {
    console.error('Error saving mock attendance:', error);
    return false;
  }
}
