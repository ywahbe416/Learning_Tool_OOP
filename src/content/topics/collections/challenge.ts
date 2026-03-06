import type { Challenge } from "@/types/challenge";

export const challenge: Challenge = {
  title: "Sorting with Comparators (Comparable Pattern)",
  description:
    "Implement `sortStudents` to sort an array of student objects by GPA descending, then name ascending as a tiebreaker — the JavaScript equivalent of implementing `Comparable`. Also implement `frequencyCount` using a Map.",
  starterCode: `// 1. Sort students by GPA descending, then name ascending (tiebreaker)
// Each student: { name: string, gpa: number }
function sortStudents(students) {
  // TODO: return a sorted copy (don't mutate the original)
  // Primary sort: GPA descending (higher GPA first)
  // Tiebreaker: name ascending (A before Z)
  // Hint: use .slice() to copy, then .sort() with a comparator
}

// 2. Count how many times each value appears in an array
// Return a Map where keys are values and values are counts
// e.g. [1, 2, 1, 3, 2, 1] → Map { 1 => 3, 2 => 2, 3 => 1 }
function frequencyCount(arr) {
  // TODO: use a Map to count occurrences
}

// 3. Find the student with the highest GPA (no sort allowed)
function topStudent(students) {
  // TODO: iterate and track the maximum
  // Return the student object with the highest GPA
}`,
  testCases: [
    {
      description: "sortStudents sorts by GPA descending",
      runnerCode: `
const students = [
  { name: "Alice", gpa: 3.2 },
  { name: "Bob", gpa: 3.8 },
  { name: "Carol", gpa: 3.5 },
];
const sorted = sortStudents(students);
return sorted[0].name === "Bob" && sorted[1].name === "Carol" && sorted[2].name === "Alice";
`,
    },
    {
      description: "sortStudents uses name as tiebreaker (ascending)",
      runnerCode: `
const students = [
  { name: "Zara", gpa: 3.5 },
  { name: "Alice", gpa: 3.5 },
  { name: "Bob", gpa: 3.5 },
];
const sorted = sortStudents(students);
return sorted[0].name === "Alice" && sorted[1].name === "Bob" && sorted[2].name === "Zara";
`,
    },
    {
      description: "sortStudents does not mutate original array",
      runnerCode: `
const students = [
  { name: "Alice", gpa: 3.2 },
  { name: "Bob", gpa: 3.8 },
];
const original = [...students];
sortStudents(students);
return students[0].name === original[0].name;
`,
    },
    {
      description: "frequencyCount counts correctly",
      runnerCode: `
const map = frequencyCount([1, 2, 1, 3, 2, 1]);
return map.get(1) === 3 && map.get(2) === 2 && map.get(3) === 1;
`,
    },
    {
      description: "topStudent returns highest GPA student",
      runnerCode: `
const students = [
  { name: "Alice", gpa: 3.2 },
  { name: "Bob", gpa: 3.9 },
  { name: "Carol", gpa: 3.5 },
];
return topStudent(students).name === "Bob";
`,
    },
  ],
};
