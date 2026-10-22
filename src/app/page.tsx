import React from 'react';
import Link from 'next/link';
import { 
  CalendarCheck, 
  Building2, 
  ShieldCheck, 
  Users, 
  Activity, 
  Clock, 
  ArrowRight, 
  Sparkles, 
  Layers, 
  SlidersHorizontal,
  Stethoscope,
  Scissors,
  CheckCircle2
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950 text-white selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar */}
      <nav className="border-b border-white/10 backdrop-blur-xl bg-slate-900/70 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <CalendarCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-2xl font-black tracking-tight text-white">Rezervasiya<span className="text-indigo-400">Pro</span></span>
              <span className="ml-2 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">SaaS v2.5</span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Link 
              href="/admin" 
              className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-semibold text-sm px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Admin Panelə Daxil Ol</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative pt-20 pb-28 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-600/20 via-transparent to-transparent pointer-events-none"></div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-8 backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Azərbaycan üçün tam milli onlayn rezervasiya ekosistemi</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6">
            Bütün Növbə və Xidmətlərinizi <br className="hidden sm:inline" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-sky-300 to-teal-300">
              Vahid Mərkəzdən İdarə Edin
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-lg sm:text-xl text-slate-300 font-light leading-relaxed mb-10">
            Klinikalar, estetik mərkəzlər, bərbərxana və bizneslər üçün avtomatlaşdırılmış rezervasiya, mütəxəssis cədvəli, FİN axtarışlı pasiyent qeydiyyatı və güclü idarəetmə paneli.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/admin"
              className="px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-base shadow-xl shadow-indigo-600/40 transition-all hover:translate-y-[-2px] flex items-center gap-3"
            >
              <SlidersHorizontal className="w-5 h-5" />
              <span>Admin İdarəetmə Paneli</span>
              <ArrowRight className="w-5 h-5" />
            </Link>

            <a
              href="#demo-filiallar"
              className="px-8 py-4 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-semibold text-base border border-white/15 backdrop-blur-md transition-all flex items-center gap-2"
            >
              <Building2 className="w-5 h-5 text-indigo-300" />
              <span>Nümunə Filialları Sına</span>
            </a>
          </div>

          {/* Quick Stats Banner */}
          <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="text-3xl font-extrabold text-white">100%</div>
              <div className="text-xs text-slate-400 font-medium mt-1">Real-vaxt Sinxronizasiya</div>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="text-3xl font-extrabold text-indigo-400">Çoxfiliallı</div>
              <div className="text-xs text-slate-400 font-medium mt-1">Multi-tenant Struktur</div>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="text-3xl font-extrabold text-emerald-400">FİN Tibbi</div>
              <div className="text-xs text-slate-400 font-medium mt-1">Xəstəlik Tarixçəsi & Kart</div>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="text-3xl font-extrabold text-cyan-400">24/7</div>
              <div className="text-xs text-slate-400 font-medium mt-1">Onlayn Qeydiyyat</div>
            </div>
          </div>
        </div>
      </header>

      {/* Demo Filiallar Section */}
      <section id="demo-filiallar" className="py-20 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full">
            Canlı Müştəri Səhifələri
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold mt-3 text-white">
            İstənilən Filialın Onlayn Növbə Səhifəsi
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto mt-2 text-sm">
            Müştərilər bu səhifələrə daxil olaraq xidmət, mütəxəssis, tarix və saat seçib dərhal rezervasiya edirlər. Bütün rezervasiyalar avtomatik olaraq Admin Panelə ötürülür.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Gözəllik Mərkəzi */}
          <div className="group relative rounded-3xl bg-slate-800/60 border border-white/10 p-7 hover:border-pink-500/50 hover:bg-slate-800/90 transition-all duration-300 hover:-translate-y-1 shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-pink-500/20 border border-pink-500/30 flex items-center justify-center mb-5 text-pink-400">
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold text-pink-400 uppercase tracking-wider">Estetika & Gözəllik</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Gözəllik və Estetik Mərkəzi</h3>
            <p className="text-sm text-slate-400 mb-6 leading-relaxed">
              Lazer epilyasiyası, Hydrafacial dərinin təmizlənməsi və kosmetoloji prosedurlar üçün onlayn növbə.
            </p>
            <div className="space-y-2 mb-6 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Xidmət və mütəxəssis seçimi</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Birbaşa təqvim integrasiyası</span>
              </div>
            </div>
            <Link
              href="/gozellik-merkezi"
              className="inline-flex items-center justify-between w-full px-4 py-3 rounded-xl bg-pink-500/20 hover:bg-pink-500 text-pink-300 hover:text-white font-semibold text-sm transition-all"
            >
              <span>Rezervasiya Et (/gozellik-merkezi)</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Card 2: Modern Klinika */}
          <div className="group relative rounded-3xl bg-slate-800/60 border border-white/10 p-7 hover:border-emerald-500/50 hover:bg-slate-800/90 transition-all duration-300 hover:-translate-y-1 shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mb-5 text-emerald-400">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Tibbi Filial</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold">FİN Dəstəkli</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Modern Klinika & Stomatologiya</h3>
            <p className="text-sm text-slate-400 mb-6 leading-relaxed">
              Həkim qəbulu, rentgen, diş ağardılması və pasiyent FİN kodu ilə tibbi tarixçə inteqrasiyası.
            </p>
            <div className="space-y-2 mb-6 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>FİN ilə pasiyent bazası</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Diaqnoz və resept qeydiyyatı</span>
              </div>
            </div>
            <Link
              href="/modern-klinika"
              className="inline-flex items-center justify-between w-full px-4 py-3 rounded-xl bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-white font-semibold text-sm transition-all"
            >
              <span>Qəbula Yazıl (/modern-klinika)</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Card 3: VIP Barber Club */}
          <div className="group relative rounded-3xl bg-slate-800/60 border border-white/10 p-7 hover:border-amber-500/50 hover:bg-slate-800/90 transition-all duration-300 hover:-translate-y-1 shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center mb-5 text-amber-400">
              <Scissors className="w-6 h-6" />
            </div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Kişi Baxımı & Bərbər</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">VIP Barber Club Baku</h3>
            <p className="text-sm text-slate-400 mb-6 leading-relaxed">
              Klassik saç kəsimi, saqqal dizaynı və master bərbərlər üçün dəqiq saatlıq yer bronlaşdırma.
            </p>
            <div className="space-y-2 mb-6 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Usta seçimi və saat aralıqları</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Sürətli 30 saniyəyə rezervasiya</span>
              </div>
            </div>
            <Link
              href="/vip-barber"
              className="inline-flex items-center justify-between w-full px-4 py-3 rounded-xl bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-white font-semibold text-sm transition-all"
            >
              <span>Növbə Götür (/vip-barber)</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Admin Panel Feature Highlights */}
      <section className="py-20 px-6 border-t border-white/10 bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-white">Admin Paneldə Nələr İdarə Olunur?</h2>
            <p className="text-slate-400 mt-2 text-base">Saytın bütün funksiyaları vahid sistemlə əlaqələndirilib:</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-4">
                <Layers className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-bold text-white mb-2">Filial və Şirkət İdarəetməsi</h4>
              <p className="text-sm text-slate-400">Yeni şirkətlər və filiallar əlavə edin, statuslarını aktiv/deaktiv edin və ya tibbi modulu açın.</p>
            </div>

            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center mb-4">
                <CalendarCheck className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-bold text-white mb-2">Rezervasiya Nəzarəti</h4>
              <p className="text-sm text-slate-400">Daxil olan bütün bronları cədvəldə süzün, təsdiqləyin, tamamlayın, ləğv edin və ya yenisini yaradın.</p>
            </div>

            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-4">
                <SlidersHorizontal className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-bold text-white mb-2">Xidmət və Qiymət Siyahısı</h4>
              <p className="text-sm text-slate-400">Xidmətlərin qiymətini (AZN), müddətini (dəqiqə), kateqoriyasını və adlarını anında redaktə edin.</p>
            </div>

            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
                <Users className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-bold text-white mb-2">İşçi və Mütəxəssis Heyəti</h4>
              <p className="text-sm text-slate-400">Hər filial üzrə həkimlər, kosmetoloqlar və ustaları idarə edin, rollarını təyin edin.</p>
            </div>

            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
              <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center mb-4">
                <Stethoscope className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-bold text-white mb-2">Pasiyent və Tibbi Qeydlər</h4>
              <p className="text-sm text-slate-400">FİN kod axtarışı ilə pasiyentlərin qan qrupu, diaqnozları, müalicəsi və verilən reseptləri.</p>
            </div>

            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-4">
                <Activity className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-bold text-white mb-2">Maliyyə və Göstəricilər</h4>
              <p className="text-sm text-slate-400">Ümumi dövriyyə (AZN), günün növbələri, təsdiqlənmiş və ləğv edilmiş bronların statistikası.</p>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link
              href="/admin"
              className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-base shadow-xl shadow-indigo-600/30 transition-all hover:scale-105"
            >
              <span>İndi İdarəetmə Panelinə Keç</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 px-6 text-center text-sm text-slate-500">
        <p>© {new Date().getFullYear()} RezervasiyaPro. Bütün hüquqlar qorunur. Hostinger Node.js & Next.js arxitekturası.</p>
      </footer>
    </div>
  );
}
