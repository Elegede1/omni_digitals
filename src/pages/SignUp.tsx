import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import DarkModeToggle from "@/components/DarkModeToggle";
import { Link } from "react-router-dom";

const SignUp = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle sign up logic here
    console.log("Sign up attempt:", formData);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-border/50 shadow-elegant backdrop-blur-sm bg-card/95">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold text-foreground">Create Account</CardTitle>
          <p className="text-muted-foreground">
            Join our community to boost your digital presence
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-foreground">First Name</Label>
              <Input
                id="firstName"
                placeholder="John"
                className="bg-background border-border/50 focus:border-primary"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-foreground">Last Name</Label>
              <Input
                id="lastName"
                placeholder="Doe"
                className="bg-background border-border/50 focus:border-primary"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-foreground">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="john@example.com"
              className="bg-background border-border/50 focus:border-primary"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-foreground">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Create a strong password"
              className="bg-background border-border/50 focus:border-primary"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-foreground">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              className="bg-background border-border/50 focus:border-primary"
            />
          </div>
          <div className="flex items-center space-x-2">
            <input type="checkbox" id="terms" className="rounded" />
            <Label htmlFor="terms" className="text-sm text-muted-foreground">
              I agree to the{" "}
              <Link to="#" className="text-primary hover:underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link to="#" className="text-primary hover:underline">
                Privacy Policy
              </Link>
            </Label>
          </div>
          <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
            Create Account
          </Button>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link to="/signin" className="text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
      <DarkModeToggle />
    </div>
  );
};

export default SignUp;