
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, User } from 'lucide-react';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { useForm } from 'react-hook-form';

interface StudentSearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const StudentSearch: React.FC<StudentSearchProps> = ({ searchQuery, onSearchChange }) => {
  const form = useForm({
    defaultValues: {
      search: searchQuery
    }
  });

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange(e.target.value);
    form.setValue('search', e.target.value);
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
        <Form {...form}>
          <FormField
            control={form.control}
            name="search"
            render={({ field }) => (
              <FormItem>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="Search by name..."
                      value={searchQuery}
                      onChange={handleSearchChange}
                      className="pl-9 w-full"
                    />
                  </FormControl>
                </div>
              </FormItem>
            )}
          />
        </Form>
      </CardContent>
    </Card>
  );
};
