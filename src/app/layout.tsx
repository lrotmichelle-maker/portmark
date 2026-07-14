import type { Metadata } from "next";
import "./globals.css";

// Import directly from your layout components folder
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "PortVille Market",
  description: "Modern trading application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* REMOVED: bg-neutral-50, text-neutral-900, dark:bg-neutral-900, dark:text-neutral-50
        ADDED: bg-background text-foreground to sync directly with your dark globals variables!
      */}
      <body className="min-h-screen flex flex-col bg-background text-foreground antialiased">
        {/* Persistent top navbar */}
        <Navbar />

        {/* Main canvas area expands to fill empty space */}
        <main className="flex-grow">
          {children}
        </main>

        {/* Persistent bottom footer */}
        <Footer />
      </body>
    </html>
  );
}