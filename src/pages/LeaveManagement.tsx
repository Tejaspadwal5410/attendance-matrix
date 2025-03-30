import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { useAuth } from '../hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/utils/supabaseClient';
import { toast } from 'sonner';
import { LeaveRequestCard } from '@/components/LeaveRequestCard';

const LeaveManagement = () => {
  const { user, isTeacher } = useAuth();
  const [leaveRequests, setLeaveRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaveRequests = async () => {
      try {
        setLoading(true);
        
        // Fetch leave requests based on user role
        let query = supabase.from('leave_requests').select('*');
        
        if (isTeacher()) {
          // Teachers see all leave requests
        } else {
          // Students only see their own leave requests
          query = query.eq('student_id', user?.id);
        }
        
        const { data, error } = await query;
        
        if (error) {
          throw error;
        }
        
        setLeaveRequests(data || []);
        toast.success("Leave requests loaded successfully");
      } catch (error: any) {
        console.error('Error fetching leave requests:', error);
        toast.error(error.message || 'Failed to load leave requests');
      } finally {
        setLoading(false);
      }
    };

    fetchLeaveRequests();
  }, [user, isTeacher]);

  // Redirect if not authenticated
  if (!user) {
    return <Navigate to="/" />;
  }
  
  if (!isTeacher()) {
    return <Navigate to="/student" />;
  }

  const handleApproveLeave = async (id: string) => {
    try {
      const { error } = await supabase
        .from('leave_requests')
        .update({ status: 'approved' })
        .eq('id', id);
        
      if (error) throw error;
      
      // Optimistically update local state
      setLeaveRequests(leaveRequests.map(request => 
        request.id === id ? { ...request, status: 'approved' } : request
      ));
      
      toast.success('Leave request approved successfully');
    } catch (error: any) {
      console.error('Error approving leave:', error);
      toast.error(error.message || 'Failed to approve leave request');
    }
  };

  const handleRejectLeave = async (id: string) => {
    try {
      const { error } = await supabase
        .from('leave_requests')
        .update({ status: 'rejected' })
        .eq('id', id);
        
      if (error) throw error;
      
      // Optimistically update local state
      setLeaveRequests(leaveRequests.map(request => 
        request.id === id ? { ...request, status: 'rejected' } : request
      ));
      
      toast.success('Leave request rejected successfully');
    } catch (error: any) {
      console.error('Error rejecting leave:', error);
      toast.error(error.message || 'Failed to reject leave request');
    }
  };

  return (
    <Layout>
      <div className="container mx-auto mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Leave Requests</CardTitle>
            <CardDescription>Manage student leave requests</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : (
              <LeaveRequestCard
                leaveRequests={leaveRequests}
                onApprove={handleApproveLeave}
                onReject={handleRejectLeave}
                title="Student Leave Requests"
              />
            )}
          </CardContent>
          <CardFooter>
            <Button onClick={() => window.history.back()}>Back</Button>
          </CardFooter>
        </Card>
      </div>
    </Layout>
  );
};

export default LeaveManagement;
