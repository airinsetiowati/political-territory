import React, { useEffect, useRef, useState } from 'react';
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
  Menu,
  X,
  ChevronDown,
  Lock
} from 'lucide-react';
import { useGame } from '../context/GameContext';
import { PlayerLogo } from './PlayerLogo';
import { BRAND_LOGO } from '../utils/brandAssets';

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'map-section', label: 'Peta', icon: Map },
  { id: 'dice-section', label: 'Dadu', icon: Dices },
  { id: 'timer-players-section', label: 'Pemain', icon: Users },
  { id: 'timer-section', label: 'Ekonomi', icon: Clock },
  { id: 'event-card-center', label: 'Kartu', icon: Layers },
  { id: 'history-section', label: 'Riwayat', icon: History },
];

const getPawnBadgeStyle = (color?: string) => {
  switch (color) {
    case 'red':
      return { bg: 'bg-red-500', border: 'border-red-300', lightBg: 'bg-red-50' };
    case 'blue':
      return { bg: 'bg-blue-500', border: 'border-blue-300', lightBg: 'bg-blue-50' };
    case 'green':
      return { bg: 'bg-emerald-500', border: 'border-emerald-300', lightBg: 'bg-emerald-50' };
    default:
      return { bg: 'bg-amber-500', border: 'border-amber-300', lightBg: 'bg-amber-50' };
  }
};

export const DashboardNavbar: React.FC = () => {
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

  const [activeSectionId, setActiveSectionId] = useState<string>('map-section');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  const headerBarRef = useRef<HTMLDivElement>(null);
  const manualScrollLockUntilRef = useRef<number>(0);

  // Close mobile drawer when resizing to tablet/desktop or pressing Escape
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Scroll-spy to highlight the currently visible section without overriding manual clicks mid-scroll
  useEffect(() => {
    let rafId = 0;

    const updateActiveSection = () => {
      if (Date.now() < manualScrollLockUntilRef.current) return;

      const headerHeight = headerBarRef.current?.getBoundingClientRect().height ?? 72;
      const anchorLine = headerHeight + 36;

      let bestId = NAV_ITEMS[0].id;
      let bestDistance = Number.POSITIVE_INFINITY;

      for (const item of NAV_ITEMS) {
        const el = document.getElementById(item.id);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        // Prefer sections whose top has passed or is near the anchor line while still visible
        if (rect.bottom > headerHeight + 16) {
          const distance = Math.abs(rect.top - anchorLine);
          if (distance < bestDistance) {
            bestDistance = distance;
            bestId = item.id;
          }
        }
      }

      setActiveSectionId(bestId);
    };

    const onScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(updateActiveSection);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  const scrollToSection = (id: string) => {
    setActiveSectionId(id);
    setIsMobileMenuOpen(false);
    manualScrollLockUntilRef.current = Date.now() + 750;

    const el = document.getElementById(id);
    if (!el) return;

    const headerHeight = headerBarRef.current?.getBoundingClientRect().height ?? 0;
    const targetTop = Math.max(0, el.getBoundingClientRect().top + window.scrollY - headerHeight - 12);
    window.scrollTo({ top: targetTop, behavior: 'smooth' });
  };

  const handleQuickCardEntry = () => {
    setIsMobileMenuOpen(false);
    openModal('QUICK_CARD_ENTRY');
  };

  const handleOpenSettings = () => {
    setIsMobileMenuOpen(false);
    openModal('SETTINGS');
  };

  const handleNewGame = () => {
    setIsMobileMenuOpen(false);
    if (window.confirm('Mulai sesi pertandingan baru? Seluruh data gameplay sesi ini akan direset kembali ke setup awal.')) {
      resetGame();
    }
  };

  const handleEndGame = () => {
    setIsMobileMenuOpen(false);
    openModal('END_GAME');
  };

  const displayActivePlayer = activePlayer;
  const activeBadge = getPawnBadgeStyle(displayActivePlayer?.color);
  const canSwitchTurn = !isTurnLocked && (devicePlayerId === 'all' || devicePlayerId === displayActivePlayer?.id);
  const turnSwitchTooltip = isTurnLocked
    ? 'Giliran terkunci hingga proses Roll Dice dan Claim selesai'
    : !canSwitchTurn
      ? 'Hanya pemain aktif atau Meja Bersama yang dapat mengoper giliran'
      : 'Pilih langsung pemain yang aktif jika diperlukan';

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

  const isEnded = settings.status === 'ended';

  const renderMatchTimer = (compact = false) => (
    <div
      className={`flex items-center gap-1.5 rounded-xl border shadow-2xs shrink-0 whitespace-nowrap ${
        compact ? 'px-2 py-1' : 'px-2.5 py-1'
      } ${
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
        {!compact && (
          <span className="block text-[8px] font-extrabold uppercase tracking-wider opacity-60">
            Match Timer
          </span>
        )}
        <span
          className={`block font-mono font-black ${compact ? 'text-[11px]' : 'text-[11px] mt-0.5'} ${
            gameTimerUrgent ? 'animate-pulse' : ''
          }`}
        >
          {gameTimerExpired ? (compact ? 'HABIS' : 'WAKTU HABIS') : formattedGameTimer}
        </span>
      </div>
      <span
        className={`w-1.5 h-1.5 rounded-full shrink-0 ${
          gameTimerExpired ? 'bg-red-500' : gameTimerRunning ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'
        }`}
      />
    </div>
  );

  const renderLiveBadge = () => (
    <span
      className={`inline-flex items-center gap-1 text-[8.5px] min-[376px]:text-[9.5px] font-mono font-extrabold uppercase px-1.5 py-0.5 rounded-full whitespace-nowrap shrink-0 border ${
        isEnded
          ? 'bg-red-50 text-red-700 border-red-200'
          : 'bg-[#73B77A]/15 text-[#2e6d34] border-[#73B77A]/30'
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          isEnded ? 'bg-red-500' : 'bg-[#73B77A] animate-pulse'
        }`}
      />
      {isEnded ? 'Selesai' : 'Live'}
    </span>
  );

  return (
    <>
      <header className="sticky top-0 z-40 w-full">
        {/* Main Sticky Header Bar (measured for exact scroll offsets) */}
        <div
          ref={headerBarRef}
          className="w-full bg-white/95 backdrop-blur-md border-b border-[#E4E1D7] shadow-xs"
        >
          {/* ===============================================================
              MOBILE NAVBAR (< 768px) — Dedicated 3-Tier Touch-Friendly Layout
             =============================================================== */}
          <div className="md:hidden w-full">
            {/* Row 1: Logo + Title + LIVE + Quick Input + Optional Settings + Hamburger */}
            <div className="flex items-center justify-between gap-1.5 px-2.5 min-[376px]:px-3.5 py-1.5 border-b border-[#EAE9E3]/80">
              <div className="flex items-center gap-1.5 min-w-0 flex-1">
                <img
                  src={BRAND_LOGO}
                  alt="Political Territory"
                  className="h-6 min-[376px]:h-7 w-auto rounded-lg shrink-0 shadow-2xs"
                  draggable={false}
                />
                <h1 className="font-display font-black text-[9.5px] min-[360px]:text-[10.5px] min-[410px]:text-xs text-[#253451] uppercase tracking-tight whitespace-nowrap truncate">
                  POLITICAL TERRITORY
                </h1>
                {renderLiveBadge()}
              </div>

              <div className="flex items-center gap-1 min-[376px]:gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={handleQuickCardEntry}
                  className="h-8 px-2 min-[376px]:px-2.5 rounded-xl bg-[#253451] hover:bg-[#1C273D] text-[#F4CE70] text-[10px] min-[376px]:text-[11px] font-extrabold transition shadow-xs flex items-center gap-1 whitespace-nowrap active:scale-95"
                  title="Input cepat kode kartu fisik"
                >
                  <QrCode className="w-3.5 h-3.5 shrink-0" />
                  <span className="min-[420px]:hidden">Input</span>
                  <span className="hidden min-[420px]:inline">Input Kartu</span>
                </button>

                <button
                  type="button"
                  onClick={handleOpenSettings}
                  className="hidden min-[376px]:inline-flex items-center justify-center w-8 h-8 rounded-xl bg-[#F8F5EC] hover:bg-[#EAE9E3] border border-[#EAE9E3] text-[#253451] transition active:scale-95"
                  title="Pengaturan Permainan & Cadangan Data"
                  aria-label="Pengaturan Permainan"
                >
                  <Settings className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(prev => !prev)}
                  className={`inline-flex items-center justify-center w-8 h-8 rounded-xl border transition active:scale-95 ${
                    isMobileMenuOpen
                      ? 'bg-[#253451] text-[#F4CE70] border-[#253451]'
                      : 'bg-[#F8F5EC] hover:bg-[#EAE9E3] border-[#EAE9E3] text-[#253451]'
                  }`}
                  aria-expanded={isMobileMenuOpen}
                  aria-controls="mobile-navbar-drawer"
                  aria-label={isMobileMenuOpen ? 'Tutup menu aksi' : 'Buka menu aksi'}
                >
                  {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Row 2: Match Timer + Round/Giliran + Active Player & Turn Switch */}
            <div className="flex items-center justify-between gap-1.5 px-2.5 min-[376px]:px-3.5 py-1.5 border-b border-[#EAE9E3]/80 bg-[#FAF8F2]/90">
              <div className="flex items-center gap-1.5 min-w-0 shrink-0">
                {renderMatchTimer(true)}
                <div className="flex items-center gap-1 px-2 py-1 rounded-xl bg-white border border-[#EAE9E3] text-[10px] font-mono font-extrabold text-[#253451]/80 whitespace-nowrap">
                  <span className="min-[410px]:hidden">R#{settings.currentRound} • G#{settings.currentTurn || 1}</span>
                  <span className="hidden min-[410px]:inline">Round #{settings.currentRound} • Giliran #{settings.currentTurn || 1}</span>
                </div>
              </div>

              {displayActivePlayer && (
                <div
                  className={`relative flex items-center gap-1.5 px-2 py-1 rounded-xl border ${activeBadge.border} ${activeBadge.lightBg} shadow-2xs min-w-0 max-w-[132px] min-[376px]:max-w-[170px]`}
                  title={turnSwitchTooltip}
                >
                  <div className="w-4 h-4 rounded-full overflow-hidden shrink-0 border border-black/10 bg-white">
                    <PlayerLogo player={displayActivePlayer} size="full" showBadge={false} />
                  </div>
                  <span className="font-display font-black text-[11px] text-[#253451] truncate">
                    {displayActivePlayer.name}
                  </span>
                  <span className={`w-1.5 h-1.5 rounded-full ${activeBadge.bg} shrink-0 animate-pulse`} />
                  {canSwitchTurn ? (
                    <ChevronDown className="w-3 h-3 text-[#253451]/70 shrink-0" />
                  ) : (
                    <Lock className="w-3 h-3 text-[#253451]/45 shrink-0" />
                  )}
                  <select
                    aria-label="Ganti giliran pemain aktif"
                    value={displayActivePlayer.id}
                    disabled={!canSwitchTurn}
                    onChange={e => setActiveTurnPlayer(e.target.value)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                  >
                    {players.map(p => (
                      <option key={p.id} value={p.id}>
                        Oper ke {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Row 3: Compact 6-Item Section Navigation */}
            <nav
              aria-label="Navigasi bagian dashboard mobile"
              className="px-2 min-[376px]:px-3.5 py-1 bg-white"
            >
              <div className="grid grid-cols-6 gap-0.5 min-[376px]:gap-1 bg-[#F8F5EC] border border-[#EAE9E3] rounded-xl p-0.5">
                {NAV_ITEMS.map(item => {
                  const Icon = item.icon;
                  const isActive = activeSectionId === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => scrollToSection(item.id)}
                      aria-current={isActive ? 'location' : undefined}
                      className={`min-h-[38px] flex flex-col items-center justify-center gap-0.5 rounded-lg px-0.5 py-1 transition-all active:scale-95 ${
                        isActive
                          ? 'bg-[#253451] text-white shadow-xs'
                          : 'text-[#253451]/75 hover:text-[#253451] hover:bg-white/80'
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-[#F4CE70]' : ''}`} />
                      <span className="text-[9px] min-[376px]:text-[10px] font-extrabold leading-none tracking-tight truncate max-w-full">
                        {item.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </nav>
          </div>

          {/* ===============================================================
              TABLET (768–1279px: 2 Balanced Rows) & DESKTOP (1280px+: 1 Row)
             =============================================================== */}
          <div className="hidden md:flex md:flex-wrap xl:flex-nowrap items-center justify-between max-w-[1600px] mx-auto w-full gap-x-2 2xl:gap-x-3 gap-y-1.5 px-3 lg:px-4 2xl:px-6 py-2">
            {/* 1. Brand, LIVE Status & Round/Giliran */}
            <div className="flex items-center gap-2 shrink-0 min-w-0 xl:order-1">
              <img
                src={BRAND_LOGO}
                alt="Political Territory"
                className="h-7 2xl:h-8 w-auto rounded-xl shrink-0 shadow-2xs"
                draggable={false}
              />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h1 className="font-display font-black text-xs xl:text-[11.5px] 2xl:text-[13px] text-[#253451] uppercase tracking-tight 2xl:tracking-wide whitespace-nowrap">
                    POLITICAL TERRITORY
                  </h1>
                  {renderLiveBadge()}
                </div>
                <div className="flex items-center gap-1 text-[10px] font-mono font-bold text-[#253451]/60 whitespace-nowrap">
                  <span>Round #{settings.currentRound}</span>
                  <span>•</span>
                  <span>Giliran #{settings.currentTurn || 1}</span>
                </div>
              </div>
            </div>

            {/* 2. Match Timer & Active Player Spotlight */}
            <div className="flex items-center gap-1.5 2xl:gap-2 shrink-0 md:order-2 xl:order-3">
              {renderMatchTimer(false)}

              {displayActivePlayer && (
                <div className={`flex items-center gap-1.5 px-2 py-1 rounded-xl border ${activeBadge.border} ${activeBadge.lightBg} shadow-2xs min-w-0`}>
                  <div className="w-5 h-5 rounded-full overflow-hidden shrink-0 border border-black/10 bg-white">
                    <PlayerLogo player={displayActivePlayer} size="full" showBadge={false} />
                  </div>
                  <span className="font-display font-black text-[11px] text-[#253451] whitespace-nowrap max-w-[70px] lg:max-w-[96px] xl:max-w-[72px] 2xl:max-w-[116px] truncate">
                    {displayActivePlayer.name}
                  </span>
                  <span className={`w-2 h-2 rounded-full ${activeBadge.bg} shrink-0 animate-pulse`} />
                  <select
                    aria-label="Ganti giliran pemain aktif"
                    value={displayActivePlayer.id}
                    disabled={!canSwitchTurn}
                    onChange={e => setActiveTurnPlayer(e.target.value)}
                    className="text-[10px] font-bold bg-white/90 border border-[#EAE9E3] hover:border-[#253451]/40 rounded-lg px-1.5 py-1 text-[#253451] outline-none cursor-pointer max-w-[110px] xl:max-w-[96px] 2xl:max-w-[140px] disabled:opacity-45 disabled:cursor-not-allowed"
                    title={turnSwitchTooltip}
                  >
                    {players.map(p => (
                      <option key={p.id} value={p.id}>
                        Oper ke {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Deterministic Row Break for Tablet / Compact Desktop (768px–1279px) */}
            <div className="hidden md:block xl:hidden basis-full h-px bg-[#EAE9E3]/70 md:order-3" />

            {/* 3. Navigation Links */}
            <nav
              aria-label="Navigasi bagian dashboard"
              className="flex items-center gap-0.5 bg-[#F8F5EC] border border-[#EAE9E3] rounded-xl p-0.5 shrink-0 md:order-4 xl:order-2"
            >
              {NAV_ITEMS.map(item => {
                const Icon = item.icon;
                const isActive = activeSectionId === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => scrollToSection(item.id)}
                    aria-current={isActive ? 'location' : undefined}
                    className={`px-1.5 lg:px-2 xl:px-1.5 2xl:px-2.5 py-1.5 rounded-lg text-[10.5px] lg:text-[11px] font-extrabold transition-all flex items-center gap-1 whitespace-nowrap shrink-0 ${
                      isActive
                        ? 'bg-[#253451] text-white shadow-xs'
                        : 'text-[#253451]/75 hover:text-[#253451] hover:bg-white'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-[#F4CE70]' : ''}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* 4. Game Action Controls */}
            <div className="flex items-center gap-1 lg:gap-1.5 shrink-0 md:order-5 xl:order-4">
              <button
                type="button"
                onClick={handleQuickCardEntry}
                className="px-2 lg:px-2.5 xl:px-2 2xl:px-2.5 py-1.5 rounded-xl bg-[#253451] hover:bg-[#1C273D] text-[#F4CE70] text-[10.5px] lg:text-[11px] font-extrabold transition shadow-xs flex items-center gap-1 whitespace-nowrap shrink-0 active:scale-95"
                title="Input cepat kode kartu fisik (Policy, Crisis, Opportunity, Mission)"
              >
                <QrCode className="w-3.5 h-3.5 shrink-0" />
                <span>Input Kartu</span>
              </button>

              <button
                type="button"
                onClick={handleNewGame}
                className="px-2 lg:px-2.5 xl:px-2 2xl:px-2.5 py-1.5 rounded-xl bg-[#F8F5EC] hover:bg-[#EAE9E3] border border-[#EAE9E3] text-[#253451] font-extrabold text-[10.5px] lg:text-[11px] uppercase tracking-tight lg:tracking-wide transition shadow-2xs flex items-center gap-1 whitespace-nowrap shrink-0 active:scale-95"
                title="Mulai Sesi Pertandingan Baru"
              >
                <RotateCcw className="w-3.5 h-3.5 text-[#EF956F] shrink-0" />
                <span>New Game</span>
              </button>

              <button
                type="button"
                onClick={handleOpenSettings}
                className="p-1.5 lg:p-2 rounded-xl bg-[#F8F5EC] hover:bg-[#EAE9E3] border border-[#EAE9E3] text-[#253451] transition shrink-0 active:scale-95"
                title="Pengaturan Permainan & Cadangan Data"
                aria-label="Pengaturan Permainan"
              >
                <Settings className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleEndGame}
                className="px-2 lg:px-2.5 xl:px-2 2xl:px-2.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-[10.5px] lg:text-[11px] uppercase tracking-tight lg:tracking-wide transition shadow-xs flex items-center gap-1 whitespace-nowrap shrink-0 active:scale-95"
                title="Akhiri pertandingan dan hitung pemenang"
              >
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>Akhiri</span>
              </button>
            </div>
          </div>
        </div>

        {/* =================================================================
            MOBILE HAMBURGER DROPDOWN (Aksi Permainan & Pengaturan)
           ================================================================= */}
        {isMobileMenuOpen && (
          <div
            id="mobile-navbar-drawer"
            className="md:hidden w-full bg-white border-b border-[#E4E1D7] shadow-soft-md px-3 py-3 space-y-3 navbar-drawer-enter"
          >
            <div className="flex items-center justify-between text-[10px] font-extrabold uppercase tracking-wider text-[#253451]/60 px-0.5">
              <span>Aksi &amp; Kontrol Permainan</span>
              <span className="font-mono">
                Round #{settings.currentRound} • Giliran #{settings.currentTurn || 1}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleQuickCardEntry}
                className="min-h-[42px] px-3 py-2 rounded-xl bg-[#253451] hover:bg-[#1C273D] text-[#F4CE70] text-xs font-extrabold transition shadow-xs flex items-center justify-center gap-1.5 active:scale-95"
              >
                <QrCode className="w-4 h-4 shrink-0" />
                <span>Input Kartu</span>
              </button>

              <button
                type="button"
                onClick={handleOpenSettings}
                className="min-h-[42px] px-3 py-2 rounded-xl bg-[#F8F5EC] hover:bg-[#EAE9E3] border border-[#EAE9E3] text-[#253451] text-xs font-extrabold transition flex items-center justify-center gap-1.5 active:scale-95"
              >
                <Settings className="w-4 h-4 shrink-0" />
                <span>Pengaturan</span>
              </button>

              <button
                type="button"
                onClick={handleNewGame}
                className="min-h-[42px] px-3 py-2 rounded-xl bg-[#F8F5EC] hover:bg-[#EAE9E3] border border-[#EAE9E3] text-[#253451] text-xs font-extrabold transition flex items-center justify-center gap-1.5 active:scale-95"
              >
                <RotateCcw className="w-4 h-4 text-[#EF956F] shrink-0" />
                <span>New Game</span>
              </button>

              <button
                type="button"
                onClick={handleEndGame}
                className="min-h-[42px] px-3 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-extrabold transition shadow-xs flex items-center justify-center gap-1.5 active:scale-95"
              >
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Akhiri Permainan</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Mobile Dropdown Backdrop (closes dropdown cleanly when tapping outside) */}
      {isMobileMenuOpen && (
        <div
          aria-hidden="true"
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 z-30 bg-[#253451]/25 backdrop-blur-[1px] md:hidden"
        />
      )}
    </>
  );
};
