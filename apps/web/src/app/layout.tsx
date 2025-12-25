import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Place Finder",
  description: "Find places through AI-powered chat",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
