
import { User, UserRole } from '../utils/supabaseClient';

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signUp: (email: string, password: string, name: string, role: UserRole, avatarUrl?: string) => Promise<void>;
  isTeacher: () => boolean;
  isStudent: () => boolean;
  isDemoUser: () => boolean;
}
