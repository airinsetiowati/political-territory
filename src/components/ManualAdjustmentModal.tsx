import React, { useEffect, useState } from 'react';
import { 
  X, 
  Coins, 
  Award, 
  CheckCircle, 
  SlidersHorizontal,
  Plus,
  Minus
} from 'lucide-react';
import { useGame } from '../context/GameContext';

export const ManualAdjustmentModal: React.FC = () => {
  const { 
    activeModal, 
    activeModalData, 
    closeModal, 
    players, 
    adjustPlayerBudget, 
    adjustPlayerVP 
  } = useGame();

  const [selectedPlayerId, setSelectedPlayerId] = useState<string>(activeModalData?.playerId || players[0]?.id || '');
  const [adjustmentType, setAdjustmentType] = useState<'budget' | 'vp'>('budget');
  const [deltaMode, setDeltaMode] = useState<'+' | '-'>('+');
  const [amount, setAmount] = useState<string>('5');
  const [reason, setReason] = useState<string>('');
  const [feedback, setFeedback] = useState<string | null>(null);

  // The modal remains mounted; make sure the player selection follows the
  // player that was actually clicked when the modal opens.
  useEffect(() => {
    if (activeModal === 'MANUAL_ADJUSTMENT') {
      setSelectedPlayerId(activeModalData?.playerId || players[0]?.id || '');
      setFeedback(null);
    }
  }, [activeModal, activeModalData?.playerId]);

  if (activeModal !== 'MANUAL_ADJUSTMENT') return null;

  const player = players.find(p => p.id === selectedPlayerId) || players[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = Math.abs(parseInt(amount) || 0);
    if (parsedAmount === 0) return;

    const netDelta = deltaMode === '+' ? parsedAmount : -parsedAmount;

    if (adjustmentType === 'budget') {
      adjustPlayerBudget(player.id, netDelta, reason.trim() || 'Manual Host Adjustment');
      setFeedback(`Adjusted ${player.name}'s Treasury by ${netDelta >= 0 ? '+' : ''}${netDelta} GB.`);
    } else {
      adjustPlayerVP(player.id, netDelta, reason.trim() || 'Manual Host Adjustment');
      setFeedback(`Adjusted ${player.name}'s VP by ${netDelta >= 0 ? '+' : ''}${netDelta} VP.`);
    }

    setTimeout(() => {
      closeModal();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-game-navy/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white border-2 border-game-gray/80 rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl relative animate-in zoom-in-95 duration-200">
        <button
          onClick={closeModal}
          className="absolute top-5 right-5 text-game-navy/40 hover:text-game-navy p-2 rounded-xl hover:bg-game-gray/60 transition"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-11 h-11 rounded-2xl bg-game-orange/15 border border-game-orange/30 text-game-orange flex items-center justify-center shadow-xs">
            <SlidersHorizontal className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-game-orange bg-orange-50 px-2.5 py-0.5 rounded-full inline-block">
              Host Tools
            </span>
            <h2 className="text-lg sm:text-xl font-display font-black text-game-navy tracking-tight mt-0.5">
              Manual Ledger Adjustment
            </h2>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Select Player */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-game-navy/70 mb-2">
              Select Player:
            </label>
            <div className="grid grid-cols-2 gap-2">
              {players.map(p => {
                const isSelected = player?.id === p.id;
                const playerBg =
                  p.color === 'red' ? 'bg-player-red' :
                  p.color === 'blue' ? 'bg-player-blue' :
                  p.color === 'green' ? 'bg-player-green' : 'bg-player-yellow';

                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedPlayerId(p.id)}
                    className={`p-3 rounded-2xl border text-xs font-display font-bold flex items-center justify-between transition ${
                      isSelected
                        ? 'bg-game-cream border-2 border-game-navy shadow-xs text-game-navy'
                        : 'bg-white border-game-gray text-game-navy/70 hover:border-game-navy/30'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className={`w-3.5 h-3.5 rounded-full ${playerBg} ring-2 ring-white shadow-xs shrink-0`} />
                      <span className="truncate">{p.name}</span>
                    </div>
                    <span className="font-mono text-[11px] text-game-navy/60 font-semibold">{p.budget} GB</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Adjustment Type: Budget or VP */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-game-navy/70 mb-2">
              Resource To Adjust:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setAdjustmentType('budget')}
                className={`py-3 rounded-2xl border text-xs font-display font-bold flex items-center justify-center gap-2 transition ${
                  adjustmentType === 'budget'
                    ? 'bg-[#F4CE70]/20 text-amber-800 border-2 border-[#F4CE70] shadow-xs'
                    : 'bg-white border-game-gray text-game-navy/60 hover:text-game-navy'
                }`}
              >
                <Coins className="w-4 h-4 text-amber-600" />
                <span>Treasury Budget (GB)</span>
              </button>

              <button
                type="button"
                onClick={() => setAdjustmentType('vp')}
                className={`py-3 rounded-2xl border text-xs font-display font-bold flex items-center justify-center gap-2 transition ${
                  adjustmentType === 'vp'
                    ? 'bg-game-blue/20 text-[#2563eb] border-2 border-game-blue shadow-xs'
                    : 'bg-white border-game-gray text-game-navy/60 hover:text-game-navy'
                }`}
              >
                <Award className="w-4 h-4 text-[#2563eb]" />
                <span>Victory Points (VP)</span>
              </button>
            </div>
          </div>

          {/* Direction (+ or -) and Amount */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-game-navy/70 mb-2">
              Amount & Operation:
            </label>
            <div className="flex items-center gap-2">
              <div className="flex bg-game-cream p-1 rounded-2xl border border-game-gray">
                <button
                  type="button"
                  onClick={() => setDeltaMode('+')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-display font-bold transition flex items-center gap-1.5 ${
                    deltaMode === '+' ? 'bg-game-green text-white shadow-xs' : 'text-game-navy/60 hover:text-game-navy'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Add (+)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDeltaMode('-')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-display font-bold transition flex items-center gap-1.5 ${
                    deltaMode === '-' ? 'bg-player-red text-white shadow-xs' : 'text-game-navy/60 hover:text-game-navy'
                  }`}
                >
                  <Minus className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Deduct (-)</span>
                </button>
              </div>

              <input
                type="number"
                min="1"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="flex-1 bg-white border border-game-gray focus:border-game-navy focus:ring-1 focus:ring-game-navy rounded-2xl px-4 py-2.5 text-base font-mono font-bold text-game-navy outline-none text-center shadow-xs"
              />
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-game-navy/70 mb-1.5">
              Reason / Transaction Note:
            </label>
            <input
              type="text"
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="e.g., Physical board trade, dice challenge bonus, rule penalty..."
              className="w-full bg-white border border-game-gray focus:border-game-navy focus:ring-1 focus:ring-game-navy rounded-2xl px-4 py-2.5 text-xs text-game-navy outline-none shadow-xs"
            />
          </div>

          {feedback && (
            <div className="p-3 bg-[#73B77A]/15 border border-[#73B77A]/30 rounded-2xl text-xs text-[#2e6d34] font-medium flex items-center gap-2 animate-in fade-in">
              <CheckCircle className="w-4 h-4 shrink-0 text-game-green" />
              <span>{feedback}</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-game-navy hover:bg-[#1a253a] text-white font-display font-bold text-xs uppercase tracking-wider transition shadow-md hover:shadow-lg game-press"
          >
            Apply Adjustment & Log To History
          </button>
        </form>
      </div>
    </div>
  );
};
