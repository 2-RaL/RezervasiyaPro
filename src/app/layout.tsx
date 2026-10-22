import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'RezervasiyaPro - Onlayn Rezervasiya və İdarəetmə Sistemi',
  description: 'Gözəllik mərkəzləri, klinikalar və xidmət sahələri üçün tam funksional növbə və admin idarəetmə sistemi',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="az">
      <body className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased selection:bg-indigo-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
