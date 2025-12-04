import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import DarkModeToggle from "@/components/DarkModeToggle";
import ProfileSidebar from "@/components/ProfileSidebar";
import { TrendingUp, Eye, BarChart3 } from "lucide-react";
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

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
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
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        className="border-primary text-primary hover:bg-primary/10"
                      >
                        Upgrade Membership
                      </Button>
                      <Button
                        variant="outline"
                        className="border-primary text-primary hover:bg-primary/10"
                      >
                        View Billing
                      </Button>
                      <Button
                        variant="outline"
                        className="border-primary text-primary hover:bg-primary/10"
                      >
                        Contact Support
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Order List */}
        <Card className="border-border/50 shadow-elegant backdrop-blur-sm bg-card/95 mb-8">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-primary">Order List</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left py-3 text-sm font-medium text-muted-foreground">Order Type</th>
                    <th className="text-left py-3 text-sm font-medium text-muted-foreground">Start Date</th>
                    <th className="text-left py-3 text-sm font-medium text-muted-foreground">End Date</th>
                    <th className="text-left py-3 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="text-left py-3 text-sm font-medium text-muted-foreground">Performance</th>
                    <th className="text-left py-3 text-sm font-medium text-muted-foreground">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {orderData.map((order, index) => (
                    <tr key={index} className="border-b border-border/50">
                      <td className="py-3 text-sm text-foreground">{order.type}</td>
                      <td className="py-3 text-sm text-muted-foreground">{order.start}</td>
                      <td className="py-3 text-sm text-muted-foreground">{order.end}</td>
                      <td className="py-3">
                        <Badge
                          className={`${order.status === 'active' ? 'bg-green-500/20 text-green-500' :
                              order.status === 'cancelled' ? 'bg-red-500/20 text-red-500' :
                                order.status === 'completed' ? 'bg-blue-500/20 text-blue-500' :
                                  'bg-yellow-500/20 text-yellow-500'
                            }`}
                        >
                          {order.status}
                        </Badge>
                      </td>
                      <td className="py-3 text-sm text-muted-foreground">{order.performance}</td>
                      <td className="py-3">
                        <Button variant="link" className="text-primary p-0">
                          {order.action}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Benefits Table */}
        <Card className="border-border/50 shadow-elegant backdrop-blur-sm bg-card/95">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-bold text-primary">Benefits</CardTitle>
              <Button
                onClick={() => navigate('/request-quotation')}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Get A Quotation
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left py-3 text-sm font-medium text-muted-foreground">Quote ID</th>
                    <th className="text-left py-3 text-sm font-medium text-muted-foreground">Client Type</th>
                    <th className="text-left py-3 text-sm font-medium text-muted-foreground">Requested Services</th>
                    <th className="text-left py-3 text-sm font-medium text-muted-foreground">Service Package</th>
                    <th className="text-left py-3 text-sm font-medium text-muted-foreground">Date</th>
                    <th className="text-left py-3 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="text-left py-3 text-sm font-medium text-muted-foreground">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {benefits.map((benefit, index) => (
                    <tr key={index} className="border-b border-border/50">
                      <td className="py-3 text-sm text-foreground">Boost lite</td>
                      <td className="py-3 text-sm text-muted-foreground">{benefit.type}</td>
                      <td className="py-3 text-sm text-muted-foreground">{benefit.services}</td>
                      <td className="py-3 text-sm text-muted-foreground">{benefit.package}</td>
                      <td className="py-3 text-sm text-muted-foreground">{benefit.date}</td>
                      <td className="py-3 text-sm text-muted-foreground">{benefit.status}</td>
                      <td className="py-3 text-sm text-muted-foreground">{benefit.action}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
      <Footer />
      <DarkModeToggle />
    </div>
  );
};

export default Dashboard;
