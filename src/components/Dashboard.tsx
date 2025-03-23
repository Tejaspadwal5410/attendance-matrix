
import React from 'react';
import { 
  BookOpen, 
  Calendar, 
  PieChart, 
  Users,
  GraduationCap,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ReactNode;
  trend?: number;
  trendLabel?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  description, 
  icon,
  trend,
  trendLabel
}) => {
  return (
    <Card className="hover-scale">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="w-6 h-6 text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
        
        {trend !== undefined && (
          <div className="flex items-center mt-1">
            <span 
              className={`text-xs ${
                trend > 0 
                  ? 'text-green-600 dark:text-green-400' 
                  : trend < 0 
                    ? 'text-red-600 dark:text-red-400' 
                    : 'text-muted-foreground'
              }`}
            >
              {trend > 0 && '+'}
              {trend}% {trendLabel || 'vs. last period'}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export const DashboardStats: React.FC<{
  isTeacher: boolean;
  totalStudents?: number;
  totalClasses?: number;
  attendanceRate?: number;
  averageMarks?: number;
  pendingLeaves?: number;
}> = ({ 
  isTeacher, 
  totalStudents = 0, 
  totalClasses = 0, 
  attendanceRate = 0, 
  averageMarks = 0,
  pendingLeaves = 0
}) => {
  // Teacher stats
  if (isTeacher) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard 
          title="Total Students" 
          value={totalStudents} 
          icon={<Users />} 
          description="Active students in your classes"
        />
        <StatCard 
          title="Total Classes" 
          value={totalClasses} 
          icon={<BookOpen />} 
          description="Classes under your supervision"
        />
        <StatCard 
          title="Attendance Rate" 
          value={`${attendanceRate}%`} 
          icon={<Calendar />} 
          trend={2.1}
          trendLabel="vs last month"
          description="Average attendance percentage"
        />
        <StatCard 
          title="Pending Leaves" 
          value={pendingLeaves} 
          icon={<Clock />} 
          description="Requests awaiting your approval"
        />
      </div>
    );
  }
  
  // Student stats
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <StatCard 
        title="Attendance Rate" 
        value={`${attendanceRate}%`} 
        icon={<Calendar />} 
        trend={-1.2}
        trendLabel="vs last month"
        description="Your average attendance"
      />
      <StatCard 
        title="Academic Performance" 
        value={`${averageMarks}%`} 
        icon={<GraduationCap />} 
        trend={3.5}
        trendLabel="vs last exam"
        description="Your average marks"
      />
      <StatCard 
        title="Classes Attended" 
        value={`${Math.round(attendanceRate * 0.3)}/${30}`} 
        icon={<CheckCircle />} 
        description="Classes attended this month"
      />
      <StatCard 
        title="Classes Missed" 
        value={`${30 - Math.round(attendanceRate * 0.3)}`} 
        icon={<XCircle />} 
        description="Classes missed this month"
      />
    </div>
  );
};
