
import React, { useEffect, useState } from 'react';
import { Navbar } from './Navbar';
import { useAuth } from '../hooks/useAuth';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const [displayLoading, setDisplayLoading] = useState(loading);
  
  // Set a timeout to hide the loading indicator after 5 seconds
  // even if loading is still true, to avoid indefinite loading screen
  useEffect(() => {
    const timer = setTimeout(() => {
      if (displayLoading) {
        setDisplayLoading(false);
      }
    }, 5000);
    
    // If loading becomes false, update displayLoading immediately
    if (!loading) {
      setDisplayLoading(false);
      clearTimeout(timer);
    }
    
    return () => clearTimeout(timer);
  }, [loading, displayLoading]);

  if (displayLoading) {
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
    <div className="min-h-screen bg-background flex flex-col">
      {user && <Navbar />}
      <main className="flex-1 container mx-auto py-6 px-4 md:px-6 page-transition">
        {children}
      </main>
      {user && (
        <footer className="py-4 border-t">
          <div className="container mx-auto text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Student Attendance & Marks Management System
          </div>
        </footer>
      )}
    </div>
  );
};
