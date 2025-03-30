
import React from 'react';
import { AttendanceCard } from './AttendanceCard';
import { MarksCard } from './MarksCard';
import { LeaveRequestCard } from './LeaveRequestCard';
import { Attendance, Mark, LeaveRequest, Subject } from '@/utils/supabaseClient';

interface TeacherDashboardContentProps {
  attendance: Attendance[];
  marks: Mark[];
  leaveRequests: LeaveRequest[];
  subjects: Subject[];
  onApproveLeave: (id: string) => Promise<void>;
  onRejectLeave: (id: string) => Promise<void>;
}

export const TeacherDashboardContent: React.FC<TeacherDashboardContentProps> = ({
  attendance,
  marks,
  leaveRequests,
  subjects,
  onApproveLeave,
  onRejectLeave
}) => {
  return (
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
        onApprove={onApproveLeave}
        onReject={onRejectLeave}
        title="Student Leave Requests"
      />
    </div>
  );
};
