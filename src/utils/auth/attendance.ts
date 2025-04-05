
import { supabase } from '@/integrations/supabase/client';
import { MOCK_DATA } from '../supabaseClient';

// Define the types locally to avoid circular references
export type AttendanceStatus = 'present' | 'absent';

export interface AttendanceRecord {
  id: string;
  student_id: string;
  class_id: string;
  date: string;
  status: AttendanceStatus;
  batch?: string | null;
}

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
    
    // Use local type to avoid circular references
    const attendanceRecords: AttendanceRecord[] = data ? data.map((record: any) => ({
      id: record.id,
      student_id: record.student_id,
      class_id: record.class_id,
      date: record.date,
      status: record.status as AttendanceStatus,
      batch: record.batch || null
    })) : [];
    
    return attendanceRecords;
  } catch (error) {
    console.error('Error fetching attendance:', error);
    return [];
  }
}

export async function saveAttendanceRecords(
  records: Record<string, AttendanceStatus>, 
  date: string, 
  classId: string, 
  batch?: string
): Promise<boolean> {
  try {
    if (!records || Object.keys(records).length === 0) return false;
    
    const formattedRecords = Object.entries(records).map(([studentId, status]) => ({
      id: `${studentId}-${classId}-${date}`,
      student_id: studentId,
      class_id: classId,
      date: date,
      status: status,
      batch: batch || null
    }));
    
    // Perform batch upsert to attendance table
    const { error } = await supabase.from('attendance').upsert(formattedRecords);
    
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
    status: record.status as AttendanceStatus,
    batch: record.batch
  }));
}

export function saveMockAttendance(
  records: Record<string, AttendanceStatus>, 
  date: string, 
  classId: string, 
  batch?: string
): boolean {
  console.log('Would save attendance records:', records, date, classId, batch);
  return true;
}
