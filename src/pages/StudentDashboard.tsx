
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Layout } from '../components/Layout';
import { DashboardStats } from '../components/Dashboard';
import { AttendanceCard } from '../components/AttendanceCard';
import { MarksCard } from '../components/MarksCard';
import { LeaveRequestCard } from '../components/LeaveRequestCard';
import { supabase } from '@/integrations/supabase/client';
import { MOCK_DATA } from '@/utils/supabaseClient';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

const StudentDashboard = () => {
  const { user, isStudent } = useAuth();
  const location = useLocation();
  
  const [stats, setStats] = useState({
    attendanceRate: 0,
    averageMarks: 0
  });

  const [loading, setLoading] = useState(true);
  const [studentAttendance, setStudentAttendance] = useState([]);
  const [studentMarks, setStudentMarks] = useState([]);
  const [studentLeaveRequests, setStudentLeaveRequests] = useState([]);
  const [subjects, setSubjects] = useState([]);

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
    if (!user) return;

    const fetchStudentData = async () => {
      try {
        setLoading(true);
        
        // For demo users, use mock data
        if (user.id.startsWith('1') && user.role === 'student') {
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
          setStudentAttendance(mockAttendance);
          setStudentMarks(mockMarks);
          setStudentLeaveRequests(mockLeaveRequests);
          setSubjects(mockSubjects);
          
          setStats({
            attendanceRate: parseFloat(attendanceRate.toFixed(1)),
            averageMarks: parseFloat(averageMarks.toFixed(1))
          });
          
          toast.success("Dashboard data loaded successfully");
          return;
        }

        // Fetch attendance data
        const { data: attendanceData, error: attendanceError } = await supabase
          .from('attendance')
          .select('*')
          .eq('student_id', user.id);

        if (attendanceError) throw attendanceError;

        // Fetch marks data
        const { data: marksData, error: marksError } = await supabase
          .from('marks')
          .select('*')
          .eq('student_id', user.id);

        if (marksError) throw marksError;

        // Fetch leave requests
        const { data: leaveData, error: leaveError } = await supabase
          .from('leave_requests')
          .select('*')
          .eq('student_id', user.id);

        if (leaveError) throw leaveError;

        // Fetch subjects for reference
        const { data: subjectsData, error: subjectsError } = await supabase
          .from('subjects')
          .select('*');

        if (subjectsError) throw subjectsError;

        // Calculate attendance rate
        const totalAttendanceRecords = attendanceData ? attendanceData.length : 0;
        const presentRecords = attendanceData ? attendanceData.filter(a => a.status === 'present').length : 0;
        const attendanceRate = totalAttendanceRecords > 0 
          ? (presentRecords / totalAttendanceRecords) * 100 
          : 0;
        
        // Calculate average marks
        const totalMarks = marksData ? marksData.reduce((sum, mark) => sum + mark.marks, 0) : 0;
        const averageMarks = marksData && marksData.length > 0 
          ? totalMarks / marksData.length 
          : 0;

        // Update state with fetched data
        setStudentAttendance(attendanceData || []);
        setStudentMarks(marksData || []);
        setStudentLeaveRequests(leaveData || []);
        setSubjects(subjectsData || []);
        
        setStats({
          attendanceRate: parseFloat(attendanceRate.toFixed(1)),
          averageMarks: parseFloat(averageMarks.toFixed(1))
        });

        toast.success("Dashboard data loaded successfully");
        
        console.log("Data loaded from Supabase database");
        console.log("User ID:", user.id);
        console.log("Attendance Records:", attendanceData);
        console.log("Marks Records:", marksData);
        console.log("Leave Requests:", leaveData);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Error loading dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [user]);

  // Redirect if not a student
  if (!user) {
    return <Navigate to="/" />;
  }
  
  if (!isStudent()) {
    return <Navigate to="/teacher" />;
  }

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

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
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
                    subjects={subjects}
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
                    subjects={subjects}
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
          </>
        )}
      </div>
    </Layout>
  );
};

export default StudentDashboard;
