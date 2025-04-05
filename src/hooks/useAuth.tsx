
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    console.error('useAuth must be used within an AuthProvider');
    // Return a fallback context to prevent crashes
    return {
      user: null,
      loading: false,
      isTeacher: () => false,
      isStudent: () => false,
      isDemoUser: () => false,
      signIn: async () => ({ error: new Error('AuthProvider not available') }),
      signOut: async () => ({ error: new Error('AuthProvider not available') }),
      signUp: async () => ({ error: new Error('AuthProvider not available') })
    };
  }
  
  return context;
}
