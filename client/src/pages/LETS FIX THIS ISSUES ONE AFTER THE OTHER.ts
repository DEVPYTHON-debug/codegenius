LETS FIX THIS ISSUES ONE AFTER THE OTHER i will provide the way i am collecting data into my tables in the supabase data base so we could fix issues with user name not displaying and some 
other stuff
1.
$ node dist/index.js
9:14:52 AM [express] serving on port 5000
9:16:08 AM [express] GET /api/auth/user 200 in 1211ms :: {"id":"a2200984-b657-4687-a6f4-a03527db7c65…
9:16:13 AM [express] GET /api/chats 200 in 9ms
9:16:33 AM [express] GET /api/chats 304 in 8ms
9:16:34 AM [express] GET /api/payments 500 in 949ms :: {"message":"column payments.receiverId does n…
9:16:34 AM [express] GET /api/virtual-account 500 in 1183ms :: {"message":"Could not find the 'accou…
9:16:45 AM [express] GET /api/auth/user 304 in 842ms :: {"id":"a2200984-b657-4687-a6f4-a03527db7c65"…
9:16:46 AM [express] GET /api/chats 304 in 2ms
9:16:53 AM [express] GET /api/chats 304 in 2ms
9:16:54 AM [express] GET /api/chats 304 in 4ms
9:16:55 AM [express] GET /api/payments 500 in 860ms :: {"message":"column payments.receiverId does n…
9:16:55 AM [express] GET /api/virtual-account 500 in 1313ms :: {"message":"Could not find the 'accou…
9:17:13 AM [express] GET /api/chats 304 in 3ms
9:17:13 AM [express] GET /api/jobs 200 in 570ms :: []
9:17:15 AM [express] GET /api/jobs 200 in 251ms :: []
9:17:16 AM [express] GET /api/jobs 200 in 286ms :: []
9:17:17 AM [express] GET /api/jobs 200 in 240ms :: []
9:17:17 AM [express] GET /api/jobs 200 in 293ms :: []
9:17:18 AM [express] GET /api/jobs 200 in 248ms :: []
9:17:18 AM [express] GET /api/jobs 200 in 250ms :: []
9:17:43 AM [express] GET /api/chats 304 in 3ms
9:18:03 AM [express] GET /api/jobs 304 in 698ms :: []
9:18:16 AM [express] GET /api/chats 304 in 4ms
9:18:17 AM [express] GET /api/jobs 304 in 566ms :: []
9:18:19 AM [express] GET /api/jobs 304 in 234ms :: []
9:18:22 AM [express] GET /api/jobs 304 in 215ms :: []
2.THIS ARE MY TABLES IN THE DATABASE
USER TABLE
are all in schema.ts 
when the profile is clicked it should display the user name and other details as well as the user image and other details as shown in the user table
Profile.tsx
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { User, Edit3, Save, X, Star, MapPin, Mail, Phone, Calendar } from "lucide-react";

export default function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
  });

  // Fetch user's shops and jobs
  const { data: userShops = [] } = useQuery({
    queryKey: ["/api/shops", "user", user?.id],
    enabled: !!user?.id,
  });

  const { data: userJobs = [] } = useQuery({
    queryKey: ["/api/jobs", "user", user?.id],
    enabled: !!user?.id,
  });

  const { data: userRatings = [] } = useQuery({
    queryKey: ["/api/ratings", user?.id],
    enabled: !!user?.id,
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: typeof editForm) => {
      return await apiRequest(`/api/users/${user?.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setIsEditing(false);
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    updateProfileMutation.mutate(editForm);
  };

  const handleCancel = () => {
    setEditForm({
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
    });
    setIsEditing(false);
  };

  const averageRating = userRatings.length > 0 
    ? userRatings.reduce((sum: number, rating: any) => sum + rating.rating, 0) / userRatings.length 
    : 0;

  const getRoleColor = (role: string) => {
    switch (role) {
      case "super_admin": return "bg-gradient-to-r from-purple-500 to-pink-500";
      case "admin": return "bg-gradient-to-r from-blue-500 to-cyan-500";
      case "provider": return "bg-gradient-to-r from-green-500 to-emerald-500";
      case "student": return "bg-gradient-to-r from-orange-500 to-yellow-500";
      default: return "bg-gradient-to-r from-gray-500 to-slate-500";
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Profile Header */}
        <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20 ring-2 ring-cyan-500/50">
                  <AvatarImage src={user.profileImageUrl || ""} />
                  <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-purple-500 text-white text-xl">
                    {user.firstName?.[0]}{user.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                      {user.firstName} {user.lastName}
                    </h1>
                    <Badge className={`${getRoleColor(user.role)} text-white border-0`}>
                      {user.role?.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-4 text-gray-400">
                    <div className="flex items-center space-x-1">
                      <Mail className="h-4 w-4" />
                      <span className="text-sm">{user.email}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span className="text-sm">
                        Joined {new Date(user.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  {averageRating > 0 && (
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm text-yellow-400">
                        {averageRating.toFixed(1)} ({userRatings.length} reviews)
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
                className="border-gray-600 hover:border-cyan-500 hover:text-cyan-500"
              >
                {isEditing ? <X className="h-4 w-4" /> : <Edit3 className="h-4 w-4" />}
                {isEditing ? "Cancel" : "Edit Profile"}
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Edit Profile Form */}
        {isEditing && (
          <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-cyan-400">Edit Profile</CardTitle>
              <CardDescription>Update your profile information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={editForm.firstName}
                    onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                    className="bg-gray-800 border-gray-700 focus:border-cyan-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={editForm.lastName}
                    onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                    className="bg-gray-800 border-gray-700 focus:border-cyan-500"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="bg-gray-800 border-gray-700 focus:border-cyan-500"
                />
              </div>
              <div className="flex space-x-3">
                <Button
                  onClick={handleSave}
                  disabled={updateProfileMutation.isPending}
                  className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
                <Button variant="outline" onClick={handleCancel} className="border-gray-600">
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Profile Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-gray-800/50">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="shops">My Shops</TabsTrigger>
            <TabsTrigger value="jobs">My Jobs</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border-cyan-500/20">
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-cyan-400">{userShops.length}</div>
                    <div className="text-sm text-gray-400">Active Shops</div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">{userJobs.length}</div>
                    <div className="text-sm text-gray-400">Posted Jobs</div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/20">
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-400">{userRatings.length}</div>
                    <div className="text-sm text-gray-400">Total Reviews</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="shops" className="space-y-4">
            {userShops.length === 0 ? (
              <Card className="bg-gray-900/50 border-gray-800">
                <CardContent className="p-8 text-center text-gray-400">
                  No shops yet. Start by creating your first shop!
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {userShops.map((shop: any) => (
                  <Card key={shop.id} className="bg-gray-900/50 border-gray-800 hover:border-cyan-500/50 transition-colors">
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-cyan-400">{shop.title}</h3>
                      <p className="text-sm text-gray-400 mt-1">{shop.description}</p>
                      <div className="flex items-center justify-between mt-3">
                        <Badge variant="outline" className="border-gray-600">
                          {shop.category}
                        </Badge>
                        <div className="flex items-center space-x-1 text-yellow-400">
                          <Star className="h-4 w-4 fill-current" />
                          <span className="text-sm">{shop.rating || "N/A"}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="jobs" className="space-y-4">
            {userJobs.length === 0 ? (
              <Card className="bg-gray-900/50 border-gray-800">
                <CardContent className="p-8 text-center text-gray-400">
                  No jobs posted yet. Create your first job posting!
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {userJobs.map((job: any) => (
                  <Card key={job.id} className="bg-gray-900/50 border-gray-800 hover:border-cyan-500/50 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-cyan-400">{job.title}</h3>
                          <p className="text-sm text-gray-400 mt-1">{job.description}</p>
                          <div className="flex items-center space-x-4 mt-3">
                            <Badge variant="outline" className="border-gray-600">
                              {job.category}
                            </Badge>
                            <Badge variant="outline" className={`border-gray-600 ${
                              job.status === 'completed' ? 'text-green-400' :
                              job.status === 'in_progress' ? 'text-yellow-400' :
                              job.status === 'cancelled' ? 'text-red-400' : 'text-blue-400'
                            }`}>
                              {job.status?.replace('_', ' ')}
                            </Badge>
                          </div>
                        </div>
                        {job.budget && (
                          <div className="text-right">
                            <div className="text-lg font-semibold text-green-400">
                              ₦{parseInt(job.budget).toLocaleString()}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="reviews" className="space-y-4">
            {userRatings.length === 0 ? (
              <Card className="bg-gray-900/50 border-gray-800">
                <CardContent className="p-8 text-center text-gray-400">
                  No reviews yet. Start providing services to receive reviews!
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {userRatings.map((review: any) => (
                  <Card key={review.id} className="bg-gray-900/50 border-gray-800">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-1 mb-2">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600'
                                }`}
                              />
                            ))}
                            <span className="text-sm text-gray-400 ml-2">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          {review.comment && (
                            <p className="text-gray-300">{review.comment}</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
also review the code to ensure that the user name and other details are displayed correctly when the profile is clicked. The user image should also be shown, and any issues with the user name not displaying should be addressed.
also review Payments.tsx and VirtualAccount.tsx to ensure they are correctly fetching and displaying the necessary data from the Supabase database, particularly focusing on the `receiverId` and account details.
add collection of first name, last name,profile image and roles correctly on the register form including  super admin role and send  to the user table in supabase  
3. User created are not displaying at all in the user table, ensure that when a user registers, their details are correctly inserted into the user table in Supabase. This includes first name, last name, email, profile image URL, and role.
ensure proper dashboard for each role admin student that created jobs and service providers that uploads or create shops