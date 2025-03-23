
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Layout } from '../components/Layout';
import { DashboardStats } from '../components/Dashboard';
import { AttendanceCard } from '../components/AttendanceCard';
import { MarksCard } from '../components/MarksCard';
import { LeaveRequestCard } from '../components/LeaveRequestCard';
import { MOCK_DATA } from '../utils/supabaseClient';

const StudentDashboard = () => {
  const { user, isStudent } = useAuth();

  const [stats, setStats] = useState({
    attendanceRate: 0,
    averageMarks: 0
  });

  useEffect(() => {
    // In a real app, this would fetch from Supabase
    // For demo, we'll use mock data
    
    // Calculate attendance rate for the student
    const studentAttendance = MOCK_DATA.attendance.filter(a => a.student_id === user?.id);
    const totalAttendanceRecords = studentAttendance.length;
    const presentRecords = studentAttendance.filter(a => a.status === 'present').length;
    const attendanceRate = totalAttendanceRecords > 0 
      ? (presentRecords / totalAttendanceRecords) * 100 
      : 0;
    
    // Calculate average marks for the student
    const studentMarks = MOCK_DATA.marks.filter(m => m.student_id === user?.id);
    const totalMarks = studentMarks.reduce((sum, mark) => sum + mark.marks, 0);
    const averageMarks = studentMarks.length > 0 
      ? totalMarks / studentMarks.length 
      : 0;
    
    setStats({
      attendanceRate: parseFloat(attendanceRate.toFixed(1)),
      averageMarks: parseFloat(averageMarks.toFixed(1))
    });
  }, [user]);

  // Redirect if not a student
  if (!user) {
    return <Navigate to="/" />;
  }
  
  if (!isStudent()) {
    return <Navigate to="/teacher" />;
  }

  // Filter data for this student
  const studentAttendance = MOCK_DATA.attendance.filter(a => a.student_id === user.id);
  const studentMarks = MOCK_DATA.marks.filter(m => m.student_id === user.id);
  const studentLeaveRequests = MOCK_DATA.leaveRequests.filter(l => l.student_id === user.id);

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Student Dashboard</h2>
            <p className="text-muted-foreground">
              Welcome, {user.name}! Here's an overview of your academic progress.
            </p>
          </div>
        </div>

        {/* Stats Overview */}
        <DashboardStats 
          isTeacher={false}
          attendanceRate={stats.attendanceRate}
          averageMarks={stats.averageMarks}
        />

        {/* Main Dashboard Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Attendance Overview */}
          <AttendanceCard 
            attendanceData={studentAttendance} 
            title="My Attendance"
          />
          
          {/* Marks Overview */}
          <MarksCard 
            marksData={studentMarks} 
            subjects={MOCK_DATA.subjects}
            title="My Academic Performance"
          />
          
          {/* Leave Requests */}
          <LeaveRequestCard 
            leaveRequests={studentLeaveRequests}
            title="My Leave Requests"
          />
        </div>
      </div>
    </Layout>
  );
};

export default StudentDashboard;
