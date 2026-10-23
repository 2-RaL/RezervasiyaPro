import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'RezervasiyaPro - İdarəetmə Paneli (Admin)',
  description: 'Müəssisələrin, xidmətlərin, növbələrin və pasiyentlərin vahid idarəetmə sistemi',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {children}
    </div>
  );
}
