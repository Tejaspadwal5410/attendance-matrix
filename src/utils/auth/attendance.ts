
import { supabase } from '@/integrations/supabase/client';
import { MOCK_DATA } from '../supabaseClient';

export async function fetchAttendanceRecords(date: string, classId: string): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('attendance')
      .select('*')
      .eq('date', date)
      .eq('class_id', classId);
    
    if (error) {
      console.error('Error fetching attendance:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error fetching attendance:', error);
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
    // For each student in the attendance data
    const records = Object.entries(attendanceData).map(([studentId, status]) => ({
      student_id: studentId,
      class_id: classId,
      date,
      status,
      batch
    }));
    
    // Check for existing records and update them, or insert new ones
    for (const record of records) {
      const { data: existingRecords } = await supabase
        .from('attendance')
        .select('id')
        .eq('student_id', record.student_id)
        .eq('class_id', record.class_id)
        .eq('date', record.date);
      
      if (existingRecords && existingRecords.length > 0) {
        // Update existing record
        const { error } = await supabase
          .from('attendance')
          .update({ status: record.status })
          .eq('id', existingRecords[0].id);
        
        if (error) {
          console.error('Error updating attendance:', error);
          return false;
        }
      } else {
        // Insert new record
        const { error } = await supabase
          .from('attendance')
          .insert([record]);
        
        if (error) {
          console.error('Error inserting attendance:', error);
          return false;
        }
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error saving attendance:', error);
    return false;
  }
}

export function getMockAttendanceForDemo(userId: string): any[] {
  return MOCK_DATA.attendance.filter(a => a.student_id === userId);
}
