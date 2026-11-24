import React, { useState, useRef } from 'react';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Filter, 
  Eye, 
  EyeOff,
  MapPin,
  Sparkles
} from 'lucide-react';
import { useGame } from '../context/GameContext';
import { Territory, TerritoryCategory } from '../types/game';
import { ORIGINAL_BOARD_MAP, CATEGORY_NAMES } from '../utils/categoryAssets';
import { CategoryLogo } from './CategoryLogo';
import { PlayerLogo } from './PlayerLogo';

export const MapBoardSection: React.FC = () => {
  const { 
    territories, 
    players, 
    settings, 
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

  const getMarkerOwnerRing = (t: Territory) => {
    if (!t.ownerId) {
      return 'ring-2 ring-white/95 shadow-md shadow-black/20 hover:ring-amber-300 hover:ring-3';
    }
    const owner = players.find(p => p.id === t.ownerId);
    if (!owner) return 'ring-2 ring-white shadow-md shadow-black/20';
    if (owner.color === 'red') return 'ring-3 sm:ring-4 ring-[#EF4444] shadow-lg shadow-red-500/50';
    if (owner.color === 'blue') return 'ring-3 sm:ring-4 ring-[#3B82F6] shadow-lg shadow-blue-500/50';
    if (owner.color === 'green') return 'ring-3 sm:ring-4 ring-[#10B981] shadow-lg shadow-emerald-500/50';
    return 'ring-3 sm:ring-4 ring-[#F59E0B] shadow-lg shadow-yellow-500/50';
  };

  const mapSrc = (settings.boardMapImage && settings.boardMapImage.startsWith('data:')) 
    ? settings.boardMapImage 
    : ORIGINAL_BOARD_MAP;

  return (
    <section id="map-section" className="bg-white rounded-3xl border border-[#EAE9E3] shadow-soft-sm p-4 sm:p-5 flex flex-col space-y-3">
      {/* Map Section Header & Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pb-2 border-b border-[#EAE9E3]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#F8F5EC] border border-[#EAE9E3] flex items-center justify-center text-base shadow-xs">
            🗺️
          </div>
          <div>
            <h3 className="font-display font-black text-sm text-[#253451] uppercase tracking-wide">
              Peta Wilayah Resmi (Original Board Map)
            </h3>
            <span className="text-[10px] text-[#253451]/60 font-bold">
              Klik marker untuk membuka formulir klaim & melihat kartu kompatibel
            </span>
          </div>
        </div>

        {/* Toolbar Controls */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="bg-[#F8F5EC] border border-[#EAE9E3] rounded-xl px-2 py-1 text-xs font-bold text-[#253451] outline-none"
          >
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.label}</option>
            ))}
          </select>

          <select
            value={selectedOwner}
            onChange={e => setSelectedOwner(e.target.value)}
            className="bg-[#F8F5EC] border border-[#EAE9E3] rounded-xl px-2 py-1 text-xs font-bold text-[#253451] outline-none"
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
            className={`px-2.5 py-1 rounded-xl border text-xs font-bold flex items-center gap-1 transition ${
              showLabels ? 'bg-[#253451] text-white border-[#253451]' : 'bg-[#F8F5EC] text-[#253451]/70 border-[#EAE9E3]'
            }`}
            title="Tampilkan nama wilayah di peta"
          >
            {showLabels ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
            <span>Nama Wilayah</span>
          </button>

          {/* Zoom Controls */}
          <div className="flex items-center bg-[#F8F5EC] border border-[#EAE9E3] rounded-xl p-0.5">
            <button
              type="button"
              onClick={handleZoomIn}
              title="Zoom In"
              className="p-1 rounded-lg text-[#253451] hover:bg-white transition"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleZoomOut}
              title="Zoom Out"
              className="p-1 rounded-lg text-[#253451] hover:bg-white transition"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleResetView}
              title="Reset View"
              className="p-1 rounded-lg text-[#253451] hover:bg-white transition border-l border-[#EAE9E3]"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>
          <span className="font-mono text-xs font-bold text-[#253451] px-1 hidden xl:inline">
            {Math.round(zoom * 100)}%
          </span>
        </div>
      </div>

      {/* Main Canvas with Aspect Ratio 1209:1024 */}
      <div 
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onWheel={handleWheel}
        className="h-[520px] sm:h-[620px] w-full bg-[#E5DFCD] rounded-2xl overflow-hidden relative flex items-center justify-center cursor-grab active:cursor-grabbing p-2 select-none touch-none"
      >
        <div 
          className="transition-transform duration-75 select-none shrink-0"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: 'center center',
          }}
        >
          {/* Proportional Board Container */}
          <div 
            className="relative select-none shadow-[0_20px_50px_rgba(37,52,81,0.22)] rounded-2xl overflow-visible border-4 border-white/95 bg-[#c8e6a2]"
            style={{
              width: 'min(86vw, calc(580px * (1209 / 1024)))',
              aspectRatio: '1209 / 1024',
            }}
          >
            {/* Custom Physical Board Map Image (Original Background Truth preserved 100%) */}
            <img
              src={mapSrc}
              alt="Political Territory Original Board Game Map"
              className="w-full h-full block object-contain rounded-xl select-none pointer-events-none"
              draggable={false}
              onError={(e) => {
                const target = e.currentTarget;
                if (!target.src.endsWith('/game-assets/map')) {
                  target.src = '/game-assets/map';
                }
              }}
            />

            {/* Interactive Territory Markers Overlay */}
            {filteredTerritories.map(t => {
              const owner = t.ownerId ? players.find(p => p.id === t.ownerId) : null;
              const isHovered = hoveredTerritoryId === t.id;

              return (
                <div
                  key={t.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    openModal('TERRITORY_DETAIL', { territoryId: t.id });
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
                      /* CLAIMED STATE: Player Logo completely covers the original spot on the map */
                      <div className="w-full h-full relative flex items-center justify-center rounded-full animate-in zoom-in-75 duration-200">
                        <PlayerLogo player={owner} size="full" />
                      </div>
                    ) : (
                      /* UNCLAIMED STATE: Original spot on map image is visible, with subtle interactive hover ring */
                      <div className="w-full h-full rounded-full transition-all duration-150 hover:ring-2 hover:ring-amber-400 hover:bg-amber-400/20 active:scale-95 flex items-center justify-center" />
                    )}
                  </div>

                  {/* Clean Hover Tooltip (Authentic Territory Name & Stats without internal codes) */}
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

                  {/* Optional Territory Name Label (Toggled via button, NEVER showing internal codes) */}
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
