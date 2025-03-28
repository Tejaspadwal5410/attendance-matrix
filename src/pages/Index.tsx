
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import SignupForm from '@/components/SignupForm';
import { toast } from 'sonner';

export default function Index() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signIn, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      if (user.role === 'teacher') {
        navigate('/teacher');
      } else {
        navigate('/student');
      }
    }
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!email.trim()) {
      toast.error('Email is required');
      return;
    }
    
    if (!password) {
      toast.error('Password is required');
      return;
    }
    
    // Prevent multiple submissions
    if (isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      await signIn(email, password);
      // No need to navigate here, useEffect will handle that when the user state updates
    } catch (error: any) {
      console.error('Login attempt failed:', error);
      // Toast is already displayed in the AuthContext
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDemoLogin = async (role: 'teacher' | 'student') => {
    if (isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      const demoEmail = role === 'teacher' ? 'teacher@example.com' : 'student@example.com';
      await signIn(demoEmail, 'password');
    } catch (error) {
      console.error(`Demo login error (${role}):`, error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight">School Management System</h1>
        <p className="text-gray-500 mt-2">
          Track attendance, manage grades, and handle leave requests
        </p>
      </div>

      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Welcome</CardTitle>
          <CardDescription>Log in to your account or create a new one</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
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
            </TabsContent>
            <TabsContent value="signup">
              <div className="mt-4">
                <SignupForm />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex flex-col">
          <div className="text-xs text-gray-500 mb-3 w-full">
            <p>Demo Accounts:</p>
            <div className="flex gap-2 mt-1">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => handleDemoLogin('teacher')}
                disabled={isSubmitting}
                className="text-xs flex-1"
              >
                Login as Teacher
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => handleDemoLogin('student')}
                disabled={isSubmitting}
                className="text-xs flex-1"
              >
                Login as Student
              </Button>
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
