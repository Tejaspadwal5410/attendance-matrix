
import { supabase } from '@/integrations/supabase/client';
import { MOCK_DATA } from '../supabaseClient';

// Define the types locally to completely avoid circular references
export type AttendanceStatus = 'present' | 'absent';

export interface AttendanceRecord {
  id: string;
  student_id: string;
  class_id: string;
  date: string;
  status: AttendanceStatus;
  batch?: string | null;
}

export async function fetchAttendanceRecords(classId?: string, date?: string, batch?: string): Promise<AttendanceRecord[]> {
  try {
    console.log('Fetching attendance records with filters:', { classId, date, batch });
    
    // For demo/development mode, use mock data
    if (process.env.NODE_ENV === 'development') {
      console.log('Using mock attendance data');
      let filteredRecords = MOCK_DATA.attendance;
      
      if (classId) {
        filteredRecords = filteredRecords.filter(a => a.class_id === classId);
      }
      
      if (date) {
        filteredRecords = filteredRecords.filter(a => a.date === date);
      }
      
      if (batch) {
        filteredRecords = filteredRecords.filter(a => a.batch === batch);
      }
      
      return filteredRecords.map(record => ({
        id: record.id,
        student_id: record.student_id,
        class_id: record.class_id,
        date: record.date,
        status: record.status as AttendanceStatus,
        batch: record.batch
      }));
    }
    
    // For production, fetch from Supabase
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
    
    // Return typed data without unnecessary intermediate variable
    return data ? data.map((record: any) => ({
      id: record.id,
      student_id: record.student_id,
      class_id: record.class_id,
      date: record.date,
      status: record.status as AttendanceStatus,
      batch: record.batch || null
    })) : [];
    
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
    
    console.log('Saving attendance records:', { records, date, classId, batch });
    
    // For demo/development mode
    if (process.env.NODE_ENV === 'development') {
      console.log('Would save attendance records:', records, date, classId, batch);
      return true;
    }
    
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

export function getMockAttendance(): AttendanceRecord[] {
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
