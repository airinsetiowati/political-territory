import React, { useState } from 'react';
import { 
  Flag, 
  Search, 
  CheckCircle, 
  AlertTriangle, 
  Coins, 
  Award, 
  TrendingUp, 
  MapPin, 
  QrCode 
} from 'lucide-react';
import { useGame } from '../context/GameContext';
import { Territory } from '../types/game';
import { CategoryLogo } from '../components/CategoryLogo';

export const ClaimTerritoryPage: React.FC = () => {
  const { 
    players, 
    territories, 
    claimTerritory, 
    economyConfig 
  } = useGame();

  const [selectedPlayerId, setSelectedPlayerId] = useState(players[0]?.id || '');
  const [selectedTerritoryId, setSelectedTerritoryId] = useState('');
  const [cardCode, setCardCode] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  const selectedPlayer = players.find(p => p.id === selectedPlayerId);
  const selectedTerritory = territories.find(t => t.id === selectedTerritoryId);
  const unclaimedTerritories = territories.filter(t => t.ownerId === null);

  const handleSelectTerritory = (t: Territory) => {
    setSelectedTerritoryId(t.id);
    setCardCode(t.code);
    setStatusMessage(null);
  };

  const handleClaimSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    if (!selectedPlayerId) {
      setStatusMessage({ type: 'error', text: 'Pilih pemain yang akan mengklaim wilayah.' });
      return;
    }
    if (!selectedTerritoryId) {
      setStatusMessage({ type: 'error', text: 'Pilih wilayah yang belum dikuasai.' });
      return;
    }
    if (!cardCode.trim()) {
      setStatusMessage({ type: 'error', text: 'Masukkan kode kartu fisik.' });
      return;
    }

    const res = claimTerritory(selectedPlayerId, selectedTerritoryId, cardCode);
    if (res.success) {
      setStatusMessage({ type: 'success', text: res.message });
      setSelectedTerritoryId('');
      setCardCode('');
    } else {
      setStatusMessage({ type: 'error', text: res.message });
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6 md:space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-[#EAE9E3] shadow-soft-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F8F5EC] text-xs font-extrabold text-[#253451] mb-2 border border-[#EAE9E3]">
            <span>🚩 Sovereign Expansion</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-display font-black text-[#253451] tracking-tight">
            Klaim Wilayah Sovereign
          </h1>
          <p className="text-xs md:text-sm text-[#253451]/70 mt-1">
            Gunakan kartu Policy atau Bebas Pilih fisik untuk menduduki wilayah baru dan memperoleh hak ekonomi.
          </p>
        </div>

        <div className="bg-[#F8F5EC] border border-[#EAE9E3] rounded-2xl px-4 py-2.5 text-center font-mono text-xs">
          <span className="text-[#253451]/60 block text-[10px] font-extrabold uppercase">Wilayah Tersisa</span>
          <span className="text-[#253451] font-black text-base">{unclaimedTerritories.length} / 40</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Form: Claim Configuration */}
        <div className="bg-white border border-[#EAE9E3] rounded-3xl p-6 shadow-soft-sm space-y-5 lg:col-span-1">
          <h2 className="font-display font-black text-base text-[#253451] flex items-center gap-2">
            <Flag className="w-4 h-4 text-[#EF956F]" />
            <span>Formulir Klaim Wilayah</span>
          </h2>

          <form onSubmit={handleClaimSubmit} className="space-y-4">
            {/* Step 1: Select Player */}
            <div>
              <label className="block text-xs font-extrabold text-[#253451]/70 mb-1.5">
                1. Pilih Pemain:
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

            {/* Step 2: Selected Territory info */}
            <div>
              <label className="block text-xs font-extrabold text-[#253451]/70 mb-1.5">
                2. Wilayah Target:
              </label>
              {selectedTerritory ? (
                <div className="p-3.5 bg-[#F8F5EC] rounded-2xl border border-[#EAE9E3] flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2.5">
                    <CategoryLogo category={selectedTerritory.category} size="sm" />
                    <div>
                      <div className="font-black text-[#253451]">{selectedTerritory.name}</div>
                      <div className="text-[11px] text-[#253451]/60 capitalize">
                        {selectedTerritory.category} ({selectedTerritory.code})
                      </div>
                    </div>
                  </div>
                  <div className="text-right font-mono font-bold">
                    <div className="text-[#253451]">Biaya: {selectedTerritory.claimCost} GB</div>
                    <div className="text-[#73B77A]">+{selectedTerritory.baseIncome} GB/cy</div>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-[#F8F5EC] rounded-2xl border border-dashed border-[#EAE9E3] text-center text-xs text-[#253451]/50 italic">
                  Klik salah satu wilayah di daftar sebelah kanan.
                </div>
              )}
            </div>

            {/* Step 3: Card Code Input */}
            <div>
              <label className="block text-xs font-extrabold text-[#253451]/70 mb-1.5">
                3. Kode Kartu Policy (Fisik):
              </label>
              <input
                type="text"
                value={cardCode}
                onChange={e => setCardCode(e.target.value)}
                placeholder="Contoh: POL-01 atau Bebas Pilih SBS-01"
                className="w-full bg-[#F8F5EC] border border-[#EAE9E3] focus:border-[#253451] rounded-2xl px-4 py-2.5 text-xs font-mono uppercase text-[#253451] outline-none font-bold"
              />
            </div>

            {/* Alert Message */}
            {statusMessage && (
              <div className={`p-3 rounded-2xl text-xs font-bold flex items-center gap-2 border ${
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

            <button
              type="submit"
              disabled={!selectedTerritoryId}
              className="w-full py-3.5 rounded-2xl bg-[#253451] hover:bg-[#1C273D] text-white font-extrabold text-xs uppercase tracking-wider shadow-soft-sm transition flex items-center justify-center gap-2 disabled:opacity-40 game-press"
            >
              <Flag className="w-4 h-4 text-[#F4CE70]" />
              <span>Eksekusi Klaim Wilayah</span>
            </button>
          </form>
        </div>

        {/* Right: Unclaimed Territories Grid */}
        <div className="bg-white border border-[#EAE9E3] rounded-3xl p-6 shadow-soft-sm space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-black text-base text-[#253451] flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#3B82F6]" />
              <span>Daftar Wilayah Belum Dikuasai ({unclaimedTerritories.length})</span>
            </h2>
            <span className="text-xs text-[#253451]/50 font-medium">Klik untuk memilih</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-[600px] overflow-y-auto pr-1">
            {unclaimedTerritories.map(t => {
              const isSelected = selectedTerritoryId === t.id;
              return (
                <div
                  key={t.id}
                  onClick={() => handleSelectTerritory(t)}
                  className={`p-3.5 rounded-2xl border-2 transition cursor-pointer flex flex-col justify-between space-y-2 card-hover ${
                    isSelected
                      ? 'bg-amber-50/60 border-[#F4CE70] shadow-soft-sm'
                      : 'bg-[#F8F5EC] border-[#EAE9E3] hover:border-[#253451]/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <CategoryLogo category={t.category} size="xs" />
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-white text-[#253451] border border-[#EAE9E3]">
                        {t.category}
                      </span>
                    </div>
                    <span className="font-mono text-xs font-bold text-[#EF956F]">{t.code}</span>
                  </div>

                  <div>
                    <h3 className="font-bold text-xs text-[#253451]">{t.name}</h3>
                  </div>

                  <div className="pt-2 border-t border-[#EAE9E3] flex justify-between items-center text-[11px] font-mono font-bold">
                    <span className="text-[#253451]">{t.claimCost} GB</span>
                    <span className="text-[#73B77A]">+{t.baseIncome} GB/cy</span>
                    <span className="text-[#3B82F6]">+{t.basePoints} VP</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
