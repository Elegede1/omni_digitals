import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import DarkModeToggle from "@/components/DarkModeToggle";
import ProfileSidebar from "@/components/ProfileSidebar";
import { TrendingUp, Eye, BarChart3, Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [orderData, setOrderData] = useState([]);
  const [benefits, setBenefits] = useState([]);
  const [user, setUser] = useState({ name: "", email: "", avatar: "" });
  const [backendMessage, setBackendMessage] = useState("");
  const navigate = useNavigate();

  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000";

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate("/signin");
      return;
    }

    fetch(`${backendUrl}/api/dashboard/`, {
      headers: {
        'Authorization': `Token ${token}`, // Use 'Token' scheme for Django REST Framework
      },
    })
      .then((response) => {
        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            navigate("/signin"); // Redirect if token is invalid or expired
          }
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        setBackendMessage(data.message);
        if (data.orderData) setOrderData(data.orderData);
        if (data.benefits) setBenefits(data.benefits);
        if (data.user) setUser(data.user);
      })
      .catch((error) =>
        setBackendMessage(`Failed to connect to backend: ${error.message}`)
      );
  }, [backendUrl, navigate]);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <ProfileSidebar user={user} />
      <div className="container mx-auto px-4 pt-24 pb-16">
        <p className="my-4 text-center text-green-500">{backendMessage}</p>
        {/* Welcome Section */}
        <Card className="border-border/50 shadow-elegant backdrop-blur-sm bg-card/95 mb-8">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-primary mb-2">Welcome back ! {user.name}</h1>
                <p className="text-muted-foreground">Your current membership: Boost Elite</p>
                <p className="text-muted-foreground">Next renewal: March 10, 2025</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold text-foreground">Ready to boost your brand today?</p>
              </div>
            </div>

            {/* Notifications and Stats Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
              {/* Notifications Card */}
              <Card className="border-border/50 shadow-elegant backdrop-blur-sm bg-card/95 h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl font-bold text-primary">
                    <div className="relative">
                      <Bell className="h-6 w-6" />
                      <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full animate-pulse border-2 border-background"></span>
                    </div>
                    Notifications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Mock Notifications for now - in future fetch from backend */}
                    <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-semibold text-sm text-foreground">Admin Message</h4>
                        <span className="text-[10px] text-muted-foreground">Just now</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Welcome to Omni Digitals! We are excited to work with you.
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-semibold text-sm text-foreground">Community Reply</h4>
                        <span className="text-[10px] text-muted-foreground">2 hrs ago</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        John replied to your post "SEO Tips for 2025".
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Stats Cards Wrapper (Span 2 cols) */}
              <div className="lg:col-span-2 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="bg-background/50">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Total Spent</p>
                          <p className="text-3xl font-bold text-foreground">5</p>
                          <div className="flex items-center text-primary text-sm">
                            <TrendingUp className="h-4 w-4 mr-1" />
                            <span>10% vs last month</span>
                          </div>
                        </div>
                        <BarChart3 className="h-8 w-8 text-primary" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-background/50">
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <p className="text-xl font-bold text-primary mb-2">Hurrah !</p>
                        <p className="text-sm text-muted-foreground mb-4">
                          you are 300 points away to BOOST LEGEND
                        </p>
                        <div className="flex space-x-2 justify-center">
                          <Button
                            variant="outline"
                            className="border-primary text-primary hover:bg-primary/10"
                            size="sm"
                          >
                            Upgrade
                          </Button>
                          <Button
                            variant="outline"
                            className="border-primary text-primary hover:bg-primary/10"
                            size="sm"
                          >
                            Billing
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>

            {/* Completed Orders */}
            <Card className="border-border/50 shadow-elegant backdrop-blur-sm bg-card/95 mb-8">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-bold text-primary">Completed Orders</CardTitle>
                  <Button
                    onClick={() => navigate('/request-quotation')}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow"
                  >
                    Get a Quotation
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border/50">
                        <th className="text-left py-3 text-sm font-medium text-muted-foreground">Order ID</th>
                        <th className="text-left py-3 text-sm font-medium text-muted-foreground">Service</th>
                        <th className="text-left py-3 text-sm font-medium text-muted-foreground">Date Completed</th>
                        <th className="text-left py-3 text-sm font-medium text-muted-foreground">Status</th>
                        <th className="text-left py-3 text-sm font-medium text-muted-foreground">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Using 'benefits' or 'orderData' as source, filtered by 'Completed' or 'Done' status */}
                      {/* Since backend logic for 'Completed' isn't fully set, we will display a placeholder or existing data if matches */}
                      {[...orderData, ...benefits]
                        .filter(item => item.status === 'Completed' || item.status === 'Done')
                        .length > 0 ? (
                        [...orderData, ...benefits]
                          .filter(item => item.status === 'Completed' || item.status === 'Done')
                          .map((order, index) => (
                            <tr key={index} className="border-b border-border/50">
                              <td className="py-3 text-sm text-foreground">#{index + 1001}</td>
                              <td className="py-3 text-sm text-muted-foreground">{order.type || order.services || "Service"}</td>
                              <td className="py-3 text-sm text-muted-foreground">{order.end || order.date || "N/A"}</td>
                              <td className="py-3"><Badge className="bg-green-500/20 text-green-500">Completed</Badge></td>
                              <td className="py-3">
                                <Button variant="link" className="text-primary p-0">View Invoice</Button>
                              </td>
                            </tr>
                          ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-muted-foreground">
                            No completed orders yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
        <Footer />
        <DarkModeToggle />
      </div>
    </div>
  );
};

export default Dashboard;
