import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import FloatingNav from "@/components/FloatingNav";
import NeonCard from "@/components/ui/neon-card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, Users, Store, Briefcase, DollarSign, ChartLine, Clock } from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const { data: analytics } = useQuery({
    queryKey: ['/api/analytics'],
    enabled: user?.role === 'admin' || user?.role === 'super_admin',
  });

  const stats = [
    {
      icon: Users,
      value: analytics?.totalUsers || "0",
      label: "Active Users",
      color: "text-neon-cyan",
      growth: "+12%"
    },
    {
      icon: Store,
      value: analytics?.totalShops || "0",
      label: "Active Shops",
      color: "text-cyber-green",
      growth: "+8%"
    },
    {
      icon: Briefcase,
      value: "89",
      label: "Open Jobs",
      color: "text-cyber-amber",
      growth: "+15%"
    },
    {
      icon: DollarSign,
      value: `₦${analytics?.totalRevenue?.toLocaleString() || "0"}`,
      label: "Total Revenue",
      color: "text-neon-pink",
      growth: "+25%"
    }
  ];

  const menuItems = [
    {
      title: "Shops",
      description: "Browse student services and local businesses",
      icon: Store,
      color: "text-cyber-green",
      tags: ["Hair", "Food", "+More"],
      path: "/shops"
    },
    {
      title: "Jobs",
      description: "Find opportunities and post job listings",
      icon: Briefcase,
      color: "text-cyber-amber",
      tags: ["Tech Help", "Delivery", "+More"],
      path: "/jobs"
    },
    {
      title: "Messages",
      description: "Chat with service providers and students",
      icon: "fas fa-comments",
      color: "text-neon-cyan",
      badge: "3 unread",
      path: "/chat"
    },
    {
      title: "Payments",
      description: "Manage transactions and virtual accounts",
      icon: "fas fa-credit-card",
      color: "text-neon-pink",
      badge: "KYC Verified",
      path: "/payments"
    },
    {
      title: "Ratings",
      description: "Rate and review services",
      icon: "fas fa-star",
      color: "text-electric-purple",
      stars: 5,
      path: "/ratings"
    }
  ];

  // Add analytics for admins
  if (user?.role === 'admin' || user?.role === 'super_admin') {
    menuItems.push({
      title: "Analytics",
      description: "View performance metrics and insights",
      icon: ChartLine,
      color: "text-cyber-green",
      badge: "Admin Only",
      path: "/admin"
    });
  }

  const recentActivities = [
    {
      icon: "fas fa-shopping-bag",
      color: "bg-cyber-green",
      description: "New order from Sarah's Hair Studio",
      timestamp: "2 minutes ago"
    },
    {
      icon: "fas fa-message",
      color: "bg-neon-cyan",
      description: "New message from Tech Support",
      timestamp: "5 minutes ago"
    },
    {
      icon: "fas fa-star",
      color: "bg-cyber-amber",
      description: "You received a 5-star rating",
      timestamp: "1 hour ago"
    }
  ];

  return (
    <div className="min-h-screen bg-dark-purple">
      {/* Header */}
      <header className="bg-deep-navy border-b border-gray-700 px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold text-neon-cyan neon-glow">
              Si<span className="text-neon-pink">-link</span>
            </h1>
            <span className="text-xs px-2 py-1 bg-electric-purple rounded-full text-white">
              {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
            </span>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative p-2 text-gray-400 hover:text-white">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-cyber-red rounded-full"></span>
            </Button>
            
            {/* Profile */}
            <div className="flex items-center space-x-2">
              <Avatar className="w-8 h-8 border-2 border-neon-cyan">
                <AvatarImage src={user?.profileImageUrl || ""} />
                <AvatarFallback className="bg-neon-cyan text-white">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium text-white hidden md:block">
                {user?.firstName} {user?.lastName}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 pb-24">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">
            Welcome back, <span className="text-neon-cyan">{user?.firstName}</span>!
          </h2>
          <p className="text-gray-400">What would you like to do today?</p>
        </div>

        {/* Quick Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <NeonCard key={index} className="p-4 text-center">
              <div className={`text-2xl ${stat.color} mb-2`}>
                <stat.icon className="h-6 w-6 mx-auto" />
              </div>
              <div className="text-lg font-bold text-white">{stat.value}</div>
              <div className="text-xs text-gray-400">{stat.label}</div>
              <div className="text-xs text-cyber-green mt-1">↑ {stat.growth} this month</div>
            </NeonCard>
          ))}
        </div>

        {/* Main Menu Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {menuItems.map((item, index) => (
            <NeonCard 
              key={index}
              className="p-6 text-center cursor-pointer transform hover:scale-105 transition-all duration-300"
              onClick={() => setLocation(item.path)}
            >
              <div className={`text-4xl ${item.color} mb-4 animate-float`} style={{animationDelay: `${index * 0.5}s`}}>
                {typeof item.icon === 'string' ? (
                  <i className={item.icon}></i>
                ) : (
                  <item.icon className="h-10 w-10 mx-auto" />
                )}
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
              <p className="text-gray-400 text-sm mb-4">{item.description}</p>
              
              {item.tags && (
                <div className="flex justify-center space-x-2">
                  {item.tags.map((tag, tagIndex) => (
                    <span key={tagIndex} className={`px-2 py-1 bg-${item.color.split('-')[1]}/20 ${item.color} text-xs rounded-full`}>
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              
              {item.badge && (
                <div className="mt-4">
                  <span className={`px-3 py-1 bg-${item.color.split('-')[1]}/20 ${item.color} text-xs rounded-full`}>
                    {item.badge}
                  </span>
                </div>
              )}
              
              {item.stars && (
                <div className="mt-4 flex justify-center">
                  <div className="flex text-cyber-amber">
                    {[...Array(item.stars)].map((_, i) => (
                      <i key={i} className="fas fa-star"></i>
                    ))}
                  </div>
                </div>
              )}
            </NeonCard>
          ))}
        </div>

        {/* Recent Activity */}
        <NeonCard className="p-6 mb-8">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Clock className="h-5 w-5 text-neon-cyan mr-2" />
            Recent Activity
          </h3>
          <div className="space-y-3">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-midnight-blue rounded-lg">
                <div className={`w-8 h-8 ${activity.color} rounded-full flex items-center justify-center`}>
                  <i className={`${activity.icon} text-white text-xs`}></i>
                </div>
                <div className="flex-1">
                  <p className="text-white text-sm">{activity.description}</p>
                  <p className="text-gray-400 text-xs">{activity.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        </NeonCard>
      </main>

      <FloatingNav />
    </div>
  );
}
