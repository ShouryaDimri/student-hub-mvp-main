import { useState, useEffect, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, User, FileText, GraduationCap, Building, Filter } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { searchAndRank, applyFilters, SearchQuery, SearchResult } from '@/utils/searchEngineRanking';
import { StudentProfileModal } from './StudentProfileModal';

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

interface Document {
  id: string;
  title: string;
  description?: string;
  file_url: string;
  file_type: string;
  file_size: number;
  status: 'pending' | 'approved' | 'rejected';
  uploaded_at: string;
  student_id: string;
}

export function SearchEngine() {
  const [searchTerm, setSearchTerm] = useState('');
  const [userType, setUserType] = useState<'faculty' | 'placement' | 'all'>('all');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedCollege, setSelectedCollege] = useState<string>('all');
  const [selectedSkill, setSelectedSkill] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState<string[]>([]);
  const [colleges, setColleges] = useState<string[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [years, setYears] = useState<number[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // Fetch students and documents on component mount
  useEffect(() => {
    fetchStudents();
    fetchDocuments();
  }, []);

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

      // Extract unique departments, colleges, skills, and years
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

      const uniqueYears = [...new Set(
        data?.map(s => s.year_of_study).filter(Boolean)
      )] as number[];

      setDepartments(uniqueDepartments);
      setColleges(uniqueColleges);
      setSkills(uniqueSkills);
      setYears(uniqueYears.sort((a, b) => a - b));
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const fetchDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('status', 'approved');

      if (error) throw error;
      setDocuments((data || []) as Document[]);
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  };

  // Perform search when search term or filters change
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setResults([]);
      return;
    }

    const performSearch = async () => {
      setLoading(true);
      
      try {
        const query: SearchQuery = {
          text: searchTerm,
          userType,
          filters: {
            department: selectedDepartment !== 'all' ? selectedDepartment : undefined,
            college: selectedCollege !== 'all' ? selectedCollege : undefined,
            skills: selectedSkill !== 'all' ? [selectedSkill] : undefined,
            yearOfStudy: selectedYear !== 'all' ? parseInt(selectedYear) : undefined
          }
        };

        const searchResults = await searchAndRank(query, students, documents);
        const filteredResults = applyFilters(searchResults, query.filters);
        setResults(filteredResults);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(performSearch, 300); // Debounce search
    return () => clearTimeout(timeoutId);
  }, [searchTerm, userType, selectedDepartment, selectedCollege, selectedSkill, selectedYear, students, documents]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'student':
        return <User className="h-4 w-4" />;
      case 'document':
        return <FileText className="h-4 w-4" />;
      default:
        return <Search className="h-4 w-4" />;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'student':
        return <Badge className="bg-blue-100 text-blue-800">Student</Badge>;
      case 'document':
        return <Badge className="bg-green-100 text-green-800">Document</Badge>;
      default:
        return <Badge variant="secondary">Other</Badge>;
    }
  };

  const handleViewProfile = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    if (student) {
      setSelectedStudent(student as Student);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setUserType('all');
    setSelectedDepartment('all');
    setSelectedCollege('all');
    setSelectedSkill('all');
    setSelectedYear('all');
  };

  return (
    <div className="space-y-6">
      {/* Search Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Advanced Search Engine
          </CardTitle>
          <CardDescription>
            Search across students, documents, skills, and more with intelligent ranking
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search by keywords, skills, interests, document titles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={userType} onValueChange={(value: 'faculty' | 'placement' | 'all') => setUserType(value)}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="User Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="faculty">Faculty</SelectItem>
                <SelectItem value="placement">Placement Officer</SelectItem>
              </SelectContent>
            </Select>
            
            <Button 
              variant="outline" 
              onClick={() => setShowFilters(!showFilters)}
              className={showFilters ? "bg-gray-100" : ""}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
          
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 pt-4">
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger>
                  <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map(dept => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedCollege} onValueChange={setSelectedCollege}>
                <SelectTrigger>
                  <SelectValue placeholder="All Colleges" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Colleges</SelectItem>
                  {colleges.map(college => (
                    <SelectItem key={college} value={college}>{college}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedSkill} onValueChange={setSelectedSkill}>
                <SelectTrigger>
                  <SelectValue placeholder="All Skills" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Skills</SelectItem>
                  {skills.map(skill => (
                    <SelectItem key={skill} value={skill}>{skill}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger>
                  <SelectValue placeholder="All Years" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Years</SelectItem>
                  {years.map(year => (
                    <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button variant="outline" onClick={clearFilters}>
                Clear All
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Searching...</p>
        </div>
      ) : (
        <>
          {results.length > 0 && (
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                Found {results.length} result{results.length !== 1 ? 's' : ''}
              </p>
              <p className="text-sm text-muted-foreground">
                Sorted by relevance
              </p>
            </div>
          )}
          
          <div className="space-y-4">
            {results.map((result) => (
              <Card key={result.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="mt-1">
                      {getTypeIcon(result.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium text-lg truncate">{result.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {result.description}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {getTypeBadge(result.type)}
                          <Badge variant="outline">
                            {(result.relevanceScore * 100).toFixed(1)}%
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mt-3">
                        {result.metadata.department && (
                          <Badge variant="secondary" className="text-xs">
                            <Building className="h-3 w-3 mr-1" />
                            {result.metadata.department}
                          </Badge>
                        )}
                        {result.metadata.college && (
                          <Badge variant="secondary" className="text-xs">
                            <GraduationCap className="h-3 w-3 mr-1" />
                            {result.metadata.college}
                          </Badge>
                        )}
                        {result.metadata.skills && result.metadata.skills.slice(0, 3).map((skill, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {result.metadata.yearOfStudy && (
                          <Badge variant="outline" className="text-xs">
                            Year {result.metadata.yearOfStudy}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between mt-4">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full" 
                            style={{ width: `${result.relevanceScore * 100}%` }}
                          ></div>
                        </div>
                        {result.type === 'student' && result.metadata.studentId && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="ml-4"
                            onClick={() => handleViewProfile(result.metadata.studentId!)}
                          >
                            View Profile
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {results.length === 0 && searchTerm && !loading && (
            <Card>
              <CardContent className="text-center py-8">
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No results found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search terms or filters
                </p>
              </CardContent>
            </Card>
          )}
        </>
      )}

      <StudentProfileModal 
        student={selectedStudent}
        isOpen={!!selectedStudent}
        onClose={() => setSelectedStudent(null)}
      />
    </div>
  );
}