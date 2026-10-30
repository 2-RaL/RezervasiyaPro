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
      <body className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f] dark:bg-[#000000] dark:text-[#f5f5f7] font-sans antialiased selection:bg-[#0071e3] selection:text-white transition-colors duration-300 overflow-x-hidden">
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
