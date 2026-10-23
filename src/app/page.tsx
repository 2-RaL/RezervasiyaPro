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
  CheckCircle2,
  HeartPulse
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950 text-white selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar */}
      <nav className="border-b border-white/10 backdrop-blur-xl bg-slate-900/70 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-emerald-500/25">
              <HeartPulse className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-2xl font-black tracking-tight text-white">Osteopat<span className="text-emerald-400">.az</span></span>
              <span className="ml-2 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Tibbi Rezervasiya</span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              href="/osteopat"
              className="hidden sm:inline-flex items-center gap-2 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 font-semibold text-xs px-4 py-2.5 rounded-xl transition-all"
            >
              <Stethoscope className="w-4 h-4" />
              <span>Qəbula Yazıl</span>
            </Link>

            <Link 
              href="/admin" 
              className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-semibold text-xs sm:text-sm px-4 sm:px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Admin Panel</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative pt-20 pb-28 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-600/15 via-transparent to-transparent pointer-events-none"></div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-8 backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Osteopatiya, Manuel Terapiya və Onurğa Reabilitasiyası Portalı</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6">
            Peşəkar Osteopat Qəbuluna <br className="hidden sm:inline" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-300">
              Onlayn Rezervasiya Edin
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-lg sm:text-xl text-slate-300 font-light leading-relaxed mb-10">
            Onurğa, oynaq, skolioz və dayaq-hərəkət sistemi problemlərinin müasir osteopatik diaqnostikası, müalicə planı və rahat onlayn qəbul sistemi.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/osteopat"
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-base shadow-xl shadow-emerald-600/30 transition-all hover:translate-y-[-2px] flex items-center gap-3"
            >
              <HeartPulse className="w-5 h-5" />
              <span>Osteopat Qəbuluna Yazıl (/osteopat)</span>
              <ArrowRight className="w-5 h-5" />
            </Link>

            <Link
              href="/admin"
              className="px-8 py-4 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-semibold text-base border border-white/15 backdrop-blur-md transition-all flex items-center gap-2"
            >
              <SlidersHorizontal className="w-5 h-5 text-indigo-300" />
              <span>Admin İdarəetmə Paneli</span>
            </Link>
          </div>

          {/* Quick Stats Banner */}
          <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="text-3xl font-extrabold text-white">100%</div>
              <div className="text-xs text-slate-400 font-medium mt-1">Dəqiq Saatlı Növbə</div>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="text-3xl font-extrabold text-emerald-400">FİN Dəstəkli</div>
              <div className="text-xs text-slate-400 font-medium mt-1">Elektron Xəstəlik Kartı</div>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="text-3xl font-extrabold text-cyan-400">Dr. Osteopat</div>
              <div className="text-xs text-slate-400 font-medium mt-1">Peşəkar Həkim Heyəti</div>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="text-3xl font-extrabold text-teal-400">24/7</div>
              <div className="text-xs text-slate-400 font-medium mt-1">Onlayn Qeydiyyat</div>
            </div>
          </div>
        </div>
      </header>

      {/* Demo Filiallar Section */}
      <section id="demo-filiallar" className="py-20 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
            Canlı Qəbul Səhifələri
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold mt-3 text-white">
            Filiallar və Həkim Qəbulu
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto mt-2 text-sm">
            İstədiyiniz xidmət və həkimi seçərək dərhal rezervasiya edin. Bütün müraciətlər avtomatik olaraq həkimin qəbul cədvəlinə əlavə olunur.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1: Osteopat.az Featured */}
          <div className="group relative rounded-3xl bg-slate-800/80 border-2 border-emerald-500/60 p-7 hover:border-emerald-400 hover:bg-slate-800/95 transition-all duration-300 hover:-translate-y-1 shadow-2xl shadow-emerald-500/10">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mb-5 text-emerald-400">
              <HeartPulse className="w-6 h-6" />
            </div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Əsas Klinika</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold">FİN Dəstəkli</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Osteopat.az Mərkəzi</h3>
            <p className="text-sm text-slate-300 mb-6 leading-relaxed">
              Osteopatik müayinə, onurğa və dayaq-hərəkət aparatının manuel terapiyası, skolioz reabilitasiyası.
            </p>
            <div className="space-y-2 mb-6 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Dr. Elmir Məmmədov (Baş Həkim)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>FİN ilə xəstəlik tarixçəsi və kart</span>
              </div>
            </div>
            <Link
              href="/osteopat"
              className="inline-flex items-center justify-between w-full px-4 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/30 transition-all"
            >
              <span>Qəbula Yazıl (/osteopat)</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Card 2: Modern Klinika */}
          <div className="group relative rounded-3xl bg-slate-800/60 border border-white/10 p-7 hover:border-cyan-500/50 hover:bg-slate-800/90 transition-all duration-300 hover:-translate-y-1 shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center mb-5 text-cyan-400">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Stomatologiya</span>
              <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full font-bold">FİN</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Modern Klinika & Dental</h3>
            <p className="text-sm text-slate-400 mb-6 leading-relaxed">
              Stomatoloji müayinə, rentgen, diş ağardılması və karies müalicəsi üçün onlayn növbə.
            </p>
            <div className="space-y-2 mb-6 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Dr. Rəşad Əliyev (Ortodont)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Diaqnoz və resept qeydiyyatı</span>
              </div>
            </div>
            <Link
              href="/modern-klinika"
              className="inline-flex items-center justify-between w-full px-4 py-3 rounded-xl bg-cyan-500/20 hover:bg-cyan-500 text-cyan-300 hover:text-white font-semibold text-sm transition-all"
            >
              <span>Qəbula Yazıl (/modern-klinika)</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Card 3: Gözəllik Mərkəzi */}
          <div className="group relative rounded-3xl bg-slate-800/60 border border-white/10 p-7 hover:border-pink-500/50 hover:bg-slate-800/90 transition-all duration-300 hover:-translate-y-1 shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-pink-500/20 border border-pink-500/30 flex items-center justify-center mb-5 text-pink-400">
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold text-pink-400 uppercase tracking-wider">Estetika</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Gözəllik və Estetik Mərkəzi</h3>
            <p className="text-sm text-slate-400 mb-6 leading-relaxed">
              Lazer epilyasiyası, Hydrafacial dərinin təmizlənməsi və kosmetoloji prosedurlar üçün qeydiyyat.
            </p>
            <div className="space-y-2 mb-6 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Aysel Quliyeva (Kosmetoloq)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Dəqiq prosedur cədvəli</span>
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
        </div>
      </section>

      {/* Admin Panel Feature Highlights */}
      <section className="py-20 px-6 border-t border-white/10 bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-white">Admin Paneldə Nələr İdarə Olunur?</h2>
            <p className="text-slate-400 mt-2 text-base">Osteopat.az və bütün filialların idarəetmə funksiyaları:</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
                <CalendarCheck className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-bold text-white mb-2">Qəbul və Rezervasiyalar</h4>
              <p className="text-sm text-slate-400">Daxil olan bütün bronları cədvəldə görün, təsdiqləyin, tamamlayın və ya yeni qəbul yaradın.</p>
            </div>

            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
              <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center mb-4">
                <HeartPulse className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-bold text-white mb-2">FİN Pasiyent Kartı & Reseptlər</h4>
              <p className="text-sm text-slate-400">Pasiyentin FİN kodu ilə xəstəlik tarixçəsi, qoyulan diaqnozlar və təyin olunan müalicə planı.</p>
            </div>

            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-4">
                <Layers className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-bold text-white mb-2">Filial və Şöbələr</h4>
              <p className="text-sm text-slate-400">Yeni filiallar əlavə edin, statuslarını aktiv/deaktiv edin və ya tibbi modulu tənzimləyin.</p>
            </div>

            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center mb-4">
                <SlidersHorizontal className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-bold text-white mb-2">Xidmətlər və Qiymətlər</h4>
              <p className="text-sm text-slate-400">Osteopatiya, manuel terapiya və massaj xidmətlərinin qiymət və müddətini redaktə edin.</p>
            </div>

            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-4">
                <Users className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-bold text-white mb-2">Həkim və Mütəxəssislər</h4>
              <p className="text-sm text-slate-400">Həkimlərin qəbul saatlarını və fərdi profillərini sistemdən asanlıqla idarə edin.</p>
            </div>

            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-4">
                <Activity className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-bold text-white mb-2">Maliyyə və Hesabatlar</h4>
              <p className="text-sm text-slate-400">Dövriyyə (AZN), günün xəstə sayı və tamamlanmış seansların analitikası.</p>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link
              href="/admin"
              className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-base shadow-xl shadow-indigo-600/30 transition-all hover:scale-105"
            >
              <span>İdarəetmə Panelinə Keçid</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 px-6 text-center text-sm text-slate-500">
        <p>© {new Date().getFullYear()} Osteopat.az. Bütün hüquqlar qorunur.</p>
      </footer>
    </div>
  );
}
