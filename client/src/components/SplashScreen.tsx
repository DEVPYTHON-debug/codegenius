import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface SplashScreenProps {
  onSkip: () => void;
}

export default function SplashScreen({ onSkip }: SplashScreenProps) {
  const [slideIndex, setSlideIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const slides = [
    {
      title: "Si-link",
      subtitle: "Empowered and Smarter Students",
      description: "One Service at a Time",
      animation: "animate-glow"
    },
    {
      title: "Connect",
      subtitle: "Find Services",
      description: "From Hair to Tech Support",
      animation: "animate-float"
    },
    {
      title: "Secure",
      subtitle: "Safe Payments",
      description: "With Flutterwave Integration",
      animation: "animate-pulse"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % slides.length);
    }, 1500);

    return () => clearInterval(interval);
  }, [slides.length]);

  const currentSlide = slides[slideIndex];

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-dark-purple z-50 flex flex-col items-center justify-center overflow-hidden">
      {/* Background Animation */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full">
          <div className="w-96 h-96 bg-neon-cyan/10 rounded-full blur-3xl animate-pulse"></div>
        </div>
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full">
          <div className="w-96 h-96 bg-neon-pink/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        </div>
        <div className="absolute top-1/4 left-1/4 w-full h-full">
          <div className="w-64 h-64 bg-electric-purple/10 rounded-full blur-2xl animate-pulse" style={{animationDelay: '0.5s'}}></div>
        </div>
      </div>

      {/* Content */}
      <div className="relative text-center space-y-8 animate-float px-4">
        {/* Logo with Neon Glow */}
        <div className="relative">
          <h1 className={`text-6xl md:text-8xl font-black text-neon-cyan neon-glow ${currentSlide.animation}`}>
            {slideIndex === 0 ? (
              <>Si<span className="text-neon-pink">-link</span></>
            ) : slideIndex === 1 ? (
              <span className="text-cyber-green">Connect</span>
            ) : (
              <span className="text-cyber-amber">Secure</span>
            )}
          </h1>
          <p className="text-lg md:text-xl text-gray-300 mt-4 font-light">
            {currentSlide.subtitle}
          </p>
          <p className="text-base text-gray-400 mt-2">
            {currentSlide.description}
          </p>
        </div>

        {/* Slide Indicators */}
        <div className="flex justify-center space-x-2">
          {slides.map((_, index) => (
            <div
              key={index}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === slideIndex 
                  ? 'bg-neon-cyan shadow-lg shadow-neon-cyan/50' 
                  : 'bg-gray-600'
              }`}
            />
          ))}
        </div>

        {/* Animated Loading Indicator */}
        <div className="flex justify-center space-x-2">
          <div className="w-3 h-3 bg-neon-cyan rounded-full animate-pulse"></div>
          <div className="w-3 h-3 bg-neon-pink rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
          <div className="w-3 h-3 bg-electric-purple rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
        </div>

        {/* Features Preview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 max-w-4xl">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-cyber-green/20 rounded-full flex items-center justify-center mx-auto">
              <i className="fas fa-store text-cyber-green text-xl"></i>
            </div>
            <h3 className="text-white font-semibold">Shops & Services</h3>
            <p className="text-gray-400 text-sm">Find everything you need on campus</p>
          </div>
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-neon-cyan/20 rounded-full flex items-center justify-center mx-auto">
              <i className="fas fa-comments text-neon-cyan text-xl"></i>
            </div>
            <h3 className="text-white font-semibold">Real-time Chat</h3>
            <p className="text-gray-400 text-sm">Connect instantly with providers</p>
          </div>
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-cyber-amber/20 rounded-full flex items-center justify-center mx-auto">
              <i className="fas fa-shield-alt text-cyber-amber text-xl"></i>
            </div>
            <h3 className="text-white font-semibold">Secure Payments</h3>
            <p className="text-gray-400 text-sm">Safe transactions with Flutterwave</p>
          </div>
        </div>
      </div>

      {/* Skip Button */}
      <Button 
        onClick={onSkip}
        variant="ghost"
        className="absolute bottom-8 right-8 text-gray-400 hover:text-white transition-colors group"
      >
        Skip
        <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
      </Button>

      {/* Progress Bar */}
      <div className="absolute bottom-4 left-4 right-4">
        <div className="w-full bg-gray-700 rounded-full h-1">
          <div 
            className="bg-gradient-to-r from-neon-cyan to-neon-pink h-1 rounded-full transition-all duration-1500 ease-linear"
            style={{ width: `${((slideIndex + 1) / slides.length) * 100}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}
