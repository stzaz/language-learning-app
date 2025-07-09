// frontend/src/app/layout.tsx
import type { Metadata } from "next";
import { Lora } from "next/font/google";
import { ThemeProvider } from "next-themes";
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
      {/*
        We apply the base styles directly here.
        - bg-white: The default background color.
        - dark:bg-slate-900: The background color when the 'dark' class is present.
        - text-slate-800: The default text color.
        - dark:text-slate-200: The text color in dark mode.
      */}
      <body className={`${lora.className} antialiased bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}