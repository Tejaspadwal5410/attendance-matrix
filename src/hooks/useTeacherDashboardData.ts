
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, MOCK_DATA, Attendance, Mark, Subject, Class } from '@/utils/supabaseClient';
import { toast } from 'sonner';

export interface TeacherDashboardData {
  loading: boolean;
  stats: {
    totalStudents: number;
    totalClasses: number;
    attendanceRate: number;
    averageMarks: number;
  };
  attendance: Attendance[];
  marks: Mark[];
  subjects: Subject[];
  classes: Class[];
}

export const useTeacherDashboardData = (userId: string | undefined) => {
  const [data, setData] = useState<TeacherDashboardData>({
    loading: true,
    stats: {
      totalStudents: 0,
      totalClasses: 0,
      attendanceRate: 0,
      averageMarks: 0
    },
    attendance: [],
    marks: [],
    subjects: [],
    classes: []
  });

  useEffect(() => {
    if (!userId) return;

    const fetchTeacherData = async () => {
      try {
        setData(prev => ({ ...prev, loading: true }));

        // If using a demo account, load mock data instead of fetching from Supabase
        if (userId.startsWith('2') && userId.length < 5) {
          console.log("Loading demo data for teacher dashboard");
          
          // Use mock data
          const mockAttendance = MOCK_DATA.attendance || [];
          const mockMarks = MOCK_DATA.marks || [];
          const mockSubjects = MOCK_DATA.subjects || [];
          const mockStudents = MOCK_DATA.users.filter(u => u.role === 'student') || [];
          const mockClasses = MOCK_DATA.classes || [];
          
          // Calculate stats from mock data
          const totalAttendanceRecords = mockAttendance.length;
          const presentRecords = mockAttendance.filter(a => a.status === 'present').length;
          const attendanceRate = totalAttendanceRecords > 0 
            ? (presentRecords / totalAttendanceRecords) * 100 
            : 0;
          
          const totalMarks = mockMarks.reduce((sum, mark) => sum + mark.marks, 0);
          const averageMarks = mockMarks.length > 0 
            ? totalMarks / mockMarks.length 
            : 0;
          
          // Update state with mock data
          setData({
            loading: false,
            stats: {
              totalStudents: mockStudents.length,
              totalClasses: mockClasses.length,
              attendanceRate: parseFloat(attendanceRate.toFixed(1)),
              averageMarks: parseFloat(averageMarks.toFixed(1))
            },
            attendance: mockAttendance,
            marks: mockMarks,
            subjects: mockSubjects,
            classes: mockClasses
          });
          
          toast.success("Demo data loaded successfully");
          console.log("Demo teacher data loaded");
          
          return;
        }

        // Fetch classes taught by this teacher
        const { data: classesData, error: classesError } = await supabase
          .from('classes')
          .select('*')
          .eq('teacher_id', userId);

        if (classesError) throw classesError;

        // Get class IDs for further queries
        const classIds = classesData ? classesData.map(c => c.id) : [];

        // Fetch all students (for counting)
        const { data: studentsData, error: studentsError } = await supabase
          .from('profiles')
          .select('*')
          .eq('role', 'student');

        if (studentsError) throw studentsError;

        // Fetch attendance data for teacher's classes
        let attendanceData: Attendance[] = [];
        if (classIds.length > 0) {
          const { data, error: attendanceError } = await supabase
            .from('attendance')
            .select('*')
            .in('class_id', classIds);

          if (attendanceError) throw attendanceError;
          
          // Cast the status to the expected type
          attendanceData = data ? data.map(item => ({
            ...item,
            status: item.status as 'present' | 'absent'
          })) : [];
        }

        // Fetch subjects taught by this teacher
        const { data: subjectsData, error: subjectsError } = await supabase
          .from('subjects')
          .select('*')
          .eq('teacher_id', userId);

        if (subjectsError) throw subjectsError;

        // Get subject IDs for marks query
        const subjectIds = subjectsData ? subjectsData.map(s => s.id) : [];

        // Fetch marks for teacher's subjects
        let marksData: Mark[] = [];
        if (subjectIds.length > 0) {
          const { data, error: marksError } = await supabase
            .from('marks')
            .select('*')
            .in('subject_id', subjectIds);

          if (marksError) throw marksError;
          
          // Cast the exam_type to the expected type
          marksData = data ? data.map(item => ({
            ...item,
            exam_type: item.exam_type as 'midterm' | 'final' | 'assignment' | 'quiz'
          })) : [];
        }

        // Calculate stats
        // Attendance rate
        const totalAttendanceRecords = attendanceData.length;
        const presentRecords = attendanceData.filter(a => a.status === 'present').length;
        const attendanceRate = totalAttendanceRecords > 0 
          ? (presentRecords / totalAttendanceRecords) * 100 
          : 0;
        
        // Average marks
        const totalMarks = marksData.reduce((sum, mark) => sum + mark.marks, 0);
        const averageMarks = marksData.length > 0 
          ? totalMarks / marksData.length 
          : 0;

        // Update state with fetched data
        setData({
          loading: false,
          stats: {
            totalStudents: studentsData ? studentsData.length : 0,
            totalClasses: classesData ? classesData.length : 0,
            attendanceRate: parseFloat(attendanceRate.toFixed(1)),
            averageMarks: parseFloat(averageMarks.toFixed(1))
          },
          attendance: attendanceData,
          marks: marksData,
          subjects: subjectsData || [],
          classes: classesData || []
        });

        toast.success("Teacher dashboard data loaded successfully");
        console.log("Teacher data loaded from Supabase");
        
      } catch (error) {
        console.error("Error fetching teacher data:", error);
        toast.error("Error loading dashboard data");
        setData(prev => ({ ...prev, loading: false }));
      }
    };

    fetchTeacherData();
  }, [userId]);

  return data;
};
