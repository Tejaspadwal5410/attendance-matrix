
import React from 'react';
import { BookOpen, PenLine, Search, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { MarksFiltersProps } from '@/types/marks';

export const MarksFilters: React.FC<MarksFiltersProps> = ({
  subjects,
  selectedSubject,
  handleSubjectChange,
  examTypes,
  selectedExamType,
  handleExamTypeChange,
  searchQuery,
  setSearchQuery
}) => {
  return (
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
            onValueChange={(value) => handleExamTypeChange(value as any)}
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
  );
};
