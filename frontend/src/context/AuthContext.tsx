import { createContext, useState, useContext, ReactNode, useEffect } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  userAvatar: string | null;
  login: (avatar: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userAvatar, setUserAvatar] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const avatar = localStorage.getItem('avatar');
    if (token) {
      setIsAuthenticated(true);
      setUserAvatar(avatar);
    }
  }, []);

  const login = (avatar: string) => {
    setIsAuthenticated(true);
    setUserAvatar(avatar);
    localStorage.setItem('avatar', avatar);
    // Token would be set here as well, e.g., localStorage.setItem('token', 'your_jwt_token');
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUserAvatar(null);
    localStorage.removeItem('token');
    localStorage.removeItem('avatar');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, userAvatar, login, logout }}>
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
