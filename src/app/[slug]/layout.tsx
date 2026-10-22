import React from 'react';

export default function HomePage() {
  return (
    <main className="min-h-screen p-8 flex flex-col items-center justify-center text-center">
      <div className="max-w-2xl bg-white p-8 rounded-3xl shadow-xl border border-slate-200">
        <h1 className="text-3xl font-extrabold text-slate-900">Saytadi.com Platforması</h1>
        <p className="text-slate-600 mt-3">Hostinger üzərində uğurla işə salındı!</p>
        <div className="mt-6">
          <a href="/gozellik-merkezi" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition">
            Nümunə Rezervasiya Səhifəsi
          </a>
        </div>
      </div>
    </main>
  );
}
