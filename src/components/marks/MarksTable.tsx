
import React from 'react';
import { Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { MarksTableProps } from '@/types/marks';

export const MarksTable: React.FC<MarksTableProps> = ({
  students,
  loading,
  marksData,
  handleMarksChange,
  handleSaveMarks,
  saving,
  searchQuery
}) => {
  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getGradeLabel = (marks: number) => {
    if (marks >= 90) return 'A+';
    if (marks >= 80) return 'A';
    if (marks >= 70) return 'B';
    if (marks >= 60) return 'C';
    if (marks >= 50) return 'D';
    return 'F';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Marks Entry</CardTitle>
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
  );
};
