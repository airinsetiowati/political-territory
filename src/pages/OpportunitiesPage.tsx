import React from 'react';
import { 
  TrendingUp, 
  Sparkles, 
  Clock, 
  Coins, 
  Award, 
  QrCode,
  ArrowRight
} from 'lucide-react';
import { useGame } from '../context/GameContext';

export const OpportunitiesPage: React.FC = () => {
  const { players, opportunityCards, openModal } = useGame();

  const allActiveOpps: { player: any; opp: any }[] = [];
  players.forEach(player => {
    (player.activeOpportunities || []).forEach(opp => {
      allActiveOpps.push({ player, opp });
    });
  });

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6 md:space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-[#EAE9E3] shadow-soft-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F8F5EC] text-xs font-extrabold text-[#253451] mb-2 border border-[#EAE9E3]">
            <span>✨ Economic Stimulus Directives</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-display font-black text-[#253451] tracking-tight">
            Program Opportunity & Stimulus
          </h1>
          <p className="text-xs md:text-sm text-[#253451]/70 mt-1">
            Pantau subsidi anggaran berulang, paket stimulus fiskal, dan upgrade wilayah sovereign yang sedang aktif.
          </p>
        </div>

        <button
          onClick={() => openModal('QUICK_CARD_ENTRY')}
          className="px-5 py-3 rounded-2xl bg-[#253451] hover:bg-[#1C273D] text-white font-extrabold text-xs uppercase tracking-wider transition shadow-soft-sm flex items-center gap-2 game-press shrink-0"
        >
          <QrCode className="w-4 h-4 text-[#F4CE70]" />
          <span>Input Kartu Opportunity</span>
        </button>
      </div>

      {/* Active Recurring Opportunities */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#73B77A]" />
          <h2 className="text-lg font-display font-extrabold text-[#253451]">
            Program Stimulus yang Sedang Aktif ({allActiveOpps.length})
          </h2>
        </div>

        {allActiveOpps.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allActiveOpps.map(({ player, opp }) => (
              <div 
                key={opp.id}
                className="bg-white border-2 border-emerald-200 hover:border-emerald-400 rounded-3xl p-5 shadow-soft-sm flex flex-col justify-between space-y-4 card-hover transition"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`w-3 h-3 rounded-full ${
                        player.color === 'red' ? 'bg-[#EF4444]' :
                        player.color === 'blue' ? 'bg-[#3B82F6]' :
                        player.color === 'green' ? 'bg-[#10B981]' : 'bg-[#F59E0B]'
                      }`} />
                      <span className="font-extrabold text-xs text-[#253451]">{player.name}</span>
                    </div>
                    <span className="font-mono text-xs font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      {opp.code}
                    </span>
                  </div>

                  <h3 className="font-display font-extrabold text-base text-[#253451]">
                    {opp.title}
                  </h3>

                  <p className="text-xs text-[#253451]/75 leading-relaxed font-medium">
                    {opp.description}
                  </p>

                  {opp.targetTerritoryName && (
                    <div className="text-[11px] font-bold text-amber-900 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200 flex items-center gap-1.5">
                      <span>📍</span>
                      <span>Sasaran: <strong>{opp.targetTerritoryName}</strong> ({opp.targetCategory?.toUpperCase()})</span>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-[#EAE9E3] text-xs font-mono">
                    <div className="bg-[#F8F5EC] p-2.5 rounded-2xl border border-[#EAE9E3]">
                      <span className="text-[10px] text-[#253451]/60 block uppercase font-bold">Bonus Berkala</span>
                      <span className="font-extrabold text-[#73B77A]">+{opp.recurringGB} GB/siklus</span>
                    </div>

                    <div className="bg-[#F8F5EC] p-2.5 rounded-2xl border border-[#EAE9E3]">
                      <span className="text-[10px] text-[#253451]/60 block uppercase font-bold">Durasi Sisa</span>
                      <span className="font-extrabold text-[#253451]">
                        {opp.isPermanent ? 'Permanen' : `${opp.remainingCycles} Putaran`}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-[#253451]/60 pt-2 border-t border-[#EAE9E3] flex items-center justify-between font-bold">
                  <span>Aktif sejak Round #{opp.activatedAtRound}</span>
                  <span className="text-[#73B77A] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    SEDANG AKTIF
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-3xl border border-[#EAE9E3] p-6 space-y-2">
            <span className="text-3xl">✨</span>
            <h3 className="font-display font-extrabold text-base text-[#253451]">Belum Ada Program Stimulus Aktif</h3>
            <p className="text-xs text-[#253451]/60 max-w-md mx-auto">
              Tarik kartu Opportunity dari dek fisik dan masukkan kode kartu untuk mengaktifkan bonus ekonomi bagi pemain.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
