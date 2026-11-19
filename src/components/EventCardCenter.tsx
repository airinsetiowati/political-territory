import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Sparkles, 
  Target, 
  Search, 
  Eye, 
  Coins, 
  Award, 
  Clock, 
  CheckCircle,
  AlertTriangle,
  Play
} from 'lucide-react';
import { useGame } from '../context/GameContext';
import { CrisisCard, OpportunityCard, MissionCard } from '../types/game';
import { getCardAsset, EVENT_CARD_BACK } from '../utils/cardAssets';
import { CategoryLogo } from './CategoryLogo';
import { CATEGORY_NAMES } from '../utils/categoryAssets';

export const EventCardCenter: React.FC = () => {
  const { 
    crisisCards, 
    opportunityCards, 
    missionCards, 
    openModal 
  } = useGame();

  const [crisisSearch, setCrisisSearch] = useState('');
  const [oppSearch, setOppSearch] = useState('');
  const [missionSearch, setMissionSearch] = useState('');

  // Filter lists
  const filteredCrisis = crisisCards.filter(c => 
    c.code.toLowerCase().includes(crisisSearch.toLowerCase()) || 
    c.title.toLowerCase().includes(crisisSearch.toLowerCase())
  );

  const filteredOpportunity = opportunityCards.filter(c => 
    c.code.toLowerCase().includes(oppSearch.toLowerCase()) || 
    c.title.toLowerCase().includes(oppSearch.toLowerCase())
  );

  const filteredMissions = missionCards.filter(c => 
    c.code.toLowerCase().includes(missionSearch.toLowerCase()) || 
    c.title.toLowerCase().includes(missionSearch.toLowerCase())
  );

  return (
    <section id="event-card-center" className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#EAE9E3] pb-3">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#253451] text-white text-[10px] font-extrabold uppercase tracking-wider mb-1">
            <span>🎴 Pusat Kartu Event Fisik</span>
          </div>
          <h2 className="text-xl font-display font-black text-[#253451] tracking-tight">
            Event Card Center: Crisis, Opportunity & Mission
          </h2>
          <p className="text-xs text-[#253451]/70">
            Ketiga kategori kartu event aktif berdampingan untuk mendukung pengambilan keputusan cepat selama permainan fisik.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs font-bold text-[#253451]/70">
          <span className="px-2.5 py-1 bg-red-100 text-red-800 rounded-lg">20 Krisis</span>
          <span className="px-2.5 py-1 bg-amber-100 text-amber-800 rounded-lg">15 Peluang</span>
          <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-lg">15 Misi</span>
        </div>
      </div>

      {/* 3 Side-by-Side Columns on Desktop, Responsive on Tablet & Mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* PANEL 1: CRISIS CARDS */}
        <div className="bg-white rounded-3xl border border-red-200 shadow-soft-sm p-4 sm:p-5 flex flex-col h-[580px]">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-red-100 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-display font-black text-sm text-red-950 uppercase tracking-wide">
                  Crisis Cards (Krisis)
                </h3>
                <span className="text-[10px] text-red-700/70 font-bold">20 Kartu Darurat Nasional</span>
              </div>
            </div>
            <span className="text-xs font-mono font-extrabold px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200">
              {filteredCrisis.filter(c => c.isUsed).length} / {crisisCards.length} Selesai
            </span>
          </div>

          {/* Search by Code */}
          <div className="relative mb-3">
            <input
              type="text"
              value={crisisSearch}
              onChange={e => setCrisisSearch(e.target.value)}
              placeholder="Cari kode (mis. CRS-01)..."
              className="w-full bg-[#F8F5EC] border border-[#EAE9E3] focus:border-red-500 rounded-xl px-3 py-1.5 pl-8 text-xs font-bold text-[#253451] outline-none"
            />
            <Search className="w-3.5 h-3.5 text-[#253451]/40 absolute left-2.5 top-2.5" />
          </div>

          {/* Card List */}
          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
            {filteredCrisis.map(c => {
              const isResolved = c.isUsed;
              return (
                <div
                  key={c.id}
                  onClick={() => openModal('CRISIS_DETAIL', { card: c })}
                  className={`p-2.5 rounded-2xl border transition cursor-pointer flex gap-3 items-center ${
                    isResolved
                      ? 'bg-gray-50 border-gray-200 opacity-60'
                      : 'bg-[#F8F5EC] border-[#EAE9E3] hover:border-red-300 hover:bg-red-50/40 shadow-2xs'
                  }`}
                >
                  {/* Card Thumbnail Artwork with object-contain */}
                  <div className="w-14 h-20 bg-white rounded-xl overflow-hidden border border-[#EAE9E3] shrink-0 p-1 flex items-center justify-center">
                    <img
                      src={getCardAsset(c.image, EVENT_CARD_BACK)}
                      alt={c.title}
                      className="w-full h-full object-contain"
                      loading="lazy"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = EVENT_CARD_BACK;
                      }}
                    />
                  </div>

                  {/* Info & Activation Controls */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span className="font-mono text-xs font-black text-red-600 bg-red-50 px-1.5 py-0.5 rounded border border-red-200">
                        {c.code}
                      </span>
                      <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                        isResolved ? 'bg-gray-200 text-gray-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {isResolved ? 'Terselesaikan' : 'Aktif'}
                      </span>
                    </div>
                    <h4 className="font-bold text-xs text-[#253451] truncate">{c.title}</h4>
                    <p className="text-[10px] text-[#253451]/60 line-clamp-1 mt-0.5">{c.description}</p>
                    
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openModal('CRISIS_DETAIL', { card: c });
                      }}
                      className="mt-1.5 px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white text-[10px] font-extrabold uppercase tracking-wider transition flex items-center gap-1"
                    >
                      <span>Tangani Krisis</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* PANEL 2: OPPORTUNITY CARDS */}
        <div className="bg-white rounded-3xl border border-amber-200 shadow-soft-sm p-4 sm:p-5 flex flex-col h-[580px]">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-amber-100 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-display font-black text-sm text-amber-950 uppercase tracking-wide">
                  Opportunity Cards
                </h3>
                <span className="text-[10px] text-amber-700/70 font-bold">15 Stimulus & Investasi</span>
              </div>
            </div>
            <span className="text-xs font-mono font-extrabold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
              {filteredOpportunity.filter(c => c.isUsed).length} / {opportunityCards.length} Terpakai
            </span>
          </div>

          {/* Search by Code */}
          <div className="relative mb-3">
            <input
              type="text"
              value={oppSearch}
              onChange={e => setOppSearch(e.target.value)}
              placeholder="Cari kode (mis. OPP-01)..."
              className="w-full bg-[#F8F5EC] border border-[#EAE9E3] focus:border-amber-500 rounded-xl px-3 py-1.5 pl-8 text-xs font-bold text-[#253451] outline-none"
            />
            <Search className="w-3.5 h-3.5 text-[#253451]/40 absolute left-2.5 top-2.5" />
          </div>

          {/* Card List */}
          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
            {filteredOpportunity.map(c => {
              const isUsed = c.isUsed && !c.isReusable;
              return (
                <div
                  key={c.id}
                  onClick={() => openModal('OPPORTUNITY_DETAIL', { card: c })}
                  className={`p-2.5 rounded-2xl border transition cursor-pointer flex gap-3 items-center ${
                    isUsed
                      ? 'bg-gray-50 border-gray-200 opacity-60'
                      : 'bg-[#F8F5EC] border-[#EAE9E3] hover:border-amber-300 hover:bg-amber-50/40 shadow-2xs'
                  }`}
                >
                  {/* Card Thumbnail Artwork with object-contain */}
                  <div className="w-14 h-20 bg-white rounded-xl overflow-hidden border border-[#EAE9E3] shrink-0 p-1 flex items-center justify-center">
                    <img
                      src={getCardAsset(c.image, EVENT_CARD_BACK)}
                      alt={c.title}
                      className="w-full h-full object-contain"
                      loading="lazy"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = EVENT_CARD_BACK;
                      }}
                    />
                  </div>

                  {/* Info & Activation Controls */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs font-black text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                          {c.code}
                        </span>
                        {c.targetCategory && (
                          <span className="inline-flex items-center gap-1 text-[9px] font-extrabold uppercase bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded border border-amber-300">
                            <CategoryLogo category={c.targetCategory} size="xs" />
                            <span>{CATEGORY_NAMES[c.targetCategory]}</span>
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] font-mono font-bold text-[#253451]">
                        Biaya: {c.costGB} GB
                      </span>
                    </div>
                    <h4 className="font-bold text-xs text-[#253451] truncate">{c.title}</h4>
                    
                    <div className="flex items-center gap-2 mt-0.5 text-[10px] font-mono">
                      {c.immediatePoints > 0 && <span className="text-[#3B82F6] font-bold">+{c.immediatePoints} VP</span>}
                      {c.recurringGB > 0 && <span className="text-[#73B77A] font-bold">+{c.recurringGB} GB/cy</span>}
                      {c.isPermanent ? (
                        <span className="text-purple-600 font-bold">Permanen</span>
                      ) : (
                        <span className="text-gray-500 font-medium">{c.durationCycles} siklus</span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openModal('OPPORTUNITY_DETAIL', { card: c });
                      }}
                      className="mt-1.5 px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-extrabold uppercase tracking-wider transition flex items-center gap-1"
                    >
                      <span>Beli / Aktifkan</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* PANEL 3: MISSION CARDS */}
        <div className="bg-white rounded-3xl border border-emerald-200 shadow-soft-sm p-4 sm:p-5 flex flex-col h-[580px]">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-emerald-100 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <Target className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-display font-black text-sm text-emerald-950 uppercase tracking-wide">
                  Mission Cards (Misi)
                </h3>
                <span className="text-[10px] text-emerald-700/70 font-bold">15 Quest Strategis</span>
              </div>
            </div>
            <span className="text-xs font-mono font-extrabold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              {filteredMissions.filter(c => c.status === 'completed').length} / {missionCards.length} Selesai
            </span>
          </div>

          {/* Search by Code */}
          <div className="relative mb-3">
            <input
              type="text"
              value={missionSearch}
              onChange={e => setMissionSearch(e.target.value)}
              placeholder="Cari kode (mis. MIS-01)..."
              className="w-full bg-[#F8F5EC] border border-[#EAE9E3] focus:border-emerald-500 rounded-xl px-3 py-1.5 pl-8 text-xs font-bold text-[#253451] outline-none"
            />
            <Search className="w-3.5 h-3.5 text-[#253451]/40 absolute left-2.5 top-2.5" />
          </div>

          {/* Card List */}
          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
            {filteredMissions.map(c => {
              const isCompleted = c.status === 'completed';
              return (
                <div
                  key={c.id}
                  onClick={() => openModal('MISSION_DETAIL', { card: c })}
                  className={`p-2.5 rounded-2xl border transition cursor-pointer flex gap-3 items-center ${
                    isCompleted
                      ? 'bg-emerald-50/60 border-emerald-200'
                      : 'bg-[#F8F5EC] border-[#EAE9E3] hover:border-emerald-300 hover:bg-emerald-50/40 shadow-2xs'
                  }`}
                >
                  {/* Card Thumbnail Artwork with object-contain */}
                  <div className="w-14 h-20 bg-white rounded-xl overflow-hidden border border-[#EAE9E3] shrink-0 p-1 flex items-center justify-center">
                    <img
                      src={getCardAsset(c.image, EVENT_CARD_BACK)}
                      alt={c.title}
                      className="w-full h-full object-contain"
                      loading="lazy"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = EVENT_CARD_BACK;
                      }}
                    />
                  </div>

                  {/* Info & Activation Controls */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span className="font-mono text-xs font-black text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                        {c.code}
                      </span>
                      <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                        isCompleted ? 'bg-emerald-200 text-emerald-900' : 'bg-gray-200 text-gray-700'
                      }`}>
                        {isCompleted ? 'Selesai' : 'Tersedia'}
                      </span>
                    </div>
                    <h4 className="font-bold text-xs text-[#253451] truncate">{c.title}</h4>
                    <p className="text-[10px] text-[#253451]/60 line-clamp-1 mt-0.5">{c.description}</p>
                    
                    <div className="flex items-center gap-2 mt-0.5 text-[10px] font-mono font-bold text-emerald-700">
                      <span>Hadiah: +{c.rewardPoints} VP</span>
                      {c.rewardGB > 0 && <span>+{c.rewardGB} GB</span>}
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openModal('MISSION_DETAIL', { card: c });
                      }}
                      className="mt-1.5 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-extrabold uppercase tracking-wider transition flex items-center gap-1"
                    >
                      <span>Progres / Klaim</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
};
