
import { supabase } from '@/integrations/supabase/client';
import { MOCK_DATA } from '../supabaseClient';
import { toast } from 'sonner';

export async function saveAttendanceRecords(
  attendanceData: Record<string, 'present' | 'absent'>, 
  date: string, 
  classId: string,
  batch?: string
): Promise<boolean> {
  try {
    // First, create an array of attendance records from the data
    const records = Object.entries(attendanceData).map(([studentId, status]) => ({
      student_id: studentId,
      class_id: classId,
      date,
      status,
      batch
    }));
    
    if (records.length === 0) {
      toast.error('No attendance records to save');
      return false;
    }
    
    // Insert the records into the database
    const { error } = await supabase
      .from('attendance')
      .upsert(records, { 
        onConflict: 'student_id,class_id,date',
        ignoreDuplicates: false 
      });
    
    if (error) {
      console.error('Error saving attendance records:', error);
      toast.error('Failed to save attendance records');
      return false;
    }
    
    toast.success('Attendance records saved successfully');
    return true;
  } catch (error) {
    console.error('Error saving attendance records:', error);
    toast.error('An unexpected error occurred');
    return false;
  }
}

export async function fetchAttendanceRecords(date: string, classId: string, batch?: string): Promise<any[]> {
  try {
    // For mock data
    if (MOCK_DATA.attendance.length > 0) {
      let filteredAttendance = MOCK_DATA.attendance.filter(
        a => a.date === date && a.class_id === classId
      );
      
      if (batch) {
        filteredAttendance = filteredAttendance.filter(a => a.batch === batch);
      }
      
      return filteredAttendance;
    }
    
    // For real data
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
      console.error('Error fetching attendance records:', error);
      return [];
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching attendance records:', error);
    return [];
  }
}
