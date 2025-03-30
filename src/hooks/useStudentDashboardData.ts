
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { MOCK_DATA, Attendance, Mark, LeaveRequest, Subject } from '@/utils/supabaseClient';
import { toast } from 'sonner';

export interface StudentDashboardData {
  loading: boolean;
  studentAttendance: Attendance[];
  studentMarks: Mark[];
  studentLeaveRequests: LeaveRequest[];
  subjects: Subject[];
  stats: {
    attendanceRate: number;
    averageMarks: number;
  };
}

export const useStudentDashboardData = (userId: string | undefined) => {
  const [data, setData] = useState<StudentDashboardData>({
    loading: true,
    studentAttendance: [],
    studentMarks: [],
    studentLeaveRequests: [],
    subjects: [],
    stats: {
      attendanceRate: 0,
      averageMarks: 0
    }
  });

  useEffect(() => {
    if (!userId) return;

    const fetchStudentData = async () => {
      try {
        // For demo users, use mock data
        if (userId.startsWith('1') && userId.length < 5) {
          console.log("Loading demo data for student dashboard");
          
          // Use mock data
          const mockAttendance = MOCK_DATA.attendance || [];
          const mockMarks = MOCK_DATA.marks || [];
          const mockLeaveRequests = MOCK_DATA.leaveRequests || [];
          const mockSubjects = MOCK_DATA.subjects || [];
          
          // Calculate attendance rate from mock data
          const totalAttendanceRecords = mockAttendance.length;
          const presentRecords = mockAttendance.filter(a => a.status === 'present').length;
          const attendanceRate = totalAttendanceRecords > 0 
            ? (presentRecords / totalAttendanceRecords) * 100 
            : 0;
          
          // Calculate average marks from mock data
          const totalMarks = mockMarks.reduce((sum, mark) => sum + mark.marks, 0);
          const averageMarks = mockMarks.length > 0 
            ? totalMarks / mockMarks.length 
            : 0;
          
          // Update state with mock data
          setData({
            loading: false,
            studentAttendance: mockAttendance,
            studentMarks: mockMarks,
            studentLeaveRequests: mockLeaveRequests,
            subjects: mockSubjects,
            stats: {
              attendanceRate: parseFloat(attendanceRate.toFixed(1)),
              averageMarks: parseFloat(averageMarks.toFixed(1))
            }
          });
          
          toast.success("Dashboard data loaded successfully");
          return;
        }

        // Fetch attendance data
        const { data: attendanceData, error: attendanceError } = await supabase
          .from('attendance')
          .select('*')
          .eq('student_id', userId);

        if (attendanceError) throw attendanceError;

        // Fetch marks data
        const { data: marksData, error: marksError } = await supabase
          .from('marks')
          .select('*')
          .eq('student_id', userId);

        if (marksError) throw marksError;

        // Fetch leave requests
        const { data: leaveData, error: leaveError } = await supabase
          .from('leave_requests')
          .select('*')
          .eq('student_id', userId);

        if (leaveError) throw leaveError;

        // Fetch subjects for reference
        const { data: subjectsData, error: subjectsError } = await supabase
          .from('subjects')
          .select('*');

        if (subjectsError) throw subjectsError;

        // Convert database types to our defined types to fix type errors
        const typedAttendanceData: Attendance[] = attendanceData ? 
          attendanceData.map(item => ({
            ...item,
            status: item.status as 'present' | 'absent'
          })) : [];
        
        const typedMarksData: Mark[] = marksData ? 
          marksData.map(item => ({
            ...item,
            exam_type: item.exam_type as 'midterm' | 'final' | 'assignment' | 'quiz'
          })) : [];
        
        const typedLeaveData: LeaveRequest[] = leaveData ? 
          leaveData.map(item => ({
            ...item,
            status: item.status as 'pending' | 'approved' | 'rejected'
          })) : [];

        // Calculate attendance rate
        const totalAttendanceRecords = typedAttendanceData.length;
        const presentRecords = typedAttendanceData.filter(a => a.status === 'present').length;
        const attendanceRate = totalAttendanceRecords > 0 
          ? (presentRecords / totalAttendanceRecords) * 100 
          : 0;
        
        // Calculate average marks
        const totalMarks = typedMarksData.reduce((sum, mark) => sum + mark.marks, 0);
        const averageMarks = typedMarksData.length > 0 
          ? totalMarks / typedMarksData.length 
          : 0;

        // Update state with fetched data
        setData({
          loading: false,
          studentAttendance: typedAttendanceData,
          studentMarks: typedMarksData,
          studentLeaveRequests: typedLeaveData,
          subjects: subjectsData || [],
          stats: {
            attendanceRate: parseFloat(attendanceRate.toFixed(1)),
            averageMarks: parseFloat(averageMarks.toFixed(1))
          }
        });

        toast.success("Dashboard data loaded successfully");
        
        console.log("Data loaded from Supabase database");
        console.log("User ID:", userId);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Error loading dashboard data");
        setData(prev => ({ ...prev, loading: false }));
      }
    };

    fetchStudentData();
  }, [userId]);

  return data;
};
