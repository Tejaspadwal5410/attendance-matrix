
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AttendanceCard } from './AttendanceCard';
import { MarksCard } from './MarksCard';
import { StudentDashboardData } from '@/hooks/useStudentDashboardData';

interface StudentDashboardTabsProps {
  data: StudentDashboardData;
  activeTab: string;
  setActiveTab: (value: string) => void;
}

export const StudentDashboardTabs: React.FC<StudentDashboardTabsProps> = ({ 
  data, 
  activeTab, 
  setActiveTab 
}) => {
  const { studentAttendance, studentMarks, subjects } = data;

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
        <TabsTrigger value="attendance">My Attendance</TabsTrigger>
        <TabsTrigger value="marks">My Marks</TabsTrigger>
      </TabsList>
      
      {/* Dashboard Tab Content - Overview of all */}
      <TabsContent value="dashboard">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          <AttendanceCard 
            attendanceData={studentAttendance} 
            title="My Attendance"
          />
          <MarksCard 
            marksData={studentMarks} 
            subjects={subjects}
            title="My Academic Performance"
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
    </Tabs>
  );
};
