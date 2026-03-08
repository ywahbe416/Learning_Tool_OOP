import type { Challenge } from "@/types/challenge";

export const challenge: Challenge = {
  title: "Implement Core Algorithm Patterns",
  description:
    "Cover the main strategies from the lesson: linear search, binary search, two pointers, hashing, sliding window, merge sort, and dynamic programming.",
  starterCode: `import java.util.*;

public class Algorithms {

    // 1. Linear Search - O(n) - works on unsorted arrays
    // Return the index of target, or -1 if not found
    public static int linearSearch(int[] arr, int target) {
        // TODO: scan left to right
    }

    // 2. Binary Search - O(log n) - sorted array only
    // Return the index of target, or -1 if not found
    public static int binarySearch(int[] arr, int target) {
        // TODO: iterative approach with low/high pointers
    }

    // 3. Two Pointers - sorted array only
    // Return the indices of a pair that sums to target, or an empty array if none exist
    public static int[] twoSumSorted(int[] arr, int target) {
        // TODO: use left and right pointers
    }

    // 4. Hashing pattern - unsorted array
    // Return the indices of a pair that sums to target
    public static int[] twoSum(int[] nums, int target) {
        // TODO: use a HashMap for O(1) lookup
    }

    // 5. Sliding Window - O(n)
    // Return the maximum sum of any contiguous subarray of size k
    public static int maxWindowSum(int[] arr, int k) {
        // TODO: compute first window, then slide by add/subtract
    }

    // 6. Merge Sort - O(n log n)
    // Return a NEW sorted array without mutating the input
    public static int[] mergeSort(int[] arr) {
        // TODO: split, recursively sort, then merge
    }

    private static int[] merge(int[] left, int[] right) {
        // TODO: merge two sorted arrays into one sorted result
    }

    // 7. Dynamic Programming
    // Return the number of ways to climb n stairs if you can take 1 or 2 steps
    public static int climbStairs(int n) {
        // TODO: bottom-up DP
    }
}`,
  testCases: [
    {
      description: "linearSearch works on unsorted arrays",
      wrapperCode: `
boolean pass = Algorithms.linearSearch(new int[]{9, 4, 2, 7}, 2) == 2
            && Algorithms.linearSearch(new int[]{9, 4, 2, 7}, 8) == -1;
System.out.println(pass ? "PASS" : "FAIL");
`,
    },
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
      description: "twoSumSorted uses two pointers on sorted input",
      wrapperCode: `
int[] result = Algorithms.twoSumSorted(new int[]{1, 2, 3, 4, 6}, 6);
boolean pass = result.length == 2 && result[0] == 1 && result[1] == 3;
System.out.println(pass ? "PASS" : "FAIL: got " + Arrays.toString(result));
`,
    },
    {
      description: "twoSum uses HashMap on unsorted input",
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
    {
      description: "climbStairs uses dynamic programming recurrence",
      wrapperCode: `
boolean pass = Algorithms.climbStairs(1) == 1
            && Algorithms.climbStairs(2) == 2
            && Algorithms.climbStairs(5) == 8;
System.out.println(pass ? "PASS" : "FAIL");
`,
    },
  ],
};
