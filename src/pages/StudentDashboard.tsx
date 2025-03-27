
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Layout } from '../components/Layout';
import { DashboardStats } from '../components/Dashboard';
import { AttendanceCard } from '../components/AttendanceCard';
import { MarksCard } from '../components/MarksCard';
import { LeaveRequestCard } from '../components/LeaveRequestCard';
import { MOCK_DATA } from '../utils/supabaseClient';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

const StudentDashboard = () => {
  const { user, isStudent } = useAuth();
  const location = useLocation();
  
  const [stats, setStats] = useState({
    attendanceRate: 0,
    averageMarks: 0
  });

  // Determine the active tab based on the current URL
  const getActiveTab = () => {
    const path = location.pathname;
    if (path === '/my-attendance') return 'attendance';
    if (path === '/my-marks') return 'marks';
    if (path === '/my-leave') return 'leave';
    return 'dashboard'; // Default tab
  };

  const [activeTab, setActiveTab] = useState(getActiveTab());

  // Update active tab when route changes
  useEffect(() => {
    setActiveTab(getActiveTab());
  }, [location.pathname]);

  useEffect(() => {
    // In a real app, this would fetch from Supabase
    // For now, we're using mock data to test the UI
    
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

    // Show a test notification to verify the app is working
    toast.success("Dashboard data loaded successfully");
    
    // Log some information about the mock user
    console.log("Current user ID:", user?.id);
    console.log("Using MOCK_DATA for testing purposes");
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

  // Log the data to verify it's being filtered correctly
  console.log('Student ID:', user.id);
  console.log('Attendance Records:', studentAttendance);
  console.log('Marks Records:', studentMarks);
  console.log('Leave Requests:', studentLeaveRequests);

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

        {/* Tabs for different sections */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="attendance">My Attendance</TabsTrigger>
            <TabsTrigger value="marks">My Marks</TabsTrigger>
            <TabsTrigger value="leave">Leave Requests</TabsTrigger>
          </TabsList>
          
          {/* Dashboard Tab Content - Overview of all */}
          <TabsContent value="dashboard">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AttendanceCard 
                attendanceData={studentAttendance} 
                title="My Attendance"
              />
              <MarksCard 
                marksData={studentMarks} 
                subjects={MOCK_DATA.subjects}
                title="My Academic Performance"
              />
              <LeaveRequestCard 
                leaveRequests={studentLeaveRequests}
                title="My Leave Requests"
              />
            </div>
          </TabsContent>
          
          {/* Attendance Tab Content */}
          <TabsContent value="attendance">
            <div className="grid grid-cols-1 gap-6">
              <AttendanceCard 
                attendanceData={studentAttendance} 
                title="My Attendance"
              />
            </div>
          </TabsContent>
          
          {/* Marks Tab Content */}
          <TabsContent value="marks">
            <div className="grid grid-cols-1 gap-6">
              <MarksCard 
                marksData={studentMarks} 
                subjects={MOCK_DATA.subjects}
                title="My Academic Performance"
              />
            </div>
          </TabsContent>
          
          {/* Leave Requests Tab Content */}
          <TabsContent value="leave">
            <div className="grid grid-cols-1 gap-6">
              <LeaveRequestCard 
                leaveRequests={studentLeaveRequests}
                title="My Leave Requests"
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default StudentDashboard;
