import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

const DarkModeToggle = () => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check for saved theme preference or default to 'light' mode
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    
    if (newIsDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  return (
    <Button
      onClick={toggleTheme}
      variant="outline"
      size="icon"
      className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-card/90 backdrop-blur-sm border-primary/30 hover:bg-primary/10 hover:border-primary hover:shadow-glow transition-all duration-300 hover:scale-110 animate-float"
    >
      {isDark ? (
        <Sun className="h-6 w-6 text-primary" />
      ) : (
        <Moon className="h-6 w-6 text-primary" />
      )}
      <span className="sr-only">Toggle dark mode</span>
    </Button>
  );
};

export default DarkModeToggle;