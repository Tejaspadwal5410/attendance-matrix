import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { UserRole } from '@/utils/supabaseClient';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  role: z.enum(['teacher', 'student']),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type SignupFormValues = z.infer<typeof signupSchema>;

export default function SignupForm() {
  const { signUp } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'student',
    },
  });

  const onSubmit = async (values: SignupFormValues) => {
    // Prevent multiple submissions
    if (isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      
      console.log('Attempting signup with:', { 
        email: values.email, 
        name: values.name, 
        role: values.role 
      });
      
      const { error } = await signUp(
        values.email,
        values.password,
        values.name,
        values.role as UserRole
      );
      
      if (!error) {
        // Reset form on success
        form.reset();
        toast.success('Account created successfully! Please check your email to verify your account.');
      } else {
        console.error('Signup error:', error);
        
        // Highlight form fields that might be causing the issue
        if (error.message?.includes('email')) {
          form.setError('email', { 
            type: 'manual', 
            message: 'This email may already be in use'
          });
        }
      }
    } catch (error: any) {
      console.error('Signup submission error:', error);
      toast.error(error.message || 'An unexpected error occurred');
      
      // Highlight form fields that might be causing the issue
      if (error.message?.includes('email')) {
        form.setError('email', { 
          type: 'manual', 
          message: 'This email may already be in use'
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 w-full max-w-md">
      <div>
        <h2 className="text-2xl font-bold">Create an Account</h2>
        <p className="text-muted-foreground">Sign up to get started</p>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="John Doe" 
                    {...field} 
                    disabled={isSubmitting}
                    className={isSubmitting ? "opacity-70" : ""}
                  />
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
                  <Input 
                    type="email" 
                    placeholder="you@example.com" 
                    {...field} 
                    disabled={isSubmitting}
                    className={isSubmitting ? "opacity-70" : ""}
                  />
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
                  <Input 
                    type="password" 
                    placeholder="••••••••" 
                    {...field} 
                    disabled={isSubmitting}
                    className={isSubmitting ? "opacity-70" : ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <Input 
                    type="password" 
                    placeholder="••••••••" 
                    {...field} 
                    disabled={isSubmitting}
                    className={isSubmitting ? "opacity-70" : ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>I am a</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex space-x-4"
                    disabled={isSubmitting}
                  >
                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <RadioGroupItem 
                          value="student" 
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormLabel className={`font-normal cursor-pointer ${isSubmitting ? "opacity-70" : ""}`}>
                        Student
                      </FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <RadioGroupItem 
                          value="teacher" 
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormLabel className={`font-normal cursor-pointer ${isSubmitting ? "opacity-70" : ""}`}>
                        Teacher
                      </FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating account...' : 'Sign Up'}
          </Button>
        </form>
      </Form>
    </div>
  );
}
