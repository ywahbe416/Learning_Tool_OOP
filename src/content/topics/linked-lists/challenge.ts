import type { Challenge } from "@/types/challenge";

export const challenge: Challenge = {
  title: "Implement a Singly Linked List",
  description:
    "Complete the Node and LinkedList classes. Implement insertAtHead(int), insertAtTail(int), delete(int), and toArray() methods.",
  starterCode: `import java.util.ArrayList;

public class Node {
    int value;
    Node next;

    public Node(int value) {
        this.value = value;
        this.next = null;
    }
}

class LinkedList {
    private Node head;
    private int size;

    public LinkedList() {
        this.head = null;
        this.size = 0;
    }

    // Insert a new node at the beginning of the list
    public void insertAtHead(int value) {
        // TODO: create new Node, point its next to current head, update head
    }

    // Insert a new node at the end of the list
    public void insertAtTail(int value) {
        // TODO: create new Node, traverse to end, append
    }

    // Remove the first node with the given value
    public void delete(int value) {
        // TODO: handle head deletion, then traverse and unlink
    }

    // Return an ArrayList of all node values in order
    public ArrayList<Integer> toArray() {
        // TODO: traverse and collect values
    }

    public int getSize() { return size; }
}`,
  testCases: [
    {
      description: "insertAtHead adds nodes to front",
      wrapperCode: `
LinkedList list = new LinkedList();
list.insertAtHead(1); list.insertAtHead(2); list.insertAtHead(3);
ArrayList<Integer> arr = list.toArray();
boolean pass = arr.get(0) == 3 && arr.get(1) == 2 && arr.get(2) == 1;
System.out.println(pass ? "PASS" : "FAIL: got " + arr);
`,
    },
    {
      description: "insertAtTail adds nodes to back",
      wrapperCode: `
LinkedList list = new LinkedList();
list.insertAtTail(1); list.insertAtTail(2); list.insertAtTail(3);
ArrayList<Integer> arr = list.toArray();
boolean pass = arr.get(0) == 1 && arr.get(1) == 2 && arr.get(2) == 3;
System.out.println(pass ? "PASS" : "FAIL: got " + arr);
`,
    },
    {
      description: "delete removes middle node",
      wrapperCode: `
LinkedList list = new LinkedList();
list.insertAtTail(1); list.insertAtTail(2); list.insertAtTail(3);
list.delete(2);
ArrayList<Integer> arr = list.toArray();
boolean pass = arr.size() == 2 && arr.get(0) == 1 && arr.get(1) == 3;
System.out.println(pass ? "PASS" : "FAIL: got " + arr);
`,
    },
    {
      description: "delete removes head node",
      wrapperCode: `
LinkedList list = new LinkedList();
list.insertAtTail(1); list.insertAtTail(2); list.insertAtTail(3);
list.delete(1);
ArrayList<Integer> arr = list.toArray();
boolean pass = arr.size() == 2 && arr.get(0) == 2 && arr.get(1) == 3;
System.out.println(pass ? "PASS" : "FAIL: got " + arr);
`,
    },
    {
      description: "size tracks correctly after inserts",
      wrapperCode: `
LinkedList list = new LinkedList();
list.insertAtHead(1); list.insertAtTail(2); list.insertAtHead(0);
System.out.println(list.getSize() == 3 ? "PASS" : "FAIL: expected 3, got " + list.getSize());
`,
    },
  ],
};
