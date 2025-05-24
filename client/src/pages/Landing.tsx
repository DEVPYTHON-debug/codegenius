import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

export default function Landing() {
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'student'
  });
  const { toast } = useToast();

  const handleLogin = () => {
    // For super admin, check static credentials
    if (formData.email === 'Jacobsilas007@gmail.com' && formData.password === 'JesusLovesMe777' && formData.role === 'super_admin') {
      toast({
        title: "Super Admin Access",
        description: "Redirecting to admin dashboard...",
      });
      setTimeout(() => {
        window.location.href = '/api/login';
      }, 1000);
      return;
    }

    // Regular login flow
    window.location.href = '/api/login';
  };

  const handleGoogleLogin = () => {
    window.location.href = '/api/login';
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-dark-purple">
      <div className="w-full max-w-md">
        <div className="gradient-border">
          <div className="gradient-border-inner p-8">
            {/* Logo Header */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-neon-cyan neon-glow">
                Si<span className="text-neon-pink">-link</span>
              </h2>
              <p className="text-gray-400 mt-2">Welcome to the future</p>
            </div>
            
            {/* Login Form */}
            <div className="space-y-6">
              <div>
                <Label className="block text-sm font-medium text-gray-300 mb-2">Email</Label>
                <Input 
                  type="email" 
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-3 bg-midnight-blue border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan transition-colors"
                />
              </div>
              
              <div>
                <Label className="block text-sm font-medium text-gray-300 mb-2">Password</Label>
                <Input 
                  type="password" 
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full px-4 py-3 bg-midnight-blue border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan transition-colors"
                />
              </div>
              
              {/* Role Selection */}
              <div>
                <Label className="block text-sm font-medium text-gray-300 mb-2">Login as</Label>
                <Select value={formData.role} onValueChange={(value) => setFormData({...formData, role: value})}>
                  <SelectTrigger className="w-full px-4 py-3 bg-midnight-blue border border-gray-600 rounded-lg text-white focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan transition-colors">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-midnight-blue border-gray-600 text-white">
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="provider">Service Provider</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="super_admin">Super Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Login Button */}
              <Button 
                onClick={handleLogin}
                className="w-full py-3 bg-gradient-to-r from-neon-cyan to-electric-purple hover:from-electric-purple hover:to-neon-pink text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-neon-cyan/50"
              >
                <i className="fas fa-sign-in-alt mr-2"></i>Sign In
              </Button>
              
              {/* Social Login */}
              <div className="space-y-3">
                <Button 
                  onClick={handleGoogleLogin}
                  variant="outline"
                  className="w-full py-3 bg-white text-gray-900 font-semibold rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center"
                >
                  <i className="fab fa-google mr-2 text-red-500"></i>Continue with Google
                </Button>
              </div>
              
              {/* Register Link */}
              <p className="text-center text-gray-400">
                Don't have an account? 
                <button 
                  onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                  className="text-neon-cyan hover:text-neon-pink transition-colors ml-1"
                >
                  Sign up
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
