import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Autonomous Dev System",
  description: "AI-powered autonomous application development",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
