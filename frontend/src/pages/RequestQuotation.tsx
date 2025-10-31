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

const RequestQuotation = () => {
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [backendMessage, setBackendMessage] = useState("");

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL;
    fetch(`${apiUrl}/api/request-quotation/`)
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
                          onClick={() => toggleService(service)}
                          className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                            selectedServices.includes(service)
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
                    <Select>
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
                        variant="outline" 
                        size="sm"
                        className="border-primary text-primary hover:bg-primary/10"
                      >
                        consult
                      </Button>
                    </div>
                    <Input
                      id="quotation"
                      placeholder="Enter details for quotation"
                      className="bg-background border-border/50 focus:border-primary"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="estimate" className="text-foreground">Price (estimate)</Label>
                  <Input
                    id="estimate"
                    placeholder="Enter estimated budget"
                    className="bg-background border-border/50 focus:border-primary"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration" className="text-foreground">Days/time duration</Label>
                  <Input
                    id="duration"
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
                    placeholder="Please provide any additional details about your project requirements..."
                    className="bg-background border-border/50 focus:border-primary min-h-[100px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact-method" className="text-foreground">Preferred Contact Method</Label>
                  <Select>
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
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90 flex-1">
                    Submit Quotation Request
                  </Button>
                  <Button 
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
      </div>
      <Footer />
      <DarkModeToggle />
    </div>
  );
};

export default RequestQuotation;