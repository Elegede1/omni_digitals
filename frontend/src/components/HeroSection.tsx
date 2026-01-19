import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Facebook, Instagram, Linkedin, Heart, ThumbsUp, Share2, MapPin } from "lucide-react";

import logoLight from "@/assets/logo-light.png";
import logoDark from "@/assets/logo-dark.png";

// Icon configuration with properties
const iconConfig = [
  { id: 'facebook', Icon: Facebook, size: 16, iconSize: 8, color: 'text-primary' },
  { id: 'instagram', Icon: Instagram, size: 18, iconSize: 9, color: 'text-green-600' },
  { id: 'x', Icon: null, size: 14, iconSize: 7, color: 'text-primary', isXIcon: true },
  { id: 'linkedin', Icon: Linkedin, size: 15, iconSize: 7, color: 'text-green-700' },
  { id: 'heart', Icon: Heart, size: 14, iconSize: 7, color: 'text-primary fill-primary' },
  { id: 'thumbsup', Icon: ThumbsUp, size: 15, iconSize: 7, color: 'text-primary' },
  { id: 'share', Icon: Share2, size: 16, iconSize: 8, color: 'text-green-600' },
  { id: 'location', Icon: MapPin, size: 14, iconSize: 7, color: 'text-green-600' },
  { id: 'play', Icon: Play, size: 16, iconSize: 8, color: 'text-primary' },
  { id: 'deco1', Icon: null, size: 14, iconSize: 6, color: 'bg-primary', isDecorative: true },
  { id: 'deco2', Icon: null, size: 15, iconSize: 7, color: 'bg-gradient-primary', isDecorative: true, rounded: true },
];

const HeroSection = () => {
  const CIRCLE_RADIUS = 160; // w-80 = 320px / 2
  const [iconStates, setIconStates] = useState(() => {
    // Initialize with random positions and velocities
    return iconConfig.map(config => {
      // Random angle and distance from center
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * (CIRCLE_RADIUS - config.size * 2);
      const x = Math.cos(angle) * distance;
      const y = Math.sin(angle) * distance;

      // Random velocity (speed between 0.5 and 2 pixels per frame)
      const speed = 0.5 + Math.random() * 1.5;
      const velocityAngle = Math.random() * Math.PI * 2;
      const vx = Math.cos(velocityAngle) * speed;
      const vy = Math.sin(velocityAngle) * speed;

      return { ...config, x, y, vx, vy };
    });
  });

  const animationFrameId = useRef<number>();

  useEffect(() => {
    const animate = () => {
      setIconStates(prevStates => {
        return prevStates.map(icon => {
          // Update position
          let newX = icon.x + icon.vx;
          let newY = icon.y + icon.vy;
          let newVx = icon.vx;
          let newVy = icon.vy;

          // Check collision with circle boundary
          const distanceFromCenter = Math.sqrt(newX * newX + newY * newY);
          const iconRadius = icon.size * 2; // Account for icon size

          if (distanceFromCenter + iconRadius > CIRCLE_RADIUS) {
            // Collision detected - reflect velocity
            // Normal vector from center to icon
            const normalX = newX / distanceFromCenter;
            const normalY = newY / distanceFromCenter;

            // Dot product of velocity and normal
            const dotProduct = newVx * normalX + newVy * normalY;

            // Reflect velocity: v' = v - 2(v·n)n
            newVx = newVx - 2 * dotProduct * normalX;
            newVy = newVy - 2 * dotProduct * normalY;

            // Move icon back inside boundary
            const penetration = (distanceFromCenter + iconRadius) - CIRCLE_RADIUS;
            newX -= normalX * penetration;
            newY -= normalY * penetration;
          }

          return { ...icon, x: newX, y: newY, vx: newVx, vy: newVy };
        });
      });

      animationFrameId.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-hero overflow-hidden pt-20">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.02%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>

      <div className="container mx-auto px-4 pt-1 pb-8 relative z-10">
        {/* Large Left-Aligned Logo */}
        <div className="flex justify-start mb-1 animate-fade-in">
          <img
            src={logoLight}
            alt="Omni Digitals Logo"
            className="h-40 md:h-64 w-auto dark:hidden transition-all duration-300 hover:scale-105 mix-blend-multiply"
          />
          <img
            src={logoDark}
            alt="Omni Digitals Logo"
            className="h-40 md:h-64 w-auto hidden dark:block transition-all duration-300 hover:scale-105 mix-blend-lighten"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8 animate-fade-in">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-foreground leading-tight">
              Navigating the{" "}
              <span className="text-primary animate-glow-pulse">digital landscape</span>{" "}
              for success
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-2xl">
              Welcome to Omni Digitals, your trusted online service partner. We provide tailored solutions,
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
                className="border-primary text-primary transition-all duration-300 group"
              >
                <Play className="mr-2 h-5 w-5 transition-transform" />
                Watch Demo
              </Button>
            </div>
          </div>

          {/* Right Content - Physics-Based Animated Circle */}
          <div className="relative animate-scale-in">
            <div className="relative w-full max-w-md mx-auto animate-float">
              {/* Main Circle */}
              <div className="w-80 h-80 rounded-full bg-gradient-primary shadow-glow mx-auto relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent"></div>

                {/* Physics-Based Floating Icons */}
                {iconStates.map((icon) => (
                  <div
                    key={icon.id}
                    className="absolute bg-card rounded-full shadow-elegant flex items-center justify-center transition-transform"
                    style={{
                      width: `${icon.size * 4}px`,
                      height: `${icon.size * 4}px`,
                      left: `calc(50% + ${icon.x}px)`,
                      top: `calc(50% + ${icon.y}px)`,
                      transform: 'translate(-50%, -50%)',
                    }}
                  >
                    {icon.isXIcon ? (
                      <svg className={`w-${icon.iconSize} h-${icon.iconSize} ${icon.color}`} fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                      </svg>
                    ) : icon.isDecorative ? (
                      <div className={`${icon.color} ${icon.rounded ? 'rounded-full' : 'rounded-sm'}`} style={{ width: `${icon.iconSize * 4}px`, height: `${icon.iconSize * 4}px` }}></div>
                    ) : icon.Icon ? (
                      <icon.Icon className={`w-${icon.iconSize} h-${icon.iconSize} ${icon.color}`} />
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;