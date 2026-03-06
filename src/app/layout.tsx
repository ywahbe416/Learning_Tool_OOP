import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="en">
      <body className="min-h-screen bg-slate-900 text-slate-100">
        <nav className="border-b border-slate-800 px-6 py-4">
          <a href="/" className="text-xl font-bold text-indigo-400 hover:text-indigo-300 transition-colors">
            DS &amp; OOP
          </a>
        </nav>
        <main>{children}</main>
      </body>
    </html>
  );
}
