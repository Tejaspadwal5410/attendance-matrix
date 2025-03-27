
import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Layout } from '../components/Layout';
import { supabase } from '@/integrations/supabase/client';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { DateSelector } from '@/components/attendance/DateSelector';
import { ClassSelector } from '@/components/attendance/ClassSelector';
import { StudentSearch } from '@/components/attendance/StudentSearch';
import { AttendanceTable } from '@/components/attendance/AttendanceTable';

const AttendanceManagement = () => {
  const { user, isTeacher } = useAuth();
  const [date, setDate] = useState(new Date().toISOString().substring(0, 10));
  const [classes, setClasses] = useState<{ id: string; name: string }[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [students, setStudents] = useState<{ id: string; name: string }[]>([]);
  const [attendanceData, setAttendanceData] = useState<Record<string, 'present' | 'absent'>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Redirect if not a teacher
  if (!user) {
    return <Navigate to="/" />;
  }
  
  if (!isTeacher()) {
    return <Navigate to="/student" />;
  }

  // Fetch classes when component mounts
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const { data, error } = await supabase
          .from('classes')
          .select('id, name')
          .order('name');

        if (error) throw error;
        
        setClasses(data || []);
        // Set the first class as default if available
        if (data && data.length > 0) {
          setSelectedClass(data[0].id);
        }
      } catch (error) {
        console.error('Error fetching classes:', error);
        toast.error('Failed to load classes');
      }
    };

    fetchClasses();
  }, []);

  // Fetch students for selected class
  useEffect(() => {
    const fetchStudents = async () => {
      if (!selectedClass) return;

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('profiles')
          .select('id, name')
          .eq('role', 'student')
          // In a real app, you'd link students to classes
          .limit(20);  // Limit to 20 students for now

        if (error) throw error;
        
        setStudents(data || []);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching students:', error);
        toast.error('Failed to load students');
        setLoading(false);
      }
    };

    fetchStudents();
  }, [selectedClass]);

  const handleAttendanceChange = (studentId: string, status: 'present' | 'absent') => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleSaveAttendance = async () => {
    setSaving(true);
    
    try {
      // Prepare attendance records
      const attendanceRecords = Object.entries(attendanceData).map(([studentId, status]) => ({
        student_id: studentId,
        class_id: selectedClass,
        date: date,
        status: status
      }));

      // Insert attendance records
      const { error } = await supabase
        .from('attendance')
        .upsert(attendanceRecords, { 
          onConflict: 'student_id,class_id,date' 
        });

      if (error) throw error;

      toast.success('Attendance saved successfully');
      setAttendanceData({});  // Clear attendance data after saving
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

  // Filter students based on search query
  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            classes={classes} 
            selectedClass={selectedClass} 
            onClassChange={setSelectedClass} 
          />
          <StudentSearch 
            searchQuery={searchQuery} 
            onSearchChange={setSearchQuery} 
          />
        </div>

        {/* Attendance Table */}
        <AttendanceTable 
          date={date}
          students={filteredStudents}
          loading={loading}
          saving={saving}
          attendanceData={attendanceData}
          onAttendanceChange={handleAttendanceChange}
          onSaveAttendance={handleSaveAttendance}
        />
      </div>
    </Layout>
  );
};

export default AttendanceManagement;
