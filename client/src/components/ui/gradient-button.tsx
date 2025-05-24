import { forwardRef } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface GradientButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "cyan-purple" | "green-cyan" | "pink-purple" | "amber-cyan" | "full-spectrum";
  size?: "sm" | "md" | "lg";
  glow?: boolean;
  pulse?: boolean;
}

const GradientButton = forwardRef<HTMLButtonElement, GradientButtonProps>(
  ({ 
    className, 
    variant = "cyan-purple", 
    size = "md", 
    glow = false, 
    pulse = false,
    children, 
    ...props 
  }, ref) => {
    const gradientClasses = {
      "cyan-purple": "bg-gradient-to-r from-neon-cyan to-electric-purple hover:from-electric-purple hover:to-neon-pink",
      "green-cyan": "bg-gradient-to-r from-cyber-green to-neon-cyan hover:from-neon-cyan hover:to-cyber-green",
      "pink-purple": "bg-gradient-to-r from-neon-pink to-electric-purple hover:from-electric-purple hover:to-neon-pink",
      "amber-cyan": "bg-gradient-to-r from-cyber-amber to-neon-cyan hover:from-neon-cyan hover:to-cyber-amber",
      "full-spectrum": "bg-gradient-to-r from-neon-cyan via-electric-purple to-neon-pink hover:from-neon-pink hover:via-electric-purple hover:to-neon-cyan"
    };

    const sizeClasses = {
      sm: "px-4 py-2 text-sm",
      md: "px-6 py-3 text-base",
      lg: "px-8 py-4 text-lg"
    };

    const glowClasses = glow ? {
      "cyan-purple": "shadow-lg shadow-neon-cyan/50 hover:shadow-electric-purple/50",
      "green-cyan": "shadow-lg shadow-cyber-green/50 hover:shadow-neon-cyan/50",
      "pink-purple": "shadow-lg shadow-neon-pink/50 hover:shadow-electric-purple/50",
      "amber-cyan": "shadow-lg shadow-cyber-amber/50 hover:shadow-neon-cyan/50",
      "full-spectrum": "shadow-lg shadow-neon-cyan/30"
    } : {};

    return (
      <Button
        ref={ref}
        className={cn(
          "relative overflow-hidden border-0 text-white font-semibold transition-all duration-300 transform hover:scale-105",
          gradientClasses[variant],
          sizeClasses[size],
          glow && glowClasses[variant],
          pulse && "animate-pulse",
          className
        )}
        {...props}
      >
        {/* Background animation */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-700"></div>
        
        {/* Content */}
        <span className="relative z-10">{children}</span>
        
        {/* Additional glow effect */}
        {glow && (
          <div className="absolute inset-0 rounded-lg opacity-0 hover:opacity-20 transition-opacity duration-300 bg-gradient-to-r from-white to-white blur-xl"></div>
        )}
      </Button>
    );
  }
);

GradientButton.displayName = "GradientButton";

export default GradientButton;
