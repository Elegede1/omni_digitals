import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import ServicesSection from "@/components/ServicesSection";
import FAQSection from "@/components/FAQSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";
import DarkModeToggle from "@/components/DarkModeToggle";

const Index = () => {
  const [backendMessage, setBackendMessage] = useState("");

  useEffect(() => {
    // Fetch data from the Django backend's health check endpoint
    fetch("http://127.0.0.1:8000/api/health/")
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
  }, []); // The empty array ensures this runs only once when the component loads

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <p className="my-4 text-center text-green-500">{backendMessage}</p>
      <HeroSection />
      <ServicesSection />
      <FAQSection />
      <CTASection />
      <Footer />
      <DarkModeToggle />
    </div>
  );
};

export default Index;
