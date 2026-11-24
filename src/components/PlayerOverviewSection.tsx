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
    activePlayer,
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
    <div id="timer-players-section" className="bg-white rounded-3xl border border-[#EAE9E3] shadow-soft-sm p-4 sm:p-5 flex flex-col gap-3.5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#EAE9E3]">
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
          className="px-3 py-1.5 rounded-xl bg-[#253451] hover:bg-[#1C273D] text-white text-xs font-extrabold transition shadow-xs flex items-center gap-1.5"
          title="Input cepat kode kartu fisik (Policy, Crisis, Opportunity, Mission)"
        >
          <QrCode className="w-3.5 h-3.5 text-[#F4CE70]" />
          <span>Input Kode Kartu</span>
        </button>
      </div>

      {/* Players Cards Grid */}
      <div className="grid flex-1 grid-cols-1 sm:grid-cols-2 gap-2.5">
        {players.map(p => {
          const badge = getPawnColorBadge(p.color);
          const owned = territories.filter(t => t.ownerId === p.id);
          const income = calculatePlayerIncome(p);
          const vpBreakdown = calculatePlayerVictoryPoints(p);
          const isActive = p.id === activePlayer?.id;

          // Get unique categories owned
          const uniqueCats = Array.from(new Set(owned.map(t => t.category))) as TerritoryCategory[];

          return (
            <div
              key={p.id}
              className={`border rounded-2xl p-3 flex flex-col justify-between gap-2 relative transition shadow-2xs ${
                isActive 
                  ? 'bg-white border-[#253451] ring-2 ring-[#253451]/20 shadow-soft-sm' 
                  : 'bg-[#F8F5EC] border-[#EAE9E3] hover:border-[#253451]/30'
              }`}
            >
              {/* Player Top row */}
              <div className="flex items-center justify-between gap-1">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-6 h-6 shrink-0 rounded-full overflow-hidden bg-white border border-[#EAE9E3]">
                    <PlayerLogo player={p} size="full" showBadge={false} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="block font-display font-black text-sm text-[#253451] truncate leading-tight">
                        {p.name}
                      </span>
                      {isActive && (
                        <span className="text-[8px] font-mono font-black uppercase px-1.5 py-0.2 rounded-full bg-[#73B77A]/20 text-[#2e6d34] border border-[#73B77A]/30 shrink-0">
                          Giliran
                        </span>
                      )}
                    </div>
                    <span className="block text-[9px] font-bold uppercase tracking-wider text-[#253451]/45">
                      {badge.text}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => openModal('MANUAL_ADJUSTMENT', { playerId: p.id })}
                  className="p-1.5 text-[#253451]/40 hover:text-[#253451] hover:bg-white rounded-lg transition shrink-0"
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
                  <div className="text-base font-black text-[#253451] leading-tight">{p.budget}</div>
                  <div className="text-[8px] text-[#73B77A] font-bold">+{income.totalIncome}/cy</div>
                </div>

                <div className="border-x border-[#EAE9E3]">
                  <div className="text-[9px] font-extrabold uppercase tracking-wider text-[#253451]/50 flex items-center justify-center gap-0.5">
                    <Award className="w-2.5 h-2.5 text-[#3B82F6]" />
                    <span>VP</span>
                  </div>
                  <div className="text-base font-black text-[#3B82F6] leading-tight">{vpBreakdown.totalVP}</div>
                  <div className="text-[8px] text-[#253451]/50 font-bold">{vpBreakdown.territoryVP} terr</div>
                </div>

                <div>
                  <div className="text-[9px] font-extrabold uppercase tracking-wider text-[#253451]/50 flex items-center justify-center gap-0.5">
                    <Flag className="w-2.5 h-2.5 text-[#EF956F]" />
                    <span>Wilayah</span>
                  </div>
                  <div className="text-base font-black text-[#253451] leading-tight">{owned.length}</div>
                  <div className="text-[8px] text-[#253451]/50 font-bold">/ 40</div>
                </div>
              </div>

              {/* Owned Category Logos mini chips */}
              <div className="flex items-center justify-between gap-1 text-[10px] border-t border-[#EAE9E3] pt-2">
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
    </div>
  );
};
