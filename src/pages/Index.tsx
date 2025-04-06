
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export default function Index() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signIn, user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && !loading) {
      if (user.role === 'teacher') {
        navigate('/teacher');
      } else {
        navigate('/student');
      }
    }
  }, [user, navigate, loading]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error('Email is required');
      return;
    }
    
    if (!password) {
      toast.error('Password is required');
      return;
    }
    
    if (isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      const { error } = await signIn(email, password);
      
      if (error) {
        console.error('Login error:', error);
        toast.error('Failed to log in');
      }
    } catch (error: any) {
      console.error('Login attempt failed:', error);
      toast.error(error.message || 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDemoLogin = async () => {
    if (isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      const demoEmail = 'teacher@example.com';
      console.log(`Attempting demo login as teacher with email ${demoEmail}`);
      
      const { error } = await signIn(demoEmail, 'password');
      
      if (error) {
        console.error(`Demo login error:`, error);
        toast.error('Failed to log in with demo account');
      } else {
        console.log(`Demo login successful as teacher`);
      }
    } catch (error: any) {
      console.error(`Demo login error:`, error);
      toast.error(error.message || 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="space-y-4 flex flex-col items-center">
          <div className="w-16 h-16 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight">School Management System</h1>
        <p className="text-gray-500 mt-2">
          Track attendance, manage students, and handle academic records
        </p>
      </div>

      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Teacher Login</CardTitle>
          <CardDescription>Log in to access the school management system</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4 mt-4">
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isSubmitting}
                className={isSubmitting ? "opacity-70" : ""}
                aria-describedby="email-error"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium">
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isSubmitting}
                className={isSubmitting ? "opacity-70" : ""}
                aria-describedby="password-error"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Logging in...' : 'Login'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col">
          <div className="text-xs text-gray-500 mb-3 w-full">
            <p>Demo Account:</p>
            <div className="flex gap-2 mt-1">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={handleDemoLogin}
                disabled={isSubmitting}
                className="text-xs flex-1"
              >
                Login as Teacher
              </Button>
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
