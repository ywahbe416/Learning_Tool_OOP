import type { Challenge } from "@/types/challenge";

export const challenge: Challenge = {
  title: "Core Algorithm Patterns",
  description:
    "Implement four essential patterns: binary search O(log n), Two Sum with HashMap O(n), max sliding window sum, and merge sort. Each tests a different algorithmic thinking pattern.",
  starterCode: `import java.util.*;

public class Algorithms {

    // 1. Binary Search — O(log n) — sorted array only
    // Return the INDEX of target, or -1 if not found
    public static int binarySearch(int[] arr, int target) {
        // TODO: iterative approach with low/high pointers
    }

    // 2. Two Sum — find INDICES of two numbers that sum to target — O(n)
    // Use a HashMap for O(1) lookup
    // e.g. twoSum(new int[]{2,7,11,15}, 9) → [0, 1]
    public static int[] twoSum(int[] nums, int target) {
        // TODO: store value → index in HashMap as you iterate
    }

    // 3. Max Sliding Window Sum — O(n)
    // Find the maximum sum of any contiguous subarray of size k
    // e.g. maxWindowSum(new int[]{2,1,5,1,3,2}, 3) → 9
    public static int maxWindowSum(int[] arr, int k) {
        // TODO: compute first window, then slide: add next element, subtract first
    }

    // 4. Merge Sort — O(n log n) — return a NEW sorted array, do not mutate input
    public static int[] mergeSort(int[] arr) {
        // TODO: base case arr.length <= 1, split, sort each half, merge
    }

    // Helper for mergeSort — merge two sorted arrays
    private static int[] merge(int[] left, int[] right) {
        // TODO: classic merge — compare heads, append remainder
    }
}`,
  testCases: [
    {
      description: "binarySearch finds element in sorted array",
      wrapperCode: `
int[] arr = {1, 3, 5, 7, 9, 11, 13};
boolean pass = Algorithms.binarySearch(arr, 7) == 3 && Algorithms.binarySearch(arr, 1) == 0;
System.out.println(pass ? "PASS" : "FAIL");
`,
    },
    {
      description: "binarySearch returns -1 for missing element",
      wrapperCode: `
boolean pass = Algorithms.binarySearch(new int[]{1,3,5,7}, 4) == -1
            && Algorithms.binarySearch(new int[]{}, 1) == -1;
System.out.println(pass ? "PASS" : "FAIL");
`,
    },
    {
      description: "twoSum finds correct indices using HashMap",
      wrapperCode: `
int[] result = Algorithms.twoSum(new int[]{2, 7, 11, 15}, 9);
boolean pass = result != null && result[0] == 0 && result[1] == 1;
System.out.println(pass ? "PASS" : "FAIL: got " + Arrays.toString(result));
`,
    },
    {
      description: "twoSum handles non-adjacent pairs",
      wrapperCode: `
int[] result = Algorithms.twoSum(new int[]{3, 2, 4}, 6);
boolean pass = result != null && result[0] == 1 && result[1] == 2;
System.out.println(pass ? "PASS" : "FAIL: got " + Arrays.toString(result));
`,
    },
    {
      description: "maxWindowSum finds maximum window",
      wrapperCode: `
boolean pass = Algorithms.maxWindowSum(new int[]{2,1,5,1,3,2}, 3) == 9
            && Algorithms.maxWindowSum(new int[]{1,2,3,4,5}, 2) == 9;
System.out.println(pass ? "PASS" : "FAIL");
`,
    },
    {
      description: "mergeSort returns sorted array without mutating input",
      wrapperCode: `
int[] input = {38, 27, 43, 3, 9, 82, 10};
int[] sorted = Algorithms.mergeSort(input);
int[] expected = {3, 9, 10, 27, 38, 43, 82};
boolean sortedOk = Arrays.equals(sorted, expected);
boolean notMutated = input[0] == 38;
System.out.println(sortedOk && notMutated ? "PASS" : "FAIL: sorted=" + Arrays.toString(sorted));
`,
    },
  ],
};
