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
      "A structure becomes more valuable when you connect it to a problem pattern like bracket matching.",
    ],
    whatToNotice: [
      "The stack top lives at the end of the ArrayList in this implementation.",
      "The queue front leaves first even if it arrived earliest.",
      "Balanced-bracket checking relies on matching the most recent opener first, which is a stack idea.",
    ],
    commonMistakes: [
      "Implementing queue removal like stack removal and accidentally creating LIFO behavior.",
      "Forgetting to return null on empty pop()/peek()/dequeue() when the challenge asks for that contract.",
      "Checking bracket characters without verifying the opener and closer types actually match.",
    ],
    workedExample: {
      title: "Bracket matching with a stack",
      summary: "Each closing bracket should match the most recent unmatched opener.",
      code: `Stack<Character> stack = new Stack<>();
for (char ch : str.toCharArray()) {
    if (ch == '(' || ch == '{' || ch == '[') {
        stack.push(ch);
    } else {
        Character top = stack.pop();
        if (top == null) {
            return false;
        }
    }
}`,
      takeaways: [
        "The most recent opener must be checked first, which is exactly LIFO behavior.",
        "An early closing bracket should fail immediately if the stack is empty.",
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
        prompt: "Why is a stack the right tool for bracket matching?",
        options: [
          "Because the newest opening bracket must be matched first",
          "Because brackets are always sorted",
          "Because queues can only store strings",
        ],
        correctIndex: 0,
        explanation:
          "The closing bracket must match the most recent unmatched opener, which is a LIFO pattern.",
      },
    ],
    compileHints: [
      "Generic class headers must stay consistent: Stack<T> and Queue<T> each need matching return and parameter types.",
      "Brackets.isBalanced(...) is a static method inside a separate class, so keep its braces separate from Stack and Queue.",
      "If the file stops compiling after one class, check that every class body was fully closed before the next one started.",
    ],
    challengeHints: [
      {
        title: "Implementing stack behavior",
        matchText: ["stack:", "lifo", "peek work"],
        levels: [
          "In this design, the top of the stack is the end of the ArrayList.",
          "push adds to items, pop removes items.size() - 1, and peek reads that same index without removal.",
          "When the stack is empty, pop() and peek() should return null instead of calling remove/get on index -1.",
        ],
      },
      {
        title: "Implementing queue behavior",
        matchText: ["queue:", "fifo"],
        levels: [
          "Queues remove the oldest item, not the newest one.",
          "enqueue adds to the end, but dequeue and peek should look at index 0.",
          "If dequeue is returning the newest value first, you are removing from the wrong end of the list.",
        ],
      },
      {
        title: "Balanced bracket checking",
        matchText: ["isbalanced", "balanced brackets", "unbalanced brackets"],
        levels: [
          "You need one rule for openers and another for closers.",
          "Push opener characters. On a closer, pop and verify the pair matches: (), {}, or [].",
          "The string is balanced only if every closer matched correctly and the stack is empty at the end.",
        ],
      },
    ],
    reflectionPrompt:
      "Which problem in this topic was about the structure itself, and which one was about choosing the right structure for an algorithm?",
    reviewPrompt:
      "Give one real programming task that fits a stack better than a queue, and explain why.",
  },
  algorithms: {
    prerequisites: ["recursion", "data-structures"],
    foundation: [
      "An algorithm is not just code that works; it is a strategy with a cost profile.",
      "Choosing the right pattern often matters more than micro-optimizing syntax.",
      "You should connect each algorithm to the shape of problem it solves well.",
    ],
    whatToNotice: [
      "Binary search depends on sorted data and shrinking bounds.",
      "Two Sum becomes fast when a HashMap remembers earlier values.",
      "Sliding window and merge sort both avoid repeated full rescans of the same data.",
    ],
    commonMistakes: [
      "Using binary search on unsorted input.",
      "Updating the HashMap in the wrong order and pairing an element with itself accidentally.",
      "Mutating the input array when the challenge asks for a new sorted array.",
    ],
    workedExample: {
      title: "Binary search mindset",
      summary: "Keep a valid search interval and cut it in half each round.",
      code: `int low = 0;
int high = arr.length - 1;

while (low <= high) {
    int mid = (low + high) / 2;
    if (arr[mid] == target) return mid;
    if (arr[mid] < target) low = mid + 1;
    else high = mid - 1;
}

return -1;`,
      takeaways: [
        "Correct bound updates matter more than the exact loop syntax.",
        "The algorithm works only because sorted order tells you which half to discard.",
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
        prompt: "Why must mergeSort return a new array in this challenge?",
        options: [
          "Because the tests also check that the original input stays unchanged",
          "Because Java arrays cannot be modified",
          "Because merge sort only works on linked lists",
        ],
        correctIndex: 0,
        explanation:
          "The challenge contract includes non-mutation, so the algorithm must preserve the original input array.",
      },
    ],
    compileHints: [
      "This file has several methods. If one method is missing a return, the whole class will fail to compile.",
      "Helper methods still need valid signatures and braces; merge(...) should stay inside the Algorithms class.",
      "If Arrays.toString or Arrays.equals errors appear, keep the java.util.* import in place.",
    ],
    challengeHints: [
      {
        title: "Binary search bounds",
        matchText: ["binarysearch", "missing element", "sorted array"],
        levels: [
          "Binary search succeeds only when low and high always describe the remaining valid interval.",
          "If arr[mid] < target, move low to mid + 1. If arr[mid] > target, move high to mid - 1.",
          "Returning -1 should happen only after the loop ends, not on the first mismatch at mid.",
        ],
      },
      {
        title: "Two Sum with a HashMap",
        matchText: ["twosum", "hashmap", "indices"],
        levels: [
          "At each element, ask whether its complement has already been seen.",
          "Compute complement = target - nums[i], check the map first, then store nums[i] -> i.",
          "Checking before storing prevents an element from pairing with itself at the same index.",
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
    ],
    reflectionPrompt:
      "Which algorithmic pattern in this challenge felt most reusable for future problems, and what clue would tell you to choose it again?",
    reviewPrompt:
      "Name one clue that should make you think of binary search, one clue for HashMap, and one clue for sliding window.",
  },
};

export function getLessonSupport(slug: string): TopicLearningSupport | null {
  return lessonSupportRegistry[slug] ?? null;
}
