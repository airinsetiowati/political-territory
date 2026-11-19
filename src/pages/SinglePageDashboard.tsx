import React from 'react';
import { 
  Trophy, 
  Settings, 
  AlertTriangle, 
  MapPin, 
  Clock, 
  Users, 
  Sparkles, 
  History,
  Layers,
  ShieldAlert,
  Target,
  RotateCcw
} from 'lucide-react';
import { useGame } from '../context/GameContext';
import { MapBoardSection } from '../components/MapBoardSection';
import { EconomicTimerSection } from '../components/EconomicTimerSection';
import { PlayerOverviewSection } from '../components/PlayerOverviewSection';
import { EventCardCenter } from '../components/EventCardCenter';
import { GameHistorySection } from '../components/GameHistorySection';

export const SinglePageDashboard: React.FC = () => {
  const { settings, players, openModal, resetGame } = useGame();

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-[#F0ECE1] text-[#253451] flex flex-col font-sans select-none animate-in fade-in duration-300">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#EAE9E3] shadow-xs px-4 sm:px-8 py-3">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Logo & Game Title */}
          <div className="flex items-center gap-3">
            {/* Official Political Territory Logo */}
            
              <img
                src={`${import.meta.env.BASE_URL}game-assets/logo.png`}
                alt="Political Territory"
                className="h-10 w-auto rounded-xl shrink-0"
                draggable={false}
              />

            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display font-black text-base sm:text-lg text-[#253451] uppercase tracking-wide">
                  POLITICAL TERRITORY
                </h1>
                <span className="text-[10px] font-mono font-extrabold uppercase px-2 py-0.5 rounded-full bg-[#73B77A]/20 text-[#2e6d34] border border-[#73B77A]/30">
                  Active Match
                </span>
              </div>
              <p className="text-[11px] text-[#253451]/60 font-medium hidden sm:block">
                Board Game Companion • Single-Page Command Center
              </p>
            </div>
          </div>

          {/* Quick Section Anchor Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-1.5 bg-[#F8F5EC] p-1 rounded-2xl border border-[#EAE9E3] text-xs font-bold text-[#253451]">
            <button
              type="button"
              onClick={() => scrollToSection('map-section')}
              className="px-3 py-1.5 rounded-xl hover:bg-white transition flex items-center gap-1"
            >
              <span>🗺️ Peta</span>
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('timer-players-section')}
              className="px-3 py-1.5 rounded-xl hover:bg-white transition flex items-center gap-1"
            >
              <span>⏱️ Timer & Pemain</span>
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('event-card-center')}
              className="px-3 py-1.5 rounded-xl hover:bg-white transition flex items-center gap-1"
            >
              <span>🎴 Event Cards</span>
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('history-section')}
              className="px-3 py-1.5 rounded-xl hover:bg-white transition flex items-center gap-1"
            >
              <span>📜 Riwayat</span>
            </button>
          </nav>

          {/* Header Action Badges & Buttons */}
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-extrabold px-3 py-1.5 rounded-xl bg-[#F8F5EC] border border-[#EAE9E3] text-[#253451] hidden sm:inline">
              Round #{settings.currentRound} • {players.length} Pemain
            </span>

            {/* New Game Button */}
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Mulai sesi pertandingan baru? Seluruh data gameplay sesi ini akan direset kembali ke setup awal.')) {
                  resetGame();
                }
              }}
              className="px-3 py-1.5 rounded-xl bg-[#F8F5EC] hover:bg-[#EAE9E3] border border-[#EAE9E3] text-[#253451] font-extrabold text-xs uppercase tracking-wider transition shadow-2xs flex items-center gap-1.5"
              title="Mulai Sesi Pertandingan Baru"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#EF956F]" />
              <span className="hidden sm:inline">New Game</span>
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
              className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs uppercase tracking-wider transition shadow-xs flex items-center gap-1.5"
              title="Akhiri pertandingan dan hitung pemenang"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Akhiri Game</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Single Page Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
        
        {/* Top 2-Column Section on Desktop: Map on Left, Timer & Players on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Interactive Physical Board Map (7 cols) */}
          <div className="lg:col-span-7 w-full">
            <MapBoardSection />
          </div>

          {/* Right Column: Economic Timer & Player Overview (5 cols) */}
          <div className="lg:col-span-5 w-full space-y-6">
            <EconomicTimerSection />
            <PlayerOverviewSection />
          </div>
        </div>

        {/* Middle Section: Event Card Center (3 side-by-side columns: Crisis, Opportunity, Mission) */}
        <EventCardCenter />

        {/* Bottom Section: Game History & Activity Log */}
        <GameHistorySection />
      </main>

      {/* Footer */}
      <footer className="border-t border-[#EAE9E3] bg-white py-4 px-4 text-center text-xs text-[#253451]/50 font-medium">
        POLITICAL TERRITORY — Official Physical Board Game Companion • Public Single-Page Architecture
      </footer>
    </div>
  );
};
