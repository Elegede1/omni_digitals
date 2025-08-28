import { Card, CardContent } from "@/components/ui/card";
import { 
  FileText, 
  Palette, 
  Video, 
  Cloud, 
  BarChart3, 
  Headphones 
} from "lucide-react";

const services = [
  {
    icon: FileText,
    title: "Content Marketing",
    description: "Strategic content creation that drives engagement and builds your brand authority."
  },
  {
    icon: Palette,
    title: "Graphic Design",
    description: "Stunning visual designs that capture your brand essence and captivate your audience."
  },
  {
    icon: Video,
    title: "Video Editing",
    description: "Professional video production and editing services to tell your story compellingly."
  },
  {
    icon: Cloud,
    title: "Cloud Hosting",
    description: "Reliable and scalable cloud infrastructure solutions for your digital presence."
  },
  {
    icon: BarChart3,
    title: "Market Research",
    description: "Data-driven insights to understand your market and optimize your strategies."
  },
  {
    icon: Headphones,
    title: "Virtual Assistance",
    description: "Dedicated support to streamline your operations and boost productivity."
  }
];

const ServicesSection = () => {
  return (
    <section id="services" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Our <span className="text-primary">Services</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Comprehensive digital solutions designed to elevate your business and drive sustainable growth
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <Card 
              key={service.title}
              className="group hover:shadow-glow transition-all duration-500 hover:scale-105 border-border hover:border-primary/30 animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardContent className="p-8">
                <div className="mb-6 relative">
                  <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
                    <service.icon className="w-8 h-8 text-primary group-hover:scale-110 transition-transform duration-300" />
                  </div>
                </div>
                
                <h3 className="text-xl font-semibold text-foreground mb-4 group-hover:text-primary transition-colors duration-300">
                  {service.title}
                </h3>
                
                <p className="text-muted-foreground leading-relaxed">
                  {service.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;