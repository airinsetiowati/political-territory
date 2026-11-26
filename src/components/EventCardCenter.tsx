import React, { useEffect, useMemo, useState } from 'react';
import {
  Flag,
  ShieldAlert,
  Sparkles,
  Target,
  Search,
  Layers,
  QrCode,
  ClipboardList,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useGame } from '../context/GameContext';
import { getCardAsset, EVENT_CARD_BACK, POLICY_CARD_BACK } from '../utils/cardAssets';
import { CategoryLogo } from './CategoryLogo';
import { PlayerLogo } from './PlayerLogo';
import { CATEGORY_NAMES } from '../utils/categoryAssets';
import { PolicyCard, CrisisCard, OpportunityCard, MissionCard, TerritoryCategory } from '../types/game';

export type EventTab = 'policy' | 'crisis' | 'opportunity' | 'mission';
type StatusFilter = 'all' | 'active' | 'done';

interface EventCardCenterProps {
  activeTab?: EventTab;
  onTabChange?: (tab: EventTab) => void;
}

type CardStatusLabel = 'Active' | 'Completed' | 'Used';

const STATUS_BADGE_STYLES: Record<CardStatusLabel, string> = {
  Active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Completed: 'bg-blue-50 text-blue-700 border-blue-200',
  Used: 'bg-slate-100 text-slate-600 border-slate-200',
};

export const EventCardCenter: React.FC<EventCardCenterProps> = ({
  activeTab: controlledTab,
  onTabChange
}) => {
  const {
    policyCards,
    crisisCards,
    opportunityCards,
    missionCards,
    territories,
    players,
    economyConfig,
    activePlayer,
    claimTurnPlayer,
    openModal
  } = useGame();

  const [internalTab, setInternalTab] = useState<EventTab>('policy');
  const activeTab = controlledTab ?? internalTab;
  const setActiveTab = (tab: EventTab) => {
    if (onTabChange) onTabChange(tab);
    else setInternalTab(tab);
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [policySectorFilter, setPolicySectorFilter] = useState<string>('all');
  const [carouselIndex, setCarouselIndex] = useState(0);

  useEffect(() => {
    setCarouselIndex(0);
  }, [activeTab, searchQuery, statusFilter, policySectorFilter]);

  // Available card counts strictly derived from live GameContext state
  const availableCounts = useMemo(() => ({
    policy: policyCards.filter(c => !c.isUsed || c.isReusable).length,
    crisis: crisisCards.filter(c => !c.isUsed || c.isReusable).length,
    opportunity: opportunityCards.filter(c => !c.isUsed || c.isReusable).length,
    mission: missionCards.filter(c => c.status !== 'completed').length,
  }), [policyCards, crisisCards, opportunityCards, missionCards]);

  // Ongoing quests & stimulus across all players
  const activeMissions = useMemo(() => players.flatMap(player =>
    (player.activeMissions || [])
      .filter(mission => mission.status === 'active')
      .map(mission => ({ player, mission }))
  ), [players]);

  const activeOpportunities = useMemo(() => players.flatMap(player =>
    (player.activeOpportunities || []).map(opp => ({ player, opp }))
  ), [players]);

  const totalOngoingCount = activeMissions.length + activeOpportunities.length;

  const normalizedQuery = searchQuery.trim().toLowerCase();

  // Filtered Policy Cards
  const filteredPolicy = useMemo(() => {
    return policyCards.filter(c => {
      const isUsed = c.isUsed && !c.isReusable;
      if (statusFilter === 'active' && isUsed) return false;
      if (statusFilter === 'done' && !isUsed) return false;
      if (policySectorFilter !== 'all' && c.category !== policySectorFilter) return false;
      if (normalizedQuery) {
        const terr = c.targetTerritoryId ? territories.find(t => t.id === c.targetTerritoryId) : undefined;
        const match =
          c.code.toLowerCase().includes(normalizedQuery) ||
          c.name.toLowerCase().includes(normalizedQuery) ||
          c.category.toLowerCase().includes(normalizedQuery) ||
          (terr?.name.toLowerCase().includes(normalizedQuery) ?? false);
        if (!match) return false;
      }
      return true;
    });
  }, [policyCards, statusFilter, policySectorFilter, normalizedQuery, territories]);

  // Filtered Crisis Cards
  const filteredCrisis = useMemo(() => {
    return crisisCards.filter(c => {
      const isUsed = c.isUsed && !c.isReusable;
      if (statusFilter === 'active' && isUsed) return false;
      if (statusFilter === 'done' && !isUsed) return false;
      if (normalizedQuery) {
        const match =
          c.code.toLowerCase().includes(normalizedQuery) ||
          c.title.toLowerCase().includes(normalizedQuery) ||
          c.description.toLowerCase().includes(normalizedQuery);
        if (!match) return false;
      }
      return true;
    });
  }, [crisisCards, statusFilter, normalizedQuery]);

  // Filtered Opportunity Cards
  const filteredOpportunity = useMemo(() => {
    return opportunityCards.filter(c => {
      const isRunningOnPlayer = players.some(p =>
        (p.activeOpportunities || []).some(o => o.id === c.id)
      );
      const isUsed = c.isUsed && !c.isReusable && !isRunningOnPlayer;
      if (statusFilter === 'active' && isUsed) return false;
      if (statusFilter === 'done' && !isUsed) return false;
      if (normalizedQuery) {
        const catName = c.targetCategory ? CATEGORY_NAMES[c.targetCategory].toLowerCase() : '';
        const match =
          c.code.toLowerCase().includes(normalizedQuery) ||
          c.title.toLowerCase().includes(normalizedQuery) ||
          c.description.toLowerCase().includes(normalizedQuery) ||
          catName.includes(normalizedQuery);
        if (!match) return false;
      }
      return true;
    });
  }, [opportunityCards, players, statusFilter, normalizedQuery]);

  // Filtered Mission Cards
  const filteredMission = useMemo(() => {
    return missionCards.filter(c => {
      const isCompleted = c.status === 'completed';
      if (statusFilter === 'active' && isCompleted) return false;
      if (statusFilter === 'done' && !isCompleted) return false;
      if (normalizedQuery) {
        const match =
          c.code.toLowerCase().includes(normalizedQuery) ||
          c.title.toLowerCase().includes(normalizedQuery) ||
          c.description.toLowerCase().includes(normalizedQuery);
        if (!match) return false;
      }
      return true;
    });
  }, [missionCards, statusFilter, normalizedQuery]);

  const tabs: {
    id: EventTab;
    label: string;
    count: number;
    total: number;
    icon: React.FC<{ className?: string }>;
    activeClass: string;
    idleClass: string;
    badgeActive: string;
    badgeIdle: string;
  }[] = [
    {
      id: 'policy',
      label: 'CLAIM / POLICY CARD',
      count: availableCounts.policy,
      total: policyCards.length,
      icon: Flag,
      activeClass: 'bg-[#253451] text-white shadow-xs',
      idleClass: 'bg-white text-[#253451]/80 hover:bg-[#253451]/5 border border-[#EAE9E3]',
      badgeActive: 'bg-[#F4CE70] text-[#253451]',
      badgeIdle: 'bg-[#F8F5EC] text-[#253451] border border-[#EAE9E3]',
    },
    {
      id: 'crisis',
      label: 'CRISIS CARD',
      count: availableCounts.crisis,
      total: crisisCards.length,
      icon: ShieldAlert,
      activeClass: 'bg-red-600 text-white shadow-xs',
      idleClass: 'bg-white text-red-700 hover:bg-red-50 border border-[#EAE9E3]',
      badgeActive: 'bg-white/20 text-white',
      badgeIdle: 'bg-red-50 text-red-700 border border-red-200',
    },
    {
      id: 'opportunity',
      label: 'OPPORTUNITY CARD',
      count: availableCounts.opportunity,
      total: opportunityCards.length,
      icon: Sparkles,
      activeClass: 'bg-amber-500 text-white shadow-xs',
      idleClass: 'bg-white text-amber-800 hover:bg-amber-50 border border-[#EAE9E3]',
      badgeActive: 'bg-white/25 text-white',
      badgeIdle: 'bg-amber-50 text-amber-800 border border-amber-200',
    },
    {
      id: 'mission',
      label: 'MISSION CARD',
      count: availableCounts.mission,
      total: missionCards.length,
      icon: Target,
      activeClass: 'bg-emerald-600 text-white shadow-xs',
      idleClass: 'bg-white text-emerald-800 hover:bg-emerald-50 border border-[#EAE9E3]',
      badgeActive: 'bg-white/20 text-white',
      badgeIdle: 'bg-emerald-50 text-emerald-800 border border-emerald-200',
    },
  ];

  const activeTabMeta = tabs.find(t => t.id === activeTab)!;

  const renderPolicyCard = (c: PolicyCard, idx: number, isSelected: boolean) => {
    const isUsed = c.isUsed && !c.isReusable;
    const statusLabel: CardStatusLabel = isUsed ? 'Used' : 'Active';
    const matchedTerritory = c.targetTerritoryId
      ? territories.find(t => t.id === c.targetTerritoryId)
      : undefined;
    const territoryOwner = matchedTerritory?.ownerId
      ? players.find(p => p.id === matchedTerritory.ownerId)
      : undefined;
    const usedByPlayer = c.usedByPlayerId
      ? players.find(p => p.id === c.usedByPlayerId)
      : undefined;
    const catKey = (matchedTerritory?.category || (c.category !== 'free_choice' ? c.category : undefined)) as TerritoryCategory | undefined;
    const catConfig = catKey ? economyConfig[catKey] : undefined;
    const cost = catConfig?.claimCost ?? matchedTerritory?.claimCost ?? c.claimCost;
    const baseVP = catConfig?.basePoints ?? matchedTerritory?.basePoints;
    const baseIncome = catConfig?.baseIncome ?? matchedTerritory?.baseIncome;

    const effectDescription = c.isFreeChoice
      ? 'Bebas pilih & klaim 1 wilayah kosong mana saja di peta (biaya mengikuti sektor wilayah).'
      : matchedTerritory
        ? `Klaim ${matchedTerritory.name} (${CATEGORY_NAMES[matchedTerritory.category]}): Biaya ${cost} GB • +${baseVP} VP • +${baseIncome} GB/siklus.`
        : `Kartu Policy sektor ${c.category.toUpperCase()} untuk klaim wilayah (Biaya ${cost} GB).`;

    return (
      <div
        key={c.id}
        onClick={() => setCarouselIndex(idx)}
        className={`p-2.5 rounded-2xl border transition cursor-pointer flex items-center gap-2.5 ${
          isSelected
            ? 'bg-[#F8F5EC] border-[#253451]/60 ring-2 ring-[#253451]/15 shadow-xs'
            : isUsed
              ? 'bg-slate-50/80 border-slate-200 opacity-75 hover:opacity-100'
              : 'bg-white border-[#EAE9E3] hover:border-[#253451]/40 hover:bg-[#F8F5EC]/50 shadow-2xs'
        }`}
      >
        <div className="w-11 h-16 bg-[#F8F5EC] rounded-xl overflow-hidden border border-[#EAE9E3] shrink-0 p-0.5 flex items-center justify-center">
          <img
            src={getCardAsset(c.image, POLICY_CARD_BACK)}
            alt={c.name}
            className="w-full h-full object-contain"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).src = POLICY_CARD_BACK;
            }}
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
            <span className="font-mono text-[10px] font-black text-[#253451] bg-[#F8F5EC] px-1.5 py-0.5 rounded border border-[#EAE9E3]">
              {c.code}
            </span>
            <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded border ${STATUS_BADGE_STYLES[statusLabel]}`}>
              {statusLabel}
            </span>
            {c.isFreeChoice ? (
              <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-[#F4CE70]/25 text-[#253451] border border-[#F4CE70]/50">
                Bebas Pilih
              </span>
            ) : catKey ? (
              <span className="inline-flex items-center gap-0.5 text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-blue-50 text-[#253451] border border-blue-200">
                <CategoryLogo category={catKey} size="xs" />
                <span>{CATEGORY_NAMES[catKey]}</span>
              </span>
            ) : null}
            {(usedByPlayer || territoryOwner) && (
              <span className="text-[9px] font-bold text-[#253451]/65 truncate">
                • {(usedByPlayer || territoryOwner)?.name}
              </span>
            )}
          </div>

          <h4 className="font-display font-bold text-xs text-[#253451] truncate">
            {c.name}
          </h4>
          <p className="text-[11px] text-[#253451]/70 line-clamp-2 leading-snug mt-0.5">
            {effectDescription}
          </p>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setCarouselIndex(idx);
            openModal('QUICK_CARD_ENTRY', {
              playerId: claimTurnPlayer?.id || activePlayer?.id,
              rollerId: claimTurnPlayer?.id || undefined,
              cardCode: c.code,
            });
          }}
          className={`px-2.5 py-1.5 rounded-xl text-[10px] font-extrabold uppercase tracking-wider transition shrink-0 ${
            isUsed
              ? 'bg-slate-200 hover:bg-slate-300 text-slate-700'
              : 'bg-[#253451] hover:bg-[#1C273D] text-[#F4CE70] shadow-2xs'
          }`}
        >
          {isUsed ? 'Detail' : 'Klaim'}
        </button>
      </div>
    );
  };

  const renderCrisisCard = (c: CrisisCard, idx: number, isSelected: boolean) => {
    const isResolved = c.isUsed && !c.isReusable;
    const statusLabel: CardStatusLabel = isResolved ? 'Used' : 'Active';
    const resolvedBy = c.usedByPlayerId ? players.find(p => p.id === c.usedByPlayerId) : undefined;

    return (
      <div
        key={c.id}
        onClick={() => setCarouselIndex(idx)}
        className={`p-2.5 rounded-2xl border transition cursor-pointer flex items-center gap-2.5 ${
          isSelected
            ? 'bg-red-50/70 border-red-400 ring-2 ring-red-200 shadow-xs'
            : isResolved
              ? 'bg-slate-50/80 border-slate-200 opacity-75 hover:opacity-100'
              : 'bg-white border-[#EAE9E3] hover:border-red-300 hover:bg-red-50/35 shadow-2xs'
        }`}
      >
        <div className="w-11 h-16 bg-[#F8F5EC] rounded-xl overflow-hidden border border-[#EAE9E3] shrink-0 p-0.5 flex items-center justify-center">
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
          <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
            <span className="font-mono text-[10px] font-black text-red-700 bg-red-50 px-1.5 py-0.5 rounded border border-red-200">
              {c.code}
            </span>
            <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded border ${STATUS_BADGE_STYLES[statusLabel]}`}>
              {statusLabel}
            </span>
            {resolvedBy && (
              <span className="text-[9px] font-bold text-[#253451]/65 truncate">
                • {resolvedBy.name}{c.selectedOption ? ` (Opsi ${c.selectedOption})` : ''}
              </span>
            )}
          </div>

          <h4 className="font-display font-bold text-xs text-[#253451] truncate">
            {c.title}
          </h4>
          <p className="text-[11px] text-[#253451]/70 line-clamp-2 leading-snug mt-0.5">
            {c.description}
          </p>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setCarouselIndex(idx);
            openModal('CRISIS_DETAIL', { card: c, playerId: activePlayer?.id });
          }}
          className={`px-2.5 py-1.5 rounded-xl text-[10px] font-extrabold uppercase tracking-wider transition shrink-0 ${
            isResolved
              ? 'bg-slate-200 hover:bg-slate-300 text-slate-700'
              : 'bg-red-600 hover:bg-red-700 text-white shadow-2xs'
          }`}
        >
          {isResolved ? 'Detail' : 'Tangani'}
        </button>
      </div>
    );
  };

  const renderOpportunityCard = (c: OpportunityCard, idx: number, isSelected: boolean) => {
    const runningOwner = players.find(p =>
      (p.activeOpportunities || []).some(o => o.id === c.id)
    );
    const assignedPlayer = runningOwner || (c.assignedPlayerId ? players.find(p => p.id === c.assignedPlayerId) : undefined);
    const isUsed = c.isUsed && !c.isReusable && !runningOwner;
    const statusLabel: CardStatusLabel = isUsed ? 'Used' : 'Active';

    const effectSummary = [
      c.costGB > 0 ? `Biaya ${c.costGB} GB` : 'Gratis',
      c.immediatePoints > 0 ? `+${c.immediatePoints} VP` : '',
      c.recurringGB > 0 ? `+${c.recurringGB} GB/siklus` : '',
      c.isPermanent || c.durationCycles === 0 ? 'Permanen' : `${c.durationCycles} siklus`,
    ].filter(Boolean).join(' • ');

    return (
      <div
        key={c.id}
        onClick={() => setCarouselIndex(idx)}
        className={`p-2.5 rounded-2xl border transition cursor-pointer flex items-center gap-2.5 ${
          isSelected
            ? 'bg-amber-50/75 border-amber-400 ring-2 ring-amber-200 shadow-xs'
            : isUsed
              ? 'bg-slate-50/80 border-slate-200 opacity-75 hover:opacity-100'
              : 'bg-white border-[#EAE9E3] hover:border-amber-300 hover:bg-amber-50/35 shadow-2xs'
        }`}
      >
        <div className="w-11 h-16 bg-[#F8F5EC] rounded-xl overflow-hidden border border-[#EAE9E3] shrink-0 p-0.5 flex items-center justify-center">
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
          <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
            <span className="font-mono text-[10px] font-black text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
              {c.code}
            </span>
            <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded border ${STATUS_BADGE_STYLES[statusLabel]}`}>
              {statusLabel}
            </span>
            {c.targetCategory && (
              <span className="inline-flex items-center gap-0.5 text-[9px] font-extrabold uppercase bg-amber-100/80 text-amber-900 px-1.5 py-0.5 rounded border border-amber-300">
                <CategoryLogo category={c.targetCategory} size="xs" />
                <span>{CATEGORY_NAMES[c.targetCategory]}</span>
              </span>
            )}
            {assignedPlayer && (
              <span className="text-[9px] font-bold text-[#253451]/65 truncate">
                • {assignedPlayer.name}
              </span>
            )}
          </div>

          <h4 className="font-display font-bold text-xs text-[#253451] truncate">
            {c.title}
          </h4>
          <p className="text-[11px] text-[#253451]/70 line-clamp-1 leading-snug mt-0.5">
            {c.description}
          </p>
          <div className="text-[10px] font-mono font-bold text-amber-800 mt-0.5 truncate">
            {effectSummary}
          </div>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setCarouselIndex(idx);
            openModal('OPPORTUNITY_DETAIL', { card: c, playerId: assignedPlayer?.id || activePlayer?.id });
          }}
          className={`px-2.5 py-1.5 rounded-xl text-[10px] font-extrabold uppercase tracking-wider transition shrink-0 ${
            c.isUsed && !c.isReusable
              ? 'bg-slate-200 hover:bg-slate-300 text-slate-700'
              : 'bg-amber-500 hover:bg-amber-600 text-white shadow-2xs'
          }`}
        >
          {c.isUsed && !c.isReusable ? 'Detail' : 'Aktifkan'}
        </button>
      </div>
    );
  };

  const renderMissionCard = (c: MissionCard, idx: number, isSelected: boolean) => {
    const isCompleted = c.status === 'completed';
    const statusLabel: CardStatusLabel = isCompleted ? 'Completed' : 'Active';
    const assignedPlayer = c.assignedPlayerId
      ? players.find(p => p.id === c.assignedPlayerId)
      : undefined;

    let progressText = '';
    if (assignedPlayer && c.conditionType === 'own_category_count' && c.targetCategory) {
      const count = territories.filter(t => t.ownerId === assignedPlayer.id && t.category === c.targetCategory).length;
      progressText = ` • Progres ${count}/${c.targetCount || 1}`;
    }

    const rewardSummary = [
      `Hadiah +${c.rewardPoints} VP`,
      c.rewardGB > 0 ? `+${c.rewardGB} GB` : '',
    ].filter(Boolean).join(' • ');

    return (
      <div
        key={c.id}
        onClick={() => setCarouselIndex(idx)}
        className={`p-2.5 rounded-2xl border transition cursor-pointer flex items-center gap-2.5 ${
          isSelected
            ? 'bg-emerald-50/75 border-emerald-400 ring-2 ring-emerald-200 shadow-xs'
            : isCompleted
              ? 'bg-blue-50/40 border-blue-200/80 opacity-85 hover:opacity-100'
              : 'bg-white border-[#EAE9E3] hover:border-emerald-300 hover:bg-emerald-50/35 shadow-2xs'
        }`}
      >
        <div className="w-11 h-16 bg-[#F8F5EC] rounded-xl overflow-hidden border border-[#EAE9E3] shrink-0 p-0.5 flex items-center justify-center">
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
          <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
            <span className="font-mono text-[10px] font-black text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
              {c.code}
            </span>
            <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded border ${STATUS_BADGE_STYLES[statusLabel]}`}>
              {statusLabel}
            </span>
            {assignedPlayer && (
              <span className="text-[9px] font-bold text-[#253451]/70 truncate">
                • {assignedPlayer.name}{progressText}
              </span>
            )}
          </div>

          <h4 className="font-display font-bold text-xs text-[#253451] truncate">
            {c.title}
          </h4>
          <p className="text-[11px] text-[#253451]/70 line-clamp-1 leading-snug mt-0.5">
            {c.description}
          </p>
          <div className="text-[10px] font-mono font-bold text-emerald-700 mt-0.5 truncate">
            {rewardSummary}
          </div>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setCarouselIndex(idx);
            openModal('MISSION_DETAIL', { card: c, playerId: c.assignedPlayerId || activePlayer?.id });
          }}
          className={`px-2.5 py-1.5 rounded-xl text-[10px] font-extrabold uppercase tracking-wider transition shrink-0 ${
            isCompleted
              ? 'bg-blue-100 hover:bg-blue-200 text-blue-800'
              : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs'
          }`}
        >
          {isCompleted ? 'Detail' : c.status === 'active' ? 'Progres' : 'Ambil'}
        </button>
      </div>
    );
  };

  const currentListCount =
    activeTab === 'policy' ? filteredPolicy.length :
    activeTab === 'crisis' ? filteredCrisis.length :
    activeTab === 'opportunity' ? filteredOpportunity.length :
    filteredMission.length;

  const safeIndex = currentListCount > 0 ? Math.min(carouselIndex, currentListCount - 1) : 0;

  // Build normalized showcase metadata for the active carousel card
  const featuredCard = useMemo(() => {
    if (currentListCount === 0) return null;

    if (activeTab === 'policy') {
      const c = filteredPolicy[safeIndex];
      const isUsed = c.isUsed && !c.isReusable;
      const statusLabel: CardStatusLabel = isUsed ? 'Used' : 'Active';
      const matchedTerritory = c.targetTerritoryId ? territories.find(t => t.id === c.targetTerritoryId) : undefined;
      const territoryOwner = matchedTerritory?.ownerId ? players.find(p => p.id === matchedTerritory.ownerId) : undefined;
      const usedByPlayer = c.usedByPlayerId ? players.find(p => p.id === c.usedByPlayerId) : undefined;
      const catKey = (matchedTerritory?.category || (c.category !== 'free_choice' ? c.category : undefined)) as TerritoryCategory | undefined;
      const catConfig = catKey ? economyConfig[catKey] : undefined;
      const cost = catConfig?.claimCost ?? matchedTerritory?.claimCost ?? c.claimCost;
      const baseVP = catConfig?.basePoints ?? matchedTerritory?.basePoints;
      const baseIncome = catConfig?.baseIncome ?? matchedTerritory?.baseIncome;

      const description = c.isFreeChoice
        ? 'Bebas pilih & klaim 1 wilayah kosong mana saja di peta (biaya mengikuti sektor wilayah).'
        : matchedTerritory
          ? `Klaim ${matchedTerritory.name} (${CATEGORY_NAMES[matchedTerritory.category]}): Biaya ${cost} GB • +${baseVP} VP • +${baseIncome} GB/siklus.`
          : `Kartu Policy sektor ${c.category.toUpperCase()} untuk klaim wilayah (Biaya ${cost} GB).`;

      return {
        image: getCardAsset(c.image, POLICY_CARD_BACK),
        fallbackImage: POLICY_CARD_BACK,
        code: c.code,
        codeClass: 'text-[#253451] bg-white border-[#EAE9E3]',
        title: c.name,
        description,
        statusLabel,
        metaPill: c.isFreeChoice ? 'Bebas Pilih' : catKey ? CATEGORY_NAMES[catKey] : undefined,
        ownerLabel: (usedByPlayer || territoryOwner)?.name,
        actionLabel: isUsed ? 'Detail Kartu' : 'Gunakan Kartu',
        actionClass: isUsed
          ? 'bg-slate-200 hover:bg-slate-300 text-slate-800'
          : 'bg-[#253451] hover:bg-[#1C273D] text-[#F4CE70]',
        onAction: () =>
          openModal('QUICK_CARD_ENTRY', {
            playerId: claimTurnPlayer?.id || activePlayer?.id,
            rollerId: claimTurnPlayer?.id || undefined,
            cardCode: c.code,
          }),
      };
    }

    if (activeTab === 'crisis') {
      const c = filteredCrisis[safeIndex];
      const isResolved = c.isUsed && !c.isReusable;
      const statusLabel: CardStatusLabel = isResolved ? 'Used' : 'Active';
      const resolvedBy = c.usedByPlayerId ? players.find(p => p.id === c.usedByPlayerId) : undefined;

      return {
        image: getCardAsset(c.image, EVENT_CARD_BACK),
        fallbackImage: EVENT_CARD_BACK,
        code: c.code,
        codeClass: 'text-red-700 bg-red-50 border-red-200',
        title: c.title,
        description: c.description,
        statusLabel,
        metaPill: 'Crisis Nasional',
        ownerLabel: resolvedBy ? `${resolvedBy.name}${c.selectedOption ? ` (Opsi ${c.selectedOption})` : ''}` : undefined,
        actionLabel: isResolved ? 'Detail Krisis' : 'Tangani Krisis',
        actionClass: isResolved
          ? 'bg-slate-200 hover:bg-slate-300 text-slate-800'
          : 'bg-red-600 hover:bg-red-700 text-white',
        onAction: () => openModal('CRISIS_DETAIL', { card: c, playerId: activePlayer?.id }),
      };
    }

    if (activeTab === 'opportunity') {
      const c = filteredOpportunity[safeIndex];
      const runningOwner = players.find(p => (p.activeOpportunities || []).some(o => o.id === c.id));
      const assignedPlayer = runningOwner || (c.assignedPlayerId ? players.find(p => p.id === c.assignedPlayerId) : undefined);
      const isUsed = c.isUsed && !c.isReusable && !runningOwner;
      const statusLabel: CardStatusLabel = isUsed ? 'Used' : 'Active';
      const effectSummary = [
        c.costGB > 0 ? `Biaya ${c.costGB} GB` : 'Gratis',
        c.immediatePoints > 0 ? `+${c.immediatePoints} VP` : '',
        c.recurringGB > 0 ? `+${c.recurringGB} GB/siklus` : '',
        c.isPermanent || c.durationCycles === 0 ? 'Permanen' : `${c.durationCycles} siklus`,
      ].filter(Boolean).join(' • ');

      return {
        image: getCardAsset(c.image, EVENT_CARD_BACK),
        fallbackImage: EVENT_CARD_BACK,
        code: c.code,
        codeClass: 'text-amber-800 bg-amber-50 border-amber-200',
        title: c.title,
        description: `${c.description}${effectSummary ? ` (${effectSummary})` : ''}`,
        statusLabel,
        metaPill: c.targetCategory ? CATEGORY_NAMES[c.targetCategory] : 'Stimulus',
        ownerLabel: assignedPlayer?.name,
        actionLabel: isUsed ? 'Detail Kartu' : 'Gunakan Kartu',
        actionClass: isUsed
          ? 'bg-slate-200 hover:bg-slate-300 text-slate-800'
          : 'bg-amber-500 hover:bg-amber-600 text-white',
        onAction: () => openModal('OPPORTUNITY_DETAIL', { card: c, playerId: assignedPlayer?.id || activePlayer?.id }),
      };
    }

    const c = filteredMission[safeIndex];
    const isCompleted = c.status === 'completed';
    const statusLabel: CardStatusLabel = isCompleted ? 'Completed' : 'Active';
    const assignedPlayer = c.assignedPlayerId ? players.find(p => p.id === c.assignedPlayerId) : undefined;
    const rewardSummary = [
      `Hadiah +${c.rewardPoints} VP`,
      c.rewardGB > 0 ? `+${c.rewardGB} GB` : '',
    ].filter(Boolean).join(' • ');

    return {
      image: getCardAsset(c.image, EVENT_CARD_BACK),
      fallbackImage: EVENT_CARD_BACK,
      code: c.code,
      codeClass: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      title: c.title,
      description: `${c.description} (${rewardSummary})`,
      statusLabel,
      metaPill: 'Mission Quest',
      ownerLabel: assignedPlayer?.name,
      actionLabel: isCompleted ? 'Detail Misi' : c.status === 'active' ? 'Kelola Misi' : 'Ambil Misi',
      actionClass: isCompleted
        ? 'bg-blue-100 hover:bg-blue-200 text-blue-800'
        : 'bg-emerald-600 hover:bg-emerald-700 text-white',
      onAction: () => openModal('MISSION_DETAIL', { card: c, playerId: c.assignedPlayerId || activePlayer?.id }),
    };
  }, [
    activeTab,
    currentListCount,
    safeIndex,
    filteredPolicy,
    filteredCrisis,
    filteredOpportunity,
    filteredMission,
    territories,
    players,
    economyConfig,
    claimTurnPlayer,
    activePlayer,
    openModal,
  ]);

  // Compact pagination window (up to 5 page numbers)
  const paginationPages = useMemo(() => {
    if (currentListCount <= 5) {
      return Array.from({ length: currentListCount }, (_, i) => i);
    }
    let start = Math.max(0, safeIndex - 2);
    const end = Math.min(currentListCount - 1, start + 4);
    start = Math.max(0, end - 4);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, [currentListCount, safeIndex]);

  return (
    <section
      id="event-card-center"
      className="flex-1 bg-white rounded-3xl border border-[#EAE9E3] shadow-soft-sm p-3.5 sm:p-4 flex flex-col gap-2.5 min-w-0"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2 pb-2 border-b border-[#EAE9E3]">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-xl bg-[#253451] text-[#F4CE70] flex items-center justify-center shrink-0">
            <Layers className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <h2 className="font-display font-black text-xs sm:text-sm text-[#253451] uppercase tracking-wide truncate">
              EVENT CARD CENTER
            </h2>
            <p className="text-[10px] text-[#253451]/60 font-bold truncate">
              Pusat pengelolaan kartu Claim, Crisis, Opportunity &amp; Mission
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() =>
            openModal('QUICK_CARD_ENTRY', {
              playerId: claimTurnPlayer?.id || activePlayer?.id,
              rollerId: claimTurnPlayer?.id || undefined,
            })
          }
          className="px-2.5 py-1.5 rounded-xl bg-[#253451] hover:bg-[#1C273D] text-[#F4CE70] text-[10px] font-extrabold uppercase tracking-wider transition shadow-2xs flex items-center gap-1.5 shrink-0"
          title="Input cepat kode kartu fisik"
        >
          <QrCode className="w-3.5 h-3.5" />
          <span>Input Kode</span>
        </button>
      </div>

      {/* Ongoing Quests & Stimulus Compact Strip (rendered only when active items exist) */}
      {totalOngoingCount > 0 && (
        <div className="bg-[#F8F5EC] rounded-2xl border border-[#EAE9E3] p-2 space-y-1.5">
          <div className="flex items-center justify-between px-0.5">
            <span className="text-[10px] font-display font-black text-[#253451] uppercase tracking-wide flex items-center gap-1">
              <ClipboardList className="w-3 h-3 text-emerald-600" />
              <span>Quest &amp; Stimulus Aktif ({totalOngoingCount})</span>
            </span>
            <span className="text-[9px] font-bold text-[#253451]/55">Klik untuk kelola</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-[76px] overflow-y-auto pr-0.5">
            {activeMissions.map(({ player, mission }) => {
              const fullMission = missionCards.find(m => m.id === mission.id);
              return (
                <button
                  key={`ecc-mis-${player.id}-${mission.id}`}
                  type="button"
                  onClick={() => openModal('MISSION_DETAIL', { card: fullMission || mission, playerId: player.id })}
                  className="text-left bg-white hover:bg-emerald-50/70 border border-emerald-200 rounded-xl px-2 py-1 transition flex items-center justify-between gap-1.5"
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <div className="w-4 h-4 rounded-full overflow-hidden shrink-0">
                      <PlayerLogo player={player} size="full" showBadge={false} />
                    </div>
                    <span className="font-mono text-[9px] font-black text-emerald-700 shrink-0">{mission.code}</span>
                    <span className="text-[10px] font-bold text-[#253451] truncate">{mission.title}</span>
                  </div>
                  <span className="font-mono text-[9px] font-black text-emerald-700 shrink-0">+{mission.rewardPoints} VP</span>
                </button>
              );
            })}

            {activeOpportunities.map(({ player, opp }) => {
              const fullOpp = opportunityCards.find(o => o.id === opp.id);
              return (
                <button
                  key={`ecc-opp-${player.id}-${opp.id}`}
                  type="button"
                  onClick={() => openModal('OPPORTUNITY_DETAIL', { card: fullOpp || opp, playerId: player.id })}
                  className="text-left bg-white hover:bg-amber-50/70 border border-amber-200 rounded-xl px-2 py-1 transition flex items-center justify-between gap-1.5"
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <div className="w-4 h-4 rounded-full overflow-hidden shrink-0">
                      <PlayerLogo player={player} size="full" showBadge={false} />
                    </div>
                    <span className="font-mono text-[9px] font-black text-amber-700 shrink-0">{opp.code}</span>
                    <span className="text-[10px] font-bold text-[#253451] truncate">{opp.title}</span>
                  </div>
                  <span className="font-mono text-[9px] font-black text-amber-800 shrink-0">
                    {opp.recurringGB > 0 ? `+${opp.recurringGB} GB` : opp.isPermanent ? 'Perm' : `${opp.remainingCycles}cy`}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 4 Category Tabs */}
      <div className="grid grid-cols-2 gap-1.5 bg-[#F8F5EC] p-1.5 rounded-2xl border border-[#EAE9E3]">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setActiveTab(tab.id);
                setSearchQuery('');
                setStatusFilter('all');
              }}
              className={`px-2.5 py-1.5 rounded-xl text-[10px] sm:text-[11px] font-extrabold transition flex items-center justify-between gap-1.5 ${
                isActive ? tab.activeClass : tab.idleClass
              }`}
            >
              <span className="flex items-center gap-1.5 min-w-0">
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{tab.label}</span>
              </span>
              <span className={`font-mono text-[10px] font-black px-1.5 py-0.2 rounded-md shrink-0 ${
                isActive ? tab.badgeActive : tab.badgeIdle
              }`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Compact Search, Status Filter & Live Count */}
      <div className="flex flex-wrap items-center gap-1.5">
        <div className="relative flex-1 min-w-[140px]">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={
              activeTab === 'policy'
                ? 'Cari kode (POL-01, SBS-01)...'
                : activeTab === 'crisis'
                  ? 'Cari kode (CRS-01)...'
                  : activeTab === 'opportunity'
                    ? 'Cari kode (OPP-01)...'
                    : 'Cari kode (MIS-01)...'
            }
            className="w-full bg-[#F8F5EC] border border-[#EAE9E3] focus:border-[#253451] rounded-xl px-3 py-1.5 pl-8 text-xs font-bold text-[#253451] outline-none"
          />
          <Search className="w-3.5 h-3.5 text-[#253451]/40 absolute left-2.5 top-2" />
        </div>

        {activeTab === 'policy' && (
          <select
            value={policySectorFilter}
            onChange={e => setPolicySectorFilter(e.target.value)}
            className="bg-[#F8F5EC] border border-[#EAE9E3] rounded-xl px-2 py-1.5 text-[10px] font-bold text-[#253451] outline-none cursor-pointer"
          >
            <option value="all">Semua Sektor</option>
            <option value="free_choice">Bebas Pilih</option>
            <option value="politics">Politics</option>
            <option value="industry">Industry</option>
            <option value="education">Education</option>
            <option value="healthcare">Healthcare</option>
            <option value="agriculture">Agriculture</option>
            <option value="water">Water</option>
            <option value="tourism">Tourism</option>
            <option value="forest">Forest</option>
          </select>
        )}

        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value as StatusFilter)}
          className="bg-[#F8F5EC] border border-[#EAE9E3] rounded-xl px-2 py-1.5 text-[10px] font-bold text-[#253451] outline-none cursor-pointer"
        >
          <option value="all">Semua Status</option>
          <option value="active">Active</option>
          <option value="done">{activeTab === 'mission' ? 'Completed' : 'Used'}</option>
        </select>

        <span className="text-[10px] font-mono font-extrabold text-[#253451]/65 bg-[#F8F5EC] border border-[#EAE9E3] px-2 py-1.5 rounded-xl shrink-0">
          {activeTabMeta.count}/{activeTabMeta.total} Tersedia
        </span>
      </div>

      {/* Internal Scrollable Cards List */}
      <div className="h-[235px] sm:h-[265px] overflow-y-auto space-y-2 pr-1">
        {currentListCount === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-4 py-8 bg-[#F8F5EC] rounded-2xl border border-dashed border-[#EAE9E3] text-xs text-[#253451]/55 font-medium">
            <Layers className="w-6 h-6 text-[#253451]/25 mb-1.5" />
            <span>Tidak ada kartu yang cocok dengan filter pencarian.</span>
          </div>
        ) : (
          <>
            {activeTab === 'policy' && filteredPolicy.map((c, idx) => renderPolicyCard(c, idx, idx === safeIndex))}
            {activeTab === 'crisis' && filteredCrisis.map((c, idx) => renderCrisisCard(c, idx, idx === safeIndex))}
            {activeTab === 'opportunity' && filteredOpportunity.map((c, idx) => renderOpportunityCard(c, idx, idx === safeIndex))}
            {activeTab === 'mission' && filteredMission.map((c, idx) => renderMissionCard(c, idx, idx === safeIndex))}
          </>
        )}
      </div>

      {/* Interactive Card Carousel & Pagination Viewer (fills remaining panel space cleanly) */}
      <div
        id="event-card-carousel"
        className="flex-1 min-h-[270px] bg-[#F8F5EC] rounded-2xl border border-[#EAE9E3] p-3 flex flex-col justify-between gap-2.5"
      >
        <div className="flex items-center justify-between gap-2 pb-2 border-b border-[#EAE9E3]">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-[10px] font-display font-black text-[#253451] uppercase tracking-wider truncate">
              Detail &amp; Pratinjau Kartu
            </span>
            {currentListCount > 0 && (
              <span className="font-mono text-[10px] font-extrabold text-[#253451]/70 bg-white border border-[#EAE9E3] px-1.5 py-0.5 rounded-md shrink-0">
                {safeIndex + 1} / {currentListCount}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => setCarouselIndex(i => (i > 0 ? i - 1 : Math.max(0, currentListCount - 1)))}
              disabled={currentListCount <= 1}
              aria-label="Kartu sebelumnya"
              title="Kartu sebelumnya"
              className="p-1.5 rounded-lg bg-white hover:bg-[#EAE9E3] border border-[#EAE9E3] text-[#253451] transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setCarouselIndex(i => (i < currentListCount - 1 ? i + 1 : 0))}
              disabled={currentListCount <= 1}
              aria-label="Kartu berikutnya"
              title="Kartu berikutnya"
              className="p-1.5 rounded-lg bg-white hover:bg-[#EAE9E3] border border-[#EAE9E3] text-[#253451] transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {featuredCard ? (
          <>
            <div className="flex-1 flex flex-col sm:flex-row items-center sm:items-stretch gap-3 min-w-0">
              <div className="w-28 sm:w-32 h-40 sm:h-44 bg-white rounded-2xl border border-[#EAE9E3] p-1.5 shadow-xs shrink-0 flex items-center justify-center self-center">
                <img
                  src={featuredCard.image}
                  alt={featuredCard.title}
                  className="w-full h-full object-contain rounded-xl"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = featuredCard.fallbackImage;
                  }}
                />
              </div>

              <div className="flex-1 min-w-0 w-full flex flex-col justify-between gap-2">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`font-mono text-[10px] font-black px-1.5 py-0.5 rounded border ${featuredCard.codeClass}`}>
                      {featuredCard.code}
                    </span>
                    <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded border ${STATUS_BADGE_STYLES[featuredCard.statusLabel]}`}>
                      {featuredCard.statusLabel}
                    </span>
                    {featuredCard.metaPill && (
                      <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-white text-[#253451]/80 border border-[#EAE9E3]">
                        {featuredCard.metaPill}
                      </span>
                    )}
                    {featuredCard.ownerLabel && (
                      <span className="text-[10px] font-bold text-[#253451]/70">
                        • {featuredCard.ownerLabel}
                      </span>
                    )}
                  </div>

                  <h3 className="font-display font-black text-sm text-[#253451] leading-snug break-words">
                    {featuredCard.title}
                  </h3>

                  <p className="text-[11px] text-[#253451]/80 leading-relaxed break-words">
                    {featuredCard.description}
                  </p>
                </div>

                <div className="pt-1">
                  <button
                    type="button"
                    onClick={featuredCard.onAction}
                    className={`w-full sm:w-auto px-4 py-2 rounded-xl text-[11px] font-extrabold uppercase tracking-wider transition shadow-2xs ${featuredCard.actionClass}`}
                  >
                    {featuredCard.actionLabel}
                  </button>
                </div>
              </div>
            </div>

            {currentListCount > 1 && (
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#EAE9E3]">
                <button
                  type="button"
                  onClick={() => setCarouselIndex(i => (i > 0 ? i - 1 : currentListCount - 1))}
                  className="px-2.5 py-1 rounded-lg bg-white hover:bg-[#EAE9E3] border border-[#EAE9E3] text-[10px] font-extrabold text-[#253451] transition flex items-center gap-1"
                >
                  <ChevronLeft className="w-3 h-3" />
                  <span>Sebelumnya</span>
                </button>

                <div className="flex items-center gap-1 flex-wrap justify-center">
                  {paginationPages.map(pageIdx => (
                    <button
                      key={pageIdx}
                      type="button"
                      onClick={() => setCarouselIndex(pageIdx)}
                      className={`min-w-[24px] h-6 px-1.5 rounded-lg font-mono text-[10px] font-black transition ${
                        pageIdx === safeIndex
                          ? 'bg-[#253451] text-[#F4CE70] shadow-2xs'
                          : 'bg-white hover:bg-[#EAE9E3] text-[#253451]/75 border border-[#EAE9E3]'
                      }`}
                    >
                      {pageIdx + 1}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setCarouselIndex(i => (i < currentListCount - 1 ? i + 1 : 0))}
                  className="px-2.5 py-1 rounded-lg bg-white hover:bg-[#EAE9E3] border border-[#EAE9E3] text-[10px] font-extrabold text-[#253451] transition flex items-center gap-1"
                >
                  <span>Berikutnya</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-6 text-xs text-[#253451]/55 font-medium">
            <Layers className="w-6 h-6 text-[#253451]/25 mb-1.5" />
            <span>Pilih atau ubah filter untuk melihat pratinjau kartu.</span>
          </div>
        )}
      </div>
    </section>
  );
};
