import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import DarkModeToggle from "@/components/DarkModeToggle";
import ProfileSidebar from "@/components/ProfileSidebar";
import { Check, CreditCard, Calendar, Download } from "lucide-react";

const MembershipBilling = () => {
  const [currentPlan] = useState("BOOST LITE");
  const [backendMessage, setBackendMessage] = useState("");

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/membership-billing/")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => setBackendMessage(data.message))
      .catch((error) =>
        setBackendMessage(`Failed to connect to backend: ${error.message}`)
      );
  }, []);

  const membershipPlans = [
    {
      name: "Boost Lite",
      price: "Free",
      period: "Forever",
      features: [
        "1 Request at Task Support",
        "1 Free Stock Image",
        "Basic project support",
        "Monthly social media materials",
        "Access to Basic Catalog Resources"
      ],
      isCurrent: true
    },
    {
      name: "Boost Lite",
      price: "$29",
      period: "month",
      features: [
        "5 Requests at Task Support",
        "3 Free Stock Image",
        "Basic project support", 
        "Monthly social media materials",
        "Access to Basic Catalog Resources"
      ],
      isCurrent: false
    },
    {
      name: "Boost Lite",
      price: "$49",
      period: "month",
      features: [
        "15 Requests at Task Support",
        "5 Free Stock Image",
        "Priority project support",
        "Monthly social media materials",
        "Access to Basic Catalog Resources"
      ],
      isCurrent: false
    },
    {
      name: "Boost Lite",
      price: "$99",
      period: "month", 
      features: [
        "25 Requests at Task Support",
        "10 Free Stock Image",
        "Priority project support",
        "Weekly social media materials",
        "Access to Basic Catalog Resources"
      ],
      isCurrent: false
    }
  ];

  const transactions = [
    { date: "Jul 16, 2021 at 11:24 PM", description: "Standard subscription (monthly)", amount: "$20.00" },
    { date: "Jun 16, 2021 at 05:13 PM", description: "Standard subscription (monthly)", amount: "$20.00" },
    { date: "May 16, 2021 at 05:17 PM", description: "Standard subscription (monthly)", amount: "$20.00" },
    { date: "Apr 16, 2021 at 09:13 PM", description: "Standard subscription (monthly)", amount: "$20.00" }
  ];

  const mockUser = {
    name: "Jenny Wilson",
    email: "jenny@example.com",
    avatar: ""
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <ProfileSidebar user={mockUser} />
      <div className="container mx-auto px-4 pt-24 pb-16">
        <p className="my-4 text-center text-green-500">{backendMessage}</p>
        {/* Current Membership */}
        <Card className="border-border/50 shadow-elegant backdrop-blur-sm bg-card/95 mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold text-foreground mb-2">Current Level</CardTitle>
                <Badge className="bg-primary text-primary-foreground text-lg px-4 py-1">
                  {currentPlan}
                </Badge>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Status • Trial</p>
                <p className="text-sm text-muted-foreground">
                  Standard monthly subscription plan active since Apr 16, 2021
                </p>
                <p className="text-sm text-muted-foreground">
                  Next payment • June 16, 2025
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
              <div className="bg-background/50 p-4 rounded-lg text-center">
                <p className="text-sm text-muted-foreground">Marketing</p>
                <p className="text-lg font-bold text-primary">XX</p>
              </div>
              <div className="bg-background/50 p-4 rounded-lg text-center">
                <p className="text-sm text-muted-foreground">Web & App Dev</p>
                <p className="text-lg font-bold text-primary">XX</p>
              </div>
              <div className="bg-background/50 p-4 rounded-lg text-center">
                <p className="text-sm text-muted-foreground">Tech Solutions</p>
                <p className="text-lg font-bold text-primary">XX</p>
              </div>
              <div className="bg-background/50 p-4 rounded-lg text-center">
                <p className="text-sm text-muted-foreground">Specialized Services</p>
                <p className="text-lg font-bold text-primary">XX</p>
              </div>
              <div className="bg-background/50 p-4 rounded-lg text-center">
                <p className="text-sm text-muted-foreground">Next Level Unlocks</p>
                <p className="text-lg font-bold text-primary">XX</p>
              </div>
            </div>
            <div className="flex space-x-4">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                Cancel
              </Button>
              <Button variant="outline" className="border-primary text-primary hover:bg-primary/10">
                Pause
              </Button>
              <Button variant="outline" className="border-primary text-primary hover:bg-primary/10">
                Downgrade
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Membership Plans */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {membershipPlans.map((plan, index) => (
            <Card key={index} className={`border-border/50 shadow-elegant backdrop-blur-sm bg-card/95 ${plan.isCurrent ? 'ring-2 ring-primary' : ''}`}>
              <CardHeader>
                <CardTitle className="text-lg font-bold text-foreground">{plan.name}</CardTitle>
                <div className="text-2xl font-bold text-primary">
                  {plan.price}
                  {plan.price !== "Free" && <span className="text-sm text-muted-foreground">/{plan.period}</span>}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start space-x-2">
                      <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  className={`w-full ${plan.isCurrent ? 'bg-muted text-muted-foreground cursor-not-allowed' : 'bg-primary text-primary-foreground hover:bg-primary/90'}`}
                  disabled={plan.isCurrent}
                >
                  {plan.isCurrent ? 'Current Plan' : 'Choose Plan'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Payment Cards & Transactions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Payment Card */}
          <Card className="border-border/50 shadow-elegant backdrop-blur-sm bg-card/95">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-primary">Present Card</CardTitle>
              <p className="text-sm text-muted-foreground">**** points to collect gift</p>
            </CardHeader>
            <CardContent>
              <div className="bg-gradient-to-r from-primary/20 to-primary/10 p-6 rounded-lg mb-4">
                <div className="text-3xl font-bold text-primary mb-2">10,000</div>
                <p className="text-sm text-muted-foreground">points</p>
                <Button variant="outline" className="mt-4 border-primary text-primary hover:bg-primary/10">
                  Convert to cash
                </Button>
              </div>
              
              <div className="border-t border-border/50 pt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Payment Method</span>
                  <div className="flex items-center space-x-2">
                    <CreditCard className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">VISA **** 6521</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Name on Card</span>
                  <span className="text-sm font-medium">Jenny Wilson</span>
                </div>
                <Button className="w-full mt-4 bg-primary text-primary-foreground hover:bg-primary/90">
                  Change Card
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Transactions */}
          <Card className="border-border/50 shadow-elegant backdrop-blur-sm bg-card/95">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-foreground">Recent Invoice / Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-sm font-medium text-muted-foreground border-b border-border/50 pb-2">
                  <span>Date</span>
                  <span>Payment Type</span>
                  <span className="text-right">Amount</span>
                </div>
                {transactions.map((transaction, index) => (
                  <div key={index} className="grid grid-cols-3 gap-4 text-sm">
                    <span className="text-muted-foreground">{transaction.date}</span>
                    <span className="text-foreground">{transaction.description}</span>
                    <div className="text-right flex items-center justify-end space-x-2">
                      <span className="text-foreground">{transaction.amount}</span>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
      <DarkModeToggle />
    </div>
  );
};

export default MembershipBilling;