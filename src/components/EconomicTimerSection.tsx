import React from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Clock, 
  Coins, 
  ChevronRight,
  TrendingUp,
  Sparkles,
  Sliders
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

  // Total projected economy payout for the next cycle
  const totalProjectedPayout = players.reduce((sum, p) => sum + calculatePlayerIncome(p).totalIncome, 0);

  const durationOptions = [
    { label: '1m', seconds: 60 },
    { label: '3m', seconds: 180 },
    { label: '5m', seconds: 300 },
    { label: '10m', seconds: 600 },
    { label: '15m', seconds: 900 },
  ];

  return (
    <div className="bg-white rounded-3xl border border-[#EAE9E3] shadow-soft-sm p-4 sm:p-5 flex flex-col justify-between space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#EAE9E3]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#F4CE70]/20 text-[#253451] flex items-center justify-center">
            <Clock className="w-4 h-4 text-[#F4CE70]" />
          </div>
          <div>
            <h3 className="font-display font-black text-sm text-[#253451] uppercase tracking-wide">
              Economic Timer & Cycle
            </h3>
            <span className="text-[10px] text-[#253451]/60 font-bold">
              Siklus Pembagian Government Budget Otomatis
            </span>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] uppercase font-extrabold tracking-wider text-[#253451]/60 block">
            Nomor Putaran
          </span>
          <span className="text-sm font-mono font-black text-[#253451] bg-[#F8F5EC] px-2.5 py-0.5 rounded-lg border border-[#EAE9E3] inline-block">
            Round #{settings.currentRound}
          </span>
        </div>
      </div>

      {/* Main Countdown Display & Status */}
      <div className="bg-[#F8F5EC] border border-[#EAE9E3] rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-extrabold text-[#253451]/60 uppercase tracking-wider mb-0.5">
            Waktu Menuju Siklus Ekonomi:
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-3xl sm:text-4xl font-mono font-black tracking-tight ${
              remainingSecs <= 30 && settings.isTimerRunning ? 'text-[#EF4444] animate-pulse' : 'text-[#253451]'
            }`}>
              {formattedTime}
            </span>
            <span className="text-xs font-mono font-bold text-[#253451]/50">
              / {Math.round(totalSecs / 60)} menit
            </span>
          </div>
          <div className="text-[10px] text-[#253451]/60 font-bold mt-1">
            Total Estimasi Payout Putaran Ini: <span className="text-[#2e6d34] font-mono">+{totalProjectedPayout} GB</span>
          </div>
        </div>

        {/* Status & Duration Setting */}
        <div className="flex flex-col items-end gap-2 shrink-0">
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-[#EAE9E3] shadow-2xs">
            <span className={`w-2.5 h-2.5 rounded-full ${
              settings.isTimerRunning ? 'bg-[#10B981] animate-ping' : 'bg-amber-400'
            }`} />
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#253451]">
              {settings.isTimerRunning ? 'Timer Berjalan' : 'Timer Dijeda'}
            </span>
          </div>

          {/* Quick Round Duration Selector */}
          <div className="flex items-center gap-1 text-[10px] font-bold text-[#253451]/70">
            <span>Durasi:</span>
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
      </div>

      {/* Progress Bar */}
      <div className="space-y-1">
        <div className="h-2 w-full bg-[#F0ECE1] rounded-full overflow-hidden border border-[#EAE9E3]">
          <div 
            className="h-full bg-gradient-to-r from-[#F4CE70] to-[#EF956F] transition-all duration-1000 ease-linear rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] font-mono font-bold text-[#253451]/50">
          <span>Awal Putaran #{settings.currentRound}</span>
          <span>Selesai (Otomatis Bagikan Pendapatan)</span>
        </div>
      </div>

      {/* Controls Bar: Start / Pause / Resume / Reset / Instant Payout */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        {settings.isTimerRunning ? (
          <button
            type="button"
            onClick={pauseGame}
            className="flex-1 py-2.5 px-3 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 font-extrabold text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-xs"
            title="Jeda jalannya timer ekonomi (waktu tersisa tetap tersimpan)"
          >
            <Pause className="w-4 h-4 shrink-0" />
            <span>Jeda Timer (Pause)</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={resumeGame}
            className="flex-1 py-2.5 px-3 rounded-xl bg-[#253451] hover:bg-[#1C273D] text-white font-extrabold text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-xs"
            title="Lanjutkan timer ekonomi dari sisa waktu saat ini"
          >
            <Play className="w-4 h-4 text-[#F4CE70] shrink-0" />
            <span>{remainingSecs < totalSecs ? 'Lanjutkan (Resume)' : 'Mulai Timer (Start)'}</span>
          </button>
        )}

        <button
          type="button"
          onClick={resetEconomicTimer}
          className="py-2.5 px-3 rounded-xl bg-[#F8F5EC] hover:bg-[#EAE9E3] border border-[#EAE9E3] text-[#253451] font-extrabold text-xs uppercase tracking-wider transition flex items-center gap-1.5 shadow-2xs"
          title="Reset sisa waktu timer ke durasi penuh putaran saat ini"
        >
          <RotateCcw className="w-4 h-4 shrink-0 text-[#253451]/70" />
          <span>Reset</span>
        </button>

        <button
          type="button"
          onClick={triggerEconomicRound}
          className="py-2.5 px-3.5 rounded-xl bg-[#73B77A] hover:bg-[#5fa366] text-white font-extrabold text-xs uppercase tracking-wider transition flex items-center justify-center gap-1.5 shadow-xs"
          title="Segera proses pembagian income wilayah dan majukan ke putaran berikutnya"
        >
          <Coins className="w-4 h-4 shrink-0" />
          <span className="hidden sm:inline">Bagikan Income Sekarang</span>
          <span className="sm:hidden">Income</span>
        </button>
      </div>
    </div>
  );
};