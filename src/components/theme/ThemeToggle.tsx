"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "ds-oop-theme";

function applyTheme(theme: "dark" | "light") {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem(STORAGE_KEY, theme);
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    const nextTheme = saved === "light" ? "light" : "dark";
    setTheme(nextTheme);
    applyTheme(nextTheme);
  }, []);

  function toggleTheme() {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    applyTheme(nextTheme);
  }

  return (
    <button
      onClick={toggleTheme}
      className="rounded-full border border-white/10 bg-slate-900/75 px-4 py-2 text-sm font-medium text-slate-200 transition-colors hover:border-cyan-400 hover:text-cyan-200"
      aria-label="Toggle light mode"
      type="button"
    >
      {theme === "dark" ? "Light Mode" : "Dark Mode"}
    </button>
  );
}
