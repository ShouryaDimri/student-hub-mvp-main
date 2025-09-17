import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StudentSearch } from '@/components/StudentSearch';
import { ProfileEditor } from '@/components/ProfileEditor';
import { DocumentUpload } from '@/components/DocumentUpload';
import { DocumentApproval } from '@/components/DocumentApproval';
import { CollaborationRequests } from '@/components/CollaborationRequests';
import { AnalyticsDashboard } from '@/components/AnalyticsDashboard';
import { ResumeGenerator } from '@/components/ResumeGenerator';
import { LogOut, User, Upload, Search, CheckSquare, Users, TrendingUp, FileText, Trophy } from 'lucide-react';
import { SocialIcons } from '@/components/SocialIcons';
import { TestProfileFields } from '@/components/TestProfileFields';

interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  user_type: string;
  department?: string;
  year_of_study?: number;
  bio?: string;
}

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <header className="border-b bg-card/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Student Hub
            </h1>
            <p className="text-muted-foreground">
              Welcome back, {profile?.full_name || user.email}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <SocialIcons className="hidden md:flex" />
            <Button variant="outline" onClick={signOut} className="hover:bg-destructive hover:text-destructive-foreground transition-colors">
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
        <div className="container mx-auto px-4 pb-4 flex justify-end md:hidden">
          <SocialIcons iconSize={20} />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-6 lg:grid-cols-7 bg-card/50 backdrop-blur-sm">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              <span className="hidden sm:inline">Documents</span>
            </TabsTrigger>
            <TabsTrigger value="search" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              <span className="hidden sm:inline">Search</span>
            </TabsTrigger>
            <TabsTrigger value="collaboration" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Collaborate</span>
            </TabsTrigger>
            <TabsTrigger value="ranking" className="flex items-center gap-2" onClick={() => navigate('/student-ranking')}>
              <Trophy className="h-4 w-4" />
              <span className="hidden sm:inline">Rankings</span>
            </TabsTrigger>
            {profile?.user_type === 'student' && (
              <>
                <TabsTrigger value="analytics" className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  <span className="hidden sm:inline">Analytics</span>
                </TabsTrigger>
                <TabsTrigger value="resume" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span className="hidden sm:inline">Resume</span>
                </TabsTrigger>
              </>
            )}
            {profile?.user_type === 'faculty' && (
              <TabsTrigger value="approvals" className="flex items-center gap-2">
                <CheckSquare className="h-4 w-4" />
                <span className="hidden sm:inline">Approvals</span>
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="profile" className="mt-6">
            <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
              <CardHeader className="pb-6">
                <CardTitle className="text-xl">Your Profile</CardTitle>
                <CardDescription>
                  Manage your personal information and skills
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ProfileEditor profile={profile} onUpdate={setProfile} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents" className="mt-6">
            <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
              <CardHeader className="pb-6">
                <CardTitle className="text-xl">Document Management</CardTitle>
                <CardDescription>
                  Upload and manage your documents
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DocumentUpload profile={profile} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="search" className="mt-6">
            <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
              <CardHeader className="pb-6">
                <CardTitle className="text-xl">Student Directory</CardTitle>
                <CardDescription>
                  Search and discover students by skills and departments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <StudentSearch />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="collaboration" className="mt-6">
            <CollaborationRequests profile={profile} />
          </TabsContent>

          <TabsContent value="ranking" className="mt-6">
            <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
              <CardHeader className="pb-6">
                <CardTitle className="text-xl">Student Rankings</CardTitle>
                <CardDescription>
                  View student rankings based on achievements and activities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="mb-4">Click on the "Rankings" tab to view the student ranking system.</p>
                  <Button onClick={() => navigate('/student-ranking')}>
                    View Student Rankings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {profile?.user_type === 'student' && (
            <>
              <TabsContent value="analytics" className="mt-6">
                <AnalyticsDashboard profile={profile} />
              </TabsContent>

              <TabsContent value="resume" className="mt-6">
                <ResumeGenerator profile={profile} />
              </TabsContent>
            </>
          )}

          {profile?.user_type === 'faculty' && (
            <TabsContent value="approvals" className="mt-6">
              <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
                <CardHeader className="pb-6">
                  <CardTitle className="text-xl">Document Approvals</CardTitle>
                  <CardDescription>
                    Review and approve student document submissions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <DocumentApproval />
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </main>
    </div>
  );
}