import type { Challenge } from "@/types/challenge";

export const challenge: Challenge = {
  title: "Implement Classic Recursive Methods",
  description:
    "Implement factorial(n), fibonacci(n), and binarySearch(int[], int) using recursion. Each must have a correct base case — no loops allowed.",
  starterCode: `public class Recursion {

    // 1. Factorial: n! = n * (n-1) * ... * 1, with 0! = 1
    public static long factorial(int n) {
        // TODO: base case: n <= 1 returns 1
        // TODO: recursive case: n * factorial(n - 1)
    }

    // 2. Fibonacci: fib(n) = fib(n-1) + fib(n-2), fib(0)=0, fib(1)=1
    public static long fibonacci(int n) {
        // TODO: base cases: n <= 0 returns 0, n == 1 returns 1
        // TODO: recursive case: fibonacci(n-1) + fibonacci(n-2)
    }

    // 3. Binary Search on a SORTED array — return index of target, or -1 if not found
    public static int binarySearch(int[] arr, int target, int low, int high) {
        // TODO: base case: low > high → return -1
        // TODO: find mid = (low + high) / 2
        // TODO: if arr[mid] == target → return mid
        // TODO: if arr[mid] < target → search right half
        // TODO: else → search left half
    }

    // Convenience overload — call this version from tests
    public static int binarySearch(int[] arr, int target) {
        return binarySearch(arr, target, 0, arr.length - 1);
    }
}`,
  testCases: [
    {
      description: "factorial(5) == 120",
      wrapperCode: `
System.out.println(Recursion.factorial(5) == 120 ? "PASS" : "FAIL: got " + Recursion.factorial(5));
`,
    },
    {
      description: "factorial(0) == 1",
      wrapperCode: `
System.out.println(Recursion.factorial(0) == 1 ? "PASS" : "FAIL: got " + Recursion.factorial(0));
`,
    },
    {
      description: "fibonacci(6) == 8",
      wrapperCode: `
System.out.println(Recursion.fibonacci(6) == 8 ? "PASS" : "FAIL: got " + Recursion.fibonacci(6));
`,
    },
    {
      description: "fibonacci(0)==0 and fibonacci(1)==1",
      wrapperCode: `
boolean pass = Recursion.fibonacci(0) == 0 && Recursion.fibonacci(1) == 1;
System.out.println(pass ? "PASS" : "FAIL: fib(0)=" + Recursion.fibonacci(0) + " fib(1)=" + Recursion.fibonacci(1));
`,
    },
    {
      description: "binarySearch finds existing element",
      wrapperCode: `
int[] arr = {2, 5, 8, 12, 16, 23, 38, 56};
int idx = Recursion.binarySearch(arr, 23);
System.out.println(idx == 5 ? "PASS" : "FAIL: expected 5, got " + idx);
`,
    },
    {
      description: "binarySearch returns -1 for missing element",
      wrapperCode: `
int[] arr = {2, 5, 8, 12, 16, 23, 38, 56};
int idx = Recursion.binarySearch(arr, 99);
System.out.println(idx == -1 ? "PASS" : "FAIL: expected -1, got " + idx);
`,
    },
  ],
};
