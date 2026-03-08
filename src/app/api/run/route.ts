import { NextRequest, NextResponse } from "next/server";
import { execFile } from "node:child_process";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";

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

const execFileAsync = promisify(execFile);

function normalizeJavaSource(source: string) {
  // The runner compiles everything as Main.java, so additional public top-level types
  // must be downgraded to package-private to satisfy Java's filename rules.
  return source.replace(/\bpublic\s+(class|interface|enum|record)\b/g, "$1");
}

function buildJavaSource(userCode: string, wrapperCodes: string[], descriptions: string[]) {
  const normalizedUserCode = normalizeJavaSource(userCode);

  const testCaseBlocks = wrapperCodes.map((wrapper, index) => {
    return `
    // Test ${index + 1}: ${descriptions[index]}
    try {
      ${wrapper}
    } catch (Exception e) {
      System.out.println("FAIL: " + e.getMessage());
    }`;
  });

  return `
${normalizedUserCode}

public class Main {
  public static void main(String[] args) {
${testCaseBlocks.join("\n")}
  }
}
`;
}

async function executeJavaLocally(javaSource: string) {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), "ds-oop-java-"));
  const filePath = path.join(tempDir, "Main.java");

  try {
    await writeFile(filePath, javaSource, "utf8");

    await execFileAsync("javac", ["Main.java"], {
      cwd: tempDir,
      timeout: 10000,
    });

    const { stdout, stderr } = await execFileAsync("java", ["Main"], {
      cwd: tempDir,
      timeout: 10000,
    });

    return {
      stdout: stdout ?? "",
      stderr: stderr ?? "",
    };
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
}

export async function POST(req: NextRequest) {
  const { userCode, wrapperCodes, descriptions }: RunRequest = await req.json();
  const javaSource = buildJavaSource(userCode, wrapperCodes, descriptions);

  let executionOutput: { stdout: string; stderr: string };

  try {
    executionOutput = await executeJavaLocally(javaSource);
  } catch (error) {
    const message =
      error instanceof Error && "stderr" in error
        ? String((error as { stderr?: string }).stderr ?? error.message).trim()
        : error instanceof Error
          ? error.message
          : "Local Java execution failed.";

    return NextResponse.json(
      { error: message || "Local Java execution failed." },
      { status: 502 }
    );
  }

  const stderr = executionOutput.stderr.trim();
  const stdout = executionOutput.stdout.trim();

  if (stderr) {
    return NextResponse.json({ compileError: stderr });
  }

  const lines = stdout ? stdout.split("\n") : [];
  const results: TestResult[] = wrapperCodes.map((_, index) => {
    const line = (lines[index] ?? "").trim();
    if (line === "PASS") {
      return { description: descriptions[index], pass: true };
    }

    const message = line.startsWith("FAIL: ") ? line.slice(6) : line || "No output";
    return {
      description: descriptions[index],
      pass: false,
      error: message,
    };
  });

  return NextResponse.json({ results });
}
