
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';

interface AttendanceTableProps {
  students: any[];
  loading: boolean;
  attendanceData: Record<string, 'present' | 'absent'>;
  onAttendanceChange: (studentId: string, status: 'present' | 'absent') => void;
}

export const AttendanceTable: React.FC<AttendanceTableProps> = ({
  students,
  loading,
  attendanceData,
  onAttendanceChange
}) => {
  if (loading) {
    return (
      <div className="h-32 flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-4 border-t-transparent border-primary animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">#</TableHead>
            <TableHead>Student Name</TableHead>
            <TableHead className="w-48 text-center">Attendance</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {students.length > 0 ? (
            students.map((student, index) => (
              <TableRow key={student.id}>
                <TableCell className="font-medium">{index + 1}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                      {student.name.substring(0, 1).toUpperCase()}
                    </div>
                    <span>{student.name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex justify-center gap-2">
                    <Button
                      size="sm"
                      variant={attendanceData[student.id] === 'present' ? 'default' : 'outline'}
                      className={`w-24 ${
                        attendanceData[student.id] === 'present' 
                          ? 'bg-green-500 hover:bg-green-600' 
                          : 'text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700'
                      }`}
                      onClick={() => onAttendanceChange(student.id, 'present')}
                    >
                      <Check className="h-4 w-4 mr-1" /> Present
                    </Button>
                    <Button
                      size="sm"
                      variant={attendanceData[student.id] === 'absent' ? 'default' : 'outline'}
                      className={`w-24 ${
                        attendanceData[student.id] === 'absent' 
                          ? 'bg-red-500 hover:bg-red-600' 
                          : 'text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700'
                      }`}
                      onClick={() => onAttendanceChange(student.id, 'absent')}
                    >
                      <X className="h-4 w-4 mr-1" /> Absent
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={3} className="text-center h-24 text-muted-foreground">
                No students found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
