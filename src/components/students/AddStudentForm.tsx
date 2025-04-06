
import React, { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { toast } from 'sonner';
import { UserPlus, FileUp } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { addNewStudent } from '@/utils/authUtils';
import { fetchClasses } from '@/utils/auth/classes';
import { fetchBatches, fetchBoards, getMockBatches, getMockBoards } from '@/utils/auth/education';

const formSchema = z.object({
  name: z.string().min(2, {
    message: 'Name must be at least 2 characters.',
  }),
  email: z.string().email({
    message: 'Please enter a valid email address.',
  }),
  password: z.string().min(6, {
    message: 'Password must be at least 6 characters.',
  }),
  registerNumber: z.string().min(1, {
    message: 'Register number is required.',
  }),
  class: z.string().min(1, {
    message: 'Class is required.',
  }),
  batch: z.string().min(1, {
    message: 'Batch is required.',
  }),
  board: z.string().min(1, {
    message: 'Board is required.',
  }),
});

export function AddStudentForm({ onSuccess }: { onSuccess?: () => void }) {
  const [activeTab, setActiveTab] = useState<'single' | 'csv'>('single');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      registerNumber: '',
      class: '',
      batch: '',
      board: '',
    },
  });

  const { data: classes = [], isLoading: isLoadingClasses } = useQuery({
    queryKey: ['classes'],
    queryFn: fetchClasses,
  });

  const { data: batches = [], isLoading: isLoadingBatches } = useQuery({
    queryKey: ['batches'],
    queryFn: () => fetchBatches().catch(() => getMockBatches()),
  });

  const { data: boards = [], isLoading: isLoadingBoards } = useQuery({
    queryKey: ['boards'],
    queryFn: () => fetchBoards().catch(() => getMockBoards()),
  });

  const isLoading = form.formState.isSubmitting || isLoadingClasses || isLoadingBatches || isLoadingBoards || isUploading;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const success = await addNewStudent({
        name: values.name,
        email: values.email,
        password: values.password,
        registerNumber: values.registerNumber,
        class: values.class,
        batch: values.batch,
        board: values.board,
      });

      if (success) {
        toast.success('Student added successfully');
        form.reset();
        onSuccess?.();
      } else {
        toast.error('Failed to add student');
      }
    } catch (error) {
      console.error('Error adding student:', error);
      toast.error('An error occurred while adding the student');
    }
  }

  const handleCsvFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCsvFile(e.target.files[0]);
    }
  };

  const handleCsvUpload = async () => {
    if (!csvFile) {
      toast.error('Please select a CSV file');
      return;
    }

    setIsUploading(true);
    try {
      // Read the file
      const reader = new FileReader();
      reader.onload = async (event) => {
        if (event.target?.result) {
          // Parse CSV content
          const csvContent = event.target.result.toString();
          const rows = csvContent.split('\n');
          const headers = rows[0].split(',');
          
          // Check required headers
          const requiredHeaders = ['name', 'email', 'password', 'registerNumber', 'class', 'batch', 'board'];
          const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
          
          if (missingHeaders.length > 0) {
            toast.error(`CSV file missing required headers: ${missingHeaders.join(', ')}`);
            setIsUploading(false);
            return;
          }
          
          // Process students
          let successCount = 0;
          let failureCount = 0;
          
          // Skip header row
          for (let i = 1; i < rows.length; i++) {
            if (!rows[i].trim()) continue; // Skip empty rows
            
            const values = rows[i].split(',');
            const studentData: Record<string, string> = {};
            
            headers.forEach((header, index) => {
              studentData[header.trim()] = values[index]?.trim() || '';
            });
            
            // Basic validation
            const requiredFields = ['name', 'email', 'password', 'registerNumber', 'class', 'batch', 'board'];
            const missingFields = requiredFields.filter(field => !studentData[field]);
            
            if (missingFields.length > 0) {
              console.error(`Row ${i}: Missing required fields: ${missingFields.join(', ')}`);
              failureCount++;
              continue;
            }
            
            try {
              const success = await addNewStudent({
                name: studentData.name,
                email: studentData.email,
                password: studentData.password,
                registerNumber: studentData.registerNumber,
                class: studentData.class,
                batch: studentData.batch,
                board: studentData.board,
              });
              
              if (success) successCount++;
              else failureCount++;
            } catch (error) {
              console.error(`Error adding student from row ${i}:`, error);
              failureCount++;
            }
          }
          
          if (successCount > 0) {
            toast.success(`Successfully added ${successCount} students`);
            setCsvFile(null);
            if (onSuccess) onSuccess();
          }
          
          if (failureCount > 0) {
            toast.error(`Failed to add ${failureCount} students`);
          }
        }
        setIsUploading(false);
      };
      
      reader.readAsText(csvFile);
    } catch (error) {
      console.error('Error processing CSV file:', error);
      toast.error('An error occurred while processing the CSV file');
      setIsUploading(false);
    }
  };

  const downloadCsvTemplate = () => {
    const headers = 'name,email,password,registerNumber,class,batch,board';
    const sampleData = 'John Doe,john.doe@example.com,password123,ST12345,10,A,CBSE';
    const csvContent = `${headers}\n${sampleData}`;
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', 'student_template.csv');
    a.click();
  };

  return (
    <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'single' | 'csv')}>
      <TabsList className="grid w-full grid-cols-2 mb-6">
        <TabsTrigger value="single">Single Student</TabsTrigger>
        <TabsTrigger value="csv">Bulk Upload (CSV)</TabsTrigger>
      </TabsList>
      
      <TabsContent value="single">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="registerNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Register Number</FormLabel>
                    <FormControl>
                      <Input placeholder="ST12345" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="student@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="class"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Class</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select class" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {classes.map((cls) => (
                          <SelectItem key={cls.id} value={cls.id}>
                            {cls.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="batch"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Batch</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select batch" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {batches.map((batch) => (
                          <SelectItem key={batch.id} value={batch.id}>
                            {batch.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="board"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Board</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select board" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {boards.map((board) => (
                          <SelectItem key={board.id} value={board.id}>
                            {board.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" disabled={isLoading} className="w-full">
              <UserPlus className="mr-2 h-4 w-4" />
              Add Student
            </Button>
          </form>
        </Form>
      </TabsContent>
      
      <TabsContent value="csv">
        <div className="space-y-6">
          <div className="bg-muted/50 p-4 rounded-lg">
            <h3 className="font-medium mb-2">CSV File Format</h3>
            <p className="text-sm text-muted-foreground mb-2">
              Your CSV file should include these columns: name, email, password, registerNumber, class, batch, board
            </p>
            <Button variant="outline" size="sm" onClick={downloadCsvTemplate} className="w-full sm:w-auto">
              Download Template
            </Button>
          </div>
          
          <div className="grid gap-4">
            <div className="space-y-2">
              <FormLabel>Upload CSV File</FormLabel>
              <Input
                id="csv-file"
                type="file"
                accept=".csv"
                onChange={handleCsvFileChange}
                disabled={isUploading}
              />
              <FormDescription>
                {csvFile ? `Selected file: ${csvFile.name}` : 'No file selected'}
              </FormDescription>
            </div>

            <Button 
              onClick={handleCsvUpload} 
              disabled={!csvFile || isUploading}
              className="w-full"
            >
              <FileUp className="mr-2 h-4 w-4" />
              {isUploading ? 'Processing...' : 'Upload and Process CSV'}
            </Button>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
}
