import React from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  FastForward, 
  Volume2, 
  VolumeX, 
  QrCode, 
  Award, 
  Undo2,
  Menu,
  Coins
} from 'lucide-react';
import { useGame } from '../context/GameContext';

interface TopBarProps {
  onToggleMobileMenu?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onToggleMobileMenu }) => {
  const { 
    settings, 
    pauseGame, 
    resumeGame, 
    resetEconomicTimer, 
    triggerEconomicRound, 
    toggleSound, 
    openModal,
    undoAvailable,
    undoLastAction,
    endGame
  } = useGame();

  const minutes = Math.floor(settings.timerRemainingSeconds / 60);
  const seconds = settings.timerRemainingSeconds % 60;
  const timeFormatted = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  
  const progressPercent = settings.economicIntervalSeconds > 0 
    ? Math.max(0, Math.min(100, ((settings.economicIntervalSeconds - settings.timerRemainingSeconds) / settings.economicIntervalSeconds) * 100))
    : 0;

  return (
    <header className="h-16 bg-white/95 backdrop-blur-md border-b border-[#EAE9E3] px-3 md:px-6 flex items-center justify-between shrink-0 select-none shadow-soft-sm z-20 gap-2">
      {/* Left: Mobile Menu Toggle + Match Status & Round */}
      <div className="flex items-center gap-2.5">
        {onToggleMobileMenu && (
          <button
            onClick={onToggleMobileMenu}
            className="p-2 rounded-xl bg-[#F8F5EC] hover:bg-[#EAE9E3] text-[#253451] border border-[#EAE9E3] lg:hidden transition"
            title="Open Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div className="flex items-center gap-1.5 bg-[#F8F5EC] px-2.5 py-1 rounded-xl border border-[#EAE9E3]">
          <span className="text-xs">🎲</span>
          <span className="text-xs font-extrabold text-[#253451]">Round #{settings.currentRound}</span>
        </div>

        <div className="hidden sm:flex items-center gap-1">
          <span className={`px-2.5 py-1 rounded-xl text-[11px] font-extrabold tracking-wide capitalize ${
            settings.status === 'active' ? 'bg-[#73B77A]/15 text-[#253451] border border-[#73B77A]/40' :
            settings.status === 'paused' ? 'bg-[#F4CE70]/25 text-[#253451] border border-[#F4CE70]/50' :
            settings.status === 'ended' ? 'bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/30' :
            'bg-[#EAE9E3] text-[#253451]/70 border border-[#EAE9E3]'
          }`}>
            ● {settings.status}
          </span>
        </div>
      </div>

      {/* Center: Economic Countdown Timer & Quick Distribute */}
      <div className="flex items-center gap-2 md:gap-3 bg-[#F8F5EC] px-3 md:px-4 py-1.5 rounded-2xl border border-[#EAE9E3] shadow-xs">
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1.5">
            <Coins className="w-3.5 h-3.5 text-[#F4CE70]" />
            <span className="hidden md:inline text-[10px] font-bold uppercase tracking-wider text-[#253451]/60">Income In</span>
            <span className="font-mono text-sm md:text-base font-extrabold text-[#253451] tracking-wider">
              {timeFormatted}
            </span>
          </div>
          {/* Progress bar */}
          <div className="w-16 md:w-28 h-1.5 bg-[#EAE9E3] rounded-full overflow-hidden mt-0.5">
            <div 
              className="h-full bg-gradient-to-r from-[#F4CE70] to-[#73B77A] transition-all duration-1000"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Timer Control Buttons */}
        <div className="flex items-center gap-1 ml-1 md:ml-2 border-l border-[#EAE9E3] pl-1.5 md:pl-2.5">
          {settings.isTimerRunning ? (
            <button
              onClick={pauseGame}
              title="Pause Timer"
              className="p-1.5 rounded-xl bg-white hover:bg-[#EAE9E3] text-[#253451] transition border border-[#EAE9E3]"
            >
              <Pause className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={resumeGame}
              disabled={settings.status !== 'active'}
              title="Resume Timer"
              className="p-1.5 rounded-xl bg-[#73B77A] hover:bg-[#5fa867] text-white transition disabled:opacity-40"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
            </button>
          )}

          <button
            onClick={resetEconomicTimer}
            title="Reset Countdown"
            className="p-1.5 rounded-xl bg-white hover:bg-[#EAE9E3] text-[#253451] transition border border-[#EAE9E3] hidden sm:block"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={triggerEconomicRound}
            disabled={settings.status !== 'active'}
            title="Distribute Economic Income Now"
            className="px-2.5 py-1 md:px-3 md:py-1.5 rounded-xl bg-gradient-to-r from-[#F4CE70] to-[#EF956F] hover:opacity-95 text-[#253451] text-[11px] font-black transition flex items-center gap-1 shadow-xs disabled:opacity-40 active:scale-95"
          >
            <FastForward className="w-3 h-3 fill-current" />
            <span className="hidden sm:inline">Distribute</span>
          </button>
        </div>
      </div>

      {/* Right Actions: Quick Card Entry, Undo, Sound, End Game */}
      <div className="flex items-center gap-1.5 md:gap-2">
        {undoAvailable && (
          <button
            onClick={undoLastAction}
            title="Undo Last Action"
            className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white hover:bg-[#F8F5EC] text-[#253451] text-xs font-bold border border-[#EAE9E3] transition shadow-xs"
          >
            <Undo2 className="w-3.5 h-3.5 text-[#EF956F]" />
            <span className="hidden md:inline">Undo</span>
          </button>
        )}

        <button
          onClick={() => openModal('QUICK_CARD_ENTRY')}
          className="flex items-center gap-1.5 px-3 py-1.5 md:px-4 md:py-2 rounded-xl bg-[#253451] hover:bg-[#1C273D] text-white font-extrabold text-xs tracking-wide shadow-soft-sm transition active:scale-95 shrink-0"
        >
          <QrCode className="w-4 h-4 text-[#F4CE70]" />
          <span>Enter Code</span>
        </button>

        <button
          onClick={toggleSound}
          title={settings.soundEnabled ? 'Mute Sound' : 'Enable Sound'}
          className="p-2 rounded-xl bg-white hover:bg-[#F8F5EC] text-[#253451] border border-[#EAE9E3] transition shadow-xs"
        >
          {settings.soundEnabled ? (
            <Volume2 className="w-4 h-4 text-[#73B77A]" />
          ) : (
            <VolumeX className="w-4 h-4 text-[#253451]/40" />
          )}
        </button>

        {settings.status === 'active' && (
          <button
            onClick={endGame}
            title="Conclude Game & Show Winner"
            className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold border border-red-200 transition shrink-0"
          >
            <Award className="w-3.5 h-3.5 text-red-500" />
            <span className="hidden md:inline">End Game</span>
          </button>
        )}
      </div>
    </header>
  );
};
