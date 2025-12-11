import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DarkModeToggle from "@/components/DarkModeToggle";
import { Link, useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";
import { Eye, EyeOff } from "lucide-react";

const SignUp = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [backendMessage, setBackendMessage] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000";

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/profile');
    }
  }, [isAuthenticated, navigate]);

  const passwordMatch = useMemo(() => {
    return formData.password && formData.confirmPassword && formData.password === formData.confirmPassword;
  }, [formData.password, formData.confirmPassword]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0]);
      setSelectedAvatar("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBackendMessage("");

    if (!passwordMatch) {
      setBackendMessage("Passwords do not match!");
      return;
    }

    const submissionData = new FormData();
    submissionData.append('first_name', formData.firstName);
    submissionData.append('last_name', formData.lastName);
    submissionData.append('email', formData.email);
    submissionData.append('password', formData.password);
    if (uploadedFile) {
      submissionData.append('profile_picture', uploadedFile);
    } else if (selectedAvatar) {
      submissionData.append('avatar_url', selectedAvatar);
    }

    try {
      const response = await fetch(`${backendUrl}/api/signup/`, {
        method: "POST",
        body: submissionData,
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Sign up successful:", data);
        navigate("/signin");
      } else {
        console.error("Sign up failed:", data);
        const errorMessage = Object.values(data).flat().join(' ');
        setBackendMessage(errorMessage || "Sign up failed. Please check your details.");
      }
    } catch (error) {
      console.error("An error occurred during sign up:", error);
      setBackendMessage("An error occurred. Please try again.");
    }
  };

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-background flex items-center justify-center p-4 pt-20">
        <Card className="w-full max-w-md border-border/50 shadow-elegant backdrop-blur-sm bg-card/95">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold text-foreground">Create Account</CardTitle>
            <p className="text-muted-foreground">
              Join our community to boost your digital presence
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {backendMessage && <p className="text-center text-red-500">{backendMessage}</p>}

            <form onSubmit={handleSubmit}>
              <div className="space-y-2 mb-4">
                <Label className="text-foreground">Choose an Avatar or Upload a Picture</Label>
                <div className="flex justify-center items-center gap-4">
                  <Avatar
                    className={`h-20 w-20 cursor-pointer ${selectedAvatar === 'male' ? 'ring-2 ring-primary' : ''}`}
                    onClick={() => { setSelectedAvatar('male'); setUploadedFile(null); }}
                  >
                    <AvatarImage src="/male-face-avatar.png" alt="Male Avatar" />
                    <AvatarFallback>M</AvatarFallback>
                  </Avatar>
                  <Avatar
                    className={`h-20 w-20 cursor-pointer ${selectedAvatar === 'female' ? 'ring-2 ring-primary' : ''}`}
                    onClick={() => { setSelectedAvatar('female'); setUploadedFile(null); }}
                  >
                    <AvatarImage src="/female-face-avatar.png" alt="Female Avatar" />
                    <AvatarFallback>F</AvatarFallback>
                  </Avatar>
                  <div className="text-center">
                    <Label htmlFor="picture-upload" className="cursor-pointer text-primary hover:underline">Upload Picture</Label>
                    <Input id="picture-upload" type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                    {uploadedFile && <p className="text-xs text-muted-foreground mt-1">{uploadedFile.name}</p>}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-foreground">First Name</Label>
                  <Input id="firstName" placeholder="John" className="bg-background border-border/50 focus:border-primary" value={formData.firstName} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-foreground">Last Name</Label>
                  <Input id="lastName" placeholder="Doe" className="bg-background border-border/50 focus:border-primary" value={formData.lastName} onChange={handleChange} />
                </div>
              </div>
              <div className="space-y-2 mt-4">
                <Label htmlFor="email" className="text-foreground">Email</Label>
                <Input id="email" type="email" placeholder="john@example.com" className="bg-background border-border/50 focus:border-primary" value={formData.email} onChange={handleChange} />
              </div>
              <div className="relative space-y-2 mt-4">
                <Label htmlFor="password" className="text-foreground">Password</Label>
                <Input id="password" type={showPassword ? "text" : "password"} placeholder="Create a strong password" className="bg-background border-border/50 focus:border-primary pr-10" value={formData.password} onChange={handleChange} />
                <Button type="button" variant="ghost" size="sm" className="absolute right-1 top-6" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <div className="relative space-y-2 mt-4">
                <Label htmlFor="confirmPassword" className="text-foreground">Confirm Password</Label>
                <Input id="confirmPassword" type={showConfirmPassword ? "text" : "password"} placeholder="Confirm your password" className="bg-background border-border/50 focus:border-primary pr-10" value={formData.confirmPassword} onChange={handleChange} />
                <Button type="button" variant="ghost" size="sm" className="absolute right-1 top-6" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
                {formData.confirmPassword && (
                  <p className={`text-xs mt-1 ${passwordMatch ? 'text-green-500' : 'text-red-500'}`}>
                    {passwordMatch ? "Passwords match" : "Passwords do not match"}
                  </p>
                )}
              </div>
              <div className="flex items-center space-x-2 mt-4">
                <input type="checkbox" id="terms" className="rounded" />
                <Label htmlFor="terms" className="text-sm text-muted-foreground">
                  I agree to the{" "}<Link to="#" className="text-primary hover:underline">Terms of Service</Link>{" "}and{" "}<Link to="#" className="text-primary hover:underline">Privacy Policy</Link>
                </Label>
              </div>
              <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 mt-4">Create Account</Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
              <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground">Or</span></div>
            </div>

            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={() => { window.location.href = `${backendUrl}/accounts/google/login/?process=signup`; }}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
              Continue with Google
            </Button>

            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}<Link to="/signin" className="text-primary hover:underline">Sign in</Link>
              </p>
            </div>
          </CardContent>
        </Card>
        <DarkModeToggle />
      </div>
    </>
  );
};

export default SignUp;