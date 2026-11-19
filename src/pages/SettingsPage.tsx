import React, { useState, useRef } from 'react';
import { 
  Settings, 
  Upload, 
  Download, 
  FileJson, 
  RotateCcw, 
  CheckCircle, 
  AlertTriangle, 
  MapPin,
  Sparkles
} from 'lucide-react';
import { useGame } from '../context/GameContext';
import { ORIGINAL_BOARD_MAP } from '../utils/categoryAssets';

export const SettingsPage: React.FC = () => {
  const { 
    settings, 
    setCustomMapImage, 
    setCustomCardBack, 
    exportGameState, 
    importGameState, 
    resetGame
  } = useGame();

  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [jsonInput, setJsonInput] = useState('');
  const [showJsonImport, setShowJsonImport] = useState(false);

  const mapFileInputRef = useRef<HTMLInputElement>(null);
  const policyBackInputRef = useRef<HTMLInputElement>(null);
  const eventBackInputRef = useRef<HTMLInputElement>(null);

  // File Upload Handlers
  const handleMapUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.match(/image\/(png|jpeg|jpg)/)) {
      setNotification({ type: 'error', text: 'Format harus berupa gambar PNG atau JPG/JPEG.' });
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        await setCustomMapImage(dataUrl);
        setNotification({ type: 'success', text: `Gambar peta board game berhasil diunggah (${file.name}, ${(file.size / 1024).toFixed(0)} KB)!` });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCardBackUpload = (type: 'policy' | 'event', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        await setCustomCardBack(type, dataUrl);
        setNotification({ type: 'success', text: `Desain belakang kartu ${type === 'policy' ? 'Policy' : 'Event'} berhasil diperbarui!` });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleExport = () => {
    const jsonStr = exportGameState();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `political-territory-save-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setNotification({ type: 'success', text: 'Cadangan data pertandingan (JSON) berhasil diekspor!' });
  };

  const handleImport = () => {
    if (!jsonInput.trim()) return;
    const ok = importGameState(jsonInput);
    if (ok) {
      setNotification({ type: 'success', text: 'Data permainan berhasil diimpor dan disinkronkan!' });
      setShowJsonImport(false);
      setJsonInput('');
    } else {
      setNotification({ type: 'error', text: 'Format JSON tidak valid atau file rusak.' });
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-6 md:space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-[#EAE9E3] shadow-soft-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F8F5EC] text-xs font-extrabold text-[#253451] mb-2 border border-[#EAE9E3]">
            <span>⚙️ Game Administration</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-display font-black text-[#253451] tracking-tight">
            Pengaturan Permainan & Aset Kartu
          </h1>
          <p className="text-xs md:text-sm text-[#253451]/70 mt-1">
            Ganti gambar peta fisik, kelola artwork belakang kartu, cadangkan status sesi permainan, atau reset match.
          </p>
        </div>
      </div>

      {notification && (
        <div className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-2.5 border ${
          notification.type === 'error'
            ? 'bg-red-50 border-red-200 text-red-700'
            : 'bg-emerald-50 border-emerald-200 text-emerald-800'
        }`}>
          {notification.type === 'error' ? (
            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
          ) : (
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          )}
          <span>{notification.text}</span>
        </div>
      )}

      {/* Section 1: Custom Board Map Upload */}
      <div className="bg-white border border-[#EAE9E3] rounded-3xl p-6 shadow-soft-sm space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#EAE9E3] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#F8F5EC] border border-[#EAE9E3] flex items-center justify-center text-xl shadow-xs">
              🗺️
            </div>
            <div>
              <h2 className="font-display font-black text-base text-[#253451]">
                Aset Peta Board Game Fisik
              </h2>
              <p className="text-xs text-[#253451]/60">
                Mempertahankan rasio aspek asli map tanpa manipulasi bentuk atau posisi jalur.
              </p>
            </div>
          </div>

          <button
            onClick={() => mapFileInputRef.current?.click()}
            className="px-4 py-2.5 rounded-2xl bg-[#253451] hover:bg-[#1C273D] text-white font-extrabold text-xs uppercase tracking-wider transition flex items-center gap-2 shrink-0 shadow-soft-sm game-press"
          >
            <Upload className="w-4 h-4 text-[#F4CE70]" />
            <span>Unggah Peta Baru (PNG/JPG)</span>
          </button>
          <input
            ref={mapFileInputRef}
            type="file"
            accept="image/png, image/jpeg, image/jpg"
            onChange={handleMapUpload}
            className="hidden"
          />
        </div>

        {/* Map Preview Container */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div className="md:col-span-2 h-72 bg-[#F8F5EC] rounded-2xl overflow-hidden border border-[#EAE9E3] flex items-center justify-center p-3 shadow-xs">
            <img
              src={settings.boardMapImage && settings.boardMapImage.startsWith('data:') ? settings.boardMapImage : ORIGINAL_BOARD_MAP}
              alt="Board Map Preview"
              className="w-full h-full object-contain rounded-xl"
              onError={(e) => {
                const target = e.currentTarget;
                if (!target.src.endsWith('/game-assets/map')) {
                  target.src = '/game-assets/map';
                }
              }}
            />
          </div>

          <div className="space-y-3 text-xs text-[#253451]">
            <div className="bg-[#F8F5EC] p-4 rounded-2xl border border-[#EAE9E3] space-y-2">
              <div className="text-[10px] font-black uppercase tracking-wider text-[#EF956F]">
                Spesifikasi Peta
              </div>
              <div className="flex justify-between font-medium">
                <span className="text-[#253451]/60">Sumber:</span>
                <span className="font-mono font-bold">
                  {settings.boardMapImage.startsWith('data:') ? 'Custom Uploaded' : 'web.png (Default)'}
                </span>
              </div>
              <div className="flex justify-between font-medium">
                <span className="text-[#253451]/60">Rasio Aspek:</span>
                <span className="font-mono font-bold">Original Preserved</span>
              </div>
              <div className="flex justify-between font-medium">
                <span className="text-[#253451]/60">Overlay Marker:</span>
                <span className="font-mono text-[#73B77A] font-bold">40 Wilayah Terpetakan</span>
              </div>
            </div>

            <p className="text-[11px] text-[#253451]/60 leading-relaxed font-medium">
              Marker wilayah terikat secara proporsional (0.0 sampai 1.0) sehingga posisinya selalu tepat di atas gambar asli meskipun di-zoom atau layar berubah ukuran.
            </p>
          </div>
        </div>
      </div>

      {/* Section 2: Physical Card Back Artwork */}
      <div className="bg-white border border-[#EAE9E3] rounded-3xl p-6 shadow-soft-sm space-y-5">
        <div className="border-b border-[#EAE9E3] pb-3">
          <h2 className="font-display font-black text-base text-[#253451] flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#F4CE70]" />
            <span>Artwork Belakang Kartu Fisik</span>
          </h2>
          <p className="text-xs text-[#253451]/60 mt-0.5">
            Lihat atau perbarui desain belakang kartu Policy dan Event untuk animasi flip kartu di companion.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Policy Card Back */}
          <div className="bg-[#F8F5EC] border border-[#EAE9E3] rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-xs font-black uppercase tracking-wider text-[#3B82F6]">
                Belakang Kartu Policy
              </div>
              <button
                onClick={() => policyBackInputRef.current?.click()}
                className="text-xs font-bold text-[#253451] hover:text-[#EF956F] flex items-center gap-1"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Ganti Gambar</span>
              </button>
              <input
                ref={policyBackInputRef}
                type="file"
                accept="image/png, image/jpeg"
                onChange={e => handleCardBackUpload('policy', e)}
                className="hidden"
              />
            </div>

            <div className="h-64 bg-white rounded-xl p-3 border border-[#EAE9E3] flex items-center justify-center shadow-xs">
              <img
                src={settings.policyBackImage || '/game-assets/policy-back'}
                alt="Policy Card Back"
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          {/* Event Card Back */}
          <div className="bg-[#F8F5EC] border border-[#EAE9E3] rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-xs font-black uppercase tracking-wider text-purple-700">
                Belakang Kartu Event (Crisis / Mission / Opp)
              </div>
              <button
                onClick={() => eventBackInputRef.current?.click()}
                className="text-xs font-bold text-[#253451] hover:text-[#EF956F] flex items-center gap-1"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Ganti Gambar</span>
              </button>
              <input
                ref={eventBackInputRef}
                type="file"
                accept="image/png, image/jpeg"
                onChange={e => handleCardBackUpload('event', e)}
                className="hidden"
              />
            </div>

            <div className="h-64 bg-white rounded-xl p-3 border border-[#EAE9E3] flex items-center justify-center shadow-xs">
              <img
                src={settings.eventBackImage || '/game-assets/event-back'}
                alt="Event Card Back"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: Data Backup & Reset */}
      <div className="bg-white border border-[#EAE9E3] rounded-3xl p-6 shadow-soft-sm space-y-5">
        <div className="border-b border-[#EAE9E3] pb-3">
          <h2 className="font-display font-black text-base text-[#253451] flex items-center gap-2">
            <FileJson className="w-5 h-5 text-[#EF956F]" />
            <span>Penyimpanan, Cadangan & Reset Permainan</span>
          </h2>
          <p className="text-xs text-[#253451]/60 mt-0.5">
            Ekspor seluruh data sesi permainan ke file JSON, pulihkan sesi sebelumnya, atau mulai ulang permainan dari awal.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleExport}
            className="px-4 py-2.5 rounded-2xl bg-[#F8F5EC] hover:bg-[#EAE9E3] border border-[#EAE9E3] text-[#253451] font-bold text-xs uppercase tracking-wider transition flex items-center gap-2 shadow-xs"
          >
            <Download className="w-4 h-4 text-[#73B77A]" />
            <span>Ekspor Cadangan (.JSON)</span>
          </button>

          <button
            onClick={() => setShowJsonImport(!showJsonImport)}
            className="px-4 py-2.5 rounded-2xl bg-[#F8F5EC] hover:bg-[#EAE9E3] border border-[#EAE9E3] text-[#253451] font-bold text-xs uppercase tracking-wider transition flex items-center gap-2 shadow-xs"
          >
            <FileJson className="w-4 h-4 text-[#3B82F6]" />
            <span>Impor Cadangan JSON</span>
          </button>

          <button
            onClick={() => {
              if (window.confirm('Apakah Anda yakin ingin me-RESET seluruh pemain, saldo, dan klaim wilayah?')) {
                resetGame();
                setNotification({ type: 'success', text: 'Permainan telah di-reset ke kondisi awal.' });
              }
            }}
            className="px-4 py-2.5 rounded-2xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 font-bold text-xs uppercase tracking-wider transition flex items-center gap-2 shadow-xs ml-auto"
          >
            <RotateCcw className="w-4 h-4 text-red-500" />
            <span>Reset Seluruh Permainan</span>
          </button>
        </div>

        {showJsonImport && (
          <div className="bg-[#F8F5EC] p-4 rounded-2xl border border-[#EAE9E3] space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#253451]">
              Tempelkan Isi Teks JSON Cadangan:
            </label>
            <textarea
              value={jsonInput}
              onChange={e => setJsonInput(e.target.value)}
              rows={4}
              placeholder="Tempelkan string JSON di sini..."
              className="w-full bg-white border border-[#EAE9E3] rounded-xl p-3 text-xs font-mono text-[#253451] outline-none focus:border-[#253451]"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowJsonImport(false)}
                className="px-3.5 py-1.5 rounded-xl bg-white border border-[#EAE9E3] text-[#253451] text-xs font-bold"
              >
                Batal
              </button>
              <button
                onClick={handleImport}
                className="px-4 py-1.5 rounded-xl bg-[#253451] text-white text-xs font-bold"
              >
                Muat Sesi
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
