import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '@/components/AppContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'ContribLens OSS — Scan. Understand. Contribute.',
  description:
    'Helps beginners discover meaningful open-source contribution opportunities by scanning public GitHub repositories, verifying findings, explaining them in plain English, and creating actionable contribution plans.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark font-sans-mode text-base-mode">
      <body className="bg-black text-textPrimary flex flex-col min-h-screen selection:bg-electricTangerine/30 selection:text-lemonChiffon">
        <AppProvider>
          <Navbar />
          <main className="flex-1 w-full flex flex-col">{children}</main>
          <Footer />
        </AppProvider>
      </body>
    </html>
  );
}
