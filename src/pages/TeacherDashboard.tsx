
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Layout } from '../components/Layout';
import { TeacherDashboardHeader } from '@/components/TeacherDashboardHeader';
import { TeacherDashboardContent } from '@/components/TeacherDashboardContent';
import { useTeacherDashboardData } from '@/hooks/useTeacherDashboardData';
import { toast } from 'sonner';

const TeacherDashboard = () => {
  const { user, isTeacher } = useAuth();
  
  // Use our new custom hook to fetch teacher dashboard data
  const dashboardData = useTeacherDashboardData(user?.id);

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
        <TeacherDashboardHeader user={user} stats={dashboardData.stats} />

        {dashboardData.loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <TeacherDashboardContent
            attendance={dashboardData.attendance}
            marks={dashboardData.marks}
            subjects={dashboardData.subjects}
          />
        )}
      </div>
    </Layout>
  );
};

export default TeacherDashboard;
