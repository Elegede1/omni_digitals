import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-hero overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.02%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>
      
      <div className="container mx-auto px-4 py-24 relative z-10">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8 animate-fade-in">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-foreground leading-tight">
              Navigating the{" "}
              <span className="text-primary animate-glow-pulse">digital landscape</span>{" "}
              for success
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-2xl">
              Welcome to Boost Promotions, your trusted online service partner. We provide tailored solutions, 
              including digital marketing, branding, and web development, to help your business shine. Our 
              team is dedicated to driving your success and delivering exceptional results.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <Button 
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow hover:shadow-elegant transition-all duration-300 hover:scale-105 group"
              >
                Book a consultation
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              <Button 
                variant="outline" 
                size="lg"
                className="border-primary text-primary hover:bg-primary/10 transition-all duration-300 hover:scale-105 group"
              >
                <Play className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                Watch Demo
              </Button>
            </div>
          </div>

          {/* Right Content - Animated Illustration */}
          <div className="relative animate-scale-in">
            <div className="relative w-full max-w-md mx-auto animate-float">
              {/* Main Circle */}
              <div className="w-80 h-80 rounded-full bg-gradient-primary shadow-glow mx-auto relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent"></div>
                
                {/* Floating Icons */}
                <div className="absolute top-16 right-16 w-12 h-12 bg-card rounded-full shadow-elegant flex items-center justify-center animate-bounce">
                  <div className="w-6 h-6 bg-primary rounded-full"></div>
                </div>
                
                <div className="absolute bottom-20 left-16 w-16 h-16 bg-card rounded-full shadow-elegant flex items-center justify-center animate-bounce delay-200">
                  <Play className="w-8 h-8 text-primary" />
                </div>
                
                <div className="absolute top-32 left-8 w-10 h-10 bg-card rounded-full shadow-elegant flex items-center justify-center animate-bounce delay-500">
                  <div className="w-4 h-4 bg-primary rounded-sm"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;