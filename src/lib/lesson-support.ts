export interface ConceptCheckQuestion {
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface WorkedExample {
  title: string;
  summary: string;
  code: string;
  takeaways: string[];
}

export interface ChallengeHintTrack {
  title: string;
  matchText: string[];
  levels: [string, string, string];
}

export interface TopicLearningSupport {
  prerequisites: string[];
  foundation: string[];
  whatToNotice: string[];
  commonMistakes: string[];
  workedExample: WorkedExample;
  conceptChecks: ConceptCheckQuestion[];
  compileHints: [string, string, string];
  challengeHints: ChallengeHintTrack[];
  reflectionPrompt: string;
  reviewPrompt: string;
}

export const lessonSupportRegistry: Record<string, TopicLearningSupport> = {
  "oop-basics": {
    prerequisites: [],
    foundation: [
      "A class describes structure and behavior; it is not a runtime object.",
      "Each object stores its own field values even when the class is shared.",
      "Methods change state through the current object, not through the class itself.",
    ],
    whatToNotice: [
      "Constructor arguments become each account's starting state.",
      "Calling deposit() or withdraw() changes only the selected object.",
      "Private fields force callers to use methods instead of direct field access.",
    ],
    commonMistakes: [
      "Treating the class like a single shared object.",
      "Forgetting to guard against invalid amounts before updating balance.",
      "Returning the wrong string format from toString().",
    ],
    workedExample: {
      title: "Two cars, one blueprint",
      summary: "A class can create many objects, and each one keeps its own data.",
      code: `public class Car {
    private String model;

    public Car(String model) {
        this.model = model;
    }

    public String describe() {
        return "Car(" + model + ")";
    }
}

Car first = new Car("Civic");
Car second = new Car("Camry");
System.out.println(first.describe());
System.out.println(second.describe());`,
      takeaways: [
        "The class definition is reused, but the stored field values are different.",
        "Constructor code should initialize the fields the rest of the class depends on.",
      ],
    },
    conceptChecks: [
      {
        prompt: "If accountA deposits 50, what should happen to accountB?",
        options: [
          "Its balance changes too because both come from the same class",
          "Nothing changes because each object has its own state",
          "It resets to the constructor value",
        ],
        correctIndex: 1,
        explanation:
          "Classes are blueprints. Object fields live inside each individual instance, so changing one object does not mutate the others.",
      },
      {
        prompt: "Why are owner and balance private in BankAccount?",
        options: [
          "So outside code must use methods that can enforce rules",
          "So Java stores the values faster",
          "So constructors can be skipped",
        ],
        correctIndex: 0,
        explanation:
          "Private fields support encapsulation: the class controls how state is read and changed.",
      },
    ],
    compileHints: [
      "Start by matching every method signature exactly. Most compile errors come from a missing return, brace, or semicolon.",
      "Implement the constructor and getters first so the class compiles before you add behavior.",
      "If @Override is red, confirm the method name, return type, and parameter list match Java's toString() exactly.",
    ],
    challengeHints: [
      {
        title: "Constructor and getters",
        matchText: ["constructor", "owner", "initial balance"],
        levels: [
          "The first test only cares whether the fields were stored correctly.",
          "Inside the constructor, assign both parameters to the matching fields with this.field = parameter.",
          "If getOwner() or getBalance() is failing, return the field directly with no extra formatting or print statements.",
        ],
      },
      {
        title: "Deposit and withdraw rules",
        matchText: ["deposit", "withdraw", "insufficient funds"],
        levels: [
          "These methods should mutate balance only when the operation is valid.",
          "deposit() should ignore non-positive amounts. withdraw() should throw before subtracting if amount > balance.",
          "Use throw new IllegalArgumentException(\"Insufficient funds\") exactly, then subtract amount only in the valid path.",
        ],
      },
      {
        title: "String representation",
        matchText: ["toString", "format"],
        levels: [
          "The final test checks an exact string, not a similar one.",
          "Build the result as BankAccount[owner=Alice, balance=500.0] with brackets, commas, and labels in the same order.",
          "Do not add spaces around the equals signs or class name. The string should come from concatenation, not System.out.println.",
        ],
      },
    ],
    reflectionPrompt:
      "Which part of your BankAccount class protects the object's state, and what bug would appear if callers could edit balance directly?",
    reviewPrompt:
      "Explain why two BankAccount objects can hold different balances even though they share the same class definition.",
  },
  "advanced-oop": {
    prerequisites: ["oop-basics"],
    foundation: [
      "Inheritance models an IS-A relationship; composition models a HAS-A relationship.",
      "Method overriding lets a subclass provide specialized behavior through the same method name.",
      "Polymorphism means the method that runs depends on the actual object type at runtime.",
    ],
    whatToNotice: [
      "Dog and Cat both reuse Animal's structure but replace speak().",
      "A Person does not inherit from Animal; it owns an Animal reference instead.",
      "pet.speak() dispatches to Dog or Cat automatically through polymorphism.",
    ],
    commonMistakes: [
      "Using inheritance when the relationship is really composition.",
      "Forgetting to call super(...) in subclass constructors.",
      "Assuming polymorphism works only when the variable type is the subclass type.",
    ],
    workedExample: {
      title: "A manager is an employee",
      summary: "Use inheritance when the subtype really is a more specific version of the base type.",
      code: `class Employee {
    protected String name;

    Employee(String name) {
        this.name = name;
    }

    public String role() {
        return "Employee";
    }
}

class Manager extends Employee {
    Manager(String name) {
        super(name);
    }

    @Override
    public String role() {
        return "Manager";
    }
}`,
      takeaways: [
        "super(name) reuses the base class constructor instead of duplicating field setup.",
        "Calling role() through an Employee reference still reaches the Manager override at runtime.",
      ],
    },
    conceptChecks: [
      {
        prompt: "Which relationship is best modeled with composition?",
        options: [
          "Dog and Animal",
          "Car and Engine",
          "Square and Shape",
        ],
        correctIndex: 1,
        explanation:
          "A car has an engine, so the relationship is HAS-A. Composition is the better fit.",
      },
      {
        prompt: "What happens when Animal pet = new Dog(\"Rex\"); pet.speak() runs?",
        options: [
          "Animal.speak() always runs because the variable type is Animal",
          "Dog.speak() runs because the object is actually a Dog",
          "Java throws an error because the types differ",
        ],
        correctIndex: 1,
        explanation:
          "That is polymorphism. Java chooses the overridden method based on the real object type at runtime.",
      },
    ],
    compileHints: [
      "Make sure each class body is closed properly before starting the next one. Multi-class starter files fail fast on missing braces.",
      "Check constructor names and visibility. Dog(String name) and Cat(String name) should match the class names exactly.",
      "If a subclass cannot see name, confirm the base field stays protected rather than private.",
    ],
    challengeHints: [
      {
        title: "Base class behavior",
        matchText: ["animal base", "inheritance chain", "instance of animal"],
        levels: [
          "Start with Animal before touching the subclasses.",
          "Animal needs to store name, return name + \" makes a sound.\", and format toString() as Animal(name).",
          "If instanceof is failing, Dog must extend Animal and its constructor must call super(name).",
        ],
      },
      {
        title: "Subclass overrides",
        matchText: ["dog overrides", "cat overrides"],
        levels: [
          "Dog and Cat should reuse the base field but replace only the speak() behavior.",
          "Each override returns name + \" says: Woof!\" or name + \" says: Meow!\" exactly.",
          "Add @Override and confirm the method signature stays public String speak() with no parameters.",
        ],
      },
      {
        title: "Composition plus polymorphism",
        matchText: ["introducepet", "polymorphism"],
        levels: [
          "Person stores an Animal field, not a Dog-only or Cat-only field.",
          "The method should build a sentence using name, pet.name, and pet.speak().",
          "Use pet.speak() directly. That is the line where polymorphism happens.",
        ],
      },
    ],
    reflectionPrompt:
      "Where in your solution did inheritance help reduce duplication, and where did composition create a cleaner design than inheritance would have?",
    reviewPrompt:
      "Describe the difference between an IS-A relationship and a HAS-A relationship, then give one example of each from this topic.",
  },
  "exceptions": {
    prerequisites: ["oop-basics"],
    foundation: [
      "Exceptions represent abnormal program flow that should interrupt normal execution.",
      "Custom exceptions communicate intent better than generic RuntimeException use everywhere.",
      "Throwing and catching are different responsibilities: one signals failure, the other decides how to respond.",
    ],
    whatToNotice: [
      "pop() and peek() should fail immediately when the stack is empty.",
      "The exception message is part of the program's contract in this challenge.",
      "A valid Stack still performs normal LIFO behavior when no exception occurs.",
    ],
    commonMistakes: [
      "Returning null instead of throwing when the contract says to fail loudly.",
      "Throwing the right exception type but forgetting the required message.",
      "Catching the exception inside the Stack methods instead of letting callers handle it.",
    ],
    workedExample: {
      title: "Guard invalid division",
      summary: "Throw an exception at the boundary where invalid input is detected.",
      code: `public static int divide(int a, int b) {
    if (b == 0) {
        throw new IllegalArgumentException("Cannot divide by zero");
    }
    return a / b;
}`,
      takeaways: [
        "The method that detects the invalid state should throw immediately.",
        "Clear exception messages make debugging and testing much easier.",
      ],
    },
    conceptChecks: [
      {
        prompt: "When should pop() throw EmptyStackException?",
        options: [
          "Only after trying to remove an item and getting null",
          "As soon as the method sees the stack is empty",
          "Never; it should quietly return null",
        ],
        correctIndex: 1,
        explanation:
          "The stack method should validate its state first, then throw immediately when the operation is invalid.",
      },
      {
        prompt: "Why create EmptyStackException instead of always throwing RuntimeException?",
        options: [
          "Java requires every stack to define a custom exception",
          "A custom type communicates the exact failure more clearly",
          "Custom exceptions run faster than built-in ones",
        ],
        correctIndex: 1,
        explanation:
          "The specific type makes the error easier to understand, test, and catch intentionally.",
      },
    ],
    compileHints: [
      "Make sure EmptyStackException extends RuntimeException and its constructor calls super(...).",
      "If generic syntax is failing, verify Stack<T> appears in both the class declaration and method uses.",
      "size() must return an int expression. If it has no return statement, the whole file will fail to compile.",
    ],
    challengeHints: [
      {
        title: "Custom exception setup",
        matchText: ["message", "emptystackexception"],
        levels: [
          "The exception class is small: it mostly passes a message to the superclass.",
          "Inside the constructor, call super(\"Stack is empty\").",
          "If the message test fails, check capitalization and spacing exactly.",
        ],
      },
      {
        title: "Stack behavior",
        matchText: ["push and pop", "peek returns", "isempty", "size"],
        levels: [
          "Reuse the ArrayList instead of tracking a second manual size.",
          "The top of the stack is the last element in the list.",
          "pop() removes items.size() - 1, peek() reads that index without removing, and isEmpty() can return items.isEmpty().",
        ],
      },
      {
        title: "Throwing on empty access",
        matchText: ["throws emptystackexception", "empty stack"],
        levels: [
          "Both pop() and peek() need the same guard before they touch the list.",
          "Check items.isEmpty() first and throw new EmptyStackException() before any remove/get call.",
          "Do not catch the exception inside the method. The test expects the caller to receive it.",
        ],
      },
    ],
    reflectionPrompt:
      "Why is throwing an exception better here than returning null, and what kind of bug would null make easier to miss?",
    reviewPrompt:
      "Explain the difference between signaling an error with an exception and silently returning a placeholder value like null.",
  },
  "recursion": {
    prerequisites: ["oop-basics"],
    foundation: [
      "Every recursive method needs a base case that stops the calls.",
      "The recursive case must move toward the base case with smaller input.",
      "Recursive thinking works best when you trust the smaller subproblem to solve itself correctly.",
    ],
    whatToNotice: [
      "factorial() shrinks n by one on each call.",
      "fibonacci() has two base cases because two smallest answers are already known.",
      "Recursive binary search throws away half the search space each call.",
    ],
    commonMistakes: [
      "Writing a recursive call that does not reduce the problem size.",
      "Forgetting one base case in Fibonacci.",
      "Returning the recursive call result without combining it correctly with the current step.",
    ],
    workedExample: {
      title: "Countdown recursion",
      summary: "A small recursion example makes the stop condition easier to see.",
      code: `public static void countdown(int n) {
    if (n <= 0) {
        System.out.println("done");
        return;
    }

    System.out.println(n);
    countdown(n - 1);
}`,
      takeaways: [
        "The base case prevents infinite recursion.",
        "The recursive call must change the input so the base case becomes reachable.",
      ],
    },
    conceptChecks: [
      {
        prompt: "What is the main job of a base case?",
        options: [
          "Make the method run faster than loops",
          "Stop recursion so the calls do not continue forever",
          "Call the method again with the same input",
        ],
        correctIndex: 1,
        explanation:
          "Without a base case, recursion keeps calling itself until the stack overflows.",
      },
      {
        prompt: "Why does recursive binary search run faster than linear search on sorted data?",
        options: [
          "It checks every element twice",
          "It eliminates half of the remaining search space each call",
          "It uses a queue instead of a stack",
        ],
        correctIndex: 1,
        explanation:
          "Each recursive step discards one half of the array, so the problem size shrinks much faster than one-by-one scanning.",
      },
    ],
    compileHints: [
      "Every recursive method still needs a return statement on every path. Missing returns are common here.",
      "Check overload signatures carefully. The two binarySearch methods have different parameter counts.",
      "If Java reports unreachable or duplicate code, make sure your base case returns before the recursive call path continues.",
    ],
    challengeHints: [
      {
        title: "Factorial base and recursive case",
        matchText: ["factorial"],
        levels: [
          "factorial only needs one stopping rule for n <= 1.",
          "Return 1 in the base case, otherwise return n * factorial(n - 1).",
          "If factorial(0) fails, your base case is probably too narrow or missing zero.",
        ],
      },
      {
        title: "Fibonacci branching",
        matchText: ["fibonacci"],
        levels: [
          "Fibonacci has two direct answers before recursion begins.",
          "Use n <= 0 -> 0 and n == 1 -> 1, then combine the two smaller calls.",
          "The recursive case should be fibonacci(n - 1) + fibonacci(n - 2), not multiplication or subtraction.",
        ],
      },
      {
        title: "Recursive binary search",
        matchText: ["binarysearch", "missing element", "existing element"],
        levels: [
          "Think about the stopping condition first: when low passes high, the target is gone.",
          "Compute mid, compare arr[mid] to target, then recurse either right or left.",
          "The right-half call should use mid + 1. The left-half call should use mid - 1. Otherwise the bounds may never shrink.",
        ],
      },
    ],
    reflectionPrompt:
      "Which recursive method in your solution felt most natural, and which one forced you to think hardest about the base case?",
    reviewPrompt:
      "State the base case and recursive case for factorial or Fibonacci without looking at the code.",
  },
  "collections": {
    prerequisites: ["oop-basics"],
    foundation: [
      "Collections give you reusable data structures and standard library algorithms.",
      "Comparator logic decides ordering rules outside the object itself.",
      "HashMap is useful when you need fast lookup by key instead of scanning repeatedly.",
    ],
    whatToNotice: [
      "Comparator order is defined by return values, not by booleans.",
      "The sorting task uses a primary key and a tiebreaker.",
      "topStudent() is a scan problem, not a sorting problem.",
    ],
    commonMistakes: [
      "Sorting the original array when the challenge asks for a copy.",
      "Using ascending GPA when the task wants descending order.",
      "Sorting to find a maximum when a single pass is enough.",
    ],
    workedExample: {
      title: "Sort by two fields",
      summary: "Primary and secondary ordering rules can be combined clearly in one comparator.",
      code: `Arrays.sort(students, (a, b) -> {
    int byGpa = Double.compare(b.gpa, a.gpa);
    if (byGpa != 0) {
        return byGpa;
    }
    return a.name.compareTo(b.name);
});`,
      takeaways: [
        "The first non-zero comparison decides the order.",
        "Tiebreakers belong after the primary comparison, not before it.",
      ],
    },
    conceptChecks: [
      {
        prompt: "Why is Double.compare(b.gpa, a.gpa) used instead of Double.compare(a.gpa, b.gpa)?",
        options: [
          "Because the challenge wants GPA descending",
          "Because Java only allows b before a",
          "Because names must sort first",
        ],
        correctIndex: 0,
        explanation:
          "Swapping the argument order reverses the comparison, which gives descending GPA order.",
      },
      {
        prompt: "When is HashMap a better fit than ArrayList?",
        options: [
          "When you need fast value-by-key lookup",
          "When you need items to stay in insertion order forever",
          "When you want to compare doubles directly",
        ],
        correctIndex: 0,
        explanation:
          "HashMap is built for fast lookup by key, which avoids repeated linear scans.",
      },
    ],
    compileHints: [
      "If lambda syntax fails, check your parentheses and braces inside Arrays.sort(...).",
      "Student is a nested static class, so return types and variable declarations should use Collections.Student when needed in tests.",
      "HashMap<Integer, Integer> must include both type parameters or Java may infer the wrong thing from starter edits.",
    ],
    challengeHints: [
      {
        title: "Sorting students correctly",
        matchText: ["sortstudents", "gpa descending", "tiebreaker", "original array"],
        levels: [
          "The sorted result should come from a copied array, not the original.",
          "Copy first, then sort with GPA descending as the primary rule and name ascending as the tiebreaker.",
          "Use Arrays.copyOf(students, students.length), then Arrays.sort(copy, comparator) and return copy.",
        ],
      },
      {
        title: "Frequency counting",
        matchText: ["frequencycount", "counts correctly"],
        levels: [
          "This is a map accumulation problem, one array element at a time.",
          "For each value, read the old count with getOrDefault and store count + 1.",
          "The key is the array value and the mapped value is how many times you have seen it so far.",
        ],
      },
      {
        title: "Top student without sorting",
        matchText: ["topstudent", "highest gpa"],
        levels: [
          "You only need one pass through the array.",
          "Track the current best Student and replace it when you find a higher GPA.",
          "Initialize best to the first student, then scan from index 1 onward.",
        ],
      },
    ],
    reflectionPrompt:
      "What made the comparator solution clearer than writing a custom swap loop, and where did HashMap save you repeated work?",
    reviewPrompt:
      "Explain how a comparator decides order when the primary field ties and the tiebreaker takes over.",
  },
  "linked-lists": {
    prerequisites: ["oop-basics", "recursion"],
    foundation: [
      "A linked list stores data in nodes connected by references.",
      "The head reference is the entry point to the entire structure.",
      "Traversal means following next pointers one node at a time.",
    ],
    whatToNotice: [
      "insertAtHead changes head immediately.",
      "insertAtTail requires traversal unless you store a tail reference.",
      "delete() must reconnect links without losing the rest of the list.",
    ],
    commonMistakes: [
      "Forgetting to update head when the first node changes.",
      "Moving a pointer before saving the node you still need.",
      "Updating size on insert but forgetting to update it on delete.",
    ],
    workedExample: {
      title: "Insert at head",
      summary: "Head insertion is the simplest pointer rewrite in a singly linked list.",
      code: `public void insertAtHead(int value) {
    Node node = new Node(value);
    node.next = head;
    head = node;
    size++;
}`,
      takeaways: [
        "The new node points to the old head before head is replaced.",
        "One reference update can change the entire visible front of the list.",
      ],
    },
    conceptChecks: [
      {
        prompt: "Why is head so important in a singly linked list?",
        options: [
          "It stores the largest value in the list",
          "It is the only reference you need to reach every node",
          "It automatically points to the tail",
        ],
        correctIndex: 1,
        explanation:
          "Starting from head, you can follow next references to reach the rest of the list.",
      },
      {
        prompt: "What must happen when deleting the current head node?",
        options: [
          "Set head to head.next",
          "Reverse the whole list",
          "Set every next field to null",
        ],
        correctIndex: 0,
        explanation:
          "If the first node is removed, head must move to the second node so the list still has an entry point.",
      },
    ],
    compileHints: [
      "Make sure Node is defined before LinkedList uses it, and close each class body before starting the next one.",
      "toArray() must return an ArrayList<Integer>, not void.",
      "If Java complains about missing returns, verify every non-void method returns the expected object.",
    ],
    challengeHints: [
      {
        title: "Head and tail insertion",
        matchText: ["insertathead", "insertattail", "size tracks"],
        levels: [
          "Head insertion and tail insertion start differently: one rewrites head immediately, the other traverses.",
          "For tail insertion, handle the empty-list case first before walking to the final node.",
          "Both insert methods should increment size exactly once after the node is linked in.",
        ],
      },
      {
        title: "Deleting nodes safely",
        matchText: ["delete removes", "delete"],
        levels: [
          "Deletion has a special case when the target is at the head.",
          "For middle deletion, walk with a current pointer until current.next is the node to remove.",
          "Reconnect by setting current.next = current.next.next, then decrement size once if deletion actually happened.",
        ],
      },
      {
        title: "Traversing to build output",
        matchText: ["toarray", "got"],
        levels: [
          "toArray() is a full traversal from head to null.",
          "Start with an empty ArrayList<Integer>, then append each node.value as you move the pointer forward.",
          "Use a loop like Node current = head; while (current != null) { ... current = current.next; }.",
        ],
      },
    ],
    reflectionPrompt:
      "Which operation in your linked list felt most fragile, and what reference update would break the structure if done in the wrong order?",
    reviewPrompt:
      "Describe how insertAtHead changes the list using only the words head, new node, and next reference.",
  },
  "data-structures": {
    prerequisites: ["oop-basics", "collections"],
    foundation: [
      "Data structures are chosen for operation costs, not just because they can store data.",
      "Stacks use LIFO behavior; queues use FIFO behavior.",
      "HashMap and HashSet trade ordering for fast lookup and membership checks.",
      "Trees and graphs model relationships that are not just linear sequences.",
    ],
    whatToNotice: [
      "The stack top lives at the end of the ArrayList in this implementation.",
      "The queue front leaves first even if it arrived earliest.",
      "HashMap turns counting into a single pass over the input.",
      "BST search uses left-or-right decisions instead of scanning every node.",
      "BFS uses a queue so nodes are visited level by level.",
    ],
    commonMistakes: [
      "Implementing queue removal like stack removal and accidentally creating LIFO behavior.",
      "Using repeated list scans instead of a HashMap or HashSet when constant-time lookup is available.",
      "Ignoring the BST ordering rule and searching both branches like a plain binary tree.",
      "Forgetting a visited set in graph traversal and revisiting the same nodes forever.",
    ],
    workedExample: {
      title: "BFS uses a queue",
      summary: "Breadth-first search works because it expands the oldest frontier nodes first.",
      code: `ArrayDeque<String> frontier = new ArrayDeque<>();
HashSet<String> visited = new HashSet<>();
ArrayList<String> order = new ArrayList<>();

frontier.addLast(start);
visited.add(start);

while (!frontier.isEmpty()) {
    String node = frontier.removeFirst();
    order.add(node);
    for (String neighbor : graph.get(node)) {
        if (visited.add(neighbor)) {
            frontier.addLast(neighbor);
        }
    }
}`,
      takeaways: [
        "A queue preserves discovery order, which is why BFS explores by layers.",
        "The visited set prevents cycles from causing repeated work.",
      ],
    },
    conceptChecks: [
      {
        prompt: "Which structure should remove the item that was inserted most recently?",
        options: [
          "Queue",
          "Stack",
          "HashMap",
        ],
        correctIndex: 1,
        explanation:
          "Stacks are LIFO: last in, first out.",
      },
      {
        prompt: "Why is HashSet useful for duplicate detection?",
        options: [
          "Because it keeps values in sorted order",
          "Because add/contains make repeated membership checks fast",
          "Because it stores key-value pairs like HashMap",
        ],
        correctIndex: 1,
        explanation:
          "A set is ideal for have-I-seen-this-before checks because membership is near O(1) on average.",
      },
      {
        prompt: "Why does BFS use a queue instead of a stack?",
        options: [
          "Because BFS should process nodes in discovery order, layer by layer",
          "Because graphs can only store queue objects",
          "Because queues automatically avoid duplicates",
        ],
        correctIndex: 0,
        explanation:
          "A queue removes the oldest discovered node first, which is exactly how breadth-first exploration works.",
      },
    ],
    compileHints: [
      "This file defines several classes, so one missing brace or return can break everything that follows it.",
      "Generic class headers must stay consistent: Stack<T> and Queue<T> need matching parameter and return types.",
      "Keep the java.util.* import because the toolkit now uses HashMap, HashSet, ArrayDeque, ArrayList, and List.",
    ],
    challengeHints: [
      {
        title: "Implementing stack and queue behavior",
        matchText: ["stack:", "queue:", "lifo", "fifo", "peek work", "dequeue"],
        levels: [
          "Use the ArrayList ends intentionally: the stack removes the newest item, the queue removes the oldest item.",
          "For the stack, push adds to the end and pop/peek use items.size() - 1. For the queue, dequeue/peek use index 0.",
          "When either structure is empty, return null before calling remove() or get() on an invalid index.",
        ],
      },
      {
        title: "HashMap and HashSet utilities",
        matchText: ["frequencycount", "hashmap", "hasduplicates", "hashset"],
        levels: [
          "frequencyCount is an accumulation problem; hasDuplicates is a membership problem.",
          "Use getOrDefault(value, 0) + 1 for counting, and use seen.add(value) to detect the first repeated value.",
          "If add() on the set returns false, that value was already present and the array has a duplicate.",
        ],
      },
      {
        title: "BST search decisions",
        matchText: ["bstsearch", "existing values", "missing values"],
        levels: [
          "A BST lets you choose exactly one branch at each node.",
          "If target < node.value go left; if target > node.value go right; if equal return true.",
          "This should be a single path down the tree, not a search of both subtrees.",
        ],
      },
      {
        title: "Breadth-first graph traversal",
        matchText: ["bfsorder", "graph level by level"],
        levels: [
          "BFS needs both a queue for frontier order and a visited set for cycle safety.",
          "Start by enqueueing start, then repeatedly remove from the front, record the node, and enqueue unseen neighbors.",
          "If the visit order is wrong, check whether you accidentally used stack behavior or forgot to mark neighbors visited when enqueuing them.",
        ],
      },
    ],
    reflectionPrompt:
      "Which part of this toolkit was about implementing a structure, and which part was about choosing the right structure for a problem?",
    reviewPrompt:
      "Pick one task for HashMap, one for HashSet, and one for BFS, then explain why each structure is the right fit.",
  },
  algorithms: {
    prerequisites: ["recursion", "data-structures"],
    foundation: [
      "An algorithm is not just code that works; it is a strategy with a cost profile.",
      "Choosing the right pattern often matters more than micro-optimizing syntax.",
      "Search, pointer, hashing, sorting, and DP patterns each solve different problem shapes.",
    ],
    whatToNotice: [
      "Linear search works anywhere, while binary search only works when sorted order lets you discard half the search space.",
      "Two pointers depends on sorted input; HashMap-based Two Sum does not.",
      "Sliding window and merge sort both avoid repeated full rescans of the same data.",
      "Dynamic programming reuses earlier answers instead of recomputing them.",
    ],
    commonMistakes: [
      "Using binary search on unsorted input.",
      "Trying to use two pointers on an unsorted array without sorting first.",
      "Updating the HashMap in the wrong order and pairing an element with itself accidentally.",
      "Mutating the input array when the challenge asks for a new sorted array.",
      "Writing the DP recurrence without seeding the base cases first.",
    ],
    workedExample: {
      title: "Climb stairs with DP",
      summary: "Store smaller answers once, then build the larger answer from them.",
      code: `int[] dp = new int[n + 1];
dp[0] = 1;
dp[1] = 1;

for (int i = 2; i <= n; i++) {
    dp[i] = dp[i - 1] + dp[i - 2];
}

return dp[n];`,
      takeaways: [
        "Dynamic programming starts by locking in the base cases.",
        "Each new answer reuses earlier answers instead of recomputing the whole recursion tree.",
      ],
    },
    conceptChecks: [
      {
        prompt: "Why is HashMap useful in Two Sum?",
        options: [
          "It stores the input in sorted order automatically",
          "It lets you check the needed complement quickly while scanning once",
          "It replaces arrays entirely",
        ],
        correctIndex: 1,
        explanation:
          "The map remembers values you have already seen so you can find the complement in near O(1) time.",
      },
      {
        prompt: "When is the two-pointer technique a strong fit?",
        options: [
          "When the array is sorted and you want a pair or range with moving boundaries",
          "When you need to memoize recursive subproblems",
          "When you need key-value lookup by complement",
        ],
        correctIndex: 0,
        explanation:
          "Two pointers works because sorted order tells you how to move left or right after each comparison.",
      },
      {
        prompt: "Why does climbStairs fit dynamic programming?",
        options: [
          "Because each answer depends on smaller overlapping subproblems",
          "Because it needs a queue to visit states level by level",
          "Because binary search can split the stairs in half",
        ],
        correctIndex: 0,
        explanation:
          "The recurrence uses answers to smaller inputs repeatedly, so caching or tabulating those values avoids recomputation.",
      },
    ],
    compileHints: [
      "This file has several methods. If one method is missing a return, the whole class will fail to compile.",
      "Helper methods still need valid signatures and braces; merge(...) should stay inside the Algorithms class.",
      "If Arrays.toString or Arrays.equals errors appear, keep the java.util.* import in place.",
    ],
    challengeHints: [
      {
        title: "Linear and binary search",
        matchText: ["linearsearch", "binarysearch", "sorted array", "missing element"],
        levels: [
          "Linear search checks every index in order. Binary search keeps shrinking a valid low/high window.",
          "For binary search, if arr[mid] < target move low to mid + 1; if arr[mid] > target move high to mid - 1.",
          "Returning -1 should happen only after the scan or the search window is exhausted, not on the first mismatch.",
        ],
      },
      {
        title: "Two pointers versus hashing",
        matchText: ["twosumsorted", "two pointers", "hashmap on unsorted input", "twosum uses hashmap"],
        levels: [
          "The sorted version should use left and right pointers. The unsorted version should use a HashMap.",
          "For twoSumSorted, compare arr[left] + arr[right] and move one pointer inward. For twoSum, compute the complement and check the map first.",
          "The map solution should store value -> index after the complement check so one element does not pair with itself.",
        ],
      },
      {
        title: "Sliding window and merge sort",
        matchText: ["maxwindowsum", "mergesort", "sorted array without mutating"],
        levels: [
          "Sliding window reuses previous work; merge sort divides, solves, and merges.",
          "For maxWindowSum, compute the first window once, then add the incoming value and subtract the outgoing one.",
          "For mergeSort, return the original array when length <= 1, recurse on copies of each half, then merge into a new array.",
        ],
      },
      {
        title: "Dynamic programming recurrence",
        matchText: ["climbstairs", "dynamic programming recurrence"],
        levels: [
          "climbStairs has the same recurrence shape as Fibonacci, but built bottom-up here.",
          "Seed the base cases first, then each dp[i] should equal dp[i - 1] + dp[i - 2].",
          "If the answers drift, check the first two values. The whole table depends on those base cases being correct.",
        ],
      },
    ],
    reflectionPrompt:
      "Which algorithmic pattern in this challenge felt most reusable for future problems, and what clue would tell you to choose it again?",
    reviewPrompt:
      "Name one clue that should make you think of binary search, two pointers, HashMap, and dynamic programming.",
  },
};

export function getLessonSupport(slug: string): TopicLearningSupport | null {
  return lessonSupportRegistry[slug] ?? null;
}
