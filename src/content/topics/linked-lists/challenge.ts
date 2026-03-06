export interface TestCase {
  description: string;
  runnerCode: string;
  expected: unknown;
}

export interface Challenge {
  title: string;
  description: string;
  starterCode: string;
  testCases: TestCase[];
}

export const challenge: Challenge = {
  title: "Implement a Singly Linked List",
  description:
    "Complete the `Node` and `LinkedList` classes. Implement `insertAtHead(value)`, `insertAtTail(value)`, `delete(value)`, and `toArray()` methods.",
  starterCode: `class Node {
  constructor(value) {
    this.value = value;
    this.next = null;
  }
}

class LinkedList {
  constructor() {
    this.head = null;
    this.size = 0;
  }

  // Insert a new node at the beginning of the list
  insertAtHead(value) {
    // TODO: implement
  }

  // Insert a new node at the end of the list
  insertAtTail(value) {
    // TODO: implement
  }

  // Remove the first node with the given value
  delete(value) {
    // TODO: implement
  }

  // Return an array of all node values in order
  toArray() {
    // TODO: implement
  }
}`,
  testCases: [
    {
      description: "insertAtHead adds node to front",
      expected: [3, 2, 1],
      runnerCode: `
const list = new LinkedList();
list.insertAtHead(1);
list.insertAtHead(2);
list.insertAtHead(3);
return JSON.stringify(list.toArray()) === JSON.stringify([3, 2, 1]);
`,
    },
    {
      description: "insertAtTail adds node to back",
      expected: [1, 2, 3],
      runnerCode: `
const list = new LinkedList();
list.insertAtTail(1);
list.insertAtTail(2);
list.insertAtTail(3);
return JSON.stringify(list.toArray()) === JSON.stringify([1, 2, 3]);
`,
    },
    {
      description: "delete removes middle node",
      expected: [1, 3],
      runnerCode: `
const list = new LinkedList();
list.insertAtTail(1);
list.insertAtTail(2);
list.insertAtTail(3);
list.delete(2);
return JSON.stringify(list.toArray()) === JSON.stringify([1, 3]);
`,
    },
    {
      description: "delete removes head node",
      expected: [2, 3],
      runnerCode: `
const list = new LinkedList();
list.insertAtTail(1);
list.insertAtTail(2);
list.insertAtTail(3);
list.delete(1);
return JSON.stringify(list.toArray()) === JSON.stringify([2, 3]);
`,
    },
    {
      description: "size tracks correctly after inserts",
      expected: 3,
      runnerCode: `
const list = new LinkedList();
list.insertAtHead(1);
list.insertAtTail(2);
list.insertAtHead(0);
return list.size === 3;
`,
    },
  ],
};
