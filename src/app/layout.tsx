import type { Metadata } from "next";
import "./globals.css";
import ThemeToggle from "@/components/theme/ThemeToggle";

export const metadata: Metadata = {
  title: "DS & OOP Learning Tool",
  description: "Interactive data structures and OOP learning with visualizations and coding challenges",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen text-slate-100 antialiased">
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                try {
                  var theme = localStorage.getItem('ds-oop-theme');
                  document.documentElement.dataset.theme = theme === 'light' ? 'light' : 'dark';
                } catch (e) {
                  document.documentElement.dataset.theme = 'dark';
                }
              })();
            `,
          }}
        />
        <div className="relative isolate min-h-screen overflow-hidden">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[26rem] bg-[linear-gradient(135deg,rgba(103,232,249,0.12),transparent_45%,rgba(251,191,36,0.08))]" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/10" />

          <nav className="relative border-b border-white/10 bg-slate-950/35 backdrop-blur-xl">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
              <a href="/" className="group">
                <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-cyan-300">
                  Learning Studio
                </p>
                <p className="mt-1 text-xl font-semibold text-slate-50 transition-colors group-hover:text-cyan-200">
                  DS &amp; OOP
                </p>
              </a>
              <div className="flex items-center gap-3">
                <p className="hidden text-sm text-slate-400 md:block">
                  Visual labs and coding practice for core Java concepts
                </p>
                <ThemeToggle />
              </div>
            </div>
          </nav>

          <main className="relative">{children}</main>
        </div>
      </body>
    </html>
  );
}
