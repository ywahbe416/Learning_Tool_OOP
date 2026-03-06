import type { Challenge } from "@/types/challenge";

export const challenge: Challenge = {
  title: "Build a BankAccount Class",
  description:
    "Implement a `BankAccount` class with encapsulation. Use a private `#balance` field, implement `deposit`, `withdraw` (throws on insufficient funds), `getBalance`, and `toString`.",
  starterCode: `class BankAccount {
  #balance; // private field

  constructor(owner, initialBalance) {
    // TODO: set this.owner and this.#balance
  }

  getBalance() {
    // TODO: return the private balance
  }

  deposit(amount) {
    // TODO: add amount to balance (ignore if amount <= 0)
  }

  withdraw(amount) {
    // TODO: subtract amount from balance
    // throw new Error("Insufficient funds") if amount > balance
  }

  toString() {
    // TODO: return e.g. "BankAccount[owner=Alice, balance=500]"
  }
}`,
  testCases: [
    {
      description: "constructor sets owner and initial balance",
      runnerCode: `
const acct = new BankAccount("Alice", 500);
return acct.owner === "Alice" && acct.getBalance() === 500;
`,
    },
    {
      description: "deposit increases balance",
      runnerCode: `
const acct = new BankAccount("Bob", 100);
acct.deposit(200);
return acct.getBalance() === 300;
`,
    },
    {
      description: "withdraw decreases balance",
      runnerCode: `
const acct = new BankAccount("Carol", 400);
acct.withdraw(150);
return acct.getBalance() === 250;
`,
    },
    {
      description: "withdraw throws on insufficient funds",
      runnerCode: `
const acct = new BankAccount("Dave", 100);
try {
  acct.withdraw(200);
  return false; // should have thrown
} catch (e) {
  return e.message === "Insufficient funds";
}
`,
    },
    {
      description: "toString returns correct format",
      runnerCode: `
const acct = new BankAccount("Alice", 500);
return acct.toString() === "BankAccount[owner=Alice, balance=500]";
`,
    },
  ],
};
