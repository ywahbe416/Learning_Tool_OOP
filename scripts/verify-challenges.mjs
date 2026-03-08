const endpoint = process.env.CHALLENGE_RUNNER_URL ?? "http://localhost:3000/api/run";

const challengePayloads = [
  {
    slug: "oop-basics",
    descriptions: [
      "constructor sets owner and initial balance",
      "deposit increases balance",
      "withdraw decreases balance",
      "withdraw throws on insufficient funds",
      "toString returns correct format",
    ],
    wrapperCodes: [
      `
BankAccount acct = new BankAccount("Alice", 500.0);
boolean pass = acct.getOwner().equals("Alice") && acct.getBalance() == 500.0;
System.out.println(pass ? "PASS" : "FAIL: owner or balance wrong");
`,
      `
BankAccount acct = new BankAccount("Bob", 100.0);
acct.deposit(200.0);
System.out.println(acct.getBalance() == 300.0 ? "PASS" : "FAIL: expected 300.0, got " + acct.getBalance());
`,
      `
BankAccount acct = new BankAccount("Carol", 400.0);
acct.withdraw(150.0);
System.out.println(acct.getBalance() == 250.0 ? "PASS" : "FAIL: expected 250.0, got " + acct.getBalance());
`,
      `
BankAccount acct = new BankAccount("Dave", 100.0);
try {
    acct.withdraw(200.0);
    System.out.println("FAIL: should have thrown");
} catch (IllegalArgumentException e) {
    System.out.println(e.getMessage().equals("Insufficient funds") ? "PASS" : "FAIL: wrong message: " + e.getMessage());
}
`,
      `
BankAccount acct = new BankAccount("Alice", 500.0);
String s = acct.toString();
System.out.println(s.equals("BankAccount[owner=Alice, balance=500.0]") ? "PASS" : "FAIL: got " + s);
`,
    ],
    userCode: `public class BankAccount {
    private String owner;
    private double balance;

    public BankAccount(String owner, double initialBalance) {
        this.owner = owner;
        this.balance = initialBalance;
    }

    public String getOwner() {
        return owner;
    }

    public double getBalance() {
        return balance;
    }

    public void deposit(double amount) {
        if (amount > 0) {
            balance += amount;
        }
    }

    public void withdraw(double amount) {
        if (amount > balance) {
            throw new IllegalArgumentException("Insufficient funds");
        }
        balance -= amount;
    }

    @Override
    public String toString() {
        return "BankAccount[owner=" + owner + ", balance=" + balance + "]";
    }
}`,
  },
  {
    slug: "advanced-oop",
    descriptions: [
      "Dog overrides speak()",
      "Cat overrides speak()",
      "Animal base speak() works",
      "Dog is an instance of Animal (inheritance chain)",
      "Person.introducePet() uses polymorphism",
    ],
    wrapperCodes: [
      `
Dog d = new Dog("Rex");
System.out.println(d.speak().equals("Rex says: Woof!") ? "PASS" : "FAIL: got " + d.speak());
`,
      `
Cat c = new Cat("Whiskers");
System.out.println(c.speak().equals("Whiskers says: Meow!") ? "PASS" : "FAIL: got " + c.speak());
`,
      `
Animal a = new Animal("Buddy");
System.out.println(a.speak().equals("Buddy makes a sound.") ? "PASS" : "FAIL: got " + a.speak());
`,
      `
Dog d = new Dog("Rex");
System.out.println((d instanceof Animal) ? "PASS" : "FAIL: Dog is not instanceof Animal");
`,
      `
Person person = new Person("Alice", new Dog("Rex"));
String expected = "Hi, I'm Alice and my pet Rex says: Rex says: Woof!";
String actual = person.introducePet();
System.out.println(actual.equals(expected) ? "PASS" : "FAIL: got " + actual);
`,
    ],
    userCode: `public class Animal {
    protected String name;

    public Animal(String name) {
        this.name = name;
    }

    public String speak() {
        return name + " makes a sound.";
    }

    @Override
    public String toString() {
        return "Animal(" + name + ")";
    }
}

class Dog extends Animal {
    public Dog(String name) {
        super(name);
    }

    @Override
    public String speak() {
        return name + " says: Woof!";
    }
}

class Cat extends Animal {
    public Cat(String name) {
        super(name);
    }

    @Override
    public String speak() {
        return name + " says: Meow!";
    }
}

class Person {
    private String name;
    private Animal pet;

    public Person(String name, Animal pet) {
        this.name = name;
        this.pet = pet;
    }

    public String introducePet() {
        return "Hi, I'm " + name + " and my pet " + pet.name + " says: " + pet.speak();
    }
}`,
  },
  {
    slug: "exceptions",
    descriptions: [
      "push and pop work correctly (LIFO)",
      "peek returns top without removing",
      "pop throws EmptyStackException on empty stack",
      "peek throws EmptyStackException with correct message",
      "isEmpty and size track correctly",
    ],
    wrapperCodes: [
      `
Stack<Integer> s = new Stack<>();
s.push(1); s.push(2); s.push(3);
boolean pass = s.pop() == 3 && s.pop() == 2;
System.out.println(pass ? "PASS" : "FAIL: wrong pop order");
`,
      `
Stack<Integer> s = new Stack<>();
s.push(10); s.push(20);
int top = s.peek();
boolean pass = top == 20 && s.size() == 2;
System.out.println(pass ? "PASS" : "FAIL: peek=" + top + " size=" + s.size());
`,
      `
Stack<Integer> s = new Stack<>();
try {
    s.pop();
    System.out.println("FAIL: should have thrown");
} catch (EmptyStackException e) {
    System.out.println("PASS");
}
`,
      `
Stack<Integer> s = new Stack<>();
try {
    s.peek();
    System.out.println("FAIL: should have thrown");
} catch (EmptyStackException e) {
    System.out.println(e.getMessage().equals("Stack is empty") ? "PASS" : "FAIL: wrong message: " + e.getMessage());
}
`,
      `
Stack<String> s = new Stack<>();
if (!s.isEmpty() || s.size() != 0) { System.out.println("FAIL: should be empty"); return; }
s.push("a"); s.push("b");
if (s.isEmpty() || s.size() != 2) { System.out.println("FAIL: size should be 2"); return; }
s.pop();
System.out.println(s.size() == 1 ? "PASS" : "FAIL: expected size 1, got " + s.size());
`,
    ],
    userCode: `import java.util.ArrayList;

public class EmptyStackException extends RuntimeException {
    public EmptyStackException() {
        super("Stack is empty");
    }
}

class Stack<T> {
    private ArrayList<T> items = new ArrayList<>();

    public void push(T item) {
        items.add(item);
    }

    public T pop() {
        if (items.isEmpty()) {
            throw new EmptyStackException();
        }
        return items.remove(items.size() - 1);
    }

    public T peek() {
        if (items.isEmpty()) {
            throw new EmptyStackException();
        }
        return items.get(items.size() - 1);
    }

    public boolean isEmpty() {
        return items.isEmpty();
    }

    public int size() {
        return items.size();
    }
}`,
  },
  {
    slug: "recursion",
    descriptions: [
      "factorial(5) == 120",
      "factorial(0) == 1",
      "fibonacci(6) == 8",
      "fibonacci(0)==0 and fibonacci(1)==1",
      "binarySearch finds existing element",
      "binarySearch returns -1 for missing element",
    ],
    wrapperCodes: [
      `System.out.println(Recursion.factorial(5) == 120 ? "PASS" : "FAIL: got " + Recursion.factorial(5));`,
      `System.out.println(Recursion.factorial(0) == 1 ? "PASS" : "FAIL: got " + Recursion.factorial(0));`,
      `System.out.println(Recursion.fibonacci(6) == 8 ? "PASS" : "FAIL: got " + Recursion.fibonacci(6));`,
      `
boolean pass = Recursion.fibonacci(0) == 0 && Recursion.fibonacci(1) == 1;
System.out.println(pass ? "PASS" : "FAIL: fib(0)=" + Recursion.fibonacci(0) + " fib(1)=" + Recursion.fibonacci(1));
`,
      `
int[] arr = {2, 5, 8, 12, 16, 23, 38, 56};
int idx = Recursion.binarySearch(arr, 23);
System.out.println(idx == 5 ? "PASS" : "FAIL: expected 5, got " + idx);
`,
      `
int[] arr = {2, 5, 8, 12, 16, 23, 38, 56};
int idx = Recursion.binarySearch(arr, 99);
System.out.println(idx == -1 ? "PASS" : "FAIL: expected -1, got " + idx);
`,
    ],
    userCode: `public class Recursion {
    public static long factorial(int n) {
        if (n <= 1) return 1;
        return n * factorial(n - 1);
    }

    public static long fibonacci(int n) {
        if (n <= 0) return 0;
        if (n == 1) return 1;
        return fibonacci(n - 1) + fibonacci(n - 2);
    }

    public static int binarySearch(int[] arr, int target, int low, int high) {
        if (low > high) return -1;
        int mid = (low + high) / 2;
        if (arr[mid] == target) return mid;
        if (arr[mid] < target) return binarySearch(arr, target, mid + 1, high);
        return binarySearch(arr, target, low, mid - 1);
    }

    public static int binarySearch(int[] arr, int target) {
        return binarySearch(arr, target, 0, arr.length - 1);
    }
}`,
  },
  {
    slug: "collections",
    descriptions: [
      "sortStudents sorts by GPA descending",
      "sortStudents uses name as tiebreaker (ascending)",
      "sortStudents does not mutate original array",
      "frequencyCount counts correctly",
      "topStudent returns student with highest GPA",
    ],
    wrapperCodes: [
      `
Collections.Student[] students = {
    new Collections.Student("Alice", 3.2),
    new Collections.Student("Bob", 3.8),
    new Collections.Student("Carol", 3.5)
};
Collections.Student[] sorted = Collections.sortStudents(students);
boolean pass = sorted[0].name.equals("Bob") && sorted[1].name.equals("Carol") && sorted[2].name.equals("Alice");
System.out.println(pass ? "PASS" : "FAIL: wrong order");
`,
      `
Collections.Student[] students = {
    new Collections.Student("Zara", 3.5),
    new Collections.Student("Alice", 3.5),
    new Collections.Student("Bob", 3.5)
};
Collections.Student[] sorted = Collections.sortStudents(students);
boolean pass = sorted[0].name.equals("Alice") && sorted[1].name.equals("Bob") && sorted[2].name.equals("Zara");
System.out.println(pass ? "PASS" : "FAIL: tiebreaker wrong, got " + sorted[0].name);
`,
      `
Collections.Student[] students = {
    new Collections.Student("Alice", 3.2),
    new Collections.Student("Bob", 3.8)
};
String firstName = students[0].name;
Collections.sortStudents(students);
System.out.println(students[0].name.equals(firstName) ? "PASS" : "FAIL: original array was mutated");
`,
      `
HashMap<Integer,Integer> map = Collections.frequencyCount(new int[]{1, 2, 1, 3, 2, 1});
boolean pass = map.get(1) == 3 && map.get(2) == 2 && map.get(3) == 1;
System.out.println(pass ? "PASS" : "FAIL: counts wrong");
`,
      `
Collections.Student[] students = {
    new Collections.Student("Alice", 3.2),
    new Collections.Student("Bob", 3.9),
    new Collections.Student("Carol", 3.5)
};
System.out.println(Collections.topStudent(students).name.equals("Bob") ? "PASS" : "FAIL");
`,
    ],
    userCode: `import java.util.*;

public class Collections {
    static class Student {
        String name;
        double gpa;
        Student(String name, double gpa) { this.name = name; this.gpa = gpa; }
    }

    public static Student[] sortStudents(Student[] students) {
        Student[] copy = Arrays.copyOf(students, students.length);
        Arrays.sort(copy, (a, b) -> {
            int byGpa = Double.compare(b.gpa, a.gpa);
            if (byGpa != 0) return byGpa;
            return a.name.compareTo(b.name);
        });
        return copy;
    }

    public static HashMap<Integer, Integer> frequencyCount(int[] arr) {
        HashMap<Integer, Integer> map = new HashMap<>();
        for (int value : arr) {
            map.put(value, map.getOrDefault(value, 0) + 1);
        }
        return map;
    }

    public static Student topStudent(Student[] students) {
        Student best = students[0];
        for (Student student : students) {
            if (student.gpa > best.gpa) {
                best = student;
            }
        }
        return best;
    }
}`,
  },
  {
    slug: "linked-lists",
    descriptions: [
      "insertAtHead adds nodes to front",
      "insertAtTail adds nodes to back",
      "delete removes middle node",
      "delete removes head node",
      "size tracks correctly after inserts",
    ],
    wrapperCodes: [
      `
LinkedList list = new LinkedList();
list.insertAtHead(1); list.insertAtHead(2); list.insertAtHead(3);
ArrayList<Integer> arr = list.toArray();
boolean pass = arr.get(0) == 3 && arr.get(1) == 2 && arr.get(2) == 1;
System.out.println(pass ? "PASS" : "FAIL: got " + arr);
`,
      `
LinkedList list = new LinkedList();
list.insertAtTail(1); list.insertAtTail(2); list.insertAtTail(3);
ArrayList<Integer> arr = list.toArray();
boolean pass = arr.get(0) == 1 && arr.get(1) == 2 && arr.get(2) == 3;
System.out.println(pass ? "PASS" : "FAIL: got " + arr);
`,
      `
LinkedList list = new LinkedList();
list.insertAtTail(1); list.insertAtTail(2); list.insertAtTail(3);
list.delete(2);
ArrayList<Integer> arr = list.toArray();
boolean pass = arr.size() == 2 && arr.get(0) == 1 && arr.get(1) == 3;
System.out.println(pass ? "PASS" : "FAIL: got " + arr);
`,
      `
LinkedList list = new LinkedList();
list.insertAtTail(1); list.insertAtTail(2); list.insertAtTail(3);
list.delete(1);
ArrayList<Integer> arr = list.toArray();
boolean pass = arr.size() == 2 && arr.get(0) == 2 && arr.get(1) == 3;
System.out.println(pass ? "PASS" : "FAIL: got " + arr);
`,
      `
LinkedList list = new LinkedList();
list.insertAtHead(1); list.insertAtTail(2); list.insertAtHead(0);
System.out.println(list.getSize() == 3 ? "PASS" : "FAIL: expected 3, got " + list.getSize());
`,
    ],
    userCode: `import java.util.ArrayList;

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

    public void insertAtHead(int value) {
        Node newNode = new Node(value);
        newNode.next = head;
        head = newNode;
        size++;
    }

    public void insertAtTail(int value) {
        Node newNode = new Node(value);
        if (head == null) {
            head = newNode;
            size++;
            return;
        }
        Node current = head;
        while (current.next != null) {
            current = current.next;
        }
        current.next = newNode;
        size++;
    }

    public void delete(int value) {
        if (head == null) return;
        if (head.value == value) {
            head = head.next;
            size--;
            return;
        }
        Node current = head;
        while (current.next != null) {
            if (current.next.value == value) {
                current.next = current.next.next;
                size--;
                return;
            }
            current = current.next;
        }
    }

    public ArrayList<Integer> toArray() {
        ArrayList<Integer> values = new ArrayList<>();
        Node current = head;
        while (current != null) {
            values.add(current.value);
            current = current.next;
        }
        return values;
    }

    public int getSize() { return size; }
}`,
  },
  {
    slug: "data-structures",
    descriptions: [
      "Stack: push and pop work (LIFO)",
      "Stack: isEmpty and peek work",
      "Queue: enqueue and dequeue work (FIFO)",
      "Queue: isEmpty and peek work",
      "isBalanced: balanced brackets return true",
      "isBalanced: unbalanced brackets return false",
    ],
    wrapperCodes: [
      `
Stack<Integer> s = new Stack<>();
s.push(1); s.push(2); s.push(3);
boolean pass = s.pop() == 3 && s.pop() == 2 && s.size() == 1;
System.out.println(pass ? "PASS" : "FAIL");
`,
      `
Stack<Integer> s = new Stack<>();
if (!s.isEmpty()) { System.out.println("FAIL: should be empty"); return; }
s.push(42);
boolean pass = s.peek() == 42 && !s.isEmpty() && s.size() == 1;
System.out.println(pass ? "PASS" : "FAIL");
`,
      `
Queue<String> q = new Queue<>();
q.enqueue("a"); q.enqueue("b"); q.enqueue("c");
boolean pass = q.dequeue().equals("a") && q.dequeue().equals("b") && q.size() == 1;
System.out.println(pass ? "PASS" : "FAIL");
`,
      `
Queue<Integer> q = new Queue<>();
if (!q.isEmpty()) { System.out.println("FAIL: should be empty"); return; }
q.enqueue(99);
boolean pass = q.peek() == 99 && !q.isEmpty();
System.out.println(pass ? "PASS" : "FAIL");
`,
      `
boolean pass = Brackets.isBalanced("({[]})") && Brackets.isBalanced("") && Brackets.isBalanced("()[]{}");
System.out.println(pass ? "PASS" : "FAIL");
`,
      `
boolean pass = !Brackets.isBalanced("({[})]") && !Brackets.isBalanced("(((") && !Brackets.isBalanced(")");
System.out.println(pass ? "PASS" : "FAIL");
`,
    ],
    userCode: `import java.util.ArrayList;

public class Stack<T> {
    private ArrayList<T> items = new ArrayList<>();

    public void push(T item) {
        items.add(item);
    }

    public T pop() {
        if (items.isEmpty()) return null;
        return items.remove(items.size() - 1);
    }

    public T peek() {
        if (items.isEmpty()) return null;
        return items.get(items.size() - 1);
    }

    public boolean isEmpty() {
        return items.isEmpty();
    }

    public int size() {
        return items.size();
    }
}

class Queue<T> {
    private ArrayList<T> items = new ArrayList<>();

    public void enqueue(T item) {
        items.add(item);
    }

    public T dequeue() {
        if (items.isEmpty()) return null;
        return items.remove(0);
    }

    public T peek() {
        if (items.isEmpty()) return null;
        return items.get(0);
    }

    public boolean isEmpty() {
        return items.isEmpty();
    }

    public int size() {
        return items.size();
    }
}

class Brackets {
    public static boolean isBalanced(String str) {
        Stack<Character> stack = new Stack<>();
        for (int i = 0; i < str.length(); i++) {
            char ch = str.charAt(i);
            if (ch == '(' || ch == '{' || ch == '[') {
                stack.push(ch);
            } else if (ch == ')' || ch == '}' || ch == ']') {
                Character open = stack.pop();
                if (open == null) return false;
                if ((ch == ')' && open != '(') ||
                    (ch == '}' && open != '{') ||
                    (ch == ']' && open != '[')) {
                    return false;
                }
            }
        }
        return stack.isEmpty();
    }
}`,
  },
  {
    slug: "algorithms",
    descriptions: [
      "binarySearch finds element in sorted array",
      "binarySearch returns -1 for missing element",
      "twoSum finds correct indices using HashMap",
      "twoSum handles non-adjacent pairs",
      "maxWindowSum finds maximum window",
      "mergeSort returns sorted array without mutating input",
    ],
    wrapperCodes: [
      `
int[] arr = {1, 3, 5, 7, 9, 11, 13};
boolean pass = Algorithms.binarySearch(arr, 7) == 3 && Algorithms.binarySearch(arr, 1) == 0;
System.out.println(pass ? "PASS" : "FAIL");
`,
      `
boolean pass = Algorithms.binarySearch(new int[]{1,3,5,7}, 4) == -1
            && Algorithms.binarySearch(new int[]{}, 1) == -1;
System.out.println(pass ? "PASS" : "FAIL");
`,
      `
int[] result = Algorithms.twoSum(new int[]{2, 7, 11, 15}, 9);
boolean pass = result != null && result[0] == 0 && result[1] == 1;
System.out.println(pass ? "PASS" : "FAIL: got " + Arrays.toString(result));
`,
      `
int[] result = Algorithms.twoSum(new int[]{3, 2, 4}, 6);
boolean pass = result != null && result[0] == 1 && result[1] == 2;
System.out.println(pass ? "PASS" : "FAIL: got " + Arrays.toString(result));
`,
      `
boolean pass = Algorithms.maxWindowSum(new int[]{2,1,5,1,3,2}, 3) == 9
            && Algorithms.maxWindowSum(new int[]{1,2,3,4,5}, 2) == 9;
System.out.println(pass ? "PASS" : "FAIL");
`,
      `
int[] input = {38, 27, 43, 3, 9, 82, 10};
int[] sorted = Algorithms.mergeSort(input);
int[] expected = {3, 9, 10, 27, 38, 43, 82};
boolean sortedOk = Arrays.equals(sorted, expected);
boolean notMutated = input[0] == 38;
System.out.println(sortedOk && notMutated ? "PASS" : "FAIL: sorted=" + Arrays.toString(sorted));
`,
    ],
    userCode: `import java.util.*;

public class Algorithms {
    public static int binarySearch(int[] arr, int target) {
        int low = 0;
        int high = arr.length - 1;
        while (low <= high) {
            int mid = (low + high) / 2;
            if (arr[mid] == target) return mid;
            if (arr[mid] < target) low = mid + 1;
            else high = mid - 1;
        }
        return -1;
    }

    public static int[] twoSum(int[] nums, int target) {
        HashMap<Integer, Integer> seen = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int needed = target - nums[i];
            if (seen.containsKey(needed)) {
                return new int[]{seen.get(needed), i};
            }
            seen.put(nums[i], i);
        }
        return null;
    }

    public static int maxWindowSum(int[] arr, int k) {
        if (arr.length == 0 || k <= 0 || k > arr.length) return 0;
        int window = 0;
        for (int i = 0; i < k; i++) window += arr[i];
        int best = window;
        for (int i = k; i < arr.length; i++) {
            window += arr[i] - arr[i - k];
            best = Math.max(best, window);
        }
        return best;
    }

    public static int[] mergeSort(int[] arr) {
        if (arr.length <= 1) return Arrays.copyOf(arr, arr.length);
        int mid = arr.length / 2;
        int[] left = Arrays.copyOfRange(arr, 0, mid);
        int[] right = Arrays.copyOfRange(arr, mid, arr.length);
        return merge(mergeSort(left), mergeSort(right));
    }

    private static int[] merge(int[] left, int[] right) {
        int[] merged = new int[left.length + right.length];
        int i = 0, j = 0, k = 0;
        while (i < left.length && j < right.length) {
            if (left[i] <= right[j]) merged[k++] = left[i++];
            else merged[k++] = right[j++];
        }
        while (i < left.length) merged[k++] = left[i++];
        while (j < right.length) merged[k++] = right[j++];
        return merged;
    }
}`,
  },
];

async function run() {
  let failures = 0;

  for (const challenge of challengePayloads) {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userCode: challenge.userCode,
        wrapperCodes: challenge.wrapperCodes,
        descriptions: challenge.descriptions,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      failures += 1;
      console.log(`FAIL ${challenge.slug}: ${data.error ?? response.statusText}`);
      continue;
    }

    const failedTests = (data.results ?? []).filter((result) => !result.pass);
    if (failedTests.length > 0) {
      failures += 1;
      console.log(`FAIL ${challenge.slug}: ${failedTests.length} failing test(s)`);
      for (const result of failedTests) {
        console.log(`  - ${result.description}: ${result.error ?? "unknown error"}`);
      }
      continue;
    }

    console.log(`PASS ${challenge.slug}: ${challenge.descriptions.length} tests passed`);
  }

  if (failures > 0) {
    process.exitCode = 1;
  }
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
