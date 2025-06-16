import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals copy.css'; // <--- CHANGED THIS LINE! It's now in the same directory.

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Chartilyze - Trade Smarter, Not Harder',
  description: 'Eliminate friction in trade journaling with AI-powered insights. Build consistent, profitable habits.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
