
import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Layout } from '../components/Layout';
import { supabase } from '@/integrations/supabase/client';
import { 
  CalendarDays, 
  Check, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Download, 
  Save, 
  Search, 
  User, 
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { toast } from 'sonner';

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

  const handleDateChange = (value: string) => {
    setDate(value);
  };

  const handleClassChange = (value: string) => {
    setSelectedClass(value);
  };

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

  const handlePreviousDay = () => {
    const currentDate = new Date(date);
    currentDate.setDate(currentDate.getDate() - 1);
    setDate(currentDate.toISOString().substring(0, 10));
  };

  const handleNextDay = () => {
    const currentDate = new Date(date);
    currentDate.setDate(currentDate.getDate() + 1);
    setDate(currentDate.toISOString().substring(0, 10));
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
          <Card className="col-span-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-md font-medium flex items-center">
                <CalendarDays className="h-4 w-4 mr-2" />
                Select Date
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handlePreviousDay}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="flex-1">
                  <Input
                    type="date"
                    value={date}
                    onChange={(e) => handleDateChange(e.target.value)}
                    className="text-center"
                  />
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleNextDay}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-md font-medium flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                Select Class
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                value={selectedClass}
                onValueChange={handleClassChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card className="col-span-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-md font-medium flex items-center">
                <User className="h-4 w-4 mr-2" />
                Search Student
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search by name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </CardContent>
          </Card>
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
            {loading ? (
              <div className="flex justify-center items-center h-24">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <>
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
                      {filteredStudents.map((student, index) => (
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
                                onClick={() => handleAttendanceChange(student.id, 'present')}
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
                                onClick={() => handleAttendanceChange(student.id, 'absent')}
                              >
                                <X className="h-4 w-4 mr-1" /> Absent
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      
                      {filteredStudents.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center h-24 text-muted-foreground">
                            No students found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
                
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
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default AttendanceManagement;
