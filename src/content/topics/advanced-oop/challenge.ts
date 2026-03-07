import type { Challenge } from "@/types/challenge";

export const challenge: Challenge = {
  title: "Build an Animal Inheritance Hierarchy",
  description:
    "Create an Animal base class, then Dog and Cat subclasses that override speak(). Also build a Person class with an Animal field (composition) that can call pet.speak() through the owner.",
  starterCode: `public class Animal {
    protected String name;

    public Animal(String name) {
        // TODO: set this.name
    }

    public String speak() {
        // TODO: return name + " makes a sound."
    }

    @Override
    public String toString() {
        // TODO: return "Animal(" + name + ")"
    }
}

class Dog extends Animal {
    public Dog(String name) {
        // TODO: call super(name)
    }

    @Override
    public String speak() {
        // TODO: return name + " says: Woof!"
    }
}

class Cat extends Animal {
    public Cat(String name) {
        // TODO: call super(name)
    }

    @Override
    public String speak() {
        // TODO: return name + " says: Meow!"
    }
}

class Person {
    private String name;
    private Animal pet;

    public Person(String name, Animal pet) {
        // TODO: set this.name and this.pet
    }

    public String introducePet() {
        // TODO: return "Hi, I'm " + name + " and my pet " + pet.name + " says: " + pet.speak()
        // Hint: pet.speak() uses polymorphism — Dog or Cat version is called automatically
    }
}`,
  testCases: [
    {
      description: "Dog overrides speak()",
      wrapperCode: `
Dog d = new Dog("Rex");
System.out.println(d.speak().equals("Rex says: Woof!") ? "PASS" : "FAIL: got " + d.speak());
`,
    },
    {
      description: "Cat overrides speak()",
      wrapperCode: `
Cat c = new Cat("Whiskers");
System.out.println(c.speak().equals("Whiskers says: Meow!") ? "PASS" : "FAIL: got " + c.speak());
`,
    },
    {
      description: "Animal base speak() works",
      wrapperCode: `
Animal a = new Animal("Buddy");
System.out.println(a.speak().equals("Buddy makes a sound.") ? "PASS" : "FAIL: got " + a.speak());
`,
    },
    {
      description: "Dog is an instance of Animal (inheritance chain)",
      wrapperCode: `
Dog d = new Dog("Rex");
System.out.println((d instanceof Animal) ? "PASS" : "FAIL: Dog is not instanceof Animal");
`,
    },
    {
      description: "Person.introducePet() uses polymorphism",
      wrapperCode: `
Person person = new Person("Alice", new Dog("Rex"));
String expected = "Hi, I'm Alice and my pet Rex says: Rex says: Woof!";
String actual = person.introducePet();
System.out.println(actual.equals(expected) ? "PASS" : "FAIL: got " + actual);
`,
    },
  ],
};
