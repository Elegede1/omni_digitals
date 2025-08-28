import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-b border-border z-50 animate-fade-in">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2 cursor-pointer group" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors duration-300">
              BP
            </div>
            <div className="hidden sm:block text-lg font-semibold text-foreground">
              <span className="text-primary">Boost</span> Promotions
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#about" className="text-foreground hover:text-primary transition-colors duration-300 font-medium">
              About us
            </a>
            <a href="#services" className="text-foreground hover:text-primary transition-colors duration-300 font-medium">
              Services
            </a>
            <a href="#community" className="text-foreground hover:text-primary transition-colors duration-300 font-medium">
              Community
            </a>
            <a href="#works" className="text-foreground hover:text-primary transition-colors duration-300 font-medium">
              Works
            </a>
            <Button 
              variant="default" 
              className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow hover:shadow-elegant transition-all duration-300 hover:scale-105"
            >
              Book a service
            </Button>
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
          <div className="md:hidden bg-card/95 backdrop-blur-sm border-t border-border animate-slide-up">
            <div className="px-4 py-6 space-y-4">
              <a href="#about" className="block text-foreground hover:text-primary transition-colors duration-300 font-medium">
                About us
              </a>
              <a href="#services" className="block text-foreground hover:text-primary transition-colors duration-300 font-medium">
                Services
              </a>
              <a href="#community" className="block text-foreground hover:text-primary transition-colors duration-300 font-medium">
                Community
              </a>
              <a href="#works" className="block text-foreground hover:text-primary transition-colors duration-300 font-medium">
                Works
              </a>
              <Button 
                variant="default" 
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow transition-all duration-300"
              >
                Book a service
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;