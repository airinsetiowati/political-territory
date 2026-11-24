import React from 'react';
import { 
  Settings, 
  AlertTriangle, 
  RotateCcw,
  Map,
  Dices,
  Users,
  Layers,
  History,
  QrCode,
  Clock,
  Sparkles
} from 'lucide-react';
import { useGame } from '../context/GameContext';
import { DiceSection } from '../components/DiceSection';
import { MapBoardSection } from '../components/MapBoardSection';
import { EconomicTimerSection } from '../components/EconomicTimerSection';
import { PlayerOverviewSection } from '../components/PlayerOverviewSection';
import { EventCardCenter } from '../components/EventCardCenter';
import { GameHistorySection } from '../components/GameHistorySection';
import { PlayerLogo } from '../components/PlayerLogo';
import { BRAND_LOGO } from '../utils/brandAssets';

export const SinglePageDashboard: React.FC = () => {
  const { 
    settings, 
    players, 
    activePlayer, 
    setActiveTurnPlayer, 
    openModal, 
    resetGame 
  } = useGame();

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const navItems = [
    { id: 'map-section', label: 'Peta', icon: Map },
    { id: 'dice-section', label: 'Dadu', icon: Dices },
    { id: 'timer-players-section', label: 'Pemain & Ekonomi', icon: Users },
    { id: 'event-card-center', label: 'Kartu Event', icon: Layers },
    { id: 'history-section', label: 'Riwayat', icon: History },
  ];

  const getPawnBadgeStyle = (color?: string) => {
    switch (color) {
      case 'red': return { bg: 'bg-red-500', text: 'text-red-700', border: 'border-red-300', lightBg: 'bg-red-50' };
      case 'blue': return { bg: 'bg-blue-500', text: 'text-blue-700', border: 'border-blue-300', lightBg: 'bg-blue-50' };
      case 'green': return { bg: 'bg-emerald-500', text: 'text-emerald-700', border: 'border-emerald-300', lightBg: 'bg-emerald-50' };
      default: return { bg: 'bg-amber-500', text: 'text-amber-800', border: 'border-amber-300', lightBg: 'bg-amber-50' };
    }
  };

  const activeBadge = getPawnBadgeStyle(activePlayer?.color);

  return (
    <div className="min-h-screen bg-[#F0ECE1] text-[#253451] flex flex-col font-sans select-none animate-in fade-in duration-300">
      {/* =========================================================================
          A. HEADER PERMAINAN (Command Bar)
          - Logo & Nama Permainan
          - Status Permainan & Indikator Giliran Aktif
          - Tombol Pengaturan, Input Kartu, New Game, & Kontrol Permainan
         ========================================================================= */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E4E1D7] shadow-xs">
        <div className="max-w-[1600px] mx-auto flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-3 sm:px-6 xl:px-8 py-2.5">
          {/* Logo & Game Title */}
          <div className="flex min-w-0 items-center gap-3">
            <img
              src={BRAND_LOGO}
              alt="Political Territory"
              className="h-9 w-auto rounded-xl shrink-0 shadow-2xs"
              draggable={false}
            />

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="font-display font-black text-sm sm:text-base text-[#253451] uppercase tracking-wide truncate">
                  POLITICAL TERRITORY
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono font-extrabold uppercase px-2 py-0.5 rounded-full bg-[#73B77A]/15 text-[#2e6d34] border border-[#73B77A]/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#73B77A] animate-pulse" />
                  Live Match
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-[#253451]/55 font-medium truncate hidden md:block">
                Board Game Companion • Command Center
              </p>
            </div>
          </div>

          {/* Active Turn Spotlight in Header */}
          {activePlayer && (
            <div className={`flex items-center gap-2 px-3 py-1 rounded-2xl border ${activeBadge.border} ${activeBadge.lightBg} shadow-2xs`}>
              <div className="w-5 h-5 rounded-full overflow-hidden shrink-0 border border-black/10 bg-white">
                <PlayerLogo player={activePlayer} size="full" showBadge={false} />
              </div>
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-[10px] uppercase font-mono font-extrabold text-[#253451]/60 hidden lg:inline">
                  Giliran:
                </span>
                <span className="font-display font-black text-xs text-[#253451] truncate max-w-[110px]">
                  {activePlayer.name}
                </span>
                <span className={`w-2 h-2 rounded-full ${activeBadge.bg} shrink-0 animate-pulse`} />
              </div>
              {/* Optional Quick Handoff Dropdown */}
              <select
                value={activePlayer.id}
                onChange={e => setActiveTurnPlayer(e.target.value)}
                className="text-[9px] font-bold bg-white/90 border border-[#EAE9E3] hover:border-[#253451]/40 rounded-lg px-1.5 py-0.5 text-[#253451] outline-none cursor-pointer hidden xl:block"
                title="Pilih langsung pemain yang aktif jika diperlukan"
              >
                {players.map(p => (
                  <option key={p.id} value={p.id}>
                    Oper ke {p.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Quick Section Anchor Links (Desktop) */}
          <nav className="order-4 hidden w-full items-center justify-center gap-0.5 border-t border-[#EAE9E3] pt-2 lg:order-none lg:flex lg:w-auto lg:border-0 lg:pt-0">
            {navItems.map(item => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => scrollToSection(item.id)}
                  className="px-2.5 py-1.5 rounded-xl text-[11px] font-extrabold text-[#253451]/70 hover:text-[#253451] hover:bg-[#F8F5EC] transition flex items-center gap-1.5"
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Header Action Badges & Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="hidden sm:flex items-center gap-1.5 mr-1">
              <span className="font-mono text-[11px] font-extrabold px-2.5 py-1.5 rounded-xl bg-[#F8F5EC] border border-[#EAE9E3] text-[#253451]">
                Round #{settings.currentRound}
              </span>
              <span className="font-mono text-[11px] font-extrabold px-2.5 py-1.5 rounded-xl bg-[#F8F5EC] border border-[#EAE9E3] text-[#253451]">
                Giliran #{settings.currentTurn || 1}
              </span>
            </div>

            {/* Quick Card Entry Button */}
            <button
              type="button"
              onClick={() => openModal('QUICK_CARD_ENTRY')}
              className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-[#253451] hover:bg-[#1C273D] text-[#F4CE70] text-xs font-extrabold transition shadow-xs flex items-center gap-1.5"
              title="Input cepat kode kartu fisik (Policy, Crisis, Opportunity, Mission)"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Input Kartu</span>
            </button>

            {/* New Game Button */}
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Mulai sesi pertandingan baru? Seluruh data gameplay sesi ini akan direset kembali ke setup awal.')) {
                  resetGame();
                }
              }}
              className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-[#F8F5EC] hover:bg-[#EAE9E3] border border-[#EAE9E3] text-[#253451] font-extrabold text-xs uppercase tracking-wider transition shadow-2xs flex items-center gap-1.5"
              title="Mulai Sesi Pertandingan Baru"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#EF956F]" />
              <span className="hidden xl:inline">New Game</span>
            </button>

            {/* Settings Button */}
            <button
              type="button"
              onClick={() => openModal('SETTINGS')}
              className="p-2 rounded-xl bg-[#F8F5EC] hover:bg-[#EAE9E3] border border-[#EAE9E3] text-[#253451] transition"
              title="Pengaturan Permainan & Cadangan Data"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* End Game Button */}
            <button
              type="button"
              onClick={() => openModal('END_GAME')}
              className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs uppercase tracking-wider transition shadow-xs flex items-center gap-1.5"
              title="Akhiri pertandingan dan hitung pemenang"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Akhiri</span>
            </button>
          </div>
        </div>
      </header>

      {/* =========================================================================
          MAIN GAME BODY
         ========================================================================= */}
      <main className="flex-1 w-full max-w-[1600px] mx-auto px-3 sm:px-6 xl:px-8 py-4 sm:py-5 space-y-5 sm:space-y-6">
        
        {/* =========================================================================
            B. BAGIAN KONTEN UTAMA
            - Map menjadi fokus utama di bagian tengah (Center Stage)
            - Panel informasi pemain & ekonomi dikelompokkan secara terstruktur di sisi kiri
            - Komponen dadu ditempatkan tepat di bawah map (mudah dijangkau saat giliran bermain)
            - Ketinggian kedua kolom sejajar harmonis tanpa area kosong di bagian tengah!
           ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          
          {/* SISI KIRI: PEMAIN & SISTEM EKONOMI (4 dari 12 kolom pada desktop) */}
          <div className="lg:col-span-4 w-full flex flex-col gap-4 sm:gap-5">
            {/* 1. Informasi Pemain & Kepemilikan Wilayah */}
            <PlayerOverviewSection />

            {/* 2. Sistem Ekonomi & Timer Siklus GB */}
            <EconomicTimerSection />
          </div>

          {/* SISI TENGAH / UTAMA: MAP & DADU (8 dari 12 kolom pada desktop) */}
          <div className="lg:col-span-8 w-full flex flex-col gap-4 sm:gap-5">
            {/* 1. Board Map Resmi (Fokus Visual Utama) */}
            <MapBoardSection />

            {/* 2. Sistem Dadu & Kontrol Giliran (Tepat di bawah map, mudah dijangkau) */}
            <DiceSection />
          </div>
        </div>

        {/* =========================================================================
            C. BAGIAN PANEL PENDUKUNG
            - Kartu Crisis, Opportunity, dan Mission
            - Informasi aktivitas permainan & quest aktif
            - Riwayat permainan & log aksi lengkap dengan Undo dan Ekspor CSV
           ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          {/* Kartu Event & Misi (7 dari 12 kolom) */}
          <div className="lg:col-span-7 xl:col-span-8 w-full">
            <EventCardCenter />
          </div>

          {/* Riwayat Permainan & Log Aktivitas (5 dari 12 kolom) */}
          <div className="lg:col-span-5 xl:col-span-4 w-full">
            <GameHistorySection />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#EAE9E3] bg-white py-4 px-4 text-center text-xs text-[#253451]/50 font-medium">
        POLITICAL TERRITORY — Official Physical Board Game Companion • Professional Command Center Architecture
      </footer>
    </div>
  );
};

export default SinglePageDashboard;
