import type { Challenge } from "@/types/challenge";

export const challenge: Challenge = {
  title: "Build a Validated Stack with Custom Errors",
  description:
    "Create a custom `EmptyStackError` class that extends `Error`. Then implement a `Stack` class whose `pop()` and `peek()` throw `EmptyStackError` when the stack is empty.",
  starterCode: `class EmptyStackError extends Error {
  constructor() {
    // TODO: call super with message "Stack is empty"
    // TODO: set this.name = "EmptyStackError"
  }
}

class Stack {
  constructor() {
    this.items = [];
  }

  push(item) {
    // TODO: add item to the top of the stack
  }

  pop() {
    // TODO: remove and return the top item
    // throw EmptyStackError if stack is empty
  }

  peek() {
    // TODO: return top item WITHOUT removing it
    // throw EmptyStackError if stack is empty
  }

  isEmpty() {
    // TODO: return true if stack has no items
  }

  size() {
    // TODO: return number of items
  }
}`,
  testCases: [
    {
      description: "push and pop work correctly",
      runnerCode: `
const s = new Stack();
s.push(1);
s.push(2);
s.push(3);
return s.pop() === 3 && s.pop() === 2;
`,
    },
    {
      description: "peek returns top without removing",
      runnerCode: `
const s = new Stack();
s.push(10);
s.push(20);
const top = s.peek();
return top === 20 && s.size() === 2;
`,
    },
    {
      description: "pop throws EmptyStackError on empty stack",
      runnerCode: `
const s = new Stack();
try {
  s.pop();
  return false;
} catch (e) {
  return e instanceof EmptyStackError && e.name === "EmptyStackError";
}
`,
    },
    {
      description: "peek throws EmptyStackError on empty stack",
      runnerCode: `
const s = new Stack();
try {
  s.peek();
  return false;
} catch (e) {
  return e.message === "Stack is empty";
}
`,
    },
    {
      description: "isEmpty and size track correctly",
      runnerCode: `
const s = new Stack();
if (!s.isEmpty() || s.size() !== 0) return false;
s.push("a");
s.push("b");
if (s.isEmpty() || s.size() !== 2) return false;
s.pop();
return s.size() === 1;
`,
    },
  ],
};
