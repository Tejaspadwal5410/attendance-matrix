
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock } from 'lucide-react';

interface ClassSelectorProps {
  selectedClass: string;
  classes: any[];
  onClassChange: (value: string) => void;
}

export const ClassSelector: React.FC<ClassSelectorProps> = ({ 
  selectedClass, 
  classes, 
  onClassChange 
}) => {
  return (
    <Card className="col-span-1">
      <CardHeader className="pb-3">
        <CardTitle className="text-md font-medium flex items-center">
          <Clock className="h-4 w-4 mr-2" />
          Select Class
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Select
          value={selectedClass}
          onValueChange={onClassChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a class" />
          </SelectTrigger>
          <SelectContent>
            {classes.map((cls) => (
              <SelectItem key={cls.id} value={cls.id}>
                {cls.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  );
};
