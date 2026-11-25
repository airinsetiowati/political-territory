import React, { useState, useEffect } from 'react';
import { 
  X, 
  QrCode, 
  Search, 
  CheckCircle, 
  AlertTriangle, 
  Flag,
  ArrowRight
} from 'lucide-react';
import { useGame } from '../context/GameContext';
import { PolicyCard } from '../types/game';

export const QuickCardEntryModal: React.FC = () => {
  const { 
    activeModal, 
    activeModalData,
    closeModal, 
    verifyCardCode, 
    players, 
    territories, 
    activePlayer,
    claimTurnPlayer,
    diceState,
    devicePlayerId,
    claimTerritory, 
    openModal
  } = useGame();

  const lockedRollerId = claimTurnPlayer?.id || null;
  const defaultPlayerId = lockedRollerId || activeModalData?.playerId || activePlayer?.id || players[0]?.id || '';

  const [inputCode, setInputCode] = useState('');
  const [selectedPlayerId, setSelectedPlayerId] = useState(defaultPlayerId);
  const [selectedTerritoryId, setSelectedTerritoryId] = useState('');
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  useEffect(() => {
    if (activeModal === 'QUICK_CARD_ENTRY') {
      setSelectedPlayerId(lockedRollerId || activeModalData?.playerId || activePlayer?.id || players[0]?.id || '');
      setInputCode('');
      setSelectedTerritoryId('');
      setVerificationResult(null);
      setStatusMessage(null);
    }
  }, [activeModal, activeModalData?.playerId, lockedRollerId, activePlayer?.id, players]);

  if (activeModal !== 'QUICK_CARD_ENTRY') return null;

  const hasRolled = Boolean(diceState.hasRolledThisTurn && claimTurnPlayer);
  const effectivePolicyPlayerId = claimTurnPlayer?.id || activePlayer?.id || selectedPlayerId;
  const effectivePolicyPlayer = players.find(p => p.id === effectivePolicyPlayerId) || activePlayer;
  const isPolicyDeviceAllowed = devicePlayerId === 'all' || devicePlayerId === effectivePolicyPlayerId;

  const handleVerify = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setStatusMessage(null);
    if (!inputCode.trim()) {
      setStatusMessage({ type: 'error', text: 'Silakan masukkan kode kartu fisik.' });
      return;
    }

    const res = verifyCardCode(inputCode);
    if (res.type === 'not_found') {
      setStatusMessage({ 
        type: 'error', 
        text: `Kode kartu "${inputCode.trim().toUpperCase()}" tidak ditemukan. Periksa ejaan atau periksa daftar kartu.` 
      });
      setVerificationResult(null);
    } else {
      setVerificationResult(res);
      if (res.type === 'policy') {
        const pol = res.card as PolicyCard;
        if (pol.targetTerritoryId) {
          setSelectedTerritoryId(pol.targetTerritoryId);
        } else {
          const unclaimed = territories.find(t => t.ownerId === null);
          if (unclaimed) setSelectedTerritoryId(unclaimed.id);
        }
      }
    }
  };

  const handleClaim = () => {
    if (!effectivePolicyPlayerId || !selectedTerritoryId || !verificationResult?.card) return;
    if (diceState.isRolling) {
      setStatusMessage({ type: 'error', text: 'Animasi dadu sedang berlangsung. Tunggu hingga selesai.' });
      return;
    }
    if (!hasRolled || !claimTurnPlayer) {
      setStatusMessage({
        type: 'error',
        text: `${activePlayer?.name || 'Pemain aktif'} harus melakukan Roll Dice terlebih dahulu sebelum mengklaim wilayah.`
      });
      return;
    }
    if (!isPolicyDeviceAllowed) {
      setStatusMessage({
        type: 'error',
        text: `Bukan giliran perangkat ini. Klaim hanya dapat dilakukan oleh ${effectivePolicyPlayer?.name}.`
      });
      return;
    }
    const res = claimTerritory(effectivePolicyPlayerId, selectedTerritoryId, verificationResult.card.code);
    if (res.success) {
      setStatusMessage({ type: 'success', text: res.message });
      setTimeout(() => {
        closeModal();
      }, 1400);
    } else {
      setStatusMessage({ type: 'error', text: res.message });
    }
  };

  const handleOpenSpecificModal = () => {
    if (!verificationResult) return;
    closeModal();
    if (verificationResult.type === 'crisis') {
      openModal('CRISIS_DETAIL', { card: verificationResult.card, playerId: selectedPlayerId });
    } else if (verificationResult.type === 'mission') {
      openModal('MISSION_DETAIL', { card: verificationResult.card, playerId: selectedPlayerId });
    } else if (verificationResult.type === 'opportunity') {
      openModal('OPPORTUNITY_DETAIL', { card: verificationResult.card, playerId: selectedPlayerId });
    }
  };

  const selectedTerritory = territories.find(t => t.id === selectedTerritoryId);

  return (
    <div className="fixed inset-0 z-50 bg-[#253451]/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white border border-[#EAE9E3] rounded-3xl max-w-2xl w-full p-6 md:p-7 shadow-soft-lg relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={closeModal}
          className="absolute top-4 right-4 text-[#253451]/60 hover:text-[#253451] p-1.5 rounded-xl hover:bg-[#F8F5EC] transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-[#F8F5EC] text-[#253451] flex items-center justify-center border border-[#EAE9E3] shadow-xs">
            <QrCode className="w-6 h-6 text-[#EF956F]" />
          </div>
          <div>
            <h2 className="text-xl font-display font-black text-[#253451] tracking-tight">
              Input & Validasi Kartu Fisik
            </h2>
            <p className="text-xs text-[#253451]/70">
              Masukkan kode alfanumerik yang tertera pada kartu fisik board game Anda.
            </p>
          </div>
        </div>

        {/* Code Input Form */}
        <form onSubmit={handleVerify} className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <input
              type="text"
              value={inputCode}
              onChange={e => {
                setInputCode(e.target.value);
                setVerificationResult(null);
                setStatusMessage(null);
              }}
              placeholder="Contoh: POL-01, CRS-01, MIS-01, OPP-01, SBS-01"
              className="w-full bg-[#F8F5EC] border border-[#EAE9E3] focus:border-[#253451] rounded-2xl px-4 py-3 text-sm font-mono tracking-wider text-[#253451] placeholder-[#253451]/40 uppercase outline-none font-bold transition"
              autoFocus
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 rounded-2xl bg-[#253451] hover:bg-[#1C273D] text-white font-extrabold text-sm tracking-wide shadow-soft-sm transition flex items-center gap-2 shrink-0 game-press"
          >
            <Search className="w-4 h-4 text-[#F4CE70]" />
            <span>Periksa</span>
          </button>
        </form>

        {/* Status Message Alert */}
        {statusMessage && (
          <div className={`p-3.5 rounded-2xl mb-4 text-xs font-bold flex items-center gap-2.5 border ${
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

        {/* Verification Result Display */}
        {verificationResult && verificationResult.card && (
          <div className="bg-[#F8F5EC] border border-[#EAE9E3] rounded-3xl p-5 mt-2 space-y-4">
            <div className="flex flex-col sm:flex-row gap-5">
              {/* Card Image Display */}
              <div className="w-full sm:w-44 h-56 bg-white rounded-2xl overflow-hidden border border-[#EAE9E3] flex items-center justify-center shrink-0 shadow-xs p-2">
                <img
                  src={verificationResult.card.image}
                  alt={verificationResult.card.title || verificationResult.card.name}
                  className="w-full h-full object-contain rounded-xl"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/game-assets/event-back';
                  }}
                />
              </div>

              {/* Card Info & Details */}
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      verificationResult.type === 'policy' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                      verificationResult.type === 'crisis' ? 'bg-red-100 text-red-800 border border-red-200' :
                      verificationResult.type === 'mission' ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                      'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    }`}>
                      KARTU {verificationResult.type.toUpperCase()}
                    </span>
                    <span className="font-mono text-xs font-extrabold text-[#EF956F] bg-white px-2 py-0.5 rounded-md border border-[#EAE9E3]">
                      {verificationResult.card.code}
                    </span>
                    {verificationResult.isUsed && (
                      <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200 text-[10px] font-extrabold">
                        SUDAH TERPAKAI
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-display font-extrabold text-[#253451] mb-1">
                    {verificationResult.card.title || verificationResult.card.name}
                  </h3>

                  <p className="text-xs text-[#253451]/75 leading-relaxed mb-3 font-medium">
                    {verificationResult.card.description || 'Kartu Policy fisik untuk mengklaim wilayah sovereign.'}
                  </p>
                </div>

                {/* Player Selector */}
                <div className="pt-3 border-t border-[#EAE9E3]">
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#253451]/70 mb-1.5">
                    {verificationResult.type === 'policy'
                      ? (lockedRollerId
                        ? `Pelempar Dadu Aktif (Claim): ${claimTurnPlayer?.name}`
                        : `Pemain Giliran Aktif: ${activePlayer?.name}`)
                      : 'Pemain yang Melakukan Aksi:'}
                  </label>
                  {verificationResult.type === 'policy' && lockedRollerId && (
                    <div className="mb-2 px-2.5 py-1 rounded-xl bg-amber-50 border border-amber-200 text-[10px] font-bold text-amber-900">
                      🎲 Kepemilikan wilayah otomatis diberikan ke {claimTurnPlayer?.name} (Dadu: {diceState.currentValue ?? '-'}).
                    </div>
                  )}
                  {verificationResult.type === 'policy' && !hasRolled && (
                    <div className="mb-2 px-2.5 py-1 rounded-xl bg-amber-50 border border-amber-200 text-[10px] font-bold text-amber-900">
                      🎲 {activePlayer?.name} harus melempar dadu (Roll Dice) terlebih dahulu sebelum mengklaim wilayah.
                    </div>
                  )}
                  {verificationResult.type === 'policy' && hasRolled && !isPolicyDeviceAllowed && (
                    <div className="mb-2 px-2.5 py-1 rounded-xl bg-red-50 border border-red-200 text-[10px] font-bold text-red-700">
                      Perangkat ini berperan sebagai pemain lain. Hanya {effectivePolicyPlayer?.name} atau Meja Bersama yang dapat melakukan klaim.
                    </div>
                  )}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {players.map(p => {
                      const isLockedOut = verificationResult.type === 'policy' && p.id !== effectivePolicyPlayerId;
                      const isSelected = (verificationResult.type === 'policy' ? effectivePolicyPlayerId : selectedPlayerId) === p.id;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          disabled={isLockedOut}
                          onClick={() => {
                            if (!isLockedOut) setSelectedPlayerId(p.id);
                          }}
                          className={`p-2 rounded-xl border text-xs font-bold flex items-center justify-between transition ${
                            isSelected
                              ? 'bg-[#253451] text-white border-[#253451] shadow-xs'
                              : isLockedOut
                                ? 'bg-white border-[#EAE9E3] text-[#253451]/35 opacity-45 cursor-not-allowed'
                                : 'bg-white border-[#EAE9E3] text-[#253451] hover:bg-[#EAE9E3]'
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
                          <span className="font-mono text-[10px]">{p.budget}GB</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Section Depending on Type */}
            {verificationResult.type === 'policy' && (
              <div className="pt-3 border-t border-[#EAE9E3] space-y-3">
                {verificationResult.card.isFreeChoice ? (
                  <div>
                    <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#253451] mb-1">
                      Kartu Bebas Pilih: Pilih Wilayah Mana Saja yang Belum Dikuasai:
                    </label>
                    <select
                      value={selectedTerritoryId}
                      onChange={e => setSelectedTerritoryId(e.target.value)}
                      className="w-full bg-white border border-[#EAE9E3] rounded-2xl px-3.5 py-2.5 text-xs text-[#253451] outline-none focus:border-[#253451] font-bold"
                    >
                      {territories.filter(t => t.ownerId === null).map(t => (
                        <option key={t.id} value={t.id}>
                          {t.name} ({t.category.toUpperCase()} — Klaim: {t.claimCost} GB, +{t.basePoints} VP, +{t.baseIncome} GB/siklus)
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  selectedTerritory && (
                    <div className="p-3.5 bg-white rounded-2xl border border-[#EAE9E3] text-xs flex items-center justify-between">
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-[#253451]/50">Target Wilayah:</div>
                        <div className="font-bold text-[#253451] text-sm">{selectedTerritory.name}</div>
                        <div className="text-[11px] text-[#253451]/60 capitalize">Sektor: {selectedTerritory.category}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-mono font-black text-[#253451]">Biaya: {selectedTerritory.claimCost} GB</div>
                        <div className="text-[11px] text-[#73B77A] font-bold">Income: +{selectedTerritory.baseIncome} GB/siklus</div>
                        <div className="text-[11px] text-[#3B82F6] font-bold">Poin: +{selectedTerritory.basePoints} VP</div>
                      </div>
                    </div>
                  )
                )}

                <button
                  type="button"
                  onClick={handleClaim}
                  disabled={!hasRolled || (verificationResult.isUsed && !verificationResult.card.isReusable) || diceState.isRolling || !isPolicyDeviceAllowed || statusMessage?.type === 'success'}
                  className="w-full py-3.5 rounded-2xl bg-[#253451] hover:bg-[#1C273D] text-white font-extrabold text-xs uppercase tracking-wider shadow-soft-sm transition flex items-center justify-center gap-2 disabled:opacity-40 game-press"
                >
                  <Flag className="w-4 h-4 text-[#F4CE70]" />
                  <span>
                    {!hasRolled
                      ? `Roll Dice Terlebih Dahulu (${activePlayer?.name})`
                      : !isPolicyDeviceAllowed
                        ? `Menunggu ${effectivePolicyPlayer?.name}`
                        : `Klaim Wilayah Ini (${effectivePolicyPlayer?.name})`}
                  </span>
                </button>
              </div>
            )}

            {(verificationResult.type === 'crisis' || 
              verificationResult.type === 'mission' || 
              verificationResult.type === 'opportunity') && (
              <div className="pt-3 border-t border-[#EAE9E3]">
                <button
                  type="button"
                  onClick={handleOpenSpecificModal}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#F4CE70] to-[#EF956F] hover:opacity-95 text-[#253451] font-black text-xs uppercase tracking-wider shadow-soft-sm transition flex items-center justify-center gap-2 game-press"
                >
                  <span>Buka Dialog {verificationResult.type.toUpperCase()}</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
