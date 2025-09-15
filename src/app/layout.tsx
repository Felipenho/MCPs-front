import type {Metadata} from 'next';
import { Toaster } from "@/components/ui/toaster";
import './globals.css';
import { Inter } from "next/font/google";
import { cn } from '@/lib/utils';

const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
})

export const metadata: Metadata = {
  title: 'Client Hub',
  description: 'An MCP Client Interface',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={cn("min-h-screen bg-background font-sans antialiased", fontSans.variable)}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
