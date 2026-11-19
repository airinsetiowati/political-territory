import React, { useState } from 'react';
import { 
  History, 
  Search, 
  Filter, 
  Download, 
  RotateCcw,
  Undo2
} from 'lucide-react';
import { useGame } from '../context/GameContext';

export const GameHistoryPage: React.FC = () => {
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
    if (filterType !== 'all' && log.type !== filterType) return false;
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

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6 md:space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-[#EAE9E3] shadow-soft-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F8F5EC] text-xs font-extrabold text-[#253451] mb-2 border border-[#EAE9E3]">
            <span>📜 Match Activity Log</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-display font-black text-[#253451] tracking-tight">
            Riwayat Permainan & Log Aksi
          </h1>
          <p className="text-xs md:text-sm text-[#253451]/70 mt-1">
            Audit jejak langkah seluruh peristiwa permainan: klaim wilayah, perputaran ekonomi, krisis, dan penyelesaian quest.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleUndo}
            disabled={logs.length === 0}
            className="px-4 py-2.5 rounded-2xl bg-[#F8F5EC] hover:bg-[#EAE9E3] text-[#253451] font-bold text-xs border border-[#EAE9E3] transition flex items-center gap-1.5 shadow-xs disabled:opacity-40"
          >
            <Undo2 className="w-4 h-4 text-[#EF956F]" />
            <span>Batalkan Aksi Terakhir</span>
          </button>

          <button
            onClick={handleExportCSV}
            disabled={logs.length === 0}
            className="px-4 py-2.5 rounded-2xl bg-[#253451] hover:bg-[#1C273D] text-white font-extrabold text-xs uppercase tracking-wider transition shadow-soft-sm flex items-center gap-1.5 disabled:opacity-40 game-press"
          >
            <Download className="w-4 h-4 text-[#F4CE70]" />
            <span>Ekspor CSV</span>
          </button>
        </div>
      </div>

      {undoMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 font-bold">
          {undoMessage}
        </div>
      )}

      {/* Filters Bar */}
      <div className="bg-white border border-[#EAE9E3] rounded-3xl p-4 shadow-soft-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 flex-wrap flex-1">
          <div className="relative min-w-[200px] flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Cari deskripsi, kode kartu, atau pemain..."
              className="w-full bg-[#F8F5EC] border border-[#EAE9E3] focus:border-[#253451] rounded-2xl px-3.5 py-2.5 pl-9 text-xs text-[#253451] placeholder-[#253451]/40 outline-none font-bold"
            />
            <Search className="w-4 h-4 text-[#253451]/40 absolute left-3 top-3" />
          </div>

          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            className="bg-[#F8F5EC] border border-[#EAE9E3] rounded-2xl px-3 py-2 text-xs font-bold text-[#253451] outline-none focus:border-[#253451]"
          >
            <option value="all">Semua Jenis Aksi ({logs.length})</option>
            <option value="claim">Klaim Wilayah</option>
            <option value="economic_round">Siklus Ekonomi</option>
            <option value="crisis">Krisis</option>
            <option value="mission_completed">Mission Selesai</option>
            <option value="opportunity">Opportunity</option>
            <option value="manual_adjustment">Manual Adjustment</option>
          </select>

          <select
            value={filterPlayer}
            onChange={e => setFilterPlayer(e.target.value)}
            className="bg-[#F8F5EC] border border-[#EAE9E3] rounded-2xl px-3 py-2 text-xs font-bold text-[#253451] outline-none focus:border-[#253451]"
          >
            <option value="all">Semua Pemain</option>
            {players.map(p => (
              <option key={p.id} value={p.id}>{p.name} ({p.color})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Logs Feed */}
      <div className="bg-white border border-[#EAE9E3] rounded-3xl p-6 shadow-soft-sm space-y-3">
        {filteredLogs.length > 0 ? (
          <div className="divide-y divide-[#EAE9E3]">
            {filteredLogs.map(log => (
              <div key={log.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-3">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[11px] text-[#253451]/50 shrink-0 font-bold">
                    {log.timestamp}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shrink-0 ${
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
          <div className="text-center py-10 text-xs text-[#253451]/50 italic">
            Tidak ada catatan log aksi yang sesuai dengan filter.
          </div>
        )}
      </div>
    </div>
  );
};
