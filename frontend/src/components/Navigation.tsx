import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Menu, X, LogOut } from "lucide-react";
import { Link } from "react-router-dom";
import logoLight from "@/assets/logo-light.png";
import logoDark from "@/assets/logo-dark.png";
import { useAuth } from "@/context/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, userAvatar, userEmail, logout } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-b border-border z-50 animate-fade-in">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 cursor-pointer group">
            <img 
              src={logoLight} 
              alt="MNI Digitals" 
              className="h-8 w-auto dark:hidden transition-all duration-300 group-hover:scale-105"
            />
            <img 
              src={logoDark} 
              alt="MNI Digitals" 
              className="h-8 w-auto hidden dark:block transition-all duration-300 group-hover:scale-105"
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
            <a href="#works" className="text-foreground hover:text-primary transition-colors duration-300 font-medium">
              Works
            </a>
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <Link to="/profile">
                  <Avatar className="h-9 w-9 cursor-pointer">
                    <AvatarImage src={userAvatar || undefined} alt="User Avatar" />
                    <AvatarFallback>{userEmail ? userEmail.charAt(0).toUpperCase() : 'U'}</AvatarFallback>
                  </Avatar>
                </Link>
                <Button onClick={logout} variant="ghost" size="sm">
                  <LogOut className="h-4 w-4" />
                </Button>
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
              <a href="#works" className="block text-foreground hover:text-primary transition-colors duration-300 font-medium">
                Works
              </a>
              <div className="space-y-2">
                {isAuthenticated ? (
                  <div className="flex items-center justify-between">
                    <Link to="/profile">
                      <Avatar className="h-9 w-9 cursor-pointer">
                        <AvatarImage src={userAvatar || undefined} alt="User Avatar" />
                        <AvatarFallback>{userEmail ? userEmail.charAt(0).toUpperCase() : 'U'}</AvatarFallback>
                      </Avatar>
                    </Link>
                    <Button onClick={logout} variant="ghost" className="w-full justify-start">
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