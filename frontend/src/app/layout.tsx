import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { DemoBanner } from '@/components/DemoBanner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Settlement OS — Property Settlement Platform',
  description: 'Streamlining residential property settlements in South Australia',
};

const IS_DEMO = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50 text-gray-900 antialiased`}>
        {IS_DEMO && <DemoBanner />}
        {children}
      </body>
    </html>
  );
}
