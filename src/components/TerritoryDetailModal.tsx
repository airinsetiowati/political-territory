import React, { useState, useEffect } from 'react';
import { 
  X, 
  Coins, 
  Award, 
  TrendingUp, 
  Sparkles, 
  Flag, 
  CheckCircle, 
  AlertTriangle,
  Check,
  Ban
} from 'lucide-react';
import { useGame } from '../context/GameContext';
import { Territory, PolicyCard } from '../types/game';
import { CategoryLogo } from './CategoryLogo';
import { PlayerLogo } from './PlayerLogo';
import { getCardAsset, POLICY_CARD_BACK } from '../utils/cardAssets';

export const TerritoryDetailModal: React.FC = () => {
  const { 
    activeModal, 
    activeModalData, 
    closeModal, 
    territories, 
    players, 
    policyCards,
    activePlayer,
    claimTurnPlayer,
    activePendingClaim,
    diceState,
    devicePlayerId,
    claimTerritory, 
    revokeTerritoryClaim,
    economyConfig,
    settings 
  } = useGame();

  // A saved claim strip can explicitly name its roller; otherwise fall back
  // to the claim associated with the current turn.
  const rollerId = activeModalData?.rollerId || claimTurnPlayer?.id || null;
  const defaultPlayerId = activeModalData?.playerId || rollerId || activePlayer?.id || players[0]?.id || '';

  const [inputCode, setInputCode] = useState('');
  const [selectedPlayerId, setSelectedPlayerId] = useState(defaultPlayerId);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (activeModal === 'TERRITORY_DETAIL') {
      setSelectedPlayerId(activeModalData?.playerId || rollerId || activePlayer?.id || players[0]?.id || '');
      setInputCode('');
      setErrorMessage(null);
      setSuccessMessage(null);
    }
  }, [activeModal, activeModalData?.territoryId, activeModalData?.playerId, activeModalData?.rollerId, rollerId, activePlayer?.id]);

  if (activeModal !== 'TERRITORY_DETAIL' || !activeModalData?.territoryId) return null;

  const territory: Territory | undefined = territories.find(t => t.id === activeModalData.territoryId);
  if (!territory) return null;

  const hasRolled = Boolean(rollerId);
  const rollerPlayer = players.find(p => p.id === rollerId);
  const effectivePlayerId = selectedPlayerId || rollerId || activePlayer?.id || players[0]?.id || '';
  const owner = territory.ownerId ? players.find(p => p.id === territory.ownerId) : null;
  const selectedPlayer = players.find(p => p.id === effectivePlayerId) || players[0];
  const isDeviceAllowed = devicePlayerId === 'all' || devicePlayerId === rollerId;
  const claimDiceValue = activePendingClaim?.diceValue ?? diceState.currentValue;
  const catConfig = economyConfig[territory.category] || {
    basePoints: territory.basePoints,
    claimCost: territory.claimCost,
    baseIncome: territory.baseIncome
  };

  // Find all compatible policy cards for this territory:
  // 1. Direct category cards (e.g. WTR cards for Water, AGR cards for Agriculture)
  // 2. Free Choice cards (SBS Bebas Pilih)
  const categoryCards = policyCards.filter(c => c.category === territory.category);
  const freeChoiceCards = policyCards.filter(c => c.isFreeChoice || c.category === 'free_choice');
  const allCompatibleCards = [...categoryCards, ...freeChoiceCards];

  // Active typed/selected card lookup
  const cleanInput = inputCode.trim().toUpperCase();
  const normalize = (s: string) => s.replace(/[\s\-_]/g, '').toUpperCase();
  const inputNorm = normalize(cleanInput);

  let currentCard: PolicyCard | null = null;
  if (cleanInput) {
    currentCard = policyCards.find(c => {
      if (c.code.toUpperCase() === cleanInput) return true;
      if (normalize(c.code) === inputNorm) return true;
      const cDigits = c.code.match(/\d+/)?.[0];
      const inputDigits = cleanInput.match(/\d+/)?.[0];
      const cPrefix = c.code.replace(/[\d\-_]/g, '').toUpperCase();
      const inputPrefix = cleanInput.replace(/[\d\-_]/g, '').toUpperCase();
      if (cPrefix === inputPrefix && cDigits && inputDigits && parseInt(cDigits, 10) === parseInt(inputDigits, 10)) {
        return true;
      }
      return false;
    }) || null;

    if (!currentCard && (cleanInput.includes('ANY') || cleanInput.startsWith('ANY'))) {
      const catOrPrefix = cleanInput.replace(/[^A-Z]/g, '').replace('ANY', '');
      currentCard = policyCards.find(c => {
        if (c.isUsed && !c.isReusable) return false;
        if (catOrPrefix === 'SBS' || catOrPrefix === 'FREE') return c.isFreeChoice || c.category === 'free_choice';
        if (catOrPrefix === 'WTR' || catOrPrefix === 'WATER') return c.category === 'water';
        if (catOrPrefix === 'POL' || catOrPrefix === 'POLITICS') return c.category === 'politics';
        if (catOrPrefix === 'IND' || catOrPrefix === 'INDUSTRY') return c.category === 'industry';
        if (catOrPrefix === 'EDN' || catOrPrefix === 'EDUCATION') return c.category === 'education';
        if (catOrPrefix === 'CRE' || catOrPrefix === 'HEALTHCARE') return c.category === 'healthcare';
        if (catOrPrefix === 'AGR' || catOrPrefix === 'AGRICULTURE') return c.category === 'agriculture';
        if (catOrPrefix === 'TRM' || catOrPrefix === 'TOU' || catOrPrefix === 'TOURISM') return c.category === 'tourism';
        if (catOrPrefix === 'RST' || catOrPrefix === 'FOR' || catOrPrefix === 'FOREST') return c.category === 'forest';
        return c.category === territory.category;
      }) || null;
    }
  }

  // Real-time validation computation
  const isCodeEntered = Boolean(inputCode.trim());
  const isCardFound = Boolean(currentCard);
  const isCardUsed = currentCard ? (currentCard.isUsed && !currentCard.isReusable) : false;
  
  // Category compatibility check
  const isCategoryCompatible = currentCard 
    ? (currentCard.isFreeChoice || currentCard.category === 'free_choice' || currentCard.category === territory.category)
    : false;

  const hasEnoughGB = selectedPlayer ? selectedPlayer.budget >= catConfig.claimCost : false;
  const isReadyToClaim = hasRolled && isCardFound && !isCardUsed && isCategoryCompatible && hasEnoughGB && !diceState.isRolling && isDeviceAllowed && !successMessage;

  const handleSelectCard = (card: PolicyCard) => {
    if (card.isUsed && !card.isReusable) return;
    setInputCode(card.code);
    setErrorMessage(null);
  };

  const handleClaim = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (diceState.isRolling) {
      setErrorMessage('Animasi dadu sedang berlangsung. Tunggu hingga hasil lemparan selesai.');
      return;
    }

    if (!hasRolled || !rollerId) {
      setErrorMessage(`${activePlayer?.name || 'Pemain aktif'} harus melakukan Roll Dice terlebih dahulu sebelum mengklaim wilayah.`);
      return;
    }

    if (!isDeviceAllowed) {
      setErrorMessage(`Bukan giliran perangkat ini. Klaim wilayah hanya dapat dilakukan oleh ${rollerPlayer?.name || 'pelempar dadu'}.`);
      return;
    }

    if (!inputCode.trim()) {
      setErrorMessage('Silakan pilih atau masukkan kode kartu Policy fisik.');
      return;
    }

    const res = claimTerritory(effectivePlayerId, territory.id, inputCode, rollerId);
    if (res.success) {
      setSuccessMessage(res.message);
      setTimeout(() => {
        closeModal();
      }, 1400);
    } else {
      setErrorMessage(res.message);
    }
  };

  const handleRevoke = (refund: boolean) => {
    setErrorMessage(null);
    setSuccessMessage(null);
    const res = revokeTerritoryClaim(territory.id, refund);
    if (res.success) {
      setSuccessMessage(res.message);
      setTimeout(() => {
        closeModal();
      }, 1400);
    } else {
      setErrorMessage(res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#253451]/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white border border-[#EAE9E3] rounded-3xl max-w-2xl w-full p-5 sm:p-7 shadow-soft-lg relative max-h-[92vh] overflow-y-auto">
        <button
          onClick={closeModal}
          className="absolute top-4 right-4 text-[#253451]/60 hover:text-[#253451] p-1.5 rounded-xl hover:bg-[#F8F5EC] transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3.5 mb-5">
          <div className="w-14 h-14 rounded-2xl bg-[#F8F5EC] border border-[#EAE9E3] flex items-center justify-center p-1.5 shadow-xs shrink-0">
            <CategoryLogo category={territory.category} size="full" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#253451] text-white">
                Sektor: {territory.category}
              </span>
              <span className="text-xs font-mono font-extrabold text-[#EF956F] bg-[#F8F5EC] px-2 py-0.5 rounded-full border border-[#EAE9E3]">
                {territory.code}
              </span>
            </div>
            <h2 className="text-xl font-display font-black text-[#253451] uppercase tracking-wide mt-1">
              {territory.name}
            </h2>
          </div>
        </div>

        {/* Ownership Status Banner */}
        <div className={`p-3.5 rounded-2xl border mb-5 flex items-center justify-between ${
          owner 
            ? owner.color === 'red' ? 'bg-red-50 border-red-200 text-red-900' :
              owner.color === 'blue' ? 'bg-blue-50 border-blue-200 text-blue-900' :
              owner.color === 'green' ? 'bg-emerald-50 border-emerald-200 text-emerald-900' :
              'bg-amber-50 border-amber-200 text-amber-900'
            : 'bg-[#F8F5EC] border-[#EAE9E3] text-[#253451]'
        }`}>
          <div className="flex items-center gap-2.5">
            {owner ? (
              <div className="w-6 h-6 shrink-0">
                <PlayerLogo player={owner} size="full" />
              </div>
            ) : (
              <span className="w-3 h-3 rounded-full bg-slate-400" />
            )}
            <span className="text-xs font-extrabold uppercase tracking-wider">
              {owner ? `Dikuasai oleh ${owner.name}` : 'Wilayah Belum Dikuasai (Unclaimed)'}
            </span>
          </div>

          {owner && territory.claimedAtRound && (
            <span className="text-[11px] font-mono font-bold text-[#253451]/60">
              Round #{territory.claimedAtRound}
            </span>
          )}
        </div>

        {/* Key Territory Stats Cards */}
        <div className="grid grid-cols-3 gap-2.5 mb-5">
          <div className="bg-[#F8F5EC] border border-[#EAE9E3] rounded-2xl p-3 text-center">
            <div className="flex items-center justify-center gap-1 text-[#253451]/60 text-[10px] uppercase font-extrabold tracking-wider mb-1">
              <Award className="w-3.5 h-3.5 text-[#3B82F6]" />
              <span>Base VP</span>
            </div>
            <div className="text-xl font-bold font-mono text-[#253451]">
              +{catConfig.basePoints} <span className="text-xs font-normal text-[#253451]/60">VP</span>
            </div>
          </div>

          <div className="bg-[#F8F5EC] border border-[#EAE9E3] rounded-2xl p-3 text-center">
            <div className="flex items-center justify-center gap-1 text-[#253451]/60 text-[10px] uppercase font-extrabold tracking-wider mb-1">
              <Coins className="w-3.5 h-3.5 text-[#F4CE70]" />
              <span>Biaya Klaim</span>
            </div>
            <div className="text-xl font-bold font-mono text-[#253451]">
              {catConfig.claimCost} <span className="text-xs font-normal text-[#253451]/60">GB</span>
            </div>
          </div>

          <div className="bg-[#F8F5EC] border border-[#EAE9E3] rounded-2xl p-3 text-center">
            <div className="flex items-center justify-center gap-1 text-[#253451]/60 text-[10px] uppercase font-extrabold tracking-wider mb-1">
              <TrendingUp className="w-3.5 h-3.5 text-[#73B77A]" />
              <span>Income / Siklus</span>
            </div>
            <div className="text-xl font-bold font-mono text-[#73B77A]">
              +{catConfig.baseIncome} <span className="text-xs font-normal text-[#253451]/60">GB</span>
            </div>
          </div>
        </div>

        {/* Active Developments / Opportunity Bonuses */}
        {territory.activeBonuses && territory.activeBonuses.length > 0 && (
          <div className="mb-5 bg-[#F8F5EC] border border-[#EAE9E3] rounded-2xl p-3.5">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#253451] flex items-center gap-1.5 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-[#EF956F]" />
              <span>Upgrade Opportunity Aktif ({territory.activeBonuses.length})</span>
            </div>
            <div className="space-y-1.5">
              {territory.activeBonuses.map(b => (
                <div key={b.id} className="text-xs bg-white p-2.5 rounded-xl border border-[#EAE9E3] flex justify-between">
                  <span className="text-[#253451] font-medium">{b.sourceTitle} ({b.sourceCardCode})</span>
                  <span className="text-[#73B77A] font-mono font-bold">
                    {b.incomeBonus > 0 && `+${b.incomeBonus} GB `}
                    {b.pointBonus > 0 && `+${b.pointBonus} VP`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Claim Action Section if Unclaimed */}
        {!owner && settings.status === 'active' && (
          <form onSubmit={handleClaim} className="border-t border-[#EAE9E3] pt-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-xs font-extrabold uppercase tracking-wider text-[#253451]">
                Klaim Wilayah dengan Kartu Policy Kompatibel:
              </div>
              <span className="text-[11px] font-mono font-bold text-[#253451]/60">
                Sektor: <strong className="uppercase text-[#253451]">{territory.category}</strong>
              </span>
            </div>

            {/* Step 1: Select Player */}
            <div>
              <div className="flex items-center justify-between mb-1.5 gap-2 flex-wrap">
                <label className="text-[11px] font-extrabold text-[#253451]/70">
                  1. Pemilik Wilayah yang Akan Klaim (bisa pemain mana saja):
                </label>
                {selectedPlayer && (
                  <span className={`text-[11px] font-mono font-extrabold ${hasEnoughGB ? 'text-[#73B77A]' : 'text-red-500'}`}>
                    Saldo: {selectedPlayer.budget} GB {hasEnoughGB ? '(Cukup)' : `(Kurang ${catConfig.claimCost - selectedPlayer.budget} GB)`}
                  </span>
                )}
              </div>
              {rollerId ? (
                <div className="mb-2 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-[11px] font-bold text-amber-900">
                  🎲 Hak klaim dari <strong>{rollerPlayer?.name}</strong> (Dadu: {claimDiceValue ?? '-'}). Biaya klaim dibayar oleh pemain yang dipilih.
                </div>
              ) : (
                <div className="mb-2 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-[11px] font-bold text-amber-900">
                  🎲 Pemain aktif (<strong>{activePlayer?.name}</strong>) harus melakukan <strong>Roll Dice</strong> terlebih dahulu sebelum mengklaim wilayah.
                </div>
              )}
              {!isDeviceAllowed && (
                <div className="mb-2 px-3 py-1.5 rounded-xl bg-red-50 border border-red-200 text-[11px] font-bold text-red-700">
                  Perangkat ini sedang berperan sebagai pemain lain. Hanya {rollerPlayer?.name} atau Meja Bersama yang dapat mengeksekusi klaim.
                </div>
              )}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {players.map(p => {
                  const hasGb = p.budget >= catConfig.claimCost;
                  const isSelected = effectivePlayerId === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setSelectedPlayerId(p.id)}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col justify-between transition text-left ${
                        isSelected
                          ? 'bg-[#253451] text-white border-[#253451] shadow-xs'
                          : 'bg-[#F8F5EC] border-[#EAE9E3] text-[#253451] hover:bg-[#EAE9E3]'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 truncate mb-1">
                        <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                          p.color === 'red' ? 'bg-[#EF4444]' :
                          p.color === 'blue' ? 'bg-[#3B82F6]' :
                          p.color === 'green' ? 'bg-[#10B981]' : 'bg-[#F59E0B]'
                        }`} />
                        <span className="truncate">{p.name}</span>
                      </div>
                      <div className="flex items-center justify-between font-mono text-[10px]">
                        <span>{p.budget} GB</span>
                        <span className={hasGb ? (isSelected ? 'text-emerald-300' : 'text-emerald-600') : 'text-red-400'}>
                          {hasGb ? '✓ Siap' : '✕ Kurang'}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Compatible Policy Cards Gallery */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-extrabold text-[#253451]/70">
                  2. Pilih Kartu Policy Fisik yang Cocok ({categoryCards.length} Sektor + {freeChoiceCards.length} Bebas Pilih):
                </label>
                <span className="text-[10px] text-[#253451]/50 font-bold">Klik kartu untuk memilih</span>
              </div>

              {/* Scrollable Compatible Cards Carousel */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto p-1 bg-[#F8F5EC] rounded-2xl border border-[#EAE9E3]">
                {allCompatibleCards.map(c => {
                  const isSelected = inputCode.trim().toUpperCase() === c.code.toUpperCase();
                  const isUsed = c.isUsed && !c.isReusable;
                  return (
                    <div
                      key={c.id}
                      onClick={() => handleSelectCard(c)}
                      className={`p-2 rounded-xl border transition cursor-pointer flex flex-col items-center text-center relative ${
                        isUsed
                          ? 'opacity-40 bg-gray-100 border-gray-200 cursor-not-allowed'
                          : isSelected
                            ? 'bg-white border-[#253451] ring-2 ring-[#253451] shadow-xs'
                            : 'bg-white border-[#EAE9E3] hover:border-[#253451]/40'
                      }`}
                    >
                      <div className="w-14 h-20 overflow-hidden rounded-lg bg-gray-50 mb-1.5 flex items-center justify-center border border-[#EAE9E3]">
                        <img
                          src={getCardAsset(c.image, POLICY_CARD_BACK)}
                          alt={c.code}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = POLICY_CARD_BACK;
                          }}
                        />
                      </div>
                      <div className="font-mono text-xs font-black text-[#253451]">{c.code}</div>
                      <div className="text-[9px] font-bold uppercase text-[#253451]/60">
                        {c.isFreeChoice ? 'Bebas Pilih' : c.category}
                      </div>
                      <span className={`text-[8px] font-extrabold uppercase mt-0.5 px-1 rounded ${
                        isUsed ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {isUsed ? 'Terpakai' : 'Tersedia'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step 3: Card Code Input & Live Compatibility Validation */}
            <div>
              <label className="block text-[11px] font-extrabold text-[#253451]/70 mb-1">
                3. Kode Kartu Policy (Input Manual atau Hasil Klik):
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputCode}
                  onChange={e => {
                    setInputCode(e.target.value);
                    setErrorMessage(null);
                  }}
                  placeholder={`Contoh: ${territory.code} atau SBS-01`}
                  className="flex-1 bg-[#F8F5EC] border border-[#EAE9E3] focus:border-[#253451] rounded-xl px-3.5 py-2.5 text-xs font-mono uppercase text-[#253451] outline-none font-bold"
                />
                {inputCode && (
                  <button
                    type="button"
                    onClick={() => setInputCode('')}
                    className="px-3 rounded-xl bg-[#F8F5EC] hover:bg-[#EAE9E3] text-[#253451] text-xs font-bold border border-[#EAE9E3]"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>

            {/* Selected Card Artwork & Metadata Preview */}
            {currentCard && (
              <div className="flex items-center gap-3 p-3 bg-[#F8F5EC] rounded-2xl border border-[#EAE9E3] shadow-xs">
                <div className="w-16 h-24 bg-white rounded-xl overflow-hidden border border-[#EAE9E3] p-1 flex items-center justify-center shrink-0">
                  <img
                    src={getCardAsset(currentCard.image, POLICY_CARD_BACK)}
                    alt={currentCard.code}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = POLICY_CARD_BACK;
                    }}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-mono text-xs font-black px-2 py-0.5 rounded bg-[#253451] text-white">
                      {currentCard.code}
                    </span>
                    <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded border ${
                      isCategoryCompatible 
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                        : 'bg-red-100 text-red-800 border-red-200'
                    }`}>
                      {currentCard.isFreeChoice ? 'Bebas Pilih (Wildcard)' : currentCard.category.toUpperCase()}
                    </span>
                    <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                      isCardUsed ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {isCardUsed ? 'Terpakai' : 'Tersedia'}
                    </span>
                  </div>
                  <div className="text-xs font-bold text-[#253451] mt-1 truncate">{currentCard.name}</div>
                  <div className="text-[10px] text-[#253451]/60 font-medium mt-0.5">
                    Target Wilayah: <strong className="uppercase text-[#253451]">{territory.name} ({territory.category})</strong>
                  </div>
                </div>
              </div>
            )}

            {/* Real-time Validation Feedback Box */}
            {isCodeEntered && (
              <div className={`p-3 rounded-xl border text-xs font-medium space-y-1 ${
                isReadyToClaim
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-amber-50 border-amber-200 text-amber-900'
              }`}>
                <div className="font-extrabold uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                  {isReadyToClaim ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  )}
                  <span>Status Validasi Kompatibilitas:</span>
                </div>

                {!isCardFound && (
                  <div className="text-red-600">✕ Kode kartu "{inputCode.toUpperCase()}" tidak ditemukan dalam daftar kartu Policy.</div>
                )}

                {isCardFound && !isCategoryCompatible && (
                  <div className="text-red-600">
                    ✕ Tidak Kompatibel: Kartu adalah sektor <strong>{currentCard?.category.toUpperCase()}</strong>, sedangkan wilayah ini membutuhkan sektor <strong>{territory.category.toUpperCase()}</strong> atau kartu Bebas Pilih.
                  </div>
                )}

                {isCardFound && isCardUsed && (
                  <div className="text-red-600">
                    ✕ Kartu "{currentCard?.code}" sudah digunakan sebelumnya dan tidak dapat digunakan kembali.
                  </div>
                )}

                {isCardFound && isCategoryCompatible && !isCardUsed && (
                  <div className="text-emerald-700">
                    ✓ Kartu "{currentCard?.code}" ({currentCard?.isFreeChoice ? 'Bebas Pilih' : currentCard?.category.toUpperCase()}) <strong>KOMPATIBEL</strong> dengan wilayah {territory.name}.
                  </div>
                )}

                {!hasEnoughGB && (
                  <div className="text-red-600">
                    ✕ Saldo {selectedPlayer.name} ({selectedPlayer.budget} GB) tidak mencukupi untuk biaya klaim ({catConfig.claimCost} GB).
                  </div>
                )}

                {hasEnoughGB && (
                  <div className="text-emerald-700">
                    ✓ Saldo Government Budget ({selectedPlayer.budget} GB) mencukupi untuk biaya klaim ({catConfig.claimCost} GB).
                  </div>
                )}
              </div>
            )}

            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2 font-medium">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2 font-medium">
                <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{successMessage}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={!isReadyToClaim}
              className={`w-full py-3.5 rounded-2xl font-extrabold text-xs uppercase tracking-wider shadow-soft-sm transition flex items-center justify-center gap-2 ${
                isReadyToClaim
                  ? 'bg-[#253451] hover:bg-[#1C273D] text-white cursor-pointer game-press'
                  : 'bg-gray-200 text-gray-400 border border-gray-300 cursor-not-allowed'
              }`}
            >
              <Flag className="w-4 h-4 text-[#F4CE70]" />
              <span>
                {isReadyToClaim 
                  ? `Konfirmasi & Bayar ${catConfig.claimCost} GB (${selectedPlayer.name})`
                  : `Lengkapi Validasi untuk Klaim (${catConfig.claimCost} GB)`
                }
              </span>
            </button>
          </form>
        )}

        {/* Owned Territory Admin Actions */}
        {owner && (
          <div className="border-t border-[#EAE9E3] pt-4 space-y-3">
            <div className="text-xs font-extrabold uppercase tracking-wider text-[#253451]/70">
              Aksi Game Master / Host:
            </div>

            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{successMessage}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleRevoke(true)}
                className="py-2.5 px-3 rounded-xl bg-[#F8F5EC] hover:bg-[#EAE9E3] text-[#253451] border border-[#EAE9E3] text-xs font-bold transition"
              >
                Cabut Klaim (+{catConfig.claimCost} GB Refund)
              </button>
              <button
                type="button"
                onClick={() => handleRevoke(false)}
                className="py-2.5 px-3 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold transition"
              >
                Cabut Klaim (Tanpa Refund)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
