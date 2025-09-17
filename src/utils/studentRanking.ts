export interface ActivityWeights {
  // Academic Achievements
  courseCompletion: number;
  highCourseScore: number;
  researchPaper: number;
  patents: number;
  
  // Hackathons / Competitions
  hackathonParticipation: number;
  hackathonWin: number;
  nationalCompetition: number;
  internationalCompetition: number;
  
  // Faculty & Institutional Recognition
  deanApproval: number;
  professorApproval: number;
  externalAward: number;
  
  // Community & Leadership
  mentoring: number;
  organizingEvents: number;
  volunteering: number;
  
  // Online Engagement & Skill Growth
  moocs: number;
  certifications: number;
  openSource: number;
}

export interface StudentActivityMatrix {
  [studentName: string]: number[]; // Array of activity counts in same order as weights
}

export interface RankedStudent {
  name: string;
  score: number;
  rank: number;
}

// Define the weights based on the problem statement
export const ACTIVITY_WEIGHTS: ActivityWeights = {
  // Academic Achievements
  courseCompletion: 7,
  highCourseScore: 12,
  researchPaper: 20,
  patents: 25,
  
  // Hackathons / Competitions
  hackathonParticipation: 5,
  hackathonWin: 10,
  nationalCompetition: 15,
  internationalCompetition: 20,
  
  // Faculty & Institutional Recognition
  deanApproval: 15,
  professorApproval: 10,
  externalAward: 12,
  
  // Community & Leadership
  mentoring: 8,
  organizingEvents: 6,
  volunteering: 5,
  
  // Online Engagement & Skill Growth
  moocs: 6,
  certifications: 10,
  openSource: 8
};

// Tie-breaking priority (higher priority = higher value)
const TIE_BREAKER_PRIORITY = {
  patents: 15,           // 25 points
  researchPaper: 14,     // 20 points
  internationalCompetition: 13, // 20 points
  deanApproval: 12,      // 15 points
  nationalCompetition: 11, // 15 points
  professorApproval: 10, // 10 points
  hackathonWin: 9,       // 10 points
  highCourseScore: 8,    // 12 points
  certifications: 7,     // 10 points
  mentoring: 6,          // 8 points (combines with openSource)
  openSource: 6,         // 8 points (combines with mentoring)
  courseCompletion: 5,   // 7 points
  externalAward: 4,      // 12 points
  organizingEvents: 3,   // 6 points
  moocs: 2,              // 6 points
  hackathonParticipation: 1, // 5 points
  volunteering: 0        // 5 points
};

export class StudentRankingSystem {
  private weights: ActivityWeights;
  
  constructor(weights: ActivityWeights = ACTIVITY_WEIGHTS) {
    this.weights = weights;
  }
  
  /**
   * Calculate scores for all students based on their activity matrix
   * @param matrix Student activity data
   * @returns Array of students with their calculated scores
   */
  calculateScores(matrix: StudentActivityMatrix): { name: string; score: number }[] {
    const students: { name: string; score: number }[] = [];
    
    for (const [name, activities] of Object.entries(matrix)) {
      let score = 0;
      
      // Get the weights in the same order as the activities array
      const weightValues = Object.values(this.weights);
      
      // Calculate weighted score
      for (let i = 0; i < activities.length; i++) {
        score += activities[i] * (weightValues[i] || 0);
      }
      
      students.push({ name, score });
    }
    
    return students;
  }
  
  /**
   * Rank students based on scores with tie-breaking rules
   * @param matrix Student activity data
   * @returns Ranked list of students
   */
  rankStudents(matrix: StudentActivityMatrix): RankedStudent[] {
    // First calculate scores
    const studentsWithScores = this.calculateScores(matrix);
    
    // Sort by score (descending)
    studentsWithScores.sort((a, b) => b.score - a.score);
    
    // Handle ties with tie-breaking rules
    this.handleTies(studentsWithScores, matrix);
    
    // Assign ranks
    const rankedStudents: RankedStudent[] = [];
    let currentRank = 1;
    let previousScore: number | null = null;
    
    for (let i = 0; i < studentsWithScores.length; i++) {
      const student = studentsWithScores[i];
      
      // If score is different from previous, increment rank
      if (previousScore !== null && student.score < previousScore) {
        currentRank = i + 1;
      }
      
      rankedStudents.push({
        name: student.name,
        score: student.score,
        rank: currentRank
      });
      
      previousScore = student.score;
    }
    
    return rankedStudents;
  }
  
  /**
   * Handle ties using the specified priority system
   * @param students Array of students sorted by score
   * @param matrix Original activity matrix
   */
  private handleTies(students: { name: string; score: number }[], matrix: StudentActivityMatrix): void {
    // Group students by score
    const scoreGroups: { [score: number]: { name: string; score: number }[] } = {};
    
    for (const student of students) {
      if (!scoreGroups[student.score]) {
        scoreGroups[student.score] = [];
      }
      scoreGroups[student.score].push(student);
    }
    
    // For each group with more than one student, apply tie-breaking
    for (const [score, group] of Object.entries(scoreGroups)) {
      if (group.length > 1) {
        // Sort by tie-breaker priority
        group.sort((a, b) => {
          const aActivities = matrix[a.name];
          const bActivities = matrix[b.name];
          
          // Check each tie-breaker criterion in order of priority
          const priorityKeys = Object.keys(TIE_BREAKER_PRIORITY).sort(
            (a, b) => TIE_BREAKER_PRIORITY[b as keyof typeof TIE_BREAKER_PRIORITY] - 
                     TIE_BREAKER_PRIORITY[a as keyof typeof TIE_BREAKER_PRIORITY]
          );
          
          const weightKeys = Object.keys(this.weights);
          
          // Find the first activity where students differ
          for (const priorityKey of priorityKeys) {
            const activityIndex = weightKeys.indexOf(priorityKey);
            if (activityIndex !== -1) {
              const aCount = aActivities[activityIndex] || 0;
              const bCount = bActivities[activityIndex] || 0;
              
              if (aCount !== bCount) {
                return bCount - aCount; // Higher count first
              }
            }
          }
          
          return 0; // Still tied
        });
        
        // Update the original array with the sorted group
        const startIndex = students.findIndex(s => s.name === group[0].name);
        for (let i = 0; i < group.length; i++) {
          students[startIndex + i] = group[i];
        }
      }
    }
  }
  
  /**
   * Search students by name
   * @param matrix Student activity data
   * @param searchTerm Search term to match against student names
   * @returns Ranked list of students matching the search term
   */
  searchStudents(matrix: StudentActivityMatrix, searchTerm: string): RankedStudent[] {
    // Filter students by name
    const filteredMatrix: StudentActivityMatrix = {};
    for (const [name, activities] of Object.entries(matrix)) {
      if (name.toLowerCase().includes(searchTerm.toLowerCase())) {
        filteredMatrix[name] = activities;
      }
    }
    
    // Rank the filtered students
    return this.rankStudents(filteredMatrix);
  }
  
  /**
   * Filter students by activity criteria
   * @param matrix Student activity data
   * @param activityType Activity type to filter by
   * @param minCount Minimum count required for the activity
   * @returns Ranked list of students meeting the criteria
   */
  filterStudentsByActivity(matrix: StudentActivityMatrix, activityType: keyof ActivityWeights, minCount: number): RankedStudent[] {
    // Get the index of the activity type
    const activityKeys = Object.keys(this.weights) as (keyof ActivityWeights)[];
    const activityIndex = activityKeys.indexOf(activityType);
    
    if (activityIndex === -1) {
      return []; // Invalid activity type
    }
    
    // Filter students by activity count
    const filteredMatrix: StudentActivityMatrix = {};
    for (const [name, activities] of Object.entries(matrix)) {
      if (activities[activityIndex] >= minCount) {
        filteredMatrix[name] = activities;
      }
    }
    
    // Rank the filtered students
    return this.rankStudents(filteredMatrix);
  }
  
  /**
   * Display detailed calculation for a student
   * @param name Student name
   * @param activities Activity counts
   * @returns String with detailed calculation
   */
  getDetailedCalculation(name: string, activities: number[]): string {
    const weightValues = Object.values(this.weights);
    const weightKeys = Object.keys(this.weights);
    
    let calculation = `${name}'s Score Calculation:\n`;
    let total = 0;
    
    for (let i = 0; i < activities.length; i++) {
      const activityCount = activities[i];
      const weight = weightValues[i];
      const activityName = weightKeys[i];
      const points = activityCount * weight;
      
      if (activityCount > 0) {
        calculation += `  ${activityName}: ${activityCount} × ${weight} = ${points}\n`;
        total += points;
      }
    }
    
    calculation += `  Total Score: ${total}`;
    return calculation;
  }
}

// Sample data for demonstration
export const SAMPLE_STUDENT_MATRIX: StudentActivityMatrix = {
  "Alice": [3, 2, 1, 0, 2, 1, 0, 0, 1, 1, 1, 2, 1, 3, 2, 1, 1], // 17 activities
  "Bob": [5, 1, 0, 1, 3, 2, 1, 0, 0, 2, 0, 1, 2, 2, 1, 2, 1],
  "Charlie": [2, 3, 2, 0, 1, 0, 0, 1, 2, 1, 3, 0, 1, 4, 3, 0, 1],
  "Diana": [4, 2, 1, 1, 2, 1, 2, 1, 1, 1, 2, 3, 0, 1, 2, 3, 1],
  "Eve": [1, 1, 0, 2, 1, 3, 1, 2, 1, 0, 1, 1, 3, 2, 1, 1, 1]
};

// Create a mapping of activity names to indices for the sample data
export const ACTIVITY_NAMES = [
  "Course completion",
  "High course score",
  "Research paper",
  "Patents",
  "Hackathon participation",
  "Hackathon win",
  "National competition",
  "International competition",
  "Dean approval",
  "Professor approval",
  "External award",
  "Mentoring",
  "Organizing events",
  "Volunteering",
  "MOOCs",
  "Certifications",
  "Open source"
];