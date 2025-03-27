
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

const TeacherDashboard = () => {
  const { user, isTeacher } = useAuth();

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

        // Fetch classes taught by this teacher
        const { data: classesData, error: classesError } = await supabase
          .from('classes')
          .select('*')
          .eq('teacher_id', user.id);

        if (classesError) throw classesError;

        // Get class IDs for further queries
        const classIds = classesData.map(c => c.id);

        // Fetch all students (for counting)
        const { data: studentsData, error: studentsError } = await supabase
          .from('profiles')
          .select('*')
          .eq('role', 'student');

        if (studentsError) throw studentsError;

        // Fetch attendance data for teacher's classes
        const { data: attendanceData, error: attendanceError } = await supabase
          .from('attendance')
          .select('*')
          .in('class_id', classIds);

        if (attendanceError) throw attendanceError;

        // Fetch subjects taught by this teacher
        const { data: subjectsData, error: subjectsError } = await supabase
          .from('subjects')
          .select('*')
          .eq('teacher_id', user.id);

        if (subjectsError) throw subjectsError;

        // Get subject IDs for marks query
        const subjectIds = subjectsData.map(s => s.id);

        // Fetch marks for teacher's subjects
        const { data: marksData, error: marksError } = await supabase
          .from('marks')
          .select('*')
          .in('subject_id', subjectIds);

        if (marksError) throw marksError;

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
        const pendingLeaves = leaveData.filter(lr => lr.status === 'pending').length;

        // Update state with fetched data
        setAttendance(attendanceData);
        setMarks(marksData);
        setLeaveRequests(leaveData);
        setSubjects(subjectsData);
        
        setStats({
          totalStudents: studentsData.length,
          totalClasses: classesData.length,
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
  }, [user]);

  const handleApproveLeave = async (id) => {
    try {
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
