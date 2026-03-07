export interface TestCase {
  description: string;
  wrapperCode: string; // Java main-method body that prints PASS or FAIL: <reason>
}

export interface Challenge {
  title: string;
  description: string;
  starterCode: string; // Java class(es) the student fills in
  testCases: TestCase[];
}
