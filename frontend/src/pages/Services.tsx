import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
    Layout,
    Smartphone,
    Megaphone,
    Palette,
    Code,
    Briefcase,
    Users,
    Truck,
    HardHat,
    Wrench,
    ArrowRight,
    Search,
    ChevronRight
} from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Services = () => {
    const digitalServices = [
        {
            icon: Megaphone,
            title: "Digital Marketing & Strategy",
            desc: "Comprehensive growth strategies including SEO, SEM, and social media management to put your brand in front of the right audience.",
            features: ["SEO Optimization", "Social Media Growth", "Paid Ad Campaigns", "Conversion Strategy"]
        },
        {
            icon: Palette,
            title: "Graphic Design & Identity",
            desc: "Visual storytelling that resonates. We build brands from the ground up, ensuring a consistent and premium visual language.",
            features: ["Logo & Branding", "Social Media Assets", "Marketing Material", "UI/UX Design"]
        },
        {
            icon: Code,
            title: "Website Design & Development",
            desc: "Modern, high-performance websites and web applications built with the latest technologies for speed, security, and scalability.",
            features: ["Next.js/React Dev", "E-commerce Solutions", "Custom Web Apps", "Responsive Landing Pages"]
        },
        {
            icon: Smartphone,
            title: "Content Creation",
            desc: "High-quality digital content that engages and converts, tailored specifically for your target platforms and audience.",
            features: ["Video Production", "Copywriting", "Blog Management", "Motion Graphics"]
        },
        {
            icon: Briefcase,
            title: "Business Support",
            desc: "Operational support for startups and established businesses, helping you streamline processes and focus on your core mission.",
            features: ["Virtual Assistance", "Process Automation", "Customer Support Systems", "Data Entry & Org"]
        },
        {
            icon: Users,
            title: "Community Solutions",
            desc: "Building and managing vibrant online communities through structured engagement, rewarding participation and growth.",
            features: ["Community Moderation", "Engagement Campaigns", "Point System Setup", "Reward Programs"]
        }
    ];

    const omniManServices = [
        {
            icon: Truck,
            title: "Logistics & Delivery",
            desc: "Reliable field-based logistics tailored for businesses requiring physical movement of goods with structure and accountability.",
        },
        {
            icon: Wrench,
            title: "Technical Field Services",
            desc: "On-site technical support and installations conducted by trained professionals representing our excellence core.",
        },
        {
            icon: HardHat,
            title: "Operational Assistance",
            desc: "Offline operational support for events, field research, and physical business interactions.",
        }
    ];

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Navigation />

            <main className="pt-20">
                {/* Hero Section */}
                <section className="relative py-24 overflow-hidden bg-gradient-hero">
                    <div className="absolute inset-0 bg-primary/5 opacity-30"></div>
                    <div className="container mx-auto px-4 relative z-10 text-center">
                        <Badge className="mb-6 bg-primary/10 text-primary hover:bg-primary/20 transition-colors px-4 py-1 text-sm">Our Capabilities</Badge>
                        <h1 className="text-5xl md:text-7xl font-bold mb-8 animate-fade-in">
                            Strategic <span className="text-primary italic">Digital Solutions</span>
                        </h1>
                        <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed animate-slide-up">
                            From digital transformation to physical field operations, we provide the structured services needed to navigate the modern digital landscape.
                        </p>
                    </div>
                </section>

                {/* Digital Solutions Section */}
                <section className="py-24 bg-background px-4">
                    <div className="container mx-auto">
                        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                            <div className="max-w-2xl space-y-4">
                                <h2 className="text-4xl font-bold">Digital Services</h2>
                                <p className="text-lg text-muted-foreground">
                                    Our core digital division offers premium services designed for scalability, excellence, and consistency. No matter the scale, we deliver structure.
                                </p>
                            </div>
                            <Link to="/request-quotation">
                                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-elegant">
                                    Request a Quotation
                                    <ArrowRight className="ml-2 w-5 h-5" />
                                </Button>
                            </Link>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {digitalServices.map((service, i) => (
                                <Card key={i} className="group hover:border-primary/50 transition-all duration-300 bg-card border-border/50 overflow-hidden">
                                    <CardContent className="p-8 space-y-6">
                                        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-300">
                                            <service.icon className="w-7 h-7" />
                                        </div>
                                        <h3 className="text-2xl font-bold group-hover:text-primary transition-colors">{service.title}</h3>
                                        <p className="text-muted-foreground text-sm line-clamp-3">
                                            {service.desc}
                                        </p>
                                        <ul className="space-y-2 pt-4 border-t border-border/50">
                                            {service.features.map((feature, j) => (
                                                <li key={j} className="flex items-center gap-2 text-xs font-medium text-foreground/80">
                                                    <ChevronRight className="w-3 h-3 text-primary" />
                                                    {feature}
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Omni Man Section */}
                <section className="py-24 bg-secondary/30 relative px-4 overflow-hidden">
                    {/* Decorative Background Icon */}
                    <div className="absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none">
                        <HardHat className="w-[500px] h-[500px]" />
                    </div>

                    <div className="container mx-auto relative z-10">
                        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
                            <Badge variant="outline" className="border-foreground/20 text-foreground">Offline Division</Badge>
                            <h2 className="text-4xl font-bold">Omni Man Field Services</h2>
                            <p className="text-lg text-muted-foreground">
                                Bridging the gap between the screen and the street. Omni Man provides professional, structured field operations and technical assistance on the ground.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            {omniManServices.map((service, i) => (
                                <div key={i} className="bg-background rounded-3xl p-10 shadow-elegant border border-border/50 space-y-6">
                                    <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center text-primary shadow-inner">
                                        <service.icon className="w-8 h-8" />
                                    </div>
                                    <h3 className="text-xl font-bold">{service.title}</h3>
                                    <p className="text-muted-foreground text-sm leading-relaxed">
                                        {service.desc}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-20 bg-background border-y border-border/50">
                    <div className="container mx-auto px-4 text-center">
                        <h2 className="text-3xl font-bold mb-6">Need a custom solution?</h2>
                        <p className="text-muted-foreground mb-10 max-w-xl mx-auto">
                            If you have specific requirements not listed here, our team of experts can design a tailored structured solution for your unique challenge.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link to="/chat">
                                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 px-10">
                                    Chat with AI Support
                                </Button>
                            </Link>
                            <Link to="/request-quotation">
                                <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary/10 px-10">
                                    Talk to a Specialist
                                </Button>
                            </Link>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
};

export default Services;
