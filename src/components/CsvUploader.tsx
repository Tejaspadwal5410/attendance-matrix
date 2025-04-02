
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, FileUp, Check, AlertCircle, Info } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { validateStudentIds, fetchStudentsBySubject } from '@/utils/authUtils';
import { Progress } from '@/components/ui/progress';

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
  const [uploadProgress, setUploadProgress] = useState(0);
  const [totalRows, setTotalRows] = useState(0);
  const [processedRows, setProcessedRows] = useState(0);
  const [validationStatus, setValidationStatus] = useState<{
    total: number;
    valid: number;
    invalid: number;
  }>({ total: 0, valid: 0, invalid: 0 });
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
      setUploadSuccess(false);
      setUploadProgress(0);
      setProcessedRows(0);
      setTotalRows(0);
      setValidationStatus({ total: 0, valid: 0, invalid: 0 });
    } else {
      toast.error('Please select a valid CSV file');
      setFile(null);
    }
  };
  
  const validateCsvData = async (rows: string[]): Promise<{
    validRows: { student_id: string; marks: number }[];
    invalidStudentIds: string[];
    invalidMarks: { row: number; value: string }[];
  }> => {
    // Parse CSV rows
    const isFirstRowHeader = rows[0].includes('student_id') || 
                            rows[0].includes('Student ID') || 
                            isNaN(parseInt(rows[0].split(',')[1]));
    
    const startRow = isFirstRowHeader ? 1 : 0;
    
    const parsedRows: { student_id: string; marks: number }[] = [];
    const invalidMarks: { row: number; value: string }[] = [];
    const studentIds: string[] = [];
    
    for (let i = startRow; i < rows.length; i++) {
      const row = rows[i].trim();
      if (!row) continue; // Skip empty rows
      
      const [studentId, marksStr] = row.split(',');
      if (!studentId || !marksStr) continue;
      
      const marks = parseInt(marksStr.trim());
      
      if (isNaN(marks) || marks < 0 || marks > 100) {
        invalidMarks.push({ row: i + 1, value: marksStr });
        continue;
      }
      
      // Add valid student ID to our array for later validation
      studentIds.push(studentId.trim());
      parsedRows.push({
        student_id: studentId.trim(),
        marks
      });
    }
    
    // Validate student IDs against database
    const validStudentIds = await validateStudentIds(studentIds);
    const invalidStudentIds = studentIds.filter(id => !validStudentIds.includes(id));
    
    // Filter rows to only include valid student IDs
    const validRows = parsedRows.filter(row => validStudentIds.includes(row.student_id));
    
    return {
      validRows,
      invalidStudentIds,
      invalidMarks
    };
  };
  
  const handleUpload = async () => {
    if (!file || !subjectId || !examType) {
      toast.error('Please select a file, subject, and exam type');
      return;
    }
    
    setIsUploading(true);
    setUploadProgress(5); // Start progress
    
    try {
      // Read the CSV file
      const text = await file.text();
      const rows = text.split('\n');
      
      // Validate CSV data
      const { validRows, invalidStudentIds, invalidMarks } = await validateCsvData(rows);
      
      setValidationStatus({
        total: rows.length,
        valid: validRows.length,
        invalid: invalidStudentIds.length + invalidMarks.length
      });
      
      setTotalRows(validRows.length);
      
      if (validRows.length === 0) {
        toast.error('No valid data found in the CSV file');
        setIsUploading(false);
        return;
      }
      
      if (invalidStudentIds.length > 0) {
        toast.warning(`${invalidStudentIds.length} invalid student IDs found in the CSV`);
      }
      
      if (invalidMarks.length > 0) {
        toast.warning(`${invalidMarks.length} invalid marks values found in the CSV`);
      }
      
      // Process each valid record individually
      let successCount = 0;
      let errorCount = 0;
      
      setUploadProgress(20); // After validation
      
      for (let i = 0; i < validRows.length; i++) {
        const row = validRows[i];
        
        // Check if the record exists
        const { data: existingMarks, error: fetchError } = await supabase
          .from('marks')
          .select('id')
          .eq('student_id', row.student_id)
          .eq('subject_id', subjectId)
          .eq('exam_type', examType);
          
        if (fetchError) {
          console.error('Error checking existing mark:', fetchError);
          errorCount++;
          continue;
        }
        
        // Update or insert based on whether the record exists
        if (existingMarks && existingMarks.length > 0) {
          // Update existing record
          const { error: updateError } = await supabase
            .from('marks')
            .update({ marks: row.marks })
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
            .insert([{
              student_id: row.student_id,
              subject_id: subjectId,
              exam_type: examType,
              marks: row.marks
            }]);
            
          if (insertError) {
            console.error('Error inserting mark:', insertError);
            errorCount++;
          } else {
            successCount++;
          }
        }
        
        // Update progress
        setProcessedRows(i + 1);
        setUploadProgress(20 + Math.floor((i + 1) / validRows.length * 80));
      }
      
      if (errorCount > 0) {
        toast.warning(`Processed ${successCount} records successfully with ${errorCount} errors`);
      } else {
        toast.success(`Successfully processed ${successCount} student records`);
        setUploadSuccess(true);
        onUploadSuccess();
      }
    } catch (error) {
      console.error('Error uploading marks:', error);
      toast.error('Failed to upload marks. Please check your CSV format and try again.');
    } finally {
      setIsUploading(false);
      setUploadProgress(100);
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
          
          {isUploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Uploading...</span>
                <span>{Math.min(uploadProgress, 100)}%</span>
              </div>
              <Progress value={uploadProgress} className="h-1" />
              {totalRows > 0 && (
                <p className="text-xs text-muted-foreground text-center">
                  Processing {processedRows} of {totalRows} records
                </p>
              )}
            </div>
          )}
          
          {validationStatus.total > 0 && !isUploading && (
            <div className="flex items-start p-3 rounded-md bg-secondary">
              <Info className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
              <div className="text-xs">
                <p className="font-medium">CSV Validation Results:</p>
                <ul className="mt-1 space-y-1">
                  <li>Total rows: {validationStatus.total}</li>
                  <li>Valid records: {validationStatus.valid}</li>
                  {validationStatus.invalid > 0 && (
                    <li className="text-amber-600 dark:text-amber-400">
                      Invalid records: {validationStatus.invalid}
                    </li>
                  )}
                </ul>
              </div>
            </div>
          )}
          
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
