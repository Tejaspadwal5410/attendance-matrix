
import React from 'react';
import { BookOpen, TrendingUp, TrendingDown } from 'lucide-react';
import { Mark, Subject } from '../utils/supabaseClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface MarksCardProps {
  marksData: Mark[];
  subjects: Subject[];
  title?: string;
}

export const MarksCard: React.FC<MarksCardProps> = ({ 
  marksData, 
  subjects,
  title = "Marks Overview" 
}) => {
  // Calculate average marks
  const totalMarks = marksData.reduce((sum, mark) => sum + mark.marks, 0);
  const averageMarks = marksData.length > 0 ? totalMarks / marksData.length : 0;
  
  // Group marks by subject
  const marksBySubject = marksData.reduce((acc, mark) => {
    const subjectId = mark.subject_id;
    if (!acc[subjectId]) {
      acc[subjectId] = [];
    }
    acc[subjectId].push(mark);
    return acc;
  }, {} as Record<string, Mark[]>);
  
  // Prepare data for chart
  const chartData = Object.entries(marksBySubject).map(([subjectId, marks]) => {
    const subject = subjects.find(s => s.id === subjectId);
    const subjectAvg = marks.reduce((sum, mark) => sum + mark.marks, 0) / marks.length;
    
    return {
      name: subject?.name || 'Unknown',
      average: subjectAvg,
    };
  });
  
  // Find highest and lowest subjects
  const bestSubject = chartData.length > 0 
    ? chartData.reduce((prev, current) => (prev.average > current.average) ? prev : current) 
    : null;

  const worstSubject = chartData.length > 0 
    ? chartData.reduce((prev, current) => (prev.average < current.average) ? prev : current) 
    : null;
  
  return (
    <Card className="hover-scale h-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl font-medium">{title}</CardTitle>
            <CardDescription>Your academic performance</CardDescription>
          </div>
          <BookOpen className="h-5 w-5 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Overall average */}
          <div className="flex items-end justify-between mb-4">
            <div>
              <p className="text-4xl font-bold">
                {averageMarks.toFixed(1)}%
              </p>
              <p className="text-sm text-muted-foreground">
                Overall average
              </p>
            </div>
            
            {/* Performance indicator */}
            <div 
              className={`text-xs px-2 py-1 rounded-full ${
                averageMarks >= 90 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' 
                  : averageMarks >= 75 
                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100' 
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
              }`}
            >
              {averageMarks >= 90 
                ? 'Excellent' 
                : averageMarks >= 75 
                  ? 'Good' 
                  : 'Needs Improvement'}
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-secondary rounded-full h-2.5 mb-4">
            <div 
              className={`h-2.5 rounded-full ${
                averageMarks >= 90 
                  ? 'bg-green-500' 
                  : averageMarks >= 75 
                    ? 'bg-yellow-500' 
                    : 'bg-red-500'
              }`} 
              style={{ width: `${averageMarks}%` }}
            ></div>
          </div>

          {/* Subject performance */}
          {bestSubject && worstSubject && (
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="p-3 rounded-lg bg-secondary">
                <div className="flex items-center text-green-600 dark:text-green-400 mb-1">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  <span className="text-xs font-medium">Best Subject</span>
                </div>
                <p className="text-sm font-medium truncate">{bestSubject.name}</p>
                <p className="text-lg font-bold">{bestSubject.average.toFixed(1)}%</p>
              </div>
              
              <div className="p-3 rounded-lg bg-secondary">
                <div className="flex items-center text-amber-600 dark:text-amber-400 mb-1">
                  <TrendingDown className="h-4 w-4 mr-1" />
                  <span className="text-xs font-medium">Needs Improvement</span>
                </div>
                <p className="text-sm font-medium truncate">{worstSubject.name}</p>
                <p className="text-lg font-bold">{worstSubject.average.toFixed(1)}%</p>
              </div>
            </div>
          )}

          {/* Chart */}
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                <Tooltip 
                  formatter={(value) => [`${value}%`, 'Average']}
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    border: 'none'
                  }}
                />
                <Bar 
                  dataKey="average" 
                  fill="hsl(var(--primary))" 
                  radius={[4, 4, 0, 0]} 
                  barSize={30}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
