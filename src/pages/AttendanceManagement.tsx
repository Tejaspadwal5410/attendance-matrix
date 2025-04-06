
import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Layout } from '../components/Layout';
import { MOCK_DATA } from '../utils/supabaseClient';
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
  X, 
  Plus,
  Upload
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { 
  fetchStudents, 
  fetchClasses, 
  saveAttendanceRecords, 
  fetchAttendanceRecords,
  addNewStudent
} from '../utils/authUtils';

const AttendanceManagement = () => {
  const { user, isTeacher, isDemoUser } = useAuth();
  const [date, setDate] = useState(new Date().toISOString().substring(0, 10));
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedBatch, setSelectedBatch] = useState('');
  const [selectedBoard, setSelectedBoard] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [attendanceData, setAttendanceData] = useState<Record<string, 'present' | 'absent'>>({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newStudent, setNewStudent] = useState({
    registerNumber: '',
    name: '',
    email: '',
    password: '',
    class: '',
    batch: '',
    board: ''
  });
  const [isAddingStudent, setIsAddingStudent] = useState(false);

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
          const records = await fetchAttendanceRecords(selectedClass, date, selectedBatch);
          
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
  }, [date, selectedClass, selectedBatch]);

  // Load students when class, batch, or board changes
  useEffect(() => {
    async function loadStudents() {
      if (!selectedClass && !selectedBatch) return;
      
      setLoading(true);
      try {
        const fetchedStudents = await fetchStudents(selectedClass, selectedBatch);
        setStudents(fetchedStudents);
      } catch (error) {
        console.error('Error loading students:', error);
        toast.error('Failed to load students');
      } finally {
        setLoading(false);
      }
    }
    
    loadStudents();
  }, [selectedClass, selectedBatch, selectedBoard]);

  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDateChange = (value: string) => {
    setDate(value);
  };

  const handleClassChange = (value: string) => {
    setSelectedClass(value);
  };

  const handleBatchChange = (value: string) => {
    setSelectedBatch(value);
  };

  const handleBoardChange = (value: string) => {
    setSelectedBoard(value);
  };

  const handleAttendanceChange = (studentId: string, status: 'present' | 'absent') => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  // Only updating the handleSaveAttendance function to match the new function signature
  const handleSaveAttendance = async () => {
    if (!selectedClass) {
      toast.error('Please select a class');
      return;
    }

    if (Object.keys(attendanceData).length === 0) {
      toast.error('No attendance data to save');
      return;
    }
    
    setSaving(true);
    
    try {
      const success = await saveAttendanceRecords(
        attendanceData, 
        date, 
        selectedClass,
        selectedBatch
      );
      
      if (success) {
        toast.success('Attendance saved successfully');
      } else {
        toast.error('Failed to save attendance');
      }
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
    if (!selectedClass || !selectedBatch) {
      toast.error('Please select a class and batch to download report');
      return;
    }
    
    toast.success('Attendance report downloaded');
  };

  const handleAddStudent = async () => {
    if (!newStudent.registerNumber || !newStudent.name || !newStudent.email || 
        !newStudent.password || !newStudent.class || !newStudent.batch || 
        !newStudent.board) {
      toast.error('All fields are required');
      return;
    }
    
    setIsAddingStudent(true);
    
    try {
      const success = await addNewStudent({
        name: newStudent.name,
        email: newStudent.email,
        password: newStudent.password,
        registerNumber: newStudent.registerNumber,
        class: newStudent.class,
        batch: newStudent.batch,
        board: newStudent.board
      });
      
      if (success) {
        // Refresh the student list if current filters match the new student
        if (
          (!selectedClass || selectedClass === newStudent.class) &&
          (!selectedBatch || selectedBatch === newStudent.batch) &&
          (!selectedBoard || selectedBoard === newStudent.board)
        ) {
          const fetchedStudents = await fetchStudents(selectedClass, selectedBatch);
          setStudents(fetchedStudents);
        }
        
        // Reset the form
        setNewStudent({
          registerNumber: '',
          name: '',
          email: '',
          password: '',
          class: '',
          batch: '',
          board: ''
        });
        
        // Close the modal
        setIsModalOpen(false);
        toast.success('Student added successfully');
      }
    } catch (error) {
      console.error('Error adding student:', error);
      toast.error('Failed to add student');
    } finally {
      setIsAddingStudent(false);
    }
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
          <div className="flex gap-4">
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={() => setIsModalOpen(true)}
            >
              <Plus className="h-4 w-4" />
              <span>Add Student</span>
            </Button>
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={handleDownloadReport}
            >
              <Download className="h-4 w-4" />
              <span>Download Report</span>
            </Button>
          </div>
        </div>

        {/* Add Student Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Student</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="registerNumber" className="text-sm font-medium">Register Number</label>
                <Input
                  id="registerNumber"
                  type="text"
                  placeholder="Enter register number"
                  value={newStudent.registerNumber}
                  onChange={(e) => setNewStudent({ ...newStudent, registerNumber: e.target.value })}
                  disabled={isAddingStudent}
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="studentName" className="text-sm font-medium">Student Name</label>
                <Input
                  id="studentName"
                  type="text"
                  placeholder="Enter student name"
                  value={newStudent.name}
                  onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                  disabled={isAddingStudent}
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="studentEmail" className="text-sm font-medium">Email Address</label>
                <Input
                  id="studentEmail"
                  type="email"
                  placeholder="Enter student email"
                  value={newStudent.email}
                  onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                  disabled={isAddingStudent}
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="studentPassword" className="text-sm font-medium">Password</label>
                <Input
                  id="studentPassword"
                  type="password"
                  placeholder="Enter password"
                  value={newStudent.password}
                  onChange={(e) => setNewStudent({ ...newStudent, password: e.target.value })}
                  disabled={isAddingStudent}
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="studentClass" className="text-sm font-medium">Class</label>
                <Select
                  value={newStudent.class}
                  onValueChange={(value) => setNewStudent({ ...newStudent, class: value })}
                  disabled={isAddingStudent}
                >
                  <SelectTrigger id="studentClass">
                    <SelectValue placeholder="Select Class" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => (
                      <SelectItem key={i + 1} value={(i + 1).toString()}>
                        Class {i + 1}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="studentBatch" className="text-sm font-medium">Batch</label>
                <Select
                  value={newStudent.batch}
                  onValueChange={(value) => setNewStudent({ ...newStudent, batch: value })}
                  disabled={isAddingStudent}
                >
                  <SelectTrigger id="studentBatch">
                    <SelectValue placeholder="Select Batch" />
                  </SelectTrigger>
                  <SelectContent>
                    {['A', 'B', 'C', 'D', 'E'].map((batch) => (
                      <SelectItem key={batch} value={batch}>
                        Batch {batch}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="studentBoard" className="text-sm font-medium">Board</label>
                <Select
                  value={newStudent.board}
                  onValueChange={(value) => setNewStudent({ ...newStudent, board: value })}
                  disabled={isAddingStudent}
                >
                  <SelectTrigger id="studentBoard">
                    <SelectValue placeholder="Select Board" />
                  </SelectTrigger>
                  <SelectContent>
                    {['CBSE', 'ICSE', 'State Board', 'IB'].map((board) => (
                      <SelectItem key={board} value={board}>
                        {board}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setIsModalOpen(false)}
                disabled={isAddingStudent}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleAddStudent}
                disabled={isAddingStudent}
              >
                {isAddingStudent ? (
                  <>
                    <div className="h-4 w-4 mr-2 rounded-full border-2 border-current border-t-transparent animate-spin"></div>
                    Adding...
                  </>
                ) : 'Add Student'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
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
                Class
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                value={selectedClass}
                onValueChange={handleClassChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => (
                    <SelectItem key={i + 1} value={(i + 1).toString()}>
                      Class {i + 1}
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
                Batch
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                value={selectedBatch}
                onValueChange={handleBatchChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select batch" />
                </SelectTrigger>
                <SelectContent>
                  {['A', 'B', 'C', 'D', 'E'].map((batch) => (
                    <SelectItem key={batch} value={batch}>
                      Batch {batch}
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
                Board
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                value={selectedBoard}
                onValueChange={handleBoardChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select board" />
                </SelectTrigger>
                <SelectContent>
                  {['CBSE', 'ICSE', 'State Board', 'IB'].map((board) => (
                    <SelectItem key={board} value={board}>
                      {board}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card className="col-span-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-md font-medium flex items-center">
                <Search className="h-4 w-4 mr-2" />
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
            {!selectedClass || !selectedBatch ? (
              <div className="h-32 flex items-center justify-center text-muted-foreground">
                Please select both class and batch to view the attendance sheet
              </div>
            ) : loading ? (
              <div className="h-32 flex items-center justify-center">
                <div className="h-8 w-8 rounded-full border-4 border-t-transparent border-primary animate-spin"></div>
              </div>
            ) : (
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
                            {student.class && (
                              <span className="text-xs text-muted-foreground ml-2">
                                Class {student.class}, Batch {student.batch}
                              </span>
                            )}
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
                          No students found. Try changing filters or adding new students.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
            
            {filteredStudents.length > 0 && (
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
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default AttendanceManagement;
