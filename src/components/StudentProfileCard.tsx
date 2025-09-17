import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MapPin, BookOpen, User, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StudentProfile {
  id: string;
  full_name: string;
  email?: string;
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

interface StudentProfileCardProps {
  student: StudentProfile;
  onViewProfile: (student: StudentProfile) => void;
}

export const StudentProfileCard = ({ student, onViewProfile }: StudentProfileCardProps) => {
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-border/50 hover:border-primary/20 bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <Avatar className="h-12 w-12 border border-border">
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {getInitials(student.full_name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
              {student.full_name}
            </h3>
            {student.department && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <BookOpen className="h-3 w-3" />
                <span className="truncate">{student.department}</span>
              </div>
            )}
            {student.college && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-3 w-3" />
                <span className="truncate">{student.college}</span>
              </div>
            )}
          </div>
          {student.year_of_study && (
            <Badge variant="secondary" className="shrink-0">
              Year {student.year_of_study}
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {student.bio && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {student.bio}
          </p>
        )}
        
        {student.skills.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <User className="h-3 w-3" />
              <span>Skills</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {student.skills.slice(0, 3).map((skill, index) => (
                <Badge 
                  key={index} 
                  variant="outline" 
                  className="text-xs py-0 px-2 bg-primary/5 border-primary/20"
                >
                  {skill.skill_name}
                </Badge>
              ))}
              {student.skills.length > 3 && (
                <Badge variant="outline" className="text-xs py-0 px-2 bg-muted">
                  +{student.skills.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}
        
        <Button 
          onClick={() => onViewProfile(student)}
          variant="outline" 
          size="sm" 
          className="w-full mt-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
        >
          <Eye className="h-3 w-3 mr-1" />
          View Profile
        </Button>
      </CardContent>
    </Card>
  );
};