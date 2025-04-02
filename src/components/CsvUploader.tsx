
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, FileUp, Check, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';

interface CsvUploaderProps {
  subjectId: string;
  examType: string;
  onUploadSuccess: () => void;
}

export const CsvUploader: React.FC<CsvUploaderProps> = ({ 
  subjectId, 
  examType,
  onUploadSuccess 
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
      setUploadSuccess(false);
    } else {
      toast.error('Please select a valid CSV file');
      setFile(null);
    }
  };
  
  const handleUpload = async () => {
    if (!file || !subjectId || !examType) {
      toast.error('Please select a file, subject, and exam type');
      return;
    }
    
    setIsUploading(true);
    
    try {
      // Read the CSV file
      const text = await file.text();
      const rows = text.split('\n');
      
      // Parse CSV (assuming format: student_id,marks)
      // Skip header row if it exists (first row)
      const isFirstRowHeader = rows[0].includes('student_id') || 
                              rows[0].includes('Student ID') || 
                              isNaN(parseInt(rows[0].split(',')[1]));
      
      const startRow = isFirstRowHeader ? 1 : 0;
      
      // Create batch of marks to insert
      const marksToInsert = [];
      
      for (let i = startRow; i < rows.length; i++) {
        const row = rows[i].trim();
        if (!row) continue; // Skip empty rows
        
        const [studentId, marksStr] = row.split(',');
        if (!studentId || !marksStr) continue;
        
        const marks = parseInt(marksStr.trim());
        if (isNaN(marks) || marks < 0 || marks > 100) {
          toast.error(`Invalid marks value in row ${i + 1}: ${marksStr}`);
          continue;
        }
        
        marksToInsert.push({
          student_id: studentId.trim(),
          subject_id: subjectId,
          exam_type: examType,
          marks: marks
        });
      }
      
      // Use upsert to handle duplicate student records
      if (marksToInsert.length > 0) {
        // Fix: Properly specify the on_conflict parameter with an array of columns
        const { error } = await supabase
          .from('marks')
          .upsert(marksToInsert, { 
            onConflict: 'student_id,subject_id,exam_type'
          });
        
        if (error) throw error;
        
        toast.success(`Successfully processed ${marksToInsert.length} student records`);
        setUploadSuccess(true);
        onUploadSuccess();
      } else {
        toast.error('No valid data found in the CSV file');
      }
    } catch (error) {
      console.error('Error uploading marks:', error);
      toast.error('Failed to upload marks. Please check your CSV format and try again.');
    } finally {
      setIsUploading(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Upload Marks CSV</CardTitle>
        <CardDescription>
          Upload a CSV file with student marks data
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-center w-full">
            <label 
              htmlFor="csv-file" 
              className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer 
                ${file ? 'bg-green-50 border-green-300 dark:bg-green-900/20 dark:border-green-800' : 
                'border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800/20'}`}
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                {uploadSuccess ? (
                  <>
                    <Check className="w-8 h-8 mb-3 text-green-500" />
                    <p className="text-sm text-green-600 dark:text-green-400">File successfully uploaded</p>
                  </>
                ) : file ? (
                  <>
                    <FileUp className="w-8 h-8 mb-3 text-primary" />
                    <p className="text-sm text-muted-foreground">{file.name}</p>
                    <p className="text-xs text-muted-foreground">Click upload button below</p>
                  </>
                ) : (
                  <>
                    <Upload className="w-8 h-8 mb-3 text-gray-400" />
                    <p className="text-sm text-muted-foreground">Click to select a CSV file</p>
                    <p className="text-xs text-muted-foreground">Student ID, Marks (0-100)</p>
                  </>
                )}
              </div>
              <input 
                id="csv-file" 
                type="file" 
                accept=".csv" 
                className="hidden" 
                onChange={handleFileChange}
              />
            </label>
          </div>
          
          <div className="flex items-center">
            <AlertCircle className="h-4 w-4 mr-2 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">
              CSV should have student_id and marks columns, one row per student.
            </p>
          </div>
          
          <Button 
            onClick={handleUpload} 
            disabled={!file || isUploading || uploadSuccess} 
            className="w-full"
          >
            {isUploading ? (
              <>
                <div className="h-4 w-4 mr-2 rounded-full border-2 border-current border-t-transparent animate-spin"></div>
                Uploading...
              </>
            ) : uploadSuccess ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                Uploaded Successfully
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload Marks
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
