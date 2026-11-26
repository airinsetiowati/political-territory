import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Trash2, 
  Play, 
  Coins, 
  Clock, 
  Award, 
  Layers, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  Volume2, 
  VolumeX, 
  Edit3, 
  ShieldCheck, 
  ChevronRight,
  Check,
  Compass
} from 'lucide-react';
import { useGame } from '../context/GameContext';
import { PlayerColor } from '../types/game';
import { soundEffects } from '../services/audioService';
import { BrandLogo } from '../components/BrandLogo';
import { PlayerLogo } from '../components/PlayerLogo';

interface SetupPageProps {
  onStartGame: () => void;
}

interface PawnColorDef {
  id: PlayerColor;
  label: string;
  dotColor: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  activeRing: string;
  glow: string;
}

const PAWN_COLORS: PawnColorDef[] = [
  { 
    id: 'red', 
    label: 'Pion Merah', 
    dotColor: '#EF4444', 
    badgeBg: 'bg-red-500/10', 
    badgeBorder: 'border-red-400/40', 
    badgeText: 'text-red-700',
    activeRing: 'ring-red-500',
    glow: 'shadow-red-500/25'
  },
  { 
    id: 'blue', 
    label: 'Pion Biru', 
    dotColor: '#3B82F6', 
    badgeBg: 'bg-blue-500/10', 
    badgeBorder: 'border-blue-400/40', 
    badgeText: 'text-blue-700',
    activeRing: 'ring-blue-500',
    glow: 'shadow-blue-500/25'
  },
  { 
    id: 'green', 
    label: 'Pion Hijau', 
    dotColor: '#10B981', 
    badgeBg: 'bg-emerald-500/10', 
    badgeBorder: 'border-emerald-400/40', 
    badgeText: 'text-emerald-700',
    activeRing: 'ring-emerald-500',
    glow: 'shadow-emerald-500/25'
  },
  { 
    id: 'yellow', 
    label: 'Pion Kuning', 
    dotColor: '#F59E0B', 
    badgeBg: 'bg-amber-500/10', 
    badgeBorder: 'border-amber-400/40', 
    badgeText: 'text-amber-700',
    activeRing: 'ring-amber-500',
    glow: 'shadow-amber-500/25'
  },
];

/** SVG Board Game Pawn Icon */
const PawnIcon: React.FC<{ color: PlayerColor; className?: string }> = ({ color, className = "w-4 h-4" }) => {
  const colorDef = PAWN_COLORS.find(c => c.id === color) || PAWN_COLORS[0];
  return (
    <svg 
      viewBox="0 0 24 24" 
      fill="currentColor" 
      className={className} 
      style={{ color: colorDef.dotColor }}
      aria-hidden="true"
    >
      <circle cx="12" cy="5.5" r="3.2" />
      <path d="M8.5 10.5C8.5 9.5 10 9 12 9s3.5.5 3.5 1.5c0 1.8-.8 3.5-1.5 5h-4c-.7-1.5-1.5-3.2-1.5-5z" />
      <path d="M6.5 19.5c0-1.2 1.5-2.5 5.5-2.5s5.5 1.3 5.5 2.5c0 .8-.8 1.5-1.8 1.5H8.3c-1 0-1.8-.7-1.8-1.5z" />
    </svg>
  );
};

export const SetupPage: React.FC<SetupPageProps> = ({ onStartGame }) => {
  const { 
    players, 
    setPlayers,
    addPlayer, 
    removePlayer, 
    updatePlayer, 
    settings, 
    setEconomicInterval, 
    updateGameSettings, 
    startGame,
    toggleSound
  } = useGame();

  // Local state for Add Player form
  const [newPlayerName, setNewPlayerName] = useState('');
  const [selectedPawnColor, setSelectedPawnColor] = useState<PlayerColor>('green');

  // Custom economic interval input (in minutes)
  const [customIntervalMin, setCustomIntervalMin] = useState<string>(
    (settings.economicIntervalSeconds / 60).toString()
  );

  // Match duration timer (minimum 10 minutes)
  const [customGameDurationMin, setCustomGameDurationMin] = useState<string>(
    (settings.gameDurationMinutes || 30).toString()
  );

  // Global resource apply values
  const [globalGB, setGlobalGB] = useState<number>(20);
  const [globalVP, setGlobalVP] = useState<number>(0);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  // Deck drawer toggle for advanced setup
  const [showDeckSettings, setShowDeckSettings] = useState(false);

  const assignedColors = players.map(p => p.color);

  // Ensure selectedPawnColor for Add Player form is always an unassigned color
  useEffect(() => {
    if (assignedColors.includes(selectedPawnColor)) {
      const freeColor = PAWN_COLORS.find(c => !assignedColors.includes(c.id));
      if (freeColor) {
        setSelectedPawnColor(freeColor.id);
      }
    }
  }, [assignedColors, selectedPawnColor]);

  // Show temporary feedback toast
  const triggerToast = (msg: string) => {
    setFeedbackToast(msg);
    setTimeout(() => {
      setFeedbackToast(null);
    }, 2800);
  };

  // Switch a player's color
  const handlePlayerColorChange = (playerId: string, targetColor: PlayerColor) => {
    // If another player already uses this color, reject
    const isTaken = players.some(p => p.id !== playerId && p.color === targetColor);
    if (isTaken) {
      soundEffects.playClick();
      return;
    }

    soundEffects.playClick();
    setPlayers(players.map(p => {
      if (p.id === playerId) {
        return {
          ...p,
          id: targetColor,
          color: targetColor
        };
      }
      return p;
    }));
  };

  // Add a new player
  const handleAddPlayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (players.length >= 4) return;

    if (assignedColors.includes(selectedPawnColor)) {
      triggerToast(`Warna pion ${selectedPawnColor.toUpperCase()} sudah digunakan.`);
      return;
    }

    const defaultGb = settings.defaultStartingGB[players.length + 1] || 20;
    const nameToUse = newPlayerName.trim() || `Player ${players.length + 1}`;
    const success = addPlayer(nameToUse, selectedPawnColor);

    if (success) {
      soundEffects.playClick();
      setNewPlayerName('');
      // Auto select next available color
      const remainingColor = PAWN_COLORS.find(c => !assignedColors.includes(c.id) && c.id !== selectedPawnColor);
      if (remainingColor) {
        setSelectedPawnColor(remainingColor.id);
      }
      triggerToast(`${nameToUse} berhasil didaftarkan!`);
    }
  };

  // Remove player safely
  const handleRemovePlayer = (id: string, name: string) => {
    if (players.length <= 2) {
      triggerToast('Minimal 2 pemain diperlukan untuk bermain.');
      return;
    }
    soundEffects.playClick();
    removePlayer(id);
    triggerToast(`${name} telah dihapus.`);
  };

  // Bulk Apply GB to all players
  const handleApplyGlobalGB = (value: number) => {
    const val = Math.max(0, value);
    soundEffects.playClick();
    setPlayers(players.map(p => ({ ...p, budget: val })));
    triggerToast(`Modal awal seluruh pemain diset ke ${val} GB!`);
  };

  // Bulk Apply VP to all players
  const handleApplyGlobalVP = (value: number) => {
    const val = Math.max(0, value);
    soundEffects.playClick();
    setPlayers(players.map(p => ({ ...p, victoryPoints: val })));
    triggerToast(`Victory Points awal seluruh pemain diset ke ${val} VP!`);
  };

  // Interval selection handler
  const handleIntervalSelect = (seconds: number) => {
    soundEffects.playClick();
    setEconomicInterval(seconds);
    setCustomIntervalMin((seconds / 60).toString());
  };

  const handleCustomIntervalApply = () => {
    const mins = parseFloat(customIntervalMin);
    if (!isNaN(mins) && mins >= 0.5) {
      soundEffects.playClick();
      const secs = Math.round(mins * 60);
      setEconomicInterval(secs);
      triggerToast(`Durasi putaran diset ke ${mins} menit (${secs} detik)!`);
    } else {
      triggerToast('Durasi putaran minimal 0.5 menit (30 detik).');
    }
  };

  // Match timer configuration
  const handleGameDurationSelect = (minutes: number) => {
    soundEffects.playClick();
    updateGameSettings({
      gameDurationMinutes: minutes,
      gameTimerRemainingSeconds: minutes * 60,
    });
    setCustomGameDurationMin(minutes.toString());
  };

  const handleCustomGameDurationApply = () => {
    const raw = customGameDurationMin.trim();
    const mins = Number(raw);
    if (raw === '' || Number.isNaN(mins)) {
      triggerToast('Masukkan durasi menit yang valid.');
      return;
    }
    if (!Number.isInteger(mins)) {
      triggerToast('Durasi harus berupa angka menit bulat.');
      return;
    }
    if (mins < 10) {
      triggerToast('Durasi pertandingan minimal 10 menit.');
      return;
    }
    soundEffects.playClick();
    updateGameSettings({
      gameDurationMinutes: mins,
      gameTimerRemainingSeconds: mins * 60,
    });
    triggerToast(`Durasi pertandingan diset ke ${mins} menit.`);
  };

  // Validation before starting match
  const validationErrors: string[] = [];
  if (players.length < 2) {
    validationErrors.push('Minimal 2 pemain diperlukan untuk memulai pertandingan.');
  }
  if (players.length > 4) {
    validationErrors.push('Maksimal 4 pemain yang diizinkan dalam satu pertandingan.');
  }
  const hasEmptyName = players.some(p => !p.name || p.name.trim() === '');
  if (hasEmptyName) {
    validationErrors.push('Setiap pemain harus memiliki nama yang valid.');
  }
  const uniqueColors = new Set(players.map(p => p.color));
  if (uniqueColors.size !== players.length) {
    validationErrors.push('Setiap pemain wajib memiliki warna pion unik (tidak boleh kembar).');
  }
  const hasNegativeGB = players.some(p => p.budget < 0);
  if (hasNegativeGB) {
    validationErrors.push('Government Budget (GB) awal pemain tidak boleh bernilai negatif.');
  }
  if (settings.economicIntervalSeconds < 10) {
    validationErrors.push('Interval siklus ekonomi harus minimal 10 detik.');
  }
  if (!settings.gameDurationMinutes || settings.gameDurationMinutes < 10) {
    validationErrors.push('Durasi pertandingan (Match Timer) minimal 10 menit.');
  }

  const isConfigurationValid = validationErrors.length === 0;

  // Handle Start Game
  const handleStart = () => {
    const rawDuration = customGameDurationMin.trim();
    const parsedDuration = Number(rawDuration);
    const customDurationValid =
      rawDuration !== '' &&
      !Number.isNaN(parsedDuration) &&
      Number.isInteger(parsedDuration) &&
      parsedDuration >= 10;
    if (customDurationValid) {
      updateGameSettings({
        gameDurationMinutes: parsedDuration,
        gameTimerRemainingSeconds: parsedDuration * 60,
      });
    }

    const effectiveDurationValid = customDurationValid || (Number(settings.gameDurationMinutes) || 0) >= 10;
    const blockingErrors = validationErrors.filter(e => !e.includes('Durasi pertandingan (Match Timer)'));
    if (!effectiveDurationValid) {
      blockingErrors.push('Durasi pertandingan (Match Timer) minimal 10 menit.');
    }

    if (blockingErrors.length > 0) {
      soundEffects.playClick();
      triggerToast(blockingErrors[0] || 'Konfigurasi belum lengkap.');
      return;
    }

    soundEffects.playClaim();
    startGame();
    onStartGame();
  };

  // Economic interval presets
  const intervalPresets = [
    { label: '1 Menit', seconds: 60, note: 'Tes Cepat' },
    { label: '3 Menit', seconds: 180, note: 'Tempo Cepat' },
    { label: '5 Menit', seconds: 300, note: 'Turnamen Resmi', isOfficial: true },
    { label: '10 Menit', seconds: 600, note: 'Strategis' },
    { label: '15 Menit', seconds: 900, note: 'Santai' },
    { label: '30 Menit', seconds: 1800, note: 'Panjang' },
  ];

  // Match duration presets (minimum 10 minutes)
  const gameDurationPresets = [10, 15, 20, 30, 45, 60];

  // Starting resources calculation for summary
  const totalCirculatingGB = players.reduce((acc, p) => acc + (p.budget || 0), 0);
  const averageGB = players.length > 0 ? Math.round(totalCirculatingGB / players.length) : 0;
  const startingVPValue = players[0]?.victoryPoints ?? 0;

  return (
    <div className="min-h-screen bg-[#F0ECE1] text-[#253451] font-sans antialiased selection:bg-[#F4CE70] selection:text-[#253451] pb-20">
      
      {/* Toast Notification */}
      {feedbackToast && (
        <div className="fixed top-5 right-5 z-50 bg-[#253451] text-white text-xs font-bold px-4 py-2.5 rounded-2xl shadow-soft-md border border-[#F4CE70]/40 flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <Sparkles className="w-3.5 h-3.5 text-[#F4CE70]" />
          <span>{feedbackToast}</span>
        </div>
      )}

      {/* =========================================================================
          SECTION A: HEADER (Clean, Professional, Compact)
          ========================================================================= */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#EAE9E3] shadow-soft-sm px-4 sm:px-8 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          
          {/* Logo & Game Title */}
          <div className="flex items-center gap-3">
            {/* Official Political Territory Logo */}
            <BrandLogo
              alt="Political Territory"
              className="h-10 w-auto rounded-xl shrink-0"
              draggable={false}
            />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-display font-black text-sm sm:text-base tracking-wide text-[#253451] uppercase">
                  POLITICAL TERRITORY
                </span>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-800 border border-amber-400/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  GAME SETUP
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-[#253451]/60">
                BUILD, GOVERN, PROSPER
              </p>
            </div>
          </div>

          {/* Right Controls: Status & Audio Toggle */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F8F5EC] border border-[#EAE9E3] text-[11px] font-bold text-[#253451]/75">
              <span>Sesi Belum Dimulai</span>
            </div>

            <button
              type="button"
              onClick={toggleSound}
              className="p-2 rounded-xl bg-[#F8F5EC] hover:bg-[#EAE9E3] text-[#253451] border border-[#EAE9E3] transition shadow-2xs"
              title={settings.soundEnabled ? 'Matikan Suara Audio' : 'Aktifkan Suara Audio'}
            >
              {settings.soundEnabled ? (
                <Volume2 className="w-4 h-4 text-[#73B77A]" />
              ) : (
                <VolumeX className="w-4 h-4 text-[#253451]/40" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 space-y-6 sm:space-y-8 animate-in fade-in duration-300">
        
        {/* =========================================================================
            SECTION B: WELCOME SECTION (Strategic Aura & Session Title)
            ========================================================================= */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EAE9E3] shadow-soft-sm relative overflow-hidden">
          {/* Subtle background graphic motif */}
          <div className="absolute -right-8 -top-8 w-44 h-44 rounded-full bg-[#F4CE70]/10 blur-2xl pointer-events-none" />
          <div className="absolute right-12 bottom-0 w-32 h-32 rounded-full bg-[#EF956F]/10 blur-xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="max-w-2xl space-y-2">
              {/* Official Game Logo (Main Menu) */}
              <BrandLogo
                alt="Political Territory — Board Game"
                className="h-24 sm:h-32 w-auto max-w-full rounded-2xl"
                draggable={false}
              />
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F8F5EC] border border-[#EAE9E3] text-[11px] font-extrabold uppercase tracking-wider text-[#253451]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#EF956F]" />
                <span>Strategic Command & Game Setup</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-display font-black text-[#253451] tracking-tight">
                PREPARE YOUR TERRITORY
              </h1>
              <p className="text-xs sm:text-sm text-[#253451]/75 leading-relaxed font-medium">
                Configure your players, resources, and game settings before entering the political battlefield. Atur komposisi pemain, warna pion resmi, modal kas awal (GB), dan frekuensi siklus ekonomi sebelum memulai perebutan kekuasaan.
              </p>
            </div>

            {/* Match Title Input Field */}
            <div className="bg-[#F8F5EC] border border-[#EAE9E3] rounded-2xl p-4 sm:p-5 shrink-0 w-full lg:w-80 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#253451]/60 flex items-center gap-1">
                  <Edit3 className="w-3 h-3 text-[#253451]/60" />
                  Nama Sesi Pertandingan
                </span>
                <span className="text-[10px] font-extrabold text-[#73B77A]">Official Campaign</span>
              </div>
              <input
                type="text"
                value={settings.gameTitle || 'POLITICAL TERRITORY: PREMIER CAMPAIGN'}
                onChange={e => updateGameSettings({ gameTitle: e.target.value })}
                placeholder="Judul Pertandingan..."
                className="w-full bg-white border border-[#EAE9E3] rounded-xl px-3 py-2 text-xs font-display font-extrabold text-[#253451] outline-none focus:border-[#253451] transition"
              />
            </div>
          </div>
        </section>

        {/* Validation Errors Notice (if any) */}
        {!isConfigurationValid && (
          <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-xs text-amber-900 font-semibold space-y-1 animate-in fade-in">
            <div className="flex items-center gap-2 font-bold text-amber-950">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Harap lengkapi konfigurasi berikut sebelum memulai permainan:</span>
            </div>
            <ul className="list-disc list-inside pl-5 space-y-0.5 text-[11px] text-amber-900/80">
              {validationErrors.map((err, idx) => (
                <li key={idx}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        {/* =========================================================================
            SECTION C: PLAYER CONFIGURATION (Main Section, Responsive Cards Grid)
            ========================================================================= */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EAE9E3] shadow-soft-sm space-y-6">
          
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EAE9E3] pb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-[#EF956F]/15 border border-[#EF956F]/30 flex items-center justify-center text-[#EF956F]">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-display font-black text-lg text-[#253451] tracking-tight">
                  Pengaturan Pemain & Pion
                </h2>
                <p className="text-xs text-[#253451]/60 font-medium">
                  Setiap pemain memiliki pion unik, nama kustom, dan alokasi modal awal (GB).
                </p>
              </div>
            </div>

            {/* Player Count Badge */}
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="px-3 py-1 rounded-full bg-[#F8F5EC] border border-[#EAE9E3] text-xs font-extrabold text-[#253451]">
                {players.length} / 4 Pemain Terdaftar
              </span>
              <span className="text-[11px] text-[#253451]/50 font-bold hidden sm:inline">
                (Min. 2 - Maks. 4)
              </span>
            </div>
          </div>

          {/* Player Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-5">
            {players.map((player, idx) => {
              const currentColorDef = PAWN_COLORS.find(c => c.id === player.color) || PAWN_COLORS[0];
              const isRemovable = players.length > 2;

              return (
                <div 
                  key={player.id}
                  className={`bg-[#F8F5EC] border rounded-2xl p-5 space-y-4 transition-all duration-200 relative ${
                    player.color === 'red' ? 'border-red-300/80 shadow-soft-sm' :
                    player.color === 'blue' ? 'border-blue-300/80 shadow-soft-sm' :
                    player.color === 'green' ? 'border-emerald-300/80 shadow-soft-sm' :
                    'border-amber-300/80 shadow-soft-sm'
                  }`}
                >
                  {/* Card Header: Player Number + Pawn Preview Badge + Remove Button */}
                  <div className="flex items-center justify-between gap-2 border-b border-[#EAE9E3]/70 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-lg bg-white border border-[#EAE9E3] text-[10px] font-extrabold uppercase tracking-wider text-[#253451]">
                        Pemain #{idx + 1}
                      </span>
                      
                      {/* Pawn Color Preview Indicator */}
                      <div className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[11px] font-extrabold ${currentColorDef.badgeBg} ${currentColorDef.badgeBorder} ${currentColorDef.badgeText}`}>
                        <PawnIcon color={player.color} className="w-3.5 h-3.5" />
                        <span>{currentColorDef.label}</span>
                      </div>
                    </div>

                    {/* Remove Player Button */}
                    <button
                      type="button"
                      onClick={() => handleRemovePlayer(player.id, player.name)}
                      disabled={!isRemovable}
                      className={`p-1.5 rounded-xl transition ${
                        isRemovable 
                          ? 'text-[#253451]/50 hover:text-red-600 hover:bg-white cursor-pointer' 
                          : 'text-[#253451]/20 cursor-not-allowed'
                      }`}
                      title={isRemovable ? `Hapus ${player.name}` : 'Minimal 2 pemain diperlukan'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Player Name Input */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold uppercase tracking-wider text-[#253451]/60 flex items-center justify-between">
                      <span>Nama Pemain</span>
                      <span className="text-[9px] font-medium text-[#253451]/40">Ketik untuk mengubah</span>
                    </label>
                    <input
                      type="text"
                      value={player.name}
                      onChange={e => updatePlayer(player.id, { name: e.target.value })}
                      placeholder={`Nama Pemain ${idx + 1}...`}
                      className="w-full bg-white border border-[#EAE9E3] rounded-xl px-3.5 py-2 text-xs font-bold text-[#253451] outline-none focus:border-[#253451] transition"
                    />
                  </div>

                  {/* Pawn Color Selector (Unique Color Rule) */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-extrabold uppercase tracking-wider text-[#253451]/60">
                        Pilihan Warna Pion
                      </label>
                      <span className="text-[9px] text-[#253451]/40 font-medium">1 Warna per Pemain</span>
                    </div>

                    <div className="grid grid-cols-4 gap-1.5">
                      {PAWN_COLORS.map(c => {
                        const isCurrent = player.color === c.id;
                        const isTakenByOther = players.some(p => p.id !== player.id && p.color === c.id);

                        return (
                          <button
                            key={c.id}
                            type="button"
                            disabled={isTakenByOther}
                            onClick={() => handlePlayerColorChange(player.id, c.id)}
                            className={`py-1.5 px-1 rounded-xl text-[10px] font-extrabold flex items-center justify-center gap-1 transition border ${
                              isCurrent
                                ? `${c.badgeBg} ${c.badgeBorder} ${c.badgeText} ring-2 ${c.activeRing} shadow-2xs font-black`
                                : isTakenByOther
                                ? 'bg-white/40 text-[#253451]/30 border-[#EAE9E3] opacity-40 cursor-not-allowed line-through'
                                : 'bg-white hover:bg-[#F8F5EC] text-[#253451] border-[#EAE9E3] hover:border-[#253451]/40 cursor-pointer'
                            }`}
                            title={isCurrent ? 'Warna Aktif Terpilih' : isTakenByOther ? 'Sudah dipakai pemain lain' : `Ganti ke ${c.label}`}
                          >
                            <span 
                              className="w-2.5 h-2.5 rounded-full shrink-0" 
                              style={{ backgroundColor: c.dotColor }}
                            />
                            <span className="capitalize truncate text-[10px]">{c.id}</span>
                            {isCurrent && <Check className="w-2.5 h-2.5 ml-0.5 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Optional Custom Logo Upload */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-extrabold uppercase tracking-wider text-[#253451]/60">
                        Logo Khusus Pemain (Opsional)
                      </label>
                      {player.customLogo && (
                        <button
                          type="button"
                          onClick={() => updatePlayer(player.id, { customLogo: undefined })}
                          className="text-[9px] text-red-600 font-bold hover:underline"
                        >
                          Hapus
                        </button>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full overflow-hidden shrink-0">
                        <PlayerLogo player={player} size="full" />
                      </div>
                      <label className="flex-1 cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (ev) => {
                                const dataUrl = ev.target?.result as string;
                                if (dataUrl) updatePlayer(player.id, { customLogo: dataUrl });
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                        <span className="inline-block text-[10px] font-bold px-2.5 py-1 rounded-xl bg-white border border-[#EAE9E3] hover:bg-[#F8F5EC] text-[#253451] transition">
                          {player.customLogo ? 'Ganti Logo...' : 'Unggah Logo Gambar...'}
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Player Initial Resources (GB & VP) */}
                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#EAE9E3]/70">
                    {/* GB Input */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold uppercase tracking-wider text-[#253451]/60 flex items-center gap-1">
                        <Coins className="w-3 h-3 text-amber-500" />
                        <span>Modal Awal (GB)</span>
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          value={player.budget}
                          onChange={e => updatePlayer(player.id, { budget: Math.max(0, parseInt(e.target.value) || 0) })}
                          className="w-full bg-white border border-[#EAE9E3] rounded-xl px-3 py-1.5 text-xs font-mono font-black text-[#253451] outline-none focus:border-[#253451] transition"
                        />
                        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[#253451]/40 pointer-events-none">
                          GB
                        </span>
                      </div>
                    </div>

                    {/* VP Input */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold uppercase tracking-wider text-[#253451]/60 flex items-center gap-1">
                        <Award className="w-3 h-3 text-blue-500" />
                        <span>VP Awal</span>
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          value={player.victoryPoints}
                          onChange={e => updatePlayer(player.id, { victoryPoints: Math.max(0, parseInt(e.target.value) || 0) })}
                          className="w-full bg-white border border-[#EAE9E3] rounded-xl px-3 py-1.5 text-xs font-mono font-black text-blue-700 outline-none focus:border-[#253451] transition"
                        />
                        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[#253451]/40 pointer-events-none">
                          VP
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Add Player Card (If < 4 players) */}
            {players.length < 4 && (
              <form 
                onSubmit={handleAddPlayer} 
                className="bg-white border-2 border-dashed border-[#EAE9E3] hover:border-[#EF956F]/60 rounded-2xl p-5 flex flex-col justify-between space-y-4 transition"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-[#EAE9E3]/70 pb-2">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-[#253451] flex items-center gap-1.5">
                      <Plus className="w-4 h-4 text-[#EF956F]" />
                      Tambah Pemain #{players.length + 1}
                    </span>
                    <span className="text-[10px] font-bold text-[#73B77A]">Slot Tersedia</span>
                  </div>

                  {/* Name Input */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold uppercase tracking-wider text-[#253451]/60">
                      Nama Calon Pemain
                    </label>
                    <input
                      type="text"
                      value={newPlayerName}
                      onChange={e => setNewPlayerName(e.target.value)}
                      placeholder={`Contoh: Player ${players.length + 1}`}
                      className="w-full bg-[#F8F5EC] border border-[#EAE9E3] rounded-xl px-3.5 py-2 text-xs font-bold text-[#253451] outline-none focus:border-[#253451] transition"
                    />
                  </div>

                  {/* Pawn Color Selector for New Player */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold uppercase tracking-wider text-[#253451]/60">
                      Pilih Warna Pion Tersedia
                    </label>
                    <div className="grid grid-cols-4 gap-1.5">
                      {PAWN_COLORS.map(c => {
                        const isTaken = assignedColors.includes(c.id);
                        const isSelected = selectedPawnColor === c.id;

                        return (
                          <button
                            key={c.id}
                            type="button"
                            disabled={isTaken}
                            onClick={() => setSelectedPawnColor(c.id)}
                            className={`py-1.5 px-1 rounded-xl text-[10px] font-extrabold flex items-center justify-center gap-1 transition border ${
                              isSelected
                                ? `${c.badgeBg} ${c.badgeBorder} ${c.badgeText} ring-2 ${c.activeRing} shadow-2xs font-black`
                                : isTaken
                                ? 'bg-[#F8F5EC] text-[#253451]/30 border-[#EAE9E3] opacity-35 cursor-not-allowed line-through'
                                : 'bg-[#F8F5EC] hover:bg-white text-[#253451] border-[#EAE9E3] hover:border-[#253451]/40'
                            }`}
                          >
                            <span 
                              className="w-2.5 h-2.5 rounded-full shrink-0" 
                              style={{ backgroundColor: c.dotColor }}
                            />
                            <span className="capitalize truncate text-[10px]">{c.id}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-[#253451] hover:bg-[#1C273D] text-white font-extrabold text-xs tracking-wider transition flex items-center justify-center gap-2 shadow-2xs active:scale-[0.99]"
                >
                  <Plus className="w-4 h-4 text-[#F4CE70]" />
                  <span>Daftarkan Pemain #{players.length + 1}</span>
                </button>
              </form>
            )}
          </div>
        </section>

        {/* =========================================================================
            SECTIONS D & E: SIDE-BY-SIDE PANELS (Initial Resources & Economic Settings)
            ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

          {/* -----------------------------------------------------------------------
              SECTION D: INITIAL RESOURCES (Sumber Daya Awal)
              ----------------------------------------------------------------------- */}
          <section className="bg-white rounded-3xl p-6 sm:p-7 border border-[#EAE9E3] shadow-soft-sm space-y-5 flex flex-col">
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-center gap-3 border-b border-[#EAE9E3] pb-3">
                <div className="w-9 h-9 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-600">
                  <Coins className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-display font-black text-base text-[#253451]">
                    Sumber Daya Awal
                  </h2>
                  <p className="text-xs text-[#253451]/60 font-medium">
                    Atur GB dan VP awal pemain.
                  </p>
                </div>
              </div>

              {/* Tournament Presets according to player count */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-[#253451]/60">
                    Preset Standar Turnamen Resmi:
                  </label>
                  <span className="text-[10px] text-[#73B77A] font-bold">Rekomendasi Resmi</span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: '25 GB', desc: 'Standar 2 Pemain', amount: 25 },
                    { label: '20 GB', desc: 'Standar 3 Pemain', amount: 20 },
                    { label: '15 GB', desc: 'Standar 4 Pemain', amount: 15 },
                  ].map(preset => (
                    <button
                      key={preset.amount}
                      type="button"
                      onClick={() => {
                        setGlobalGB(preset.amount);
                        handleApplyGlobalGB(preset.amount);
                      }}
                      className="p-2.5 rounded-xl border border-[#EAE9E3] bg-[#F8F5EC] hover:bg-white hover:border-[#253451] transition text-center group"
                    >
                      <div className="font-display font-black text-sm text-[#253451] group-hover:text-amber-600">
                        {preset.label}
                      </div>
                      <div className="text-[9px] text-[#253451]/60 font-semibold truncate">
                        {preset.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Global GB Input */}
              <div className="space-y-1.5 pt-2">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-[#253451]/60">
                  GB Kustom (Semua Pemain)
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="number"
                      min="0"
                      value={globalGB}
                      onChange={e => setGlobalGB(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full bg-[#F8F5EC] border border-[#EAE9E3] rounded-xl px-3 py-2 text-xs font-mono font-bold text-[#253451] outline-none focus:border-[#253451]"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[#253451]/40 pointer-events-none">
                      GB
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleApplyGlobalGB(globalGB)}
                    className="px-4 py-2 rounded-xl bg-[#253451] hover:bg-[#1C273D] text-white font-bold text-xs tracking-wide transition shrink-0 shadow-2xs"
                  >
                    Terapkan GB
                  </button>
                </div>
              </div>

              {/* Starting VP Settings */}
              <div className="space-y-1.5 pt-1">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-[#253451]/60">
                  VP Awal (Semua Pemain, Standar 0)
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="number"
                      min="0"
                      value={globalVP}
                      onChange={e => setGlobalVP(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full bg-[#F8F5EC] border border-[#EAE9E3] rounded-xl px-3 py-2 text-xs font-mono font-bold text-blue-700 outline-none focus:border-[#253451]"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[#253451]/40 pointer-events-none">
                      VP
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleApplyGlobalVP(globalVP)}
                    className="px-4 py-2 rounded-xl bg-[#F8F5EC] hover:bg-[#EAE9E3] text-[#253451] font-bold text-xs border border-[#EAE9E3] transition shrink-0"
                  >
                    Terapkan VP
                  </button>
                </div>
              </div>
            </div>

            <div className="p-3 bg-[#F8F5EC] border border-[#EAE9E3] rounded-2xl text-[11px] text-[#253451]/75 leading-relaxed font-medium">
              <span className="font-extrabold text-[#253451] block mb-0.5">Catatan:</span>
              GB/VP bisa diterapkan ke semua pemain atau diatur per pemain pada kartu di atas.
            </div>
          </section>

          {/* -----------------------------------------------------------------------
              SECTION E: ECONOMIC SETTINGS (Pengaturan Ekonomi Awal)
              ----------------------------------------------------------------------- */}
          <section className="bg-white rounded-3xl p-6 sm:p-7 border border-[#EAE9E3] shadow-soft-sm space-y-5 flex flex-col">
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-center gap-3 border-b border-[#EAE9E3] pb-3">
                <div className="w-9 h-9 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-600">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-display font-black text-base text-[#253451]">
                    Pengaturan Ekonomi
                  </h2>
                  <p className="text-xs text-[#253451]/60 font-medium">
                    Atur interval distribusi pendapatan ekonomi.
                  </p>
                </div>
              </div>

              {/* Duration Presets */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-[#253451]/60">
                    Pilihan Durasi Putaran:
                  </label>
                  <span className="text-[10px] text-[#253451]/50 font-bold">Standar: 5 Menit</span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {intervalPresets.map(preset => {
                    const isSelected = settings.economicIntervalSeconds === preset.seconds;
                    return (
                      <button
                        key={preset.seconds}
                        type="button"
                        onClick={() => handleIntervalSelect(preset.seconds)}
                        className={`p-2.5 rounded-xl border text-center transition ${
                          isSelected
                            ? 'bg-[#253451] text-white border-[#253451] shadow-2xs font-extrabold'
                            : 'bg-[#F8F5EC] border-[#EAE9E3] text-[#253451] hover:bg-white hover:border-[#253451]/40 font-bold'
                        }`}
                      >
                        <div className="text-xs font-display">{preset.label}</div>
                        <div className={`text-[9px] truncate ${isSelected ? 'text-[#F4CE70]' : 'text-[#253451]/50'}`}>
                          {preset.note}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Minutes Input */}
              <div className="space-y-1.5 pt-1">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-[#253451]/60">
                  Kustom Menit Putaran:
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    value={customIntervalMin}
                    onChange={e => setCustomIntervalMin(e.target.value)}
                    placeholder="Contoh: 5 atau 7.5"
                    className="w-full bg-[#F8F5EC] border border-[#EAE9E3] rounded-xl px-3 py-2 text-xs font-mono font-bold text-[#253451] outline-none focus:border-[#253451]"
                  />
                  <button
                    type="button"
                    onClick={handleCustomIntervalApply}
                    className="px-4 py-2 rounded-xl bg-[#F8F5EC] hover:bg-[#EAE9E3] text-[#253451] font-bold text-xs border border-[#EAE9E3] transition shrink-0"
                  >
                    Terapkan
                  </button>
                </div>
              </div>

              {/* Active Cycle Badge (Note: Timer countdown does NOT run before Start Game) */}
              <div className="p-3 bg-[#F8F5EC] rounded-2xl border border-[#EAE9E3] flex justify-between items-center text-xs font-bold text-[#253451]">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#73B77A]" />
                  Interval Siklus Terpilih:
                </span>
                <span className="font-mono text-sm font-extrabold text-[#EF956F]">
                  {Math.floor(settings.economicIntervalSeconds / 60)}m {settings.economicIntervalSeconds % 60 > 0 ? `${settings.economicIntervalSeconds % 60}s` : '00s'}
                </span>
              </div>

              {/* Match Timer Configuration */}
              <div className="space-y-2.5 pt-3 border-t border-[#EAE9E3]">
                <div className="flex items-center justify-between gap-2">
                  <label className="text-[11px] font-extrabold uppercase tracking-wider text-[#253451]/65">
                    Durasi Pertandingan (Match Timer)
                  </label>
                  <span className="text-[10px] text-[#EF956F] font-bold shrink-0">Min. 10 menit</span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {gameDurationPresets.map(minutes => {
                    const isSelected = (settings.gameDurationMinutes || 30) === minutes;
                    return (
                      <button
                        key={minutes}
                        type="button"
                        onClick={() => handleGameDurationSelect(minutes)}
                        className={`p-2 rounded-xl border text-center transition ${
                          isSelected
                            ? 'bg-[#253451] text-white border-[#253451] shadow-2xs font-extrabold'
                            : 'bg-[#F8F5EC] border-[#EAE9E3] text-[#253451] hover:bg-white hover:border-[#253451]/40 font-bold'
                        }`}
                      >
                        <div className="text-xs font-display">{minutes} Menit</div>
                        <div className={`text-[9px] ${isSelected ? 'text-[#F4CE70]' : 'text-[#253451]/50'}`}>
                          {minutes === 30 ? 'Standar' : 'Preset'}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-[#253451]/60">
                    Custom Duration (menit)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min="10"
                      step="1"
                      value={customGameDurationMin}
                      onChange={e => setCustomGameDurationMin(e.target.value)}
                      placeholder="Contoh: 25, 40, 75"
                      className="w-full bg-[#F8F5EC] border border-[#EAE9E3] rounded-xl px-3 py-2 text-xs font-mono font-bold text-[#253451] outline-none focus:border-[#253451]"
                    />
                    <button
                      type="button"
                      onClick={handleCustomGameDurationApply}
                      className="px-4 py-2 rounded-xl bg-[#253451] hover:bg-[#1C273D] text-white font-bold text-xs transition shrink-0"
                    >
                      Terapkan
                    </button>
                  </div>
                  {!gameDurationPresets.includes(settings.gameDurationMinutes || 30) && (
                    <div className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-2 py-1 inline-flex">
                      Durasi custom aktif: {settings.gameDurationMinutes} menit
                    </div>
                  )}
                </div>

                <div className="p-3 bg-[#253451] text-white rounded-2xl flex justify-between items-center text-xs font-bold gap-2">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#F4CE70]" />
                    <span>Match Timer Dimulai Saat Start</span>
                  </span>
                  <span className="font-mono text-sm font-extrabold text-[#F4CE70] shrink-0">
                    {settings.gameDurationMinutes || 30} Menit
                  </span>
                </div>
              </div>
            </div>

            {/* Explanatory Rule Callout */}
            <div className="p-3 bg-[#F8F5EC] border border-[#EAE9E3] rounded-2xl text-[11px] text-[#253451]/75 leading-relaxed font-medium">
              <span className="font-extrabold text-[#253451] block mb-0.5">Mekanisme Timer:</span>
              Timer ekonomi mulai setelah <strong>Start Game</strong>. Pendapatan wilayah dan Opportunity dibagikan saat timer mencapai 00:00.
            </div>
          </section>
        </div>

        {/* =========================================================================
            ADDITIONAL OPTIONS: ACTIVE CARD DECKS (Optional Collapsible Drawer)
            ========================================================================= */}
        <section className="bg-white rounded-3xl p-5 sm:p-6 border border-[#EAE9E3] shadow-soft-sm space-y-4">
          <div className="flex items-center justify-between cursor-pointer" onClick={() => setShowDeckSettings(!showDeckSettings)}>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-display font-extrabold text-sm text-[#253451]">
                  Deck Kartu Aktif Pertandingan
                </h3>
                <p className="text-[11px] text-[#253451]/60 font-medium">
                  Kebijakan Policy, Crisis, Mission, dan Opportunity Cards.
                </p>
              </div>
            </div>

            <button
              type="button"
              className="text-xs font-bold text-[#253451]/70 hover:text-[#253451] flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#F8F5EC] border border-[#EAE9E3]"
            >
              <span>{showDeckSettings ? 'Sembunyikan' : 'Kelola Deck'}</span>
              <ChevronRight className={`w-3.5 h-3.5 transition-transform duration-200 ${showDeckSettings ? 'rotate-90' : ''}`} />
            </button>
          </div>

          {showDeckSettings && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-[#EAE9E3] animate-in fade-in duration-200">
              {[
                { key: 'policy', label: 'Policy Cards', count: '50 Kartu', desc: 'Penguasaan & Bebas Pilih' },
                { key: 'crisis', label: 'Crisis Cards', count: '20 Kartu', desc: 'Dilema darurat & fiskal' },
                { key: 'mission', label: 'Mission Cards', count: '15 Kartu', desc: 'Quest target strategis' },
                { key: 'opportunity', label: 'Opportunity Cards', count: '15 Kartu', desc: 'Dividen stimulus berkala' },
              ].map(deck => {
                const isChecked = settings.availableDecks?.[deck.key as keyof typeof settings.availableDecks] ?? true;
                return (
                  <label 
                    key={deck.key}
                    className={`flex items-start justify-between p-3 rounded-2xl border cursor-pointer transition select-none ${
                      isChecked 
                        ? 'bg-[#F8F5EC] border-[#253451]/20 shadow-2xs' 
                        : 'bg-white border-[#EAE9E3] opacity-60'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-black text-[#253451]">{deck.label}</div>
                      <div className="text-[10px] text-[#EF956F] font-bold">{deck.count}</div>
                      <div className="text-[9px] text-[#253451]/60 mt-0.5">{deck.desc}</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={e => {
                        const current = settings.availableDecks || { policy: true, crisis: true, mission: true, opportunity: true };
                        updateGameSettings({
                          availableDecks: {
                            ...current,
                            [deck.key]: e.target.checked
                          }
                        });
                      }}
                      className="w-4 h-4 mt-0.5 rounded text-[#253451] accent-[#253451]"
                    />
                  </label>
                );
              })}
            </div>
          )}
        </section>

        {/* =========================================================================
            SECTION F: GAME SUMMARY (Overview Panel, Auto-updating)
            ========================================================================= */}
        <section className="bg-gradient-to-br from-white to-[#F8F5EC] rounded-3xl p-6 sm:p-8 border border-[#EAE9E3] shadow-soft-sm space-y-5">
          <div className="flex items-center gap-3 border-b border-[#EAE9E3] pb-3">
            <div className="w-9 h-9 rounded-2xl bg-[#73B77A]/15 border border-[#73B77A]/30 flex items-center justify-center text-[#73B77A]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-black text-base text-[#253451]">
                Ringkasan Konfigurasi Pertandingan (Game Summary)
              </h2>
              <p className="text-xs text-[#253451]/60 font-medium">
                Parameter lengkap yang akan diterapkan saat memasuki game map.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4">
            
            {/* Metric 1: Total Players */}
            <div className="bg-white border border-[#EAE9E3] rounded-2xl p-4 space-y-1 shadow-2xs">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#253451]/50 block">
                Total Pemain
              </span>
              <div className="font-display font-black text-xl text-[#253451]">
                {players.length} Pemain
              </div>
              <span className={`text-[10px] font-bold inline-flex items-center gap-1 ${
                players.length >= 2 && players.length <= 4 ? 'text-[#73B77A]' : 'text-amber-600'
              }`}>
                {players.length >= 2 && players.length <= 4 ? '✓ Memenuhi Syarat' : '⚠️ Min. 2 Pemain'}
              </span>
            </div>

            {/* Metric 2: Registered Pawns */}
            <div className="bg-white border border-[#EAE9E3] rounded-2xl p-4 space-y-1 shadow-2xs">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#253451]/50 block">
                Pion Terdaftar
              </span>
              <div className="flex items-center gap-1.5 pt-1 flex-wrap">
                {players.map(p => (
                  <span
                    key={p.id}
                    className="w-4 h-4 rounded-full border border-white shadow-2xs inline-block"
                    style={{
                      backgroundColor: PAWN_COLORS.find(c => c.id === p.color)?.dotColor || '#999'
                    }}
                    title={`${p.name} (${p.color.toUpperCase()})`}
                  />
                ))}
              </div>
              <span className="text-[10px] font-bold text-[#253451]/60 block truncate">
                {players.map(p => p.color.toUpperCase()).join(' • ')}
              </span>
            </div>

            {/* Metric 3: Starting GB */}
            <div className="bg-white border border-[#EAE9E3] rounded-2xl p-4 space-y-1 shadow-2xs">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#253451]/50 block">
                Kas Awal (GB)
              </span>
              <div className="font-display font-black text-xl text-amber-600">
                {averageGB} GB
              </div>
              <span className="text-[10px] font-bold text-[#253451]/60 block truncate">
                Bank: {totalCirculatingGB} GB
              </span>
            </div>

            {/* Metric 4: Starting VP */}
            <div className="bg-white border border-[#EAE9E3] rounded-2xl p-4 space-y-1 shadow-2xs">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#253451]/50 block">
                VP Awal
              </span>
              <div className="font-display font-black text-xl text-blue-600">
                {startingVPValue} VP
              </div>
              <span className="text-[10px] font-bold text-[#253451]/60 block">
                Per Pemain
              </span>
            </div>

            {/* Metric 5: Round Duration */}
            <div className="bg-white border border-[#EAE9E3] rounded-2xl p-4 space-y-1 shadow-2xs">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#253451]/50 block">
                Siklus Ekonomi
              </span>
              <div className="font-display font-black text-xl text-[#EF956F]">
                {Math.floor(settings.economicIntervalSeconds / 60)} Menit
              </div>
              <span className="text-[10px] font-bold text-[#253451]/60 block">
                Siklus Otomatis
              </span>
            </div>

            {/* Metric 6: Match Timer */}
            <div className="bg-white border border-[#EAE9E3] rounded-2xl p-4 space-y-1 shadow-2xs col-span-2 lg:col-span-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#253451]/50 block">
                Durasi Pertandingan
              </span>
              <div className="font-display font-black text-xl text-[#253451]">
                {settings.gameDurationMinutes || 30} Menit
              </div>
              <span className="text-[10px] font-bold text-[#73B77A] block">
                Match Timer Tersinkron
              </span>
            </div>
          </div>
        </section>

        {/* =========================================================================
            SECTION G: START GAME ACTION SECTION (Prominent, Safe, Validated)
            ========================================================================= */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EAE9E3] shadow-soft-md text-center space-y-5">
          
          <div className="max-w-xl mx-auto space-y-1.5">
            <h3 className="font-display font-black text-xl sm:text-2xl text-[#253451] tracking-tight">
              Siap Memasuki Arena Politik?
            </h3>
            <p className="text-xs sm:text-sm text-[#253451]/75 leading-relaxed font-medium">
              Setelah menekan tombol di bawah, papan peta wilayah akan aktif, siklus ekonomi otomatis akan mulai berjalan, dan seluruh aksi strategis dapat dimulai.
            </p>
          </div>

          {/* Validation Status Indicator */}
          <div className="flex items-center justify-center">
            {isConfigurationValid ? (
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#73B77A]/15 border border-[#73B77A]/30 text-xs font-black text-[#2e6d34]">
                <CheckCircle2 className="w-4 h-4 text-[#73B77A]" />
                <span>Konfigurasi Lengkap • Siap Memulai Permainan</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-xs font-black text-amber-800">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span>{validationErrors[0] || 'Konfigurasi belum memenuhi syarat'}</span>
              </div>
            )}
          </div>

          {/* Primary START GAME Button */}
          <div className="max-w-md mx-auto pt-2">
            <button
              type="button"
              onClick={handleStart}
              disabled={!isConfigurationValid}
              className={`w-full py-4 sm:py-5 px-8 rounded-2xl font-display font-black text-base sm:text-lg uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-3 shadow-soft-md game-press ${
                isConfigurationValid
                  ? 'bg-gradient-to-r from-[#F4CE70] via-[#EF956F] to-[#F4CE70] bg-[length:200%_auto] hover:bg-right text-[#253451] hover:scale-[1.01] active:scale-[0.98] cursor-pointer'
                  : 'bg-[#EAE9E3] text-[#253451]/30 cursor-not-allowed opacity-60'
              }`}
            >
              <Play className="w-5 h-5 fill-current shrink-0" />
              <span>START GAME</span>
            </button>
          </div>

          <p className="text-[11px] text-[#253451]/40 font-medium">
            Political Territory Companion System • Sesi akan tersimpan secara otomatis
          </p>
        </section>

      </main>
    </div>
  );
};
