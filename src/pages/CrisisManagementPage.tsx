import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Search, 
  ArrowRight, 
  AlertTriangle,
  QrCode
} from 'lucide-react';
import { useGame } from '../context/GameContext';

export const CrisisManagementPage: React.FC = () => {
  const { 
    crisisCards, 
    openModal, 
    verifyCardCode, 
    logs 
  } = useGame();

  const [filterStatus, setFilterStatus] = useState<'all' | 'ready' | 'resolved'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [quickCodeInput, setQuickCodeInput] = useState('');
  const [scanError, setScanError] = useState<string | null>(null);

  const handleLaunchCode = (e: React.FormEvent) => {
    e.preventDefault();
    setScanError(null);
    if (!quickCodeInput.trim()) return;

    const res = verifyCardCode(quickCodeInput);
    if (res.type === 'crisis') {
      openModal('CRISIS_DETAIL', { card: res.card });
      setQuickCodeInput('');
    } else if (res.type === 'not_found') {
      setScanError(`Kode Krisis "${quickCodeInput.toUpperCase()}" tidak ditemukan dalam database.`);
    } else {
      setScanError(`Kode "${quickCodeInput.toUpperCase()}" adalah kartu ${res.type.toUpperCase()}, bukan kartu Crisis.`);
    }
  };

  const filteredCards = crisisCards.filter(c => {
    if (filterStatus === 'ready' && c.isUsed) return false;
    if (filterStatus === 'resolved' && !c.isUsed) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchCode = c.code.toLowerCase().includes(q);
      const matchTitle = c.title.toLowerCase().includes(q);
      const matchDesc = c.description.toLowerCase().includes(q);
      if (!matchCode && !matchTitle && !matchDesc) return false;
    }
    return true;
  });

  const readyCount = crisisCards.filter(c => !c.isUsed).length;
  const resolvedCount = crisisCards.filter(c => c.isUsed).length;

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6 md:space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-[#EAE9E3] shadow-soft-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-xs font-extrabold text-red-800 mb-2 border border-red-200">
            <span>⚡ Emergency Decision Desk</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-display font-black text-[#253451] tracking-tight">
            Pusat Pengambilan Keputusan Krisis
          </h1>
          <p className="text-xs md:text-sm text-[#253451]/70 mt-1">
            Selesaikan kartu Crisis darurat, tentukan kebijakan respons pemerintah, dan tanggung konsekuensi terhadap anggaran atau reputasi VP.
          </p>
        </div>

        {/* Counters */}
        <div className="flex items-center gap-2.5">
          <div className="bg-[#73B77A]/15 border border-[#73B77A]/30 rounded-2xl px-4 py-2.5 text-center shadow-xs">
            <span className="text-[#253451]/60 block text-[10px] font-extrabold uppercase">Siap Ditarik</span>
            <span className="text-[#253451] font-mono font-black text-base">{readyCount} / {crisisCards.length}</span>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-2.5 text-center shadow-xs">
            <span className="text-red-700 block text-[10px] font-extrabold uppercase">Sudah Diselesaikan</span>
            <span className="text-red-800 font-mono font-black text-base">{resolvedCount} / {crisisCards.length}</span>
          </div>
        </div>
      </div>

      {/* Quick Launch & Search Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Quick Launch Code Input */}
        <form onSubmit={handleLaunchCode} className="md:col-span-2 bg-white border border-[#EAE9E3] rounded-3xl p-4 shadow-soft-sm flex items-center gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={quickCodeInput}
              onChange={e => setQuickCodeInput(e.target.value)}
              placeholder="Masukkan kode kartu krisis: CRS-01 s/d CRS-20..."
              className="w-full bg-[#F8F5EC] border border-[#EAE9E3] focus:border-[#253451] rounded-2xl px-4 py-3 text-xs font-mono uppercase text-[#253451] outline-none font-bold"
            />
            <QrCode className="w-4 h-4 text-[#253451]/40 absolute right-3.5 top-3.5" />
          </div>
          <button
            type="submit"
            className="px-5 py-3 rounded-2xl bg-[#EF4444] hover:bg-red-600 text-white font-extrabold text-xs uppercase tracking-wider transition shrink-0 shadow-soft-sm game-press"
          >
            Buka Krisis
          </button>
        </form>

        {/* Filter Selection */}
        <div className="bg-white border border-[#EAE9E3] rounded-3xl p-4 shadow-soft-sm flex items-center gap-3">
          <span className="text-xs font-extrabold text-[#253451]/60 uppercase">Filter:</span>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value as any)}
            className="w-full bg-[#F8F5EC] border border-[#EAE9E3] rounded-2xl px-3 py-2 text-xs font-bold text-[#253451] outline-none focus:border-[#253451]"
          >
            <option value="all">Semua Krisis ({crisisCards.length})</option>
            <option value="ready">Belum Muncul ({readyCount})</option>
            <option value="resolved">Sudah Direspons ({resolvedCount})</option>
          </select>
        </div>
      </div>

      {scanError && (
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 flex items-center gap-2 font-medium">
          <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
          <span>{scanError}</span>
        </div>
      )}

      {/* Crisis Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCards.map(card => (
          <div
            key={card.id}
            onClick={() => openModal('CRISIS_DETAIL', { card })}
            className="bg-white border-2 border-[#EAE9E3] hover:border-red-300 rounded-3xl overflow-hidden shadow-soft-sm card-hover transition cursor-pointer flex flex-col justify-between group"
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
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-200">
                  ⚡ CRISIS
                </span>
                <span className="font-mono text-xs font-extrabold text-[#EF956F] bg-[#F8F5EC] px-2 py-0.5 rounded-md border border-[#EAE9E3]">
                  {card.code}
                </span>
              </div>

              <h3 className="font-display font-extrabold text-sm text-[#253451] group-hover:text-red-600 transition">
                {card.title}
              </h3>

              <p className="text-xs text-[#253451]/75 line-clamp-2 font-medium">
                {card.description}
              </p>

              <div className="pt-2 border-t border-[#EAE9E3] flex items-center justify-between text-[11px] font-bold">
                <span className={card.isUsed ? 'text-red-600' : 'text-[#73B77A]'}>
                  {card.isUsed ? 'SUDAH DIRESPONS' : 'SIAP DITARIK'}
                </span>
                <span className="text-[#253451] flex items-center gap-1 group-hover:translate-x-1 transition">
                  <span>Pilih Solusi</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
