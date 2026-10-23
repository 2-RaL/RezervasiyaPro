import type { Metadata } from 'next';
import './globals.css';
import { LanguageProvider } from '../lib/languageContext';

export const metadata: Metadata = {
  title: 'RezervasiyaPro - Onlayn Rezervasiya və İdarəetmə Sistemi',
  description: 'Bütün sektorlar üzrə bizneslər, xidmət mərkəzləri, studiyalar və müəssisələr üçün universal onlayn növbə və idarəetmə platforması',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="az" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.getItem('theme') === 'dark') {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
                var l = localStorage.getItem('rezervasiya_lang');
                if (l) document.documentElement.lang = l;
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 font-sans antialiased selection:bg-indigo-500 selection:text-white transition-colors duration-200">
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
