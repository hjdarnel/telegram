import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Thermal',
  description: 'A Thermal Printer run by JS'
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="https://fav.farm/🧾" />
      </head>
      <body className={inter.className}>
        <div className="grid gap-2">{children}</div>
      </body>
    </html>
  );
}
