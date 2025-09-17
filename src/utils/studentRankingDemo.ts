import { StudentRankingSystem, SAMPLE_STUDENT_MATRIX, ACTIVITY_NAMES } from './studentRanking';

/**
 * Demonstration of the student ranking algorithm
 */
function demonstrateStudentRanking() {
  console.log('=== Student Ranking Algorithm Demonstration ===\n');
  
  // Create ranking system instance
  const rankingSystem = new StudentRankingSystem();
  
  // Show activity weights
  console.log('Activity Weights:');
  console.log('==================');
  const weights = rankingSystem['weights'];
  for (const [key, value] of Object.entries(weights)) {
    console.log(`${key}: ${value} points`);
  }
  console.log('\n');
  
  // Show sample data
  console.log('Sample Student Data:');
  console.log('====================');
  for (const [name, activities] of Object.entries(SAMPLE_STUDENT_MATRIX)) {
    console.log(`\n${name}:`);
    activities.forEach((count, index) => {
      if (count > 0) {
        console.log(`  ${ACTIVITY_NAMES[index] || `Activity ${index+1}`}: ${count}`);
      }
    });
  }
  console.log('\n');
  
  // Calculate and show detailed scores
  console.log('Score Calculations:');
  console.log('===================');
  for (const [name, activities] of Object.entries(SAMPLE_STUDENT_MATRIX)) {
    console.log(rankingSystem.getDetailedCalculation(name, activities));
    console.log('');
  }
  
  // Rank students
  console.log('Final Rankings:');
  console.log('===============');
  const rankings = rankingSystem.rankStudents(SAMPLE_STUDENT_MATRIX);
  
  console.table(rankings.map(r => ({
    Rank: r.rank,
    Student: r.name,
    Score: r.score
  })));
  
  // Explain tie-breaking
  console.log('\nTie-breaking Rules:');
  console.log('===================');
  console.log('When students have the same total score, the following priority is used:');
  console.log('1. Patents/Research (25/20 points)');
  console.log('2. International wins (20 points)');
  console.log('3. Dean approval (15 points)');
  console.log('4. National wins (15 points)');
  console.log('5. Professor approval (10 points)');
  console.log('6. Hackathon win (10 points)');
  console.log('7. High course score (12 points)');
  console.log('8. Certifications (10 points)');
  console.log('9. Projects/Mentoring/Open-source (8 points)');
  console.log('10. Course completion (7 points)');
  console.log('11. Hackathon participation (5 points)');
  console.log('12. Volunteering (5 points)');
}

// Run the demonstration
demonstrateStudentRanking();

export { demonstrateStudentRanking };