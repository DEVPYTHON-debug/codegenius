import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLocation } from "wouter";

export default function Register() {
  const [formData, setFormData] = useState({ email: "", password: "", role: "student" });
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const handleRegister = async () => {
    // 1. Register with Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
    });
    if (error) {
      toast({
        title: "Registration Error",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    // 2. Insert user role into users table (after registration)
    const userId = data.user?.id;
    if (userId) {
      const { error: dbError } = await supabase.from("users").insert([
        { id: userId, email: formData.email, role: formData.role },
      ]);
      if (dbError) {
        toast({
          title: "Database Error",
          description: dbError.message,
          variant: "destructive",
        });
        return;
      }
    }

    toast({
      title: "Registration Successful",
      description: "Check your email to confirm your account.",
    });
    setLocation("/"); // Redirect to login
  };

  const handleFacebookLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({ provider: "facebook" });
    if (error) {
      toast({
        title: "Facebook Login Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-dark-purple">
      <div className="w-full max-w-md">
        <div className="gradient-border">
          <div className="gradient-border-inner p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-neon-cyan neon-glow">
                Register
              </h2>
            </div>
            <div className="space-y-6">
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Password</Label>
                <Input
                  type="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Role</Label>
                <div className="relative">
                  <select
                    className="w-full p-2 rounded bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-neon-cyan"
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value })
                    }
                  >
                    <option value="student">Student</option>
                    <option value="service_provider">Service Provider</option>
                    <option value="admin">Admin</option>
                  </select>
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                    ▼
                  </span>
                </div>
              </div>
              <Button onClick={handleRegister} className="w-full">
                Register
              </Button>
              <Button
                onClick={handleFacebookLogin}
                variant="outline"
                className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center mt-2"
              >
                <i className="fab fa-facebook mr-2"></i>Continue with Facebook
              </Button>
              <p className="text-center text-gray-400">
                Already have an account?{" "}
                <button
                  onClick={() => setLocation("/")}
                  className="text-neon-cyan hover:text-neon-pink transition-colors ml-1"
                >
                  Login
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}