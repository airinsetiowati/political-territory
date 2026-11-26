import React, { useEffect, useState } from 'react';
import { 
  X, 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle, 
  Ban
} from 'lucide-react';
import { useGame } from '../context/GameContext';
import { CrisisCard } from '../types/game';
import { getCardAsset, EVENT_CARD_BACK } from '../utils/cardAssets';

export const CrisisModal: React.FC = () => {
  const { 
    activeModal, 
    activeModalData, 
    closeModal, 
    players, 
    resolveCrisis 
  } = useGame();

  const [selectedOption, setSelectedOption] = useState<'A' | 'B' | 'C' | 'DECLINE' | null>(null);
  const [selectedPlayerId, setSelectedPlayerId] = useState(activeModalData?.playerId || players[0]?.id || '');
  const [statusMessage, setStatusMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  // Modals stay mounted between opens, so re-sync the target player every time
  // a new crisis card is opened. This prevents effects from hitting Player 1.
  useEffect(() => {
    if (activeModal === 'CRISIS_DETAIL') {
      setSelectedPlayerId(activeModalData?.playerId || players[0]?.id || '');
      setSelectedOption(null);
      setStatusMessage(null);
    }
  }, [activeModal, activeModalData?.playerId, activeModalData?.card?.id]);

  if (activeModal !== 'CRISIS_DETAIL' || !activeModalData?.card) return null;

  const card: CrisisCard = activeModalData.card;
  const player = players.find(p => p.id === selectedPlayerId);

  const handleResolve = () => {
    if (!selectedOption) {
      setStatusMessage({ type: 'error', text: 'Silakan pilih salah satu opsi respons atau pilih tolak (decline).' });
      return;
    }
    const res = resolveCrisis(card.id, selectedPlayerId, selectedOption);
    if (res.success) {
      setStatusMessage({ type: 'success', text: res.message });
      setTimeout(() => {
        closeModal();
      }, 1500);
    } else {
      setStatusMessage({ type: 'error', text: res.message });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#253451]/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white border border-[#EAE9E3] rounded-3xl max-w-3xl w-full p-6 md:p-8 shadow-soft-lg relative max-h-[92vh] overflow-y-auto">
        <button
          onClick={closeModal}
          className="absolute top-4 right-4 text-[#253451]/60 hover:text-[#253451] p-1.5 rounded-xl hover:bg-[#F8F5EC] transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3.5 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center border border-red-200 shadow-xs">
            <ShieldAlert className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-200">
                ⚡ SITUASI KRISIS DARURAT
              </span>
              <span className="text-xs font-mono font-extrabold text-[#EF956F] bg-[#F8F5EC] px-2 py-0.5 rounded-md border border-[#EAE9E3]">
                {card.code}
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
                Laporan & Narasi Krisis:
              </h3>
              <p className="text-xs text-[#253451] leading-relaxed bg-[#F8F5EC] p-4 rounded-2xl border border-[#EAE9E3] font-medium">
                {card.description}
              </p>
            </div>

            {/* Select Responding Player */}
            <div>
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#253451]/70 mb-1.5">
                Pemerintah yang Mengambil Keputusan:
              </label>
              <div className="grid grid-cols-2 gap-2">
                {players.map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedPlayerId(p.id)}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-between transition ${
                      selectedPlayerId === p.id
                        ? 'bg-[#253451] text-white border-[#253451] shadow-xs'
                        : 'bg-[#F8F5EC] border-[#EAE9E3] text-[#253451] hover:bg-[#EAE9E3]'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className={`w-2.5 h-2.5 rounded-full ${
                        p.color === 'red' ? 'bg-[#EF4444]' :
                        p.color === 'blue' ? 'bg-[#3B82F6]' :
                        p.color === 'green' ? 'bg-[#10B981]' : 'bg-[#F59E0B]'
                      }`} />
                      <span className="truncate">{p.name}</span>
                    </div>
                    <span className="font-mono text-[10px]">{p.budget} GB</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Options List */}
        <div className="space-y-3 mb-5">
          <div className="text-xs font-extrabold uppercase tracking-wider text-[#253451]">
            Pilih Salah Satu Solusi Kebijakan:
          </div>

          {card.options.map(opt => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setSelectedOption(opt.id)}
              className={`w-full text-left p-4 rounded-2xl border-2 transition flex items-center justify-between gap-4 ${
                selectedOption === opt.id
                  ? 'bg-amber-50/60 border-[#F4CE70] shadow-soft-sm'
                  : 'bg-white border-[#EAE9E3] hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div className={`w-8 h-8 rounded-xl font-black text-xs flex items-center justify-center shrink-0 ${
                  selectedOption === opt.id
                    ? 'bg-[#253451] text-white'
                    : 'bg-[#F8F5EC] text-[#253451] border border-[#EAE9E3]'
                }`}>
                  {opt.id}
                </div>
                <div className="text-xs font-bold text-[#253451] leading-snug">
                  {opt.text}
                </div>
              </div>

              {/* Consequence Preview Badges */}
              <div className="flex items-center gap-2 shrink-0 font-mono text-xs font-bold">
                {opt.costGB > 0 && (
                  <span className="text-[#EF956F] bg-orange-50 px-2.5 py-1 rounded-xl border border-orange-200">
                    -{opt.costGB} GB
                  </span>
                )}
                {opt.pointChange !== 0 && (
                  <span className={`px-2.5 py-1 rounded-xl border ${
                    opt.pointChange > 0 
                      ? 'text-[#73B77A] bg-emerald-50 border-emerald-200' 
                      : 'text-[#EF4444] bg-red-50 border-red-200'
                  }`}>
                    {opt.pointChange > 0 ? `+${opt.pointChange}` : opt.pointChange} VP
                  </span>
                )}
              </div>
            </button>
          ))}

          {/* Option 4: Decline All Options */}
          <button
            type="button"
            onClick={() => setSelectedOption('DECLINE')}
            className={`w-full text-left p-4 rounded-2xl border-2 transition flex items-center justify-between gap-4 ${
              selectedOption === 'DECLINE'
                ? 'bg-red-50/70 border-red-400 shadow-soft-sm'
                : 'bg-white border-[#EAE9E3] hover:border-red-200'
            }`}
          >
            <div className="flex items-center gap-3.5">
              <div className={`w-8 h-8 rounded-xl font-black text-xs flex items-center justify-center shrink-0 ${
                selectedOption === 'DECLINE'
                  ? 'bg-red-600 text-white'
                  : 'bg-[#F8F5EC] text-[#253451]/60 border border-[#EAE9E3]'
              }`}>
                <Ban className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-black text-red-700">Tolak Semua Opsi / Diamkan Krisis</div>
                <div className="text-[11px] text-[#253451]/70 font-medium">{card.declineOption.text}</div>
              </div>
            </div>

            <div className="shrink-0 font-mono text-xs font-bold">
              {card.declineOption.pointChange !== 0 && (
                <span className="text-red-700 bg-red-50 px-2.5 py-1 rounded-xl border border-red-200">
                  {card.declineOption.pointChange} VP
                </span>
              )}
            </div>
          </button>
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

        {/* Confirmation Button */}
        <button
          type="button"
          onClick={handleResolve}
          disabled={!selectedOption || (card.isUsed && !card.isReusable)}
          className="w-full py-3.5 rounded-2xl bg-[#EF4444] hover:bg-red-600 text-white font-extrabold text-sm uppercase tracking-wider shadow-soft-sm transition flex items-center justify-center gap-2 disabled:opacity-40 game-press"
        >
          <CheckCircle className="w-4 h-4 stroke-[2.5]" />
          <span>Konfirmasi Solusi & Terapkan Konsekuensi</span>
        </button>
      </div>
    </div>
  );
};
