
import { User, UserRole } from '../utils/supabaseClient';

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: Error | null }>;
  signOut: () => Promise<{ error?: Error | null }>;
  signUp: (email: string, password: string, name: string, role: UserRole, avatarUrl?: string) => Promise<{ error?: Error | null }>;
  isTeacher: () => boolean;
  isStudent: () => boolean;
  isDemoUser: () => boolean;
}
