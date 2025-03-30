
import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Layout } from '../components/Layout';
import { TeacherDashboardHeader } from '@/components/TeacherDashboardHeader';
import { TeacherDashboardContent } from '@/components/TeacherDashboardContent';
import { useTeacherDashboardData } from '@/hooks/useTeacherDashboardData';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const TeacherDashboard = () => {
  const { user, isTeacher, isDemoUser } = useAuth();
  
  // Use our new custom hook to fetch teacher dashboard data
  const dashboardData = useTeacherDashboardData(user?.id);

  const handleApproveLeave = async (id: string) => {
    try {
      // For demo accounts, update the state directly without database call
      if (isDemoUser() || (user && user.id.startsWith('2') && user.role === 'teacher')) {
        // We don't need to manually update state anymore since it's handled by the hook
        const { error } = await supabase
          .from('leave_requests')
          .update({ status: 'approved' })
          .eq('id', id);
          
        if (error) throw error;
        
        toast.success('Leave request approved successfully');
        return;
      }
      
      // For real accounts, update the database
      const { error } = await supabase
        .from('leave_requests')
        .update({ status: 'approved' })
        .eq('id', id);
        
      if (error) throw error;
      
      toast.success('Leave request approved successfully');
    } catch (error) {
      console.error('Error approving leave:', error);
      toast.error('Failed to approve leave request');
    }
  };

  const handleRejectLeave = async (id: string) => {
    try {
      // For demo accounts, update the state directly without database call
      if (isDemoUser() || (user && user.id.startsWith('2') && user.role === 'teacher')) {
        // We don't need to manually update state anymore since it's handled by the hook
        const { error } = await supabase
          .from('leave_requests')
          .update({ status: 'rejected' })
          .eq('id', id);
          
        if (error) throw error;
        
        toast.success('Leave request rejected successfully');
        return;
      }
      
      // For real accounts, update the database
      const { error } = await supabase
        .from('leave_requests')
        .update({ status: 'rejected' })
        .eq('id', id);
        
      if (error) throw error;
      
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
        <TeacherDashboardHeader user={user} stats={dashboardData.stats} />

        {dashboardData.loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <TeacherDashboardContent
            attendance={dashboardData.attendance}
            marks={dashboardData.marks}
            leaveRequests={dashboardData.leaveRequests}
            subjects={dashboardData.subjects}
            onApproveLeave={handleApproveLeave}
            onRejectLeave={handleRejectLeave}
          />
        )}
      </div>
    </Layout>
  );
};

export default TeacherDashboard;
