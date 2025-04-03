
import { Mark as MarkType } from '@/utils/supabaseClient';

export type Mark = MarkType;

export type MarksData = Record<string, number>;

export type ExamType = Mark['exam_type'];

export interface MarksTableProps {
  students: any[];
  loading: boolean;
  marksData: MarksData;
  handleMarksChange: (studentId: string, marks: string) => void;
  handleSaveMarks: () => void;
  saving: boolean;
  searchQuery: string;
}

export interface MarksFiltersProps {
  subjects: any[];
  selectedSubject: string;
  handleSubjectChange: (value: string) => void;
  examTypes: ExamType[];
  selectedExamType: ExamType;
  handleExamTypeChange: (value: ExamType) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export interface MarksUploaderProps {
  subjectId: string;
  examType: ExamType;
  onUploadSuccess: () => void;
  subjects: any[];
}
