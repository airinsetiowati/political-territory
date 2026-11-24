import React, { useState, useEffect } from 'react';
import { 
  Dices, 
  ArrowRight, 
  CheckCircle2, 
  History, 
  Smartphone, 
  User, 
  Clock, 
  ChevronDown, 
  ChevronUp,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { useGame } from '../context/GameContext';
import { PlayerLogo } from './PlayerLogo';
import { PlayerColor, DiceRollLog } from '../types/game';

export const DiceSection: React.FC = () => {
  const { 
    settings, 
    players, 
    activePlayer, 
    diceState, 
    rollDice, 
    nextTurn, 
    setActiveTurnPlayer 
  } = useGame();

  // Local device binding ('all' for shared table/companion, or specific playerId)
  const [devicePlayerId, setDevicePlayerId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('pt_device_player_id') || 'all';
    }
    return 'all';
  });

  // Animated display number while rolling
  const [displayValue, setDisplayValue] = useState<number | null>(diceState.currentValue ?? null);
  const [isLandedPop, setIsLandedPop] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showFullHistory, setShowFullHistory] = useState(false);

  // Synchronize display value with diceState & animate pips during roll
  useEffect(() => {
    if (diceState.isRolling) {
      const interval = setInterval(() => {
        setDisplayValue(Math.floor(Math.random() * 6) + 1);
      }, 70);
      return () => clearInterval(interval);
    } else {
      setDisplayValue(diceState.currentValue);
      if (diceState.currentValue !== null) {
        setIsLandedPop(true);
        const timer = setTimeout(() => setIsLandedPop(false), 600);
        return () => clearTimeout(timer);
      }
    }
  }, [diceState.isRolling, diceState.currentValue]);

  // Persist device binding
  const handleDeviceChange = (val: string) => {
    setDevicePlayerId(val);
    if (typeof window !== 'undefined') {
      localStorage.setItem('pt_device_player_id', val);
    }
  };

  // Determine if this device is authorized to roll
  const isAllDevices = devicePlayerId === 'all';
  const isMyTurn = isAllDevices || devicePlayerId === activePlayer?.id;
  const canRoll = settings.status === 'active' && isMyTurn && !diceState.hasRolledThisTurn && !diceState.isRolling;

  // Next player preview
  const currentIndex = players.findIndex(p => p.id === activePlayer?.id);
  const nextPlayer = players[(currentIndex + 1) % players.length] || players[0];

  const handleRollClick = async () => {
    if (!canRoll) return;
    setErrorMessage(null);
    try {
      await rollDice(isAllDevices ? activePlayer?.id : devicePlayerId);
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal melempar dadu.');
      setTimeout(() => setErrorMessage(null), 4000);
    }
  };

  const handleNextTurnClick = () => {
    setErrorMessage(null);
    nextTurn();
  };

  // Pawn color themes
  const getPawnColorStyle = (color?: PlayerColor) => {
    switch (color) {
      case 'red':
        return {
          bg: 'bg-red-500/10',
          border: 'border-red-400',
          text: 'text-red-700',
          ring: 'ring-red-400',
          badgeBg: 'bg-[#EF4444]',
          dotColor: 'bg-[#EF4444]',
          shadow: 'shadow-red-500/20'
        };
      case 'blue':
        return {
          bg: 'bg-blue-500/10',
          border: 'border-blue-400',
          text: 'text-blue-700',
          ring: 'ring-blue-400',
          badgeBg: 'bg-[#3B82F6]',
          dotColor: 'bg-[#3B82F6]',
          shadow: 'shadow-blue-500/20'
        };
      case 'green':
        return {
          bg: 'bg-emerald-500/10',
          border: 'border-emerald-400',
          text: 'text-emerald-700',
          ring: 'ring-emerald-400',
          badgeBg: 'bg-[#10B981]',
          dotColor: 'bg-[#10B981]',
          shadow: 'shadow-emerald-500/20'
        };
      case 'yellow':
      default:
        return {
          bg: 'bg-amber-500/10',
          border: 'border-amber-400',
          text: 'text-amber-800',
          ring: 'ring-amber-400',
          badgeBg: 'bg-[#F59E0B]',
          dotColor: 'bg-[#F59E0B]',
          shadow: 'shadow-amber-500/20'
        };
    }
  };

  const activePawnStyle = getPawnColorStyle(activePlayer?.color);

  // Render high-tactile dice cube face with exact pips
  const renderDiceFace = (val: number | null) => {
    const num = val ?? 1;
    // 3x3 pip grid mapping:
    // 0 1 2
    // 3 4 5
    // 6 7 8
    const pipMap: Record<number, number[]> = {
      1: [4],
      2: [2, 6],
      3: [2, 4, 6],
      4: [0, 2, 6, 8],
      5: [0, 2, 4, 6, 8],
      6: [0, 2, 3, 5, 6, 8],
    };
    const activePips = pipMap[num] || [4];

    return (
      <div 
        className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-br from-white to-[#FAF8F5] border-2 border-[#EAE9E3] shadow-[inset_0_3px_6px_rgba(255,255,255,1),0_8px_20px_rgba(37,52,81,0.15)] flex items-center justify-center select-none transition-transform duration-200 ${
          diceState.isRolling ? 'animate-dice-roll' : isLandedPop ? 'animate-dice-land dice-result-glow' : ''
        }`}
      >
        {/* Subtle bevel inset overlay */}
        <div className="absolute inset-1.5 rounded-2xl border border-black/5 pointer-events-none" />

        {/* 3x3 Pip Grid */}
        <div className="grid grid-cols-3 grid-rows-3 w-14 h-14 sm:w-16 sm:h-16 p-1.5">
          {Array.from({ length: 9 }).map((_, idx) => (
            <div key={idx} className="flex items-center justify-center">
              {activePips.includes(idx) && (
                <span 
                  className={`w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full ${
                    diceState.currentValue !== null && !diceState.isRolling
                      ? 'bg-[#253451] shadow-[inset_0_1.5px_2px_rgba(0,0,0,0.6),0_1px_1px_rgba(255,255,255,0.8)]'
                      : 'bg-[#253451]/80'
                  }`} 
                />
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const history = diceState.history || [];
  const recentRolls = history.slice(0, 4);

  return (
    <section 
      id="dice-section"
      className="bg-white rounded-3xl border border-[#EAE9E3] shadow-soft-sm p-4 sm:p-5 space-y-4 relative overflow-hidden"
    >
      {/* Subtle background ambient motif */}
      <div className="absolute -right-10 -bottom-10 w-40 h-40 rounded-full bg-[#F4CE70]/10 blur-2xl pointer-events-none" />

      {/* Header: Title + Active Turn Badge + Device Role Dropdown */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pb-3 border-b border-[#EAE9E3]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#253451] text-[#F4CE70] flex items-center justify-center shadow-xs">
            <Dices className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-display font-black text-sm text-[#253451] uppercase tracking-wide">
                Dice System
              </h3>
              <span className="text-[10px] font-mono font-extrabold uppercase px-2 py-0.5 rounded-full bg-[#F8F5EC] border border-[#EAE9E3] text-[#253451]/80">
                Giliran #{settings.currentTurn || 1}
              </span>
            </div>
            <span className="text-[10px] text-[#253451]/60 font-bold">
              Lempar Dadu Acak & Manajemen Giliran
            </span>
          </div>
        </div>

        {/* Device Mode Selector */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-1 bg-[#F8F5EC] border border-[#EAE9E3] rounded-xl px-2 py-1 text-[11px] font-bold text-[#253451]">
            <Smartphone className="w-3 h-3 text-[#253451]/50" />
            <span className="text-[10px] text-[#253451]/50 hidden sm:inline">Perangkat:</span>
            <select
              value={devicePlayerId}
              onChange={e => handleDeviceChange(e.target.value)}
              className="bg-transparent font-extrabold text-[11px] text-[#253451] outline-none cursor-pointer"
              title="Atur peran perangkat ini (Semua Pemain / Meja Bersama, atau Pemain Khusus)"
            >
              <option value="all">Meja Bersama (Semua)</option>
              {players.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.color.toUpperCase()})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Active Player Banner */}
      <div className={`p-3 rounded-2xl border ${activePawnStyle.bg} ${activePawnStyle.border} flex items-center justify-between gap-3 transition-colors`}>
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-full shrink-0 shadow-2xs overflow-hidden">
            <PlayerLogo player={activePlayer} size="full" showBadge={false} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase font-mono font-black tracking-wider text-[#253451]/60">
                Giliran Berlangsung:
              </span>
              <span className={`w-2 h-2 rounded-full ${activePawnStyle.dotColor} animate-pulse`} />
            </div>
            <div className="flex items-center gap-1.5 truncate">
              <span className="font-display font-black text-sm text-[#253451] truncate">
                {activePlayer.name}
              </span>
              <span className={`text-[10px] font-mono font-black uppercase px-1.5 py-0.2 rounded border ${activePawnStyle.border} ${activePawnStyle.text}`}>
                {activePlayer.color}
              </span>
            </div>
          </div>
        </div>

        {/* Change turn manually if host needs to rotate */}
        <div className="flex items-center gap-1 shrink-0">
          <select
            value={activePlayer.id}
            onChange={e => setActiveTurnPlayer(e.target.value)}
            className="text-[10px] font-bold bg-white/90 border border-[#EAE9E3] hover:border-[#253451]/40 rounded-lg px-2 py-1 text-[#253451] outline-none cursor-pointer"
            title="Pilih langsung pemain yang aktif jika diperlukan"
          >
            {players.map(p => (
              <option key={p.id} value={p.id}>
                Oper ke {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Dice Interactive Area */}
      <div className="bg-[#F8F5EC] border border-[#EAE9E3] rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Left: 3D Visual Dice Face & Outcome Highlight */}
        <div className="flex items-center gap-4">
          <div className="shrink-0">
            {renderDiceFace(displayValue)}
          </div>

          <div className="space-y-1">
            <div className="text-[11px] font-extrabold text-[#253451]/60 uppercase tracking-wider">
              {diceState.isRolling ? 'Mengocok Dadu...' : 'Hasil Lemparan:'}
            </div>

            <div className="flex items-baseline gap-2">
              <span className={`text-4xl sm:text-5xl font-mono font-black tracking-tight ${
                diceState.isRolling 
                  ? 'text-[#EF956F] animate-pulse' 
                  : diceState.currentValue !== null 
                    ? 'text-[#253451]' 
                    : 'text-[#253451]/30'
              }`}>
                {diceState.isRolling ? displayValue : (diceState.currentValue ?? '-')}
              </span>
              <span className="text-xs font-mono font-bold text-[#253451]/50">
                (Rentang: 1 – 6)
              </span>
            </div>

            <div className="text-[11px] font-medium text-[#253451]/70">
              {diceState.isRolling ? (
                <span className="inline-flex items-center gap-1 text-[#EF956F] font-bold">
                  <Sparkles className="w-3 h-3 animate-spin" />
                  Mengacak angka fisik...
                </span>
              ) : diceState.hasRolledThisTurn ? (
                <span className="inline-flex items-center gap-1 text-[#2e6d34] font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
                  Dadu tersimpan untuk giliran ini
                </span>
              ) : (
                <span>Silakan tekan tombol untuk melempar</span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Roll Dice Button & Next Turn Button */}
        <div className="w-full sm:w-auto flex flex-col gap-2 shrink-0">
          {!diceState.hasRolledThisTurn ? (
            <button
              type="button"
              onClick={handleRollClick}
              disabled={!canRoll}
              className={`w-full sm:w-44 px-5 py-3 rounded-2xl font-display font-black text-xs uppercase tracking-wider transition shadow-sm flex items-center justify-center gap-2 game-press ${
                canRoll
                  ? 'bg-[#253451] hover:bg-[#1C273D] text-[#F4CE70] hover:shadow-md cursor-pointer'
                  : 'bg-[#EAE9E3] text-[#253451]/40 cursor-not-allowed'
              }`}
              title={
                !isMyTurn 
                  ? `Bukan giliran Anda. Menunggu ${activePlayer.name}.`
                  : settings.status !== 'active' 
                    ? 'Pertandingan belum aktif'
                    : 'Lempar Dadu Sekarang'
              }
            >
              <Dices className={`w-4 h-4 ${diceState.isRolling ? 'animate-spin text-[#F4CE70]' : ''}`} />
              <span>
                {diceState.isRolling 
                  ? 'Rolling...' 
                  : !isMyTurn 
                    ? 'Menunggu Giliran' 
                    : 'ROLL DICE'}
              </span>
            </button>
          ) : (
            <div className="w-full sm:w-44 flex flex-col gap-1.5">
              <div className="px-3 py-1.5 rounded-xl bg-white border border-[#EAE9E3] text-center text-[11px] font-black text-[#2e6d34] flex items-center justify-center gap-1 shadow-2xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
                <span>Angka {diceState.currentValue} Tercatat</span>
              </div>

              <button
                type="button"
                onClick={handleNextTurnClick}
                className="w-full px-4 py-2.5 rounded-2xl bg-[#73B77A] hover:bg-[#5fa867] text-white font-display font-black text-xs uppercase tracking-wider transition shadow-xs flex items-center justify-center gap-1.5 game-press"
                title={`Selesaikan giliran dan oper ke ${nextPlayer.name}`}
              >
                <span>Oper Giliran</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Quick status message */}
          {!isMyTurn && (
            <span className="text-[10px] text-amber-700 bg-amber-500/10 border border-amber-300/40 rounded-lg px-2 py-1 text-center font-bold">
              Menunggu giliran {activePlayer.name}
            </span>
          )}
        </div>
      </div>

      {/* Error alert if any */}
      {errorMessage && (
        <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-bold flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Recent Rolls History Widget */}
      <div className="space-y-2 pt-1 border-t border-[#EAE9E3]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <History className="w-3.5 h-3.5 text-[#253451]/60" />
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#253451]/70">
              Riwayat Lemparan Terakhir
            </span>
            <span className="text-[10px] font-mono font-bold text-[#253451]/40">
              ({history.length} Lemparan)
            </span>
          </div>

          {history.length > 4 && (
            <button
              type="button"
              onClick={() => setShowFullHistory(!showFullHistory)}
              className="text-[10px] font-extrabold text-[#253451]/70 hover:text-[#253451] flex items-center gap-0.5"
            >
              <span>{showFullHistory ? 'Tutup' : 'Lihat Semua'}</span>
              {showFullHistory ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <div className="text-center py-3 bg-[#F8F5EC] rounded-xl border border-[#EAE9E3] text-[11px] text-[#253451]/50 font-medium">
            Belum ada lemparan dadu pada pertandingan ini.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {(showFullHistory ? history : recentRolls).map(item => {
              const pStyle = getPawnColorStyle(item.playerColor);
              return (
                <div
                  key={item.id}
                  className={`p-2 rounded-xl border ${pStyle.bg} ${pStyle.border} flex items-center justify-between gap-2 shadow-2xs`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1 truncate">
                      <span className={`w-1.5 h-1.5 rounded-full ${pStyle.dotColor}`} />
                      <span className="font-bold text-[11px] text-[#253451] truncate">
                        {item.playerName}
                      </span>
                    </div>
                    <div className="text-[9px] font-mono text-[#253451]/50 flex items-center gap-1">
                      <span>G#{item.turn}</span>
                      <span>•</span>
                      <span>R#{item.round}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-white border border-[#EAE9E3] shadow-xs shrink-0 font-mono font-black text-sm text-[#253451]">
                    {item.value}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};