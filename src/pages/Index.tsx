import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { GraduationCap, Users, Upload, CheckSquare } from 'lucide-react';
import { SocialIcons } from '@/components/SocialIcons';

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Student Hub</h1>
          <SocialIcons />
        </div>
        
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4">Welcome to Student Hub</h1>
          <p className="text-xl text-muted-foreground mb-8">
            A comprehensive platform for student management, document sharing, and faculty approval workflows
          </p>
          <Button onClick={() => navigate('/auth')} size="lg">
            Get Started
          </Button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Student Profiles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Create detailed profiles with skills, departments, and personal information
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-primary" />
                Document Upload
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Upload and manage documents with secure file storage
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-primary" />
                Student Search
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Find students by skills, department, or other criteria
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckSquare className="h-5 w-5 text-primary" />
                Faculty Approval
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Faculty can review and approve student document submissions
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-16">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Ready to start?</CardTitle>
              <CardDescription>
                Join as a student or faculty member to access all features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate('/auth')} className="w-full">
                Sign Up / Sign In
              </Button>
            </CardContent>
          </Card>
          <div className="mt-8">
            <SocialIcons className="justify-center" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
