import { NextRequest, NextResponse } from "next/server";

interface RunRequest {
  userCode: string;
  wrapperCodes: string[];
  descriptions: string[];
}

interface TestResult {
  description: string;
  pass: boolean;
  error?: string;
}

export async function POST(req: NextRequest) {
  const { userCode, wrapperCodes, descriptions }: RunRequest = await req.json();

  // Build one Java file: user's class(es) + Main class with all test cases
  const testCaseBlocks = wrapperCodes.map((wrapper, i) => {
    return `
    // Test ${i + 1}: ${descriptions[i]}
    try {
      ${wrapper}
    } catch (Exception e) {
      System.out.println("FAIL: " + e.getMessage());
    }`;
  });

  const javaSource = `
${userCode}

public class Main {
  public static void main(String[] args) {
${testCaseBlocks.join("\n")}
  }
}
`;

  let pistonRes: Response;
  try {
    pistonRes = await fetch("https://emkc.org/api/v2/piston/execute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        language: "java",
        version: "*",
        files: [{ name: "Main.java", content: javaSource }],
      }),
    });
  } catch {
    return NextResponse.json(
      { error: "Could not reach the code execution service. Try again." },
      { status: 502 }
    );
  }

  if (!pistonRes.ok) {
    return NextResponse.json(
      { error: "Code execution service returned an error." },
      { status: 502 }
    );
  }

  const piston = await pistonRes.json();
  const stderr: string = piston.run?.stderr ?? piston.compile?.stderr ?? "";
  const stdout: string = piston.run?.stdout ?? "";

  // Compile error
  if (stderr.trim()) {
    return NextResponse.json({ compileError: stderr.trim() });
  }

  // Parse stdout: one PASS or FAIL: <msg> line per test case
  const lines = stdout.trim().split("\n");
  const results: TestResult[] = wrapperCodes.map((_, i) => {
    const line = (lines[i] ?? "").trim();
    if (line === "PASS") {
      return { description: descriptions[i], pass: true };
    }
    const msg = line.startsWith("FAIL: ") ? line.slice(6) : line || "No output";
    return { description: descriptions[i], pass: false, error: msg };
  });

  return NextResponse.json({ results });
}
