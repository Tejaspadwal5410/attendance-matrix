
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, User } from 'lucide-react';

interface StudentSearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const StudentSearch: React.FC<StudentSearchProps> = ({ searchQuery, onSearchChange }) => {
  return (
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
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
      </CardContent>
    </Card>
  );
};
