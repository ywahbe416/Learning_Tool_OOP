import type { Challenge } from "@/types/challenge";

export const challenge: Challenge = {
  title: "Build a Core Data Structure Toolkit",
  description:
    "Implement key patterns from the lesson: Stack, Queue, HashMap frequency counting, HashSet duplicate detection, BST search, and BFS graph traversal.",
  starterCode: `import java.util.*;

public class Stack<T> {
    private ArrayList<T> items = new ArrayList<>();

    public void push(T item) {
        // TODO: add item to the top
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

class Maps {
    // Count occurrences of each value in arr
    public static HashMap<Integer, Integer> frequencyCount(int[] arr) {
        // TODO: use a HashMap<Integer, Integer>
    }

    // Return true if any value appears more than once
    public static boolean hasDuplicates(int[] arr) {
        // TODO: use a HashSet<Integer>
    }
}

class TreeNode {
    int value;
    TreeNode left;
    TreeNode right;

    TreeNode(int value) {
        this.value = value;
    }
}

class Trees {
    // Search a Binary Search Tree for target
    public static boolean bstSearch(TreeNode root, int target) {
        // TODO: use the BST property:
        // target < node.value -> go left
        // target > node.value -> go right
    }
}

class Graphs {
    // Breadth-first traversal order from start
    public static ArrayList<String> bfsOrder(HashMap<String, List<String>> graph, String start) {
        // TODO: use a queue and a visited set
        // Return nodes in BFS visit order
    }
}`,
  testCases: [
    {
      description: "Stack: push, pop, and peek work with LIFO order",
      wrapperCode: `
Stack<Integer> s = new Stack<>();
s.push(1); s.push(2); s.push(3);
boolean pass = s.peek() == 3 && s.pop() == 3 && s.pop() == 2 && s.size() == 1;
System.out.println(pass ? "PASS" : "FAIL");
`,
    },
    {
      description: "Queue: enqueue, dequeue, and peek work with FIFO order",
      wrapperCode: `
Queue<String> q = new Queue<>();
q.enqueue("a"); q.enqueue("b"); q.enqueue("c");
boolean pass = q.peek().equals("a") && q.dequeue().equals("a") && q.dequeue().equals("b") && q.size() == 1;
System.out.println(pass ? "PASS" : "FAIL");
`,
    },
    {
      description: "frequencyCount counts values correctly with HashMap",
      wrapperCode: `
HashMap<Integer, Integer> counts = Maps.frequencyCount(new int[]{4, 1, 4, 2, 4, 2});
boolean pass = counts.get(4) == 3 && counts.get(2) == 2 && counts.get(1) == 1;
System.out.println(pass ? "PASS" : "FAIL: got " + counts);
`,
    },
    {
      description: "hasDuplicates detects repeated values with HashSet",
      wrapperCode: `
boolean pass = Maps.hasDuplicates(new int[]{1, 2, 3, 2}) && !Maps.hasDuplicates(new int[]{5, 6, 7});
System.out.println(pass ? "PASS" : "FAIL");
`,
    },
    {
      description: "bstSearch finds existing values",
      wrapperCode: `
TreeNode root = new TreeNode(8);
root.left = new TreeNode(3);
root.right = new TreeNode(10);
root.left.left = new TreeNode(1);
root.left.right = new TreeNode(6);
root.right.right = new TreeNode(14);
boolean pass = Trees.bstSearch(root, 6) && Trees.bstSearch(root, 14);
System.out.println(pass ? "PASS" : "FAIL");
`,
    },
    {
      description: "bstSearch returns false for missing values",
      wrapperCode: `
TreeNode root = new TreeNode(8);
root.left = new TreeNode(3);
root.right = new TreeNode(10);
root.left.left = new TreeNode(1);
root.left.right = new TreeNode(6);
root.right.right = new TreeNode(14);
System.out.println(!Trees.bstSearch(root, 7) ? "PASS" : "FAIL");
`,
    },
    {
      description: "bfsOrder traverses a graph level by level",
      wrapperCode: `
HashMap<String, List<String>> graph = new HashMap<>();
graph.put("A", Arrays.asList("B", "C"));
graph.put("B", Arrays.asList("A", "D"));
graph.put("C", Arrays.asList("A", "E"));
graph.put("D", Arrays.asList("B"));
graph.put("E", Arrays.asList("C"));
ArrayList<String> order = Graphs.bfsOrder(graph, "A");
System.out.println(order.equals(new ArrayList<>(Arrays.asList("A", "B", "C", "D", "E"))) ? "PASS" : "FAIL: got " + order);
`,
    },
  ],
};
