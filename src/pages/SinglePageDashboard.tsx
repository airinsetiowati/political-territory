import React, { useState } from 'react';
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
  Clock
} from 'lucide-react';
import { useGame } from '../context/GameContext';
import { DiceSection } from '../components/DiceSection';
import { MapBoardSection } from '../components/MapBoardSection';
import { EconomicTimerSection } from '../components/EconomicTimerSection';
import { PlayerOverviewSection } from '../components/PlayerOverviewSection';
import { EventCardCenter, EventTab } from '../components/EventCardCenter';
import { GameHistorySection } from '../components/GameHistorySection';
import { PlayerLogo } from '../components/PlayerLogo';
import { BRAND_LOGO } from '../utils/brandAssets';

export const SinglePageDashboard: React.FC = () => {
  const {
    settings,
    players,
    activePlayer,
    isTurnLocked,
    devicePlayerId,
    setActiveTurnPlayer,
    openModal,
    resetGame
  } = useGame();

  const [eventTab, setEventTab] = useState<EventTab>('policy');

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const navItems = [
    { id: 'map-section', label: 'Peta', icon: Map },
    { id: 'dice-section', label: 'Dadu', icon: Dices },
    { id: 'timer-players-section', label: 'Pemain', icon: Users },
    { id: 'timer-section', label: 'Ekonomi', icon: Clock },
    { id: 'event-card-center', label: 'Kartu', icon: Layers },
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

  const displayActivePlayer = activePlayer;
  const activeBadge = getPawnBadgeStyle(displayActivePlayer?.color);

  const gameDurationMinutes = settings.gameDurationMinutes || 30;
  const gameRemainingSeconds = Math.max(
    0,
    settings.gameTimerRemainingSeconds ?? gameDurationMinutes * 60
  );
  const gameTimerMinutes = Math.floor(gameRemainingSeconds / 60);
  const gameTimerSeconds = gameRemainingSeconds % 60;
  const formattedGameTimer = `${String(gameTimerMinutes).padStart(2, '0')}:${String(gameTimerSeconds).padStart(2, '0')}`;
  const gameTimerRunning = settings.status === 'active' && Boolean(settings.gameTimerRunning);
  const gameTimerExpired = Boolean(settings.gameTimerExpired) || gameRemainingSeconds <= 0;
  const gameTimerUrgent = gameTimerRunning && gameRemainingSeconds <= 300;

  return (
    <div className="min-h-screen bg-[#F0ECE1] text-[#253451] flex flex-col font-sans select-none animate-in fade-in duration-300 overflow-x-clip">
      {/* =========================================================================
          A. HEADER PERMAINAN (Responsive Multi-Row Command Center)
         ========================================================================= */}
      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-[#E4E1D7] shadow-xs">
        <div className="max-w-[1600px] mx-auto w-full flex flex-wrap items-center justify-between gap-x-3 gap-y-2 px-3 sm:px-5 py-2">
          {/* Logo, Title & Match Counters */}
          <div className="flex items-center gap-2 shrink-0 min-w-0">
            <img
              src={BRAND_LOGO}
              alt="Political Territory"
              className="h-7 sm:h-8 w-auto rounded-lg sm:rounded-xl shrink-0 shadow-2xs"
              draggable={false}
            />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h1 className="font-display font-black text-xs sm:text-[13px] text-[#253451] uppercase tracking-wide whitespace-nowrap">
                  POLITICAL TERRITORY
                </h1>
                <span className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-mono font-extrabold uppercase px-1.5 py-0.5 rounded-full bg-[#73B77A]/15 text-[#2e6d34] border border-[#73B77A]/30 whitespace-nowrap shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#73B77A] animate-pulse" />
                  Live
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-[#253451]/60 whitespace-nowrap">
                <span>Round #{settings.currentRound}</span>
                <span>•</span>
                <span>Giliran #{settings.currentTurn || 1}</span>
              </div>
            </div>
          </div>

          {/* Quick Section Anchor Links */}
          <nav
            aria-label="Navigasi bagian dashboard"
            className="flex flex-wrap items-center justify-center gap-0.5 bg-[#F8F5EC] border border-[#EAE9E3] rounded-xl p-0.5 max-w-full"
          >
            {navItems.map(item => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => scrollToSection(item.id)}
                  className="px-2 py-1 rounded-lg text-[11px] font-extrabold text-[#253451]/75 hover:text-[#253451] hover:bg-white transition flex items-center gap-1 whitespace-nowrap shrink-0"
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Active Turn Spotlight + Primary Actions */}
          <div className="flex flex-wrap items-center justify-end gap-1.5 min-w-0 max-w-full ml-auto">
            {/* Match Timer: synchronized from the shared absolute end timestamp */}
            <div
              className={`flex items-center gap-1.5 px-2 py-1 rounded-xl border shadow-2xs shrink-0 whitespace-nowrap ${
                gameTimerExpired
                  ? 'bg-red-50 border-red-300 text-red-700'
                  : gameTimerUrgent
                    ? 'bg-amber-50 border-amber-300 text-amber-900'
                    : 'bg-[#F8F5EC] border-[#EAE9E3] text-[#253451]'
              }`}
              title={`Durasi pertandingan: ${gameDurationMinutes} menit. Timer berjalan otomatis dan tersinkronisasi.`}
            >
              <Clock className={`w-3.5 h-3.5 shrink-0 ${gameTimerUrgent ? 'animate-pulse' : ''}`} />
              <div className="leading-none">
                <span className="block text-[8px] font-extrabold uppercase tracking-wider opacity-60">
                  Match Timer
                </span>
                <span className={`block font-mono font-black text-[11px] mt-0.5 ${gameTimerUrgent ? 'animate-pulse' : ''}`}>
                  {gameTimerExpired ? 'WAKTU HABIS' : formattedGameTimer}
                </span>
              </div>
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                gameTimerExpired ? 'bg-red-500' : gameTimerRunning ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'
              }`} />
            </div>

            {displayActivePlayer && (
              <div className={`flex items-center gap-1.5 px-2 py-1 rounded-xl border ${activeBadge.border} ${activeBadge.lightBg} shadow-2xs min-w-0 max-w-full`}>
                <div className="w-5 h-5 rounded-full overflow-hidden shrink-0 border border-black/10 bg-white">
                  <PlayerLogo player={displayActivePlayer} size="full" showBadge={false} />
                </div>
                <span className="font-display font-black text-[11px] text-[#253451] whitespace-nowrap">
                  {displayActivePlayer.name}
                </span>
                <span className={`w-2 h-2 rounded-full ${activeBadge.bg} shrink-0 animate-pulse`} />
                <select
                  value={displayActivePlayer.id}
                  disabled={isTurnLocked || (devicePlayerId !== 'all' && devicePlayerId !== displayActivePlayer.id)}
                  onChange={e => setActiveTurnPlayer(e.target.value)}
                  className="text-[10px] font-bold bg-white/90 border border-[#EAE9E3] hover:border-[#253451]/40 rounded-lg px-1.5 py-0.5 text-[#253451] outline-none cursor-pointer max-w-[145px] sm:max-w-[170px] disabled:opacity-45 disabled:cursor-not-allowed"
                  title={isTurnLocked ? 'Giliran terkunci hingga proses Roll Dice dan Claim selesai' : (devicePlayerId !== 'all' && devicePlayerId !== displayActivePlayer.id) ? 'Hanya pemain aktif atau Meja Bersama yang dapat mengoper giliran' : 'Pilih langsung pemain yang aktif jika diperlukan'}
                >
                  {players.map(p => (
                    <option key={p.id} value={p.id}>
                      Oper ke {p.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Quick Card Entry Button */}
            <button
              type="button"
              onClick={() => openModal('QUICK_CARD_ENTRY')}
              className="px-2.5 py-1.5 rounded-xl bg-[#253451] hover:bg-[#1C273D] text-[#F4CE70] text-[11px] font-extrabold transition shadow-xs flex items-center gap-1 whitespace-nowrap shrink-0"
              title="Input cepat kode kartu fisik (Policy, Crisis, Opportunity, Mission)"
            >
              <QrCode className="w-3.5 h-3.5 shrink-0" />
              <span>Input Kartu</span>
            </button>

            {/* New Game Button */}
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Mulai sesi pertandingan baru? Seluruh data gameplay sesi ini akan direset kembali ke setup awal.')) {
                  resetGame();
                }
              }}
              className="px-2.5 py-1.5 rounded-xl bg-[#F8F5EC] hover:bg-[#EAE9E3] border border-[#EAE9E3] text-[#253451] font-extrabold text-[11px] uppercase tracking-wide transition shadow-2xs flex items-center gap-1 whitespace-nowrap shrink-0"
              title="Mulai Sesi Pertandingan Baru"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#EF956F] shrink-0" />
              <span>New Game</span>
            </button>

            {/* Settings Button */}
            <button
              type="button"
              onClick={() => openModal('SETTINGS')}
              className="p-1.5 sm:p-2 rounded-xl bg-[#F8F5EC] hover:bg-[#EAE9E3] border border-[#EAE9E3] text-[#253451] transition shrink-0"
              title="Pengaturan Permainan & Cadangan Data"
              aria-label="Pengaturan Permainan"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* End Game Button */}
            <button
              type="button"
              onClick={() => openModal('END_GAME')}
              className="px-2.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-[11px] uppercase tracking-wide transition shadow-xs flex items-center gap-1 whitespace-nowrap shrink-0"
              title="Akhiri pertandingan dan hitung pemenang"
            >
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>Akhiri</span>
            </button>
          </div>
        </div>
      </header>

      {/* =========================================================================
          MAIN GAME BODY
         ========================================================================= */}
      <main className="flex-1 w-full max-w-[1600px] mx-auto px-3 sm:px-5 lg:px-6 py-3.5 sm:py-4 space-y-4">

        {/* =========================================================================
            B. ROW UTAMA: PEMAIN, EKONOMI & EVENT CARD CENTER (KIRI 5) | MAP & DADU (KANAN 7)
           ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">

          {/* SISI KIRI: PEMAIN, EKONOMI & EVENT CARD CENTER */}
          <div className="lg:col-span-5 w-full flex flex-col gap-3.5 min-w-0">
            <PlayerOverviewSection />
            <EconomicTimerSection />
            <EventCardCenter activeTab={eventTab} onTabChange={setEventTab} />
          </div>

          {/* SISI KANAN / UTAMA: MAP WILAYAH, SISTEM DADU & RIWAYAT PERMAINAN */}
          <div className="lg:col-span-7 w-full flex flex-col gap-3.5 min-w-0">
            <MapBoardSection />
            <DiceSection />
            <GameHistorySection />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#EAE9E3] bg-white py-3 px-4 text-center text-[11px] text-[#253451]/55 font-medium">
        POLITICAL TERRITORY — Official Physical Board Game Companion
      </footer>
    </div>
  );
};

export default SinglePageDashboard;
