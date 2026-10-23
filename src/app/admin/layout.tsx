import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Osteopat.az - İdarəetmə Paneli (Admin)',
  description: 'Müəssisələrin, xidmətlərin, növbələrin və pasiyentlərin vahid idarəetmə sistemi',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {children}
    </div>
  );
}
