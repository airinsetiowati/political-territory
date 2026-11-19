import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Target, 
  TrendingUp, 
  AlertTriangle,
  ArrowRight,
  QrCode
} from 'lucide-react';
import { useGame } from '../context/GameContext';

export const EventCardsPage: React.FC = () => {
  const { 
    crisisCards, 
    missionCards, 
    opportunityCards, 
    openModal,
    verifyCardCode 
  } = useGame();

  const [activeTab, setActiveTab] = useState<'crisis' | 'mission' | 'opportunity'>('crisis');
  const [filterUsed, setFilterUsed] = useState<'all' | 'available' | 'used'>('all');
  const [quickInput, setQuickInput] = useState('');
  const [scanMessage, setScanMessage] = useState<string | null>(null);

  const handleQuickScan = (e: React.FormEvent) => {
    e.preventDefault();
    setScanMessage(null);
    if (!quickInput.trim()) return;

    const res = verifyCardCode(quickInput);
    if (res.type === 'not_found') {
      setScanMessage(`Kode "${quickInput.toUpperCase()}" tidak ditemukan dalam database Event.`);
    } else if (res.type === 'crisis') {
      openModal('CRISIS_DETAIL', { card: res.card });
    } else if (res.type === 'mission') {
      openModal('MISSION_DETAIL', { card: res.card });
    } else if (res.type === 'opportunity') {
      openModal('OPPORTUNITY_DETAIL', { card: res.card });
    } else {
      setScanMessage(`Kode "${quickInput.toUpperCase()}" adalah kartu Policy, bukan Event.`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6 md:space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-[#EAE9E3] shadow-soft-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F8F5EC] text-xs font-extrabold text-[#253451] mb-2 border border-[#EAE9E3]">
            <span>✨ Event Cards Archive</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-display font-black text-[#253451] tracking-tight">
            Arsip Kartu Event
          </h1>
          <p className="text-xs md:text-sm text-[#253451]/70 mt-1">
            Jelajahi kartu Crisis darurat, Quest misi strategis, dan stimulus ekonomi Opportunity.
          </p>
        </div>

        {/* Quick Event Code Search */}
        <form onSubmit={handleQuickScan} className="flex gap-2 w-full md:w-auto">
          <input
            type="text"
            value={quickInput}
            onChange={e => setQuickInput(e.target.value)}
            placeholder="Scan Kode: CRS-01, MIS-01..."
            className="bg-[#F8F5EC] border border-[#EAE9E3] rounded-2xl px-3.5 py-2.5 text-xs font-mono uppercase text-[#253451] outline-none focus:border-[#253451] w-full md:w-60 font-bold"
          />
          <button
            type="submit"
            className="px-4 py-2.5 rounded-2xl bg-[#253451] hover:bg-[#1C273D] text-white font-extrabold text-xs uppercase tracking-wider transition shrink-0 game-press"
          >
            Buka Kartu
          </button>
        </form>
      </div>

      {scanMessage && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 flex items-center gap-2 font-medium">
          <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
          <span>{scanMessage}</span>
        </div>
      )}

      {/* Tabs & Status Filter */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#EAE9E3] pb-3">
        {/* Category Tabs */}
        <div className="flex gap-2 bg-white p-1 rounded-2xl border border-[#EAE9E3] shadow-xs">
          <button
            onClick={() => setActiveTab('crisis')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'crisis'
                ? 'bg-[#EF4444] text-white shadow-xs'
                : 'text-[#253451]/70 hover:bg-[#F8F5EC] hover:text-[#253451]'
            }`}
          >
            <span>⚡ Crisis ({crisisCards.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('mission')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'mission'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-[#253451]/70 hover:bg-[#F8F5EC] hover:text-[#253451]'
            }`}
          >
            <span>🎯 Missions ({missionCards.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('opportunity')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'opportunity'
                ? 'bg-[#73B77A] text-white shadow-xs'
                : 'text-[#253451]/70 hover:bg-[#F8F5EC] hover:text-[#253451]'
            }`}
          >
            <span>✨ Opportunities ({opportunityCards.length})</span>
          </button>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#253451]/60 font-bold">Status:</span>
          <select
            value={filterUsed}
            onChange={e => setFilterUsed(e.target.value as any)}
            className="bg-white border border-[#EAE9E3] rounded-xl px-3 py-1.5 text-xs font-bold text-[#253451] outline-none focus:border-[#253451]"
          >
            <option value="all">Semua Kartu</option>
            <option value="available">Tersedia di Deck</option>
            <option value="used">Sudah Selesai / Terpakai</option>
          </select>
        </div>
      </div>

      {/* Cards Grid */}
      {activeTab === 'crisis' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {crisisCards
            .filter(c => filterUsed === 'all' || (filterUsed === 'available' ? !c.isUsed : c.isUsed))
            .map(card => (
              <div
                key={card.id}
                onClick={() => openModal('CRISIS_DETAIL', { card })}
                className="bg-white border-2 border-[#EAE9E3] hover:border-red-300 rounded-3xl overflow-hidden shadow-soft-sm card-hover transition cursor-pointer flex flex-col justify-between group"
              >
                <div className="h-56 bg-[#F8F5EC] p-3 border-b border-[#EAE9E3] flex items-center justify-center">
                  <img
                    src={card.image}
                    alt={card.title}
                    className="w-full h-full object-contain rounded-xl drop-shadow-sm"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/game-assets/event-back';
                    }}
                  />
                </div>

                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-200">
                      ⚡ CRISIS
                    </span>
                    <span className="font-mono text-xs font-extrabold text-[#EF956F] bg-[#F8F5EC] px-2 py-0.5 rounded-md border border-[#EAE9E3]">
                      {card.code}
                    </span>
                  </div>

                  <h3 className="font-display font-extrabold text-sm text-[#253451] group-hover:text-red-600 transition">
                    {card.title}
                  </h3>

                  <p className="text-xs text-[#253451]/70 line-clamp-2 font-medium">
                    {card.description}
                  </p>

                  <div className="pt-2 border-t border-[#EAE9E3] flex items-center justify-between text-[11px] font-bold">
                    <span className={card.isUsed ? 'text-red-600' : 'text-[#73B77A]'}>
                      {card.isUsed ? 'SELESAI (RESOLVED)' : 'SIAP DIKARTUKAN'}
                    </span>
                    <span className="text-[#253451] flex items-center gap-1 group-hover:translate-x-1 transition">
                      <span>Buka Keputusan</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}

      {activeTab === 'mission' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {missionCards
            .filter(c => filterUsed === 'all' || (filterUsed === 'available' ? !c.isUsed : c.isUsed))
            .map(card => (
              <div
                key={card.id}
                onClick={() => openModal('MISSION_DETAIL', { card })}
                className="bg-white border-2 border-[#EAE9E3] hover:border-purple-300 rounded-3xl overflow-hidden shadow-soft-sm card-hover transition cursor-pointer flex flex-col justify-between group"
              >
                <div className="h-56 bg-[#F8F5EC] p-3 border-b border-[#EAE9E3] flex items-center justify-center">
                  <img
                    src={card.image}
                    alt={card.title}
                    className="w-full h-full object-contain rounded-xl drop-shadow-sm"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/game-assets/event-back';
                    }}
                  />
                </div>

                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
                      🎯 MISSION
                    </span>
                    <span className="font-mono text-xs font-extrabold text-purple-700 bg-[#F8F5EC] px-2 py-0.5 rounded-md border border-[#EAE9E3]">
                      {card.code}
                    </span>
                  </div>

                  <h3 className="font-display font-extrabold text-sm text-[#253451] group-hover:text-purple-600 transition">
                    {card.title}
                  </h3>

                  <p className="text-xs text-[#253451]/70 line-clamp-2 font-medium">
                    {card.description}
                  </p>

                  <div className="pt-2 border-t border-[#EAE9E3] flex items-center justify-between text-[11px]">
                    <span className="font-mono font-extrabold text-[#73B77A]">
                      +{card.rewardPoints} VP {card.rewardGB > 0 && `| +${card.rewardGB} GB`}
                    </span>
                    <span className="text-[#253451] font-bold flex items-center gap-1 group-hover:translate-x-1 transition">
                      <span>Lihat Quest</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}

      {activeTab === 'opportunity' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {opportunityCards
            .filter(c => filterUsed === 'all' || (filterUsed === 'available' ? !c.isUsed : c.isUsed))
            .map(card => (
              <div
                key={card.id}
                onClick={() => openModal('OPPORTUNITY_DETAIL', { card })}
                className="bg-white border-2 border-[#EAE9E3] hover:border-emerald-300 rounded-3xl overflow-hidden shadow-soft-sm card-hover transition cursor-pointer flex flex-col justify-between group"
              >
                <div className="h-56 bg-[#F8F5EC] p-3 border-b border-[#EAE9E3] flex items-center justify-center">
                  <img
                    src={card.image}
                    alt={card.title}
                    className="w-full h-full object-contain rounded-xl drop-shadow-sm"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/game-assets/event-back';
                    }}
                  />
                </div>

                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                      ✨ OPPORTUNITY
                    </span>
                    <span className="font-mono text-xs font-extrabold text-emerald-700 bg-[#F8F5EC] px-2 py-0.5 rounded-md border border-[#EAE9E3]">
                      {card.code}
                    </span>
                  </div>

                  <h3 className="font-display font-extrabold text-sm text-[#253451] group-hover:text-emerald-600 transition">
                    {card.title}
                  </h3>

                  <p className="text-xs text-[#253451]/70 line-clamp-2 font-medium">
                    {card.description}
                  </p>

                  <div className="pt-2 border-t border-[#EAE9E3] flex items-center justify-between text-[11px]">
                    <span className="font-mono font-extrabold text-[#73B77A]">
                      +{card.immediatePoints} VP {card.recurringGB > 0 && `| +${card.recurringGB} GB/cy`}
                    </span>
                    <span className="text-[#253451] font-bold flex items-center gap-1 group-hover:translate-x-1 transition">
                      <span>Aktifkan</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};
