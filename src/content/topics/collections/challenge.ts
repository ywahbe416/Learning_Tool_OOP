import type { Challenge } from "@/types/challenge";

export const challenge: Challenge = {
  title: "Sorting with Comparators & HashMap",
  description:
    "Implement sortStudents() to sort a Student array by GPA descending, then name ascending as a tiebreaker — Java's Comparator pattern. Also implement frequencyCount() using a HashMap, and topStudent() without sorting.",
  starterCode: `import java.util.*;

public class Collections {

    // Student record — do not modify
    static class Student {
        String name;
        double gpa;
        Student(String name, double gpa) { this.name = name; this.gpa = gpa; }
    }

    // 1. Sort students by GPA descending, then name ascending (tiebreaker)
    // Return a new sorted array — do NOT mutate the original
    public static Student[] sortStudents(Student[] students) {
        // TODO: copy the array, then Arrays.sort with a Comparator
        // Primary: higher GPA first  → Double.compare(b.gpa, a.gpa)
        // Tiebreaker: a.name.compareTo(b.name)
    }

    // 2. Count occurrences of each value in the array
    // Return a HashMap<Integer, Integer> mapping value → count
    public static HashMap<Integer, Integer> frequencyCount(int[] arr) {
        // TODO: iterate and use map.getOrDefault(val, 0) + 1
    }

    // 3. Find and return the student with the highest GPA (no sorting)
    public static Student topStudent(Student[] students) {
        // TODO: iterate and track the maximum
    }
}`,
  testCases: [
    {
      description: "sortStudents sorts by GPA descending",
      wrapperCode: `
Collections.Student[] students = {
    new Collections.Student("Alice", 3.2),
    new Collections.Student("Bob", 3.8),
    new Collections.Student("Carol", 3.5)
};
Collections.Student[] sorted = Collections.sortStudents(students);
boolean pass = sorted[0].name.equals("Bob") && sorted[1].name.equals("Carol") && sorted[2].name.equals("Alice");
System.out.println(pass ? "PASS" : "FAIL: wrong order");
`,
    },
    {
      description: "sortStudents uses name as tiebreaker (ascending)",
      wrapperCode: `
Collections.Student[] students = {
    new Collections.Student("Zara", 3.5),
    new Collections.Student("Alice", 3.5),
    new Collections.Student("Bob", 3.5)
};
Collections.Student[] sorted = Collections.sortStudents(students);
boolean pass = sorted[0].name.equals("Alice") && sorted[1].name.equals("Bob") && sorted[2].name.equals("Zara");
System.out.println(pass ? "PASS" : "FAIL: tiebreaker wrong, got " + sorted[0].name);
`,
    },
    {
      description: "sortStudents does not mutate original array",
      wrapperCode: `
Collections.Student[] students = {
    new Collections.Student("Alice", 3.2),
    new Collections.Student("Bob", 3.8)
};
String firstName = students[0].name;
Collections.sortStudents(students);
System.out.println(students[0].name.equals(firstName) ? "PASS" : "FAIL: original array was mutated");
`,
    },
    {
      description: "frequencyCount counts correctly",
      wrapperCode: `
HashMap<Integer,Integer> map = Collections.frequencyCount(new int[]{1, 2, 1, 3, 2, 1});
boolean pass = map.get(1) == 3 && map.get(2) == 2 && map.get(3) == 1;
System.out.println(pass ? "PASS" : "FAIL: counts wrong");
`,
    },
    {
      description: "topStudent returns student with highest GPA",
      wrapperCode: `
Collections.Student[] students = {
    new Collections.Student("Alice", 3.2),
    new Collections.Student("Bob", 3.9),
    new Collections.Student("Carol", 3.5)
};
System.out.println(Collections.topStudent(students).name.equals("Bob") ? "PASS" : "FAIL");
`,
    },
  ],
};
