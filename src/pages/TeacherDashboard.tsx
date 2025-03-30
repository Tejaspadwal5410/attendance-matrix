
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Layout } from '../components/Layout';
import { DashboardStats } from '../components/Dashboard';
import { AttendanceCard } from '../components/AttendanceCard';
import { MarksCard } from '../components/MarksCard';
import { LeaveRequestCard } from '../components/LeaveRequestCard';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { MOCK_DATA } from '../utils/supabaseClient';

const TeacherDashboard = () => {
  const { user, isTeacher, isDemoUser } = useAuth();

  const [stats, setStats] = useState({
    totalStudents: 0,
    totalClasses: 0,
    attendanceRate: 0,
    averageMarks: 0,
    pendingLeaves: 0
  });

  const [loading, setLoading] = useState(true);
  const [attendance, setAttendance] = useState([]);
  const [marks, setMarks] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    if (!user) return;

    const fetchTeacherData = async () => {
      try {
        setLoading(true);

        // If using a demo account, load mock data instead of fetching from Supabase
        if (isDemoUser() || (user.id.startsWith('2') && user.role === 'teacher')) {
          console.log("Loading demo data for teacher dashboard");
          
          // Use mock data
          const mockAttendance = MOCK_DATA.attendance || [];
          const mockMarks = MOCK_DATA.marks || [];
          const mockLeaveRequests = MOCK_DATA.leaveRequests || [];
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
          
          const pendingLeaves = mockLeaveRequests.filter(lr => lr.status === 'pending').length;
          
          // Update state with mock data
          setAttendance(mockAttendance);
          setMarks(mockMarks);
          setLeaveRequests(mockLeaveRequests);
          setSubjects(mockSubjects);
          
          setStats({
            totalStudents: mockStudents.length,
            totalClasses: mockClasses.length,
            attendanceRate: parseFloat(attendanceRate.toFixed(1)),
            averageMarks: parseFloat(averageMarks.toFixed(1)),
            pendingLeaves
          });
          
          toast.success("Demo data loaded successfully");
          
          console.log("Demo teacher data loaded");
          console.log("Mock Attendance:", mockAttendance);
          console.log("Mock Marks:", mockMarks);
          console.log("Mock Leave Requests:", mockLeaveRequests);
          
          return;
        }

        // Fetch classes taught by this teacher
        const { data: classesData, error: classesError } = await supabase
          .from('classes')
          .select('*')
          .eq('teacher_id', user.id);

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
        let attendanceData = [];
        if (classIds.length > 0) {
          const { data, error: attendanceError } = await supabase
            .from('attendance')
            .select('*')
            .in('class_id', classIds);

          if (attendanceError) throw attendanceError;
          attendanceData = data || [];
        }

        // Fetch subjects taught by this teacher
        const { data: subjectsData, error: subjectsError } = await supabase
          .from('subjects')
          .select('*')
          .eq('teacher_id', user.id);

        if (subjectsError) throw subjectsError;

        // Get subject IDs for marks query
        const subjectIds = subjectsData ? subjectsData.map(s => s.id) : [];

        // Fetch marks for teacher's subjects
        let marksData = [];
        if (subjectIds.length > 0) {
          const { data, error: marksError } = await supabase
            .from('marks')
            .select('*')
            .in('subject_id', subjectIds);

          if (marksError) throw marksError;
          marksData = data || [];
        }

        // Fetch all leave requests (teachers can see all)
        const { data: leaveData, error: leaveError } = await supabase
          .from('leave_requests')
          .select('*');

        if (leaveError) throw leaveError;

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
        
        // Count pending leave requests
        const pendingLeaves = leaveData ? leaveData.filter(lr => lr.status === 'pending').length : 0;

        // Update state with fetched data
        setAttendance(attendanceData);
        setMarks(marksData);
        setLeaveRequests(leaveData || []);
        setSubjects(subjectsData || []);
        
        setStats({
          totalStudents: studentsData ? studentsData.length : 0,
          totalClasses: classesData ? classesData.length : 0,
          attendanceRate: parseFloat(attendanceRate.toFixed(1)),
          averageMarks: parseFloat(averageMarks.toFixed(1)),
          pendingLeaves
        });

        toast.success("Teacher dashboard data loaded successfully");
        
        console.log("Teacher data loaded from Supabase");
        console.log("Teacher ID:", user.id);
        console.log("Classes:", classesData);
        console.log("Subjects:", subjectsData);
        console.log("Attendance Records:", attendanceData);
        console.log("Marks Records:", marksData);
      } catch (error) {
        console.error("Error fetching teacher data:", error);
        toast.error("Error loading dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchTeacherData();
  }, [user, isDemoUser]);

  const handleApproveLeave = async (id) => {
    try {
      // For demo accounts, update the state directly without database call
      if (isDemoUser() || (user && user.id.startsWith('2') && user.role === 'teacher')) {
        setLeaveRequests(leaveRequests.map(request => 
          request.id === id ? { ...request, status: 'approved' } : request
        ));
        
        toast.success('Leave request approved successfully');
        return;
      }
      
      // For real accounts, update the database
      const { error } = await supabase
        .from('leave_requests')
        .update({ status: 'approved' })
        .eq('id', id);
        
      if (error) throw error;
      
      // Update local state to reflect the change
      setLeaveRequests(leaveRequests.map(request => 
        request.id === id ? { ...request, status: 'approved' } : request
      ));
      
      toast.success('Leave request approved successfully');
    } catch (error) {
      console.error('Error approving leave:', error);
      toast.error('Failed to approve leave request');
    }
  };

  const handleRejectLeave = async (id) => {
    try {
      // For demo accounts, update the state directly without database call
      if (isDemoUser() || (user && user.id.startsWith('2') && user.role === 'teacher')) {
        setLeaveRequests(leaveRequests.map(request => 
          request.id === id ? { ...request, status: 'rejected' } : request
        ));
        
        toast.success('Leave request rejected successfully');
        return;
      }
      
      // For real accounts, update the database
      const { error } = await supabase
        .from('leave_requests')
        .update({ status: 'rejected' })
        .eq('id', id);
        
      if (error) throw error;
      
      // Update local state to reflect the change
      setLeaveRequests(leaveRequests.map(request => 
        request.id === id ? { ...request, status: 'rejected' } : request
      ));
      
      toast.success('Leave request rejected successfully');
    } catch (error) {
      console.error('Error rejecting leave:', error);
      toast.error('Failed to reject leave request');
    }
  };

  // Redirect if not a teacher
  if (!user) {
    return <Navigate to="/" />;
  }
  
  if (!isTeacher()) {
    return <Navigate to="/student" />;
  }

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Teacher Dashboard</h2>
            <p className="text-muted-foreground">
              Welcome back, {user.name}! Here's an overview of your classes.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            {/* Stats Overview */}
            <DashboardStats 
              isTeacher={true}
              totalStudents={stats.totalStudents}
              totalClasses={stats.totalClasses}
              attendanceRate={stats.attendanceRate}
              averageMarks={stats.averageMarks}
              pendingLeaves={stats.pendingLeaves}
            />

            {/* Main Dashboard Content */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Attendance Overview */}
              <AttendanceCard 
                attendanceData={attendance} 
                title="Class Attendance"
              />
              
              {/* Marks Overview */}
              <MarksCard 
                marksData={marks} 
                subjects={subjects}
                title="Class Performance"
              />
              
              {/* Leave Requests */}
              <LeaveRequestCard 
                leaveRequests={leaveRequests}
                onApprove={handleApproveLeave}
                onReject={handleRejectLeave}
                title="Student Leave Requests"
              />
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default TeacherDashboard;
