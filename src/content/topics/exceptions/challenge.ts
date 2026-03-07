import type { Challenge } from "@/types/challenge";

export const challenge: Challenge = {
  title: "Build a Validated Stack with Custom Exceptions",
  description:
    "Create a custom EmptyStackException that extends RuntimeException. Then implement a Stack class whose pop() and peek() throw EmptyStackException when the stack is empty.",
  starterCode: `import java.util.ArrayList;

public class EmptyStackException extends RuntimeException {
    public EmptyStackException() {
        // TODO: call super("Stack is empty")
    }
}

class Stack<T> {
    private ArrayList<T> items = new ArrayList<>();

    public void push(T item) {
        // TODO: add item to the top of the stack
    }

    public T pop() {
        // TODO: remove and return the top item
        // throw new EmptyStackException() if stack is empty
    }

    public T peek() {
        // TODO: return top item WITHOUT removing it
        // throw new EmptyStackException() if stack is empty
    }

    public boolean isEmpty() {
        // TODO: return true if stack has no items
    }

    public int size() {
        // TODO: return number of items
    }
}`,
  testCases: [
    {
      description: "push and pop work correctly (LIFO)",
      wrapperCode: `
Stack<Integer> s = new Stack<>();
s.push(1); s.push(2); s.push(3);
boolean pass = s.pop() == 3 && s.pop() == 2;
System.out.println(pass ? "PASS" : "FAIL: wrong pop order");
`,
    },
    {
      description: "peek returns top without removing",
      wrapperCode: `
Stack<Integer> s = new Stack<>();
s.push(10); s.push(20);
int top = s.peek();
boolean pass = top == 20 && s.size() == 2;
System.out.println(pass ? "PASS" : "FAIL: peek=" + top + " size=" + s.size());
`,
    },
    {
      description: "pop throws EmptyStackException on empty stack",
      wrapperCode: `
Stack<Integer> s = new Stack<>();
try {
    s.pop();
    System.out.println("FAIL: should have thrown");
} catch (EmptyStackException e) {
    System.out.println("PASS");
}
`,
    },
    {
      description: "peek throws EmptyStackException with correct message",
      wrapperCode: `
Stack<Integer> s = new Stack<>();
try {
    s.peek();
    System.out.println("FAIL: should have thrown");
} catch (EmptyStackException e) {
    System.out.println(e.getMessage().equals("Stack is empty") ? "PASS" : "FAIL: wrong message: " + e.getMessage());
}
`,
    },
    {
      description: "isEmpty and size track correctly",
      wrapperCode: `
Stack<String> s = new Stack<>();
if (!s.isEmpty() || s.size() != 0) { System.out.println("FAIL: should be empty"); return; }
s.push("a"); s.push("b");
if (s.isEmpty() || s.size() != 2) { System.out.println("FAIL: size should be 2"); return; }
s.pop();
System.out.println(s.size() == 1 ? "PASS" : "FAIL: expected size 1, got " + s.size());
`,
    },
  ],
};
