
import React from 'react';
import { CalendarClock, Check, Clock, X } from 'lucide-react';
import { LeaveRequest } from '../utils/supabaseClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '../contexts/AuthContext';

interface LeaveRequestCardProps {
  leaveRequests: LeaveRequest[];
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  title?: string;
}

export const LeaveRequestCard: React.FC<LeaveRequestCardProps> = ({ 
  leaveRequests = [],
  onApprove,
  onReject,
  title = "Leave Requests" 
}) => {
  const { isTeacher } = useAuth();

  // Sort leave requests by date (newest first)
  const sortedLeaveRequests = [...leaveRequests].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  const getStatusBadge = (status: LeaveRequest['status']) => {
    switch (status) {
      case 'approved':
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900 dark:text-green-100">
            <Check className="h-3 w-3 mr-1" /> Approved
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900 dark:text-red-100">
            <X className="h-3 w-3 mr-1" /> Rejected
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-100">
            <Clock className="h-3 w-3 mr-1" /> Pending
          </Badge>
        );
    }
  };
  
  return (
    <Card className="hover-scale h-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl font-medium">{title}</CardTitle>
            <CardDescription>
              {isTeacher() ? 'Student leave requests' : 'Your leave requests'}
            </CardDescription>
          </div>
          <CalendarClock className="h-5 w-5 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        {sortedLeaveRequests.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
            <CalendarClock className="h-16 w-16 mb-2 opacity-20" />
            <p>No leave requests found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedLeaveRequests.map((leave) => (
              <div key={leave.id} className="p-3 rounded-lg border">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-sm font-medium">
                      {new Date(leave.date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                  {getStatusBadge(leave.status)}
                </div>
                <p className="text-sm text-muted-foreground mb-2">{leave.reason}</p>
                
                {isTeacher() && leave.status === 'pending' && onApprove && onReject && (
                  <div className="flex gap-2 mt-3">
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="w-full text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700 dark:text-green-400 dark:border-green-900 dark:hover:bg-green-900/40"
                      onClick={() => onApprove(leave.id)}
                    >
                      <Check className="h-4 w-4 mr-1" /> Approve
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="w-full text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:border-red-900 dark:hover:bg-red-900/40"
                      onClick={() => onReject(leave.id)}
                    >
                      <X className="h-4 w-4 mr-1" /> Reject
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
