import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Link } from "react-router-dom";
import { 
  User, 
  MessageSquare, 
  CreditCard, 
  LayoutDashboard, 
  FileText, 
  LogOut,
  Settings
} from "lucide-react";

interface ProfileSidebarProps {
  user: {
    name: string;
    email: string;
    avatar?: string;
  };
}

interface ProfileSidebarExtendedProps extends ProfileSidebarProps {
  hideButton?: boolean;
}

const ProfileSidebar = ({ user, hideButton = false }: ProfileSidebarExtendedProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { 
      icon: LayoutDashboard, 
      label: "Dashboard", 
      href: "/dashboard" 
    },
    { 
      icon: MessageSquare, 
      label: "Chat", 
      href: "/chat" 
    },
    { 
      icon: CreditCard, 
      label: "Membership & Billing", 
      href: "/membership" 
    },
    { 
      icon: FileText, 
      label: "Quotations", 
      href: "/quotations" 
    },
    { 
      icon: Settings, 
      label: "Profile Settings", 
      href: "/profile" 
    }
  ];

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      {!hideButton && (
        <SheetTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
          </Button>
        </SheetTrigger>
      )}
      
      <SheetContent 
        side="left" 
        className="w-80 p-0 animate-slide-in-left bg-sidebar-background border-sidebar-border"
      >
        {/* Profile Header */}
        <div className="flex items-center gap-3 p-6 border-b border-sidebar-border">
          <Avatar className="h-12 w-12">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {user.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h3 className="font-semibold text-sidebar-foreground">{user.name}</h3>
            <p className="text-sm text-sidebar-foreground/70">{user.email}</p>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded-md text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Sign Out */}
        <div className="absolute bottom-4 left-4 right-4">
          <Button
            variant="outline"
            className="w-full justify-start gap-3 border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent"
            onClick={() => {
              setIsOpen(false);
              // Handle sign out logic here
            }}
          >
            <LogOut className="h-5 w-5" />
            Sign Out
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ProfileSidebar;