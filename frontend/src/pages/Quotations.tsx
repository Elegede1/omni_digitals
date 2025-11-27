import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link, useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import DarkModeToggle from "@/components/DarkModeToggle";
import ProfileSidebar from "@/components/ProfileSidebar";
import { Eye, Download, Filter } from "lucide-react";

const Quotations = () => {
  const [sortBy, setSortBy] = useState("date");
  const [quotations, setQuotations] = useState([]);
  const [backendMessage, setBackendMessage] = useState("");
  const navigate = useNavigate();

  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000";

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      navigate("/signin");
      return;
    }

    fetch(`${backendUrl}/api/quotation/`, {
      headers: {
        'Authorization': `Token ${token}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          if (response.status === 401) {
            navigate("/signin"); // Redirect to signin if not authenticated
          }
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        setBackendMessage(data.message)
        if (data.quotations) {
          setQuotations(data.quotations)
        }
      })
      .catch((error) =>
        setBackendMessage(`Failed to connect to backend: ${error.message}`)
      );
  }, [backendUrl, navigate]);

  const handleViewQuotation = (quotationId) => {
    // Logic to view quotation, maybe open a modal or a new page
    console.log("Viewing quotation:", quotationId);
  };

  const handleDownloadQuotation = (quotationId) => {
    // Logic to download quotation PDF
    window.open(`${backendUrl}/api/quotation/${quotationId}/download/`, '_blank');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-500';
      case 'approved':
        return 'bg-green-500/20 text-green-500';
      case 'in-review':
        return 'bg-blue-500/20 text-blue-500';
      case 'rejected':
        return 'bg-red-500/20 text-red-500';
      case 'completed':
        return 'bg-purple-500/20 text-purple-500';
      default:
        return 'bg-gray-500/20 text-gray-500';
    }
  };

  const mockUser = {
    name: "John Doe",
    email: "john@example.com",
    avatar: ""
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <ProfileSidebar user={mockUser} />
      <div className="container mx-auto px-4 pt-24 pb-16">
        <p className="my-4 text-center text-green-500">{backendMessage}</p>
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">PAST QUOTATIONS</h1>
            <p className="text-muted-foreground">
              "Review your past service quotations, track pricing history, and convert accepted quotes into orders."
            </p>
          </div>
          <Link to="/request-quotation">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 mt-4 md:mt-0">
              Request New Quotation
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <Card className="border-border/50 shadow-elegant backdrop-blur-sm bg-card/95 mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-foreground">Sort By:</span>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-32 bg-background border-border/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="status">Status</SelectItem>
                    <SelectItem value="amount">Amount</SelectItem>
                    <SelectItem value="service">Service</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex space-x-2">
                <Button variant="outline" size="sm" className="border-border text-foreground">
                  Status
                </Button>
                <Button variant="outline" size="sm" className="border-border text-foreground">
                  Quote ID
                </Button>
                <Button variant="outline" size="sm" className="border-border text-foreground">
                  Service Package
                </Button>
                <Button variant="outline" size="sm" className="border-border text-foreground">
                  Service
                </Button>
                <Button variant="outline" size="sm" className="border-border text-foreground">
                  Date
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quotations Table */}
        <Card className="border-border/50 shadow-elegant backdrop-blur-sm bg-card/95">
          <CardContent className="pt-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left py-4 text-sm font-semibold text-foreground">Quote ID</th>
                    <th className="text-left py-4 text-sm font-semibold text-foreground">Client Type</th>
                    <th className="text-left py-4 text-sm font-semibold text-foreground">Requested Services</th>
                    <th className="text-left py-4 text-sm font-semibold text-foreground">Service Package</th>
                    <th className="text-left py-4 text-sm font-semibold text-foreground">Date</th>
                    <th className="text-left py-4 text-sm font-semibold text-foreground">Status</th>
                    <th className="text-left py-4 text-sm font-semibold text-foreground">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {quotations.map((quote, index) => (
                    <tr key={index} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                      <td className="py-4">
                        <span className="font-medium text-primary">{quote.id}</span>
                      </td>
                      <td className="py-4">
                        <span className="text-sm text-foreground">Individual</span>
                      </td>
                      <td className="py-4">
                        <span className="text-sm text-foreground">{quote.service}</span>
                      </td>
                      <td className="py-4">
                        <Badge className="bg-primary/20 text-primary">
                          {quote.package}
                        </Badge>
                      </td>
                      <td className="py-4">
                        <span className="text-sm text-muted-foreground">{quote.date}</span>
                      </td>
                      <td className="py-4">
                        <Badge className={getStatusColor(quote.status)}>
                          {quote.status}
                        </Badge>
                      </td>
                      <td className="py-4">
                        <div className="flex space-x-2">
                          <Button onClick={() => handleViewQuotation(quote.id)} variant="ghost" size="sm" className="text-primary hover:bg-primary/10">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button onClick={() => handleDownloadQuotation(quote.id)} variant="ghost" size="sm" className="text-primary hover:bg-primary/10">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <Card className="border-border/50 shadow-elegant backdrop-blur-sm bg-card/95 text-center">
            <CardContent className="pt-6 pb-6">
              <h3 className="font-semibold text-foreground mb-2">Need a Quote?</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Get a custom quotation for your next project
              </p>
              <Link to="/request-quotation">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                  Get A Quotation
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-elegant backdrop-blur-sm bg-card/95 text-center">
            <CardContent className="pt-6 pb-6">
              <h3 className="font-semibold text-foreground mb-2">Compare Services</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Compare different service packages and pricing
              </p>
              <Link to="/request-quotation">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                  Get A Quotation
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-elegant backdrop-blur-sm bg-card/95 text-center">
            <CardContent className="pt-6 pb-6">
              <h3 className="font-semibold text-foreground mb-2">Bulk Services</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Get quotes for multiple services at once
              </p>
              <Link to="/request-quotation">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                  Get A Quotation
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
      <DarkModeToggle />
    </div>
  );
};

export default Quotations;
