import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Home, Store, Briefcase, MessageCircle, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";

export default function FloatingNav() {
  const [location, setLocation] = useLocation();
  const { user } = useAuth();

  // Get unread messages count
  const { data: chats = [] } = useQuery({
    queryKey: ['/api/chats'],
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const unreadCount = chats.reduce((count: number, chat: any) => count + (chat.unreadCount || 0), 0);

  const navItems = [
    {
      icon: Home,
      label: "Home",
      path: "/",
      isActive: location === "/"
    },
    {
      icon: Store,
      label: "Shops",
      path: "/shops",
      isActive: location === "/shops"
    },
    {
      icon: Briefcase,
      label: "Jobs",
      path: "/jobs",
      isActive: location === "/jobs"
    },
    {
      icon: MessageCircle,
      label: "Chat",
      path: "/chat",
      isActive: location === "/chat",
      badge: unreadCount > 0 ? unreadCount : undefined
    },
    {
      icon: User,
      label: "Profile",
      path: "/profile",
      isActive: location === "/profile"
    }
  ];

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 md:bottom-6">
      <div className="glass-morphism rounded-full px-4 py-2 shadow-2xl border border-white/10">
        <div className="flex items-center space-x-2 md:space-x-4">
          {navItems.map((item, index) => (
            <Button
              key={index}
              onClick={() => setLocation(item.path)}
              variant="ghost"
              size="sm"
              className={`relative p-3 rounded-full transition-all duration-300 ${
                item.isActive
                  ? 'bg-neon-cyan text-white shadow-lg shadow-neon-cyan/30'
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <item.icon className="h-5 w-5" />
              
              {/* Badge for notifications */}
              {item.badge && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-cyber-red rounded-full text-white text-xs flex items-center justify-center font-bold animate-pulse">
                  {item.badge > 9 ? '9+' : item.badge}
                </span>
              )}
              
              {/* Glow effect for active item */}
              {item.isActive && (
                <div className="absolute inset-0 rounded-full bg-neon-cyan/20 animate-pulse"></div>
              )}
            </Button>
          ))}
        </div>
      </div>
      
      {/* Mobile-only labels */}
      <div className="md:hidden flex justify-center mt-2 space-x-4 px-4">
        {navItems.map((item, index) => (
          <span
            key={index}
            className={`text-xs transition-colors duration-300 ${
              item.isActive ? 'text-neon-cyan' : 'text-gray-500'
            }`}
          >
            {item.label}
          </span>
        ))}
      </div>
    </div>
  );
}
