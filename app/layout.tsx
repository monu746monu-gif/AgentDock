import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AgentDock",
  description: "One workspace for your AI coding agents."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body>{children}</body>
    </html>
  );
}
