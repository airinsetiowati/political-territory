import React, { useState } from 'react';
import { 
  Trophy, 
  Award, 
  Coins, 
  TrendingUp, 
  ArrowUpDown,
  Building2,
  SlidersHorizontal,
  Compass,
  Sparkles
} from 'lucide-react';
import { useGame } from '../context/GameContext';
import { TerritoryCategory } from '../types/game';
import { CategoryLogo } from '../components/CategoryLogo';

export const ScoreboardPage: React.FC = () => {
  const { 
    players, 
    territories, 
    calculatePlayerIncome, 
    calculatePlayerVictoryPoints,
    openModal 
  } = useGame();

  const [sortBy, setSortBy] = useState<'vp' | 'territories' | 'budget'>('vp');

  const playerRows = players.map(player => {
    const ownedTerrs = territories.filter(t => t.ownerId === player.id);
    const vpDetails = calculatePlayerVictoryPoints(player);
    const incomeDetails = calculatePlayerIncome(player);

    const categoryBreakdown: Record<TerritoryCategory, number> = {
      politics: 0,
      industry: 0,
      education: 0,
      healthcare: 0,
      agriculture: 0,
      water: 0,
      tourism: 0,
      forest: 0,
    };

    ownedTerrs.forEach(t => {
      categoryBreakdown[t.category] = (categoryBreakdown[t.category] || 0) + 1;
    });

    return {
      player,
      ownedTerrs,
      categoryBreakdown,
      territoryCount: ownedTerrs.length,
      territoryVP: vpDetails.territoryVP,
      cardVP: player.victoryPoints,
      totalVP: vpDetails.totalVP,
      budget: player.budget,
      baseIncome: incomeDetails.baseIncome,
      bonusIncome: incomeDetails.opportunityIncome,
      totalIncome: incomeDetails.totalIncome,
    };
  });

  // Dynamic sorting based on user selection
  playerRows.sort((a, b) => {
    if (sortBy === 'territories') {
      return b.territoryCount - a.territoryCount || b.totalVP - a.totalVP;
    }
    if (sortBy === 'budget') {
      return b.budget - a.budget || b.totalVP - a.totalVP;
    }
    return b.totalVP - a.totalVP || b.territoryCount - a.territoryCount;
  });

  const getRankBadge = (idx: number) => {
    if (idx === 0) return { icon: '🥇', label: '1st Leader', bg: 'bg-[#F4CE70]/20 text-[#253451] border-[#F4CE70]' };
    if (idx === 1) return { icon: '🥈', label: '2nd Place', bg: 'bg-[#8BBDE2]/20 text-[#253451] border-[#8BBDE2]' };
    if (idx === 2) return { icon: '🥉', label: '3rd Place', bg: 'bg-[#EF956F]/20 text-[#253451] border-[#EF956F]' };
    return { icon: `#${idx + 1}`, label: `Rank #${idx + 1}`, bg: 'bg-[#EAE9E3] text-[#253451] border-[#EAE9E3]' };
  };

  const getCategoryIcon = (cat: TerritoryCategory) => {
    switch (cat) {
      case 'politics': return '🏛️';
      case 'industry': return '🏭';
      case 'education': return '🎓';
      case 'healthcare': return '⚕️';
      case 'agriculture': return '🌾';
      case 'water': return '💧';
      case 'tourism': return '📷';
      case 'forest': return '🌲';
      default: return '📍';
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6 md:space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-[#EAE9E3] shadow-soft-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F8F5EC] text-xs font-extrabold text-[#253451] mb-2 border border-[#EAE9E3]">
            <span>🏆 Official Sovereign Standings</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-display font-black text-[#253451] tracking-tight">
            Leaderboard & Peringkat Pemain
          </h1>
          <p className="text-xs md:text-sm text-[#253451]/70 mt-1">
            Hierarki klasemen real-time: Victory Points (VP), Government Budget (GB), dan penguasaan sektor wilayah.
          </p>
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-1.5 bg-[#F8F5EC] border border-[#EAE9E3] rounded-2xl p-1.5 shadow-xs">
          <span className="text-xs font-extrabold text-[#253451]/60 px-2 flex items-center gap-1">
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Urutkan:</span>
          </span>

          <button
            onClick={() => setSortBy('vp')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              sortBy === 'vp'
                ? 'bg-[#253451] text-white shadow-xs'
                : 'text-[#253451]/70 hover:bg-white'
            }`}
          >
            <Award className="w-3.5 h-3.5 text-[#F4CE70]" />
            <span>Victory Points</span>
          </button>

          <button
            onClick={() => setSortBy('territories')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              sortBy === 'territories'
                ? 'bg-[#253451] text-white shadow-xs'
                : 'text-[#253451]/70 hover:bg-white'
            }`}
          >
            <Building2 className="w-3.5 h-3.5 text-[#8BBDE2]" />
            <span>Wilayah</span>
          </button>

          <button
            onClick={() => setSortBy('budget')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              sortBy === 'budget'
                ? 'bg-[#253451] text-white shadow-xs'
                : 'text-[#253451]/70 hover:bg-white'
            }`}
          >
            <Coins className="w-3.5 h-3.5 text-[#F4CE70]" />
            <span>Budget GB</span>
          </button>
        </div>
      </div>

      {/* Top Podium Showcase (1st, 2nd, 3rd) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {playerRows.slice(0, 3).map((row, idx) => {
          const rankInfo = getRankBadge(idx);
          const pawnEmoji = 
            row.player.color === 'red' ? '🔴' :
            row.player.color === 'blue' ? '🔵' :
            row.player.color === 'green' ? '🟢' : '🟡';

          return (
            <div
              key={row.player.id}
              className={`bg-white border-2 rounded-3xl p-6 shadow-soft-sm flex flex-col justify-between space-y-4 card-hover transition ${
                idx === 0 ? 'border-[#F4CE70] md:-translate-y-2' :
                idx === 1 ? 'border-[#8BBDE2]' :
                'border-[#EF956F]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border flex items-center gap-1.5 ${rankInfo.bg}`}>
                  <span className="text-base">{rankInfo.icon}</span>
                  <span>{rankInfo.label}</span>
                </span>

                <button
                  onClick={() => openModal('MANUAL_ADJUSTMENT', { playerId: row.player.id })}
                  className="text-xs font-bold text-[#253451]/60 hover:text-[#253451] px-2 py-1 rounded-lg hover:bg-[#F8F5EC] transition"
                  title="Manual adjustment"
                >
                  Adjust
                </button>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#F8F5EC] border border-[#EAE9E3] flex items-center justify-center text-2xl shadow-xs">
                  {pawnEmoji}
                </div>
                <div>
                  <h3 className="font-display font-black text-lg text-[#253451] truncate">
                    {row.player.name}
                  </h3>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#253451]/50">
                    Pion {row.player.color}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#EAE9E3]">
                <div className="bg-[#8BBDE2]/20 border border-[#8BBDE2]/50 p-2.5 rounded-2xl text-center">
                  <span className="text-[10px] font-extrabold uppercase text-[#253451]/60 block mb-0.5">Total VP</span>
                  <div className="text-2xl font-mono font-black text-[#253451]">{row.totalVP}</div>
                </div>

                <div className="bg-[#F4CE70]/20 border border-[#F4CE70]/50 p-2.5 rounded-2xl text-center">
                  <span className="text-[10px] font-extrabold uppercase text-[#253451]/60 block mb-0.5">Budget GB</span>
                  <div className="text-2xl font-mono font-black text-[#253451]">{row.budget}</div>
                </div>
              </div>

              <div className="text-xs text-[#253451]/75 flex justify-between items-center font-bold">
                <span>{row.territoryCount} Wilayah Dikuasai</span>
                <span className="text-[#73B77A]">+{row.totalIncome} GB/siklus</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Player Leaderboard Cards Grid (Replaces the stiff administrative table) */}
      <div className="space-y-4">
        <h2 className="text-lg font-display font-extrabold text-[#253451]">
          Rincian Kartu Perbandingan Pemain
        </h2>

        <div className="space-y-4">
          {playerRows.map((row, idx) => {
            const pawnEmoji = 
              row.player.color === 'red' ? '🔴' :
              row.player.color === 'blue' ? '🔵' :
              row.player.color === 'green' ? '🟢' : '🟡';

            return (
              <div
                key={row.player.id}
                className="bg-white border-2 border-[#EAE9E3] hover:border-[#253451]/20 rounded-3xl p-5 md:p-6 shadow-soft-sm card-hover transition flex flex-col lg:flex-row lg:items-center justify-between gap-5"
              >
                {/* Left: Rank & Player identity */}
                <div className="flex items-center gap-4 min-w-[200px]">
                  <div className="w-10 h-10 rounded-2xl bg-[#F8F5EC] border border-[#EAE9E3] flex items-center justify-center font-mono font-black text-base text-[#253451] shrink-0">
                    {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{pawnEmoji}</span>
                    <div>
                      <h3 className="font-display font-black text-base md:text-lg text-[#253451]">
                        {row.player.name}
                      </h3>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#253451]/50">
                        Pion {row.player.color}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Center: Key Balances in Cheerful Badges */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 flex-1">
                  {/* Victory Points */}
                  <div className="bg-[#8BBDE2]/20 border border-[#8BBDE2]/40 p-2.5 rounded-2xl text-center">
                    <span className="text-[10px] font-extrabold uppercase text-[#253451]/60 block mb-0.5">Victory Points</span>
                    <div className="text-lg font-mono font-black text-[#253451]">
                      {row.totalVP} <span className="text-xs font-normal text-[#253451]/60">VP</span>
                    </div>
                    <span className="text-[9px] text-[#253451]/50 block">Terr:{row.territoryVP} | Bonus:{row.cardVP}</span>
                  </div>

                  {/* Budget */}
                  <div className="bg-[#F4CE70]/20 border border-[#F4CE70]/40 p-2.5 rounded-2xl text-center">
                    <span className="text-[10px] font-extrabold uppercase text-[#253451]/60 block mb-0.5">Budget Kas</span>
                    <div className="text-lg font-mono font-black text-[#253451]">
                      {row.budget} <span className="text-xs font-normal text-[#253451]/60">GB</span>
                    </div>
                  </div>

                  {/* Territories */}
                  <div className="bg-[#F8F5EC] border border-[#EAE9E3] p-2.5 rounded-2xl text-center">
                    <span className="text-[10px] font-extrabold uppercase text-[#253451]/60 block mb-0.5">Wilayah</span>
                    <div className="text-lg font-mono font-black text-[#253451]">
                      {row.territoryCount} <span className="text-xs font-normal text-[#253451]/60">/ 40</span>
                    </div>
                  </div>

                  {/* Income */}
                  <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-2xl text-center">
                    <span className="text-[10px] font-extrabold uppercase text-emerald-800 block mb-0.5">Income/Siklus</span>
                    <div className="text-lg font-mono font-black text-[#73B77A]">
                      +{row.totalIncome} <span className="text-xs font-normal text-[#253451]/60">GB</span>
                    </div>
                  </div>
                </div>

                {/* Right: Sector Category Icons & Adjust Trigger */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between lg:justify-end gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-[#EAE9E3]">
                  {/* Sector Chips */}
                  <div className="flex items-center gap-1 flex-wrap max-w-xs">
                    {(Object.keys(row.categoryBreakdown) as TerritoryCategory[]).map(cat => {
                      const count = row.categoryBreakdown[cat];
                      if (count === 0) return null;
                      return (
                        <span key={cat} className="text-xs bg-[#F8F5EC] px-2 py-1 rounded-xl border border-[#EAE9E3] font-bold text-[#253451] flex items-center gap-1.5" title={`${cat}: ${count}`}>
                          <CategoryLogo category={cat} size="xs" />
                          <span className="font-mono">{count}</span>
                        </span>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => openModal('MANUAL_ADJUSTMENT', { playerId: row.player.id })}
                    className="px-3.5 py-2 rounded-xl bg-[#F8F5EC] hover:bg-[#253451] hover:text-white text-[#253451] text-xs font-extrabold border border-[#EAE9E3] transition shadow-xs flex items-center gap-1.5 shrink-0"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span>Adjust</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
