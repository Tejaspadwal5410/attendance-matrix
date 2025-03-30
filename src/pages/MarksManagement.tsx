import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { useAuth } from '../hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BookOpen, 
  Download, 
  PenLine, 
  Save, 
  Search, 
  User 
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';

const MarksManagement = () => {
  const { user, isTeacher } = useAuth();
  const [selectedSubject, setSelectedSubject] = useState(MOCK_DATA.subjects[0]?.id || '');
  const [selectedExamType, setSelectedExamType] = useState<Mark['exam_type']>('midterm');
  const [searchQuery, setSearchQuery] = useState('');
  const [marksData, setMarksData] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState(false);

  if (!user) {
    return <Navigate to="/" />;
  }
  
  if (!isTeacher()) {
    return <Navigate to="/student" />;
  }

  const students = MOCK_DATA.users.filter(u => u.role === 'student');
  const subjects = MOCK_DATA.subjects;
  const examTypes: Mark['exam_type'][] = ['midterm', 'final', 'assignment', 'quiz'];

  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubjectChange = (value: string) => {
    setSelectedSubject(value);
  };

  const handleExamTypeChange = (value: Mark['exam_type']) => {
    setSelectedExamType(value);
  };

  const handleMarksChange = (studentId: string, marks: string) => {
    const parsedMarks = parseInt(marks, 10);
    
    if (!isNaN(parsedMarks) && parsedMarks >= 0 && parsedMarks <= 100) {
      setMarksData(prev => ({
        ...prev,
        [studentId]: parsedMarks
      }));
    }
  };

  const handleSaveMarks = () => {
    setSaving(true);
    
    setTimeout(() => {
      toast.success('Marks saved successfully');
      setSaving(false);
    }, 1000);
  };

  const handleDownloadReport = () => {
    toast.success('Marks report downloaded');
  };

  const getGradeLabel = (marks: number) => {
    if (marks >= 90) return 'A+';
    if (marks >= 80) return 'A';
    if (marks >= 70) return 'B';
    if (marks >= 60) return 'C';
    if (marks >= 50) return 'D';
    return 'F';
  };

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Marks Management</h2>
            <p className="text-muted-foreground">
              Enter and manage student marks and grades
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="col-span-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-md font-medium flex items-center">
                <BookOpen className="h-4 w-4 mr-2" />
                Select Subject
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                value={selectedSubject}
                onValueChange={handleSubjectChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card className="col-span-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-md font-medium flex items-center">
                <PenLine className="h-4 w-4 mr-2" />
                Exam Type
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                value={selectedExamType}
                onValueChange={(value) => handleExamTypeChange(value as Mark['exam_type'])}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select exam type" />
                </SelectTrigger>
                <SelectContent>
                  {examTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
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

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                {selectedExamType.charAt(0).toUpperCase() + selectedExamType.slice(1)} Marks
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Subject: {subjects.find(s => s.id === selectedSubject)?.name || 'None selected'}
              </p>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Student Name</TableHead>
                    <TableHead className="w-32 text-center">Marks (0-100)</TableHead>
                    <TableHead className="w-24 text-center">Grade</TableHead>
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
                        <Input 
                          type="number" 
                          min="0" 
                          max="100"
                          placeholder="0-100"
                          value={marksData[student.id] !== undefined ? marksData[student.id] : ''}
                          onChange={(e) => handleMarksChange(student.id, e.target.value)}
                          className="text-center"
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        {marksData[student.id] !== undefined && (
                          <div 
                            className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                              marksData[student.id] >= 80 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' 
                                : marksData[student.id] >= 60 
                                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100' 
                                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
                            }`}
                          >
                            {getGradeLabel(marksData[student.id])}
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  
                  {filteredStudents.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                        No students found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            
            <div className="mt-4 flex justify-end">
              <Button 
                onClick={handleSaveMarks} 
                disabled={saving || Object.keys(marksData).length === 0}
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
                    <span>Save Marks</span>
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

export default MarksManagement;
