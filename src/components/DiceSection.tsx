import React, { useState, useEffect } from 'react';
import {
  Dices,
  ArrowRight,
  CheckCircle2,
  History,
  Smartphone,
  ChevronDown,
  ChevronUp,
  Sparkles,
  AlertCircle,
  Flag
} from 'lucide-react';
import { useGame } from '../context/GameContext';
import { PlayerLogo } from './PlayerLogo';
import { PlayerColor } from '../types/game';

export const DiceSection: React.FC = () => {
  const {
    settings,
    players,
    activePlayer,
    pendingClaims,
    isTurnLocked,
    devicePlayerId,
    setDevicePlayerId,
    diceState,
    rollDice,
    nextTurn,
    setActiveTurnPlayer,
    skipPendingClaim,
    openModal
  } = useGame();

  const [displayValue, setDisplayValue] = useState<number | null>(diceState.currentValue ?? null);
  const [isLandedPop, setIsLandedPop] = useState(false);
  const [isSubmittingRoll, setIsSubmittingRoll] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showFullHistory, setShowFullHistory] = useState(false);

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

  const handleDeviceChange = (val: string) => {
    setDevicePlayerId(val);
  };

  // The active turn is always the active player. Pending claims from earlier
  // turns are listed separately and never steal the roll button.
  const turnOwnerPlayer =
    (diceState.isRolling && diceState.rollingPlayerId
      ? players.find(p => p.id === diceState.rollingPlayerId)
      : null) ||
    activePlayer;

  const activePlayerClaim = pendingClaims.find(c => c.playerId === activePlayer?.id) || null;
  const hasActiveClaim = Boolean(activePlayerClaim) ||
    Boolean(diceState.hasRolledThisTurn && diceState.lastRolledByPlayerId === activePlayer?.id);
  const activeDiceValue = activePlayerClaim?.diceValue ?? diceState.currentValue;

  const isAllDevices = devicePlayerId === 'all';
  const isMyTurn = isAllDevices || devicePlayerId === turnOwnerPlayer?.id;
  const canRoll =
    settings.status === 'active' &&
    isMyTurn &&
    !hasActiveClaim &&
    !diceState.isRolling &&
    !isSubmittingRoll;

  const currentIndex = players.findIndex(p => p.id === turnOwnerPlayer?.id);
  const nextPlayer = players[(currentIndex >= 0 ? currentIndex + 1 : 0) % players.length] || players[0];

  const handleRollClick = async () => {
    if (!canRoll) return;
    setIsSubmittingRoll(true);
    setErrorMessage(null);
    try {
      await rollDice(isAllDevices ? turnOwnerPlayer?.id : devicePlayerId);
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal melempar dadu.');
      setTimeout(() => setErrorMessage(null), 4000);
    } finally {
      setIsSubmittingRoll(false);
    }
  };

  const handleClaimClick = () => {
    if (!isMyTurn || !turnOwnerPlayer || !hasActiveClaim) return;
    setErrorMessage(null);
    openModal('QUICK_CARD_ENTRY', { playerId: turnOwnerPlayer.id, rollerId: turnOwnerPlayer.id });
  };

  const handleNextTurnClick = () => {
    if (!isMyTurn || !hasActiveClaim || diceState.isRolling) return;
    setErrorMessage(null);
    nextTurn();
  };

  const getPawnColorStyle = (color?: PlayerColor) => {
    switch (color) {
      case 'red':
        return { bg: 'bg-red-500/10', border: 'border-red-300', text: 'text-red-700', dotColor: 'bg-[#EF4444]' };
      case 'blue':
        return { bg: 'bg-blue-500/10', border: 'border-blue-300', text: 'text-blue-700', dotColor: 'bg-[#3B82F6]' };
      case 'green':
        return { bg: 'bg-emerald-500/10', border: 'border-emerald-300', text: 'text-emerald-700', dotColor: 'bg-[#10B981]' };
      case 'yellow':
      default:
        return { bg: 'bg-amber-500/10', border: 'border-amber-300', text: 'text-amber-800', dotColor: 'bg-[#F59E0B]' };
    }
  };

  const activePawnStyle = getPawnColorStyle(turnOwnerPlayer?.color);
  const canManualSwitchTurn = !isTurnLocked && (isAllDevices || devicePlayerId === turnOwnerPlayer?.id);

  const renderDiceFace = (val: number | null) => {
    const num = val ?? 1;
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
        className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-white to-[#FAF8F5] border-2 border-[#EAE9E3] shadow-[inset_0_2px_4px_rgba(255,255,255,1),0_6px_14px_rgba(37,52,81,0.12)] flex items-center justify-center select-none transition-transform duration-200 ${
          diceState.isRolling ? 'animate-dice-roll' : isLandedPop ? 'animate-dice-land dice-result-glow' : ''
        }`}
      >
        <div className="grid grid-cols-3 grid-rows-3 w-11 h-11 sm:w-14 sm:h-14 p-1">
          {Array.from({ length: 9 }).map((_, idx) => (
            <div key={idx} className="flex items-center justify-center">
              {activePips.includes(idx) && (
                <span
                  className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full ${
                    diceState.currentValue !== null && !diceState.isRolling
                      ? 'bg-[#253451] shadow-[inset_0_1px_1.5px_rgba(0,0,0,0.6)]'
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
      className="bg-white rounded-3xl border border-[#EAE9E3] shadow-soft-sm p-3.5 sm:p-4 flex flex-col gap-3"
    >
      {/* Compact Header: Title + Active Turn Pill + Device Role */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-[#EAE9E3]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-[#253451] text-[#F4CE70] flex items-center justify-center shadow-xs shrink-0">
            <Dices className="w-3.5 h-3.5" />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-display font-black text-xs sm:text-sm text-[#253451] uppercase tracking-wide">
              Dice System
            </h3>
            <span className="text-[10px] font-mono font-extrabold px-2 py-0.5 rounded-full bg-[#F8F5EC] border border-[#EAE9E3] text-[#253451]/80">
              Giliran #{settings.currentTurn || 1}
            </span>
          </div>
        </div>

        {/* Active Turn + Device Role Controls */}
        <div className="flex flex-wrap items-center gap-1.5">
          {turnOwnerPlayer && (
            <div className={`flex items-center gap-1.5 px-2 py-1 rounded-xl border ${activePawnStyle.bg} ${activePawnStyle.border}`}>
              <div className="w-4 h-4 rounded-full overflow-hidden shrink-0">
                <PlayerLogo player={turnOwnerPlayer} size="full" showBadge={false} />
              </div>
              <span className="font-display font-black text-[11px] text-[#253451] truncate max-w-[90px]">
                {turnOwnerPlayer.name}
              </span>
              <select
                value={turnOwnerPlayer.id}
                disabled={!canManualSwitchTurn}
                onChange={e => setActiveTurnPlayer(e.target.value)}
                className="text-[10px] font-bold bg-white/90 border border-[#EAE9E3] rounded-md px-1.5 py-0.5 text-[#253451] outline-none cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed"
                title={isTurnLocked ? 'Giliran terkunci hanya saat dadu sedang berputar' : !canManualSwitchTurn ? 'Hanya pemain aktif atau Meja Bersama yang dapat mengoper giliran' : 'Oper giliran secara manual'}
              >
                {players.map(p => (
                  <option key={p.id} value={p.id}>
                    Oper: {p.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex items-center gap-1 bg-[#F8F5EC] border border-[#EAE9E3] rounded-xl px-2 py-1 text-[11px] font-bold text-[#253451]">
            <Smartphone className="w-3 h-3 text-[#253451]/50 shrink-0" />
            <select
              value={devicePlayerId}
              onChange={e => handleDeviceChange(e.target.value)}
              className="bg-transparent font-extrabold text-[10px] text-[#253451] outline-none cursor-pointer"
              title="Atur peran perangkat ini"
            >
              <option value="all">Meja Bersama</option>
              {players.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.color.toUpperCase()})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Dice Interactive Area */}
      <div className="bg-[#F8F5EC] border border-[#EAE9E3] rounded-2xl p-3 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3.5">
          <div className="shrink-0">
            {renderDiceFace(displayValue)}
          </div>

          <div className="space-y-0.5">
            <div className="text-[10px] font-extrabold text-[#253451]/60 uppercase tracking-wider">
              {diceState.isRolling ? 'Mengocok Dadu...' : 'Hasil Lemparan:'}
            </div>

            <div className="flex items-baseline gap-2">
              <span className={`text-3xl sm:text-4xl font-mono font-black tracking-tight ${
                diceState.isRolling
                  ? 'text-[#EF956F] animate-pulse'
                  : activeDiceValue !== null
                    ? 'text-[#253451]'
                    : 'text-[#253451]/30'
              }`}>
                {diceState.isRolling ? displayValue : (activeDiceValue ?? '-')}
              </span>
              <span className="text-[11px] font-mono font-bold text-[#253451]/50">
                (1 – 6)
              </span>
            </div>

            <div className="text-[11px] font-medium text-[#253451]/70">
              {diceState.isRolling ? (
                <span className="inline-flex items-center gap-1 text-[#EF956F] font-bold">
                  <Sparkles className="w-3 h-3 animate-spin" />
                  Mengacak angka untuk {turnOwnerPlayer?.name}...
                </span>
              ) : hasActiveClaim ? (
                <span className="inline-flex items-center gap-1 text-[#2e6d34] font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
                  Giliran Claim: {turnOwnerPlayer?.name} — pilih wilayah di peta atau input kartu
                </span>
              ) : (
                <span>Tekan tombol untuk melempar dadu ({turnOwnerPlayer?.name})</span>
              )}
            </div>
          </div>
        </div>

        {/* Roll / Claim / Skip Turn Action */}
        <div className="w-full sm:w-auto flex flex-col gap-1.5 shrink-0">
          {!hasActiveClaim ? (
            <button
              type="button"
              onClick={handleRollClick}
              disabled={!canRoll}
              className={`w-full sm:w-48 px-4 py-2.5 rounded-2xl font-display font-black text-xs uppercase tracking-wider transition shadow-sm flex items-center justify-center gap-2 game-press ${
                canRoll
                  ? 'bg-[#253451] hover:bg-[#1C273D] text-[#F4CE70] hover:shadow-md cursor-pointer'
                  : 'bg-[#EAE9E3] text-[#253451]/40 cursor-not-allowed'
              }`}
              title={
                !isMyTurn
                  ? `Bukan giliran Anda. Menunggu ${turnOwnerPlayer?.name}.`
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
            <div className="w-full sm:w-52 flex flex-col gap-1.5">
              <button
                type="button"
                onClick={handleClaimClick}
                disabled={!isMyTurn || diceState.isRolling}
                className={`w-full px-3.5 py-2 rounded-2xl font-display font-black text-[11px] uppercase tracking-wider transition shadow-xs flex items-center justify-center gap-1.5 game-press ${
                  isMyTurn && !diceState.isRolling
                    ? 'bg-[#253451] hover:bg-[#1C273D] text-[#F4CE70] cursor-pointer'
                    : 'bg-[#EAE9E3] text-[#253451]/40 cursor-not-allowed'
                }`}
                title={`Arahkan proses klaim wilayah untuk ${turnOwnerPlayer?.name}`}
              >
                <Flag className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Klaim ({turnOwnerPlayer?.name})</span>
              </button>
              <button
                type="button"
                onClick={handleNextTurnClick}
                disabled={!isMyTurn}
                className={`w-full px-3.5 py-2 rounded-2xl font-display font-black text-[11px] uppercase tracking-wider transition shadow-xs flex items-center justify-center gap-1.5 game-press ${
                  isMyTurn
                    ? 'bg-[#73B77A] hover:bg-[#5fa867] text-white cursor-pointer'
                    : 'bg-[#EAE9E3] text-[#253451]/40 cursor-not-allowed'
                }`}
                title={`Oper giliran ke ${nextPlayer?.name}. Hak klaim tetap tersimpan dan dapat diselesaikan kemudian.`}
              >
                <span className="truncate">Oper ke {nextPlayer?.name} (klaim tersimpan)</span>
                <ArrowRight className="w-3.5 h-3.5 shrink-0" />
              </button>
            </div>
          )}

          {!isMyTurn && (
            <span className="text-[10px] text-amber-700 bg-amber-500/10 border border-amber-300/40 rounded-lg px-2 py-0.5 text-center font-bold">
              Menunggu {turnOwnerPlayer?.name}
            </span>
          )}
        </div>
      </div>

      {errorMessage && (
        <div className="p-2 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Pending claim rights survive turn changes and can be resolved later */}
      {pendingClaims.length > 0 && (
        <div className="space-y-1.5 bg-amber-50/60 border border-amber-200 rounded-2xl p-2.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-900 flex items-center gap-1">
              <Flag className="w-3 h-3" />
              Hak Klaim Dadu Tersimpan ({pendingClaims.length})
            </span>
            <span className="text-[9px] font-bold text-amber-800/70">
              Tetap berlaku setelah giliran berganti
            </span>
          </div>
          <div className="space-y-1.5">
            {pendingClaims.map(claim => {
              const claimPlayer = players.find(p => p.id === claim.playerId);
              const claimStyle = getPawnColorStyle(claimPlayer?.color);
              const canManageClaim = isAllDevices || devicePlayerId === claim.playerId;
              const isCurrentClaim = claim.playerId === activePlayer?.id;
              return (
                <div
                  key={claim.id}
                  className={`flex flex-wrap items-center justify-between gap-2 px-2.5 py-1.5 rounded-xl border bg-white ${claimStyle.border}`}
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className={`w-2 h-2 rounded-full ${claimStyle.dotColor} shrink-0`} />
                    <span className="font-bold text-[11px] text-[#253451] truncate">
                      {claimPlayer?.name || claim.playerId}
                    </span>
                    <span className="font-mono text-[10px] font-black text-[#253451] bg-[#F8F5EC] border border-[#EAE9E3] rounded px-1.5 py-0.5">
                      🎲 {claim.diceValue}
                    </span>
                    <span className="text-[9px] font-mono text-[#253451]/50">
                      G#{claim.turn} • R#{claim.round}
                    </span>
                    {isCurrentClaim && (
                      <span className="text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
                        Giliran Ini
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => openModal('QUICK_CARD_ENTRY', { playerId: claim.playerId, rollerId: claim.playerId })}
                      disabled={!canManageClaim}
                      className="px-2.5 py-1 rounded-lg bg-[#253451] hover:bg-[#1C273D] text-[#F4CE70] text-[10px] font-extrabold transition disabled:opacity-40 disabled:cursor-not-allowed"
                      title={canManageClaim ? `Klaim dengan dadu ${claimPlayer?.name || claim.playerId}` : `Hanya perangkat ${claimPlayer?.name || claim.playerId} atau Meja Bersama`}
                    >
                      Klaim
                    </button>
                    <button
                      type="button"
                      onClick={() => skipPendingClaim(claim.id)}
                      disabled={!canManageClaim}
                      className="px-2.5 py-1 rounded-lg bg-white hover:bg-red-50 text-red-600 border border-red-200 text-[10px] font-extrabold transition disabled:opacity-40 disabled:cursor-not-allowed"
                      title="Lewati hak klaim ini"
                    >
                      Lewati
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Compact Recent Rolls Strip */}
      <div className="space-y-1.5 pt-1 border-t border-[#EAE9E3]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <History className="w-3 h-3 text-[#253451]/60" />
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#253451]/70">
              Riwayat Dadu ({history.length})
            </span>
          </div>

          {history.length > 4 && (
            <button
              type="button"
              onClick={() => setShowFullHistory(!showFullHistory)}
              className="text-[10px] font-extrabold text-[#253451]/70 hover:text-[#253451] flex items-center gap-0.5"
            >
              <span>{showFullHistory ? 'Tutup' : 'Semua'}</span>
              {showFullHistory ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <div className="text-center py-2 bg-[#F8F5EC] rounded-xl border border-[#EAE9E3] text-[11px] text-[#253451]/50 font-medium">
            Belum ada lemparan dadu pada sesi ini.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            {(showFullHistory ? history : recentRolls).map(item => {
              const pStyle = getPawnColorStyle(item.playerColor);
              return (
                <div
                  key={item.id}
                  className={`px-2 py-1.5 rounded-xl border ${pStyle.bg} ${pStyle.border} flex items-center justify-between gap-1.5`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1 truncate">
                      <span className={`w-1.5 h-1.5 rounded-full ${pStyle.dotColor} shrink-0`} />
                      <span className="font-bold text-[10px] text-[#253451] truncate">
                        {item.playerName}
                      </span>
                    </div>
                    <div className="text-[9px] font-mono text-[#253451]/50">
                      G#{item.turn} • R#{item.round}
                    </div>
                  </div>

                  <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-white border border-[#EAE9E3] shrink-0 font-mono font-black text-xs text-[#253451]">
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
