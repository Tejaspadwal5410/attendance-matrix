
import React from 'react';
import { Navbar } from './Navbar';
import { useAuth } from '../hooks/useAuth';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, loading } = useAuth();

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

  if (!user) {
    // If not logged in, just render the children (login page)
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto py-6 px-4 md:px-6 page-transition">
        {children}
      </main>
      <footer className="py-4 border-t">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Student Attendance & Marks Management System
        </div>
      </footer>
    </div>
  );
};
