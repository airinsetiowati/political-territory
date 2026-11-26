import React, { useState, useEffect } from 'react';
import { 
  X, 
  TrendingUp, 
  Sparkles, 
  CheckCircle, 
  AlertTriangle, 
  Coins, 
  Award, 
  Clock,
  MapPin,
  Check
} from 'lucide-react';
import { useGame } from '../context/GameContext';
import { OpportunityCard, Territory } from '../types/game';
import { getCardAsset, EVENT_CARD_BACK } from '../utils/cardAssets';
import { CategoryLogo } from './CategoryLogo';
import { CATEGORY_NAMES } from '../utils/categoryAssets';

export const OpportunityModal: React.FC = () => {
  const { 
    activeModal, 
    activeModalData, 
    closeModal, 
    players, 
    territories,
    activateOpportunity 
  } = useGame();

  const [selectedPlayerId, setSelectedPlayerId] = useState(activeModalData?.playerId || players[0]?.id || '');
  const [selectedTerritoryId, setSelectedTerritoryId] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  const card: OpportunityCard | null = activeModal === 'OPPORTUNITY_DETAIL' ? activeModalData?.card : null;
  const player = players.find(p => p.id === selectedPlayerId) || players[0];

  // Re-sync the beneficiary whenever a new opportunity is opened.
  useEffect(() => {
    if (activeModal === 'OPPORTUNITY_DETAIL') {
      setSelectedPlayerId(activeModalData?.playerId || players[0]?.id || '');
      setSelectedTerritoryId('');
      setStatusMessage(null);
    }
  }, [activeModal, activeModalData?.playerId, activeModalData?.card?.id]);

  // Matching territories owned by the selected player
  const matchingTerritories: Territory[] = card?.targetCategory
    ? territories.filter(t => t.ownerId === selectedPlayerId && t.category === card.targetCategory)
    : [];

  // Update selected territory whenever player or card changes
  useEffect(() => {
    if (card?.targetCategory) {
      if (matchingTerritories.length > 0) {
        if (!matchingTerritories.some(t => t.id === selectedTerritoryId)) {
          setSelectedTerritoryId(matchingTerritories[0].id);
        }
      } else {
        setSelectedTerritoryId('');
      }
    } else {
      setSelectedTerritoryId('');
    }
  }, [selectedPlayerId, card?.targetCategory, matchingTerritories.length]);

  if (activeModal !== 'OPPORTUNITY_DETAIL' || !card) return null;

  const hasSufficientGB = (player?.budget ?? 0) >= card.costGB;
  const hasMatchingTerritory = !card.targetCategory || matchingTerritories.length > 0;
  const canActivate = !card.isUsed && hasSufficientGB && hasMatchingTerritory && (!card.targetCategory || Boolean(selectedTerritoryId));

  const handleActivate = () => {
    setStatusMessage(null);
    if (card.targetCategory && !selectedTerritoryId) {
      setStatusMessage({ 
        type: 'error', 
        text: `Harap pilih 1 wilayah kategori ${CATEGORY_NAMES[card.targetCategory]} milik Anda!` 
      });
      return;
    }

    const res = activateOpportunity(card.id, selectedPlayerId, card.targetCategory ? selectedTerritoryId : undefined);
    if (res.success) {
      setStatusMessage({ type: 'success', text: res.message });
      setTimeout(() => {
        closeModal();
      }, 1600);
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
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center border border-emerald-200 shadow-xs shrink-0">
            <TrendingUp className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                OPPORTUNITY EVENT
              </span>
              <span className="text-xs font-mono font-extrabold text-emerald-700 bg-[#F8F5EC] px-2 py-0.5 rounded-md border border-[#EAE9E3]">
                {card.code}
              </span>
              {card.targetCategory ? (
                <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                  <CategoryLogo category={card.targetCategory} size="xs" />
                  <span>Khusus Kategori {CATEGORY_NAMES[card.targetCategory]}</span>
                </span>
              ) : (
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-900 border border-blue-200">
                  🌐 Skala Umum Seluruh Wilayah
                </span>
              )}
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
                Deskripsi Program Stimulus:
              </h3>
              <p className="text-xs text-[#253451] leading-relaxed bg-[#F8F5EC] p-4 rounded-2xl border border-[#EAE9E3] font-medium">
                {card.description}
              </p>
            </div>

            {/* Select Player */}
            <div>
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#253451]/70 mb-1.5">
                Penerima Manfaat / Pemain Pengguna:
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
                    <span className="font-mono text-[10px]">{p.budget} GB</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Territory Target Selector (For Cards with Category Logo) */}
        {card.targetCategory && (
          <div className="bg-[#FFFBEB] border-2 border-amber-300/80 rounded-2xl p-4 mb-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CategoryLogo category={card.targetCategory} size="sm" showBorder />
                <div>
                  <span className="text-xs font-display font-black text-[#253451] uppercase tracking-wide">
                    Pilih 1 Wilayah Sasaran (Kategori: {CATEGORY_NAMES[card.targetCategory]})
                  </span>
                  <p className="text-[11px] text-[#253451]/70 font-medium">
                    Kartu ini hanya dapat diterapkan pada SATU wilayah milik Anda dengan kategori yang sama.
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-mono font-extrabold px-2 py-0.5 rounded-md bg-amber-200 text-amber-900 border border-amber-300">
                {matchingTerritories.length} Wilayah Tersedia
              </span>
            </div>

            {matchingTerritories.length === 0 ? (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2 font-medium">
                <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                <span>
                  <strong>Wilayah Tidak Ditemukan:</strong> Pemain <strong>{player?.name}</strong> belum memiliki wilayah berkategori <strong>{CATEGORY_NAMES[card.targetCategory]}</strong>. Kartu ini tidak dapat digunakan.
                </span>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {matchingTerritories.map(terr => {
                  const isSelected = selectedTerritoryId === terr.id;
                  const currentBonus = (terr.activeBonuses || []).reduce((s, b) => s + (b.incomeBonus || 0), 0);
                  return (
                    <button
                      key={terr.id}
                      type="button"
                      onClick={() => setSelectedTerritoryId(terr.id)}
                      className={`p-3 rounded-xl border text-left flex items-center justify-between transition ${
                        isSelected 
                          ? 'bg-[#253451] text-white border-[#253451] shadow-xs' 
                          : 'bg-white border-[#EAE9E3] text-[#253451] hover:border-amber-400'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                          isSelected ? 'bg-emerald-500 text-white' : 'border border-[#EAE9E3] bg-[#F8F5EC]'
                        }`}>
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <div className="truncate">
                          <div className="font-display font-black text-xs truncate">
                            {terr.name}
                          </div>
                          <div className={`text-[10px] font-mono ${isSelected ? 'text-amber-300' : 'text-[#253451]/60'}`}>
                            Base: +{terr.baseIncome} GB/cy {currentBonus > 0 && `(Bonus saat ini: +${currentBonus})`}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* General Scope Info (For Cards without specific Category Logo) */}
        {!card.targetCategory && (
          <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-3.5 mb-5 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="text-xs text-blue-900 leading-snug">
              <span className="font-bold">Stimulus Ekonomi Skala Umum: </span>
              Efek kartu ini memberikan manfaat ekonomi langsung kepada perbendaharaan <strong>{player?.name}</strong> tanpa terbatas pada kategori wilayah tertentu.
            </div>
          </div>
        )}

        {/* Effects Breakdown Grid */}
        <div className="bg-[#F8F5EC] border border-[#EAE9E3] rounded-2xl p-4 mb-5">
          <div className="text-xs font-extrabold uppercase tracking-wider text-[#253451] mb-3">
            Rincian Manfaat Ekonomi:
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3 bg-white rounded-xl border border-[#EAE9E3] text-center shadow-xs">
              <span className="text-[10px] font-extrabold uppercase text-[#253451]/60 block mb-0.5">Biaya Aktivasi</span>
              <div className="font-mono font-black text-sm text-[#253451]">
                {card.costGB > 0 ? `-${card.costGB} GB` : 'Gratis (Free)'}
              </div>
            </div>

            <div className="p-3 bg-white rounded-xl border border-[#EAE9E3] text-center shadow-xs">
              <span className="text-[10px] font-extrabold uppercase text-[#253451]/60 block mb-0.5">Bonus VP Langsung</span>
              <div className="font-mono font-black text-sm text-[#3B82F6]">
                +{card.immediatePoints} VP
              </div>
            </div>

            <div className="p-3 bg-white rounded-xl border border-[#EAE9E3] text-center shadow-xs">
              <span className="text-[10px] font-extrabold uppercase text-[#253451]/60 block mb-0.5">Income Berkala</span>
              <div className="font-mono font-black text-sm text-[#73B77A]">
                {card.recurringGB > 0 ? `+${card.recurringGB} GB/cy` : 'Tidak Ada'}
              </div>
            </div>

            <div className="p-3 bg-white rounded-xl border border-[#EAE9E3] text-center shadow-xs">
              <span className="text-[10px] font-extrabold uppercase text-[#253451]/60 block mb-0.5">Durasi Program</span>
              <div className="font-mono font-black text-sm text-[#253451]">
                {card.isPermanent || card.durationCycles === 0 ? 'Permanen' : `${card.durationCycles} Putaran`}
              </div>
            </div>
          </div>
        </div>

        {/* Status Alert */}
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

        {/* GB Insufficiency Alert */}
        {!hasSufficientGB && (
          <div className="p-3 rounded-2xl mb-4 bg-red-50 border border-red-200 text-xs font-bold text-red-700 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
            <span>Saldo GB {player?.name} ({player?.budget} GB) tidak mencukupi untuk biaya aktivasi ({card.costGB} GB).</span>
          </div>
        )}

        {/* Confirmation Button */}
        <button
          type="button"
          onClick={handleActivate}
          disabled={!canActivate}
          className="w-full py-3.5 rounded-2xl bg-[#73B77A] hover:bg-[#5fa867] text-white font-extrabold text-sm uppercase tracking-wider shadow-soft-sm transition flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed game-press"
        >
          <Sparkles className="w-4 h-4 stroke-[2.5]" />
          <span>
            {card.isUsed 
              ? 'Kartu Sudah Terpakai' 
              : !hasMatchingTerritory 
                ? 'Wilayah Kategori Tidak Tersedia'
                : !hasSufficientGB 
                  ? 'Saldo GB Tidak Mencukupi'
                  : 'Konfirmasi & Aktifkan Opportunity'}
          </span>
        </button>
      </div>
    </div>
  );
};