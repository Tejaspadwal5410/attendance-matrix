
import React from 'react';
import { Calendar, Check, X } from 'lucide-react';
import { Attendance } from '../utils/supabaseClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface AttendanceCardProps {
  attendanceData: Attendance[];
  title?: string;
}

export const AttendanceCard: React.FC<AttendanceCardProps> = ({ 
  attendanceData = [],
  title = "Recent Attendance" 
}) => {
  const totalDays = attendanceData.length;
  const presentDays = attendanceData.filter(a => a.status === 'present').length;
  const absentDays = totalDays - presentDays;
  const attendancePercentage = totalDays > 0 ? (presentDays / totalDays) * 100 : 0;

  // Sort attendance data by date (newest first)
  const sortedAttendance = [...attendanceData].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  return (
    <Card className="hover-scale h-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl font-medium">{title}</CardTitle>
            <CardDescription>Your attendance summary</CardDescription>
          </div>
          <Calendar className="h-5 w-5 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        {totalDays === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
            <Calendar className="h-16 w-16 mb-2 opacity-20" />
            <p>No attendance records found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Attendance percentage */}
            <div className="flex items-end justify-between mb-4">
              <div>
                <p className="text-4xl font-bold">
                  {attendancePercentage.toFixed(1)}%
                </p>
                <p className="text-sm text-muted-foreground">
                  Present: {presentDays} days | Absent: {absentDays} days
                </p>
              </div>
              
              {/* Attendance indicator */}
              <div 
                className={`text-xs px-2 py-1 rounded-full ${
                  attendancePercentage >= 90 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' 
                    : attendancePercentage >= 75 
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100' 
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
                }`}
              >
                {attendancePercentage >= 90 
                  ? 'Excellent' 
                  : attendancePercentage >= 75 
                    ? 'Good' 
                    : 'Needs Improvement'}
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-secondary rounded-full h-2.5 mb-6">
              <div 
                className={`h-2.5 rounded-full ${
                  attendancePercentage >= 90 
                    ? 'bg-green-500' 
                    : attendancePercentage >= 75 
                      ? 'bg-yellow-500' 
                      : 'bg-red-500'
                }`} 
                style={{ width: `${attendancePercentage}%` }}
              ></div>
            </div>

            {/* Recent attendance */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Recent Attendance</h4>
              <div className="space-y-1">
                {sortedAttendance.slice(0, 5).map((attendance) => (
                  <div key={attendance.id} className="flex justify-between items-center py-2 border-b last:border-0">
                    <span className="text-sm">
                      {new Date(attendance.date).toLocaleDateString('en-US', { 
                        weekday: 'short', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </span>
                    <div 
                      className={`flex items-center ${
                        attendance.status === 'present' 
                          ? 'text-green-600 dark:text-green-400' 
                          : 'text-red-600 dark:text-red-400'
                      }`}
                    >
                      {attendance.status === 'present' ? (
                        <Check className="h-4 w-4 mr-1" />
                      ) : (
                        <X className="h-4 w-4 mr-1" />
                      )}
                      <span className="text-sm capitalize">{attendance.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
