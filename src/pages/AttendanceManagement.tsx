
import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Layout } from '../components/Layout';
import { MOCK_DATA } from '../utils/supabaseClient';
import { Download, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { 
  fetchStudents, 
  fetchClasses, 
  saveAttendanceRecords, 
  fetchAttendanceRecords 
} from '../utils/authUtils';

// Import the new components
import { DateSelector } from '../components/attendance/DateSelector';
import { ClassSelector } from '../components/attendance/ClassSelector';
import { StudentSearch } from '../components/attendance/StudentSearch';
import { AttendanceTable } from '../components/attendance/AttendanceTable';

const AttendanceManagement = () => {
  const { user, isTeacher, isDemoUser } = useAuth();
  const [date, setDate] = useState(new Date().toISOString().substring(0, 10));
  const [selectedClass, setSelectedClass] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [attendanceData, setAttendanceData] = useState<Record<string, 'present' | 'absent'>>({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);

  // Redirect if not a teacher
  if (!user) {
    return <Navigate to="/" />;
  }
  
  if (!isTeacher()) {
    return <Navigate to="/student" />;
  }

  // Fetch students and classes when component mounts
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        if (isDemoUser()) {
          // Use mock data for demo users
          setStudents(MOCK_DATA.users.filter(u => u.role === 'student'));
          setClasses(MOCK_DATA.classes);
          if (!selectedClass && MOCK_DATA.classes.length > 0) {
            setSelectedClass(MOCK_DATA.classes[0].id);
          }
        } else {
          // Fetch real data from the database
          const [fetchedStudents, fetchedClasses] = await Promise.all([
            fetchStudents(),
            fetchClasses()
          ]);
          
          setStudents(fetchedStudents);
          setClasses(fetchedClasses);
          
          if (!selectedClass && fetchedClasses.length > 0) {
            setSelectedClass(fetchedClasses[0].id);
          }
        }
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    }
    
    loadData();
  }, []);

  // Fetch attendance data when date or class changes
  useEffect(() => {
    async function loadAttendance() {
      if (!selectedClass || !date) return;
      
      try {
        if (isDemoUser()) {
          // Use mock data for demo users
          const mockAttendance = MOCK_DATA.attendance
            .filter(a => a.class_id === selectedClass && a.date === date)
            .reduce((acc, curr) => {
              acc[curr.student_id] = curr.status;
              return acc;
            }, {} as Record<string, 'present' | 'absent'>);
          
          setAttendanceData(mockAttendance);
        } else {
          // Fetch real attendance data from the database
          const records = await fetchAttendanceRecords(date, selectedClass);
          
          const attendanceMap = records.reduce((acc, curr) => {
            acc[curr.student_id] = curr.status;
            return acc;
          }, {} as Record<string, 'present' | 'absent'>);
          
          setAttendanceData(attendanceMap);
        }
      } catch (error) {
        console.error('Error loading attendance:', error);
        toast.error('Failed to load attendance data');
      }
    }
    
    loadAttendance();
  }, [date, selectedClass]);

  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAttendanceChange = (studentId: string, status: 'present' | 'absent') => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleSaveAttendance = async () => {
    if (Object.keys(attendanceData).length === 0) {
      toast.error('No attendance data to save');
      return;
    }
    
    setSaving(true);
    
    try {
      if (isDemoUser()) {
        // Simulate API call for demo users
        setTimeout(() => {
          toast.success('Attendance saved successfully (Demo Mode)');
          setSaving(false);
        }, 1000);
      } else {
        // Save attendance to the database
        const success = await saveAttendanceRecords(attendanceData, date, selectedClass);
        if (success) {
          toast.success('Attendance saved successfully');
        }
      }
    } catch (error) {
      console.error('Error saving attendance:', error);
      toast.error('Failed to save attendance');
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadReport = () => {
    toast.success('Attendance report downloaded');
  };

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Attendance Management</h2>
            <p className="text-muted-foreground">
              Mark and manage student attendance records
            </p>
          </div>
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={handleDownloadReport}
          >
            <Download className="h-4 w-4" />
            <span>Download Report</span>
          </Button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <DateSelector date={date} onDateChange={setDate} />
          <ClassSelector 
            selectedClass={selectedClass} 
            classes={classes} 
            onClassChange={setSelectedClass} 
          />
          <StudentSearch 
            searchQuery={searchQuery} 
            onSearchChange={setSearchQuery} 
          />
        </div>

        {/* Attendance Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Attendance Sheet</CardTitle>
              <p className="text-sm text-muted-foreground">
                {new Date(date).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          </CardHeader>
          <CardContent>
            <AttendanceTable 
              students={filteredStudents}
              loading={loading}
              attendanceData={attendanceData}
              onAttendanceChange={handleAttendanceChange}
            />
            
            <div className="mt-4 flex justify-end">
              <Button 
                onClick={handleSaveAttendance} 
                disabled={saving || Object.keys(attendanceData).length === 0}
                className="flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>Save Attendance</span>
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default AttendanceManagement;
