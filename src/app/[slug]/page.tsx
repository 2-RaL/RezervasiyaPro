// Hostinger Dynamic Next.js App Router Tenant Page
import React from 'react';

export default async function TenantBookingPage({ params }: { params: { slug: string } }) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-8 text-slate-900 dark:text-slate-100 font-sans">
      <div className="max-w-3xl mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-3xl shadow-xl">
        <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Hostinger Production Route</span>
        <h1 className="text-3xl font-extrabold mt-1">Rezervasiya Portalı: /{params.slug}</h1>
        <p className="text-slate-500 mt-2">Bu şirkətin Hostinger üzərində işləyən fərdi brend növbə səhifəsidir.</p>
      </div>
    </div>
  );
}
