
import React from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface MarksUploadGuideProps {
  onDownloadSample: () => void;
}

export const MarksUploadGuide: React.FC<MarksUploadGuideProps> = ({ onDownloadSample }) => {
  return (
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
            onClick={onDownloadSample}
          >
            <Download className="h-3.5 w-3.5 mr-1" />
            Download Sample CSV
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
