import React, { useState } from 'react';
import { 
  Target, 
  CheckCircle, 
  Award, 
  Coins, 
  Users, 
  ArrowRight,
  Sparkles,
  QrCode
} from 'lucide-react';
import { useGame } from '../context/GameContext';

export const MissionsPage: React.FC = () => {
  const { 
    players, 
    territories, 
    missionCards, 
    openModal 
  } = useGame();

  const [activeTab, setActiveTab] = useState<'active' | 'completed' | 'all'>('active');

  // Aggregate all assigned missions from players
  const allActiveMissions: { player: any; mission: any }[] = [];
  const allCompletedMissions: { player: any; mission: any }[] = [];

  players.forEach(player => {
    (player.activeMissions || []).forEach(m => {
      if (m.status === 'completed') {
        allCompletedMissions.push({ player, mission: m });
      } else {
        allActiveMissions.push({ player, mission: m });
      }
    });
  });

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6 md:space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-[#EAE9E3] shadow-soft-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F8F5EC] text-xs font-extrabold text-[#253451] mb-2 border border-[#EAE9E3]">
            <span>🎯 Tabletop Quest Directives</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-display font-black text-[#253451] tracking-tight">
            Pusat Misi & Quest Strategis
          </h1>
          <p className="text-xs md:text-sm text-[#253451]/70 mt-1">
            Pantau misi aktif pemain, verifikasi penyelesaian target sektor wilayah, dan klaim reward VP & GB.
          </p>
        </div>

        <button
          onClick={() => openModal('QUICK_CARD_ENTRY')}
          className="px-5 py-3 rounded-2xl bg-[#253451] hover:bg-[#1C273D] text-white font-extrabold text-xs uppercase tracking-wider transition shadow-soft-sm flex items-center gap-2 game-press shrink-0"
        >
          <QrCode className="w-4 h-4 text-[#F4CE70]" />
          <span>Ambil / Input Kode Misi</span>
        </button>
      </div>

      {/* Quest Filter Tabs */}
      <div className="flex gap-2 bg-white p-1 rounded-2xl border border-[#EAE9E3] shadow-xs w-fit">
        <button
          onClick={() => setActiveTab('active')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeTab === 'active'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-[#253451]/70 hover:bg-[#F8F5EC]'
          }`}
        >
          <span>🎯 Quest Aktif ({allActiveMissions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('completed')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeTab === 'completed'
              ? 'bg-[#73B77A] text-white shadow-xs'
              : 'text-[#253451]/70 hover:bg-[#F8F5EC]'
          }`}
        >
          <span>✅ Quest Selesai ({allCompletedMissions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeTab === 'all'
              ? 'bg-[#253451] text-white shadow-xs'
              : 'text-[#253451]/70 hover:bg-[#F8F5EC]'
          }`}
        >
          <span>🃏 Semua Kartu di Deck ({missionCards.length})</span>
        </button>
      </div>

      {/* Active Quests View */}
      {activeTab === 'active' && (
        <div className="space-y-4">
          {allActiveMissions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allActiveMissions.map(({ player, mission }) => {
                let currentProgress = 0;
                const targetCount = mission.targetCount || 1;
                if (mission.conditionType === 'own_category_count' && mission.targetCategory) {
                  currentProgress = territories.filter(t => t.ownerId === player.id && t.category === mission.targetCategory).length;
                }
                const progressPct = Math.min(100, Math.round((currentProgress / targetCount) * 100));

                return (
                  <div
                    key={mission.id}
                    onClick={() => openModal('MISSION_DETAIL', { card: mission, playerId: player.id })}
                    className="bg-white border-2 border-purple-200 hover:border-purple-400 rounded-3xl p-5 shadow-soft-sm card-hover transition cursor-pointer flex flex-col justify-between space-y-4 group"
                  >
                    <div>
                      {/* Player & Code Badge */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className={`w-3 h-3 rounded-full ${
                            player.color === 'red' ? 'bg-[#EF4444]' :
                            player.color === 'blue' ? 'bg-[#3B82F6]' :
                            player.color === 'green' ? 'bg-[#10B981]' : 'bg-[#F59E0B]'
                          }`} />
                          <span className="font-extrabold text-xs text-[#253451]">{player.name}</span>
                        </div>
                        <span className="font-mono text-xs font-extrabold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
                          {mission.code}
                        </span>
                      </div>

                      <h3 className="font-display font-extrabold text-base text-[#253451] group-hover:text-purple-700 transition">
                        {mission.title}
                      </h3>

                      <p className="text-xs text-[#253451]/75 mt-1 font-medium leading-relaxed">
                        {mission.description}
                      </p>
                    </div>

                    <div className="space-y-3 pt-3 border-t border-[#EAE9E3]">
                      {/* Progress Bar */}
                      <div>
                        <div className="flex justify-between text-xs font-bold text-[#253451]/70 mb-1">
                          <span>Progres Target</span>
                          <span className="font-mono">{currentProgress} / {targetCount} ({progressPct}%)</span>
                        </div>
                        <div className="w-full bg-[#EAE9E3] h-2 rounded-full overflow-hidden">
                          <div 
                            className="bg-purple-600 h-full rounded-full transition-all duration-500"
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                      </div>

                      {/* Reward Badges */}
                      <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-[#73B77A] bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
                            +{mission.rewardPoints} VP
                          </span>
                          {mission.rewardGB > 0 && (
                            <span className="text-xs font-mono font-bold text-[#253451] bg-[#F4CE70]/20 px-2.5 py-1 rounded-xl border border-[#F4CE70]/40">
                              +{mission.rewardGB} GB
                            </span>
                          )}
                        </div>

                        <span className="text-xs font-bold text-purple-700 flex items-center gap-1 group-hover:translate-x-1 transition">
                          <span>Detail</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-3xl border border-[#EAE9E3] p-6 space-y-2">
              <span className="text-3xl">🎯</span>
              <h3 className="font-display font-extrabold text-base text-[#253451]">Tidak Ada Quest Aktif</h3>
              <p className="text-xs text-[#253451]/60 max-w-md mx-auto">
                Setiap pemain dapat mengambil kartu Mission fisik dari tumpukan kartu permainan dan menginput kodenya ke sistem.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Completed Quests View */}
      {activeTab === 'completed' && (
        <div className="space-y-4">
          {allCompletedMissions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allCompletedMissions.map(({ player, mission }) => (
                <div
                  key={mission.id}
                  className="bg-white border-2 border-emerald-200 rounded-3xl p-5 shadow-soft-sm space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      SELESAI (COMPLETED)
                    </span>
                    <span className="font-mono text-xs font-extrabold text-[#253451]">{mission.code}</span>
                  </div>

                  <h3 className="font-display font-extrabold text-base text-[#253451]">{mission.title}</h3>
                  <p className="text-xs text-[#253451]/70">{mission.description}</p>

                  <div className="pt-2 border-t border-[#EAE9E3] flex justify-between items-center text-xs">
                    <span className="font-bold text-[#253451]">Selesai oleh {player.name}</span>
                    <span className="font-mono font-bold text-[#73B77A]">+{mission.rewardPoints} VP</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-3xl border border-[#EAE9E3] p-6">
              <p className="text-xs text-[#253451]/60">Belum ada misi yang diselesaikan dalam pertandingan ini.</p>
            </div>
          )}
        </div>
      )}

      {/* All Deck Missions */}
      {activeTab === 'all' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {missionCards.map(card => (
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
                    <span>Buka Kartu</span>
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
