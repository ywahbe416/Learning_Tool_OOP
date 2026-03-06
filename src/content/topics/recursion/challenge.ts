import type { Challenge } from "@/types/challenge";

export const challenge: Challenge = {
  title: "Implement Classic Recursive Functions",
  description:
    "Implement `factorial(n)`, `fibonacci(n)`, and `binarySearch(arr, target)` using recursion. Each must have a correct base case or it will cause a stack overflow.",
  starterCode: `// 1. Factorial: n! = n * (n-1) * ... * 1, with 0! = 1
function factorial(n) {
  // TODO: implement recursively
  // Base case: n <= 1 returns 1
  // Recursive case: n * factorial(n - 1)
}

// 2. Fibonacci: fib(n) = fib(n-1) + fib(n-2), fib(0)=0, fib(1)=1
function fibonacci(n) {
  // TODO: implement recursively
  // Base cases: n <= 0 returns 0, n === 1 returns 1
  // Recursive case: fibonacci(n-1) + fibonacci(n-2)
}

// 3. Binary Search: find target index in a SORTED array, return -1 if not found
function binarySearch(arr, target, low = 0, high = arr.length - 1) {
  // TODO: implement recursively
  // Base case: low > high → return -1
  // Find mid = Math.floor((low + high) / 2)
  // If arr[mid] === target → return mid
  // If arr[mid] < target → search right half
  // Else → search left half
}`,
  testCases: [
    {
      description: "factorial(5) === 120",
      runnerCode: `return factorial(5) === 120;`,
    },
    {
      description: "factorial(0) === 1",
      runnerCode: `return factorial(0) === 1;`,
    },
    {
      description: "fibonacci(6) === 8",
      runnerCode: `return fibonacci(6) === 8;`,
    },
    {
      description: "fibonacci(0) === 0 and fibonacci(1) === 1",
      runnerCode: `return fibonacci(0) === 0 && fibonacci(1) === 1;`,
    },
    {
      description: "binarySearch finds existing element",
      runnerCode: `
const arr = [2, 5, 8, 12, 16, 23, 38, 56];
return binarySearch(arr, 23) === 5;
`,
    },
    {
      description: "binarySearch returns -1 for missing element",
      runnerCode: `
const arr = [2, 5, 8, 12, 16, 23, 38, 56];
return binarySearch(arr, 99) === -1;
`,
    },
  ],
};
