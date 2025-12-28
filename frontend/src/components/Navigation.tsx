import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Menu, X, LogOut, Bell, ChevronDown, LayoutDashboard, MessageSquare, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import logoLight from "@/assets/logo-light.png";
import logoDark from "@/assets/logo-dark.png";
import { useAuth } from "@/context/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface Notification {
  id: number;
  message: string;
  type: string;
  is_read: boolean;
  related_url: string;
  related_post_id: number | null;
  created_at: string;
}

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, userAvatar, userEmail, logout } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000";

  // Fetch notifications from API
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
    }
  }, [isAuthenticated]);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${backendUrl}/api/notifications/`, {
        headers: { 'Authorization': `Token ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unread_count || 0);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const markAsRead = async (notificationId: number, relatedUrl: string) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${backendUrl}/api/notifications/${notificationId}/read/`, {
        method: 'PATCH',
        headers: { 'Authorization': `Token ${token}` }
      });

      // Update local state
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));

      // Navigate to related content
      if (relatedUrl) {
        navigate(relatedUrl);
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${backendUrl}/api/notifications/read-all/`, {
        method: 'PATCH',
        headers: { 'Authorization': `Token ${token}` }
      });

      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const isAdmin = userEmail === 'admin@omnidigitals.com';

  const handleLogout = () => {
    logout();
    navigate('/signin');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-b border-border z-50 animate-fade-in">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 cursor-pointer group">
            <img
              src={logoLight}
              alt="MNI Digitals"
              className="h-16 w-auto dark:hidden transition-all duration-300 group-hover:scale-105 mix-blend-multiply"
            />
            <img
              src={logoDark}
              alt="MNI Digitals"
              className="h-16 w-auto hidden dark:block transition-all duration-300 group-hover:scale-105 mix-blend-lighten"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#about" className="text-foreground hover:text-primary transition-colors duration-300 font-medium">
              About us
            </a>
            <a href="#services" className="text-foreground hover:text-primary transition-colors duration-300 font-medium">
              Services
            </a>
            <Link to="/community" className="text-foreground hover:text-primary transition-colors duration-300 font-medium">
              Community
            </Link>
            <Link to="/works" className="text-foreground hover:text-primary transition-colors duration-300 font-medium">
              Works
            </Link>
            {isAdmin && (
              <Link to="/admin" className="text-foreground hover:text-primary transition-colors duration-300 font-medium text-red-500">
                Admin
              </Link>
            )}
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                {/* Notification Bell with Popover */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative text-foreground hover:bg-primary/10">
                      <Bell className={`h-5 w-5 ${unreadCount > 0 ? 'text-yellow-500' : ''}`} />
                      {unreadCount > 0 && (
                        <>
                          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500 animate-ping" />
                          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />
                        </>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align="end" className="w-80 p-0">
                    <div className="p-3 border-b border-border flex justify-between items-center">
                      <h4 className="font-semibold">Notifications</h4>
                      {unreadCount > 0 && (
                        <Button variant="ghost" size="sm" onClick={markAllAsRead} className="text-xs">
                          Mark all as read
                        </Button>
                      )}
                    </div>
                    <div className="max-h-[300px] overflow-y-auto">
                      {notifications.length === 0 ? (
                        <p className="p-4 text-sm text-muted-foreground text-center">No notifications</p>
                      ) : (
                        notifications.slice(0, 10).map((notification) => (
                          <div
                            key={notification.id}
                            onClick={() => markAsRead(notification.id, notification.related_url)}
                            className={`p-3 border-b border-border/50 cursor-pointer hover:bg-accent transition-colors ${!notification.is_read ? 'bg-primary/5' : ''
                              }`}
                          >
                            <div className="flex items-start gap-2">
                              {!notification.is_read && (
                                <span className="h-2 w-2 mt-1.5 rounded-full bg-primary flex-shrink-0" />
                              )}
                              <div className="flex-1">
                                <p className="text-sm line-clamp-2">{notification.message}</p>
                                <p className="text-xs text-muted-foreground mt-1">{formatTimeAgo(notification.created_at)}</p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </PopoverContent>
                </Popover>

                {/* User Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <div className="flex items-center gap-2 cursor-pointer outline-none">
                      <Avatar className="h-9 w-9 border border-border/50 bg-secondary">
                        <AvatarImage src={userAvatar || undefined} alt="User Avatar" className="object-cover" />
                        <AvatarFallback>{userEmail ? userEmail.charAt(0).toUpperCase() : 'U'}</AvatarFallback>
                      </Avatar>
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-card border-border shadow-xl">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />

                    <DropdownMenuItem onClick={() => navigate(isAdmin ? '/admin' : '/dashboard')}>
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      <span>Dashboard</span>
                    </DropdownMenuItem>

                    <DropdownMenuItem onClick={() => navigate('/chat')}>
                      <MessageSquare className="mr-2 h-4 w-4" />
                      <span>Messages</span>
                    </DropdownMenuItem>

                    <DropdownMenuItem onClick={() => navigate('/profile')}>
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-red-500 focus:text-red-500 focus:bg-red-100/10">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <>
                <Link to="/signin">
                  <Button
                    variant="outline"
                    className="mr-2 border-primary text-primary hover:bg-primary/10 transition-all duration-300"
                  >
                    Sign In
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button
                    variant="default"
                    className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow hover:shadow-elegant transition-all duration-300 hover:scale-105"
                  >
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-md text-foreground hover:text-primary transition-colors duration-300"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-card/95 backdrop-blur-sm border-t border-border animate-slide-down">
            <div className="px-4 py-6 space-y-4">
              <a href="#about" className="block text-foreground hover:text-primary transition-colors duration-300 font-medium">
                About us
              </a>
              <a href="#services" className="block text-foreground hover:text-primary transition-colors duration-300 font-medium">
                Services
              </a>
              <Link to="/community" className="block text-foreground hover:text-primary transition-colors duration-300 font-medium">
                Community
              </Link>
              <Link to="/works" className="block text-foreground hover:text-primary transition-colors duration-300 font-medium">
                Works
              </Link>
              <div className="space-y-2">
                {isAuthenticated ? (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between border-b pb-2 mb-2">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={userAvatar || undefined} />
                          <AvatarFallback>{userEmail ? userEmail.charAt(0).toUpperCase() : 'U'}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">{userEmail}</span>
                      </div>
                      <Button variant="ghost" size="icon" className="relative">
                        <Bell className={`h-5 w-5 ${unreadCount > 0 ? 'text-yellow-500' : ''}`} />
                        {unreadCount > 0 && (
                          <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500" />
                        )}
                      </Button>
                    </div>
                    <Link to={isAdmin ? "/admin" : "/dashboard"} className="flex items-center gap-2 p-2 hover:bg-accent rounded">
                      <LayoutDashboard className="h-4 w-4" /> Dashboard
                    </Link>
                    <Link to="/chat" className="flex items-center gap-2 p-2 hover:bg-accent rounded">
                      <MessageSquare className="h-4 w-4" /> Messages
                    </Link>
                    <Link to="/profile" className="flex items-center gap-2 p-2 hover:bg-accent rounded">
                      <User className="h-4 w-4" /> Profile
                    </Link>
                    <Button onClick={handleLogout} variant="ghost" className="w-full justify-start text-red-500">
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </Button>
                  </div>
                ) : (
                  <>
                    <Link to="/signin" className="block">
                      <Button
                        variant="outline"
                        className="w-full border-primary text-primary hover:bg-primary/10 transition-all duration-300"
                      >
                        Sign In
                      </Button>
                    </Link>
                    <Link to="/signup" className="block">
                      <Button
                        variant="default"
                        className="w-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow transition-all duration-300"
                      >
                        Sign Up
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;