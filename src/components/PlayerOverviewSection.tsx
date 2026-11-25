import React from 'react';
import {
  Users,
  Coins,
  Award,
  Flag,
  SlidersHorizontal
} from 'lucide-react';
import { useGame } from '../context/GameContext';
import { CategoryLogo } from './CategoryLogo';
import { PlayerLogo } from './PlayerLogo';
import { TerritoryCategory } from '../types/game';

export const PlayerOverviewSection: React.FC = () => {
  const {
    players,
    activePlayer,
    claimTurnPlayer,
    territories,
    calculatePlayerIncome,
    calculatePlayerVictoryPoints,
    openModal
  } = useGame();

  const getPawnColorBadge = (color: string) => {
    switch (color) {
      case 'red': return { text: 'Merah' };
      case 'blue': return { text: 'Biru' };
      case 'green': return { text: 'Hijau' };
      default: return { text: 'Kuning' };
    }
  };

  return (
    <section id="timer-players-section" className="bg-white rounded-3xl border border-[#EAE9E3] shadow-soft-sm p-3.5 sm:p-4 flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-[#EAE9E3]">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-xl bg-[#F8F5EC] border border-[#EAE9E3] flex items-center justify-center shrink-0">
            <Users className="w-3.5 h-3.5 text-[#253451]" />
          </div>
          <div className="min-w-0">
            <h3 className="font-display font-black text-xs sm:text-sm text-[#253451] uppercase tracking-wide truncate">
              Status Pemain ({players.length})
            </h3>
            <span className="text-[10px] text-[#253451]/60 font-bold block truncate">
              Modal GB, Victory Points &amp; Wilayah
            </span>
          </div>
        </div>

        <span className="text-[10px] font-mono font-extrabold px-2 py-0.5 rounded-full bg-[#F8F5EC] border border-[#EAE9E3] text-[#253451]/75 shrink-0">
          {territories.filter(t => t.ownerId !== null).length}/40 Klaim
        </span>
      </div>

      {/* Players Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {players.map(p => {
          const badge = getPawnColorBadge(p.color);
          const owned = territories.filter(t => t.ownerId === p.id);
          const income = calculatePlayerIncome(p);
          const vpBreakdown = calculatePlayerVictoryPoints(p);
          const isActive = p.id === (claimTurnPlayer || activePlayer)?.id;
          const uniqueCats = Array.from(new Set(owned.map(t => t.category))) as TerritoryCategory[];

          return (
            <div
              key={p.id}
              className={`border rounded-2xl p-2.5 flex flex-col justify-between gap-2 relative transition shadow-2xs ${
                isActive
                  ? 'bg-white border-[#253451] ring-2 ring-[#253451]/15 shadow-soft-sm'
                  : 'bg-[#F8F5EC] border-[#EAE9E3] hover:border-[#253451]/30'
              }`}
            >
              {/* Player Top Row */}
              <div className="flex items-center justify-between gap-1">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-6 h-6 shrink-0 rounded-full overflow-hidden bg-white border border-[#EAE9E3]">
                    <PlayerLogo player={p} size="full" showBadge={false} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="block font-display font-black text-xs sm:text-sm text-[#253451] truncate leading-tight">
                        {p.name}
                      </span>
                      {isActive && (
                        <span className="text-[8px] font-mono font-black uppercase px-1.5 py-0.2 rounded-full bg-[#73B77A]/20 text-[#2e6d34] border border-[#73B77A]/30 shrink-0">
                          Aktif
                        </span>
                      )}
                    </div>
                    <span className="block text-[9px] font-bold uppercase tracking-wider text-[#253451]/45">
                      Pion {badge.text}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => openModal('MANUAL_ADJUSTMENT', { playerId: p.id })}
                  className="p-1 text-[#253451]/40 hover:text-[#253451] hover:bg-white rounded-lg transition shrink-0"
                  title="Sesuaikan GB atau VP pemain ini secara manual"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Stats Matrix: GB, VP, Territories */}
              <div className="grid grid-cols-3 gap-1 bg-white p-1.5 rounded-xl border border-[#EAE9E3] text-center font-mono">
                <div>
                  <div className="text-[9px] font-extrabold uppercase tracking-wider text-[#253451]/50 flex items-center justify-center gap-0.5">
                    <Coins className="w-2.5 h-2.5 text-[#F4CE70]" />
                    <span>GB</span>
                  </div>
                  <div className="text-sm sm:text-base font-black text-[#253451] leading-tight">{p.budget}</div>
                  <div className="text-[8px] text-[#73B77A] font-bold">+{income.totalIncome}/cy</div>
                </div>

                <div className="border-x border-[#EAE9E3]">
                  <div className="text-[9px] font-extrabold uppercase tracking-wider text-[#253451]/50 flex items-center justify-center gap-0.5">
                    <Award className="w-2.5 h-2.5 text-[#3B82F6]" />
                    <span>VP</span>
                  </div>
                  <div className="text-sm sm:text-base font-black text-[#3B82F6] leading-tight">{vpBreakdown.totalVP}</div>
                  <div className="text-[8px] text-[#253451]/50 font-bold">{vpBreakdown.territoryVP} terr</div>
                </div>

                <div>
                  <div className="text-[9px] font-extrabold uppercase tracking-wider text-[#253451]/50 flex items-center justify-center gap-0.5">
                    <Flag className="w-2.5 h-2.5 text-[#EF956F]" />
                    <span>Area</span>
                  </div>
                  <div className="text-sm sm:text-base font-black text-[#253451] leading-tight">{owned.length}</div>
                  <div className="text-[8px] text-[#253451]/50 font-bold">/ 40</div>
                </div>
              </div>

              {/* Owned Category Logos mini chips */}
              <div className="flex items-center justify-between gap-1 text-[10px] border-t border-[#EAE9E3] pt-1.5">
                <span className="text-[#253451]/60 font-bold shrink-0">Sektor:</span>
                <div className="flex items-center gap-0.5 justify-end flex-wrap">
                  {uniqueCats.length === 0 ? (
                    <span className="text-[#253451]/40 italic">Belum ada</span>
                  ) : (
                    uniqueCats.map(cat => (
                      <CategoryLogo key={cat} category={cat} size="xs" />
                    ))
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
