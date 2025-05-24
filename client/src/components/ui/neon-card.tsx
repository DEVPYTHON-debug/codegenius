import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface NeonCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "gradient" | "glass";
  glowColor?: "cyan" | "pink" | "purple" | "green" | "amber";
}

const NeonCard = forwardRef<HTMLDivElement, NeonCardProps>(
  ({ className, variant = "default", glowColor = "cyan", children, ...props }, ref) => {
    const baseClasses = "relative overflow-hidden transition-all duration-300";
    
    const variantClasses = {
      default: "gradient-border",
      gradient: "bg-gradient-to-br from-deep-navy/50 to-midnight-blue/50 backdrop-blur-sm border border-white/10",
      glass: "glass-morphism"
    };

    const glowClasses = {
      cyan: "hover:shadow-lg hover:shadow-neon-cyan/20",
      pink: "hover:shadow-lg hover:shadow-neon-pink/20",
      purple: "hover:shadow-lg hover:shadow-electric-purple/20",
      green: "hover:shadow-lg hover:shadow-cyber-green/20",
      amber: "hover:shadow-lg hover:shadow-cyber-amber/20"
    };

    return (
      <div
        ref={ref}
        className={cn(
          baseClasses,
          variantClasses[variant],
          glowClasses[glowColor],
          className
        )}
        {...props}
      >
        {variant === "default" ? (
          <div className="gradient-border-inner h-full w-full">
            {children}
          </div>
        ) : (
          children
        )}
        
        {/* Subtle animated background */}
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div className="absolute top-0 -left-4 w-24 h-px bg-gradient-to-r from-transparent via-white to-transparent animate-pulse"></div>
          <div className="absolute bottom-0 -right-4 w-24 h-px bg-gradient-to-r from-transparent via-white to-transparent animate-pulse" style={{animationDelay: '1s'}}></div>
        </div>
      </div>
    );
  }
);

NeonCard.displayName = "NeonCard";

export default NeonCard;
