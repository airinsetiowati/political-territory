import React, { useState } from 'react';
import { 
  History, 
  Search, 
  Filter, 
  Download, 
  Undo2,
  Calendar,
  Layers,
  Flag,
  Coins,
  ShieldAlert,
  Sparkles,
  Target
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
    const headers = ['Timestamp', 'Round', 'Type', 'Player', 'CardCode', 'Description', 'GB_Change', 'VP_Change'];
    const rows = logs.map(l => [
      `"${l.timestamp}"`,
      l.round,
      `"${l.type}"`,
      `"${l.playerName || ''}"`,
      `"${l.cardCode || ''}"`,
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
      if (!['claim', 'economic_round', 'crisis', 'opportunity', 'mission', 'adjustment'].includes(filterType) && (log.type as string) !== filterType) return false;
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
      default: return <History className="w-3.5 h-3.5 text-[#253451]/60" />;
    }
  };

  return (
    <section id="history-section" className="bg-white rounded-3xl border border-[#EAE9E3] shadow-soft-sm p-4 sm:p-6 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EAE9E3] pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#F8F5EC] text-xs font-extrabold text-[#253451] mb-1 border border-[#EAE9E3]">
            <History className="w-3.5 h-3.5 text-[#F4CE70]" />
            <span>Match Activity Log</span>
          </div>
          <h2 className="text-xl font-display font-black text-[#253451] tracking-tight">
            Game History & Log Aktivitas Pertandingan
          </h2>
          <p className="text-xs text-[#253451]/70">
            Jejak langkah kronologis seluruh klaim wilayah, pembagian GB, keputusan krisis, dan penyelesaian misi.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleUndo}
            disabled={logs.length === 0}
            className="px-3 py-1.5 rounded-xl bg-[#F8F5EC] hover:bg-[#EAE9E3] text-[#253451] font-bold text-xs border border-[#EAE9E3] transition flex items-center gap-1.5 disabled:opacity-40"
            title="Batalkan aksi gameplay terakhir"
          >
            <Undo2 className="w-3.5 h-3.5 text-[#EF956F]" />
            <span>Undo Aksi</span>
          </button>

          <button
            onClick={handleExportCSV}
            disabled={logs.length === 0}
            className="px-3.5 py-1.5 rounded-xl bg-[#253451] hover:bg-[#1C273D] text-white font-extrabold text-xs uppercase tracking-wider transition shadow-xs flex items-center gap-1.5 disabled:opacity-40"
          >
            <Download className="w-3.5 h-3.5 text-[#F4CE70]" />
            <span>Ekspor CSV</span>
          </button>
        </div>
      </div>

      {undoMessage && (
        <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-bold">
          {undoMessage}
        </div>
      )}

      {/* Filter and Search Controls */}
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="relative min-w-[180px] flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Cari dalam riwayat..."
            className="w-full bg-[#F8F5EC] border border-[#EAE9E3] focus:border-[#253451] rounded-xl px-3 py-1.5 pl-8 text-xs text-[#253451] outline-none font-bold"
          />
          <Search className="w-3.5 h-3.5 text-[#253451]/40 absolute left-2.5 top-2.5" />
        </div>

        <select
          value={filterType}
          onChange={e => setFilterType(e.target.value)}
          className="bg-[#F8F5EC] border border-[#EAE9E3] rounded-xl px-2.5 py-1.5 text-xs font-bold text-[#253451] outline-none"
        >
          <option value="all">Semua Tipe Aksi</option>
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
          className="bg-[#F8F5EC] border border-[#EAE9E3] rounded-xl px-2.5 py-1.5 text-xs font-bold text-[#253451] outline-none"
        >
          <option value="all">Semua Pemain</option>
          {players.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>

        <span className="text-xs font-mono font-bold text-[#253451]/60 ml-auto">
          {filteredLogs.length} Aktivitas
        </span>
      </div>

      {/* Log Feed Table / List (Newest first) */}
      <div className="max-h-72 overflow-y-auto space-y-2 pr-1 border border-[#EAE9E3] rounded-2xl p-2 bg-[#F8F5EC]">
        {filteredLogs.length === 0 ? (
          <div className="text-center py-8 text-xs text-[#253451]/50 font-medium">
            Belum ada aktivitas tercatat pada sesi ini.
          </div>
        ) : (
          filteredLogs.map(l => (
            <div
              key={l.id}
              className="p-2.5 bg-white rounded-xl border border-[#EAE9E3] shadow-2xs flex items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-[#F8F5EC] flex items-center justify-center shrink-0">
                  {getLogIcon(l.type)}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-mono text-[#253451]/50">{l.timestamp}</span>
                    <span className="text-[10px] font-mono font-bold text-[#253451] bg-[#F8F5EC] px-1.5 rounded">
                      R#{l.round}
                    </span>
                    {l.playerName && (
                      <span className="text-[10px] font-black text-[#253451]">
                        [{l.playerName}]
                      </span>
                    )}
                    {l.cardCode && (
                      <span className="text-[10px] font-mono font-extrabold text-[#EF956F] bg-[#F8F5EC] px-1 rounded">
                        {l.cardCode}
                      </span>
                    )}
                  </div>
                  <div className="text-[#253451] font-medium text-xs truncate mt-0.5">
                    {l.description}
                  </div>
                </div>
              </div>

              {/* Changes badge */}
              <div className="flex items-center gap-2 font-mono text-xs font-bold shrink-0">
                {l.gbChange !== undefined && l.gbChange !== 0 && (
                  <span className={l.gbChange > 0 ? 'text-[#73B77A]' : 'text-[#EF4444]'}>
                    {l.gbChange > 0 ? `+${l.gbChange}` : l.gbChange} GB
                  </span>
                )}
                {l.pointChange !== undefined && l.pointChange !== 0 && (
                  <span className={l.pointChange > 0 ? 'text-[#3B82F6]' : 'text-[#EF4444]'}>
                    {l.pointChange > 0 ? `+${l.pointChange}` : l.pointChange} VP
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
};
