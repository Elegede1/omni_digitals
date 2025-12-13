import { createContext, useState, useContext, ReactNode, useEffect } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  userAvatar: string | null;
  userEmail: string | null;
  userId: number | null;
  login: (token: string, avatar: string, email: string, userId?: number) => void;
  logout: () => void;
  updateAvatar: (avatar: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000";

  useEffect(() => {
    const token = localStorage.getItem('token');
    const avatar = localStorage.getItem('avatar');
    const email = localStorage.getItem('email');
    const storedUserId = localStorage.getItem('userId');
    if (token) {
      setIsAuthenticated(true);
      setUserAvatar(avatar);
      setUserEmail(email);
      setUserId(storedUserId ? parseInt(storedUserId) : null);
      setIsAdmin(email === 'admin@omnidigitals.com');

      // Refresh user details from backend to ensure consistency
      fetch(`${backendUrl}/api/auth/me/`, {
        headers: { 'Authorization': `Token ${token}` }
      })
        .then(res => {
          if (res.ok) return res.json();
          throw new Error('Failed to fetch user details');
        })
        .then(data => {
          setUserId(data.id);
          setUserEmail(data.email);
          setUserAvatar(data.avatar_url);
          setIsAdmin(data.is_admin);

          // Update localStorage
          localStorage.setItem('userId', data.id.toString());
          localStorage.setItem('email', data.email);
          if (data.avatar_url) localStorage.setItem('avatar', data.avatar_url);
        })
        .catch(err => console.error("Session refresh warning:", err));
    }
  }, []);

  const login = (token: string, avatar: string, email: string, uid?: number) => {
    localStorage.setItem('token', token);
    localStorage.setItem('avatar', avatar);
    localStorage.setItem('email', email);
    if (uid) localStorage.setItem('userId', uid.toString());
    setIsAuthenticated(true);
    setUserAvatar(avatar);
    setUserEmail(email);
    setUserId(uid || null);
    setIsAdmin(email === 'admin@omnidigitals.com');
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUserAvatar(null);
    setUserEmail(null);
    setUserId(null);
    setIsAdmin(false);
    localStorage.removeItem('token');
    localStorage.removeItem('avatar');
    localStorage.removeItem('email');
    localStorage.removeItem('userId');
  };

  const updateAvatar = (avatar: string) => {
    localStorage.setItem('avatar', avatar);
    setUserAvatar(avatar);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, userAvatar, userEmail, userId, isAdmin, login, logout, updateAvatar }}>
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
