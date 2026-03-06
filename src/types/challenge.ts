export interface TestCase {
  description: string;
  runnerCode: string;
  expected?: unknown;
}

export interface Challenge {
  title: string;
  description: string;
  starterCode: string;
  testCases: TestCase[];
}
