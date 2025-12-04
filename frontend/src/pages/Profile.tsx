import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Link, useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import DarkModeToggle from "@/components/DarkModeToggle";
import ProfileSidebar from "@/components/ProfileSidebar";
import { useAuth } from "@/context/AuthContext";
import { User, Settings, LogOut, BarChart3, MessageSquare, CreditCard, LayoutDashboard, Camera } from "lucide-react";

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    fullName: "",
    email: "",
    phone: "",
    whatsapp: "",
    telegram: "",
    businessName: "",
    city: "",
    state: "",
  });
  const [statistics, setStatistics] = useState({
    totalOrders: 0,
    membershipLevel: "Free",
    memberId: "N/A",
  });
  const [backendMessage, setBackendMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const navigate = useNavigate();
  const { userEmail, userAvatar, logout, login, updateAvatar } = useAuth();

  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000";

  // Handle OAuth redirect with token in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const email = urlParams.get('email');
    const avatar = urlParams.get('avatar');

    console.log('OAuth redirect check:', { token, email, avatar, url: window.location.href });

    if (token && email) {
      // User just logged in via OAuth, save credentials
      console.log('Logging in user from OAuth redirect');
      login(token, avatar || '', email);
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [login]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate("/signin");
      return;
    }

    fetch(`${backendUrl}/api/profile/`, {
      headers: {
        'Authorization': `Token ${token}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            logout();
            navigate("/signin");
          }
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        if (data.profile) {
          setProfileData(data.profile);
          // Update avatar in localStorage if provided by backend
          if (data.profile.avatar_url) {
            localStorage.setItem('avatar', data.profile.avatar_url);
          }
        }
        if (data.statistics) {
          setStatistics(data.statistics);
        }
        setIsLoading(false);
      })
      .catch((error) => {
        setBackendMessage(`Failed to connect to backend: ${error.message}`);
        setIsLoading(false);
      });
  }, [backendUrl, navigate, logout]);

  const handleInputChange = (field: string, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    const token = localStorage.getItem('token');

    try {
      const formData = new FormData();

      // Only append profile data if they've changed
      Object.keys(profileData).forEach(key => {
        formData.append(key, profileData[key as keyof typeof profileData]);
      });

      // Append profile picture if a new one was selected
      if (profilePicture) {
        formData.append('profile_picture', profilePicture);
      }

      const response = await fetch(`${backendUrl}/api/profile/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to save profile data');
      }

      const data = await response.json();
      setBackendMessage(data.message || "Profile updated successfully!");

      // Update avatar in auth context and localStorage if it changed
      if (data.avatar_url) {
        updateAvatar(data.avatar_url);
        setPreviewUrl(''); // Clear preview
      }

      setIsEditing(false);
      setProfilePicture(null);

    } catch (error) {
      console.error("Error saving profile data:", error);
      setBackendMessage("Failed to save profile. Please try again.");
    }
  };

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfilePicture(file);

      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Automatically enable edit mode when selecting a picture
      setIsEditing(true);
    }
  };

  const handleSignOut = () => {
    logout();
    navigate('/signin');
  };

  if (isLoading) {
    return <div>Loading...</div>; // Or a spinner component
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="fixed top-20 left-4 z-50 lg:hidden">
        <ProfileSidebar user={{ name: profileData.fullName, email: profileData.email, avatar: userAvatar }} />
      </div>

      <div className="container mx-auto px-4 pt-24 pb-16">
        <p className="my-4 text-center text-green-500">{backendMessage}</p>
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="hidden lg:block lg:w-1/4 space-y-6">
            <Card className="border-border/50 shadow-elegant backdrop-blur-sm bg-card/95">
              <CardHeader className="text-center">
                <div className="relative inline-block mx-auto mb-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage
                      src={previewUrl || userAvatar || "/placeholder.svg"}
                      alt={profileData.fullName}
                      className="object-cover"
                    />
                    <AvatarFallback>{userEmail ? userEmail.charAt(0).toUpperCase() : 'U'}</AvatarFallback>
                  </Avatar>
                  <label htmlFor="profile-picture-upload" className="absolute bottom-0 right-0 bg-primary text-primary-foreground p-1.5 rounded-full cursor-pointer hover:bg-primary/90 transition-colors">
                    <Camera className="h-3 w-3" />
                  </label>
                  <input
                    id="profile-picture-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleProfilePictureChange}
                  />
                </div>
                <CardTitle className="text-lg font-semibold text-foreground">
                  {profileData.fullName || userEmail}
                </CardTitle>
                <p className="text-sm text-muted-foreground">Member</p>
              </CardHeader>
            </Card>

            <Card className="border-border/50 shadow-elegant backdrop-blur-sm bg-card/95">
              <CardContent className="pt-6 space-y-3">
                <Link to="/dashboard">
                  <Button variant="ghost" className="w-full justify-start text-foreground hover:bg-primary/10">
                    <LayoutDashboard className="h-4 w-4 mr-2" />
                    Dashboard
                  </Button>
                </Link>
                <Button variant="default" className="w-full justify-start bg-primary text-primary-foreground">
                  <Settings className="h-4 w-4 mr-2" />
                  Personal Information
                </Button>
                <Link to="/quotations">
                  <Button variant="ghost" className="w-full justify-start text-foreground hover:bg-primary/10">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Quotations
                  </Button>
                </Link>
                <Link to="/membership">
                  <Button variant="ghost" className="w-full justify-start text-foreground hover:bg-primary/10">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Membership & Billings
                  </Button>
                </Link>
                <Link to="/chat">
                  <Button variant="ghost" className="w-full justify-start text-foreground hover:bg-primary/10">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Message
                  </Button>
                </Link>
                <Button variant="ghost" className="w-full justify-start text-foreground hover:bg-primary/10" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="lg:w-3/4 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-border/50 shadow-elegant backdrop-blur-sm bg-card/95">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Orders</p>
                      <p className="text-2xl font-bold text-foreground">{statistics.totalOrders}</p>
                      <p className="text-xs text-muted-foreground">Completed requests</p>
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
                      <Badge className="bg-primary text-primary-foreground">{statistics.membershipLevel}</Badge>
                      <p className="text-xs text-muted-foreground mt-1">Current tier</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50 shadow-elegant backdrop-blur-sm bg-card/95">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Member ID</p>
                      <p className="text-lg font-bold text-primary">{statistics.memberId}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

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
                    {isEditing ? (
                      <Input
                        id="fullName"
                        value={profileData.fullName}
                        onChange={(e) => handleInputChange("fullName", e.target.value)}
                        className="bg-background border-border/50 focus:border-primary"
                      />
                    ) : (
                      <p className="text-foreground py-2">{profileData.fullName || "Not provided"}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-foreground">Email</Label>
                    {isEditing ? (
                      <Input
                        id="email"
                        value={profileData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        className="bg-background border-border/50 focus:border-primary"
                      />
                    ) : (
                      <p className="text-foreground py-2">{profileData.email || "Not provided"}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-foreground">Phone</Label>
                    {isEditing ? (
                      <Input
                        id="phone"
                        value={profileData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        className="bg-background border-border/50 focus:border-primary"
                      />
                    ) : (
                      <p className="text-foreground py-2">{profileData.phone || "Not provided"}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="whatsapp" className="text-foreground">WhatsApp</Label>
                    {isEditing ? (
                      <Input
                        id="whatsapp"
                        value={profileData.whatsapp}
                        onChange={(e) => handleInputChange("whatsapp", e.target.value)}
                        className="bg-background border-border/50 focus:border-primary"
                      />
                    ) : (
                      <p className="text-foreground py-2">{profileData.whatsapp || "Not provided"}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="telegram" className="text-foreground">Telegram</Label>
                    {isEditing ? (
                      <Input
                        id="telegram"
                        value={profileData.telegram}
                        onChange={(e) => handleInputChange("telegram", e.target.value)}
                        className="bg-background border-border/50 focus:border-primary"
                      />
                    ) : (
                      <p className="text-foreground py-2">{profileData.telegram || "Not provided"}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="businessName" className="text-foreground">Business Name (if any)</Label>
                    {isEditing ? (
                      <Input
                        id="businessName"
                        value={profileData.businessName}
                        onChange={(e) => handleInputChange("businessName", e.target.value)}
                        className="bg-background border-border/50 focus:border-primary"
                      />
                    ) : (
                      <p className="text-foreground py-2">{profileData.businessName || "Not provided"}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-foreground">City</Label>
                    {isEditing ? (
                      <Input
                        id="city"
                        value={profileData.city}
                        onChange={(e) => handleInputChange("city", e.target.value)}
                        className="bg-background border-border/50 focus:border-primary"
                      />
                    ) : (
                      <p className="text-foreground py-2">{profileData.city || "Not provided"}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state" className="text-foreground">State</Label>
                    {isEditing ? (
                      <Input
                        id="state"
                        value={profileData.state}
                        onChange={(e) => handleInputChange("state", e.target.value)}
                        className="bg-background border-border/50 focus:border-primary"
                      />
                    ) : (
                      <p className="text-foreground py-2">{profileData.state || "Not provided"}</p>
                    )}
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