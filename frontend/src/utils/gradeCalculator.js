export function calculateGPA(grades) {
  if (!grades || grades.length === 0) return 0.0;
  const gradePoints = {
    'A+': 4.0, 'A': 4.0, 'A-': 3.7,
    'B+': 3.3, 'B': 3.0, 'B-': 2.7,
    'C+': 2.3, 'C': 2.0, 'C-': 1.7,
    'D+': 1.3, 'D': 1.0, 'F': 0.0
  };

  let totalPoints = 0;
  let count = 0;

  for (const grade of grades) {
    const point = gradePoints[grade.toUpperCase()];
    if (point !== undefined) {
      totalPoints += point;
      count++;
    }
  }

  return count > 0 ? parseFloat((totalPoints / count).toFixed(2)) : 0.0;
}
