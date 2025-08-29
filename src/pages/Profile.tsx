import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import DarkModeToggle from "@/components/DarkModeToggle";
import ProfileSidebar from "@/components/ProfileSidebar";
import { User, Settings, LogOut, BarChart3, MessageSquare, CreditCard, LayoutDashboard } from "lucide-react";

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    fullName: "Jenny Wilson",
    email: "mehrabdotsoftbusiness@gmail.com",
    phone: "58077.79",
    whatsapp: "58077.79",
    telegram: "58077.79",
    businessName: "33062 Zboncak Isle",
    city: "Mehrab",
    state: "Boorang",
  });

  const handleInputChange = (field: string, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    setIsEditing(false);
    // Handle save logic here
    console.log("Saving profile data:", profileData);
  };

  const currentUser = {
    name: profileData.fullName,
    email: profileData.email,
    avatar: "/placeholder.svg"
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Profile Sidebar for Mobile */}
      <div className="fixed top-20 left-4 z-50 lg:hidden">
        <ProfileSidebar user={currentUser} />
      </div>
      
      <div className="container mx-auto px-4 pt-24 pb-16">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - Desktop */}
          <div className="hidden lg:block lg:w-1/4 space-y-6">
            <Card className="border-border/50 shadow-elegant backdrop-blur-sm bg-card/95">
              <CardHeader className="text-center">
                <Avatar className="h-20 w-20 mx-auto mb-4">
                  <AvatarImage src="/placeholder.svg" alt="Jenny Wilson" />
                  <AvatarFallback>JW</AvatarFallback>
                </Avatar>
                <CardTitle className="text-lg font-semibold text-foreground">
                  Jenny Wilson
                </CardTitle>
                <p className="text-sm text-muted-foreground">Member</p>
              </CardHeader>
            </Card>

            <Card className="border-border/50 shadow-elegant backdrop-blur-sm bg-card/95">
              <CardContent className="pt-6 space-y-3">
                <Link to="/dashboard">
                  <Button variant="ghost" className="w-full justify-start text-foreground hover:text-primary">
                    <LayoutDashboard className="h-4 w-4 mr-2" />
                    Dashboard
                  </Button>
                </Link>
                <Button variant="default" className="w-full justify-start bg-primary text-primary-foreground">
                  <Settings className="h-4 w-4 mr-2" />
                  Personal Information
                </Button>
                <Link to="/quotations">
                  <Button variant="ghost" className="w-full justify-start text-foreground hover:text-primary">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Quotations
                  </Button>
                </Link>
                <Link to="/membership">
                  <Button variant="ghost" className="w-full justify-start text-foreground hover:text-primary">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Membership & Billings
                  </Button>
                </Link>
                <Link to="/chat">
                  <Button variant="ghost" className="w-full justify-start text-foreground hover:text-primary">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Message
                  </Button>
                </Link>
                <Button variant="ghost" className="w-full justify-start text-foreground hover:text-primary">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4 space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-border/50 shadow-elegant backdrop-blur-sm bg-card/95">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Orders</p>
                      <p className="text-2xl font-bold text-foreground">400</p>
                      <p className="text-xs text-primary">+12% from last month</p>
                    </div>
                    <div className="h-8 w-16 bg-primary/20 rounded flex items-center justify-center">
                      <BarChart3 className="h-4 w-4 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50 shadow-elegant backdrop-blur-sm bg-card/95">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Membership Level</p>
                      <Badge className="bg-primary text-primary-foreground">Boost Lite</Badge>
                      <p className="text-xs text-muted-foreground mt-1">membership level</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50 shadow-elegant backdrop-blur-sm bg-card/95">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Member ID</p>
                      <p className="text-lg font-bold text-primary">BL - 234</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Profile Information */}
            <Card className="border-border/50 shadow-elegant backdrop-blur-sm bg-card/95">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-xl font-bold text-foreground">
                  Personal/Business Information
                </CardTitle>
                <Button
                  onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {isEditing ? "Save" : "Edit"}
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-foreground">Full Name</Label>
                    <Input
                      id="fullName"
                      value={profileData.fullName}
                      onChange={(e) => handleInputChange("fullName", e.target.value)}
                      disabled={!isEditing}
                      className="bg-background border-border/50 focus:border-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-foreground">Email</Label>
                    <Input
                      id="email"
                      value={profileData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      disabled={!isEditing}
                      className="bg-background border-border/50 focus:border-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-foreground">Phone</Label>
                    <Input
                      id="phone"
                      value={profileData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      disabled={!isEditing}
                      className="bg-background border-border/50 focus:border-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="whatsapp" className="text-foreground">WhatsApp</Label>
                    <Input
                      id="whatsapp"
                      value={profileData.whatsapp}
                      onChange={(e) => handleInputChange("whatsapp", e.target.value)}
                      disabled={!isEditing}
                      className="bg-background border-border/50 focus:border-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="telegram" className="text-foreground">Telegram</Label>
                    <Input
                      id="telegram"
                      value={profileData.telegram}
                      onChange={(e) => handleInputChange("telegram", e.target.value)}
                      disabled={!isEditing}
                      className="bg-background border-border/50 focus:border-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="businessName" className="text-foreground">Business Name (if any)</Label>
                    <Input
                      id="businessName"
                      value={profileData.businessName}
                      onChange={(e) => handleInputChange("businessName", e.target.value)}
                      disabled={!isEditing}
                      className="bg-background border-border/50 focus:border-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-foreground">City</Label>
                    <Input
                      id="city"
                      value={profileData.city}
                      onChange={(e) => handleInputChange("city", e.target.value)}
                      disabled={!isEditing}
                      className="bg-background border-border/50 focus:border-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state" className="text-foreground">State</Label>
                    <Input
                      id="state"
                      value={profileData.state}
                      onChange={(e) => handleInputChange("state", e.target.value)}
                      disabled={!isEditing}
                      className="bg-background border-border/50 focus:border-primary"
                    />
                  </div>
                </div>

                <div className="space-y-4 border-t border-border/50 pt-6">
                  <h3 className="text-lg font-semibold text-foreground">Additional Settings</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-foreground">Preferred Contact Channel</Label>
                      <p className="text-sm text-primary">Telegram</p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-foreground">Service Interest</Label>
                      <p className="text-sm text-primary">Telegram</p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    className="border-primary text-primary hover:bg-primary/10"
                  >
                    Change password
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
      <DarkModeToggle />
    </div>
  );
};

export default Profile;