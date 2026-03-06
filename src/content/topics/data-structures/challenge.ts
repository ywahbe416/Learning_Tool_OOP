import type { Challenge } from "@/types/challenge";

export const challenge: Challenge = {
  title: "Implement a Stack and Queue",
  description:
    "Build a `Stack` (LIFO) and a `Queue` (FIFO) from scratch using arrays. Then implement `isBalanced` — a classic stack application that checks if brackets are properly matched.",
  starterCode: `class Stack {
  constructor() { this.items = []; }

  push(item) {
    // TODO: add item to top
  }

  pop() {
    // TODO: remove and return top item (return undefined if empty)
  }

  peek() {
    // TODO: return top item without removing
  }

  isEmpty() {
    // TODO: return true if empty
  }

  get size() {
    return this.items.length;
  }
}

class Queue {
  constructor() { this.items = []; }

  enqueue(item) {
    // TODO: add item to the rear
  }

  dequeue() {
    // TODO: remove and return front item (return undefined if empty)
  }

  peek() {
    // TODO: return front item without removing
  }

  isEmpty() {
    // TODO: return true if empty
  }

  get size() {
    return this.items.length;
  }
}

// Classic stack use-case: check if brackets are balanced
// "({[]})" → true
// "({[})" → false
// "" → true
function isBalanced(str) {
  // TODO: use a Stack
  // Push opening brackets: ( { [
  // For closing brackets: ) } ]  — pop and check if it matches
  // Return true only if stack is empty at the end
}`,
  testCases: [
    {
      description: "Stack: push and pop work (LIFO)",
      runnerCode: `
const s = new Stack();
s.push(1); s.push(2); s.push(3);
return s.pop() === 3 && s.pop() === 2 && s.size === 1;
`,
    },
    {
      description: "Stack: isEmpty and peek work",
      runnerCode: `
const s = new Stack();
if (!s.isEmpty()) return false;
s.push(42);
return s.peek() === 42 && !s.isEmpty() && s.size === 1;
`,
    },
    {
      description: "Queue: enqueue and dequeue work (FIFO)",
      runnerCode: `
const q = new Queue();
q.enqueue("a"); q.enqueue("b"); q.enqueue("c");
return q.dequeue() === "a" && q.dequeue() === "b" && q.size === 1;
`,
    },
    {
      description: "Queue: isEmpty and peek work",
      runnerCode: `
const q = new Queue();
if (!q.isEmpty()) return false;
q.enqueue(99);
return q.peek() === 99 && !q.isEmpty();
`,
    },
    {
      description: "isBalanced: balanced brackets return true",
      runnerCode: `
return isBalanced("({[]})") === true && isBalanced("") === true && isBalanced("()[]{}") === true;
`,
    },
    {
      description: "isBalanced: unbalanced brackets return false",
      runnerCode: `
return isBalanced("({[})]") === false && isBalanced("(((") === false && isBalanced(")") === false;
`,
    },
  ],
};
