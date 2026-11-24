import React, { useState } from 'react';
import { 
  Building2, 
  MapPin, 
  Search, 
  Coins, 
  Award, 
  TrendingUp, 
  Edit3, 
  Check, 
  X, 
  Sparkles
} from 'lucide-react';
import { useGame } from '../context/GameContext';
import { Territory, TerritoryCategory } from '../types/game';
import { CategoryLogo } from '../components/CategoryLogo';
import { PlayerLogo } from '../components/PlayerLogo';

export const TerritoryManagementPage: React.FC = () => {
  const { 
    territories, 
    players, 
    updateTerritory, 
    assignTerritoryOwner,
    openModal 
  } = useGame();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedOwner, setSelectedOwner] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingTerritoryId, setEditingTerritoryId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Territory>>({});
  const [bonusFormTerritoryId, setBonusFormTerritoryId] = useState<string | null>(null);
  const [bonusIncome, setBonusIncome] = useState('1');
  const [bonusPoints, setBonusPoints] = useState('0');
  const [bonusDesc, setBonusDesc] = useState('');

  // Categories list
  const categories: { id: string; label: string }[] = [
    { id: 'all', label: 'Semua Sektor (40)' },
    { id: 'politics', label: 'Politics (4)' },
    { id: 'industry', label: 'Industry (6)' },
    { id: 'education', label: 'Education (6)' },
    { id: 'healthcare', label: 'Healthcare (6)' },
    { id: 'agriculture', label: 'Agriculture (6)' },
    { id: 'water', label: 'Water (4)' },
    { id: 'tourism', label: 'Tourism (4)' },
    { id: 'forest', label: 'Forest (4)' },
  ];

  const filteredTerritories = territories.filter(t => {
    if (selectedCategory !== 'all' && t.category !== selectedCategory) return false;
    if (selectedOwner === 'unclaimed' && t.ownerId !== null) return false;
    if (selectedOwner === 'claimed' && t.ownerId === null) return false;
    if (selectedOwner !== 'all' && selectedOwner !== 'unclaimed' && selectedOwner !== 'claimed' && t.ownerId !== selectedOwner) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = t.name.toLowerCase().includes(q);
      const matchCode = t.code.toLowerCase().includes(q);
      const matchCat = t.category.toLowerCase().includes(q);
      if (!matchName && !matchCode && !matchCat) return false;
    }
    return true;
  });

  const startEdit = (t: Territory) => {
    setEditingTerritoryId(t.id);
    setEditForm({
      name: t.name,
      code: t.code,
      claimCost: t.claimCost,
      basePoints: t.basePoints,
      baseIncome: t.baseIncome,
    });
  };

  const saveEdit = (territoryId: string) => {
    updateTerritory(territoryId, editForm);
    setEditingTerritoryId(null);
  };

  const cancelEdit = () => {
    setEditingTerritoryId(null);
    setEditForm({});
  };

  const handleAddBonus = (territoryId: string) => {
    const t = territories.find(item => item.id === territoryId);
    if (!t) return;
    const newBonus = {
      id: `bonus-${Date.now()}`,
      sourceCardCode: 'MANUAL',
      sourceTitle: bonusDesc.trim() || 'Sector Upgrade',
      incomeBonus: parseInt(bonusIncome) || 0,
      pointBonus: parseInt(bonusPoints) || 0,
      description: bonusDesc.trim() || 'Manual development grant',
    };
    updateTerritory(territoryId, {
      activeBonuses: [...(t.activeBonuses || []), newBonus]
    });
    setBonusFormTerritoryId(null);
    setBonusDesc('');
    setBonusIncome('1');
    setBonusPoints('0');
  };

  const handleRemoveBonus = (territoryId: string, bonusId: string) => {
    const t = territories.find(item => item.id === territoryId);
    if (!t) return;
    updateTerritory(territoryId, {
      activeBonuses: (t.activeBonuses || []).filter(b => b.id !== bonusId)
    });
  };

  const totalClaimed = territories.filter(t => t.ownerId !== null).length;
  const totalUnclaimed = territories.filter(t => t.ownerId === null).length;

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6 md:space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-[#EAE9E3] shadow-soft-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F8F5EC] text-xs font-extrabold text-[#253451] mb-2 border border-[#EAE9E3]">
            <span>🏛️ Territory Administration</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-display font-black text-[#253451] tracking-tight">
            Manajemen Wilayah Meja Permainan
          </h1>
          <p className="text-xs md:text-sm text-[#253451]/70 mt-1">
            Pantau, transfer kepemilikan, dan berikan upgrade bonus untuk seluruh 40 wilayah di 8 sektor permainan.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="flex items-center gap-2.5">
          <div className="bg-[#73B77A]/15 border border-[#73B77A]/30 rounded-2xl px-4 py-2 text-center shadow-xs">
            <span className="text-[#253451]/60 block text-[10px] font-extrabold uppercase">Dikuasai</span>
            <span className="text-[#253451] font-mono font-black text-base">{totalClaimed} / 40</span>
          </div>
          <div className="bg-[#F8F5EC] border border-[#EAE9E3] rounded-2xl px-4 py-2 text-center shadow-xs">
            <span className="text-[#253451]/60 block text-[10px] font-extrabold uppercase">Belum Dikuasai</span>
            <span className="text-[#253451] font-mono font-black text-base">{totalUnclaimed} / 40</span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white border border-[#EAE9E3] rounded-3xl p-4 shadow-soft-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 flex-wrap flex-1">
          {/* Search */}
          <div className="relative min-w-[200px] flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Cari nama wilayah atau kode..."
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

          {/* Owner Filter */}
          <select
            value={selectedOwner}
            onChange={e => setSelectedOwner(e.target.value)}
            className="bg-[#F8F5EC] border border-[#EAE9E3] rounded-2xl px-3.5 py-2.5 text-xs text-[#253451] outline-none focus:border-[#253451] font-bold"
          >
            <option value="all">Semua Kepemilikan ({territories.length})</option>
            <option value="unclaimed">Belum Dikuasai ({totalUnclaimed})</option>
            <option value="claimed">Sudah Dikuasai ({totalClaimed})</option>
            {players.map(p => (
              <option key={p.id} value={p.id}>{p.name} ({p.color.toUpperCase()})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Territories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTerritories.map(t => {
          const isEditing = editingTerritoryId === t.id;
          const owner = t.ownerId ? players.find(p => p.id === t.ownerId) : null;
          const isBonusFormOpen = bonusFormTerritoryId === t.id;

          return (
            <div
              key={t.id}
              className="bg-white border-2 border-[#EAE9E3] hover:border-[#253451]/20 rounded-3xl p-5 shadow-soft-sm flex flex-col justify-between space-y-4 transition card-hover"
            >
              {/* Card Top: Category, Code, Edit Button */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <CategoryLogo category={t.category} size="xs" />
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#F8F5EC] text-[#253451] border border-[#EAE9E3]">
                      {t.category}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-black text-[#EF956F] bg-[#F8F5EC] px-2 py-0.5 rounded-md border border-[#EAE9E3]">
                      {t.code}
                    </span>
                    <button
                      onClick={() => isEditing ? saveEdit(t.id) : startEdit(t)}
                      className="p-1 rounded-lg text-[#253451]/60 hover:text-[#253451] hover:bg-[#F8F5EC] transition"
                      title={isEditing ? 'Simpan' : 'Edit Base Stats'}
                    >
                      {isEditing ? <Check className="w-4 h-4 text-emerald-600" /> : <Edit3 className="w-3.5 h-3.5" />}
                    </button>
                    {isEditing && (
                      <button
                        onClick={cancelEdit}
                        className="p-1 rounded-lg text-[#253451]/60 hover:text-red-500 hover:bg-[#F8F5EC] transition"
                        title="Batal"
                      >
                        <X className="w-4 h-4 text-red-500" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Territory Name */}
                {isEditing ? (
                  <input
                    type="text"
                    value={editForm.name || ''}
                    onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full bg-[#F8F5EC] border border-[#EAE9E3] rounded-xl px-2.5 py-1 text-sm font-bold text-[#253451] outline-none focus:border-[#253451] mb-2"
                  />
                ) : (
                  <h3 className="font-display font-black text-base text-[#253451] truncate mb-1">
                    {t.name}
                  </h3>
                )}

                {/* Ownership Banner */}
                <div className={`p-2.5 rounded-2xl border text-xs flex items-center justify-between my-2 ${
                  owner
                    ? owner.color === 'red' ? 'bg-red-50 border-red-200 text-red-900' :
                      owner.color === 'blue' ? 'bg-blue-50 border-blue-200 text-blue-900' :
                      owner.color === 'green' ? 'bg-emerald-50 border-emerald-200 text-emerald-900' :
                      'bg-amber-50 border-amber-200 text-amber-900'
                    : 'bg-[#F8F5EC] border-[#EAE9E3] text-[#253451]/60'
                }`}>
                  <div className="flex items-center gap-2">
                    {owner ? (
                      <div className="w-4 h-4 shrink-0">
                        <PlayerLogo player={owner} size="full" showBadge={false} />
                      </div>
                    ) : (
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                    )}
                    <span className="font-extrabold text-[11px]">
                      {owner ? `Pemilik: ${owner.name}` : 'Belum Dikuasai'}
                    </span>
                  </div>

                  {owner && t.claimedAtRound && (
                    <span className="text-[10px] font-mono text-[#253451]/60 font-bold">
                      Round #{t.claimedAtRound}
                    </span>
                  )}
                </div>

                {/* Stats Matrix */}
                <div className="grid grid-cols-3 gap-2 bg-[#F8F5EC] p-2.5 rounded-2xl border border-[#EAE9E3] text-center font-mono text-xs my-2">
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-[#253451]/60 block font-bold">Biaya</span>
                    {isEditing ? (
                      <input
                        type="number"
                        value={editForm.claimCost ?? t.claimCost}
                        onChange={e => setEditForm({ ...editForm, claimCost: parseInt(e.target.value) || 0 })}
                        className="w-12 bg-white border border-[#EAE9E3] rounded text-center text-[#253451] font-bold"
                      />
                    ) : (
                      <span className="font-bold text-[#253451]">{t.claimCost} GB</span>
                    )}
                  </div>

                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-[#253451]/60 block font-bold">Poin VP</span>
                    {isEditing ? (
                      <input
                        type="number"
                        value={editForm.basePoints ?? t.basePoints}
                        onChange={e => setEditForm({ ...editForm, basePoints: parseInt(e.target.value) || 0 })}
                        className="w-12 bg-white border border-[#EAE9E3] rounded text-center text-[#3B82F6] font-bold"
                      />
                    ) : (
                      <span className="font-bold text-[#3B82F6]">+{t.basePoints} VP</span>
                    )}
                  </div>

                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-[#253451]/60 block font-bold">Income</span>
                    {isEditing ? (
                      <input
                        type="number"
                        value={editForm.baseIncome ?? t.baseIncome}
                        onChange={e => setEditForm({ ...editForm, baseIncome: parseInt(e.target.value) || 0 })}
                        className="w-12 bg-white border border-[#EAE9E3] rounded text-center text-[#73B77A] font-bold"
                      />
                    ) : (
                      <span className="font-bold text-[#73B77A]">+{t.baseIncome} GB</span>
                    )}
                  </div>
                </div>

                {/* Active Bonuses List */}
                {t.activeBonuses && t.activeBonuses.length > 0 && (
                  <div className="space-y-1 my-2">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-[#253451] flex items-center justify-between">
                      <span>Bonus Upgrade:</span>
                      <span>({t.activeBonuses.length})</span>
                    </div>
                    {t.activeBonuses.map(b => (
                      <div key={b.id} className="bg-[#F8F5EC] px-2.5 py-1 rounded-xl border border-[#EAE9E3] text-[11px] flex items-center justify-between text-[#253451]">
                        <span className="truncate max-w-[130px] font-medium">{b.sourceTitle}</span>
                        <div className="flex items-center gap-1.5 font-mono">
                          <span className="text-[#73B77A] font-bold">
                            {b.incomeBonus > 0 && `+${b.incomeBonus}GB `}
                            {b.pointBonus > 0 && `+${b.pointBonus}VP`}
                          </span>
                          <button
                            onClick={() => handleRemoveBonus(t.id, b.id)}
                            className="text-[#253451]/40 hover:text-red-500"
                            title="Hapus Bonus"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Bonus Inline Form */}
                {isBonusFormOpen && (
                  <div className="bg-[#F8F5EC] p-3 rounded-2xl border border-[#EAE9E3] my-2 space-y-2 text-xs">
                    <div className="text-[10px] font-bold uppercase text-[#253451]">
                      Tambah Bonus Upgrade Wilayah:
                    </div>
                    <input
                      type="text"
                      placeholder="Alasan / Judul Upgrade"
                      value={bonusDesc}
                      onChange={e => setBonusDesc(e.target.value)}
                      className="w-full bg-white border border-[#EAE9E3] rounded-xl px-2.5 py-1 text-[#253451] text-xs font-bold"
                    />
                    <div className="grid grid-cols-2 gap-2 font-mono">
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-[#253451]/60 font-bold">+GB:</span>
                        <input
                          type="number"
                          value={bonusIncome}
                          onChange={e => setBonusIncome(e.target.value)}
                          className="w-12 bg-white border border-[#EAE9E3] rounded text-center text-[#73B77A] font-bold"
                        />
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-[#253451]/60 font-bold">+VP:</span>
                        <input
                          type="number"
                          value={bonusPoints}
                          onChange={e => setBonusPoints(e.target.value)}
                          className="w-12 bg-white border border-[#EAE9E3] rounded text-center text-[#3B82F6] font-bold"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-1.5 pt-1">
                      <button
                        onClick={() => setBonusFormTerritoryId(null)}
                        className="px-2.5 py-1 rounded-lg bg-white border border-[#EAE9E3] text-[#253451] text-[10px] font-bold"
                      >
                        Batal
                      </button>
                      <button
                        onClick={() => handleAddBonus(t.id)}
                        className="px-3 py-1 rounded-lg bg-[#253451] text-white font-bold text-[10px]"
                      >
                        Tambahkan
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Actions: Owner Assignment Selector & Buttons */}
              <div className="pt-3 border-t border-[#EAE9E3] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#253451]/70 text-[11px] font-bold">Tetapkan Pemilik:</span>
                  <select
                    value={t.ownerId || 'unclaimed'}
                    onChange={e => {
                      const val = e.target.value;
                      assignTerritoryOwner(t.id, val === 'unclaimed' ? null : val);
                    }}
                    className="bg-[#F8F5EC] border border-[#EAE9E3] rounded-xl px-2.5 py-1 text-xs text-[#253451] outline-none focus:border-[#253451] font-bold"
                  >
                    <option value="unclaimed">Belum Dikuasai</option>
                    {players.map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({p.color.toUpperCase()})</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => setBonusFormTerritoryId(isBonusFormOpen ? null : t.id)}
                    className="flex-1 py-2 rounded-xl bg-[#F8F5EC] hover:bg-[#EAE9E3] border border-[#EAE9E3] text-[#253451] text-[11px] font-extrabold flex items-center justify-center gap-1 transition shadow-xs"
                  >
                    <Sparkles className="w-3 h-3 text-[#EF956F]" />
                    <span>Beri Bonus</span>
                  </button>

                  <button
                    onClick={() => openModal('TERRITORY_DETAIL', { territoryId: t.id })}
                    className="flex-1 py-2 rounded-xl bg-[#253451] hover:bg-[#1C273D] text-white text-[11px] font-extrabold flex items-center justify-center gap-1 transition shadow-soft-sm"
                  >
                    <MapPin className="w-3 h-3 text-[#F4CE70]" />
                    <span>Detail Modal</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
