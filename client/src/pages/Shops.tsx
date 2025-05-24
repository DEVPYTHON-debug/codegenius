import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Plus, Star, MessageCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Shop } from "@shared/schema";
import FloatingNav from "@/components/FloatingNav";

export default function Shops() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newShop, setNewShop] = useState({
    title: '',
    description: '',
    category: 'hair'
  });

  const categories = [
    { value: 'all', label: 'All' },
    { value: 'hair', label: 'Hair & Beauty' },
    { value: 'food', label: 'Food & Drinks' },
    { value: 'delivery', label: 'Delivery' },
    { value: 'tech', label: 'Tech Support' },
    { value: 'tutoring', label: 'Tutoring' },
    { value: 'laundry', label: 'Laundry' }
  ];

  const { data: shops = [], isLoading } = useQuery({
    queryKey: ['/api/shops', selectedCategory],
    queryFn: async () => {
      const params = selectedCategory !== 'all' ? `?category=${selectedCategory}` : '';
      const response = await fetch(`/api/shops${params}`);
      if (!response.ok) throw new Error('Failed to fetch shops');
      return response.json();
    }
  });

  const handleAddShop = async () => {
    try {
      await apiRequest('POST', '/api/shops', newShop);
      setIsAddModalOpen(false);
      setNewShop({ title: '', description: '', category: 'hair' });
      queryClient.invalidateQueries({ queryKey: ['/api/shops'] });
      toast({
        title: "Success",
        description: "Shop created successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create shop",
        variant: "destructive",
      });
    }
  };

  const getCategoryImage = (category: string) => {
    const images = {
      hair: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&h=200&fit=crop",
      food: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&h=200&fit=crop",
      tech: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=400&h=200&fit=crop",
      delivery: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=200&fit=crop",
      tutoring: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=200&fit=crop",
      laundry: "https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=400&h=200&fit=crop"
    };
    return images[category as keyof typeof images] || images.hair;
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      hair: 'cyber-green',
      food: 'neon-pink',
      tech: 'electric-purple',
      delivery: 'cyber-amber',
      tutoring: 'cyber-green',
      laundry: 'neon-cyan'
    };
    return colors[category as keyof typeof colors] || 'cyber-green';
  };

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
            <h1 className="text-xl font-bold text-white">Shops</h1>
          </div>
          {(user?.role === 'provider' || user?.role === 'admin' || user?.role === 'super_admin') && (
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
              <DialogTrigger asChild>
                <Button className="px-4 py-2 bg-gradient-to-r from-cyber-green to-neon-cyan text-white rounded-lg font-medium">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Shop
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-deep-navy border-gray-700 text-white">
                <DialogHeader>
                  <DialogTitle>Create New Shop</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Shop Name</Label>
                    <Input
                      id="title"
                      value={newShop.title}
                      onChange={(e) => setNewShop({...newShop, title: e.target.value})}
                      className="bg-midnight-blue border-gray-600 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select value={newShop.category} onValueChange={(value) => setNewShop({...newShop, category: value})}>
                      <SelectTrigger className="bg-midnight-blue border-gray-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-midnight-blue border-gray-600 text-white">
                        {categories.slice(1).map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newShop.description}
                      onChange={(e) => setNewShop({...newShop, description: e.target.value})}
                      className="bg-midnight-blue border-gray-600 text-white"
                    />
                  </div>
                  <Button onClick={handleAddShop} className="w-full bg-gradient-to-r from-cyber-green to-neon-cyan">
                    Create Shop
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </header>

      {/* Category Filter */}
      <div className="p-4 bg-midnight-blue border-b border-gray-700">
        <div className="flex space-x-2 overflow-x-auto custom-scrollbar">
          {categories.map((category) => (
            <Button
              key={category.value}
              onClick={() => setSelectedCategory(category.value)}
              variant={selectedCategory === category.value ? "default" : "outline"}
              className={`px-4 py-2 rounded-full font-medium whitespace-nowrap transition-colors ${
                selectedCategory === category.value
                  ? 'bg-neon-cyan text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {category.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Shops Grid */}
      <main className="p-4 pb-24">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="gradient-border">
                <div className="gradient-border-inner p-0 overflow-hidden animate-pulse">
                  <div className="w-full h-48 bg-gray-700"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-700 rounded w-full"></div>
                    <div className="h-3 bg-gray-700 rounded w-2/3"></div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : shops.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl text-gray-400 mb-4">
              <i className="fas fa-store"></i>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No shops found</h3>
            <p className="text-gray-400">
              {selectedCategory !== 'all' 
                ? `No shops available in ${categories.find(c => c.value === selectedCategory)?.label} category`
                : 'Be the first to create a shop!'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {shops.map((shop: Shop) => (
              <Card key={shop.id} className="gradient-border cursor-pointer transform hover:scale-105 transition-all duration-300">
                <div className="gradient-border-inner p-0 overflow-hidden">
                  <img 
                    src={getCategoryImage(shop.category)} 
                    alt={shop.title}
                    className="w-full h-48 object-cover"
                  />
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-white">{shop.title}</h3>
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-cyber-amber fill-current" />
                        <span className="text-white text-sm">{shop.rating || '0.0'}</span>
                      </div>
                    </div>
                    <p className="text-gray-400 text-sm mb-3 line-clamp-2">{shop.description}</p>
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-1 bg-${getCategoryColor(shop.category)}/20 text-${getCategoryColor(shop.category)} text-xs rounded-full`}>
                        {categories.find(c => c.value === shop.category)?.label}
                      </span>
                      <Button 
                        size="sm"
                        variant="outline"
                        className="px-3 py-1 bg-neon-cyan/20 text-neon-cyan border-neon-cyan/30 hover:bg-neon-cyan hover:text-white transition-colors"
                        onClick={() => setLocation('/chat')}
                      >
                        <MessageCircle className="h-3 w-3 mr-1" />
                        Chat
                      </Button>
                    </div>
                  </CardContent>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>

      <FloatingNav />
    </div>
  );
}
