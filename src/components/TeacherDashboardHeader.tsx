
import React from 'react';
import { User } from '@/utils/supabaseClient';
import { DashboardStats } from './Dashboard';
import { AddStudentDialog } from './students/AddStudentDialog';

interface TeacherDashboardHeaderProps {
  user: User | null;
  stats: {
    totalStudents: number;
    totalClasses: number;
    attendanceRate: number;
    averageMarks: number;
  };
}

export const TeacherDashboardHeader: React.FC<TeacherDashboardHeaderProps> = ({ 
  user, 
  stats 
}) => {
  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Teacher Dashboard</h2>
          <p className="text-muted-foreground">
            Welcome back, {user?.name}! Here's an overview of your classes.
          </p>
        </div>
        <div>
          <AddStudentDialog />
        </div>
      </div>

      {/* Stats Overview */}
      <DashboardStats 
        isTeacher={true}
        totalStudents={stats.totalStudents}
        totalClasses={stats.totalClasses}
        attendanceRate={stats.attendanceRate}
        averageMarks={stats.averageMarks}
        pendingLeaves={0}
      />
    </>
  );
};
