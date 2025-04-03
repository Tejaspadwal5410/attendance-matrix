
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { useAuth } from '../hooks/useAuth';
import { Button } from '@/components/ui/button';
import { BookOpen, Download, PenLine, Upload } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MOCK_DATA, User as UserType } from '@/utils/supabaseClient';
import { toast } from 'sonner';
import { fetchStudents, fetchStudentsBySubject } from '@/utils/authUtils';
import { supabase } from '@/integrations/supabase/client';
import { MarksFilters } from '@/components/marks/MarksFilters';
import { MarksTable } from '@/components/marks/MarksTable';
import { MarksUploader } from '@/components/marks/MarksUploader';
import { ExamType, MarksData } from '@/types/marks';

const MarksManagement = () => {
  const { user, isTeacher } = useAuth();
  const [selectedSubject, setSelectedSubject] = useState(MOCK_DATA.subjects[0]?.id || '');
  const [selectedExamType, setSelectedExamType] = useState<ExamType>('midterm');
  const [searchQuery, setSearchQuery] = useState('');
  const [marksData, setMarksData] = useState<MarksData>({});
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("manual");
  const [students, setStudents] = useState<UserType[]>(MOCK_DATA.users.filter(u => u.role === 'student'));
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    loadStudents();
    if (selectedSubject && selectedExamType) {
      loadExistingMarks();
    }
  }, [selectedSubject, selectedExamType]);
  
  const loadStudents = async () => {
    setLoading(true);
    try {
      const subjectStudents = await fetchStudentsBySubject(selectedSubject);
      
      const processedStudents = subjectStudents.map(student => ({
        ...student,
        avatar_url: student.avatar_url || ''
      }));
      
      setStudents(processedStudents);
    } catch (error) {
      console.error('Error loading students:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const loadExistingMarks = async () => {
    try {
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
      
      const { data, error } = await supabase
        .from('marks')
        .select('*')
        .eq('subject_id', selectedSubject)
        .eq('exam_type', selectedExamType);
        
      if (error) {
        console.error('Error fetching marks:', error);
        return;
      }
      
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
  const examTypes: ExamType[] = ['midterm', 'final', 'assignment', 'quiz'];

  const handleSubjectChange = (value: string) => {
    setSelectedSubject(value);
  };

  const handleExamTypeChange = (value: ExamType) => {
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
      if (MOCK_DATA.marks.length > 0) {
        setTimeout(() => {
          toast.success('Marks saved successfully');
          setSaving(false);
        }, 1000);
        return;
      }
      
      const records = Object.entries(marksData).map(([studentId, marks]) => ({
        student_id: studentId,
        subject_id: selectedSubject,
        exam_type: selectedExamType,
        marks
      }));
      
      let successCount = 0;
      let errorCount = 0;
      
      for (const record of records) {
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
    let csvContent = "Student ID,Student Name,Marks\n";
    
    students.filter(student => 
      student.name.toLowerCase().includes(searchQuery.toLowerCase())
    ).forEach(student => {
      const marks = marksData[student.id] !== undefined ? marksData[student.id] : '';
      csvContent += `${student.id},${student.name},${marks}\n`;
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', `${selectedExamType}_marks_${new Date().toISOString().split('T')[0]}.csv`);
    a.click();
    
    toast.success('Marks report downloaded');
  };

  const handleUploadSuccess = () => {
    loadExistingMarks();
    toast.success('Marks uploaded successfully');
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

        <MarksFilters 
          subjects={subjects}
          selectedSubject={selectedSubject}
          handleSubjectChange={handleSubjectChange}
          examTypes={examTypes}
          selectedExamType={selectedExamType}
          handleExamTypeChange={handleExamTypeChange}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

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
            <MarksTable
              students={students}
              loading={loading}
              marksData={marksData}
              handleMarksChange={handleMarksChange}
              handleSaveMarks={handleSaveMarks}
              saving={saving}
              searchQuery={searchQuery}
            />
          </TabsContent>
          
          <TabsContent value="csv" className="mt-4">
            <MarksUploader 
              subjectId={selectedSubject} 
              examType={selectedExamType}
              onUploadSuccess={handleUploadSuccess}
              subjects={subjects}
            />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default MarksManagement;
