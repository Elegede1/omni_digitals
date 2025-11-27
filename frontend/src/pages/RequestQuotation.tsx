import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import DarkModeToggle from "@/components/DarkModeToggle";
import { ChevronDown, HelpCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const RequestQuotation = () => {
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [formData, setFormData] = useState({});
  const [backendMessage, setBackendMessage] = useState("");
  const navigate = useNavigate();

  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000";

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      navigate("/signin");
      return;
    }

    fetch(`${backendUrl}/api/request-quotation/`, {
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
      .then((data) => setBackendMessage(data.message))
      .catch((error) =>
        setBackendMessage(`Failed to connect to backend: ${error.message}`)
      );
  }, [backendUrl, navigate]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const quotationData = {
      ...formData,
      services: selectedServices,
    };

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${backendUrl}/api/request-quotation/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`,
        },
        body: JSON.stringify(quotationData),
      });

      if (!response.ok) {
        throw new Error('Failed to submit quotation request');
      }

      const result = await response.json();
      setBackendMessage(result.message || "Quotation request submitted successfully!");
      // Optionally redirect or clear the form
      navigate("/quotations");

    } catch (error) {
      console.error("Error submitting quotation:", error);
      setBackendMessage("Failed to submit request. Please try again.");
    }
  };

  const serviceCategories = [
    {
      category: "Digital Marketing",
      services: [
        "Social Media Marketing (SMM)",
        "Search Engine Optimization (SEO)",
        "Pay-Per-Click Advertising (PPC)",
        "Content Marketing",
        "Email Marketing",
        "Affiliate Marketing",
        "Influencer Marketing",
        "Remarketing and Retargeting"
      ]
    },
    {
      category: "Branding and Design",
      services: []
    },
    {
      category: "Web and App Development",
      services: []
    },
    {
      category: "Content Creation",
      services: []
    },
    {
      category: "Specialized Services",
      services: []
    },
    {
      category: "Consulting Services",
      services: []
    },
    {
      category: "Business Support Solutions",
      services: []
    },
    {
      category: "Technology Solutions",
      services: []
    }
  ];

  const toggleService = (service: string) => {
    setSelectedServices(prev =>
      prev.includes(service)
        ? prev.filter(s => s !== service)
        : [...prev, service]
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 pt-24 pb-16">
        <p className="my-4 text-center text-green-500">{backendMessage}</p>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Service Categories */}
            <div className="lg:col-span-1 space-y-4">
              {serviceCategories.map((category, index) => (
                <Card key={index} className="border-border/50 shadow-elegant backdrop-blur-sm bg-card/95">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium text-foreground">
                        {category.category}
                      </CardTitle>
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </CardHeader>
                  {category.services.length > 0 && (
                    <CardContent className="pt-0 space-y-2">
                      {category.services.map((service, serviceIndex) => (
                        <div key={serviceIndex} className="flex items-center space-x-2">
                          <button
                            type="button"
                            onClick={() => toggleService(service)}
                            className={`w-4 h-4 rounded border-2 flex items-center justify-center ${selectedServices.includes(service)
                                ? 'bg-primary border-primary'
                                : 'border-border'
                              }`}
                          >
                            {selectedServices.includes(service) && (
                              <div className="w-2 h-2 bg-white rounded-sm" />
                            )}
                          </button>
                          <div className="flex items-center space-x-1">
                            <span className="text-sm text-foreground">{service}</span>
                            <HelpCircle className="h-3 w-3 text-muted-foreground" />
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>

            {/* Quote Form */}
            <div className="lg:col-span-2">
              <Card className="border-border/50 shadow-elegant backdrop-blur-sm bg-card/95">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-foreground">Email Marketing</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="platform" className="text-foreground">Platform</Label>
                      <Select onValueChange={(value) => handleInputChange('platform', value)}>
                        <SelectTrigger className="bg-background border-border/50 focus:border-primary">
                          <SelectValue placeholder="Select platform" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mailchimp">MailChimp</SelectItem>
                          <SelectItem value="constant-contact">Constant Contact</SelectItem>
                          <SelectItem value="sendgrid">SendGrid</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="quotation" className="text-foreground">get a quotation</Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="border-primary text-primary hover:bg-primary/10"
                        >
                          consult
                        </Button>
                      </div>
                      <Input
                        id="quotation"
                        onChange={(e) => handleInputChange('quotation_details', e.target.value)}
                        placeholder="Enter details for quotation"
                        className="bg-background border-border/50 focus:border-primary"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="estimate" className="text-foreground">Price (estimate)</Label>
                    <Input
                      id="estimate"
                      onChange={(e) => handleInputChange('price_estimate', e.target.value)}
                      placeholder="Enter estimated budget"
                      className="bg-background border-border/50 focus:border-primary"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="duration" className="text-foreground">Days/time duration</Label>
                    <Input
                      id="duration"
                      onChange={(e) => handleInputChange('duration', e.target.value)}
                      placeholder="Enter project duration"
                      className="bg-background border-border/50 focus:border-primary"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="services-picked" className="text-foreground">no of services picked</Label>
                    <div className="text-sm text-muted-foreground">
                      {selectedServices.length} service(s) selected
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="additional-info" className="text-foreground">Additional Information</Label>
                    <Textarea
                      id="additional-info"
                      onChange={(e) => handleInputChange('additional_info', e.target.value)}
                      placeholder="Please provide any additional details about your project requirements..."
                      className="bg-background border-border/50 focus:border-primary min-h-[100px]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contact-method" className="text-foreground">Preferred Contact Method</Label>
                    <Select onValueChange={(value) => handleInputChange('contact_method', value)}>
                      <SelectTrigger className="bg-background border-border/50 focus:border-primary">
                        <SelectValue placeholder="Select contact method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="phone">Phone</SelectItem>
                        <SelectItem value="telegram">Telegram</SelectItem>
                        <SelectItem value="whatsapp">WhatsApp</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex space-x-4">
                    <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90 flex-1">
                      Submit Quotation Request
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="border-border text-foreground hover:bg-muted/50"
                    >
                      Save as Draft
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
      <Footer />
      <DarkModeToggle />
    </div>
  );
};

export default RequestQuotation;
