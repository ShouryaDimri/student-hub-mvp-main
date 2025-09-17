import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, X } from 'lucide-react';

interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  user_type: string;
  department?: string;
  year_of_study?: number;
  bio?: string;
  github_url?: string;
  linkedin_url?: string;
}

interface Skill {
  id: string;
  name: string;
  category: string;
}

interface StudentSkill {
  id: string;
  skill_id: string;
  proficiency_level: string;
  skills: Skill;
}

interface ProfileEditorProps {
  profile: Profile | null;
  onUpdate: (profile: Profile) => void;
}

export function ProfileEditor({ profile, onUpdate }: ProfileEditorProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [studentSkills, setStudentSkills] = useState<StudentSkill[]>([]);
  const [selectedSkill, setSelectedSkill] = useState('');
  const [proficiencyLevel, setProficiencyLevel] = useState('');

  useEffect(() => {
    fetchSkills();
    if (profile?.user_type === 'student') {
      fetchStudentSkills();
    }
  }, [profile]);

  const fetchSkills = async () => {
    try {
      const { data, error } = await supabase
        .from('skills')
        .select('*')
        .order('name');

      if (error) throw error;
      setSkills(data || []);
    } catch (error) {
      console.error('Error fetching skills:', error);
    }
  };

  const fetchStudentSkills = async () => {
    if (!profile) return;

    try {
      const { data, error } = await supabase
        .from('student_skills')
        .select(`
          id,
          skill_id,
          proficiency_level,
          skills (id, name, category)
        `)
        .eq('student_id', profile.id);

      if (error) throw error;
      setStudentSkills(data || []);
    } catch (error) {
      console.error('Error fetching student skills:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!profile) return;

    setLoading(true);
    const formData = new FormData(e.currentTarget);

    try {
      const updateData: any = {
        full_name: formData.get('fullName') as string,
        department: formData.get('department') as string,
        year_of_study: formData.get('yearOfStudy') ? parseInt(formData.get('yearOfStudy') as string) : null,
        bio: formData.get('bio') as string,
      };

      // Only include GitHub and LinkedIn fields if they exist in the form
      if (formData.has('githubUrl')) {
        updateData.github_url = formData.get('githubUrl') as string;
      }
      
      if (formData.has('linkedinUrl')) {
        updateData.linkedin_url = formData.get('linkedinUrl') as string;
      }

      const { data, error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', profile.id)
        .select()
        .single();

      if (error) throw error;
      
      onUpdate(data);
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error updating profile",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const addSkill = async () => {
    if (!selectedSkill || !proficiencyLevel || !profile) return;

    try {
      const { error } = await supabase
        .from('student_skills')
        .insert({
          student_id: profile.id,
          skill_id: selectedSkill,
          proficiency_level: proficiencyLevel,
        });

      if (error) throw error;

      toast({
        title: "Skill added",
        description: "Skill has been added to your profile.",
      });

      setSelectedSkill('');
      setProficiencyLevel('');
      fetchStudentSkills();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error adding skill",
        description: error.message,
      });
    }
  };

  const removeSkill = async (skillId: string) => {
    try {
      const { error } = await supabase
        .from('student_skills')
        .delete()
        .eq('id', skillId);

      if (error) throw error;

      toast({
        title: "Skill removed",
        description: "Skill has been removed from your profile.",
      });

      fetchStudentSkills();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error removing skill",
        description: error.message,
      });
    }
  };

  if (!profile) return null;

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              name="fullName"
              defaultValue={profile.full_name}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              value={profile.email}
              disabled
              className="bg-muted"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="department">Department</Label>
            <Input
              id="department"
              name="department"
              defaultValue={profile.department || ''}
            />
          </div>
          {profile.user_type === 'student' && (
            <div className="space-y-2">
              <Label htmlFor="yearOfStudy">Year of Study</Label>
              <Select name="yearOfStudy" defaultValue={profile.year_of_study?.toString()}>
                <SelectTrigger>
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1st Year</SelectItem>
                  <SelectItem value="2">2nd Year</SelectItem>
                  <SelectItem value="3">3rd Year</SelectItem>
                  <SelectItem value="4">4th Year</SelectItem>
                  <SelectItem value="5">5th Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="githubUrl">GitHub Profile</Label>
            <Input
              id="githubUrl"
              name="githubUrl"
              type="url"
              placeholder="https://github.com/username"
              defaultValue={profile.github_url || ''}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="linkedinUrl">LinkedIn Profile</Label>
            <Input
              id="linkedinUrl"
              name="linkedinUrl"
              type="url"
              placeholder="https://linkedin.com/in/username"
              defaultValue={profile.linkedin_url || ''}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            name="bio"
            placeholder="Tell us about yourself..."
            defaultValue={profile.bio || ''}
            rows={3}
          />
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? 'Updating...' : 'Update Profile'}
        </Button>
      </form>

      {profile.user_type === 'student' && (
        <Card>
          <CardHeader>
            <CardTitle>Skills</CardTitle>
            <CardDescription>
              Add your skills to help others find you
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {studentSkills.map((studentSkill) => (
                <Badge key={studentSkill.id} variant="secondary" className="flex items-center gap-2">
                  {studentSkill.skills.name} ({studentSkill.proficiency_level})
                  <button
                    onClick={() => removeSkill(studentSkill.id)}
                    className="hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>

            <div className="flex gap-2">
              <Select value={selectedSkill} onValueChange={setSelectedSkill}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select a skill" />
                </SelectTrigger>
                <SelectContent>
                  {skills.map((skill) => (
                    <SelectItem key={skill.id} value={skill.id}>
                      {skill.name} ({skill.category})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={proficiencyLevel} onValueChange={setProficiencyLevel}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>

              <Button
                onClick={addSkill}
                disabled={!selectedSkill || !proficiencyLevel}
                size="icon"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}