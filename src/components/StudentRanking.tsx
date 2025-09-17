import React, { useState, useEffect, useMemo } from 'react';
import { StudentRankingSystem, SAMPLE_STUDENT_MATRIX, ACTIVITY_NAMES, RankedStudent, ActivityWeights } from '../utils/studentRanking';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, Filter, X, Plus, Trash2, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

interface SearchFilter {
  id: string;
  activity: keyof ActivityWeights | '';
  operator: 'gte' | 'lte' | 'eq';
  value: number;
}

const StudentRanking: React.FC = () => {
  const navigate = useNavigate();
  const [rankedStudents, setRankedStudents] = useState<RankedStudent[]>([]);
  const [showCalculations, setShowCalculations] = useState<boolean>(false);
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filters, setFilters] = useState<SearchFilter[]>([
    { id: '1', activity: '', operator: 'gte', value: 1 }
  ]);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState<boolean>(false);
  const [filterActivity, setFilterActivity] = useState<keyof ActivityWeights | ''>('');
  const [minCount, setMinCount] = useState<number>(1);
  
  const rankingSystem = new StudentRankingSystem();
  
  // Calculate rankings on component mount
  useEffect(() => {
    const rankings = rankingSystem.rankStudents(SAMPLE_STUDENT_MATRIX);
    setRankedStudents(rankings);
  }, []);
  
  const addFilter = () => {
    setFilters([
      ...filters,
      { id: Date.now().toString(), activity: '', operator: 'gte', value: 1 }
    ]);
  };
  
  const removeFilter = (id: string) => {
    if (filters.length > 1) {
      setFilters(filters.filter(filter => filter.id !== id));
    }
  };
  
  const updateFilter = (id: string, field: keyof SearchFilter, value: any) => {
    setFilters(filters.map(filter => 
      filter.id === id ? { ...filter, [field]: value } : filter
    ));
  };
  
  const clearAllFilters = () => {
    setSearchTerm('');
    setFilters([{ id: '1', activity: '', operator: 'gte', value: 1 }]);
    setFilterActivity('');
    setMinCount(1);
  };
  
  // Apply search and filters
  const filteredStudents = useMemo(() => {
    let result = [...rankedStudents];
    
    // Apply name search
    if (searchTerm) {
      result = result.filter(student => 
        student.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply simple activity filter
    if (filterActivity) {
      const filtered = rankingSystem.filterStudentsByActivity(
        SAMPLE_STUDENT_MATRIX, 
        filterActivity, 
        minCount
      );
      // Match the filtered results with current rankings
      const filteredNames = new Set(filtered.map(s => s.name));
      result = result.filter(student => filteredNames.has(student.name));
    }
    
    // Apply advanced filters
    for (const filter of filters) {
      if (filter.activity) {
        const activityKeys = Object.keys(rankingSystem['weights']) as (keyof ActivityWeights)[];
        const activityIndex = activityKeys.indexOf(filter.activity);
        
        if (activityIndex !== -1) {
          result = result.filter(student => {
            const activities = SAMPLE_STUDENT_MATRIX[student.name];
            const activityCount = activities[activityIndex] || 0;
            
            switch (filter.operator) {
              case 'gte': return activityCount >= filter.value;
              case 'lte': return activityCount <= filter.value;
              case 'eq': return activityCount === filter.value;
              default: return true;
            }
          });
        }
      }
    }
    
    return result;
  }, [rankedStudents, searchTerm, filterActivity, minCount, filters]);
  
  const handleShowCalculations = () => {
    setShowCalculations(!showCalculations);
  };
  
  const handleStudentSelect = (name: string) => {
    setSelectedStudent(selectedStudent === name ? null : name);
  };
  
  const activityKeys = Object.keys(rankingSystem['weights']) as (keyof ActivityWeights)[];
  
  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <Button 
          onClick={() => navigate('/dashboard')} 
          variant="outline" 
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
        <h1 className="text-3xl font-bold text-center flex-1">Student Ranking System</h1>
        <div className="w-32"></div> {/* Spacer for alignment */}
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4">Ranking Algorithm</h2>
        <p className="mb-4">
          This system ranks students based on a matrix-based scoring system with weighted activities.
          Each activity has a specific point value, and students are ranked by their total score.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-50 p-4 rounded">
            <h3 className="font-semibold mb-2">Academic Achievements</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Course completion with certificate → 7 points</li>
              <li>High course score (&gt;90%) → 12 points</li>
              <li>Research paper publication → 20 points</li>
              <li>Patents filed / innovative project → 25 points</li>
            </ul>
          </div>
          
          <div className="bg-gray-50 p-4 rounded">
            <h3 className="font-semibold mb-2">Hackathons & Competitions</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Hackathon participation → 5 points</li>
              <li>Hackathon win → 10 points</li>
              <li>National-level competition win → 15 points</li>
              <li>International-level competition win → 20 points</li>
            </ul>
          </div>
          
          <div className="bg-gray-50 p-4 rounded">
            <h3 className="font-semibold mb-2">Recognition & Leadership</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Approval by Dean → 15 points</li>
              <li>Approval by Professor → 10 points</li>
              <li>Recommendation for external awards → 12 points</li>
              <li>Mentoring juniors / leading team → 8 points</li>
            </ul>
          </div>
          
          <div className="bg-gray-50 p-4 rounded">
            <h3 className="font-semibold mb-2">Online Engagement</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Completion of MOOCs → 6 points each</li>
              <li>AI/ML/Tech certifications → 10 points</li>
              <li>Publishing blogs / open-source → 8 points</li>
              <li>Volunteering for social projects → 5 points</li>
            </ul>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h2 className="text-2xl font-semibold">Student Rankings</h2>
          
          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              <Select value={filterActivity} onValueChange={(value) => setFilterActivity(value as keyof ActivityWeights | '')}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by activity" />
                </SelectTrigger>
                <SelectContent>
                  {activityKeys.map((activity) => (
                    <SelectItem key={activity} value={activity}>
                      {activity}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {filterActivity && (
                <Input
                  type="number"
                  min="1"
                  value={minCount}
                  onChange={(e) => setMinCount(parseInt(e.target.value) || 1)}
                  className="w-20"
                  placeholder="Min"
                />
              )}
              
              <Button 
                variant="outline" 
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className={showAdvancedFilters ? "bg-gray-100" : ""}
              >
                <Filter className="h-4 w-4 mr-2" />
                Advanced
              </Button>
              
              {(searchTerm || filterActivity || filters.some(f => f.activity)) && (
                <Button variant="outline" size="icon" onClick={clearAllFilters}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
        
        {showAdvancedFilters && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Advanced Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filters.map((filter, index) => (
                  <div key={filter.id} className="flex flex-col sm:flex-row gap-2 items-end">
                    <div className="flex-1">
                      <label className="block text-xs text-gray-500 mb-1">Activity</label>
                      <Select 
                        value={filter.activity} 
                        onValueChange={(value) => updateFilter(filter.id, 'activity', value as keyof ActivityWeights | '')}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select activity" />
                        </SelectTrigger>
                        <SelectContent>
                          {activityKeys.map((activity) => (
                            <SelectItem key={activity} value={activity}>
                              {activity}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Operator</label>
                      <Select 
                        value={filter.operator} 
                        onValueChange={(value) => updateFilter(filter.id, 'operator', value as 'gte' | 'lte' | 'eq')}
                      >
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="gte">≥</SelectItem>
                          <SelectItem value="lte">≤</SelectItem>
                          <SelectItem value="eq">=</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Value</label>
                      <Input
                        type="number"
                        min="0"
                        value={filter.value}
                        onChange={(e) => updateFilter(filter.id, 'value', parseInt(e.target.value) || 0)}
                        className="w-24"
                      />
                    </div>
                    
                    {filters.length > 1 && (
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => removeFilter(filter.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                
                <div className="flex justify-between pt-2">
                  <Button variant="outline" size="sm" onClick={addFilter}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Filter
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        <div className="mb-4 flex justify-between items-center">
          <p className="text-sm text-gray-500">
            Showing {filteredStudents.length} of {rankedStudents.length} students
          </p>
          <button 
            onClick={handleShowCalculations}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm"
          >
            {showCalculations ? 'Hide' : 'Show'} Calculations
          </button>
        </div>
        
        {filteredStudents.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No students match the current filters. Try adjusting your search criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Key Activities</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStudents.map((student) => {
                  const activities = SAMPLE_STUDENT_MATRIX[student.name];
                  // Get top 3 activities for this student
                  const topActivities = activities
                    .map((count, index) => ({ count, index }))
                    .filter(item => item.count > 0)
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 3)
                    .map(item => ({
                      name: ACTIVITY_NAMES[item.index] || `Activity ${item.index+1}`,
                      count: item.count
                    }));
                  
                  return (
                    <React.Fragment key={student.name}>
                      <tr 
                        className={`hover:bg-gray-50 cursor-pointer ${selectedStudent === student.name ? 'bg-blue-50' : ''}`}
                        onClick={() => handleStudentSelect(student.name)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            student.rank === 1 ? 'bg-yellow-100 text-yellow-800' : 
                            student.rank === 2 ? 'bg-gray-100 text-gray-800' : 
                            student.rank === 3 ? 'bg-amber-100 text-amber-800' : 
                            'bg-green-100 text-green-800'
                          }`}>
                            #{student.rank}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{student.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.score}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          <div className="flex flex-wrap gap-1">
                            {topActivities.map((activity, idx) => (
                              <span key={idx} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                                {activity.name}: {activity.count}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStudentSelect(student.name);
                            }}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            {selectedStudent === student.name ? 'Hide Details' : 'View Details'}
                          </button>
                        </td>
                      </tr>
                      {showCalculations && selectedStudent === student.name && (
                        <tr>
                          <td colSpan={5} className="px-6 py-4 bg-gray-50">
                            <div className="font-medium mb-2">Score Calculation:</div>
                            <pre className="bg-gray-100 p-3 rounded text-sm whitespace-pre-wrap">
                              {rankingSystem.getDetailedCalculation(
                                student.name, 
                                SAMPLE_STUDENT_MATRIX[student.name]
                              )}
                            </pre>
                            <div className="mt-3">
                              <div className="font-medium mb-2">Activity Breakdown:</div>
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                {SAMPLE_STUDENT_MATRIX[student.name].map((count, index) => (
                                  <div key={index} className="text-sm">
                                    <span className="font-medium">{ACTIVITY_NAMES[index] || `Activity ${index+1}`}:</span> {count}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold mb-4">Sample Data Explanation</h2>
        <p className="mb-4">
          The table above shows the ranking of 5 sample students based on their activities.
          Each student has a set of activities in the following order:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          {ACTIVITY_NAMES.map((name, index) => (
            <div key={index} className="bg-gray-50 p-2 rounded">
              <span className="font-medium">Index {index+1}:</span> {name}
            </div>
          ))}
        </div>
        <p>
          The tie-breaking rules prioritize higher-value achievements when students have the same total score.
        </p>
      </div>
    </div>
  );
};

export default StudentRanking;