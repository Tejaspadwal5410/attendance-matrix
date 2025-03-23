
import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Layout } from '../components/Layout';
import { MOCK_DATA, LeaveRequest } from '../utils/supabaseClient';
import { 
  Calendar, 
  Check, 
  Download, 
  FileText, 
  Filter, 
  Search, 
  X 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { toast } from 'sonner';

const LeaveManagement = () => {
  const { user, isTeacher } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<LeaveRequest['status'] | 'all'>('all');
  const [selectedLeave, setSelectedLeave] = useState<LeaveRequest | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  
  // Redirect if not a teacher
  if (!user) {
    return <Navigate to="/" />;
  }
  
  if (!isTeacher()) {
    return <Navigate to="/student" />;
  }

  const leaveRequests = MOCK_DATA.leaveRequests;
  const students = MOCK_DATA.users.filter(u => u.role === 'student');
  
  const getStudentName = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    return student ? student.name : 'Unknown Student';
  };

  // Apply filters
  const filteredLeaveRequests = leaveRequests.filter(leave => {
    const studentName = getStudentName(leave.student_id);
    const nameMatch = studentName.toLowerCase().includes(searchQuery.toLowerCase());
    const statusMatch = statusFilter === 'all' || leave.status === statusFilter;
    
    return nameMatch && statusMatch;
  });

  const handleApproveLeave = (leaveId: string) => {
    // In a real app, this would update in Supabase
    toast.success('Leave request approved successfully');
  };

  const handleRejectLeave = (leaveId: string) => {
    // In a real app, this would update in Supabase
    toast.success('Leave request rejected successfully');
  };

  const handleViewDetails = (leave: LeaveRequest) => {
    setSelectedLeave(leave);
    setOpenDialog(true);
  };

  const handleDownloadReport = () => {
    toast.success('Leave report downloaded');
  };

  const getStatusBadge = (status: LeaveRequest['status']) => {
    switch (status) {
      case 'approved':
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900 dark:text-green-100">
            <Check className="h-3 w-3 mr-1" /> Approved
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900 dark:text-red-100">
            <X className="h-3 w-3 mr-1" /> Rejected
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-100">
            <Calendar className="h-3 w-3 mr-1" /> Pending
          </Badge>
        );
    }
  };

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Leave Management</h2>
            <p className="text-muted-foreground">
              Manage and approve student leave requests
            </p>
          </div>
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={handleDownloadReport}
          >
            <Download className="h-4 w-4" />
            <span>Download Report</span>
          </Button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="col-span-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-md font-medium flex items-center">
                <Search className="h-4 w-4 mr-2" />
                Search Student
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                type="text"
                placeholder="Search by student name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </CardContent>
          </Card>

          <Card className="col-span-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-md font-medium flex items-center">
                <Filter className="h-4 w-4 mr-2" />
                Filter by Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                value={statusFilter}
                onValueChange={(value) => setStatusFilter(value as LeaveRequest['status'] | 'all')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Requests</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </div>

        {/* Leave Requests Table */}
        <Card>
          <CardHeader>
            <CardTitle>Leave Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLeaveRequests.map((leave, index) => (
                    <TableRow key={leave.id}>
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                            {getStudentName(leave.student_id).substring(0, 1).toUpperCase()}
                          </div>
                          <span>{getStudentName(leave.student_id)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(leave.date).toLocaleDateString('en-US', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </TableCell>
                      <TableCell>
                        <div className="truncate max-w-[200px]">{leave.reason}</div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(leave.status)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleViewDetails(leave)}
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                          
                          {leave.status === 'pending' && (
                            <>
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700 dark:text-green-400 dark:border-green-900 dark:hover:bg-green-900/40"
                                onClick={() => handleApproveLeave(leave.id)}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:border-red-900 dark:hover:bg-red-900/40"
                                onClick={() => handleRejectLeave(leave.id)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  
                  {filteredLeaveRequests.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                        No leave requests found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Leave Details Dialog */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Leave Request Details</DialogTitle>
            <DialogDescription>
              View complete information about this leave request
            </DialogDescription>
          </DialogHeader>
          {selectedLeave && (
            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Student</p>
                  <p className="font-medium">{getStudentName(selectedLeave.student_id)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-medium">
                    {new Date(selectedLeave.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <div className="pt-1">{getStatusBadge(selectedLeave.status)}</div>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground">Reason</p>
                <p className="font-medium">{selectedLeave.reason}</p>
              </div>
              
              {selectedLeave.status === 'pending' && (
                <div className="flex gap-2 pt-2">
                  <Button 
                    className="w-full text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700 dark:text-green-400 dark:border-green-900 dark:hover:bg-green-900/40"
                    variant="outline"
                    onClick={() => {
                      handleApproveLeave(selectedLeave.id);
                      setOpenDialog(false);
                    }}
                  >
                    <Check className="h-4 w-4 mr-1" /> Approve
                  </Button>
                  <Button 
                    className="w-full text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:border-red-900 dark:hover:bg-red-900/40"
                    variant="outline"
                    onClick={() => {
                      handleRejectLeave(selectedLeave.id);
                      setOpenDialog(false);
                    }}
                  >
                    <X className="h-4 w-4 mr-1" /> Reject
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default LeaveManagement;
