import type { Challenge } from "@/types/challenge";

export const challenge: Challenge = {
  title: "Implement a Stack and Queue",
  description:
    "Build a Stack (LIFO) and a Queue (FIFO) from scratch using ArrayLists. Then implement isBalanced() — a classic stack application that checks if brackets are properly matched.",
  starterCode: `import java.util.ArrayList;

public class Stack<T> {
    private ArrayList<T> items = new ArrayList<>();

    public void push(T item) {
        // TODO: add item to top
    }

    public T pop() {
        // TODO: remove and return top item (return null if empty)
    }

    public T peek() {
        // TODO: return top item without removing (return null if empty)
    }

    public boolean isEmpty() {
        // TODO: return true if empty
    }

    public int size() {
        return items.size();
    }
}

class Queue<T> {
    private ArrayList<T> items = new ArrayList<>();

    public void enqueue(T item) {
        // TODO: add item to the rear
    }

    public T dequeue() {
        // TODO: remove and return front item (return null if empty)
    }

    public T peek() {
        // TODO: return front item without removing (return null if empty)
    }

    public boolean isEmpty() {
        // TODO: return true if empty
    }

    public int size() {
        return items.size();
    }
}

class Brackets {
    // Check if brackets are balanced: "({[]})" → true, "({[})" → false
    public static boolean isBalanced(String str) {
        // TODO: use a Stack<Character>
        // Push opening brackets: ( { [
        // For closing brackets: ) } ] — pop and check if it matches the opener
        // Return true only if stack is empty at the end
    }
}`,
  testCases: [
    {
      description: "Stack: push and pop work (LIFO)",
      wrapperCode: `
Stack<Integer> s = new Stack<>();
s.push(1); s.push(2); s.push(3);
boolean pass = s.pop() == 3 && s.pop() == 2 && s.size() == 1;
System.out.println(pass ? "PASS" : "FAIL");
`,
    },
    {
      description: "Stack: isEmpty and peek work",
      wrapperCode: `
Stack<Integer> s = new Stack<>();
if (!s.isEmpty()) { System.out.println("FAIL: should be empty"); return; }
s.push(42);
boolean pass = s.peek() == 42 && !s.isEmpty() && s.size() == 1;
System.out.println(pass ? "PASS" : "FAIL");
`,
    },
    {
      description: "Queue: enqueue and dequeue work (FIFO)",
      wrapperCode: `
Queue<String> q = new Queue<>();
q.enqueue("a"); q.enqueue("b"); q.enqueue("c");
boolean pass = q.dequeue().equals("a") && q.dequeue().equals("b") && q.size() == 1;
System.out.println(pass ? "PASS" : "FAIL");
`,
    },
    {
      description: "Queue: isEmpty and peek work",
      wrapperCode: `
Queue<Integer> q = new Queue<>();
if (!q.isEmpty()) { System.out.println("FAIL: should be empty"); return; }
q.enqueue(99);
boolean pass = q.peek() == 99 && !q.isEmpty();
System.out.println(pass ? "PASS" : "FAIL");
`,
    },
    {
      description: "isBalanced: balanced brackets return true",
      wrapperCode: `
boolean pass = Brackets.isBalanced("({[]})") && Brackets.isBalanced("") && Brackets.isBalanced("()[]{}");
System.out.println(pass ? "PASS" : "FAIL");
`,
    },
    {
      description: "isBalanced: unbalanced brackets return false",
      wrapperCode: `
boolean pass = !Brackets.isBalanced("({[})]") && !Brackets.isBalanced("(((") && !Brackets.isBalanced(")");
System.out.println(pass ? "PASS" : "FAIL");
`,
    },
  ],
};
