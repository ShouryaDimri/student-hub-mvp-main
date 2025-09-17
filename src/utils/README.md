# Student Ranking System

This directory contains the implementation of a matrix-based student ranking algorithm.

## Features

- Weighted scoring system for student activities
- Matrix-based input (students × activities)
- Customizable activity weights
- Tie-breaking rules based on activity priority
- Detailed score calculation breakdown
- React component for UI visualization

## Activity Categories and Weights

### Academic Achievements
- Course completion with certificate → 7 points
- High course score (>90%) → 12 points
- Research paper publication (peer-reviewed) → 20 points
- Patents filed / innovative project → 25 points

### Hackathons / Competitions
- Hackathon participation → 5 points
- Hackathon win → 10 points
- National-level competition win → 15 points
- International-level competition win → 20 points

### Faculty & Institutional Recognition
- Approval by Dean → 15 points
- Approval by Professor (for groundbreaking work only) → 10 points
- Recommendation for external awards → 12 points

### Community & Leadership
- Mentoring juniors / leading a student team → 8 points
- Organizing workshops/events → 6 points
- Volunteering for social projects → 5 points

### Online Engagement & Skill Growth
- Completion of MOOCs (Coursera, edX, etc.) → 6 points each
- AI/ML/Tech certifications (recognized platforms) → 10 points
- Publishing blogs / open-source contributions → 8 points

## Tie-breaking Priority

When students have the same total score, the following hierarchy is used:
1. Patents/Research (25/20) 
2. International wins (20) 
3. Dean approval (15) 
4. National wins (15) 
5. Professor approval (10) 
6. Hackathon win (10) 
7. High course score (12) 
8. Certifications (10) 
9. Projects (8) 
10. Course completion (7) 
11. Hackathon participation (5)

## Usage

### In Code

```typescript
import { StudentRankingSystem, SAMPLE_STUDENT_MATRIX } from './studentRanking';

const rankingSystem = new StudentRankingSystem();
const rankings = rankingSystem.rankStudents(SAMPLE_STUDENT_MATRIX);
console.log(rankings);
```

### In UI

Navigate to the "Rankings" tab in the dashboard or visit `/student-ranking` directly.

## Sample Data

The system includes sample data for 5 students with various activities across all categories.