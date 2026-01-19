import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, MessageCircle } from "lucide-react";
import { useState } from "react";

const CTASection = () => {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log("Email submitted:", email);
    setEmail("");
  };

  return (
    <section className="py-24 bg-gradient-hero relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.02%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center animate-fade-in">
          <MessageCircle className="w-16 h-16 text-primary mx-auto mb-8 animate-bounce" />

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
            HOW CAN WE <span className="text-primary">HELP?</span>
          </h2>

          <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto">
            Ready to boost your digital presence? Get in touch with our experts and
            let's create something amazing together.
          </p>

          <form onSubmit={handleSubmit} className="max-w-md mx-auto mb-12">
            <div className="flex flex-col sm:flex-row gap-4">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 h-12 bg-card/50 border-primary/30 focus:border-primary backdrop-blur-sm"
                required
              />
              <Button
                type="submit"
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow hover:shadow-elegant transition-all duration-300 hover:scale-105 group"
              >
                Get Started
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </form>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Button
              variant="outline"
              size="lg"
              className="border-primary text-primary hover:bg-primary/10 backdrop-blur-sm transition-all duration-300 hover:scale-105"
            >
              Schedule a Chat
            </Button>
            <Button
              variant="ghost"
              size="lg"
              className="text-foreground hover:text-primary transition-all duration-300 hover:scale-105"
            >
              View Our Portfolio
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;