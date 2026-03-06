import type { Challenge } from "@/types/challenge";

export const challenge: Challenge = {
  title: "Core Algorithm Patterns",
  description:
    "Implement four essential patterns: binary search (O(log n)), Two Sum with hashing (O(n)), max sliding window sum, and merge sort. Each tests a different algorithmic thinking pattern.",
  starterCode: `// 1. Binary Search — O(log n) — sorted array only
// Return the INDEX of target, or -1 if not found
function binarySearch(arr, target) {
  // TODO: iterative approach
  // Use low/high pointers, find mid, adjust based on comparison
}

// 2. Two Sum — find INDICES of two numbers that add to target — O(n)
// Use a Map for O(1) lookup (not nested loops)
// e.g. twoSum([2,7,11,15], 9) → [0, 1]
function twoSum(nums, target) {
  // TODO: use a Map to store value → index as you iterate
}

// 3. Max Sliding Window Sum — O(n)
// Find the maximum sum of any contiguous subarray of size k
// e.g. maxWindowSum([2,1,5,1,3,2], 3) → 9 (subarray [5,1,3])
function maxWindowSum(arr, k) {
  // TODO: compute first window, then slide: add new element, remove old
}

// 4. Merge Sort — O(n log n)
// Return a NEW sorted array (do not mutate the input)
function mergeSort(arr) {
  // TODO: base case: arr.length <= 1, return arr
  // Split in half, recursively sort each half, merge
}`,
  testCases: [
    {
      description: "binarySearch finds element in sorted array",
      runnerCode: `
const arr = [1, 3, 5, 7, 9, 11, 13];
return binarySearch(arr, 7) === 3 && binarySearch(arr, 1) === 0;
`,
    },
    {
      description: "binarySearch returns -1 for missing element",
      runnerCode: `
return binarySearch([1, 3, 5, 7], 4) === -1 && binarySearch([], 1) === -1;
`,
    },
    {
      description: "twoSum finds correct indices using hashing",
      runnerCode: `
const result = twoSum([2, 7, 11, 15], 9);
return Array.isArray(result) && result[0] === 0 && result[1] === 1;
`,
    },
    {
      description: "twoSum handles non-adjacent pairs",
      runnerCode: `
const result = twoSum([3, 2, 4], 6);
return Array.isArray(result) && result[0] === 1 && result[1] === 2;
`,
    },
    {
      description: "maxWindowSum finds maximum window",
      runnerCode: `
return maxWindowSum([2,1,5,1,3,2], 3) === 9 && maxWindowSum([1,2,3,4,5], 2) === 9;
`,
    },
    {
      description: "mergeSort returns correctly sorted array",
      runnerCode: `
const input = [38, 27, 43, 3, 9, 82, 10];
const sorted = mergeSort(input);
const expected = [3, 9, 10, 27, 38, 43, 82];
return JSON.stringify(sorted) === JSON.stringify(expected) &&
       JSON.stringify(input) === JSON.stringify([38,27,43,3,9,82,10]); // not mutated
`,
    },
  ],
};
