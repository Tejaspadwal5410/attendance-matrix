
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Layout } from '../components/Layout';
import { useStudentDashboardData } from '@/hooks/useStudentDashboardData';
import { StudentDashboardHeader } from '@/components/StudentDashboardHeader';
import { StudentDashboardTabs } from '@/components/StudentDashboardTabs';

const StudentDashboard = () => {
  const { user, isStudent } = useAuth();
  const location = useLocation();
  
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

  // Fetch all student data
  const dashboardData = useStudentDashboardData(user?.id);

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
        <StudentDashboardHeader user={user} stats={dashboardData.stats} />

        {dashboardData.loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <StudentDashboardTabs 
            data={dashboardData} 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
          />
        )}
      </div>
    </Layout>
  );
};

export default StudentDashboard;
