
import { User, UserRole } from '../utils/supabaseClient';

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
  signUp: (email: string, password: string, name: string, role: UserRole, avatarUrl?: string) => Promise<{ error: any }>;
  isTeacher: () => boolean;
  isStudent: () => boolean;
  isDemoUser: () => boolean;
}
