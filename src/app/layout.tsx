import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Osteopat.az - Manuel Terapiya və Reabilitasiya Mərkəzi',
  description: 'Onurğa və oynaq xəstəliklərinin peşəkar osteopatik müayinəsi, müalicəsi və onlayn həkim qəbulu',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="az">
      <body className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-emerald-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
