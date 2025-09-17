import { Database } from "@/integrations/supabase/types";

// Define types for our search results
export interface SearchResult {
  id: string;
  type: 'student' | 'document' | 'skill';
  title: string;
  description: string;
  relevanceScore: number;
  metadata: {
    studentId?: string;
    documentId?: string;
    fileType?: string;
    uploadedAt?: string;
    department?: string;
    college?: string;
    skills?: string[];
    yearOfStudy?: number;
  };
}

export interface SearchQuery {
  text: string;
  userType: 'faculty' | 'placement' | 'all';
  filters?: {
    department?: string;
    college?: string;
    skills?: string[];
    yearOfStudy?: number;
  };
}

// Mock embedding function - in a real implementation, this would use a model like Sentence-BERT
const generateEmbedding = (text: string): number[] => {
  // This is a simplified mock implementation
  // In a real system, you would use a proper embedding model
  const words = text.toLowerCase().split(/\s+/);
  const embedding = new Array(384).fill(0);
  
  // Simple hash-based approach for demonstration
  words.forEach((word, index) => {
    let hash = 0;
    for (let i = 0; i < word.length; i++) {
      hash = ((hash << 5) - hash + word.charCodeAt(i)) & 0xffffffff;
    }
    embedding[index % 384] = (hash % 1000) / 1000;
  });
  
  return embedding;
};

// Calculate cosine similarity between two vectors
const cosineSimilarity = (vecA: number[], vecB: number[]): number => {
  if (vecA.length !== vecB.length) return 0;
  
  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;
  
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    magnitudeA += vecA[i] * vecA[i];
    magnitudeB += vecB[i] * vecB[i];
  }
  
  magnitudeA = Math.sqrt(magnitudeA);
  magnitudeB = Math.sqrt(magnitudeB);
  
  if (magnitudeA === 0 || magnitudeB === 0) return 0;
  
  return dotProduct / (magnitudeA * magnitudeB);
};

// Calculate keyword similarity (simple term frequency)
const keywordSimilarity = (query: string, content: string): number => {
  const queryTerms = query.toLowerCase().split(/\s+/).filter(term => term.length > 2);
  const contentTerms = content.toLowerCase().split(/\s+/);
  
  if (queryTerms.length === 0) return 0;
  
  let matches = 0;
  queryTerms.forEach(term => {
    if (contentTerms.includes(term)) {
      matches++;
    }
  });
  
  return matches / queryTerms.length;
};

// Hybrid ranking function combining keyword and semantic similarity
const calculateRelevanceScore = (query: string, content: string): number => {
  // Calculate keyword similarity
  const keywordScore = keywordSimilarity(query, content);
  
  // Calculate semantic similarity (mock implementation)
  const queryEmbedding = generateEmbedding(query);
  const contentEmbedding = generateEmbedding(content);
  const semanticScore = cosineSimilarity(queryEmbedding, contentEmbedding);
  
  // Weighted combination (70% semantic, 30% keyword)
  return 0.7 * semanticScore + 0.3 * keywordScore;
};

// Rank students based on faculty preferences
const rankForFaculty = (query: string, student: any): number => {
  let score = 0;
  const content = [
    student.bio || '',
    student.department || '',
    student.college || '',
    (student.skills || []).map((s: any) => s.skill_name).join(' '),
    (student.documents || [])
      .filter((d: any) => d.file_type === 'application/pdf')
      .map((d: any) => d.description || d.title)
      .join(' ')
  ].join(' ');
  
  score += calculateRelevanceScore(query, content);
  
  // Boost for research-related content
  if (content.toLowerCase().includes('research')) score *= 1.2;
  if (content.toLowerCase().includes('publication')) score *= 1.3;
  if (content.toLowerCase().includes('paper')) score *= 1.1;
  
  return score;
};

// Rank students based on placement facilitator preferences
const rankForPlacement = (query: string, student: any): number => {
  let score = 0;
  const content = [
    student.bio || '',
    (student.skills || []).map((s: any) => s.skill_name).join(' '),
    (student.skills || []).map((s: any) => s.category).join(' '),
    (student.documents || [])
      .filter((d: any) => d.file_type === 'application/pdf')
      .map((d: any) => d.description || d.title)
      .join(' ')
  ].join(' ');
  
  score += calculateRelevanceScore(query, content);
  
  // Boost for industry-relevant content
  if (content.toLowerCase().includes('internship')) score *= 1.3;
  if (content.toLowerCase().includes('project')) score *= 1.2;
  if (content.toLowerCase().includes('certification')) score *= 1.25;
  
  return score;
};

// Process student data for search
export const processStudentForSearch = (student: any, query: SearchQuery): SearchResult => {
  const baseContent = [
    student.full_name,
    student.bio || '',
    student.department || '',
    student.college || '',
    (student.skills || []).map((s: any) => `${s.skill_name} ${s.category}`).join(' ')
  ].join(' ');
  
  let relevanceScore = 0;
  
  switch (query.userType) {
    case 'faculty':
      relevanceScore = rankForFaculty(query.text, student);
      break;
    case 'placement':
      relevanceScore = rankForPlacement(query.text, student);
      break;
    default:
      relevanceScore = calculateRelevanceScore(query.text, baseContent);
  }
  
  return {
    id: student.id,
    type: 'student',
    title: student.full_name,
    description: student.bio || `Student in ${student.department || 'Unknown Department'}`,
    relevanceScore,
    metadata: {
      studentId: student.id,
      department: student.department,
      college: student.college,
      skills: student.skills?.map((s: any) => s.skill_name) || [],
      yearOfStudy: student.year_of_study
    }
  };
};

// Process document data for search
export const processDocumentForSearch = (document: any, query: SearchQuery): SearchResult => {
  const content = [
    document.title,
    document.description || ''
  ].join(' ');
  
  let relevanceScore = 0;
  
  switch (query.userType) {
    case 'faculty':
      // Faculty might be interested in research documents
      relevanceScore = calculateRelevanceScore(query.text, content);
      if (content.toLowerCase().includes('research')) relevanceScore *= 1.3;
      if (content.toLowerCase().includes('paper')) relevanceScore *= 1.2;
      break;
    case 'placement':
      // Placement officers might be interested in project documents
      relevanceScore = calculateRelevanceScore(query.text, content);
      if (content.toLowerCase().includes('project')) relevanceScore *= 1.3;
      if (content.toLowerCase().includes('internship')) relevanceScore *= 1.2;
      break;
    default:
      relevanceScore = calculateRelevanceScore(query.text, content);
  }
  
  return {
    id: document.id,
    type: 'document',
    title: document.title,
    description: document.description || `Document uploaded on ${new Date(document.uploaded_at).toLocaleDateString()}`,
    relevanceScore,
    metadata: {
      documentId: document.id,
      fileType: document.file_type,
      uploadedAt: document.uploaded_at,
      studentId: document.student_id
    }
  };
};

// Main search function
export const searchAndRank = async (
  query: SearchQuery,
  students: any[],
  documents: any[]
): Promise<SearchResult[]> => {
  const results: SearchResult[] = [];
  
  // Process students
  students.forEach(student => {
    const result = processStudentForSearch(student, query);
    if (result.relevanceScore > 0.1) { // Threshold to filter out irrelevant results
      results.push(result);
    }
  });
  
  // Process documents
  documents.forEach(document => {
    const result = processDocumentForSearch(document, query);
    if (result.relevanceScore > 0.1) { // Threshold to filter out irrelevant results
      results.push(result);
    }
  });
  
  // Sort by relevance score (descending)
  results.sort((a, b) => b.relevanceScore - a.relevanceScore);
  
  return results;
};

// Filter results based on additional filters
export const applyFilters = (
  results: SearchResult[],
  filters: SearchQuery['filters']
): SearchResult[] => {
  if (!filters) return results;
  
  return results.filter(result => {
    // Apply department filter
    if (filters.department && result.metadata.department !== filters.department) {
      return false;
    }
    
    // Apply college filter
    if (filters.college && result.metadata.college !== filters.college) {
      return false;
    }
    
    // Apply skills filter
    if (filters.skills && filters.skills.length > 0) {
      const hasMatchingSkill = filters.skills.some(skill =>
        result.metadata.skills?.includes(skill)
      );
      if (!hasMatchingSkill) return false;
    }
    
    // Apply year of study filter
    if (filters.yearOfStudy && result.metadata.yearOfStudy !== filters.yearOfStudy) {
      return false;
    }
    
    return true;
  });
};