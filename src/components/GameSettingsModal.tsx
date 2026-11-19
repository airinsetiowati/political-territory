import React, { useState } from 'react';
import { 
  X, 
  Settings, 
  Clock, 
  Volume2, 
  VolumeX, 
  Download, 
  Upload, 
  RotateCcw, 
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { useGame } from '../context/GameContext';

export const GameSettingsModal: React.FC = () => {
  const { 
    activeModal, 
    closeModal, 
    settings, 
    setEconomicInterval, 
    toggleSound, 
    exportGameState, 
    importGameState, 
    openModal 
  } = useGame();

  const [notification, setNotification] = useState<string | null>(null);

  if (activeModal !== 'SETTINGS') return null;

  const intervalPresets = [
    { label: '1 menit', seconds: 60 },
    { label: '3 menit', seconds: 180 },
    { label: '5 menit (Standar)', seconds: 300 },
    { label: '10 menit', seconds: 600 },
    { label: '15 menit', seconds: 900 },
  ];

  const handleExport = () => {
    const jsonStr = exportGameState();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `political-territory-save-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setNotification('Data sesi permainan berhasil diekspor.');
    setTimeout(() => setNotification(null), 3000);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const ok = importGameState(content);
      if (ok) {
        setNotification('Data sesi permainan berhasil dipulihkan.');
        setTimeout(() => {
          setNotification(null);
          closeModal();
        }, 1200);
      } else {
        setNotification('Gagal mengimpor file backup.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#253451]/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white border border-[#EAE9E3] rounded-3xl max-w-lg w-full p-6 shadow-soft-lg relative">
        <button
          onClick={closeModal}
          className="absolute top-4 right-4 text-[#253451]/60 hover:text-[#253451] p-1.5 rounded-xl hover:bg-[#F8F5EC] transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5 border-b border-[#EAE9E3] pb-3">
          <div className="w-10 h-10 rounded-2xl bg-[#F8F5EC] border border-[#EAE9E3] flex items-center justify-center">
            <Settings className="w-5 h-5 text-[#253451]" />
          </div>
          <div>
            <h2 className="text-lg font-display font-black text-[#253451] uppercase tracking-wide">
              Pengaturan Permainan
            </h2>
            <p className="text-xs text-[#253451]/60">
              Konfigurasi durasi siklus ekonomi, audio, dan cadangan data.
            </p>
          </div>
        </div>

        {notification && (
          <div className="p-3 mb-4 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{notification}</span>
          </div>
        )}

        <div className="space-y-4 text-xs text-[#253451]">
          {/* Interval Presets */}
          <div>
            <label className="block font-extrabold uppercase tracking-wider text-[11px] text-[#253451]/70 mb-2">
              Durasi Siklus Ekonomi:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {intervalPresets.map(p => (
                <button
                  key={p.seconds}
                  type="button"
                  onClick={() => setEconomicInterval(p.seconds)}
                  className={`py-2 px-2.5 rounded-xl border text-xs font-bold transition ${
                    settings.economicIntervalSeconds === p.seconds
                      ? 'bg-[#253451] text-white border-[#253451]'
                      : 'bg-[#F8F5EC] border-[#EAE9E3] hover:bg-[#EAE9E3]'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sound Toggle */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-[#F8F5EC] border border-[#EAE9E3]">
            <div className="flex items-center gap-2 font-bold">
              {settings.soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-600" /> : <VolumeX className="w-4 h-4 text-gray-400" />}
              <span>Efek Suara Permainan</span>
            </div>
            <button
              type="button"
              onClick={toggleSound}
              className={`px-3 py-1 rounded-xl text-xs font-extrabold uppercase transition ${
                settings.soundEnabled ? 'bg-emerald-600 text-white' : 'bg-gray-300 text-gray-700'
              }`}
            >
              {settings.soundEnabled ? 'Aktif' : 'Mati'}
            </button>
          </div>

          {/* Export / Import */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleExport}
              className="py-2.5 px-3 rounded-xl bg-[#F8F5EC] hover:bg-[#EAE9E3] border border-[#EAE9E3] font-bold text-xs flex items-center justify-center gap-1.5 transition"
            >
              <Download className="w-3.5 h-3.5 text-[#F4CE70]" />
              <span>Ekspor Sesi (JSON)</span>
            </button>

            <label className="py-2.5 px-3 rounded-xl bg-[#F8F5EC] hover:bg-[#EAE9E3] border border-[#EAE9E3] font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition">
              <Upload className="w-3.5 h-3.5 text-[#3B82F6]" />
              <span>Impor Sesi</span>
              <input type="file" accept=".json" onChange={handleImport} className="hidden" />
            </label>
          </div>

          {/* Game Management Controls */}
          <div className="pt-2 border-t border-[#EAE9E3] space-y-2">
            <button
              type="button"
              onClick={() => {
                closeModal();
                openModal('END_GAME');
              }}
              className="w-full py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-xs"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Akhiri Pertandingan (End Game)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
