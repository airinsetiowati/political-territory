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
  Clock,
  ShieldAlert,
  Sparkles,
  Target,
  Flag,
  ClipboardList
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
    territories,
    policyCards,
    crisisCards,
    opportunityCards,
    missionCards,
    activePlayer,
    claimTurnPlayer,
    isTurnLocked,
    devicePlayerId,
    setActiveTurnPlayer,
    openModal,
    resetGame
  } = useGame();

  const [eventTab, setEventTab] = useState<EventTab>('all');

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const jumpToEventTab = (tab: EventTab) => {
    setEventTab(tab);
    scrollToSection('event-card-center');
  };

  const navItems = [
    { id: 'map-section', label: 'Peta', icon: Map },
    { id: 'dice-section', label: 'Dadu', icon: Dices },
    { id: 'timer-players-section', label: 'Pemain', icon: Users },
    { id: 'timer-section', label: 'Ekonomi', icon: Clock },
    { id: 'event-card-center', label: 'Event', icon: Layers },
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

  const displayActivePlayer = claimTurnPlayer || activePlayer;
  const activeBadge = getPawnBadgeStyle(displayActivePlayer?.color);

  const claimedCount = territories.filter(t => t.ownerId !== null).length;
  const remainingPolicies = policyCards.filter(c => !c.isUsed).length;
  const openCrises = crisisCards.filter(c => !c.isUsed).length;
  const openOpportunities = opportunityCards.filter(c => !c.isUsed || c.isReusable).length;
  const openMissions = missionCards.filter(c => c.status !== 'completed').length;

  const activeMissions = players.flatMap(player =>
    (player.activeMissions || [])
      .filter(mission => mission.status === 'active')
      .map(mission => ({ player, mission }))
  );
  const activeOpportunities = players.flatMap(player =>
    (player.activeOpportunities || []).map(opp => ({ player, opp }))
  );

  return (
    <div className="min-h-screen bg-[#F0ECE1] text-[#253451] flex flex-col font-sans select-none animate-in fade-in duration-300 overflow-x-hidden">
      {/* =========================================================================
          A. HEADER PERMAINAN (Compact Single-Bar Command Center)
         ========================================================================= */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E4E1D7] shadow-xs">
        <div className="max-w-[1600px] mx-auto flex flex-wrap lg:flex-nowrap items-center justify-between gap-2 sm:gap-3 px-3 sm:px-5 lg:px-6 py-2">
          {/* Logo, Title & Match Counters */}
          <div className="flex min-w-0 items-center gap-2.5 shrink-0">
            <img
              src={BRAND_LOGO}
              alt="Political Territory"
              className="h-8 w-auto rounded-xl shrink-0 shadow-2xs"
              draggable={false}
            />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h1 className="font-display font-black text-sm text-[#253451] uppercase tracking-wide truncate">
                  POLITICAL TERRITORY
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono font-extrabold uppercase px-1.5 py-0.5 rounded-full bg-[#73B77A]/15 text-[#2e6d34] border border-[#73B77A]/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#73B77A] animate-pulse" />
                  Live
                </span>
              </div>
              <div className="hidden sm:flex items-center gap-1.5 text-[10px] font-mono font-bold text-[#253451]/60">
                <span>Round #{settings.currentRound}</span>
                <span>•</span>
                <span>Giliran #{settings.currentTurn || 1}</span>
              </div>
            </div>
          </div>

          {/* Quick Section Anchor Links (Desktop) */}
          <nav className="hidden xl:flex items-center justify-center gap-0.5 bg-[#F8F5EC] border border-[#EAE9E3] rounded-xl p-0.5">
            {navItems.map(item => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => scrollToSection(item.id)}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-extrabold text-[#253451]/75 hover:text-[#253451] hover:bg-white transition flex items-center gap-1 whitespace-nowrap"
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Active Turn Spotlight + Primary Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2 ml-auto lg:ml-0">
            {displayActivePlayer && (
              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl border ${activeBadge.border} ${activeBadge.lightBg} shadow-2xs`}>
                <div className="w-5 h-5 rounded-full overflow-hidden shrink-0 border border-black/10 bg-white">
                  <PlayerLogo player={displayActivePlayer} size="full" showBadge={false} />
                </div>
                <span className="font-display font-black text-xs text-[#253451] truncate max-w-[90px] sm:max-w-[115px]">
                  {displayActivePlayer.name}
                </span>
                <span className={`w-2 h-2 rounded-full ${activeBadge.bg} shrink-0 animate-pulse`} />
                <select
                  value={displayActivePlayer.id}
                  disabled={isTurnLocked || (devicePlayerId !== 'all' && devicePlayerId !== displayActivePlayer.id)}
                  onChange={e => setActiveTurnPlayer(e.target.value)}
                  className="text-[10px] font-bold bg-white/90 border border-[#EAE9E3] hover:border-[#253451]/40 rounded-lg px-1.5 py-0.5 text-[#253451] outline-none cursor-pointer hidden md:block disabled:opacity-45 disabled:cursor-not-allowed"
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
              className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-[#253451] hover:bg-[#1C273D] text-[#F4CE70] text-xs font-extrabold transition shadow-xs flex items-center gap-1.5 whitespace-nowrap"
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
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-[#F8F5EC] hover:bg-[#EAE9E3] border border-[#EAE9E3] text-[#253451] font-extrabold text-xs uppercase tracking-wider transition shadow-2xs flex items-center gap-1 whitespace-nowrap"
              title="Mulai Sesi Pertandingan Baru"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#EF956F]" />
              <span className="hidden 2xl:inline">New Game</span>
            </button>

            {/* Settings Button */}
            <button
              type="button"
              onClick={() => openModal('SETTINGS')}
              className="p-1.5 sm:p-2 rounded-xl bg-[#F8F5EC] hover:bg-[#EAE9E3] border border-[#EAE9E3] text-[#253451] transition"
              title="Pengaturan Permainan & Cadangan Data"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* End Game Button */}
            <button
              type="button"
              onClick={() => openModal('END_GAME')}
              className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs uppercase tracking-wider transition shadow-xs flex items-center gap-1.5 whitespace-nowrap"
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
      <main className="flex-1 w-full max-w-[1600px] mx-auto px-3 sm:px-5 lg:px-6 py-3.5 sm:py-4 space-y-4">

        {/* =========================================================================
            B. ROW UTAMA: PEMAIN, EKONOMI & AKSES CEPAT (KIRI 5) | MAP & DADU (KANAN 7)
           ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">

          {/* SISI KIRI: PEMAIN, EKONOMI & HUB AKSI CEPAT */}
          <div className="lg:col-span-5 w-full flex flex-col gap-3.5 min-w-0">
            <PlayerOverviewSection />
            <EconomicTimerSection />

            {/* Hub Akses Cepat & Event Aktif (menutup ruang kosong & memudahkan akses fitur) */}
            <section className="flex-1 bg-white rounded-3xl border border-[#EAE9E3] shadow-soft-sm p-3.5 sm:p-4 flex flex-col justify-between gap-3">
              <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-[#EAE9E3]">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-xl bg-[#253451] text-[#F4CE70] flex items-center justify-center shrink-0">
                    <ClipboardList className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-display font-black text-xs sm:text-sm text-[#253451] uppercase tracking-wide truncate">
                      Akses Cepat &amp; Quest Aktif
                    </h3>
                    <span className="text-[10px] text-[#253451]/60 font-bold block truncate">
                      Klaim Wilayah, Krisis, Peluang &amp; Misi dalam 1 klik
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-extrabold px-2 py-0.5 rounded-full bg-[#F8F5EC] border border-[#EAE9E3] text-[#253451] shrink-0">
                  {claimedCount}/40 Area • {remainingPolicies} Policy
                </span>
              </div>

              {/* 4 Main Feature Shortcuts */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => openModal('QUICK_CARD_ENTRY')}
                  className="px-2.5 py-2 rounded-xl bg-[#253451] hover:bg-[#1C273D] text-[#F4CE70] text-[11px] font-extrabold transition shadow-2xs flex items-center justify-center gap-1.5"
                >
                  <Flag className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Claim / Kartu</span>
                </button>
                <button
                  type="button"
                  onClick={() => jumpToEventTab('crisis')}
                  className="px-2.5 py-2 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 text-[11px] font-extrabold transition flex items-center justify-center gap-1.5"
                >
                  <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Krisis ({openCrises})</span>
                </button>
                <button
                  type="button"
                  onClick={() => jumpToEventTab('opportunity')}
                  className="px-2.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-[11px] font-extrabold transition flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Peluang ({openOpportunities})</span>
                </button>
                <button
                  type="button"
                  onClick={() => jumpToEventTab('mission')}
                  className="px-2.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-[11px] font-extrabold transition flex items-center justify-center gap-1.5"
                >
                  <Target className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Misi ({openMissions})</span>
                </button>
              </div>

              {/* Active Quests / Ongoing Stimulus Feed */}
              <div className="flex-1 flex flex-col justify-center bg-[#F8F5EC] rounded-2xl border border-[#EAE9E3] p-2.5">
                {activeMissions.length === 0 && activeOpportunities.length === 0 ? (
                  <div className="flex items-center justify-between gap-2 text-[11px] text-[#253451]/65 font-medium px-1">
                    <span>Belum ada Misi atau Stimulus aktif. Klik area di peta untuk klaim wilayah.</span>
                    <button
                      type="button"
                      onClick={() => jumpToEventTab('all')}
                      className="text-[10px] font-extrabold text-[#253451] hover:underline shrink-0"
                    >
                      Buka Kartu →
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-[110px] overflow-y-auto pr-0.5">
                    {activeMissions.map(({ player, mission }) => (
                      <button
                        key={`qa-mis-${player.id}-${mission.id}`}
                        type="button"
                        onClick={() => openModal('MISSION_DETAIL', { card: mission, playerId: player.id })}
                        className="text-left bg-white hover:bg-emerald-50/70 border border-emerald-200 rounded-xl px-2.5 py-1.5 transition flex items-center justify-between gap-2"
                      >
                        <div className="flex items-center gap-1.5 min-w-0">
                          <div className="w-4 h-4 rounded-full overflow-hidden shrink-0">
                            <PlayerLogo player={player} size="full" showBadge={false} />
                          </div>
                          <span className="font-mono text-[9px] font-black text-emerald-700 shrink-0">{mission.code}</span>
                          <span className="text-[11px] font-bold text-[#253451] truncate">{mission.title}</span>
                        </div>
                        <span className="font-mono text-[10px] font-black text-emerald-700 shrink-0">+{mission.rewardPoints} VP</span>
                      </button>
                    ))}
                    {activeOpportunities.map(({ player, opp }) => (
                      <button
                        key={`qa-opp-${player.id}-${opp.id}`}
                        type="button"
                        onClick={() => openModal('OPPORTUNITY_DETAIL', { card: opp })}
                        className="text-left bg-white hover:bg-amber-50/70 border border-amber-200 rounded-xl px-2.5 py-1.5 transition flex items-center justify-between gap-2"
                      >
                        <div className="flex items-center gap-1.5 min-w-0">
                          <div className="w-4 h-4 rounded-full overflow-hidden shrink-0">
                            <PlayerLogo player={player} size="full" showBadge={false} />
                          </div>
                          <span className="font-mono text-[9px] font-black text-amber-700 shrink-0">{opp.code}</span>
                          <span className="text-[11px] font-bold text-[#253451] truncate">{opp.title}</span>
                        </div>
                        <span className="font-mono text-[10px] font-black text-amber-800 shrink-0">
                          {opp.recurringGB > 0 ? `+${opp.recurringGB} GB` : opp.isPermanent ? 'Perm' : `${opp.remainingCycles}cy`}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* SISI KANAN / UTAMA: MAP WILAYAH & SISTEM DADU */}
          <div className="lg:col-span-7 w-full flex flex-col gap-3.5 min-w-0">
            <MapBoardSection />
            <DiceSection />
          </div>
        </div>

        {/* =========================================================================
            C. ROW PENDUKUNG: EVENT CARD CENTER (8) & RIWAYAT PERMAINAN (4)
           ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
          <div className="lg:col-span-8 w-full min-w-0">
            <EventCardCenter activeTab={eventTab} onTabChange={setEventTab} />
          </div>

          <div className="lg:col-span-4 w-full min-w-0">
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
