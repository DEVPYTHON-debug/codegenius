import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Settings, Users, Shield, FileText, Cog, UserCheck, UserX, Edit, TrendingUp, TrendingDown } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@shared/schema";
import FloatingNav from "@/components/FloatingNav";
import NeonCard from "@/components/ui/neon-card";

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedTimeframe, setSelectedTimeframe] = useState('30d');

  // Check if user has admin access
  if (!user || !['admin', 'super_admin'].includes(user.role!)) {
    return (
      <div className="min-h-screen bg-dark-purple flex items-center justify-center">
        <NeonCard className="p-8 text-center">
          <Shield className="h-12 w-12 text-cyber-red mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-gray-400 mb-4">You don't have permission to access this page</p>
          <Button onClick={() => setLocation('/')} className="bg-gradient-to-r from-neon-cyan to-electric-purple">
            Go Home
          </Button>
        </NeonCard>
      </div>
    );
  }

  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['/api/analytics', selectedTimeframe],
  });

  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ['/api/users', 'student'],
  });

  const { data: providers = [] } = useQuery({
    queryKey: ['/api/users', 'provider'],
  });

  const updateUserStatusMutation = useMutation({
    mutationFn: async ({ userId, isActive }: { userId: string; isActive: boolean }) => {
      return apiRequest('PATCH', `/api/users/${userId}/status`, { isActive });
    },
    onSuccess: () => {
      toast({
        title: "User status updated",
        description: "User status has been successfully updated",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update user status",
        variant: "destructive",
      });
    }
  });

  const handleUserStatusChange = (userId: string, isActive: boolean) => {
    updateUserStatusMutation.mutate({ userId, isActive });
  };

  const keyMetrics = [
    {
      title: "Total Users",
      value: analytics?.totalUsers || users.length + providers.length,
      change: "+12%",
      trend: "up",
      icon: Users,
      color: "text-neon-cyan"
    },
    {
      title: "Active Shops",
      value: analytics?.totalShops || "0",
      change: "+8%",
      trend: "up",
      icon: "fas fa-store",
      color: "text-cyber-green"
    },
    {
      title: "Revenue",
      value: analytics?.totalRevenue ? `₦${analytics.totalRevenue.toLocaleString()}` : "₦0",
      change: "+25%",
      trend: "up",
      icon: "fas fa-dollar-sign",
      color: "text-cyber-amber"
    },
    {
      title: "Uptime",
      value: "98.5%",
      change: "+0.2%",
      trend: "up",
      icon: "fas fa-chart-line",
      color: "text-neon-pink"
    }
  ];

  const quickActions = [
    {
      title: "Manage Users",
      description: "View and manage user accounts",
      icon: Users,
      color: "text-neon-cyan",
      action: () => setSelectedTab('users')
    },
    {
      title: "Moderate Content",
      description: "Review shops and job listings",
      icon: Shield,
      color: "text-cyber-amber",
      action: () => setSelectedTab('moderation')
    },
    {
      title: "View Reports",
      description: "Generate and view system reports",
      icon: FileText,
      color: "text-neon-pink",
      action: () => setSelectedTab('reports')
    },
    {
      title: "System Settings",
      description: "Configure platform settings",
      icon: Cog,
      color: "text-electric-purple",
      action: () => setSelectedTab('settings')
    }
  ];

  const [selectedTab, setSelectedTab] = useState<'overview' | 'users' | 'moderation' | 'reports' | 'settings'>('overview');

  const recentAdminActions = [
    {
      icon: UserCheck,
      color: "bg-cyber-green",
      description: "Approved new service provider: TechFix Solutions",
      timestamp: "5 minutes ago",
      user: "Admin John"
    },
    {
      icon: UserX,
      color: "bg-cyber-red",
      description: "Suspended user for policy violation",
      timestamp: "1 hour ago",
      user: "Super Admin"
    },
    {
      icon: Edit,
      color: "bg-cyber-amber",
      description: "Updated platform terms and conditions",
      timestamp: "3 hours ago",
      user: "Super Admin"
    }
  ];

  const pendingApprovals = [
    {
      type: "shop",
      title: "New Shop Registration",
      description: "Campus Food Hub - Food & Drinks category",
      status: "pending"
    },
    {
      type: "kyc",
      title: "KYC Verification",
      description: "Student ID: 12345 - Document verification pending",
      status: "review"
    }
  ];

  return (
    <div className="min-h-screen bg-dark-purple">
      {/* Header */}
      <header className="bg-deep-navy border-b border-gray-700 px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setLocation('/')}
              className="text-gray-400 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-xl font-bold text-white">Admin Dashboard</h1>
            <Badge variant="destructive" className="bg-cyber-red text-white">
              {user.role === 'super_admin' ? 'Super Admin' : 'Admin'}
            </Badge>
          </div>
          <div className="flex items-center space-x-4">
            <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
              <SelectTrigger className="w-24 bg-midnight-blue border-gray-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-midnight-blue border-gray-600 text-white">
                <SelectItem value="7d">7d</SelectItem>
                <SelectItem value="30d">30d</SelectItem>
                <SelectItem value="90d">90d</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-midnight-blue border-b border-gray-700 px-4 py-2">
        <div className="flex space-x-1 overflow-x-auto custom-scrollbar">
          {[
            { key: 'overview', label: 'Overview' },
            { key: 'users', label: 'Users' },
            { key: 'moderation', label: 'Moderation' },
            { key: 'reports', label: 'Reports' },
            { key: 'settings', label: 'Settings' }
          ].map((tab) => (
            <Button
              key={tab.key}
              onClick={() => setSelectedTab(tab.key as any)}
              variant={selectedTab === tab.key ? "default" : "ghost"}
              size="sm"
              className={`px-4 py-2 rounded-full font-medium whitespace-nowrap transition-colors ${
                selectedTab === tab.key
                  ? 'bg-neon-cyan text-white'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700'
              }`}
            >
              {tab.label}
            </Button>
          ))}
        </div>
      </div>

      <main className="p-4 pb-24">
        {selectedTab === 'overview' && (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {keyMetrics.map((metric, index) => (
                <NeonCard key={index} className="p-4 text-center">
                  <div className={`text-2xl ${metric.color} mb-2`}>
                    {typeof metric.icon === 'string' ? (
                      <i className={metric.icon}></i>
                    ) : (
                      <metric.icon className="h-6 w-6 mx-auto" />
                    )}
                  </div>
                  <div className="text-lg font-bold text-white">{metric.value}</div>
                  <div className="text-xs text-gray-400">{metric.title}</div>
                  <div className={`text-xs mt-1 flex items-center justify-center ${
                    metric.trend === 'up' ? 'text-cyber-green' : 'text-cyber-red'
                  }`}>
                    {metric.trend === 'up' ? (
                      <TrendingUp className="h-3 w-3 mr-1" />
                    ) : (
                      <TrendingDown className="h-3 w-3 mr-1" />
                    )}
                    {metric.change} this month
                  </div>
                </NeonCard>
              ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Revenue Chart */}
              <NeonCard>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-white">Revenue Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-midnight-blue rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <i className="fas fa-chart-line text-4xl text-neon-cyan mb-4"></i>
                      <p className="text-gray-400">Revenue chart will be rendered here</p>
                      <p className="text-xs text-gray-500 mt-2">Using Chart.js or similar library</p>
                    </div>
                  </div>
                </CardContent>
              </NeonCard>

              {/* User Growth Chart */}
              <NeonCard>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-white">User Growth</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-midnight-blue rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <i className="fas fa-chart-bar text-4xl text-cyber-green mb-4"></i>
                      <p className="text-gray-400">User growth chart will be rendered here</p>
                      <p className="text-xs text-gray-500 mt-2">Using Chart.js or similar library</p>
                    </div>
                  </div>
                </CardContent>
              </NeonCard>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {quickActions.map((action, index) => (
                <NeonCard 
                  key={index}
                  className="p-4 text-center cursor-pointer transform hover:scale-105 transition-all duration-300"
                  onClick={action.action}
                >
                  <div className={`text-2xl ${action.color} mb-2`}>
                    <action.icon className="h-8 w-8 mx-auto" />
                  </div>
                  <h4 className="text-white font-medium mb-1">{action.title}</h4>
                  <p className="text-gray-400 text-xs">{action.description}</p>
                </NeonCard>
              ))}
            </div>

            {/* Recent Activity & Pending Approvals */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Admin Actions */}
              <NeonCard>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-white">Recent Admin Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentAdminActions.map((action, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 bg-midnight-blue rounded-lg">
                        <div className={`w-8 h-8 ${action.color} rounded-full flex items-center justify-center`}>
                          <action.icon className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="text-white text-sm">{action.description}</p>
                          <p className="text-gray-400 text-xs">{action.timestamp} by {action.user}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </NeonCard>

              {/* Pending Approvals */}
              <NeonCard>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-white">Pending Approvals</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {pendingApprovals.map((approval, index) => (
                      <div key={index} className="p-3 bg-midnight-blue rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-white text-sm font-medium">{approval.title}</p>
                          <Badge variant="outline" className={`text-xs ${
                            approval.status === 'pending' ? 'border-cyber-amber text-cyber-amber' :
                            'border-neon-cyan text-neon-cyan'
                          }`}>
                            {approval.status}
                          </Badge>
                        </div>
                        <p className="text-gray-400 text-xs mb-3">{approval.description}</p>
                        <div className="flex space-x-2">
                          <Button size="sm" className="px-3 py-1 bg-cyber-green text-white text-xs rounded-full hover:bg-green-600 transition-colors">
                            Approve
                          </Button>
                          <Button size="sm" variant="outline" className="px-3 py-1 border-cyber-red text-cyber-red text-xs rounded-full hover:bg-cyber-red hover:text-white transition-colors">
                            {approval.status === 'review' ? 'Request Info' : 'Reject'}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </NeonCard>
            </div>
          </>
        )}

        {selectedTab === 'users' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">User Management</h2>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" className="border-gray-600 text-gray-300">
                  Export Users
                </Button>
                <Button size="sm" className="bg-gradient-to-r from-neon-cyan to-electric-purple">
                  Add Admin
                </Button>
              </div>
            </div>

            {/* Users Table */}
            <NeonCard>
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-white">All Users</CardTitle>
              </CardHeader>
              <CardContent>
                {usersLoading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-midnight-blue rounded-lg animate-pulse">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gray-700 rounded-full"></div>
                          <div className="space-y-2">
                            <div className="h-4 bg-gray-700 rounded w-32"></div>
                            <div className="h-3 bg-gray-700 rounded w-24"></div>
                          </div>
                        </div>
                        <div className="h-6 bg-gray-700 rounded w-20"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {[...users, ...providers].map((userItem: User) => (
                      <div key={userItem.id} className="flex items-center justify-between p-3 bg-midnight-blue rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-neon-cyan rounded-full flex items-center justify-center">
                            <span className="text-white font-semibold">
                              {userItem.firstName?.[0]}{userItem.lastName?.[0]}
                            </span>
                          </div>
                          <div>
                            <p className="text-white font-medium">
                              {userItem.firstName} {userItem.lastName}
                            </p>
                            <p className="text-gray-400 text-sm">{userItem.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Badge variant="outline" className={`text-xs ${
                            userItem.role === 'admin' || userItem.role === 'super_admin' ? 'border-cyber-red text-cyber-red' :
                            userItem.role === 'provider' ? 'border-cyber-amber text-cyber-amber' :
                            'border-cyber-green text-cyber-green'
                          }`}>
                            {userItem.role?.replace('_', ' ')}
                          </Badge>
                          <Button
                            size="sm"
                            variant={userItem.isActive ? "destructive" : "default"}
                            onClick={() => handleUserStatusChange(userItem.id, !userItem.isActive)}
                            disabled={updateUserStatusMutation.isPending}
                            className="text-xs px-3 py-1"
                          >
                            {userItem.isActive ? 'Suspend' : 'Activate'}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </NeonCard>
          </div>
        )}

        {selectedTab === 'moderation' && (
          <div className="text-center py-12">
            <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Content Moderation</h3>
            <p className="text-gray-400">Content moderation tools will be available here</p>
          </div>
        )}

        {selectedTab === 'reports' && (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Reports & Analytics</h3>
            <p className="text-gray-400">Detailed reports and analytics will be available here</p>
          </div>
        )}

        {selectedTab === 'settings' && (
          <div className="text-center py-12">
            <Cog className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">System Settings</h3>
            <p className="text-gray-400">Platform configuration options will be available here</p>
          </div>
        )}
      </main>

      <FloatingNav />
    </div>
  );
}
