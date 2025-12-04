import { createContext, useState, useContext, ReactNode, useEffect } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  userAvatar: string | null;
  userEmail: string | null;
  login: (token: string, avatar: string, email: string) => void;
  logout: () => void;
  updateAvatar: (avatar: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const avatar = localStorage.getItem('avatar');
    const email = localStorage.getItem('email');
    if (token) {
      setIsAuthenticated(true);
      setUserAvatar(avatar);
      setUserEmail(email);
    }
  }, []);

  const login = (token: string, avatar: string, email: string) => {
    localStorage.setItem('token', token);
    localStorage.setItem('avatar', avatar);
    localStorage.setItem('email', email);
    setIsAuthenticated(true);
    setUserAvatar(avatar);
    setUserEmail(email);
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUserAvatar(null);
    setUserEmail(null);
    localStorage.removeItem('token');
    localStorage.removeItem('avatar');
    localStorage.removeItem('email');
  };

  const updateAvatar = (avatar: string) => {
    localStorage.setItem('avatar', avatar);
    setUserAvatar(avatar);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, userAvatar, userEmail, login, logout, updateAvatar }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
