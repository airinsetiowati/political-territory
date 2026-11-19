import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Coins, CheckCircle, X } from 'lucide-react';
import { useGame } from '../context/GameContext';

// Keep the exit animation short so the dashboard is usable again immediately.
const CLOSE_ANIMATION_MS = 160;

export const EconomicRoundModal: React.FC = () => {
  const { latestIncomeSummary, closeIncomeSummary } = useGame();

  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const closeTimerRef = useRef<number | null>(null);
  const summaryRoundRef = useRef<number | null>(null);
  const isOpen = Boolean(latestIncomeSummary);

  // Play a light enter animation every time a new payout summary appears.
  useEffect(() => {
    if (!isOpen) {
      summaryRoundRef.current = null;
      setIsVisible(false);
      setIsClosing(false);
      return;
    }

    // A new round arrived: cancel any pending close from the previous summary.
    summaryRoundRef.current = latestIncomeSummary?.round ?? null;
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setIsClosing(false);
    const frame = window.requestAnimationFrame(() => setIsVisible(true));
    return () => window.cancelAnimationFrame(frame);
  }, [isOpen, latestIncomeSummary?.round]);

  // Prevent the page behind the dialog from scrolling while it is open.
  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  // Clear a pending close timer if the component unmounts.
  useEffect(() => {
    return () => {
      if (closeTimerRef.current !== null) {
        window.clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  const requestClose = useCallback(() => {
    // The payout transaction is already committed before this summary is shown,
    // so closing never cancels or repeats it. Guard only against double-clicks.
    if (!isOpen || isClosing) return;

    const closingRound = latestIncomeSummary?.round ?? null;
    setIsClosing(true);
    setIsVisible(false);

    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
    }

    closeTimerRef.current = window.setTimeout(() => {
      closeTimerRef.current = null;
      // If a newer payout summary arrived during the animation, keep it open.
      if (summaryRoundRef.current === closingRound) {
        closeIncomeSummary();
      }
    }, CLOSE_ANIMATION_MS);
  }, [isOpen, isClosing, closeIncomeSummary, latestIncomeSummary?.round]);

  // Escape closes the dialog.
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        requestClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, requestClose]);

  if (!latestIncomeSummary) return null;

  // Only a click that starts on the backdrop itself closes the dialog.
  const handleBackdropPointerDown = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      requestClose();
    }
  };

  return (
    <div
      className={`fixed inset-0 z-[100] overflow-y-auto overscroll-contain transition-opacity duration-150 ease-out ${
        isVisible && !isClosing ? 'opacity-100' : 'opacity-0'
      } ${isClosing ? 'pointer-events-none' : ''}`}
    >
      <div
        className="min-h-full flex items-center justify-center p-3 sm:p-4"
        onMouseDown={handleBackdropPointerDown}
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="income-summary-title"
          onMouseDown={(event) => event.stopPropagation()}
          className={`income-modal-card bg-white border-2 border-game-gray/80 rounded-3xl w-full max-w-lg p-5 sm:p-7 shadow-2xl relative flex flex-col overflow-hidden transition-all duration-150 ease-out ${
            isVisible && !isClosing
              ? 'opacity-100 scale-100 translate-y-0'
              : 'opacity-0 scale-95 translate-y-2'
          }`}
        >
          <button
            type="button"
            onClick={requestClose}
            className="absolute top-3.5 right-3.5 z-10 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-game-cream/90 text-game-navy/60 hover:text-game-navy hover:bg-game-gray active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-game-navy/30 transition"
            aria-label="Close income summary"
            title="Close (Esc)"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Modal Header */}
          <div className="flex items-center gap-3.5 mb-4 pr-12 shrink-0">
            <div className="w-13 h-13 p-3 rounded-2xl bg-[#F4CE70]/20 border border-[#F4CE70]/50 flex items-center justify-center text-amber-700 shadow-sm shrink-0">
              <Coins className="w-7 h-7 stroke-[2.5]" />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-bold uppercase tracking-widest text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full inline-block">
                💰 Payout Complete
              </span>
              <h2
                id="income-summary-title"
                className="text-xl sm:text-2xl font-display font-black text-game-navy tracking-tight mt-0.5"
              >
                Economic Round #{latestIncomeSummary.round}
              </h2>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-game-navy/70 mb-4 leading-relaxed shrink-0">
            Government Budget (GB) has been automatically deposited into every player's treasury based on controlled territories and active opportunity bonuses.
          </p>

          {/* Player Payout Breakdown */}
          <div className="space-y-2.5 mb-5 pr-1 -mr-1 overflow-y-auto overscroll-contain flex-1 min-h-0">
            {latestIncomeSummary.distributions.map(dist => {
              const playerBg =
                dist.playerColor === 'red' ? 'bg-player-red' :
                dist.playerColor === 'blue' ? 'bg-player-blue' :
                dist.playerColor === 'green' ? 'bg-player-green' : 'bg-player-yellow';

              return (
                <div
                  key={dist.playerId}
                  className="bg-game-cream/60 border border-game-gray rounded-2xl p-3.5 flex items-center justify-between gap-2 hover:border-game-navy/20 transition"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={`w-4 h-4 rounded-full ${playerBg} ring-2 ring-white shadow-sm shrink-0`} />
                    <div className="min-w-0">
                      <div className="font-display font-bold text-sm text-game-navy truncate">{dist.playerName}</div>
                      <div className="text-[11px] text-game-navy/60 font-mono">
                        Territories: +{dist.baseIncome} GB {dist.opportunityIncome > 0 && `• Bonus: +${dist.opportunityIncome} GB`}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="inline-flex items-center gap-1 text-xs font-bold font-mono text-[#2e6d34] bg-[#73B77A]/20 px-2.5 py-1 rounded-xl border border-[#73B77A]/40 shadow-xs">
                      +{dist.totalReceived} GB
                    </span>
                    <div className="text-[11px] text-game-navy/50 font-mono mt-0.5">
                      Treasury: {dist.newBalance} GB
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Confirm Button */}
          <button
            type="button"
            onClick={requestClose}
            disabled={isClosing}
            className="w-full shrink-0 py-3.5 rounded-2xl bg-game-green hover:bg-[#62a369] text-white font-display font-bold text-sm tracking-wide shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 game-press disabled:opacity-70 disabled:pointer-events-none"
          >
            <CheckCircle className="w-4 h-4 stroke-[2.5]" />
            <span>Confirm &amp; Resume Match</span>
          </button>
        </div>
      </div>
    </div>
  );
};
