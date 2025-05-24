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
import { ArrowLeft, Plus, Calendar, DollarSign, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Job } from "@shared/schema";
import FloatingNav from "@/components/FloatingNav";

export default function Jobs() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newJob, setNewJob] = useState({
    title: '',
    description: '',
    category: 'tech',
    budget: '',
    deadline: ''
  });

  const categories = [
    { value: 'all', label: 'All' },
    { value: 'tech', label: 'Tech Help' },
    { value: 'delivery', label: 'Delivery' },
    { value: 'tutoring', label: 'Tutoring' },
    { value: 'writing', label: 'Writing' },
    { value: 'design', label: 'Design' },
    { value: 'other', label: 'Other' }
  ];

  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ['/api/jobs', selectedCategory],
    queryFn: async () => {
      const params = selectedCategory !== 'all' ? `?category=${selectedCategory}` : '';
      const response = await fetch(`/api/jobs${params}`);
      if (!response.ok) throw new Error('Failed to fetch jobs');
      return response.json();
    }
  });

  const handleAddJob = async () => {
    try {
      const jobData = {
        ...newJob,
        budget: newJob.budget ? parseFloat(newJob.budget) : null,
        deadline: newJob.deadline ? new Date(newJob.deadline) : null
      };
      await apiRequest('POST', '/api/jobs', jobData);
      setIsAddModalOpen(false);
      setNewJob({ title: '', description: '', category: 'tech', budget: '', deadline: '' });
      queryClient.invalidateQueries({ queryKey: ['/api/jobs'] });
      toast({
        title: "Success",
        description: "Job posted successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to post job",
        variant: "destructive",
      });
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      tech: 'electric-purple',
      delivery: 'cyber-amber',
      tutoring: 'cyber-green',
      writing: 'neon-pink',
      design: 'neon-cyan',
      other: 'gray-400'
    };
    return colors[category as keyof typeof colors] || 'gray-400';
  };

  const formatDeadline = (deadline: string | Date | null) => {
    if (!deadline) return 'No deadline';
    const date = new Date(deadline);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    });
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
            <h1 className="text-xl font-bold text-white">Jobs</h1>
          </div>
          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger asChild>
              <Button className="px-4 py-2 bg-gradient-to-r from-cyber-amber to-neon-cyan text-white rounded-lg font-medium">
                <Plus className="h-4 w-4 mr-2" />
                Post Job
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-deep-navy border-gray-700 text-white">
              <DialogHeader>
                <DialogTitle>Post New Job</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Job Title</Label>
                  <Input
                    id="title"
                    value={newJob.title}
                    onChange={(e) => setNewJob({...newJob, title: e.target.value})}
                    className="bg-midnight-blue border-gray-600 text-white"
                    placeholder="e.g., Need help with website design"
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={newJob.category} onValueChange={(value) => setNewJob({...newJob, category: value})}>
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
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="budget">Budget (₦)</Label>
                    <Input
                      id="budget"
                      type="number"
                      value={newJob.budget}
                      onChange={(e) => setNewJob({...newJob, budget: e.target.value})}
                      className="bg-midnight-blue border-gray-600 text-white"
                      placeholder="5000"
                    />
                  </div>
                  <div>
                    <Label htmlFor="deadline">Deadline</Label>
                    <Input
                      id="deadline"
                      type="date"
                      value={newJob.deadline}
                      onChange={(e) => setNewJob({...newJob, deadline: e.target.value})}
                      className="bg-midnight-blue border-gray-600 text-white"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newJob.description}
                    onChange={(e) => setNewJob({...newJob, description: e.target.value})}
                    className="bg-midnight-blue border-gray-600 text-white"
                    placeholder="Describe what you need help with..."
                  />
                </div>
                <Button onClick={handleAddJob} className="w-full bg-gradient-to-r from-cyber-amber to-neon-cyan">
                  Post Job
                </Button>
              </div>
            </DialogContent>
          </Dialog>
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
                  ? 'bg-cyber-amber text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {category.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Jobs List */}
      <main className="p-4 pb-24">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Card key={i} className="gradient-border">
                <div className="gradient-border-inner p-6 animate-pulse">
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-700 rounded w-full"></div>
                    <div className="h-3 bg-gray-700 rounded w-2/3"></div>
                    <div className="flex space-x-4">
                      <div className="h-3 bg-gray-700 rounded w-20"></div>
                      <div className="h-3 bg-gray-700 rounded w-24"></div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl text-gray-400 mb-4">
              <i className="fas fa-briefcase"></i>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No jobs found</h3>
            <p className="text-gray-400">
              {selectedCategory !== 'all' 
                ? `No jobs available in ${categories.find(c => c.value === selectedCategory)?.label} category`
                : 'Be the first to post a job!'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job: Job) => (
              <Card key={job.id} className="gradient-border cursor-pointer hover:scale-[1.02] transition-all duration-300">
                <div className="gradient-border-inner p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-2">{job.title}</h3>
                      <p className="text-gray-400 text-sm mb-3 line-clamp-2">{job.description}</p>
                    </div>
                    <span className={`px-3 py-1 bg-${getCategoryColor(job.category)}/20 text-${getCategoryColor(job.category)} text-xs rounded-full ml-4 whitespace-nowrap`}>
                      {categories.find(c => c.value === job.category)?.label}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-4">
                      {job.budget && (
                        <div className="flex items-center text-cyber-green">
                          <DollarSign className="h-4 w-4 mr-1" />
                          <span>₦{parseFloat(job.budget).toLocaleString()}</span>
                        </div>
                      )}
                      {job.deadline && (
                        <div className="flex items-center text-cyber-amber">
                          <Calendar className="h-4 w-4 mr-1" />
                          <span>{formatDeadline(job.deadline)}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center text-gray-400">
                        <User className="h-4 w-4 mr-1" />
                        <span className="text-xs">Posted by Student</span>
                      </div>
                      <Button 
                        size="sm"
                        className="px-4 py-1 bg-gradient-to-r from-neon-cyan to-electric-purple hover:from-electric-purple hover:to-neon-pink text-white transition-all duration-300"
                        onClick={() => setLocation('/chat')}
                      >
                        Apply
                      </Button>
                    </div>
                  </div>
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
