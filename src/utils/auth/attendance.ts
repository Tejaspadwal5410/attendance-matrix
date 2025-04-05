
import { supabase } from '@/integrations/supabase/client';
import { Attendance, AttendanceRecord } from '../authUtils';
import { MOCK_DATA } from '../supabaseClient';

// Use explicit type definitions to avoid circular references
export async function fetchAttendanceRecords(classId?: string, date?: string, batch?: string) {
  try {
    let query = supabase.from('attendance').select('*');
    
    if (classId) {
      query = query.eq('class_id', classId);
    }
    
    if (date) {
      query = query.eq('date', date);
    }
    
    if (batch) {
      query = query.eq('batch', batch);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    // Use explicit typing to avoid circular references
    const attendanceRecords: AttendanceRecord[] = data ? data.map(record => ({
      id: record.id,
      student_id: record.student_id,
      class_id: record.class_id,
      date: record.date,
      status: record.status as 'present' | 'absent',
      batch: record.batch
    })) : [];
    
    return attendanceRecords;
  } catch (error) {
    console.error('Error fetching attendance:', error);
    return [];
  }
}

export async function saveAttendanceRecords(records: Attendance[]): Promise<boolean> {
  try {
    if (!records || records.length === 0) return false;
    
    // Perform batch upsert to attendance table
    const { error } = await supabase.from('attendance').upsert(
      records.map(record => ({
        id: record.id,
        student_id: record.student_id,
        class_id: record.class_id,
        date: record.date,
        status: record.status,
        batch: record.batch
      }))
    );
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error saving attendance:', error);
    return false;
  }
}

export function getMockAttendance() {
  // Return filtered mock attendance to avoid circular references
  return MOCK_DATA.attendance.map(record => ({
    id: record.id,
    student_id: record.student_id,
    class_id: record.class_id,
    date: record.date,
    status: record.status as 'present' | 'absent',
    batch: record.batch
  }));
}

export function saveMockAttendance(records: Attendance[]): boolean {
  console.log('Would save attendance records:', records);
  return true;
}
