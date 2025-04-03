
import React from 'react';
import { CsvUploader } from '@/components/CsvUploader';
import { MarksUploadGuide } from './MarksUploadGuide';
import { MarksUploaderProps } from '@/types/marks';

export const MarksUploader: React.FC<MarksUploaderProps> = ({
  subjectId,
  examType,
  onUploadSuccess,
  subjects
}) => {
  const handleDownloadSample = () => {
    const csvHeader = "student_id,marks\n";
    // Just create a sample with three placeholder student IDs
    const csvData = ["student1_id,85", "student2_id,92", "student3_id,78"].join("\n");
    const csvContent = csvHeader + csvData;
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', 'sample_marks.csv');
    a.click();
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <CsvUploader 
          subjectId={subjectId} 
          examType={examType}
          onUploadSuccess={onUploadSuccess}
        />
      </div>
      <MarksUploadGuide onDownloadSample={handleDownloadSample} />
    </div>
  );
};
