import React from 'react';
import Link from 'next/link';
import { AlertCircle, Home, SlidersHorizontal, ArrowLeft, Building2 } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950 text-white flex items-center justify-center p-6">
      <div className="max-w-lg w-full bg-slate-900/80 border border-white/10 rounded-3xl p-8 text-center backdrop-blur-xl shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-8 h-8" />
        </div>

        <span className="text-xs font-bold uppercase tracking-widest text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full">
          Xəta 404
        </span>

        <h1 className="text-3xl font-extrabold text-white mt-4 mb-2">
          Səhifə Tapılmadı
        </h1>

        <p className="text-slate-400 text-sm mb-8 leading-relaxed">
          Axtardığınız səhifə mövcud deyil, ünvanı dəyişdirilib və ya silinib. Aşağıdakı keçidlərdən istifadə edərək sistemə qayıda bilərsiniz.
        </p>

        <div className="space-y-3">
          <Link
            href="/"
            className="w-full inline-flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all shadow-lg shadow-indigo-600/30"
          >
            <Home className="w-4 h-4" />
            <span>Ana Səhifəyə Keç</span>
          </Link>

          <Link
            href="/admin"
            className="w-full inline-flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 font-semibold text-sm transition-all"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Admin Panelə Daxil Ol</span>
          </Link>
        </div>

        <div className="mt-8 pt-6 border-t border-white/10">
          <p className="text-xs text-slate-500 mb-3 font-semibold uppercase tracking-wider">Aktiv Filial Səhifələri:</p>
          <div className="flex flex-wrap justify-center gap-2">
            <Link
              href="/gozellik-merkezi"
              className="text-xs text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg border border-white/5 transition-all"
            >
              Gözəllik Mərkəzi
            </Link>
            <Link
              href="/modern-klinika"
              className="text-xs text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg border border-white/5 transition-all"
            >
              Modern Klinika
            </Link>
            <Link
              href="/vip-barber"
              className="text-xs text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg border border-white/5 transition-all"
            >
              VIP Barber
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
