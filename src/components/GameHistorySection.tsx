import React, { useState } from 'react';
import { 
  History, 
  Search, 
  Download, 
  Undo2,
  Flag,
  Coins,
  ShieldAlert,
  Sparkles,
  Target,
  Dices
} from 'lucide-react';
import { useGame } from '../context/GameContext';

export const GameHistorySection: React.FC = () => {
  const { logs, players, undoLastAction } = useGame();

  const [filterType, setFilterType] = useState<string>('all');
  const [filterPlayer, setFilterPlayer] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [undoMessage, setUndoMessage] = useState<string | null>(null);

  const handleUndo = () => {
    undoLastAction();
    setUndoMessage('Aksi terakhir berhasil dibatalkan.');
    setTimeout(() => setUndoMessage(null), 3000);
  };

  const handleExportCSV = () => {
    const headers = ['Timestamp', 'Round', 'Type', 'Player', 'CardCode', 'Dice_Value', 'Description', 'GB_Change', 'VP_Change'];
    const rows = logs.map(l => [
      `"${l.timestamp}"`,
      l.round,
      `"${l.type}"`,
      `"${l.playerName || ''}"`,
      `"${l.cardCode || ''}"`,
      l.diceValue !== undefined ? l.diceValue : '',
      `"${l.description.replace(/"/g, '""')}"`,
      l.gbChange || 0,
      l.pointChange || 0,
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `political-territory-history-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const filteredLogs = logs.filter(log => {
    if (filterType !== 'all') {
      if (filterType === 'claim' && log.type !== 'claim') return false;
      if (filterType === 'economic_round' && log.type !== 'economic_round') return false;
      if (filterType === 'crisis' && log.type !== 'crisis') return false;
      if (filterType === 'opportunity' && log.type !== 'opportunity') return false;
      if (filterType === 'mission' && log.type !== 'mission_completed' && log.type !== 'mission_activated') return false;
      if (filterType === 'adjustment' && log.type !== 'gb_change' && log.type !== 'point_change') return false;
      if (filterType === 'dice' && log.type !== 'dice_roll') return false;
      if (!['claim', 'economic_round', 'crisis', 'opportunity', 'mission', 'adjustment', 'dice'].includes(filterType) && (log.type as string) !== filterType) return false;
    }
    if (filterPlayer !== 'all' && log.playerId !== filterPlayer) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchDesc = log.description.toLowerCase().includes(q);
      const matchCard = (log.cardCode || '').toLowerCase().includes(q);
      const matchPlayer = (log.playerName || '').toLowerCase().includes(q);
      if (!matchDesc && !matchCard && !matchPlayer) return false;
    }
    return true;
  });

  const getLogIcon = (type: string) => {
    switch (type) {
      case 'claim': return <Flag className="w-3.5 h-3.5 text-[#3B82F6]" />;
      case 'economic_round': return <Coins className="w-3.5 h-3.5 text-[#F4CE70]" />;
      case 'crisis': return <ShieldAlert className="w-3.5 h-3.5 text-[#EF4444]" />;
      case 'opportunity': return <Sparkles className="w-3.5 h-3.5 text-[#F59E0B]" />;
      case 'mission_completed':
      case 'mission_activated': return <Target className="w-3.5 h-3.5 text-[#10B981]" />;
      case 'gb_change':
      case 'point_change': return <Coins className="w-3.5 h-3.5 text-purple-600" />;
      case 'dice_roll': return <Dices className="w-3.5 h-3.5 text-indigo-500" />;
      default: return <History className="w-3.5 h-3.5 text-[#253451]/60" />;
    }
  };

  return (
    <section
      id="history-section"
      className="h-full bg-white rounded-3xl border border-[#EAE9E3] shadow-soft-sm p-4 sm:p-5 flex flex-col gap-3.5"
    >
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-2 pb-3 border-b border-[#EAE9E3]">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-[#F8F5EC] border border-[#EAE9E3] flex items-center justify-center shrink-0">
            <History className="w-4 h-4 text-[#F4CE70]" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-display font-black text-[#253451] uppercase tracking-wide">
              Riwayat Permainan
            </h2>
            <p className="text-[10px] text-[#253451]/55 font-bold">
              Log kronologis aksi &amp; perubahan GB/VP
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 ml-auto">
          <button
            onClick={handleUndo}
            disabled={logs.length === 0}
            className="px-2.5 py-1.5 rounded-xl bg-[#F8F5EC] hover:bg-[#EAE9E3] text-[#253451] font-bold text-[10px] border border-[#EAE9E3] transition flex items-center gap-1 disabled:opacity-40"
            title="Batalkan aksi gameplay terakhir"
          >
            <Undo2 className="w-3 h-3 text-[#EF956F]" />
            <span>Undo</span>
          </button>

          <button
            onClick={handleExportCSV}
            disabled={logs.length === 0}
            className="px-2.5 py-1.5 rounded-xl bg-[#253451] hover:bg-[#1C273D] text-white font-extrabold text-[10px] uppercase tracking-wider transition shadow-xs flex items-center gap-1 disabled:opacity-40"
            title="Ekspor seluruh riwayat ke CSV"
          >
            <Download className="w-3 h-3 text-[#F4CE70]" />
            <span>Ekspor</span>
          </button>
        </div>
      </div>

      {undoMessage && (
        <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-bold">
          {undoMessage}
        </div>
      )}

      {/* Filter and Search Controls */}
      <div className="space-y-2">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Cari dalam riwayat..."
            className="w-full bg-[#F8F5EC] border border-[#EAE9E3] focus:border-[#253451] rounded-xl px-3 py-1.5 pl-8 text-xs text-[#253451] outline-none font-bold"
          />
          <Search className="w-3.5 h-3.5 text-[#253451]/40 absolute left-2.5 top-2.5" />
        </div>

        <div className="flex items-center gap-1.5">
          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            className="flex-1 min-w-0 bg-[#F8F5EC] border border-[#EAE9E3] rounded-xl px-2 py-1.5 text-[10px] font-bold text-[#253451] outline-none cursor-pointer"
          >
            <option value="all">Semua Tipe Aksi</option>
            <option value="dice">🎲 Lemparan Dadu</option>
            <option value="claim">Klaim Wilayah</option>
            <option value="economic_round">Siklus Ekonomi</option>
            <option value="crisis">Keputusan Krisis</option>
            <option value="opportunity">Peluang Stimulus</option>
            <option value="mission">Penyelesaian Misi</option>
            <option value="adjustment">Penyesuaian GB/VP</option>
          </select>

          <select
            value={filterPlayer}
            onChange={e => setFilterPlayer(e.target.value)}
            className="flex-1 min-w-0 bg-[#F8F5EC] border border-[#EAE9E3] rounded-xl px-2 py-1.5 text-[10px] font-bold text-[#253451] outline-none cursor-pointer"
          >
            <option value="all">Semua Pemain</option>
            {players.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-between text-[10px] font-mono font-bold text-[#253451]/50">
          <span>{filteredLogs.length} dari {logs.length} aktivitas</span>
          <span className="inline-flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#73B77A]" />
            <span>Terbaru di atas</span>
          </span>
        </div>
      </div>

      {/* Log Feed List (Newest first) */}
      <div className="flex-1 min-h-[220px] max-h-[420px] xl:max-h-none overflow-y-auto space-y-1.5 pr-1">
        {filteredLogs.length === 0 ? (
          <div className="h-full min-h-[160px] flex flex-col items-center justify-center text-center px-4 py-8 text-xs text-[#253451]/50 font-medium bg-[#F8F5EC] rounded-2xl border border-dashed border-[#EAE9E3]">
            <History className="w-6 h-6 text-[#253451]/20 mb-2" />
            <span>Belum ada aktivitas yang cocok dengan filter.</span>
          </div>
        ) : (
          filteredLogs.map(l => (
            <div
              key={l.id}
              className="p-2.5 bg-[#F8F5EC] rounded-xl border border-[#EAE9E3] hover:border-[#253451]/20 transition flex items-start gap-2.5"
            >
              <div className="w-7 h-7 rounded-lg bg-white border border-[#EAE9E3] flex items-center justify-center shrink-0">
                {getLogIcon(l.type)}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[9px] font-mono text-[#253451]/45">{l.timestamp}</span>
                  <span className="text-[9px] font-mono font-bold text-[#253451]/70 bg-white border border-[#EAE9E3] px-1 rounded">
                    R#{l.round}
                  </span>
                  {l.playerName && (
                    <span className="text-[9px] font-black text-[#253451]">
                      {l.playerName}
                    </span>
                  )}
                  {l.cardCode && (
                    <span className="text-[9px] font-mono font-extrabold text-[#EF956F]">
                      {l.cardCode}
                    </span>
                  )}
                  {l.diceValue !== undefined && (
                    <span className="text-[9px] font-mono font-black text-indigo-700 bg-indigo-50 border border-indigo-200 px-1 rounded inline-flex items-center gap-0.5">
                      <Dices className="w-2.5 h-2.5" />
                      <span>{l.diceValue}</span>
                    </span>
                  )}
                </div>
                <div className="text-[#253451] font-medium text-[11px] leading-snug mt-0.5 break-words">
                  {l.description}
                </div>
              </div>

              {(l.gbChange !== undefined && l.gbChange !== 0) || (l.pointChange !== undefined && l.pointChange !== 0) ? (
                <div className="flex flex-col items-end gap-0.5 font-mono text-[10px] font-extrabold shrink-0">
                  {l.gbChange !== undefined && l.gbChange !== 0 && (
                    <span className={l.gbChange > 0 ? 'text-[#2e6d34]' : 'text-[#EF4444]'}>
                      {l.gbChange > 0 ? `+${l.gbChange}` : l.gbChange} GB
                    </span>
                  )}
                  {l.pointChange !== undefined && l.pointChange !== 0 && (
                    <span className={l.pointChange > 0 ? 'text-[#3B82F6]' : 'text-[#EF4444]'}>
                      {l.pointChange > 0 ? `+${l.pointChange}` : l.pointChange} VP
                    </span>
                  )}
                </div>
              ) : null}
            </div>
          ))
        )}
      </div>
    </section>
  );
};
