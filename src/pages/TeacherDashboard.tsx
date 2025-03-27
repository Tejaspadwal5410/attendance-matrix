
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Layout } from '../components/Layout';
import { DashboardStats } from '../components/Dashboard';
import { AttendanceCard } from '../components/AttendanceCard';
import { MarksCard } from '../components/MarksCard';
import { LeaveRequestCard } from '../components/LeaveRequestCard';
import { MOCK_DATA } from '../utils/supabaseClient';
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

  useEffect(() => {
    // In a real app, this would fetch from Supabase
    // For demo, we'll use mock data
    
    // Calculate attendance rate
    const totalAttendanceRecords = MOCK_DATA.attendance.length;
    const presentRecords = MOCK_DATA.attendance.filter(a => a.status === 'present').length;
    const attendanceRate = totalAttendanceRecords > 0 
      ? (presentRecords / totalAttendanceRecords) * 100 
      : 0;
    
    // Calculate average marks
    const totalMarks = MOCK_DATA.marks.reduce((sum, mark) => sum + mark.marks, 0);
    const averageMarks = MOCK_DATA.marks.length > 0 
      ? totalMarks / MOCK_DATA.marks.length 
      : 0;
    
    // Count pending leave requests
    const pendingLeaves = MOCK_DATA.leaveRequests.filter(lr => lr.status === 'pending').length;
    
    setStats({
      totalStudents: MOCK_DATA.users.filter(u => u.role === 'student').length,
      totalClasses: MOCK_DATA.classes.length,
      attendanceRate: parseFloat(attendanceRate.toFixed(1)),
      averageMarks: parseFloat(averageMarks.toFixed(1)),
      pendingLeaves
    });
  }, []);

  const handleApproveLeave = (id: string) => {
    // In a real app, this would update in Supabase
    toast.success('Leave request approved successfully');
  };

  const handleRejectLeave = (id: string) => {
    // In a real app, this would update in Supabase
    toast.success('Leave request rejected successfully');
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
            attendanceData={MOCK_DATA.attendance} 
            title="Class Attendance"
          />
          
          {/* Marks Overview */}
          <MarksCard 
            marksData={MOCK_DATA.marks} 
            subjects={MOCK_DATA.subjects}
            title="Class Performance"
          />
          
          {/* Leave Requests */}
          <LeaveRequestCard 
            leaveRequests={MOCK_DATA.leaveRequests}
            onApprove={handleApproveLeave}
            onReject={handleRejectLeave}
            title="Student Leave Requests"
          />
        </div>
      </div>
    </Layout>
  );
};

export default TeacherDashboard;
