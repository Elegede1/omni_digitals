import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link, useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
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

    fetch(`${backendUrl}/api/quotations/`, {
      headers: {
        'Authorization': `Token ${token}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          if (response.status === 401) {
            navigate("/signin");
          }
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        if (data.quotations) {
          setQuotations(data.quotations);
        }
      })
      .catch((error) =>
        setBackendMessage(`Failed to connect to backend: ${error.message}`)
      );
  }, [backendUrl, navigate]);

  const handleViewQuotation = (quotationId: string) => {
    // Logic to view quotation
    console.log("Viewing quotation:", quotationId);
  };

  const handleDeleteQuotation = async (quotationId: string) => {
    if (!confirm("Are you sure you want to delete this quotation?")) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${backendUrl}/api/quotations/${quotationId}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Token ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete quotation');
      }

      // Remove from state
      setQuotations(prev => prev.filter((q: any) => q.quotation_id !== quotationId));
      setBackendMessage("Quotation deleted successfully.");

      // Clear message after delay
      setTimeout(() => setBackendMessage(""), 3000);

    } catch (error) {
      console.error('Delete error:', error);
      setBackendMessage("Failed to delete quotation. Please try again.");
    }
  };

  const handleDownloadQuotation = async (quotationId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${backendUrl}/api/quotations/${quotationId}/download/`, {
        headers: {
          'Authorization': `Token ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to download PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `quotation_${quotationId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download error:', error);
      setBackendMessage("Failed to download PDF. Please try again.");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-500';
      case 'approved':
      case 'reviewed':
        return 'bg-green-500/20 text-green-500';
      case 'in progress':
      case 'in-review':
        return 'bg-blue-500/20 text-blue-500';
      case 'rejected':
      case 'cancelled':
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

        {/* Drafts Section */}
        {quotations.filter((q: any) => q.status === 'Draft').length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-foreground mb-4">Saved Drafts</h2>
            <Card className="border-border/50 shadow-elegant backdrop-blur-sm bg-card/95">
              <CardContent className="pt-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border/50">
                        <th className="text-left py-4 text-sm font-semibold text-foreground">Draft ID</th>
                        <th className="text-left py-4 text-sm font-semibold text-foreground">Services</th>
                        <th className="text-left py-4 text-sm font-semibold text-foreground">Price Estimate (₦ / $)</th>
                        <th className="text-left py-4 text-sm font-semibold text-foreground">Saved On</th>
                        <th className="text-left py-4 text-sm font-semibold text-foreground">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {quotations.filter((q: any) => q.status === 'Draft').map((quote: any, index) => (
                        <tr key={index} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                          <td className="py-4">
                            <span className="font-medium text-primary">{quote.quotation_id}</span>
                          </td>
                          <td className="py-4">
                            <span className="text-sm text-foreground">
                              {quote.selected_services.length} services
                              <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                                {quote.selected_services.map((s: any) => s.name).join(", ")}
                              </div>
                            </span>
                          </td>
                          <td className="py-4">
                            <span className="text-sm text-foreground block">
                              ₦{parseFloat(quote.price_estimate_min_naira).toLocaleString()} - ₦{parseFloat(quote.price_estimate_max_naira).toLocaleString()}
                            </span>
                            <span className="text-sm text-muted-foreground block">
                              ${parseFloat(quote.price_estimate_min_dollar).toLocaleString()} - ${parseFloat(quote.price_estimate_max_dollar).toLocaleString()}
                            </span>
                          </td>
                          <td className="py-4">
                            <span className="text-sm text-muted-foreground">
                              {new Date(quote.created_at).toLocaleDateString()}
                            </span>
                          </td>
                          <td className="py-4">
                            <div className="flex space-x-2">
                              <Button onClick={() => navigate(`/request-quotation?edit=${quote.quotation_id}`)} variant="outline" size="sm" className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
                                Edit Draft
                              </Button>
                              <Button onClick={() => handleDeleteQuotation(quote.quotation_id)} variant="destructive" size="sm">
                                Delete
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
          </div>
        )}

        {/* Submitted Quotations Table */}
        <h2 className="text-xl font-bold text-foreground mb-4">Submitted Quotations</h2>
        <Card className="border-border/50 shadow-elegant backdrop-blur-sm bg-card/95">
          <CardContent className="pt-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left py-4 text-sm font-semibold text-foreground">Quote ID</th>
                    <th className="text-left py-4 text-sm font-semibold text-foreground">Services</th>
                    <th className="text-left py-4 text-sm font-semibold text-foreground">Price Estimate (₦ / $)</th>
                    <th className="text-left py-4 text-sm font-semibold text-foreground">Date</th>
                    <th className="text-left py-4 text-sm font-semibold text-foreground">Status</th>
                    <th className="text-left py-4 text-sm font-semibold text-foreground">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {quotations.filter((q: any) => q.status !== 'Draft').map((quote: any, index) => (
                    <tr key={index} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                      <td className="py-4">
                        <span className="font-medium text-primary">{quote.quotation_id}</span>
                      </td>
                      <td className="py-4">
                        <span className="text-sm text-foreground">
                          {quote.selected_services.length} services
                          <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                            {quote.selected_services.map((s: any) => s.name).join(", ")}
                          </div>
                        </span>
                      </td>
                      <td className="py-4">
                        <span className="text-sm text-foreground block">
                          ₦{parseFloat(quote.price_estimate_min_naira).toLocaleString()} - ₦{parseFloat(quote.price_estimate_max_naira).toLocaleString()}
                        </span>
                        <span className="text-sm text-muted-foreground block">
                          ${parseFloat(quote.price_estimate_min_dollar).toLocaleString()} - ${parseFloat(quote.price_estimate_max_dollar).toLocaleString()}
                        </span>
                      </td>
                      <td className="py-4">
                        <span className="text-sm text-muted-foreground">
                          {new Date(quote.created_at).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="py-4">
                        <Badge className={getStatusColor(quote.status.toLowerCase())}>
                          {quote.status}
                        </Badge>
                      </td>
                      <td className="py-4">
                        <div className="flex space-x-2">
                          <Button onClick={() => handleViewQuotation(quote.quotation_id)} variant="ghost" size="sm" className="text-primary hover:bg-primary/10">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button onClick={() => handleDownloadQuotation(quote.quotation_id)} variant="ghost" size="sm" className="text-primary hover:bg-primary/10">
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button onClick={() => handleDeleteQuotation(quote.quotation_id)} variant="destructive" size="sm">
                            Delete
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
        <div className="mt-8">
          <Card className="border-border/50 shadow-elegant backdrop-blur-sm bg-card/95 text-center">
            <CardContent className="pt-8 pb-8">
              <h3 className="text-2xl font-semibold text-foreground mb-4">Ready for your next project?</h3>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Whether you need a custom quote, want to compare services, or look for bulk service packages,
                we are here to help you visualising your ideas.
              </p>
              <Link to="/request-quotation">
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 min-w-[200px] shadow-glow hover:shadow-elegant transition-all duration-300">
                  Get A Quotation
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
          </div>
  );
};

export default Quotations;
