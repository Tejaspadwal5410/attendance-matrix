
import React from 'react';
import { AttendanceCard } from './AttendanceCard';
import { MarksCard } from './MarksCard';
import { Attendance, Mark, Subject } from '@/utils/supabaseClient';

interface TeacherDashboardContentProps {
  attendance: Attendance[];
  marks: Mark[];
  subjects: Subject[];
}

export const TeacherDashboardContent: React.FC<TeacherDashboardContentProps> = ({
  attendance,
  marks,
  subjects
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
    </div>
  );
};
