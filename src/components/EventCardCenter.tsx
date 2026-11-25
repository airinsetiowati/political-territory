import React, { useState } from 'react';
import {
  ShieldAlert,
  Sparkles,
  Target,
  Search,
  ClipboardList,
  Layers
} from 'lucide-react';
import { useGame } from '../context/GameContext';
import { getCardAsset, EVENT_CARD_BACK } from '../utils/cardAssets';
import { CategoryLogo } from './CategoryLogo';
import { PlayerLogo } from './PlayerLogo';
import { CATEGORY_NAMES } from '../utils/categoryAssets';

export type EventTab = 'all' | 'crisis' | 'opportunity' | 'mission';

interface EventCardCenterProps {
  activeTab?: EventTab;
  onTabChange?: (tab: EventTab) => void;
}

export const EventCardCenter: React.FC<EventCardCenterProps> = ({
  activeTab: controlledTab,
  onTabChange
}) => {
  const {
    crisisCards,
    opportunityCards,
    missionCards,
    players,
    openModal
  } = useGame();

  const [internalTab, setInternalTab] = useState<EventTab>('all');
  const activeTab = controlledTab ?? internalTab;
  const setActiveTab = (tab: EventTab) => {
    if (onTabChange) onTabChange(tab);
    else setInternalTab(tab);
  };

  const [crisisSearch, setCrisisSearch] = useState('');
  const [oppSearch, setOppSearch] = useState('');
  const [missionSearch, setMissionSearch] = useState('');

  const activeMissions = players.flatMap(player =>
    (player.activeMissions || [])
      .filter(mission => mission.status === 'active')
      .map(mission => ({ player, mission }))
  );

  const activeOpportunities = players.flatMap(player =>
    (player.activeOpportunities || []).map(opp => ({ player, opp }))
  );

  const totalActiveQuests = activeMissions.length + activeOpportunities.length;

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
    <section
      id="event-card-center"
      className="h-full bg-white rounded-3xl border border-[#EAE9E3] shadow-soft-sm p-3.5 sm:p-4 flex flex-col gap-3"
    >
      {/* Header & Category Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-[#EAE9E3]">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-[#253451] text-[#F4CE70] flex items-center justify-center shrink-0">
            <Layers className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-display font-black text-[#253451] uppercase tracking-wide truncate">
              Event Card Center: Crisis, Opportunity &amp; Mission
            </h2>
            <p className="text-[10px] text-[#253451]/60 font-bold truncate">
              Daftar kartu darurat nasional, peluang stimulus, dan quest strategis
            </p>
          </div>
        </div>

        {/* View Mode Tabs */}
        <div className="flex flex-wrap items-center gap-1 bg-[#F8F5EC] p-1 rounded-xl border border-[#EAE9E3] shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
              activeTab === 'all'
                ? 'bg-[#253451] text-white shadow-xs'
                : 'text-[#253451]/70 hover:bg-white'
            }`}
          >
            Semua
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('crisis')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition flex items-center gap-1 ${
              activeTab === 'crisis'
                ? 'bg-red-600 text-white shadow-xs'
                : 'text-red-700 hover:bg-red-50'
            }`}
          >
            <ShieldAlert className="w-3 h-3" />
            <span>Krisis ({crisisCards.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('opportunity')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition flex items-center gap-1 ${
              activeTab === 'opportunity'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-amber-700 hover:bg-amber-50'
            }`}
          >
            <Sparkles className="w-3 h-3" />
            <span>Peluang ({opportunityCards.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('mission')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition flex items-center gap-1 ${
              activeTab === 'mission'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-emerald-700 hover:bg-emerald-50'
            }`}
          >
            <Target className="w-3 h-3" />
            <span>Misi ({missionCards.length})</span>
          </button>
        </div>
      </div>

      {/* Active Quests & Ongoing Stimulus Bar */}
      {totalActiveQuests > 0 && (
        <div className="bg-[#F8F5EC] rounded-2xl border border-purple-200 p-2.5 space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <ClipboardList className="w-3.5 h-3.5 text-purple-600" />
              <span className="text-[11px] font-display font-black text-purple-950 uppercase tracking-wide">
                Quest &amp; Stimulus Berjalan ({totalActiveQuests} Aktif)
              </span>
            </div>
            <span className="text-[10px] text-purple-700/65 font-bold hidden sm:inline">
              Klik untuk detail / selesaikan
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5">
            {activeMissions.map(({ player, mission }) => (
              <div
                key={`act-mis-${player.id}-${mission.id}`}
                onClick={() => openModal('MISSION_DETAIL', { card: mission, playerId: player.id })}
                className="bg-white hover:bg-purple-50 border border-purple-200 rounded-xl p-2 cursor-pointer transition flex items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-5 h-5 rounded-full overflow-hidden shrink-0 border border-purple-200 bg-white">
                    <PlayerLogo player={player} size="full" showBadge={false} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="font-mono text-[9px] font-black text-purple-700 bg-purple-50 px-1 rounded border border-purple-200">
                        {mission.code}
                      </span>
                      <span className="text-[10px] font-bold text-[#253451] truncate">
                        {player.name}
                      </span>
                    </div>
                    <div className="text-[11px] font-bold text-[#253451] truncate">
                      {mission.title}
                    </div>
                  </div>
                </div>
                <span className="font-mono text-[10px] font-black text-purple-800 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200 shrink-0">
                  +{mission.rewardPoints} VP
                </span>
              </div>
            ))}

            {activeOpportunities.map(({ player, opp }) => (
              <div
                key={`act-opp-${player.id}-${opp.id}`}
                onClick={() => openModal('OPPORTUNITY_DETAIL', { card: opp })}
                className="bg-white hover:bg-amber-50 border border-amber-200 rounded-xl p-2 cursor-pointer transition flex items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-5 h-5 rounded-full overflow-hidden shrink-0 border border-amber-200 bg-white">
                    <PlayerLogo player={player} size="full" showBadge={false} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="font-mono text-[9px] font-black text-amber-700 bg-amber-50 px-1 rounded border border-amber-200">
                        {opp.code}
                      </span>
                      <span className="text-[10px] font-bold text-[#253451] truncate">
                        {player.name}
                      </span>
                    </div>
                    <div className="text-[11px] font-bold text-[#253451] truncate">
                      {opp.title}
                    </div>
                  </div>
                </div>
                <span className="font-mono text-[10px] font-black text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 shrink-0">
                  {opp.recurringGB > 0 ? `+${opp.recurringGB} GB/cy` : opp.isPermanent ? 'Permanen' : `${opp.remainingCycles} cy`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Decks Grid: 3 side-by-side or filtered single panel */}
      <div className={`grid flex-1 min-h-0 gap-3 ${
        activeTab === 'all'
          ? 'grid-cols-1 md:grid-cols-3'
          : 'grid-cols-1'
      }`}>

        {/* PANEL 1: CRISIS CARDS */}
        {(activeTab === 'all' || activeTab === 'crisis') && (
          <div className="bg-[#F8F5EC]/60 rounded-2xl border border-red-200 p-3 flex flex-col h-[420px] sm:h-[460px]">
            <div className="flex items-center justify-between pb-2 border-b border-red-100 mb-2">
              <div className="flex items-center gap-1.5 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                  <ShieldAlert className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-display font-black text-xs text-red-950 uppercase tracking-wide truncate">
                    Crisis Cards
                  </h3>
                  <span className="text-[10px] text-red-700/70 font-bold">Darurat Nasional</span>
                </div>
              </div>
              <span className="text-[10px] font-mono font-extrabold px-2 py-0.5 rounded-full bg-white text-red-700 border border-red-200 shrink-0">
                {filteredCrisis.filter(c => c.isUsed).length}/{crisisCards.length}
              </span>
            </div>

            <div className="relative mb-2">
              <input
                type="text"
                value={crisisSearch}
                onChange={e => setCrisisSearch(e.target.value)}
                placeholder="Cari kode (CRS-01)..."
                className="w-full bg-white border border-[#EAE9E3] focus:border-red-500 rounded-xl px-3 py-1.5 pl-8 text-xs font-bold text-[#253451] outline-none"
              />
              <Search className="w-3.5 h-3.5 text-[#253451]/40 absolute left-2.5 top-2" />
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {filteredCrisis.map(c => {
                const isResolved = c.isUsed;
                return (
                  <div
                    key={c.id}
                    onClick={() => openModal('CRISIS_DETAIL', { card: c })}
                    className={`p-2 rounded-2xl border transition cursor-pointer flex gap-2.5 items-center ${
                      isResolved
                        ? 'bg-gray-50 border-gray-200 opacity-60'
                        : 'bg-white border-[#EAE9E3] hover:border-red-300 hover:bg-red-50/40 shadow-2xs'
                    }`}
                  >
                    <div className="w-12 h-16 bg-[#F8F5EC] rounded-lg overflow-hidden border border-[#EAE9E3] shrink-0 p-0.5 flex items-center justify-center">
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

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className="font-mono text-[10px] font-black text-red-600 bg-red-50 px-1.5 py-0.5 rounded border border-red-200">
                          {c.code}
                        </span>
                        <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                          isResolved ? 'bg-gray-200 text-gray-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {isResolved ? 'Selesai' : 'Aktif'}
                        </span>
                      </div>
                      <h4 className="font-bold text-xs text-[#253451] truncate">{c.title}</h4>
                      <p className="text-[10px] text-[#253451]/60 line-clamp-1">{c.description}</p>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openModal('CRISIS_DETAIL', { card: c });
                        }}
                        className="mt-1 px-2 py-0.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-[10px] font-extrabold uppercase tracking-wider transition"
                      >
                        Tangani Krisis
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* PANEL 2: OPPORTUNITY CARDS */}
        {(activeTab === 'all' || activeTab === 'opportunity') && (
          <div className="bg-[#F8F5EC]/60 rounded-2xl border border-amber-200 p-3 flex flex-col h-[420px] sm:h-[460px]">
            <div className="flex items-center justify-between pb-2 border-b border-amber-100 mb-2">
              <div className="flex items-center gap-1.5 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-display font-black text-xs text-amber-950 uppercase tracking-wide truncate">
                    Opportunity Cards
                  </h3>
                  <span className="text-[10px] text-amber-700/70 font-bold">Stimulus &amp; Investasi</span>
                </div>
              </div>
              <span className="text-[10px] font-mono font-extrabold px-2 py-0.5 rounded-full bg-white text-amber-700 border border-amber-200 shrink-0">
                {filteredOpportunity.filter(c => c.isUsed).length}/{opportunityCards.length}
              </span>
            </div>

            <div className="relative mb-2">
              <input
                type="text"
                value={oppSearch}
                onChange={e => setOppSearch(e.target.value)}
                placeholder="Cari kode (OPP-01)..."
                className="w-full bg-white border border-[#EAE9E3] focus:border-amber-500 rounded-xl px-3 py-1.5 pl-8 text-xs font-bold text-[#253451] outline-none"
              />
              <Search className="w-3.5 h-3.5 text-[#253451]/40 absolute left-2.5 top-2" />
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {filteredOpportunity.map(c => {
                const isUsed = c.isUsed && !c.isReusable;
                return (
                  <div
                    key={c.id}
                    onClick={() => openModal('OPPORTUNITY_DETAIL', { card: c })}
                    className={`p-2 rounded-2xl border transition cursor-pointer flex gap-2.5 items-center ${
                      isUsed
                        ? 'bg-gray-50 border-gray-200 opacity-60'
                        : 'bg-white border-[#EAE9E3] hover:border-amber-300 hover:bg-amber-50/40 shadow-2xs'
                    }`}
                  >
                    <div className="w-12 h-16 bg-[#F8F5EC] rounded-lg overflow-hidden border border-[#EAE9E3] shrink-0 p-0.5 flex items-center justify-center">
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

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <div className="flex items-center gap-1 min-w-0">
                          <span className="font-mono text-[10px] font-black text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 shrink-0">
                            {c.code}
                          </span>
                          {c.targetCategory && (
                            <span className="inline-flex items-center gap-0.5 text-[9px] font-extrabold uppercase bg-amber-100 text-amber-900 px-1 py-0.5 rounded border border-amber-300 truncate">
                              <CategoryLogo category={c.targetCategory} size="xs" />
                              <span className="truncate">{CATEGORY_NAMES[c.targetCategory]}</span>
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] font-mono font-bold text-[#253451] shrink-0">
                          {c.costGB} GB
                        </span>
                      </div>
                      <h4 className="font-bold text-xs text-[#253451] truncate">{c.title}</h4>

                      <div className="flex items-center gap-2 text-[10px] font-mono">
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
                        className="mt-1 px-2 py-0.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-extrabold uppercase tracking-wider transition"
                      >
                        Beli / Aktifkan
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* PANEL 3: MISSION CARDS */}
        {(activeTab === 'all' || activeTab === 'mission') && (
          <div className="bg-[#F8F5EC]/60 rounded-2xl border border-emerald-200 p-3 flex flex-col h-[420px] sm:h-[460px]">
            <div className="flex items-center justify-between pb-2 border-b border-emerald-100 mb-2">
              <div className="flex items-center gap-1.5 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <Target className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-display font-black text-xs text-emerald-950 uppercase tracking-wide truncate">
                    Mission Cards
                  </h3>
                  <span className="text-[10px] text-emerald-700/70 font-bold">Quest Strategis</span>
                </div>
              </div>
              <span className="text-[10px] font-mono font-extrabold px-2 py-0.5 rounded-full bg-white text-emerald-700 border border-emerald-200 shrink-0">
                {filteredMissions.filter(c => c.status === 'completed').length}/{missionCards.length}
              </span>
            </div>

            <div className="relative mb-2">
              <input
                type="text"
                value={missionSearch}
                onChange={e => setMissionSearch(e.target.value)}
                placeholder="Cari kode (MIS-01)..."
                className="w-full bg-white border border-[#EAE9E3] focus:border-emerald-500 rounded-xl px-3 py-1.5 pl-8 text-xs font-bold text-[#253451] outline-none"
              />
              <Search className="w-3.5 h-3.5 text-[#253451]/40 absolute left-2.5 top-2" />
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {filteredMissions.map(c => {
                const isCompleted = c.status === 'completed';
                return (
                  <div
                    key={c.id}
                    onClick={() => openModal('MISSION_DETAIL', { card: c })}
                    className={`p-2 rounded-2xl border transition cursor-pointer flex gap-2.5 items-center ${
                      isCompleted
                        ? 'bg-emerald-50/70 border-emerald-200'
                        : 'bg-white border-[#EAE9E3] hover:border-emerald-300 hover:bg-emerald-50/40 shadow-2xs'
                    }`}
                  >
                    <div className="w-12 h-16 bg-[#F8F5EC] rounded-lg overflow-hidden border border-[#EAE9E3] shrink-0 p-0.5 flex items-center justify-center">
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

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className="font-mono text-[10px] font-black text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                          {c.code}
                        </span>
                        <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                          isCompleted ? 'bg-emerald-200 text-emerald-900' : 'bg-gray-200 text-gray-700'
                        }`}>
                          {isCompleted ? 'Selesai' : 'Tersedia'}
                        </span>
                      </div>
                      <h4 className="font-bold text-xs text-[#253451] truncate">{c.title}</h4>
                      <div className="flex items-center gap-2 text-[10px] font-mono font-bold text-emerald-700">
                        <span>+{c.rewardPoints} VP</span>
                        {c.rewardGB > 0 && <span>+{c.rewardGB} GB</span>}
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openModal('MISSION_DETAIL', { card: c });
                        }}
                        className="mt-1 px-2 py-0.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-extrabold uppercase tracking-wider transition"
                      >
                        Progres / Klaim
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </section>
  );
};
