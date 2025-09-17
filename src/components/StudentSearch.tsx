import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { Search, User, Mail, GraduationCap, Building } from 'lucide-react';
import { SearchEngine } from './SearchEngine';
import { StudentProfileCard } from "./StudentProfileCard";
import { StudentProfileModal } from "./StudentProfileModal";

interface Student {
  id: string;
  full_name: string;
  email: string;
  department?: string;
  college?: string;
  year_of_study?: number;
  bio?: string;
  skills: Array<{
    skill_name: string;
    proficiency_level: string;
    category: string;
  }>;
}

export function StudentSearch() {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  return (
    <div className="space-y-6">
      <Tabs defaultValue="directory" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="directory">Student Directory</TabsTrigger>
          <TabsTrigger value="search-engine">Advanced Search</TabsTrigger>
        </TabsList>
        <TabsContent value="directory">
          <div className="py-4">
            <StudentDirectory onSelectStudent={setSelectedStudent} />
          </div>
        </TabsContent>
        <TabsContent value="search-engine">
          <div className="py-4">
            <SearchEngine />
          </div>
        </TabsContent>
      </Tabs>

      <StudentProfileModal 
        student={selectedStudent}
        isOpen={!!selectedStudent}
        onClose={() => setSelectedStudent(null)}
      />
    </div>
  );
}

// Keep the existing student directory functionality
function StudentDirectory({ onSelectStudent }: { onSelectStudent: (student: Student) => void }) {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedCollege, setSelectedCollege] = useState<string>('all');
  const [selectedSkill, setSelectedSkill] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState<string[]>([]);
  const [colleges, setColleges] = useState<string[]>([]);
  const [skills, setSkills] = useState<string[]>([]);

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    filterStudents();
  }, [searchTerm, selectedDepartment, selectedCollege, selectedSkill, students]);

  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          email,
          department,
          college,
          year_of_study,
          bio,
          student_skills (
            proficiency_level,
            skills (
              name,
              category
            )
          )
        `)
        .eq('user_type', 'student')
        .eq('privacy_settings->profile_visible', 'true');

      if (error) throw error;

      const formattedStudents = data?.map(student => ({
        ...student,
        skills: student.student_skills?.map(ss => ({
          skill_name: ss.skills?.name || '',
          proficiency_level: ss.proficiency_level,
          category: ss.skills?.category || ''
        })) || []
      })) || [];

      setStudents(formattedStudents);

      // Extract unique departments, colleges, and skills
      const uniqueDepartments = [...new Set(
        data?.map(s => s.department).filter(Boolean)
      )] as string[];
      
      const uniqueColleges = [...new Set(
        data?.map(s => s.college).filter(Boolean)
      )] as string[];
      
      const uniqueSkills = [...new Set(
        data?.flatMap(s => 
          s.student_skills?.map(ss => ss.skills?.name).filter(Boolean)
        )
      )] as string[];

      setDepartments(uniqueDepartments);
      setColleges(uniqueColleges);
      setSkills(uniqueSkills);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterStudents = () => {
    let filtered = students;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(student =>
        student.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.bio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.skills.some(skill => 
          skill.skill_name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Filter by department
    if (selectedDepartment !== 'all') {
      filtered = filtered.filter(student => student.department === selectedDepartment);
    }

    // Filter by college
    if (selectedCollege !== 'all') {
      filtered = filtered.filter(student => student.college === selectedCollege);
    }

    // Filter by skill
    if (selectedSkill !== 'all') {
      filtered = filtered.filter(student =>
        student.skills.some(skill => skill.skill_name === selectedSkill)
      );
    }

    setFilteredStudents(filtered);
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-2 text-muted-foreground">Loading students...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search by name, email, bio, or skills..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {departments.map(dept => (
              <SelectItem key={dept} value={dept}>{dept}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select value={selectedCollege} onValueChange={setSelectedCollege}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="College" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Colleges</SelectItem>
            {colleges.map(college => (
              <SelectItem key={college} value={college}>{college}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select value={selectedSkill} onValueChange={setSelectedSkill}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Skill" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Skills</SelectItem>
            {skills.map(skill => (
              <SelectItem key={skill} value={skill}>{skill}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Student Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStudents.map((student) => (
          <StudentProfileCard 
            key={student.id} 
            student={student} 
            onViewProfile={onSelectStudent}
          />
        ))}
      </div>

      {filteredStudents.length === 0 && searchTerm && (
        <div className="text-center py-8">
          <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No students found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search terms or filters
          </p>
        </div>
      )}
    </div>
  );
}