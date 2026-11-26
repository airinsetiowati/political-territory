import React, { useEffect, useState } from 'react';
import { 
  X, 
  Target, 
  CheckCircle, 
  AlertTriangle, 
  Coins, 
  Award, 
  ArrowRight
} from 'lucide-react';
import { useGame } from '../context/GameContext';
import { MissionCard } from '../types/game';
import { getCardAsset, EVENT_CARD_BACK } from '../utils/cardAssets';

export const MissionModal: React.FC = () => {
  const { 
    activeModal, 
    activeModalData, 
    closeModal, 
    players, 
    territories,
    activateMission,
    completeMission 
  } = useGame();

  const [selectedPlayerId, setSelectedPlayerId] = useState(activeModalData?.playerId || players[0]?.id || '');
  const [statusMessage, setStatusMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  // Re-sync ownership every time a mission is opened, including missions opened
  // from the dashboard for a specific player.
  useEffect(() => {
    if (activeModal === 'MISSION_DETAIL') {
      setSelectedPlayerId(activeModalData?.playerId || players[0]?.id || '');
      setStatusMessage(null);
    }
  }, [activeModal, activeModalData?.playerId, activeModalData?.card?.id]);

  if (activeModal !== 'MISSION_DETAIL' || !activeModalData?.card) return null;

  const card: MissionCard = activeModalData.card;
  const player = players.find(p => p.id === selectedPlayerId);

  // Check progress
  let currentProgressCount = 0;
  let targetCount = card.targetCount || 1;
  if (player && card.conditionType === 'own_category_count' && card.targetCategory) {
    currentProgressCount = territories.filter(t => t.ownerId === player.id && t.category === card.targetCategory).length;
  }

  const isConditionMet = currentProgressCount >= targetCount;
  const progressPct = Math.min(100, Math.round((currentProgressCount / targetCount) * 100));

  const handleActivate = () => {
    const res = activateMission(card.id, selectedPlayerId);
    if (res.success) {
      setStatusMessage({ type: 'success', text: res.message });
      setTimeout(() => closeModal(), 1500);
    } else {
      setStatusMessage({ type: 'error', text: res.message });
    }
  };

  const handleComplete = () => {
    const res = completeMission(card.id, selectedPlayerId);
    if (res.success) {
      setStatusMessage({ type: 'success', text: res.message });
      setTimeout(() => closeModal(), 1500);
    } else {
      setStatusMessage({ type: 'error', text: res.message });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#253451]/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white border border-[#EAE9E3] rounded-3xl max-w-2xl w-full p-6 md:p-8 shadow-soft-lg relative max-h-[92vh] overflow-y-auto">
        <button
          onClick={closeModal}
          className="absolute top-4 right-4 text-[#253451]/60 hover:text-[#253451] p-1.5 rounded-xl hover:bg-[#F8F5EC] transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3.5 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center border border-purple-200 shadow-xs">
            <Target className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
                STRATEGIC QUEST
              </span>
              <span className="text-xs font-mono font-extrabold text-[#EF956F] bg-[#F8F5EC] px-2 py-0.5 rounded-md border border-[#EAE9E3]">
                {card.code}
              </span>
              <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                card.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                card.status === 'active' ? 'bg-blue-100 text-blue-800' :
                'bg-[#EAE9E3] text-[#253451]'
              }`}>
                {card.status}
              </span>
            </div>
            <h2 className="text-xl font-display font-black text-[#253451] uppercase tracking-wide mt-1">
              {card.title}
            </h2>
          </div>
        </div>

        {/* Card Artwork & Description */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
          <div className="h-64 bg-[#F8F5EC] rounded-2xl overflow-hidden border border-[#EAE9E3] flex items-center justify-center p-3 shadow-xs">
            <img
              src={getCardAsset(card.image, EVENT_CARD_BACK)}
              alt={card.title}
              className="w-full h-full object-contain rounded-xl drop-shadow-sm"
              onError={(e) => {
                (e.target as HTMLImageElement).src = EVENT_CARD_BACK;
              }}
            />
          </div>

          <div className="flex flex-col justify-between space-y-4">
            <div>
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#253451]/60 mb-1">
                Instruksi Quest:
              </h3>
              <p className="text-xs text-[#253451] leading-relaxed bg-[#F8F5EC] p-4 rounded-2xl border border-[#EAE9E3] font-medium">
                {card.description}
              </p>
            </div>

            {/* Select Player */}
            <div>
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#253451]/70 mb-1.5">
                Pemain Pemilik Quest:
              </label>
              <div className="grid grid-cols-2 gap-2">
                {players.map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedPlayerId(p.id)}
                    className={`p-2 rounded-xl border text-xs font-bold flex items-center justify-between transition ${
                      selectedPlayerId === p.id
                        ? 'bg-[#253451] text-white border-[#253451] shadow-xs'
                        : 'bg-[#F8F5EC] border-[#EAE9E3] text-[#253451] hover:bg-[#EAE9E3]'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      <span className={`w-2.5 h-2.5 rounded-full ${
                        p.color === 'red' ? 'bg-[#EF4444]' :
                        p.color === 'blue' ? 'bg-[#3B82F6]' :
                        p.color === 'green' ? 'bg-[#10B981]' : 'bg-[#F59E0B]'
                      }`} />
                      <span className="truncate">{p.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Progress & Condition Checker */}
        <div className="bg-[#F8F5EC] border border-[#EAE9E3] rounded-2xl p-4 mb-5 space-y-2">
          <div className="flex justify-between items-center text-xs font-bold text-[#253451]">
            <span>Progres Penyelesaian Sektor {card.targetCategory ? `(${card.targetCategory.toUpperCase()})` : ''}</span>
            <span className="font-mono">{currentProgressCount} / {targetCount} ({progressPct}%)</span>
          </div>
          <div className="w-full bg-[#EAE9E3] h-2.5 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                isConditionMet ? 'bg-[#73B77A]' : 'bg-purple-600'
              }`}
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <div className="text-[11px] text-[#253451]/70 pt-1">
            {isConditionMet ? (
              <span className="text-[#73B77A] font-bold flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" />
                Target quest terpenuhi! Anda dapat mengklaim hadiah sekarang.
              </span>
            ) : (
              <span>Target belum terpenuhi. Kuasai wilayah yang sesuai pada peta untuk menyelesaikan misi ini.</span>
            )}
          </div>
        </div>

        {/* Reward Pills */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-2xl text-center">
            <span className="text-[10px] font-extrabold uppercase text-emerald-800 block mb-0.5">Hadiah Victory Points</span>
            <div className="text-xl font-mono font-black text-emerald-800">+{card.rewardPoints} VP</div>
          </div>

          <div className="bg-[#F4CE70]/20 border border-[#F4CE70]/50 p-3 rounded-2xl text-center">
            <span className="text-[10px] font-extrabold uppercase text-[#253451] block mb-0.5">Hadiah Budget GB</span>
            <div className="text-xl font-mono font-black text-[#253451]">+{card.rewardGB || 0} GB</div>
          </div>
        </div>

        {/* Status Message */}
        {statusMessage && (
          <div className={`p-3.5 rounded-2xl mb-4 text-xs font-bold flex items-center gap-2 border ${
            statusMessage.type === 'error'
              ? 'bg-red-50 border-red-200 text-red-700'
              : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}>
            {statusMessage.type === 'error' ? (
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-500" />
            ) : (
              <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          {card.status !== 'completed' && card.status !== 'active' && (
            <button
              type="button"
              onClick={handleActivate}
              className="flex-1 py-3.5 rounded-2xl bg-[#253451] hover:bg-[#1C273D] text-white font-extrabold text-xs uppercase tracking-wider transition shadow-soft-sm game-press"
            >
              Ambil & Aktifkan Quest Ini
            </button>
          )}

          {card.status !== 'completed' && (
            <button
              type="button"
              onClick={handleComplete}
              disabled={!isConditionMet && card.conditionType !== 'custom'}
              className="flex-1 py-3.5 rounded-2xl bg-[#73B77A] hover:bg-[#5fa867] text-white font-extrabold text-xs uppercase tracking-wider transition shadow-soft-sm disabled:opacity-40 game-press"
            >
              Selesaikan Quest & Klaim Hadiah
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
