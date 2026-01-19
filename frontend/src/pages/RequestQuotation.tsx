import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { ChevronDown, HelpCircle, X } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";

const RequestQuotation = () => {
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [formData, setFormData] = useState<any>({});
  const [backendMessage, setBackendMessage] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set([0]));
  const [selectedCategory, setSelectedCategory] = useState(0);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  const templateId = searchParams.get('template');

  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000";

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate("/signin");
      return;
    }

    if (editId) {
      fetchDraftDetails(editId, token);
    } else if (templateId) {
      fetchTemplateDetails(templateId);
    }
  }, [navigate, editId, templateId]);

  const fetchTemplateDetails = async (id: string) => {
    try {
      const response = await fetch(`${backendUrl}/api/works/`);
      if (response.ok) {
        const data = await response.json();
        const template = data.works.find((w: any) => w.quotation_id === id);
        if (template) {
          if (template.selected_services && Array.isArray(template.selected_services)) {
            setSelectedServices(template.selected_services.map((s: any) => s.name));
          }
          setFormData((prev: any) => ({
            ...prev,
            duration: template.duration,
          }));
          setBackendMessage("Template loaded successfully.");
          // Clear message
          setTimeout(() => setBackendMessage(""), 3000);
        }
      }
    } catch (e) { console.error(e); }
  };

  const fetchDraftDetails = async (id: string, token: string) => {
    try {
      const response = await fetch(`${backendUrl}/api/quotations/${id}/`, {
        headers: { 'Authorization': `Token ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        // Pre-fill form
        // Populate selectedServices from data.selected_services (array of objects {name, ...})
        if (data.selected_services && Array.isArray(data.selected_services)) {
          setSelectedServices(data.selected_services.map((s: any) => s.name));
        }
        // Populate formData
        setFormData({
          duration: data.duration,
          additional_info: data.additional_info,
          contact_method: data.contact_method
        });
      } else {
        setBackendMessage("Failed to load draft details.");
      }
    } catch (error) {
      console.error("Error fetching draft:", error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent, isDraft: boolean = false) => {
    e.preventDefault();

    // Calculate totals
    const totals = calculateTotals();

    // Prepare full service details for the backend
    const fullSelectedServices = selectedServices.map(name => {
      const s = getServiceByName(name);
      return s ? {
        name: s.name,
        priceNaira: s.priceNaira,
        priceDollar: s.priceDollar,
        note: s.note
      } : null;
    }).filter(s => s !== null);

    const quotationData = {
      selected_services: fullSelectedServices,
      price_estimate_min_naira: totals.totalMinNaira,
      price_estimate_max_naira: totals.totalMaxNaira,
      price_estimate_min_dollar: totals.totalMinDollar,
      price_estimate_max_dollar: totals.totalMaxDollar,
      duration: formData.duration || "",
      additional_info: formData.additional_info || "",
      contact_method: formData.contact_method || "",
      status: isDraft ? 'Draft' : 'Pending'
    };

    try {
      const token = localStorage.getItem('token');
      let url = `${backendUrl}/api/quotations/submit/`;
      let method = 'POST';

      // If we are editing an existing draft, use UPDATE endpoint
      if (editId) {
        url = `${backendUrl}/api/quotations/${editId}/update/`;
        method = 'PUT';
      }

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`,
        },
        body: JSON.stringify(quotationData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit request');
      }

      const result = await response.json();
      setBackendMessage(isDraft ? "Draft saved successfully!" : "Quotation submitted successfully! Redirecting...");

      setTimeout(() => {
        navigate("/quotations");
      }, 1500);

    } catch (error: any) {
      console.error("Error submitting quotation:", error);
      setBackendMessage(error.message || "Failed to submit request. Please try again.");
    }
  };

  const toggleService = (serviceName: string) => {
    setSelectedServices((prev) =>
      prev.includes(serviceName) ? prev.filter((s) => s !== serviceName) : [...prev, serviceName]
    );
  };

  const toggleCategory = (index: number) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const handleCategorySelect = (index: number) => {
    setSelectedCategory(index);
    toggleCategory(index);
  };

  // Helper function to get all services with their details
  const getAllServicesFromCategory = (categoryIndex: number) => {
    return serviceCategories[categoryIndex].services;
  };

  // Helper function to get service details by name
  const getServiceByName = (serviceName: string) => {
    for (const category of serviceCategories) {
      const service = category.services.find(s => s.name === serviceName);
      if (service) return service;
    }
    return null;
  };

  // Calculate total price range for selected services
  const calculateTotals = () => {
    const selectedServiceDetails = selectedServices
      .map(name => getServiceByName(name))
      .filter(service => service !== null);

    const totalMinNaira = selectedServiceDetails.reduce((sum, s) => sum + (s?.priceNaira.min || 0), 0);
    const totalMaxNaira = selectedServiceDetails.reduce((sum, s) => sum + (s?.priceNaira.max || 0), 0);
    const totalMinDollar = selectedServiceDetails.reduce((sum, s) => sum + (s?.priceDollar.min || 0), 0);
    const totalMaxDollar = selectedServiceDetails.reduce((sum, s) => sum + (s?.priceDollar.max || 0), 0);

    return { totalMinNaira, totalMaxNaira, totalMinDollar, totalMaxDollar };
  };

  const serviceCategories = [
    {
      category: "Digital Marketing",
      services: [
        {
          name: "Social Media Marketing (SMM)",
          priceNaira: { min: 50000, max: 200000 },
          priceDollar: { min: 50, max: 200 },
          note: "Ad spend separate"
        },
        {
          name: "Search Engine Optimization (SEO)",
          priceNaira: { min: 100000, max: 500000 },
          priceDollar: { min: 100, max: 500 },
          note: ""
        },
        {
          name: "Pay-Per-Click Advertising (PPC)",
          priceNaira: { min: 75000, max: 300000 },
          priceDollar: { min: 75, max: 300 },
          note: "Ad spend separate"
        },
        {
          name: "Content Marketing",
          priceNaira: { min: 80000, max: 250000 },
          priceDollar: { min: 80, max: 250 },
          note: ""
        },
        {
          name: "Email Marketing",
          priceNaira: { min: 40000, max: 150000 },
          priceDollar: { min: 40, max: 150 },
          note: "Depends on list size"
        },
        {
          name: "Affiliate Marketing",
          priceNaira: { min: 60000, max: 200000 },
          priceDollar: { min: 60, max: 200 },
          note: ""
        },
        {
          name: "Influencer Marketing",
          priceNaira: { min: 100000, max: 500000 },
          priceDollar: { min: 100, max: 500 },
          note: "Depends on influencer tier"
        },
        {
          name: "Remarketing and Retargeting",
          priceNaira: { min: 50000, max: 180000 },
          priceDollar: { min: 50, max: 180 },
          note: ""
        }
      ]
    },
    {
      category: "Branding and Design",
      services: [
        {
          name: "Brand Identity",
          priceNaira: { min: 200000, max: 650000 },
          priceDollar: { min: 200, max: 800 },
          note: ""
        },
        {
          name: "Graphic Design",
          priceNaira: { min: 15000, max: 60000 },
          priceDollar: { min: 15, max: 80 },
          note: "Per design"
        },
        {
          name: "Creative Direction",
          priceNaira: { min: 120000, max: 350000 },
          priceDollar: { min: 150, max: 400 },
          note: "Per project"
        },
        {
          name: "UI/UX Design",
          priceNaira: { min: 250000, max: 900000 },
          priceDollar: { min: 300, max: 1200 },
          note: "Per project"
        }
      ]
    },
    {
      category: "Web and App Development",
      services: [
        {
          name: "Website Development",
          priceNaira: { min: 250000, max: 1800000 },
          priceDollar: { min: 300, max: 2500 },
          note: ""
        },
        {
          name: "Landing Pages / Funnels",
          priceNaira: { min: 120000, max: 600000 },
          priceDollar: { min: 150, max: 800 },
          note: ""
        },
        {
          name: "Website Maintenance",
          priceNaira: { min: 30000, max: 120000 },
          priceDollar: { min: 30, max: 150 },
          note: "Per month"
        },
        {
          name: "App Development",
          priceNaira: { min: 2500000, max: 12000000 },
          priceDollar: { min: 3000, max: 15000 },
          note: "Coming Soon"
        },
        {
          name: "Technical Integrations",
          priceNaira: { min: 40000, max: 150000 },
          priceDollar: { min: 40, max: 200 },
          note: ""
        }
      ]
    },
    {
      category: "Content Creation",
      services: [
        {
          name: "Video Editing (Reels/TikToks)",
          priceNaira: { min: 8000, max: 25000 },
          priceDollar: { min: 10, max: 40 },
          note: "Per video"
        },
        {
          name: "Long-form YouTube Editing",
          priceNaira: { min: 35000, max: 120000 },
          priceDollar: { min: 40, max: 150 },
          note: "Per video"
        },
        {
          name: "Photography",
          priceNaira: { min: 40000, max: 150000 },
          priceDollar: { min: 50, max: 200 },
          note: "Coming Soon - Per session"
        },
        {
          name: "UGC Creation",
          priceNaira: { min: 20000, max: 70000 },
          priceDollar: { min: 20, max: 120 },
          note: "Per video"
        },
        {
          name: "Copywriting",
          priceNaira: { min: 5000, max: 25000 },
          priceDollar: { min: 10, max: 40 },
          note: "Per article/page"
        },
        {
          name: "2D Animation",
          priceNaira: { min: 40000, max: 150000 },
          priceDollar: { min: 50, max: 200 },
          note: "Per minute"
        },
        {
          name: "3D Animation",
          priceNaira: { min: 80000, max: 350000 },
          priceDollar: { min: 80, max: 450 },
          note: "Per minute"
        }
      ]
    },
    {
      category: "Specialized Services",
      services: [
        {
          name: "Community Management",
          priceNaira: { min: 70000, max: 250000 },
          priceDollar: { min: 80, max: 350 },
          note: "Per month"
        },
        {
          name: "Organic Social Growth",
          priceNaira: { min: 40000, max: 150000 },
          priceDollar: { min: 50, max: 200 },
          note: "Per month"
        },
        {
          name: "Funnel Systems & Automation",
          priceNaira: { min: 150000, max: 600000 },
          priceDollar: { min: 150, max: 800 },
          note: "Per project"
        },
        {
          name: "Data & Analytics Setup",
          priceNaira: { min: 40000, max: 150000 },
          priceDollar: { min: 40, max: 200 },
          note: ""
        },
        {
          name: "Monthly Performance Reporting",
          priceNaira: { min: 30000, max: 120000 },
          priceDollar: { min: 30, max: 150 },
          note: ""
        }
      ]
    },
    {
      category: "Consulting Services",
      services: [
        {
          name: "Business Consulting",
          priceNaira: { min: 40000, max: 120000 },
          priceDollar: { min: 50, max: 150 },
          note: "Per hour"
        },
        {
          name: "Marketing Consulting",
          priceNaira: { min: 35000, max: 100000 },
          priceDollar: { min: 40, max: 120 },
          note: "Per hour"
        },
        {
          name: "Operations Consulting",
          priceNaira: { min: 50000, max: 150000 },
          priceDollar: { min: 60, max: 180 },
          note: "Per hour"
        }
      ]
    },
    {
      category: "Business Support Solutions",
      services: [
        {
          name: "Virtual Assistance",
          priceNaira: { min: 20000, max: 70000 },
          priceDollar: { min: 30, max: 120 },
          note: "Per week"
        },
        {
          name: "Customer Support Setup",
          priceNaira: { min: 40000, max: 150000 },
          priceDollar: { min: 40, max: 200 },
          note: ""
        },
        {
          name: "Vendor/Technician Sourcing",
          priceNaira: { min: 10000, max: 25000 },
          priceDollar: { min: 10, max: 40 },
          note: "Per request"
        }
      ]
    },
    {
      category: "Technology Solutions",
      services: [
        {
          name: "IT Support",
          priceNaira: { min: 15000, max: 50000 },
          priceDollar: { min: 20, max: 60 },
          note: "Coming Soon - Per intervention"
        },
        {
          name: "Smart Home/IoT Setup",
          priceNaira: { min: 80000, max: 300000 },
          priceDollar: { min: 100, max: 400 },
          note: "Coming Soon - Per project"
        },
        {
          name: "Software & Tool Setup",
          priceNaira: { min: 20000, max: 70000 },
          priceDollar: { min: 20, max: 80 },
          note: ""
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 pt-24 pb-16">
        <p className="my-4 text-center text-green-500">{backendMessage}</p>
        <form onSubmit={handleSubmit}>
          <div className="max-w-5xl mx-auto">
            {/* Quote Form - Full Width */}
            <Card className="border-border/50 shadow-elegant backdrop-blur-sm bg-card/95">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-xl font-bold text-foreground">
                  Request Quotation
                </CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="border-primary text-primary hover:bg-primary/10"
                >
                  consult
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* UPPER SECTION: Service Selection - All Categories */}
                <div className="space-y-4">
                  <Label className="text-foreground font-semibold text-lg">Service Selection</Label>
                  <div className="space-y-2">
                    {serviceCategories.map((category, categoryIndex) => (
                      <div key={categoryIndex} className="border border-border/50 rounded-lg bg-card/50">
                        {/* Category Header */}
                        <div
                          className="flex items-center justify-between p-3 cursor-pointer hover:bg-muted/50 transition-colors rounded-t-lg"
                          onClick={() => toggleCategory(categoryIndex)}
                        >
                          <span className="font-medium text-foreground">{category.category}</span>
                          <ChevronDown
                            className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${expandedCategories.has(categoryIndex) ? 'rotate-180' : ''
                              }`}
                          />
                        </div>

                        {/* Category Services */}
                        {expandedCategories.has(categoryIndex) && category.services.length > 0 && (
                          <div className="p-3 pt-0 space-y-2 border-t border-border/30">
                            {category.services.map((service, serviceIndex) => (
                              <div
                                key={serviceIndex}
                                className="flex items-start space-x-3 p-2 hover:bg-muted/30 rounded transition-colors"
                              >
                                {/* Checkbox */}
                                <button
                                  type="button"
                                  onClick={() => toggleService(service.name)}
                                  className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${selectedServices.includes(service.name)
                                    ? 'bg-primary border-primary'
                                    : 'border-border hover:border-primary'
                                    }`}
                                >
                                  {selectedServices.includes(service.name) && (
                                    <div className="w-2.5 h-2.5 bg-white rounded-sm" />
                                  )}
                                </button>

                                {/* Service Info */}
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-sm text-foreground">{service.name}</div>
                                  <div className="text-xs text-muted-foreground mt-0.5">
                                    ₦{service.priceNaira.min.toLocaleString()}-{service.priceNaira.max.toLocaleString()} /
                                    ${service.priceDollar.min}-{service.priceDollar.max}
                                    {service.note && ` • ${service.note}`}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* LOWER SECTION: Selected Services & Form */}
                {selectedServices.length > 0 && (
                  <div className="space-y-4 pt-4 border-t-2 border-primary/20">
                    <Label className="text-foreground font-semibold text-lg">Selected Services</Label>
                    <div className="space-y-2">
                      {selectedServices.map((serviceName) => {
                        const service = getServiceByName(serviceName);
                        if (!service) return null;
                        return (
                          <div
                            key={serviceName}
                            className="flex items-center justify-between p-3 border border-border/50 rounded-lg bg-muted/20"
                          >
                            <div className="flex-1">
                              <div className="font-medium text-foreground text-sm">{service.name}</div>
                              <div className="text-xs text-muted-foreground mt-1">
                                ₦{service.priceNaira.min.toLocaleString()}-{service.priceNaira.max.toLocaleString()} /
                                ${service.priceDollar.min}-{service.priceDollar.max}
                                {service.note && ` • ${service.note}`}
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleService(serviceName)}
                              className="ml-2 h-8 w-8 p-0 hover:bg-destructive/10"
                            >
                              <X className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Price Estimate with Dynamic Calculation */}
                <div className="space-y-2">
                  <Label htmlFor="estimate" className="text-foreground font-semibold">Price (estimate)</Label>
                  <div className="p-4 border border-primary/50 rounded-lg bg-primary/5">
                    {selectedServices.length > 0 ? (
                      <>
                        <div className="text-sm mb-1">
                          <span className="text-muted-foreground">Total Range (Naira): </span>
                          <span className="text-foreground font-bold">
                            ₦{calculateTotals().totalMinNaira.toLocaleString()} –
                            ₦{calculateTotals().totalMaxNaira.toLocaleString()}
                          </span>
                        </div>
                        <div className="text-sm">
                          <span className="text-muted-foreground">Total Range (Dollar): </span>
                          <span className="text-foreground font-bold">
                            ${calculateTotals().totalMinDollar.toLocaleString()} –
                            ${calculateTotals().totalMaxDollar.toLocaleString()}
                          </span>
                        </div>
                      </>
                    ) : (
                      <span className="text-muted-foreground text-sm">Select services to see pricing</span>
                    )}
                  </div>
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
                    onClick={(e) => handleSubmit(e as any, true)}
                  >
                    Save as Draft
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </form>
      </div>
      <Footer />
          </div>
  );
};

export default RequestQuotation;
