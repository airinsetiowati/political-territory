import React from 'react';
import { 
  Users, 
  Coins, 
  Award, 
  Flag, 
  Sparkles, 
  SlidersHorizontal,
  PlusCircle,
  QrCode
} from 'lucide-react';
import { useGame } from '../context/GameContext';
import { CategoryLogo } from './CategoryLogo';
import { PlayerLogo } from './PlayerLogo';
import { TerritoryCategory } from '../types/game';

export const PlayerOverviewSection: React.FC = () => {
  const { 
    players, 
    territories, 
    calculatePlayerIncome, 
    calculatePlayerVictoryPoints, 
    openModal 
  } = useGame();

  const getPawnColorBadge = (color: string) => {
    switch (color) {
      case 'red': return { bg: 'bg-[#EF4444]', text: 'Pion Merah', border: 'border-red-400', ring: 'ring-red-200' };
      case 'blue': return { bg: 'bg-[#3B82F6]', text: 'Pion Biru', border: 'border-blue-400', ring: 'ring-blue-200' };
      case 'green': return { bg: 'bg-[#10B981]', text: 'Pion Hijau', border: 'border-emerald-400', ring: 'ring-emerald-200' };
      default: return { bg: 'bg-[#F59E0B]', text: 'Pion Kuning', border: 'border-amber-400', ring: 'ring-amber-200' };
    }
  };

  return (
    <div id="timer-players-section" className="bg-white rounded-3xl border border-[#EAE9E3] shadow-soft-sm p-4 sm:p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#EAE9E3]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#F8F5EC] border border-[#EAE9E3] flex items-center justify-center">
            <Users className="w-4 h-4 text-[#253451]" />
          </div>
          <div>
            <h3 className="font-display font-black text-sm text-[#253451] uppercase tracking-wide">
              Player Overview ({players.length} Pemain)
            </h3>
            <span className="text-[10px] text-[#253451]/60 font-bold">
              Status Modal GB, Victory Points, dan Kepemilikan Wilayah
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => openModal('QUICK_CARD_ENTRY')}
          className="px-3 py-1.5 rounded-xl bg-[#F8F5EC] hover:bg-[#EAE9E3] border border-[#EAE9E3] text-xs font-bold text-[#253451] flex items-center gap-1.5 transition shadow-2xs"
          title="Input cepat kode kartu fisik (Policy, Crisis, Opportunity, Mission)"
        >
          <QrCode className="w-3.5 h-3.5 text-[#EF956F]" />
          <span className="hidden sm:inline">Input Kode Kartu</span>
        </button>
      </div>

      {/* Players Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {players.map(p => {
          const badge = getPawnColorBadge(p.color);
          const owned = territories.filter(t => t.ownerId === p.id);
          const income = calculatePlayerIncome(p);
          const vpBreakdown = calculatePlayerVictoryPoints(p);

          // Get unique categories owned
          const uniqueCats = Array.from(new Set(owned.map(t => t.category))) as TerritoryCategory[];

          return (
            <div
              key={p.id}
              className="bg-[#F8F5EC] border border-[#EAE9E3] rounded-2xl p-3.5 flex flex-col justify-between space-y-2.5 relative hover:border-[#253451]/30 transition shadow-2xs"
            >
              {/* Player Top row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-4 h-4 shrink-0">
                    <PlayerLogo player={p} size="full" showBadge={false} />
                  </div>
                  <span className="font-display font-black text-sm text-[#253451] truncate">
                    {p.name}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => openModal('MANUAL_ADJUSTMENT', { playerId: p.id })}
                  className="p-1 text-[#253451]/40 hover:text-[#253451] hover:bg-white rounded-lg transition"
                  title="Sesuaikan GB atau VP pemain ini secara manual"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Stats Matrix: GB, VP, Territories */}
              <div className="grid grid-cols-3 gap-1.5 bg-white p-2 rounded-xl border border-[#EAE9E3] text-center font-mono">
                <div>
                  <div className="text-[9px] font-extrabold uppercase tracking-wider text-[#253451]/50 flex items-center justify-center gap-0.5">
                    <Coins className="w-2.5 h-2.5 text-[#F4CE70]" />
                    <span>GB</span>
                  </div>
                  <div className="text-base font-black text-[#253451]">{p.budget}</div>
                  <div className="text-[8px] text-[#73B77A] font-bold">+{income.totalIncome}/cy</div>
                </div>

                <div>
                  <div className="text-[9px] font-extrabold uppercase tracking-wider text-[#253451]/50 flex items-center justify-center gap-0.5">
                    <Award className="w-2.5 h-2.5 text-[#3B82F6]" />
                    <span>VP</span>
                  </div>
                  <div className="text-base font-black text-[#3B82F6]">{vpBreakdown.totalVP}</div>
                  <div className="text-[8px] text-[#253451]/50 font-bold">{vpBreakdown.territoryVP} terr</div>
                </div>

                <div>
                  <div className="text-[9px] font-extrabold uppercase tracking-wider text-[#253451]/50 flex items-center justify-center gap-0.5">
                    <Flag className="w-2.5 h-2.5 text-[#EF956F]" />
                    <span>Wilayah</span>
                  </div>
                  <div className="text-base font-black text-[#253451]">{owned.length}</div>
                  <div className="text-[8px] text-[#253451]/50 font-bold">/ 40</div>
                </div>
              </div>

              {/* Owned Category Logos mini chips */}
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-[#253451]/60 font-bold">Sektor Dikuasai:</span>
                <div className="flex items-center gap-1">
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
    </div>
  );
};
