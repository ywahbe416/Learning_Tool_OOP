import type { Challenge } from "@/types/challenge";

export const challenge: Challenge = {
  title: "Build an Animal Inheritance Hierarchy",
  description:
    "Create an `Animal` base class, then `Dog` and `Cat` subclasses that override `speak()`. Also build a `Person` class with a `Pet` field (composition) that can call `pet.speak()` through the owner.",
  starterCode: `class Animal {
  constructor(name) {
    // TODO: set this.name
  }

  speak() {
    // TODO: return \`\${this.name} makes a sound.\`
  }

  toString() {
    // TODO: return e.g. "Animal(Rex)"
  }
}

class Dog extends Animal {
  constructor(name) {
    // TODO: call super, set this.type = "Dog"
  }

  speak() {
    // TODO: override — return \`\${this.name} says: Woof!\`
  }
}

class Cat extends Animal {
  constructor(name) {
    // TODO: call super, set this.type = "Cat"
  }

  speak() {
    // TODO: override — return \`\${this.name} says: Meow!\`
  }
}

// Composition: Person HAS-A pet (Animal)
class Person {
  constructor(name, pet) {
    // TODO: set this.name and this.pet
  }

  introducePet() {
    // TODO: return \`Hi, I'm \${this.name} and my pet \${this.pet.name} says: \${this.pet.speak()}\`
    // Hint: call this.pet.speak() — polymorphism in action
  }
}`,
  testCases: [
    {
      description: "Dog overrides speak()",
      runnerCode: `
const d = new Dog("Rex");
return d.speak() === "Rex says: Woof!";
`,
    },
    {
      description: "Cat overrides speak()",
      runnerCode: `
const c = new Cat("Whiskers");
return c.speak() === "Whiskers says: Meow!";
`,
    },
    {
      description: "Animal base speak() works",
      runnerCode: `
const a = new Animal("Buddy");
return a.speak() === "Buddy makes a sound.";
`,
    },
    {
      description: "Dog instanceof Animal (inheritance chain)",
      runnerCode: `
const d = new Dog("Rex");
return d instanceof Animal && d instanceof Dog;
`,
    },
    {
      description: "Person.introducePet() uses polymorphism",
      runnerCode: `
const person = new Person("Alice", new Dog("Rex"));
return person.introducePet() === "Hi, I'm Alice and my pet Rex says: Rex says: Woof!";
`,
    },
  ],
};
