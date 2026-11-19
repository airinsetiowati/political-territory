import React from 'react';
import { 
  Users, 
  MapPin, 
  Coins, 
  Trophy, 
  Clock, 
  TrendingUp, 
  Sparkles, 
  Target, 
  QrCode, 
  ArrowRight, 
  Play,
  Layers,
  ShieldAlert,
  Compass,
  CheckCircle2
} from 'lucide-react';
import { useGame } from '../context/GameContext';
import { TerritoryCategory } from '../types/game';
import { CategoryLogo } from '../components/CategoryLogo';

interface DashboardPageProps {
  onNavigate: (page: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const { 
    players, 
    territories, 
    policyCards, 
    crisisCards, 
    missionCards, 
    opportunityCards, 
    logs, 
    settings, 
    calculatePlayerIncome, 
    calculatePlayerVictoryPoints, 
    openModal, 
    startGame,
    triggerEconomicRound 
  } = useGame();

  const claimedTerritoriesCount = territories.filter(t => t.ownerId !== null).length;
  const usedPolicyCardsCount = policyCards.filter(c => c.isUsed).length;
  const availablePolicyCount = policyCards.filter(c => !c.isUsed).length;

  // Format timer
  const minutes = Math.floor(settings.timerRemainingSeconds / 60);
  const seconds = settings.timerRemainingSeconds % 60;
  const timeFormatted = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  const progressPercent = settings.economicIntervalSeconds > 0 
    ? Math.max(0, Math.min(100, ((settings.economicIntervalSeconds - settings.timerRemainingSeconds) / settings.economicIntervalSeconds) * 100))
    : 0;

  // Active missions and opportunities across all players
  const allActiveMissions: { player: any; mission: any }[] = [];
  const allActiveOpps: { player: any; opp: any }[] = [];

  players.forEach(player => {
    (player.activeMissions || []).filter(m => m.status === 'active').forEach(m => {
      allActiveMissions.push({ player, mission: m });
    });
    (player.activeOpportunities || []).forEach(opp => {
      allActiveOpps.push({ player, opp });
    });
  });

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
      {/* 1. Playful Game Hero Greeting Banner */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-[#EAE9E3] shadow-soft-md relative overflow-hidden">
        {/* Soft decorative background circles */}
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-[#F4CE70]/20 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full bg-[#8BBDE2]/20 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F8F5EC] border border-[#EAE9E3] text-[#253451] text-xs font-extrabold tracking-wide">
              <span>🎲 Welcome to POLITICAL TERRITORY</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#73B77A]" />
              <span className="text-[#73B77A] capitalize">{settings.status}</span>
            </div>

            <h1 className="text-3xl md:text-4xl font-display font-black text-[#253451] tracking-tight">
              Tabletop Companion Hub
            </h1>

            <p className="text-sm text-[#253451]/75 max-w-2xl font-medium">
              Aplikasi pendamping bermain board game strategi politik & perebutan wilayah. Kelola anggaran GB, lacak Victory Points (VP), dan pantau kepemilikan wilayah secara real-time.
            </p>
          </div>

          {/* Prominent Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            {settings.status === 'setup' ? (
              <button
                onClick={startGame}
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#F4CE70] to-[#EF956F] hover:opacity-95 text-[#253451] font-black text-sm uppercase tracking-wider shadow-soft-sm transition flex items-center justify-center gap-2 game-press"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Mulai Permainan</span>
              </button>
            ) : (
              <>
                <button
                  onClick={() => onNavigate('map')}
                  className="flex-1 sm:flex-initial px-5 py-3.5 rounded-2xl bg-[#253451] hover:bg-[#1C273D] text-white font-extrabold text-sm shadow-soft-md transition flex items-center justify-center gap-2.5 game-press"
                >
                  <Compass className="w-5 h-5 text-[#F4CE70]" />
                  <span>Buka Territory Map</span>
                </button>

                <button
                  onClick={() => openModal('QUICK_CARD_ENTRY')}
                  className="px-4 py-3.5 rounded-2xl bg-gradient-to-r from-[#F4CE70] to-[#EF956F] hover:opacity-95 text-[#253451] font-extrabold text-sm shadow-soft-sm transition flex items-center justify-center gap-2 game-press"
                >
                  <QrCode className="w-4 h-4 text-[#253451]" />
                  <span>Input Kartu</span>
                </button>

                <button
                  onClick={() => onNavigate('scoreboard')}
                  className="px-4 py-3.5 rounded-2xl bg-[#F8F5EC] hover:bg-[#EAE9E3] text-[#253451] font-bold text-sm border border-[#EAE9E3] transition flex items-center justify-center gap-1.5"
                >
                  <Trophy className="w-4 h-4 text-[#EF956F]" />
                  <span className="hidden sm:inline">Scoreboard</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 2. Economic Cycle Spotlight Card + Game Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Economic Cycle Spotlight */}
        <div className="lg:col-span-2 bg-gradient-to-br from-white to-[#F8F5EC] border border-[#EAE9E3] rounded-3xl p-6 shadow-soft-sm flex flex-col justify-between space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#F4CE70]/30 border border-[#F4CE70] flex items-center justify-center text-2xl shadow-xs">
                💰
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#EF956F]">
                  Siklus Ekonomi Permainan
                </span>
                <h3 className="text-xl font-display font-extrabold text-[#253451]">
                  Gelombang Pendapatan Round #{settings.currentRound}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="bg-white px-3.5 py-1.5 rounded-2xl border border-[#EAE9E3] shadow-xs flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#F4CE70]" />
                <span className="font-mono text-lg font-black text-[#253451]">
                  {timeFormatted}
                </span>
              </div>

              {settings.status === 'active' && (
                <button
                  onClick={triggerEconomicRound}
                  className="px-3.5 py-2 rounded-2xl bg-[#73B77A] hover:bg-[#5fa867] text-white font-extrabold text-xs transition shadow-xs flex items-center gap-1.5 game-press"
                  title="Distribute Income to all players now"
                >
                  <span>Distribusi Sekarang</span>
                </button>
              )}
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-bold text-[#253451]/70 mb-1.5">
              <span>Progres Siklus Ekonomi ({settings.economicIntervalSeconds / 60} menit / putaran)</span>
              <span>{Math.round(progressPercent)}%</span>
            </div>
            <div className="w-full bg-[#EAE9E3] h-2.5 rounded-full overflow-hidden">
              <div 
                className="bg-gradient-to-r from-[#F4CE70] via-[#EF956F] to-[#73B77A] h-full transition-all duration-1000 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Quick Map & Deck Health Pill */}
        <div className="bg-white border border-[#EAE9E3] rounded-3xl p-6 shadow-soft-sm flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#253451]/60">
              Statistik Meja Permainan
            </span>
            <span className="text-lg">🗺️</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#F8F5EC] p-3 rounded-2xl border border-[#EAE9E3]">
              <span className="text-[10px] font-bold uppercase text-[#253451]/60 block">Wilayah Dikuasai</span>
              <div className="text-2xl font-mono font-black text-[#253451]">
                {claimedTerritoriesCount} <span className="text-xs font-normal text-[#253451]/60">/ 40</span>
              </div>
            </div>

            <div className="bg-[#F8F5EC] p-3 rounded-2xl border border-[#EAE9E3]">
              <span className="text-[10px] font-bold uppercase text-[#253451]/60 block">Policy Cards Sisa</span>
              <div className="text-2xl font-mono font-black text-[#253451]">
                {availablePolicyCount} <span className="text-xs font-normal text-[#253451]/60">/ 50</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigate('map')}
            className="w-full py-2.5 rounded-xl bg-white hover:bg-[#F8F5EC] text-[#253451] font-bold text-xs border border-[#EAE9E3] transition flex items-center justify-center gap-1.5 shadow-xs"
          >
            <span>Lihat Peta Wilayah Lengkap</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 3. Player Cards Grid (The Main Board Game Companion Component) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-[#EF956F]" />
            <h2 className="text-xl font-display font-extrabold text-[#253451]">
              Kartu Pemain & Status Negara
            </h2>
          </div>
          <button
            onClick={() => onNavigate('scoreboard')}
            className="text-xs font-extrabold text-[#253451] hover:text-[#EF956F] flex items-center gap-1 transition"
          >
            <span>Leaderboard Lengkap</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {players.map(player => {
            const income = calculatePlayerIncome(player);
            const vpDetails = calculatePlayerVictoryPoints(player);
            const ownedTerrs = territories.filter(t => t.ownerId === player.id);
            const activeMissions = (player.activeMissions || []).filter(m => m.status === 'active');
            const activeOpps = player.activeOpportunities || [];

            // Sector category counts for badge indicators
            const sectorIcons = Array.from(new Set(ownedTerrs.map(t => t.category)));

            const borderTheme = 
              player.color === 'red' ? 'border-red-200 hover:border-red-400 bg-gradient-to-b from-white to-red-50/30' :
              player.color === 'blue' ? 'border-blue-200 hover:border-blue-400 bg-gradient-to-b from-white to-blue-50/30' :
              player.color === 'green' ? 'border-emerald-200 hover:border-emerald-400 bg-gradient-to-b from-white to-emerald-50/30' :
              'border-amber-200 hover:border-amber-400 bg-gradient-to-b from-white to-amber-50/30';

            const dotBg = 
              player.color === 'red' ? 'bg-[#EF4444]' :
              player.color === 'blue' ? 'bg-[#3B82F6]' :
              player.color === 'green' ? 'bg-[#10B981]' : 'bg-[#F59E0B]';

            const pawnEmoji = 
              player.color === 'red' ? '🔴' :
              player.color === 'blue' ? '🔵' :
              player.color === 'green' ? '🟢' : '🟡';

            return (
              <div 
                key={player.id}
                className={`bg-white border-2 rounded-3xl p-5 shadow-soft-sm card-hover transition-all flex flex-col justify-between space-y-4 ${borderTheme}`}
              >
                {/* Header: Pawn avatar & Player name */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-2xl flex items-center justify-center text-lg shadow-xs bg-white border border-[#EAE9E3]">
                        {pawnEmoji}
                      </div>
                      <div>
                        <h3 className="font-display font-extrabold text-base text-[#253451] truncate max-w-[120px]">
                          {player.name}
                        </h3>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#253451]/50">
                          Pion {player.color}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => openModal('MANUAL_ADJUSTMENT', { playerId: player.id })}
                      className="text-[10px] font-bold px-2 py-1 rounded-lg bg-white border border-[#EAE9E3] hover:bg-[#F8F5EC] text-[#253451] transition"
                      title="Adjust saldo pemain"
                    >
                      Adjust
                    </button>
                  </div>

                  {/* Primary Balances: GB & VP in cheerful pills */}
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {/* Budget (GB) */}
                    <div className="bg-[#F4CE70]/20 border border-[#F4CE70]/50 p-2.5 rounded-2xl text-center">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#253451]/60 block mb-0.5">
                        Budget (GB)
                      </span>
                      <div className="text-xl font-mono font-black text-[#253451] flex items-center justify-center gap-1">
                        <Coins className="w-4 h-4 text-[#F4CE70]" />
                        <span>{player.budget}</span>
                      </div>
                    </div>

                    {/* Victory Points (VP) */}
                    <div className="bg-[#8BBDE2]/20 border border-[#8BBDE2]/50 p-2.5 rounded-2xl text-center">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#253451]/60 block mb-0.5">
                        Points (VP)
                      </span>
                      <div className="text-xl font-mono font-black text-[#253451] flex items-center justify-center gap-1">
                        <Trophy className="w-4 h-4 text-[#8BBDE2]" />
                        <span>{vpDetails.totalVP}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Economic & Territory Breakdown */}
                <div className="space-y-2 text-xs border-t border-[#EAE9E3] pt-3">
                  <div className="flex justify-between items-center text-[#253451]">
                    <span className="text-[#253451]/70 font-medium">Wilayah Dikuasai:</span>
                    <span className="font-mono font-extrabold text-[#253451] bg-[#F8F5EC] px-2 py-0.5 rounded-md border border-[#EAE9E3]">
                      {ownedTerrs.length} Wilayah
                    </span>
                  </div>

                  {/* Sector Category Mini Chips */}
                  {sectorIcons.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                      {sectorIcons.map(cat => (
                        <div key={cat} className="bg-white p-0.5 rounded-full border border-[#EAE9E3] shadow-xs flex items-center justify-center" title={cat}>
                          <CategoryLogo category={cat} size="xs" />
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex justify-between items-center text-[#253451] pt-1">
                    <span className="text-[#253451]/70 font-medium">Income / Siklus:</span>
                    <span className="font-mono font-bold text-[#73B77A]">
                      +{income.totalIncome} GB
                      {income.opportunityIncome > 0 && (
                        <span className="text-[10px] text-[#253451]/50 font-normal"> (+{income.opportunityIncome} bonus)</span>
                      )}
                    </span>
                  </div>

                  {/* Active Quests & Opportunities summary */}
                  {(activeMissions.length > 0 || activeOpps.length > 0) && (
                    <div className="pt-2 border-t border-[#EAE9E3] flex items-center gap-1.5 flex-wrap">
                      {activeMissions.map(m => (
                        <span key={m.id} className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-900 border border-purple-200">
                          🎯 {m.title.slice(0, 15)}...
                        </span>
                      ))}
                      {activeOpps.map(o => (
                        <span key={o.id} className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-200">
                          ✨ +{o.recurringGB}GB
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Active Quests & Opportunities Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Missions Card */}
        <div className="bg-white border border-[#EAE9E3] rounded-3xl p-6 shadow-soft-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                🎯
              </div>
              <h3 className="font-display font-extrabold text-base text-[#253451]">
                Mission & Quest Aktif ({allActiveMissions.length})
              </h3>
            </div>
            <button
              onClick={() => onNavigate('missions')}
              className="text-xs font-bold text-[#253451] hover:text-[#EF956F] flex items-center gap-1"
            >
              <span>Semua Quest</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {allActiveMissions.length > 0 ? (
            <div className="space-y-3">
              {allActiveMissions.map(({ player, mission }) => (
                <div 
                  key={mission.id}
                  onClick={() => openModal('MISSION_DETAIL', { card: mission, playerId: player.id })}
                  className="p-3.5 rounded-2xl bg-[#F8F5EC] border border-[#EAE9E3] hover:border-purple-300 transition cursor-pointer flex items-center justify-between gap-3"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase px-2 py-0.2 rounded-full bg-white text-[#253451] border border-[#EAE9E3]">
                        {player.name}
                      </span>
                      <span className="font-mono text-xs font-bold text-purple-700">
                        {mission.code}
                      </span>
                    </div>
                    <div className="font-bold text-xs text-[#253451] truncate">
                      {mission.title}
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    <span className="text-xs font-mono font-extrabold text-[#73B77A] bg-emerald-50 px-2 py-1 rounded-xl border border-emerald-200">
                      +{mission.rewardPoints} VP
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-xs text-[#253451]/60 bg-[#F8F5EC] rounded-2xl border border-dashed border-[#EAE9E3] space-y-1">
              <div>🎯 Belum ada Mission yang sedang berjalan.</div>
              <div className="text-[11px] text-[#253451]/40">Input kode kartu Mission untuk mengambil quest baru.</div>
            </div>
          )}
        </div>

        {/* Active Opportunities Card */}
        <div className="bg-white border border-[#EAE9E3] rounded-3xl p-6 shadow-soft-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                ✨
              </div>
              <h3 className="font-display font-extrabold text-base text-[#253451]">
                Opportunity & Stimulus Aktif ({allActiveOpps.length})
              </h3>
            </div>
            <button
              onClick={() => onNavigate('opportunities')}
              className="text-xs font-bold text-[#253451] hover:text-[#EF956F] flex items-center gap-1"
            >
              <span>Semua Opportunity</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {allActiveOpps.length > 0 ? (
            <div className="space-y-3">
              {allActiveOpps.map(({ player, opp }) => (
                <div 
                  key={opp.id}
                  onClick={() => openModal('OPPORTUNITY_DETAIL', { card: opp, playerId: player.id })}
                  className="p-3.5 rounded-2xl bg-[#F8F5EC] border border-[#EAE9E3] hover:border-emerald-300 transition cursor-pointer flex items-center justify-between gap-3"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase px-2 py-0.2 rounded-full bg-white text-[#253451] border border-[#EAE9E3]">
                        {player.name}
                      </span>
                      <span className="font-mono text-xs font-bold text-emerald-700">
                        {opp.code}
                      </span>
                    </div>
                    <div className="font-bold text-xs text-[#253451] truncate">
                      {opp.title}
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    <span className="text-xs font-mono font-extrabold text-[#73B77A] bg-emerald-50 px-2 py-1 rounded-xl border border-emerald-200">
                      +{opp.recurringGB} GB/cycle
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-xs text-[#253451]/60 bg-[#F8F5EC] rounded-2xl border border-dashed border-[#EAE9E3] space-y-1">
              <div>✨ Belum ada Opportunity yang aktif.</div>
              <div className="text-[11px] text-[#253451]/40">Input kartu Opportunity untuk mendapatkan bonus ekonomi.</div>
            </div>
          )}
        </div>
      </div>

      {/* 5. Recent Game Activity Feed (Story-like Timeline) */}
      <div className="bg-white border border-[#EAE9E3] rounded-3xl p-6 shadow-soft-sm space-y-4">
        <div className="flex items-center justify-between border-b border-[#EAE9E3] pb-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">📜</span>
            <h3 className="font-display font-extrabold text-base text-[#253451]">
              Aktivitas Permainan Terakhir
            </h3>
          </div>
          <button
            onClick={() => onNavigate('history')}
            className="text-xs font-bold text-[#253451] hover:text-[#EF956F] flex items-center gap-1 transition"
          >
            <span>Buka Riwayat Lengkap</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {logs.length > 0 ? (
          <div className="divide-y divide-[#EAE9E3] max-h-56 overflow-y-auto pr-2">
            {logs.slice(0, 8).map(log => (
              <div key={log.id} className="py-2.5 flex items-center justify-between text-xs gap-3">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[10px] text-[#253451]/50 shrink-0">
                    {log.timestamp}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 ${
                    log.type === 'claim' ? 'bg-blue-100 text-blue-800' :
                    log.type === 'economic_round' ? 'bg-amber-100 text-amber-800' :
                    log.type === 'crisis' ? 'bg-red-100 text-red-800' :
                    log.type === 'mission_completed' ? 'bg-purple-100 text-purple-800' :
                    log.type === 'opportunity' ? 'bg-emerald-100 text-emerald-800' :
                    'bg-[#EAE9E3] text-[#253451]'
                  }`}>
                    {log.type.replace('_', ' ')}
                  </span>
                  <span className="text-[#253451] font-medium leading-snug">
                    {log.description}
                  </span>
                </div>

                <div className="font-mono text-xs shrink-0 flex items-center gap-2 font-bold">
                  {log.gbChange !== undefined && log.gbChange !== 0 && (
                    <span className={log.gbChange > 0 ? 'text-[#73B77A]' : 'text-[#EF956F]'}>
                      {log.gbChange > 0 ? `+${log.gbChange}` : log.gbChange} GB
                    </span>
                  )}
                  {log.pointChange !== undefined && log.pointChange !== 0 && (
                    <span className={log.pointChange > 0 ? 'text-[#3B82F6]' : 'text-[#EF4444]'}>
                      {log.pointChange > 0 ? `+${log.pointChange}` : log.pointChange} VP
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-xs text-[#253451]/50 italic">
            Belum ada aksi permainan yang tercatat. Klaim wilayah atau masukkan kode kartu untuk memulai petualangan!
          </div>
        )}
      </div>
    </div>
  );
};
