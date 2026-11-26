import React, { useState, useRef } from 'react';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Eye,
  EyeOff
} from 'lucide-react';
import { useGame } from '../context/GameContext';
import { Territory } from '../types/game';
import { ORIGINAL_BOARD_MAP, CATEGORY_NAMES } from '../utils/categoryAssets';
import { CategoryLogo } from './CategoryLogo';
import { PlayerLogo } from './PlayerLogo';

export const MapBoardSection: React.FC = () => {
  const {
    territories,
    players,
    settings,
    activePlayer,
    claimTurnPlayer,
    diceState,
    openModal
  } = useGame();

  // Zoom & Pan state
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });

  // Map Filter states
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedOwner, setSelectedOwner] = useState<string>('all');
  const [showLabels, setShowLabels] = useState(false);
  const [hoveredTerritoryId, setHoveredTerritoryId] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Zoom handlers
  const handleZoomIn = () => setZoom(z => Math.min(3.5, z + 0.25));
  const handleZoomOut = () => setZoom(z => Math.max(0.6, z - 0.25));
  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 0.15 : -0.15;
    setZoom(z => Math.max(0.6, Math.min(3.5, z + zoomFactor)));
  };

  // Mouse pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.territory-marker')) return;
    setIsPanning(true);
    setStartPan({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPan({ x: e.clientX - startPan.x, y: e.clientY - startPan.y });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  // Touch pan handlers for Mobile & Tablet
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      if ((e.target as HTMLElement).closest('.territory-marker')) return;
      const touch = e.touches[0];
      setIsPanning(true);
      setStartPan({ x: touch.clientX - pan.x, y: touch.clientY - pan.y });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isPanning && e.touches.length === 1) {
      const touch = e.touches[0];
      setPan({ x: touch.clientX - startPan.x, y: touch.clientY - startPan.y });
    }
  };

  const handleTouchEnd = () => {
    setIsPanning(false);
  };

  // Filtered territories
  const filteredTerritories = territories.filter(t => {
    if (selectedCategory !== 'all' && t.category !== selectedCategory) return false;
    if (selectedOwner === 'unclaimed' && t.ownerId !== null) return false;
    if (selectedOwner === 'claimed' && t.ownerId === null) return false;
    if (selectedOwner !== 'all' && selectedOwner !== 'unclaimed' && selectedOwner !== 'claimed' && t.ownerId !== selectedOwner) {
      return false;
    }
    return true;
  });

  const claimedTotal = territories.filter(t => t.ownerId !== null).length;

  const categories: { id: string; label: string }[] = [
    { id: 'all', label: 'Semua Kategori (40)' },
    { id: 'politics', label: 'Politics (4)' },
    { id: 'industry', label: 'Industry (6)' },
    { id: 'education', label: 'Education (6)' },
    { id: 'healthcare', label: 'Healthcare (6)' },
    { id: 'agriculture', label: 'Agriculture (6)' },
    { id: 'water', label: 'Water (4)' },
    { id: 'tourism', label: 'Tourism (4)' },
    { id: 'forest', label: 'Forest (4)' },
  ];

  const mapSrc = (settings.boardMapImage && settings.boardMapImage.startsWith('data:'))
    ? settings.boardMapImage
    : ORIGINAL_BOARD_MAP;

  return (
    <section id="map-section" className="bg-white rounded-3xl border border-[#EAE9E3] shadow-soft-sm p-3.5 sm:p-4 flex flex-col gap-2.5">
      {/* Compact Header & Unified Filter + Zoom Toolbar */}
      <div className="flex flex-col gap-2 pb-2.5 border-b border-[#EAE9E3]">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-[#F8F5EC] border border-[#EAE9E3] flex items-center justify-center text-sm shadow-xs shrink-0">
              🗺️
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="font-display font-black text-sm text-[#253451] uppercase tracking-wide">
                  Peta Wilayah Resmi
                </h3>
                <span className="text-[10px] font-mono font-extrabold px-2 py-0.5 rounded-full bg-[#F8F5EC] border border-[#EAE9E3] text-[#253451]">
                  {filteredTerritories.length}/40 Area
                </span>
                <span className="text-[10px] font-mono font-bold text-[#2e6d34] bg-[#73B77A]/15 px-2 py-0.5 rounded-full border border-[#73B77A]/25 hidden sm:inline">
                  {claimedTotal} Dikuasai • {40 - claimedTotal} Bebas
                </span>
                {claimTurnPlayer && !diceState.isRolling && (
                  <span className="text-[10px] font-extrabold text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-300">
                    🎲 Giliran Claim: {claimTurnPlayer.name} (Dadu: {diceState.currentValue ?? '-'})
                  </span>
                )}
              </div>
              <span className="text-[10px] text-[#253451]/60 font-bold block truncate">
                Klik marker wilayah di peta untuk klaim area &amp; cek kartu kompatibel
              </span>
            </div>
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="font-mono text-[10px] font-bold text-[#253451]/60 hidden sm:inline">
              {Math.round(zoom * 100)}%
            </span>
            <div className="flex items-center bg-[#F8F5EC] border border-[#EAE9E3] rounded-xl p-0.5">
              <button
                type="button"
                onClick={handleZoomIn}
                title="Zoom In"
                className="p-1.5 rounded-lg text-[#253451] hover:bg-white transition"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleZoomOut}
                title="Zoom Out"
                className="p-1.5 rounded-lg text-[#253451] hover:bg-white transition"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleResetView}
                title="Reset View"
                className="p-1.5 rounded-lg text-[#253451] hover:bg-white transition border-l border-[#EAE9E3]"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-wrap items-center gap-1.5">
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="bg-[#F8F5EC] border border-[#EAE9E3] rounded-xl px-2.5 py-1 text-[11px] font-bold text-[#253451] outline-none cursor-pointer"
          >
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.label}</option>
            ))}
          </select>

          <select
            value={selectedOwner}
            onChange={e => setSelectedOwner(e.target.value)}
            className="bg-[#F8F5EC] border border-[#EAE9E3] rounded-xl px-2.5 py-1 text-[11px] font-bold text-[#253451] outline-none cursor-pointer"
          >
            <option value="all">Semua Pemilik</option>
            <option value="unclaimed">Belum Dikuasai</option>
            <option value="claimed">Sudah Dikuasai</option>
            {players.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => setShowLabels(!showLabels)}
            className={`px-2.5 py-1 rounded-xl border text-[11px] font-bold flex items-center gap-1 transition ${
              showLabels ? 'bg-[#253451] text-white border-[#253451]' : 'bg-[#F8F5EC] text-[#253451]/75 border-[#EAE9E3]'
            }`}
            title="Tampilkan nama wilayah di peta"
          >
            {showLabels ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
            <span>Nama Wilayah</span>
          </button>

          <span className="ml-auto text-[10px] font-bold text-[#253451]/45 hidden md:inline">
            Drag untuk geser • Scroll untuk zoom
          </span>
        </div>
      </div>

      {/* Proportional Board Canvas: fills column width cleanly without wide empty margins */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onWheel={handleWheel}
        className="w-full aspect-[1209/1024] max-h-[620px] bg-[#E5DFCD] rounded-2xl overflow-hidden relative flex items-center justify-center cursor-grab active:cursor-grabbing p-1.5 select-none touch-none"
      >
        <div
          className="w-full h-full flex items-center justify-center transition-transform duration-75 select-none shrink-0"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: 'center center',
          }}
        >
          {/* Proportional Board Container */}
          <div
            className="relative h-full max-w-full select-none shadow-[0_14px_34px_rgba(37,52,81,0.2)] rounded-xl overflow-visible border-[3px] border-white/95 bg-[#c8e6a2]"
            style={{
              aspectRatio: '1209 / 1024',
            }}
          >
            {/* Custom Physical Board Map Image */}
            <img
              src={mapSrc}
              alt="Political Territory Original Board Game Map"
              className="w-full h-full block object-contain rounded-lg select-none pointer-events-none"
              draggable={false}
              onError={(e) => {
                const target = e.currentTarget;
                if (!target.src.endsWith('/game-assets/map')) {
                  target.src = '/game-assets/map';
                }
              }}
            />

            {/* Interactive Territory Markers Overlay */}
            {filteredTerritories.map((t: Territory) => {
              const owner = t.ownerId ? players.find(p => p.id === t.ownerId) : null;
              const isHovered = hoveredTerritoryId === t.id;

              return (
                <div
                  key={t.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    openModal('TERRITORY_DETAIL', {
                      territoryId: t.id,
                      playerId: claimTurnPlayer?.id || activePlayer?.id,
                      rollerId: claimTurnPlayer?.id || undefined
                    });
                  }}
                  onMouseEnter={() => setHoveredTerritoryId(t.id)}
                  onMouseLeave={() => setHoveredTerritoryId(null)}
                  className={`absolute territory-marker cursor-pointer -translate-x-1/2 -translate-y-1/2 aspect-square ${
                    isHovered ? 'z-40' : owner ? 'z-30' : 'z-20'
                  }`}
                  style={{
                    left: `${t.x * 100}%`,
                    top: `${t.y * 100}%`,
                    width: '4.85%',
                  }}
                  title={`${t.name} • ${CATEGORY_NAMES[t.category]}${owner ? ` [${owner.name}]` : ' [Belum Dikuasai]'}`}
                >
                  {/* Visual Marker Container */}
                  <div className={`w-full h-full transition-transform duration-150 ${isHovered ? 'scale-110' : ''}`}>
                    {owner ? (
                      <div className="w-full h-full relative flex items-center justify-center rounded-full animate-in zoom-in-75 duration-200">
                        <PlayerLogo player={owner} size="full" />
                      </div>
                    ) : (
                      <div className="w-full h-full rounded-full transition-all duration-150 hover:ring-2 hover:ring-amber-400 hover:bg-amber-400/20 active:scale-95 flex items-center justify-center" />
                    )}
                  </div>

                  {/* Clean Hover Tooltip */}
                  {isHovered && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 rounded-xl bg-[#253451] text-white shadow-xl pointer-events-none z-50 whitespace-nowrap animate-in fade-in zoom-in-95 duration-150 flex flex-col items-center">
                      <div className="flex items-center gap-1.5 text-xs font-black">
                        {owner ? (
                          <div className="w-3.5 h-3.5 rounded-full shrink-0 overflow-hidden">
                            <PlayerLogo player={owner} size="full" showBadge={false} />
                          </div>
                        ) : (
                          <div className="w-3.5 h-3.5 rounded-full shrink-0 overflow-hidden">
                            <CategoryLogo category={t.category} size="full" />
                          </div>
                        )}
                        <span>{t.name}</span>
                      </div>
                      <div className="text-[10px] text-amber-300 font-mono mt-0.5">
                        +{t.baseIncome} GB/cy • +{t.basePoints} VP • {owner ? owner.name : 'Belum Dikuasai'}
                      </div>
                      <div className="w-2 h-2 bg-[#253451] rotate-45 absolute -bottom-1 left-1/2 -translate-x-1/2" />
                    </div>
                  )}

                  {/* Optional Territory Name Label */}
                  {showLabels && !isHovered && (
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 px-1.5 py-0.5 rounded-md bg-white/95 border border-[#EAE9E3] text-[9px] font-bold text-[#253451] whitespace-nowrap shadow-soft-sm pointer-events-none max-w-[95px] truncate z-20">
                      {t.name}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
