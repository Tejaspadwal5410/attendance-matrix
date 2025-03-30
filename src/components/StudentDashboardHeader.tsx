
import React from 'react';
import { User } from '@/utils/supabaseClient';
import { DashboardStats } from './Dashboard';

interface StudentDashboardHeaderProps {
  user: User | null;
  stats: {
    attendanceRate: number;
    averageMarks: number;
  };
}

export const StudentDashboardHeader: React.FC<StudentDashboardHeaderProps> = ({ 
  user, 
  stats 
}) => {
  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Student Dashboard</h2>
          <p className="text-muted-foreground">
            Welcome, {user?.name}! Here's an overview of your academic progress.
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      <DashboardStats 
        isTeacher={false}
        attendanceRate={stats.attendanceRate}
        averageMarks={stats.averageMarks}
      />
    </>
  );
};
