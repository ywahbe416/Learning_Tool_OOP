import type { Challenge } from "@/types/challenge";

export const challenge: Challenge = {
  title: "Build a BankAccount Class",
  description:
    "Implement a BankAccount class with encapsulation. Use private fields, implement getOwner(), getBalance(), deposit(), withdraw() (throws on insufficient funds), and toString().",
  starterCode: `public class BankAccount {
    private String owner;
    private double balance;

    public BankAccount(String owner, double initialBalance) {
        // TODO: set this.owner and this.balance
    }

    public String getOwner() {
        // TODO: return owner
    }

    public double getBalance() {
        // TODO: return balance
    }

    public void deposit(double amount) {
        // TODO: add amount to balance (ignore if amount <= 0)
    }

    public void withdraw(double amount) {
        // TODO: subtract amount from balance
        // throw new IllegalArgumentException("Insufficient funds") if amount > balance
    }

    @Override
    public String toString() {
        // TODO: return e.g. "BankAccount[owner=Alice, balance=500.0]"
    }
}`,
  testCases: [
    {
      description: "constructor sets owner and initial balance",
      wrapperCode: `
BankAccount acct = new BankAccount("Alice", 500.0);
boolean pass = acct.getOwner().equals("Alice") && acct.getBalance() == 500.0;
System.out.println(pass ? "PASS" : "FAIL: owner or balance wrong");
`,
    },
    {
      description: "deposit increases balance",
      wrapperCode: `
BankAccount acct = new BankAccount("Bob", 100.0);
acct.deposit(200.0);
System.out.println(acct.getBalance() == 300.0 ? "PASS" : "FAIL: expected 300.0, got " + acct.getBalance());
`,
    },
    {
      description: "withdraw decreases balance",
      wrapperCode: `
BankAccount acct = new BankAccount("Carol", 400.0);
acct.withdraw(150.0);
System.out.println(acct.getBalance() == 250.0 ? "PASS" : "FAIL: expected 250.0, got " + acct.getBalance());
`,
    },
    {
      description: "withdraw throws on insufficient funds",
      wrapperCode: `
BankAccount acct = new BankAccount("Dave", 100.0);
try {
    acct.withdraw(200.0);
    System.out.println("FAIL: should have thrown");
} catch (IllegalArgumentException e) {
    System.out.println(e.getMessage().equals("Insufficient funds") ? "PASS" : "FAIL: wrong message: " + e.getMessage());
}
`,
    },
    {
      description: "toString returns correct format",
      wrapperCode: `
BankAccount acct = new BankAccount("Alice", 500.0);
String s = acct.toString();
System.out.println(s.equals("BankAccount[owner=Alice, balance=500.0]") ? "PASS" : "FAIL: got " + s);
`,
    },
  ],
};
