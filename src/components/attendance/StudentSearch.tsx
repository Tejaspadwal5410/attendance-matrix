
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, User, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface StudentSearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  isLoading?: boolean;
}

export const StudentSearch: React.FC<StudentSearchProps> = ({ 
  searchQuery, 
  onSearchChange,
  isLoading = false
}) => {
  // Handle clearing the search query
  const handleClearSearch = () => {
    onSearchChange('');
  };

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
            className="pl-9 pr-9"
            disabled={isLoading}
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1.5 h-7 w-7 rounded-full opacity-70 hover:opacity-100"
              onClick={handleClearSearch}
              disabled={isLoading}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Clear search</span>
            </Button>
          )}
        </div>
        {isLoading && (
          <div className="mt-2 text-xs text-muted-foreground text-center">
            Loading students...
          </div>
        )}
      </CardContent>
    </Card>
  );
};
