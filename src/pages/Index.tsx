
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { BookOpen, Key, Mail, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Index = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { signIn, user } = useAuth();
  const navigate = useNavigate();

  // If user is already logged in, redirect to appropriate dashboard
  React.useEffect(() => {
    if (user) {
      if (user.role === 'teacher') {
        navigate('/teacher');
      } else {
        navigate('/student');
      }
    }
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent, role: 'student' | 'teacher') => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      // For demo purposes, set the email based on the selected role
      const demoEmail = role === 'teacher' ? 'teacher@example.com' : 'student@example.com';
      await signIn(demoEmail, password || 'password');
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col animate-fade-in">
      {/* Header */}
      <header className="py-6 border-b">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <BookOpen className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">EduTrack</h1>
          </div>
        </div>
      </header>
      
      {/* Hero Section */}
      <div className="flex-1 flex flex-col md:flex-row">
        <div className="w-full md:w-1/2 bg-gradient-to-br from-primary/5 to-primary/10 p-8 md:p-16 flex items-center justify-center">
          <div className="max-w-md space-y-6 animate-slide-right">
            <h2 className="text-4xl md:text-5xl font-bold">Student Attendance & Marks Management</h2>
            <p className="text-muted-foreground text-lg">
              A comprehensive solution for teachers and students to track attendance, manage marks, and monitor academic progress.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-white/50 dark:bg-black/5 rounded-lg">
                <Calendar className="h-6 w-6 text-primary mb-2" />
                <h3 className="font-medium">Attendance Tracking</h3>
                <p className="text-sm text-muted-foreground">Monitor attendance with ease</p>
              </div>
              <div className="p-4 bg-white/50 dark:bg-black/5 rounded-lg">
                <BookOpen className="h-6 w-6 text-primary mb-2" />
                <h3 className="font-medium">Marks Management</h3>
                <p className="text-sm text-muted-foreground">Record and analyze student performance</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="w-full md:w-1/2 p-8 md:p-16 flex items-center justify-center">
          <Card className="w-full max-w-md animate-slide-up shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl">Welcome to EduTrack</CardTitle>
              <CardDescription>
                Login to access your dashboard
              </CardDescription>
            </CardHeader>
            <Tabs defaultValue="student" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="student">Student Login</TabsTrigger>
                <TabsTrigger value="teacher">Teacher Login</TabsTrigger>
              </TabsList>
              <TabsContent value="student">
                <form onSubmit={(e) => handleLogin(e, 'student')}>
                  <CardContent className="space-y-4 pt-6">
                    <div className="space-y-2">
                      <Label htmlFor="student-email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input 
                          id="student-email" 
                          type="email" 
                          placeholder="student@example.com" 
                          className="pl-10"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="student-password">Password</Label>
                      <div className="relative">
                        <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input 
                          id="student-password" 
                          type="password" 
                          placeholder="Enter your password" 
                          className="pl-10"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                    {error && <p className="text-sm text-destructive">{error}</p>}
                    <p className="text-sm text-muted-foreground">For demo use password: password</p>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full" disabled={isLoading}>
                      {isLoading ? 'Logging in...' : 'Login as Student'}
                    </Button>
                  </CardFooter>
                </form>
              </TabsContent>
              <TabsContent value="teacher">
                <form onSubmit={(e) => handleLogin(e, 'teacher')}>
                  <CardContent className="space-y-4 pt-6">
                    <div className="space-y-2">
                      <Label htmlFor="teacher-email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input 
                          id="teacher-email" 
                          type="email" 
                          placeholder="teacher@example.com" 
                          className="pl-10"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="teacher-password">Password</Label>
                      <div className="relative">
                        <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input 
                          id="teacher-password" 
                          type="password" 
                          placeholder="Enter your password" 
                          className="pl-10"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                    {error && <p className="text-sm text-destructive">{error}</p>}
                    <p className="text-sm text-muted-foreground">For demo use password: password</p>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full" disabled={isLoading}>
                      {isLoading ? 'Logging in...' : 'Login as Teacher'}
                    </Button>
                  </CardFooter>
                </form>
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
