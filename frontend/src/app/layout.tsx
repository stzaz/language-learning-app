// frontend/src/app/layout.tsx
import type { Metadata } from "next";
import { Lora } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "../providers/AuthProvider"; // Import the new AuthProvider
import Header from "../components/Header";
import "./globals.css";

const lora = Lora({
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "The Living Library",
  description: "A digital sanctuary for language learners.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${lora.className} antialiased bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {/* Wrap the application with the AuthProvider */}
          <AuthProvider>
            <Header />
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
