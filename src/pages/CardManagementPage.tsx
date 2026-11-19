import React, { useState, useRef } from 'react';
import { 
  Sparkles, 
  Search, 
  RotateCcw, 
  Flag, 
  ShieldAlert, 
  Target, 
  TrendingUp, 
  Sliders, 
  Upload, 
  CheckCircle, 
  X 
} from 'lucide-react';
import { useGame } from '../context/GameContext';
import { TerritoryCategory } from '../types/game';

export const CardManagementPage: React.FC = () => {
  const { 
    policyCards, 
    crisisCards, 
    missionCards, 
    opportunityCards, 
    updatePolicyCard, 
    updateCrisisCard, 
    updateMissionCard, 
    updateOpportunityCard, 
    resetDeckCards, 
    updateCardImage, 
    economyConfig, 
    updateEconomyConfig 
  } = useGame();

  const [activeTab, setActiveTab] = useState<'policy' | 'crisis' | 'mission' | 'opportunity' | 'economy'>('policy');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<{ title: string; url: string } | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadTarget, setUploadTarget] = useState<{ deckType: 'policy' | 'crisis' | 'mission' | 'opportunity'; cardId: string } | null>(null);

  const triggerUpload = (deckType: 'policy' | 'crisis' | 'mission' | 'opportunity', cardId: string) => {
    setUploadTarget({ deckType, cardId });
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uploadTarget) return;

    if (!file.type.match(/image\/(png|jpeg|jpg)/)) {
      alert('Format harus berupa gambar PNG atau JPG/JPEG.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        await updateCardImage(uploadTarget.deckType, uploadTarget.cardId, dataUrl);
        setNotification(`Artwork depan kartu berhasil diperbarui!`);
        setTimeout(() => setNotification(null), 3000);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6 md:space-y-8 animate-in fade-in duration-300">
      {/* Hidden file input for card artwork upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png, image/jpeg, image/jpg"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Header */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-[#EAE9E3] shadow-soft-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F8F5EC] text-xs font-extrabold text-[#253451] mb-2 border border-[#EAE9E3]">
            <span>🃏 Card Engine & Economy</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-display font-black text-[#253451] tracking-tight">
            Database Kartu & Konfigurasi Ekonomi Sektor
          </h1>
          <p className="text-xs md:text-sm text-[#253451]/70 mt-1">
            Koreksi kode kartu fisik, perbarui artwork depan kartu, reset deck status, dan sesuaikan nilai parameter sektor.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-64">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Cari kode atau judul kartu..."
            className="w-full bg-[#F8F5EC] border border-[#EAE9E3] focus:border-[#253451] rounded-2xl px-3.5 py-2.5 pl-9 text-xs text-[#253451] placeholder-[#253451]/40 outline-none font-bold"
          />
          <Search className="w-4 h-4 text-[#253451]/40 absolute left-3 top-3" />
        </div>
      </div>

      {notification && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 font-bold flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Tabs & Bulk Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#EAE9E3] pb-3">
        <div className="flex gap-2 overflow-x-auto scrollbar-thin">
          <button
            onClick={() => { setActiveTab('policy'); setEditingCardId(null); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
              activeTab === 'policy'
                ? 'bg-[#253451] text-white shadow-xs'
                : 'text-[#253451]/70 bg-white hover:bg-[#F8F5EC]'
            }`}
          >
            <Flag className="w-4 h-4 text-[#8BBDE2]" />
            <span>Policy ({policyCards.length})</span>
          </button>

          <button
            onClick={() => { setActiveTab('crisis'); setEditingCardId(null); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
              activeTab === 'crisis'
                ? 'bg-[#EF4444] text-white shadow-xs'
                : 'text-[#253451]/70 bg-white hover:bg-[#F8F5EC]'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Crisis ({crisisCards.length})</span>
          </button>

          <button
            onClick={() => { setActiveTab('mission'); setEditingCardId(null); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
              activeTab === 'mission'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-[#253451]/70 bg-white hover:bg-[#F8F5EC]'
            }`}
          >
            <Target className="w-4 h-4" />
            <span>Mission ({missionCards.length})</span>
          </button>

          <button
            onClick={() => { setActiveTab('opportunity'); setEditingCardId(null); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
              activeTab === 'opportunity'
                ? 'bg-[#73B77A] text-white shadow-xs'
                : 'text-[#253451]/70 bg-white hover:bg-[#F8F5EC]'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Opportunity ({opportunityCards.length})</span>
          </button>

          <button
            onClick={() => { setActiveTab('economy'); setEditingCardId(null); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
              activeTab === 'economy'
                ? 'bg-[#F4CE70] text-[#253451] shadow-xs'
                : 'text-[#253451]/70 bg-white hover:bg-[#F8F5EC]'
            }`}
          >
            <Sliders className="w-4 h-4 text-[#EF956F]" />
            <span>Aturan Ekonomi Sektor</span>
          </button>
        </div>

        {/* Bulk Deck Reset Button */}
        {activeTab !== 'economy' && (
          <button
            onClick={() => {
              if (window.confirm(`Reset semua kartu dalam deck ${activeTab.toUpperCase()} ke status Tersedia (Available)?`)) {
                resetDeckCards(activeTab as any);
                setNotification(`Semua kartu deck ${activeTab.toUpperCase()} telah di-reset ke Tersedia.`);
                setTimeout(() => setNotification(null), 3000);
              }
            }}
            className="px-3 py-1.5 rounded-xl bg-white hover:bg-[#F8F5EC] text-[#253451] border border-[#EAE9E3] text-xs font-bold flex items-center gap-1.5 transition shrink-0 shadow-xs"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#EF956F]" />
            <span>Reset Deck {activeTab.toUpperCase()}</span>
          </button>
        )}
      </div>

      {/* Tab 1: Policy Cards */}
      {activeTab === 'policy' && (
        <div className="bg-white border border-[#EAE9E3] rounded-3xl shadow-soft-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#F8F5EC] border-b border-[#EAE9E3] text-[10px] uppercase tracking-wider text-[#253451]/70 font-extrabold">
                  <th className="py-3 px-3 text-center">Artwork</th>
                  <th className="py-3 px-4">Kode</th>
                  <th className="py-3 px-4">Nama Kartu</th>
                  <th className="py-3 px-4">Kategori</th>
                  <th className="py-3 px-3 text-center">Bebas Pilih</th>
                  <th className="py-3 px-3 text-center">Biaya</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-3 text-center">Reusable</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAE9E3] font-medium text-[#253451]">
                {policyCards
                  .filter(c => !searchQuery.trim() || c.code.toLowerCase().includes(searchQuery.toLowerCase()) || c.name.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map(c => {
                    const isEditing = editingCardId === c.id;
                    return (
                      <tr key={c.id} className="hover:bg-[#F8F5EC]/60 transition">
                        <td className="py-2 px-3 text-center">
                          <div className="relative inline-block group">
                            <img
                              src={c.image}
                              alt={c.name}
                              onClick={() => setPreviewImage({ title: c.name, url: c.image })}
                              className="w-10 h-14 object-contain rounded bg-[#F8F5EC] border border-[#EAE9E3] cursor-pointer shadow-xs hover:ring-2 hover:ring-[#253451]"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/game-assets/policy-back';
                              }}
                            />
                            <button
                              onClick={() => triggerUpload('policy', c.id)}
                              className="absolute -bottom-1 -right-1 p-1 rounded-full bg-white text-[#253451] hover:bg-[#253451] hover:text-white border border-[#EAE9E3] opacity-0 group-hover:opacity-100 transition shadow-xs"
                              title="Upload Front Image"
                            >
                              <Upload className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        </td>

                        <td className="py-3 px-4 font-mono font-extrabold text-[#EF956F]">
                          {isEditing ? (
                            <input
                              type="text"
                              defaultValue={c.code}
                              onBlur={e => updatePolicyCard(c.id, { code: e.target.value.toUpperCase() })}
                              className="bg-[#F8F5EC] border border-[#EAE9E3] px-2 py-0.5 rounded text-xs uppercase w-24 text-[#253451] font-bold font-mono"
                            />
                          ) : (
                            c.code
                          )}
                        </td>

                        <td className="py-3 px-4 font-bold text-[#253451]">
                          {isEditing ? (
                            <input
                              type="text"
                              defaultValue={c.name}
                              onBlur={e => updatePolicyCard(c.id, { name: e.target.value })}
                              className="bg-[#F8F5EC] border border-[#EAE9E3] px-2 py-0.5 rounded text-xs w-48 text-[#253451]"
                            />
                          ) : (
                            c.name
                          )}
                        </td>

                        <td className="py-3 px-4 capitalize font-semibold">
                          {c.category}
                        </td>

                        <td className="py-3 px-3 text-center font-bold">
                          {c.isFreeChoice ? (
                            <span className="text-[#73B77A]">Ya (Yes)</span>
                          ) : (
                            <span className="text-[#253451]/40">Tidak</span>
                          )}
                        </td>

                        <td className="py-3 px-3 text-center font-mono font-bold text-[#253451]">
                          {c.claimCost} GB
                        </td>

                        <td className="py-3 px-3 text-center">
                          <button
                            onClick={() => updatePolicyCard(c.id, { isUsed: !c.isUsed })}
                            className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase transition ${
                              c.isUsed ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            }`}
                          >
                            {c.isUsed ? 'Used' : 'Available'}
                          </button>
                        </td>

                        <td className="py-3 px-3 text-center">
                          <input
                            type="checkbox"
                            checked={c.isReusable}
                            onChange={e => updatePolicyCard(c.id, { isReusable: e.target.checked })}
                            className="rounded text-[#253451] accent-[#253451] cursor-pointer"
                          />
                        </td>

                        <td className="py-3 px-4 text-right space-x-2">
                          <button
                            onClick={() => triggerUpload('policy', c.id)}
                            className="text-xs font-bold text-[#253451]/60 hover:text-[#253451] transition"
                            title="Upload artwork"
                          >
                            Ganti Art
                          </button>
                          <button
                            onClick={() => setEditingCardId(isEditing ? null : c.id)}
                            className="text-xs font-bold text-[#253451] hover:text-[#EF956F] transition"
                          >
                            {isEditing ? 'Selesai' : 'Edit'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Crisis Cards */}
      {activeTab === 'crisis' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {crisisCards
            .filter(c => !searchQuery.trim() || c.code.toLowerCase().includes(searchQuery.toLowerCase()) || c.title.toLowerCase().includes(searchQuery.toLowerCase()))
            .map(card => (
              <div key={card.id} className="bg-white border-2 border-[#EAE9E3] rounded-3xl p-5 shadow-soft-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={card.image}
                      alt={card.title}
                      onClick={() => setPreviewImage({ title: card.title, url: card.image })}
                      className="w-10 h-14 object-contain rounded bg-[#F8F5EC] border border-[#EAE9E3] cursor-pointer shrink-0"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/game-assets/event-back';
                      }}
                    />
                    <div>
                      <span className="font-mono text-xs font-extrabold text-[#EF956F] block">{card.code}</span>
                      <input
                        type="text"
                        defaultValue={card.title}
                        onBlur={e => updateCrisisCard(card.id, { title: e.target.value })}
                        className="bg-[#F8F5EC] border border-[#EAE9E3] rounded-xl px-2 py-0.5 text-xs font-bold text-[#253451] w-44"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => triggerUpload('crisis', card.id)}
                      className="text-[10px] text-[#253451] hover:text-[#EF956F] border border-[#EAE9E3] bg-[#F8F5EC] rounded-xl px-2.5 py-1 font-bold"
                    >
                      Art
                    </button>

                    <button
                      onClick={() => updateCrisisCard(card.id, { isUsed: !card.isUsed })}
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                        card.isUsed ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {card.isUsed ? 'Used' : 'Ready'}
                    </button>
                  </div>
                </div>

                <textarea
                  defaultValue={card.description}
                  onBlur={e => updateCrisisCard(card.id, { description: e.target.value })}
                  rows={2}
                  className="w-full bg-[#F8F5EC] border border-[#EAE9E3] rounded-xl p-2.5 text-xs text-[#253451] outline-none font-medium"
                />

                {/* Options editor */}
                <div className="space-y-1.5 pt-2 border-t border-[#EAE9E3] text-xs">
                  {card.options.map((opt, i) => (
                    <div key={opt.id} className="bg-[#F8F5EC] p-2.5 rounded-xl border border-[#EAE9E3] flex items-center justify-between gap-2">
                      <span className="font-bold text-[#253451] w-5">{opt.id}:</span>
                      <input
                        type="text"
                        defaultValue={opt.text}
                        onBlur={e => {
                          const newOptions = [...card.options] as [any, any, any];
                          newOptions[i] = { ...opt, text: e.target.value };
                          updateCrisisCard(card.id, { options: newOptions });
                        }}
                        className="bg-white border border-[#EAE9E3] rounded px-2 py-0.5 text-xs text-[#253451] flex-1 font-medium"
                      />
                      <div className="flex items-center gap-1 font-mono text-[11px] shrink-0 font-bold">
                        <span>GB:</span>
                        <input
                          type="number"
                          defaultValue={opt.costGB}
                          onBlur={e => {
                            const newOptions = [...card.options] as [any, any, any];
                            newOptions[i] = { ...opt, costGB: parseInt(e.target.value) || 0 };
                            updateCrisisCard(card.id, { options: newOptions });
                          }}
                          className="w-10 bg-white border border-[#EAE9E3] rounded text-center text-[#EF956F]"
                        />
                        <span>VP:</span>
                        <input
                          type="number"
                          defaultValue={opt.pointChange}
                          onBlur={e => {
                            const newOptions = [...card.options] as [any, any, any];
                            newOptions[i] = { ...opt, pointChange: parseInt(e.target.value) || 0 };
                            updateCrisisCard(card.id, { options: newOptions });
                          }}
                          className="w-10 bg-white border border-[#EAE9E3] rounded text-center text-[#3B82F6]"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Tab 3: Mission Cards */}
      {activeTab === 'mission' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {missionCards
            .filter(m => !searchQuery.trim() || m.code.toLowerCase().includes(searchQuery.toLowerCase()) || m.title.toLowerCase().includes(searchQuery.toLowerCase()))
            .map(card => (
              <div key={card.id} className="bg-white border-2 border-[#EAE9E3] rounded-3xl p-5 shadow-soft-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={card.image}
                      alt={card.title}
                      onClick={() => setPreviewImage({ title: card.title, url: card.image })}
                      className="w-10 h-14 object-contain rounded bg-[#F8F5EC] border border-[#EAE9E3] cursor-pointer shrink-0"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/game-assets/event-back';
                      }}
                    />
                    <div>
                      <span className="font-mono text-xs font-extrabold text-purple-700 block">{card.code}</span>
                      <input
                        type="text"
                        defaultValue={card.title}
                        onBlur={e => updateMissionCard(card.id, { title: e.target.value })}
                        className="bg-[#F8F5EC] border border-[#EAE9E3] rounded-xl px-2 py-0.5 text-xs font-bold text-[#253451] w-44"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => triggerUpload('mission', card.id)}
                      className="text-[10px] text-[#253451] hover:text-[#EF956F] border border-[#EAE9E3] bg-[#F8F5EC] rounded-xl px-2.5 py-1 font-bold"
                    >
                      Art
                    </button>

                    <button
                      onClick={() => updateMissionCard(card.id, { status: card.status === 'completed' ? 'available' : 'completed', isUsed: card.status !== 'completed' })}
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                        card.status === 'completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {card.status}
                    </button>
                  </div>
                </div>

                <textarea
                  defaultValue={card.description}
                  onBlur={e => updateMissionCard(card.id, { description: e.target.value })}
                  rows={2}
                  className="w-full bg-[#F8F5EC] border border-[#EAE9E3] rounded-xl p-2.5 text-xs text-[#253451] outline-none font-medium"
                />

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#EAE9E3] text-xs font-mono font-bold">
                  <div className="flex items-center justify-between bg-[#F8F5EC] p-2 rounded-xl border border-[#EAE9E3]">
                    <span className="text-[#253451]/60">Reward VP:</span>
                    <input
                      type="number"
                      defaultValue={card.rewardPoints}
                      onBlur={e => updateMissionCard(card.id, { rewardPoints: parseInt(e.target.value) || 0 })}
                      className="w-12 bg-white border border-[#EAE9E3] rounded text-center text-[#3B82F6] font-bold"
                    />
                  </div>

                  <div className="flex items-center justify-between bg-[#F8F5EC] p-2 rounded-xl border border-[#EAE9E3]">
                    <span className="text-[#253451]/60">Reward GB:</span>
                    <input
                      type="number"
                      defaultValue={card.rewardGB}
                      onBlur={e => updateMissionCard(card.id, { rewardGB: parseInt(e.target.value) || 0 })}
                      className="w-12 bg-white border border-[#EAE9E3] rounded text-center text-[#253451] font-bold"
                    />
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Tab 4: Opportunity Cards */}
      {activeTab === 'opportunity' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {opportunityCards
            .filter(o => !searchQuery.trim() || o.code.toLowerCase().includes(searchQuery.toLowerCase()) || o.title.toLowerCase().includes(searchQuery.toLowerCase()))
            .map(card => (
              <div key={card.id} className="bg-white border-2 border-[#EAE9E3] rounded-3xl p-5 shadow-soft-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={card.image}
                      alt={card.title}
                      onClick={() => setPreviewImage({ title: card.title, url: card.image })}
                      className="w-10 h-14 object-contain rounded bg-[#F8F5EC] border border-[#EAE9E3] cursor-pointer shrink-0"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/game-assets/event-back';
                      }}
                    />
                    <div>
                      <span className="font-mono text-xs font-extrabold text-emerald-700 block">{card.code}</span>
                      <input
                        type="text"
                        defaultValue={card.title}
                        onBlur={e => updateOpportunityCard(card.id, { title: e.target.value })}
                        className="bg-[#F8F5EC] border border-[#EAE9E3] rounded-xl px-2 py-0.5 text-xs font-bold text-[#253451] w-44"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => triggerUpload('opportunity', card.id)}
                      className="text-[10px] text-[#253451] hover:text-[#EF956F] border border-[#EAE9E3] bg-[#F8F5EC] rounded-xl px-2.5 py-1 font-bold"
                    >
                      Art
                    </button>

                    <label className="text-[10px] text-[#253451] flex items-center gap-1 cursor-pointer font-bold">
                      <input
                        type="checkbox"
                        checked={card.isPermanent}
                        onChange={e => updateOpportunityCard(card.id, { isPermanent: e.target.checked })}
                        className="rounded text-[#253451] accent-[#253451]"
                      />
                      <span>Permanen</span>
                    </label>
                  </div>
                </div>

                <textarea
                  defaultValue={card.description}
                  onBlur={e => updateOpportunityCard(card.id, { description: e.target.value })}
                  rows={2}
                  className="w-full bg-[#F8F5EC] border border-[#EAE9E3] rounded-xl p-2.5 text-xs text-[#253451] outline-none font-medium"
                />

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#EAE9E3] text-xs font-mono font-bold">
                  <div className="bg-[#F8F5EC] p-2 rounded-xl border border-[#EAE9E3] text-center">
                    <span className="text-[10px] text-[#253451]/60 block">Biaya GB</span>
                    <input
                      type="number"
                      defaultValue={card.costGB}
                      onBlur={e => updateOpportunityCard(card.id, { costGB: parseInt(e.target.value) || 0 })}
                      className="w-12 bg-white border border-[#EAE9E3] rounded text-center text-[#EF956F] font-bold"
                    />
                  </div>

                  <div className="bg-[#F8F5EC] p-2 rounded-xl border border-[#EAE9E3] text-center">
                    <span className="text-[10px] text-[#253451]/60 block">Rec. GB/cy</span>
                    <input
                      type="number"
                      defaultValue={card.recurringGB}
                      onBlur={e => updateOpportunityCard(card.id, { recurringGB: parseInt(e.target.value) || 0 })}
                      className="w-12 bg-white border border-[#EAE9E3] rounded text-center text-[#73B77A] font-bold"
                    />
                  </div>

                  <div className="bg-[#F8F5EC] p-2 rounded-xl border border-[#EAE9E3] text-center">
                    <span className="text-[10px] text-[#253451]/60 block">Poin VP</span>
                    <input
                      type="number"
                      defaultValue={card.immediatePoints}
                      onBlur={e => updateOpportunityCard(card.id, { immediatePoints: parseInt(e.target.value) || 0 })}
                      className="w-12 bg-white border border-[#EAE9E3] rounded text-center text-[#3B82F6] font-bold"
                    />
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Tab 5: Base Sector Economy Configuration */}
      {activeTab === 'economy' && (
        <div className="bg-white border border-[#EAE9E3] rounded-3xl p-6 shadow-soft-sm space-y-6">
          <div className="border-b border-[#EAE9E3] pb-3">
            <h2 className="text-base font-display font-black text-[#253451]">
              Aturan Dasar Ekonomi Sektor (8 Kategori Wilayah)
            </h2>
            <p className="text-xs text-[#253451]/70 mt-0.5">
              Sesuaikan bobot poin kemenangan VP, biaya pembelian wilayah, dan pemasukan ekonomi berkala per sektor.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {(Object.keys(economyConfig) as TerritoryCategory[]).map(cat => {
              const cfg = economyConfig[cat];
              return (
                <div key={cat} className="bg-[#F8F5EC] border border-[#EAE9E3] rounded-2xl p-4 space-y-3">
                  <div className="font-extrabold text-sm uppercase tracking-wider text-[#253451] border-b border-[#EAE9E3] pb-1.5 capitalize">
                    {cat}
                  </div>

                  <div className="space-y-2 text-xs font-mono font-bold">
                    <div className="flex justify-between items-center">
                      <span className="text-[#253451]/60">Base VP:</span>
                      <input
                        type="number"
                        value={cfg.basePoints}
                        onChange={e => updateEconomyConfig({
                          [cat]: { ...cfg, basePoints: parseInt(e.target.value) || 0 }
                        })}
                        className="w-16 bg-white border border-[#EAE9E3] rounded-xl px-2 py-0.5 text-center text-[#3B82F6] font-bold"
                      />
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-[#253451]/60">Biaya Klaim:</span>
                      <input
                        type="number"
                        value={cfg.claimCost}
                        onChange={e => updateEconomyConfig({
                          [cat]: { ...cfg, claimCost: parseInt(e.target.value) || 0 }
                        })}
                        className="w-16 bg-white border border-[#EAE9E3] rounded-xl px-2 py-0.5 text-center text-[#253451] font-bold"
                      />
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-[#253451]/60">Income/Siklus:</span>
                      <input
                        type="number"
                        value={cfg.baseIncome}
                        onChange={e => updateEconomyConfig({
                          [cat]: { ...cfg, baseIncome: parseInt(e.target.value) || 0 }
                        })}
                        className="w-16 bg-white border border-[#EAE9E3] rounded-xl px-2 py-0.5 text-center text-[#73B77A] font-bold"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Full Artwork Preview Modal */}
      {previewImage && (
        <div 
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-50 bg-[#253451]/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200 cursor-pointer"
        >
          <div className="bg-white border border-[#EAE9E3] rounded-3xl p-5 max-w-md w-full shadow-soft-lg relative">
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 text-[#253451]/60 hover:text-[#253451] p-1 rounded-xl hover:bg-[#F8F5EC]"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="text-xs font-black text-[#253451] uppercase tracking-wider mb-2">
              {previewImage.title}
            </div>
            <div className="h-96 bg-[#F8F5EC] rounded-2xl overflow-hidden border border-[#EAE9E3] flex items-center justify-center p-2">
              <img
                src={previewImage.url}
                alt={previewImage.title}
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
