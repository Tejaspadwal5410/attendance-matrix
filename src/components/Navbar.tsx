
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  BookOpen, 
  Calendar, 
  ClipboardCheck, 
  Home, 
  LogOut, 
  Menu, 
  PieChart, 
  User, 
  X
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export const Navbar: React.FC = () => {
  const { user, signOut, isTeacher } = useAuth();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  if (!user) return null;

  const teacherLinks = [
    { to: '/teacher', label: 'Dashboard', icon: <Home className="w-4 h-4" /> },
    { to: '/attendance', label: 'Attendance', icon: <Calendar className="w-4 h-4" /> },
    { to: '/marks', label: 'Marks', icon: <BookOpen className="w-4 h-4" /> },
    { to: '/leave', label: 'Leave Requests', icon: <ClipboardCheck className="w-4 h-4" /> },
    { to: '/reports', label: 'Reports', icon: <PieChart className="w-4 h-4" /> },
  ];

  const studentLinks = [
    { to: '/student', label: 'Dashboard', icon: <Home className="w-4 h-4" /> },
    { to: '/my-attendance', label: 'My Attendance', icon: <Calendar className="w-4 h-4" /> },
    { to: '/my-marks', label: 'My Marks', icon: <BookOpen className="w-4 h-4" /> },
    { to: '/my-leave', label: 'Leave Requests', icon: <ClipboardCheck className="w-4 h-4" /> },
  ];

  const links = isTeacher() ? teacherLinks : studentLinks;

  const NavLinks = () => (
    <>
      {links.map((link) => (
        <Link
          key={link.to}
          to={link.to}
          className={`nav-link ${location.pathname === link.to ? 'active' : ''}`}
          onClick={() => setOpen(false)}
        >
          {link.icon}
          <span>{link.label}</span>
        </Link>
      ))}
    </>
  );

  return (
    <header className="border-b bg-card">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to={isTeacher() ? '/teacher' : '/student'} className="text-xl font-semibold flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-primary" />
              <span className="hidden md:inline-block">EduTrack</span>
            </Link>
          </div>

          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            <NavLinks />
          </nav>

          <div className="flex items-center gap-2">
            {/* Mobile menu */}
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64">
                <div className="flex flex-col h-full">
                  <div className="py-4">
                    <div className="flex items-center mb-6">
                      <BookOpen className="h-6 w-6 text-primary mr-2" />
                      <span className="text-xl font-semibold">EduTrack</span>
                    </div>
                    <nav className="flex flex-col space-y-1">
                      <NavLinks />
                    </nav>
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            {/* User dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar_url} alt={user.name} />
                    <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="flex items-center" onClick={() => signOut()}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
};
