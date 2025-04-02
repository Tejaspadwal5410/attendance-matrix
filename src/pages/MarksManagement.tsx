
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
  User,
  Upload
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
import { MOCK_DATA } from '@/utils/supabaseClient';
import { CsvUploader } from '@/components/CsvUploader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fetchStudents, fetchStudentsBySubject } from '@/utils/authUtils';
import { supabase } from '@/integrations/supabase/client';

type Mark = {
  id: string;
  student_id: string;
  subject_id: string;
  marks: number;
  exam_type: 'midterm' | 'final' | 'assignment' | 'quiz';
  created_at: string;
};

const MarksManagement = () => {
  const { user, isTeacher } = useAuth();
  const [selectedSubject, setSelectedSubject] = useState(MOCK_DATA.subjects[0]?.id || '');
  const [selectedExamType, setSelectedExamType] = useState<Mark['exam_type']>('midterm');
  const [searchQuery, setSearchQuery] = useState('');
  const [marksData, setMarksData] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("manual");
  const [students, setStudents] = useState(MOCK_DATA.users.filter(u => u.role === 'student'));
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    // Load students data
    loadStudents();
    // Load existing marks if any
    if (selectedSubject && selectedExamType) {
      loadExistingMarks();
    }
  }, [selectedSubject, selectedExamType]);
  
  const loadStudents = async () => {
    setLoading(true);
    try {
      // Get students for this subject
      const subjectStudents = await fetchStudentsBySubject(selectedSubject);
      setStudents(subjectStudents);
    } catch (error) {
      console.error('Error loading students:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const loadExistingMarks = async () => {
    try {
      // Check if we're using mock data
      if (MOCK_DATA.marks.length > 0) {
        const mockMarks = MOCK_DATA.marks.filter(
          m => m.subject_id === selectedSubject && m.exam_type === selectedExamType
        );
        
        const marksMap: Record<string, number> = {};
        mockMarks.forEach(mark => {
          marksMap[mark.student_id] = mark.marks;
        });
        
        setMarksData(marksMap);
        return;
      }
      
      // Fetch from the database
      const { data, error } = await supabase
        .from('marks')
        .select('*')
        .eq('subject_id', selectedSubject)
        .eq('exam_type', selectedExamType);
        
      if (error) {
        console.error('Error fetching marks:', error);
        return;
      }
      
      // Create a map of student ID to marks
      const marksMap: Record<string, number> = {};
      data.forEach(mark => {
        marksMap[mark.student_id] = mark.marks;
      });
      
      setMarksData(marksMap);
    } catch (error) {
      console.error('Error loading existing marks:', error);
    }
  };

  if (!user) {
    return <Navigate to="/" />;
  }
  
  if (!isTeacher()) {
    return <Navigate to="/student" />;
  }

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

  const handleSaveMarks = async () => {
    if (Object.keys(marksData).length === 0) {
      toast.error('No marks to save');
      return;
    }
    
    setSaving(true);
    
    try {
      // For mock data
      if (MOCK_DATA.marks.length > 0) {
        setTimeout(() => {
          toast.success('Marks saved successfully');
          setSaving(false);
        }, 1000);
        return;
      }
      
      // Prepare records for insertion/update
      const records = Object.entries(marksData).map(([studentId, marks]) => ({
        student_id: studentId,
        subject_id: selectedSubject,
        exam_type: selectedExamType,
        marks
      }));
      
      // Process each record individually
      let successCount = 0;
      let errorCount = 0;
      
      for (const record of records) {
        // Check if a record exists
        const { data: existingMarks, error: fetchError } = await supabase
          .from('marks')
          .select('id')
          .eq('student_id', record.student_id)
          .eq('subject_id', record.subject_id)
          .eq('exam_type', record.exam_type);
          
        if (fetchError) {
          console.error('Error checking existing mark:', fetchError);
          errorCount++;
          continue;
        }
        
        if (existingMarks && existingMarks.length > 0) {
          // Update existing record
          const { error: updateError } = await supabase
            .from('marks')
            .update({ marks: record.marks })
            .eq('id', existingMarks[0].id);
            
          if (updateError) {
            console.error('Error updating mark:', updateError);
            errorCount++;
          } else {
            successCount++;
          }
        } else {
          // Insert new record
          const { error: insertError } = await supabase
            .from('marks')
            .insert([record]);
            
          if (insertError) {
            console.error('Error inserting mark:', insertError);
            errorCount++;
          } else {
            successCount++;
          }
        }
      }
      
      if (errorCount > 0) {
        toast.warning(`Saved ${successCount} records with ${errorCount} errors`);
      } else {
        toast.success(`Successfully saved ${successCount} student marks`);
      }
    } catch (error) {
      console.error('Error saving marks:', error);
      toast.error('An unexpected error occurred while saving marks');
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadReport = () => {
    // Create CSV content
    let csvContent = "Student ID,Student Name,Marks\n";
    
    filteredStudents.forEach(student => {
      const marks = marksData[student.id] !== undefined ? marksData[student.id] : '';
      csvContent += `${student.id},${student.name},${marks}\n`;
    });
    
    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', `${selectedExamType}_marks_${new Date().toISOString().split('T')[0]}.csv`);
    a.click();
    
    toast.success('Marks report downloaded');
  };

  const handleUploadSuccess = () => {
    // Refresh marks data
    loadExistingMarks();
    toast.success('Marks uploaded successfully');
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

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full md:w-96 grid-cols-2">
            <TabsTrigger value="manual" className="flex items-center">
              <PenLine className="h-4 w-4 mr-2" />
              Manual Entry
            </TabsTrigger>
            <TabsTrigger value="csv" className="flex items-center">
              <Upload className="h-4 w-4 mr-2" />
              CSV Upload
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="manual" className="mt-4">
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
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center h-24">
                            <div className="flex justify-center items-center h-full">
                              <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : filteredStudents.length > 0 ? (
                        filteredStudents.map((student, index) => (
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
                        ))
                      ) : (
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
          </TabsContent>
          
          <TabsContent value="csv" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <CsvUploader 
                  subjectId={selectedSubject} 
                  examType={selectedExamType}
                  onUploadSuccess={handleUploadSuccess}
                />
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">CSV Format Guide</CardTitle>
                  <CardDescription>
                    How to prepare your CSV file for upload
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">CSV Structure</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        Your CSV file should have the following format:
                      </p>
                      <div className="bg-secondary p-3 rounded-md text-xs font-mono">
                        student_id,marks<br/>
                        student1_id,85<br/>
                        student2_id,92<br/>
                        student3_id,78
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Important Notes</h4>
                      <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                        <li>First row containing headers is optional</li>
                        <li>Student IDs must match existing students</li>
                        <li>Marks must be numbers between 0 and 100</li>
                        <li>Duplicate student IDs will update existing marks</li>
                      </ul>
                    </div>
                    
                    <Button 
                      variant="outline" 
                      className="w-full text-xs" 
                      onClick={() => {
                        // Generate sample CSV
                        const csvHeader = "student_id,marks\n";
                        const csvData = students.slice(0, 3).map(s => `${s.id},85`).join("\n");
                        const csvContent = csvHeader + csvData;
                        
                        // Create blob and download
                        const blob = new Blob([csvContent], { type: 'text/csv' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.setAttribute('href', url);
                        a.setAttribute('download', 'sample_marks.csv');
                        a.click();
                      }}
                    >
                      <Download className="h-3.5 w-3.5 mr-1" />
                      Download Sample CSV
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default MarksManagement;
