import React from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Clock,
  Coins
} from 'lucide-react';
import { useGame } from '../context/GameContext';

export const EconomicTimerSection: React.FC = () => {
  const {
    settings,
    pauseGame,
    resumeGame,
    resetEconomicTimer,
    triggerEconomicRound,
    setEconomicInterval,
    players,
    calculatePlayerIncome
  } = useGame();

  const totalSecs = settings.economicIntervalSeconds || 300;
  const remainingSecs = Math.max(0, settings.timerRemainingSeconds ?? totalSecs);
  const progressPercent = Math.min(100, Math.max(0, ((totalSecs - remainingSecs) / totalSecs) * 100));

  const minutes = Math.floor(remainingSecs / 60);
  const seconds = remainingSecs % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const totalProjectedPayout = players.reduce((sum, p) => sum + calculatePlayerIncome(p).totalIncome, 0);

  const durationOptions = [
    { label: '1m', seconds: 60 },
    { label: '3m', seconds: 180 },
    { label: '5m', seconds: 300 },
    { label: '10m', seconds: 600 },
    { label: '15m', seconds: 900 },
  ];

  return (
    <section id="timer-section" className="bg-white rounded-3xl border border-[#EAE9E3] shadow-soft-sm p-3.5 sm:p-4 flex flex-col gap-2.5">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 pb-2 border-b border-[#EAE9E3]">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-xl bg-[#F4CE70]/20 text-[#253451] flex items-center justify-center shrink-0">
            <Clock className="w-3.5 h-3.5 text-[#D9A732]" />
          </div>
          <div className="min-w-0">
            <h3 className="font-display font-black text-xs sm:text-sm text-[#253451] uppercase tracking-wide truncate">
              Siklus Ekonomi (GB)
            </h3>
            <span className="text-[10px] text-[#253451]/60 font-bold block truncate">
              Pembagian Government Budget Otomatis
            </span>
          </div>
        </div>

        <span className="text-xs font-mono font-black text-[#253451] bg-[#F8F5EC] px-2.5 py-1 rounded-lg border border-[#EAE9E3] shrink-0">
          Round #{settings.currentRound}
        </span>
      </div>

      {/* Main Countdown Display & Duration */}
      <div className="bg-[#F8F5EC] border border-[#EAE9E3] rounded-2xl p-3 flex flex-wrap sm:flex-nowrap items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-baseline gap-1.5">
            <span className={`text-2xl sm:text-3xl font-mono font-black tracking-tight ${
              remainingSecs <= 30 && settings.isTimerRunning ? 'text-[#EF4444] animate-pulse' : 'text-[#253451]'
            }`}>
              {formattedTime}
            </span>
            <span className="text-[11px] font-mono font-bold text-[#253451]/50">
              / {Math.round(totalSecs / 60)}m
            </span>
          </div>
          <div className="text-[10px] text-[#253451]/65 font-bold mt-0.5">
            Estimasi Payout: <span className="text-[#2e6d34] font-mono font-black">+{totalProjectedPayout} GB</span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1.5 shrink-0 ml-auto">
          <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-lg border border-[#EAE9E3]">
            <span className={`w-2 h-2 rounded-full ${
              settings.isTimerRunning ? 'bg-[#10B981] animate-pulse' : 'bg-amber-400'
            }`} />
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#253451]">
              {settings.isTimerRunning ? 'Berjalan' : 'Dijeda'}
            </span>
          </div>

          <div className="flex items-center bg-white rounded-lg border border-[#EAE9E3] p-0.5">
            {durationOptions.map(opt => (
              <button
                key={opt.seconds}
                type="button"
                onClick={() => setEconomicInterval(opt.seconds)}
                className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold transition ${
                  totalSecs === opt.seconds
                    ? 'bg-[#253451] text-white shadow-xs'
                    : 'text-[#253451]/60 hover:text-[#253451]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-1.5 w-full bg-[#F0ECE1] rounded-full overflow-hidden border border-[#EAE9E3]">
        <div
          className="h-full bg-gradient-to-r from-[#F4CE70] to-[#EF956F] transition-all duration-1000 ease-linear rounded-full"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Controls Bar */}
      <div className="flex flex-wrap items-center gap-2">
        {settings.isTimerRunning ? (
          <button
            type="button"
            onClick={pauseGame}
            className="flex-1 py-2 px-3 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 font-extrabold text-[11px] uppercase tracking-wider transition flex items-center justify-center gap-1.5 shadow-2xs"
            title="Jeda jalannya timer ekonomi"
          >
            <Pause className="w-3.5 h-3.5 shrink-0" />
            <span>Jeda</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={resumeGame}
            className="flex-1 py-2 px-3 rounded-xl bg-[#253451] hover:bg-[#1C273D] text-white font-extrabold text-[11px] uppercase tracking-wider transition flex items-center justify-center gap-1.5 shadow-2xs"
            title="Lanjutkan timer ekonomi"
          >
            <Play className="w-3.5 h-3.5 text-[#F4CE70] shrink-0" />
            <span>{remainingSecs < totalSecs ? 'Lanjutkan' : 'Mulai'}</span>
          </button>
        )}

        <button
          type="button"
          onClick={resetEconomicTimer}
          className="py-2 px-2.5 rounded-xl bg-[#F8F5EC] hover:bg-[#EAE9E3] border border-[#EAE9E3] text-[#253451] font-extrabold text-[11px] uppercase tracking-wider transition flex items-center gap-1 shadow-2xs"
          title="Reset sisa waktu timer"
        >
          <RotateCcw className="w-3.5 h-3.5 shrink-0 text-[#253451]/70" />
          <span>Reset</span>
        </button>

        <button
          type="button"
          onClick={triggerEconomicRound}
          className="flex-1 py-2 px-3 rounded-xl bg-[#73B77A] hover:bg-[#5fa366] text-white font-extrabold text-[11px] uppercase tracking-wider transition flex items-center justify-center gap-1.5 shadow-2xs whitespace-nowrap"
          title="Segera proses pembagian income wilayah"
        >
          <Coins className="w-3.5 h-3.5 shrink-0" />
          <span>Bagikan Income</span>
        </button>
      </div>
    </section>
  );
};
