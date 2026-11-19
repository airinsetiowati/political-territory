import React, { useState } from 'react';
import { 
  Flag, 
  Search, 
  RotateCw, 
  QrCode,
  Layers,
  CheckCircle2
} from 'lucide-react';
import { useGame } from '../context/GameContext';
import { PolicyCard, TerritoryCategory } from '../types/game';

export const PolicyCardsPage: React.FC = () => {
  const { 
    policyCards, 
    territories, 
    players, 
    settings, 
    openModal 
  } = useGame();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [filterUsed, setFilterUsed] = useState<'all' | 'available' | 'used'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [flippedCardIds, setFlippedCardIds] = useState<Record<string, boolean>>({});

  const toggleFlip = (cardId: string) => {
    setFlippedCardIds(prev => ({ ...prev, [cardId]: !prev[cardId] }));
  };

  const categories: { id: string; label: string }[] = [
    { id: 'all', label: 'Semua Policy (50)' },
    { id: 'free_choice', label: 'Bebas Pilih (10)' },
    { id: 'politics', label: 'Politics (4)' },
    { id: 'industry', label: 'Industry (6)' },
    { id: 'education', label: 'Education (6)' },
    { id: 'healthcare', label: 'Healthcare (6)' },
    { id: 'agriculture', label: 'Agriculture (6)' },
    { id: 'water', label: 'Water (4)' },
    { id: 'tourism', label: 'Tourism (4)' },
    { id: 'forest', label: 'Forest (4)' },
  ];

  const filteredCards = policyCards.filter(c => {
    if (selectedCategory !== 'all' && c.category !== selectedCategory) return false;
    if (filterUsed === 'available' && c.isUsed) return false;
    if (filterUsed === 'used' && !c.isUsed) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchCode = c.code.toLowerCase().includes(q);
      const matchName = c.name.toLowerCase().includes(q);
      const matchCat = c.category.toLowerCase().includes(q);
      if (!matchCode && !matchName && !matchCat) return false;
    }
    return true;
  });

  const usedCount = policyCards.filter(c => c.isUsed).length;
  const availableCount = policyCards.filter(c => !c.isUsed).length;

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6 md:space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-[#EAE9E3] shadow-soft-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F8F5EC] text-xs font-extrabold text-[#253451] mb-2 border border-[#EAE9E3]">
            <span>🃏 Policy Cards System</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-display font-black text-[#253451] tracking-tight">
            Deck Kartu Policy
          </h1>
          <p className="text-xs md:text-sm text-[#253451]/70 mt-1">
            Kartu fisik Policy digunakan untuk mengklaim wilayah sovereign. Klik ikon balik untuk melihat artwork depan dan belakang.
          </p>
        </div>

        {/* Deck Status Counters */}
        <div className="flex items-center gap-2.5">
          <div className="bg-[#73B77A]/15 border border-[#73B77A]/30 rounded-2xl px-4 py-2.5 text-center shadow-xs">
            <span className="text-[#253451]/60 block text-[10px] font-extrabold uppercase">Tersedia</span>
            <span className="text-[#253451] font-mono font-black text-base">{availableCount} / 50</span>
          </div>
          <div className="bg-[#EF956F]/15 border border-[#EF956F]/30 rounded-2xl px-4 py-2.5 text-center shadow-xs">
            <span className="text-[#253451]/60 block text-[10px] font-extrabold uppercase">Sudah Dipakai</span>
            <span className="text-[#253451] font-mono font-black text-base">{usedCount} / 50</span>
          </div>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-white border border-[#EAE9E3] rounded-3xl p-4 md:p-5 shadow-soft-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 flex-wrap flex-1">
          {/* Search */}
          <div className="relative min-w-[200px] flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Cari kode (mis. POL-01, SBS-05)..."
              className="w-full bg-[#F8F5EC] border border-[#EAE9E3] focus:border-[#253451] rounded-2xl px-3.5 py-2.5 pl-9 text-xs text-[#253451] placeholder-[#253451]/40 outline-none font-bold"
            />
            <Search className="w-4 h-4 text-[#253451]/40 absolute left-3 top-3" />
          </div>

          {/* Sector Category */}
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="bg-[#F8F5EC] border border-[#EAE9E3] rounded-2xl px-3.5 py-2.5 text-xs text-[#253451] outline-none focus:border-[#253451] font-bold"
          >
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.label}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={filterUsed}
            onChange={e => setFilterUsed(e.target.value as any)}
            className="bg-[#F8F5EC] border border-[#EAE9E3] rounded-2xl px-3.5 py-2.5 text-xs text-[#253451] outline-none focus:border-[#253451] font-bold"
          >
            <option value="all">Semua Status ({policyCards.length})</option>
            <option value="available">Tersedia di Deck ({availableCount})</option>
            <option value="used">Sudah Diklaim ({usedCount})</option>
          </select>
        </div>

        <button
          onClick={() => openModal('QUICK_CARD_ENTRY')}
          className="px-4 py-2.5 rounded-2xl bg-[#253451] hover:bg-[#1C273D] text-white font-extrabold text-xs uppercase tracking-wider transition shadow-soft-sm flex items-center gap-1.5 shrink-0 game-press"
        >
          <QrCode className="w-4 h-4 text-[#F4CE70]" />
          <span>Input Kode Kartu</span>
        </button>
      </div>

      {/* Policy Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredCards.map(c => {
          const isFlipped = flippedCardIds[c.id];
          const matchedTerritory = c.targetTerritoryId ? territories.find(t => t.id === c.targetTerritoryId) : null;
          const userPlayer = c.usedByPlayerId ? players.find(p => p.id === c.usedByPlayerId) : null;

          return (
            <div
              key={c.id}
              className="bg-white border-2 border-[#EAE9E3] hover:border-[#253451]/30 rounded-3xl overflow-hidden shadow-soft-sm card-hover transition flex flex-col justify-between group"
            >
              {/* Card Image Stage with Flip Button */}
              <div className="relative h-72 bg-[#F8F5EC] p-3 flex items-center justify-center border-b border-[#EAE9E3]">
                <img
                  src={isFlipped ? (settings.policyBackImage || '/game-assets/policy-back') : c.image}
                  alt={c.name}
                  className="w-full h-full object-contain rounded-xl transition-all duration-300 drop-shadow-md"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/game-assets/policy-back';
                  }}
                />

                {/* Flip Card Action Button */}
                <button
                  type="button"
                  onClick={() => toggleFlip(c.id)}
                  className="absolute bottom-4 right-4 px-2.5 py-1 rounded-xl bg-white/95 hover:bg-[#253451] hover:text-white text-[#253451] border border-[#EAE9E3] text-[10px] font-extrabold flex items-center gap-1 transition shadow-xs"
                  title="Balik Tampilan Kartu"
                >
                  <RotateCw className="w-3 h-3" />
                  <span>{isFlipped ? 'Lihat Depan' : 'Lihat Belakang'}</span>
                </button>

                {/* Used Watermark Overlay */}
                {c.isUsed && (
                  <div className="absolute top-4 right-4 px-2.5 py-1 rounded-full bg-[#EF4444] text-white font-black text-[10px] tracking-wider uppercase shadow-md">
                    SUDAH DIKLAIM
                  </div>
                )}
              </div>

              {/* Card Details & Actions */}
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                    c.isFreeChoice 
                      ? 'bg-[#F4CE70]/20 text-[#253451] border-[#F4CE70]/50' 
                      : 'bg-[#8BBDE2]/20 text-[#253451] border-[#8BBDE2]/50'
                  }`}>
                    {c.isFreeChoice ? '⭐ BEBAS PILIH' : c.category.toUpperCase()}
                  </span>

                  <span className="font-mono text-xs font-black text-[#EF956F] bg-[#F8F5EC] px-2 py-0.5 rounded-md border border-[#EAE9E3]">
                    {c.code}
                  </span>
                </div>

                <div>
                  <h3 className="font-display font-extrabold text-sm text-[#253451] truncate">
                    {c.name}
                  </h3>
                  <div className="text-xs text-[#253451]/70 mt-0.5 font-medium">
                    {matchedTerritory ? (
                      <span>Wilayah: <strong className="text-[#253451]">{matchedTerritory.name}</strong></span>
                    ) : (
                      <span className="text-[#EF956F] font-bold">Bebas klaim wilayah mana saja</span>
                    )}
                  </div>
                </div>

                {/* Usage Record / Claim Cost */}
                <div className="pt-2 border-t border-[#EAE9E3] text-xs flex items-center justify-between font-mono">
                  {c.isUsed && userPlayer ? (
                    <div className="flex items-center gap-1.5 text-[#253451] font-bold">
                      <span className={`w-2.5 h-2.5 rounded-full ${
                        userPlayer.color === 'red' ? 'bg-[#EF4444]' :
                        userPlayer.color === 'blue' ? 'bg-[#3B82F6]' :
                        userPlayer.color === 'green' ? 'bg-[#10B981]' : 'bg-[#F59E0B]'
                      }`} />
                      <span className="text-[11px] truncate max-w-[120px]">Oleh {userPlayer.name}</span>
                    </div>
                  ) : (
                    <span className="text-[#73B77A] font-extrabold text-[11px]">
                      Tersedia di Deck
                    </span>
                  )}

                  <span className="text-[#253451] font-extrabold">
                    {matchedTerritory ? `${matchedTerritory.claimCost} GB` : 'Biaya: Sesuai Sektor'}
                  </span>
                </div>

                {/* Action button: Quick Claim */}
                {!c.isUsed && (
                  <button
                    onClick={() => {
                      openModal('QUICK_CARD_ENTRY');
                    }}
                    className="w-full py-2.5 rounded-xl bg-[#F8F5EC] hover:bg-[#253451] hover:text-white text-[#253451] font-extrabold text-xs uppercase tracking-wider transition border border-[#EAE9E3] flex items-center justify-center gap-1.5 shadow-xs game-press"
                  >
                    <Flag className="w-3.5 h-3.5 text-[#F4CE70]" />
                    <span>Klaim dengan Kartu Ini</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
