import React, { useState, useRef } from 'react';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Filter, 
  Edit3, 
  Plus, 
  Eye, 
  EyeOff,
  Move
} from 'lucide-react';
import { useGame } from '../context/GameContext';
import { Territory } from '../types/game';
import { ORIGINAL_BOARD_MAP } from '../utils/categoryAssets';
import { TerritoryClaimMarker } from '../components/TerritoryClaimMarker';

export const TerritoryMapPage: React.FC = () => {
  const { 
    territories, 
    players, 
    settings, 
    openModal, 
    updateTerritory, 
    addTerritoryMarker, 
    deleteTerritoryMarker 
  } = useGame();

  // Zoom & Pan state
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });

  // Map Filter states
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedOwner, setSelectedOwner] = useState<string>('all');
  const [showLabels, setShowLabels] = useState(true);
  const [hoveredTerritoryId, setHoveredTerritoryId] = useState<string | null>(null);

  // Map Editor Mode state
  const [isEditMode, setIsEditMode] = useState(false);
  const [activeEditingTerritory, setActiveEditingTerritory] = useState<Territory | null>(null);
  const [draggingTerritoryId, setDraggingTerritoryId] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const mapImageRef = useRef<HTMLImageElement>(null);

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
    } else if (isEditMode && draggingTerritoryId && mapImageRef.current) {
      const rect = mapImageRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      const clampedX = Math.max(0.01, Math.min(0.99, parseFloat(x.toFixed(4))));
      const clampedY = Math.max(0.01, Math.min(0.99, parseFloat(y.toFixed(4))));
      updateTerritory(draggingTerritoryId, { x: clampedX, y: clampedY });
      setActiveEditingTerritory(prev => prev && prev.id === draggingTerritoryId ? { ...prev, x: clampedX, y: clampedY } : prev);
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    setDraggingTerritoryId(null);
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

  // Handle marker click
  const handleMarkerClick = (t: Territory) => {
    if (isEditMode) {
      setActiveEditingTerritory(t);
    } else {
      openModal('TERRITORY_DETAIL', { territoryId: t.id });
    }
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

  // Map image source: custom uploaded (base64) or the authentic original physical board map
  const mapSrc = (settings.boardMapImage && settings.boardMapImage.startsWith('data:')) 
    ? settings.boardMapImage 
    : ORIGINAL_BOARD_MAP;

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] select-none overflow-hidden relative animate-in fade-in duration-200 bg-[#E8E2D2]">
      {/* Top Filter & Toolbar Bar */}
      <div className="bg-white/95 border-b border-[#EAE9E3] px-3 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-2.5 shrink-0 z-20 backdrop-blur-md shadow-xs">
        {/* Category & Owner Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-[#253451]/60 mr-1">
            <Filter className="w-3.5 h-3.5 text-[#F4CE70]" />
            <span className="font-extrabold uppercase tracking-wider text-[11px] hidden sm:inline">Filter:</span>
          </div>

          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="bg-[#F8F5EC] border border-[#EAE9E3] rounded-xl px-2.5 sm:px-3 py-1.5 text-xs font-bold text-[#253451] outline-none focus:border-[#253451]"
          >
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.label}</option>
            ))}
          </select>

          <select
            value={selectedOwner}
            onChange={e => setSelectedOwner(e.target.value)}
            className="bg-[#F8F5EC] border border-[#EAE9E3] rounded-xl px-2.5 sm:px-3 py-1.5 text-xs font-bold text-[#253451] outline-none focus:border-[#253451]"
          >
            <option value="all">Semua Kepemilikan ({territories.length})</option>
            <option value="unclaimed">Belum Dikuasai ({territories.filter(t => !t.ownerId).length})</option>
            <option value="claimed">Sudah Dikuasai ({territories.filter(t => t.ownerId).length})</option>
            {players.map(p => (
              <option key={p.id} value={p.id}>{p.name} ({p.color.toUpperCase()})</option>
            ))}
          </select>

          <button
            onClick={() => setShowLabels(!showLabels)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition ${
              showLabels ? 'bg-[#253451] text-white border-[#253451]' : 'bg-[#F8F5EC] text-[#253451]/70 border-[#EAE9E3]'
            }`}
          >
            {showLabels ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span>Labels</span>
          </button>
        </div>

        {/* Zoom & View Controls & Admin Edit Mode Toggle */}
        <div className="flex items-center gap-2">
          {/* Zoom buttons */}
          <div className="flex items-center bg-[#F8F5EC] border border-[#EAE9E3] rounded-xl p-0.5 shadow-xs">
            <button
              onClick={handleZoomIn}
              title="Zoom In"
              className="p-1.5 rounded-lg text-[#253451] hover:bg-white transition"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={handleZoomOut}
              title="Zoom Out"
              className="p-1.5 rounded-lg text-[#253451] hover:bg-white transition"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={handleResetView}
              title="Reset View"
              className="p-1.5 rounded-lg text-[#253451] hover:bg-white transition border-l border-[#EAE9E3] ml-0.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          <span className="font-mono text-xs text-[#253451] font-bold px-1 hidden sm:inline">
            {Math.round(zoom * 100)}%
          </span>

          {/* Map Editor Mode Toggle */}
          <button
            onClick={() => {
              setIsEditMode(!isEditMode);
              setActiveEditingTerritory(null);
            }}
            className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border ${
              isEditMode
                ? 'bg-[#F4CE70] text-[#253451] border-[#F4CE70] shadow-sm'
                : 'bg-[#F8F5EC] hover:bg-[#EAE9E3] text-[#253451] border-[#EAE9E3]'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{isEditMode ? 'Exit' : 'Editor'}</span>
          </button>
        </div>
      </div>

      {/* Main Map Canvas Area */}
      <div 
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onWheel={handleWheel}
        className={`flex-1 overflow-hidden relative flex items-center justify-center cursor-grab active:cursor-grabbing p-2 sm:p-4 touch-none ${
          isEditMode ? 'ring-4 ring-[#F4CE70]/40' : ''
        }`}
      >
        {/* Transform Container with Pan & Zoom */}
        <div 
          className="transition-transform duration-75 select-none shrink-0"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: 'center center',
          }}
        >
          {/* Strictly 1:1 Image-locked Coordinate Frame (ring instead of border avoids box-inset offset) */}
          <div className="relative inline-block select-none shadow-[0_20px_50px_rgba(37,52,81,0.22)] rounded-2xl overflow-visible ring-4 ring-white/95 bg-[#c8e6a2]">
            {/* Custom Physical Board Map Image (Original Background Truth preserved 100%) */}
            <img
              ref={mapImageRef}
              src={mapSrc}
              alt="Political Territory Original Board Game Map"
              className="block max-w-[92vw] max-h-[calc(100vh-7.5rem)] w-auto h-auto rounded-2xl select-none pointer-events-none"
              draggable={false}
              onError={(e) => {
                const target = e.currentTarget;
                if (!target.src.endsWith('/game-assets/map')) {
                  target.src = '/game-assets/map';
                }
              }}
            />

            {/* Interactive Territory Markers Overlay */}
            <div className="absolute inset-0 pointer-events-none">
              {filteredTerritories.map(t => {
                const isEditing = activeEditingTerritory?.id === t.id;
                const owner = t.ownerId ? players.find(p => p.id === t.ownerId) || null : null;

                return (
                  <TerritoryClaimMarker
                    key={t.id}
                    territory={t}
                    owner={owner}
                    isHovered={hoveredTerritoryId === t.id}
                    isEditing={isEditing}
                    isEditMode={isEditMode}
                    showLabel={showLabels}
                    markerWidthPercent={4.6}
                    onMouseDown={(e) => {
                      if (isEditMode) {
                        e.stopPropagation();
                        setDraggingTerritoryId(t.id);
                        setActiveEditingTerritory(t);
                      }
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMarkerClick(t);
                    }}
                    onMouseEnter={() => setHoveredTerritoryId(t.id)}
                    onMouseLeave={() => setHoveredTerritoryId(null)}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Admin Map Editor Drawer (Bottom Panel when active) */}
      {isEditMode && (
        <div className="bg-white border-t-2 border-[#F4CE70] p-3 sm:p-4 shrink-0 shadow-soft-lg z-30 animate-in slide-in-from-bottom-5">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#F4CE70]/30 text-[#253451] flex items-center justify-center border border-[#F4CE70] shrink-0">
                <Move className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-black text-[#253451] uppercase tracking-wider">
                  Admin Map Marker Editor
                </div>
                <div className="text-xs text-[#253451]/75">
                  {activeEditingTerritory ? (
                    <span>
                      Mengedit: <strong className="text-[#253451]">{activeEditingTerritory.name}</strong> ({activeEditingTerritory.code}) — Koordinat: X: {(activeEditingTerritory.x * 100).toFixed(1)}%, Y: {(activeEditingTerritory.y * 100).toFixed(1)}%
                    </span>
                  ) : (
                    <span>Klik dan drag marker di peta untuk memposisikannya secara akurat pada artwork board game.</span>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              {activeEditingTerritory && (
                <>
                  <input
                    type="text"
                    value={activeEditingTerritory.name}
                    onChange={e => {
                      const updated = { ...activeEditingTerritory, name: e.target.value };
                      setActiveEditingTerritory(updated);
                      updateTerritory(activeEditingTerritory.id, { name: e.target.value });
                    }}
                    placeholder="Nama Wilayah"
                    className="bg-[#F8F5EC] border border-[#EAE9E3] rounded-xl px-3 py-1.5 text-xs text-[#253451] outline-none focus:border-[#253451] w-36 sm:w-44 font-bold"
                  />

                  <div className="flex items-center gap-1 font-mono text-xs text-[#253451]">
                    <span>X:</span>
                    <input
                      type="number"
                      step="0.005"
                      min="0"
                      max="1"
                      value={activeEditingTerritory.x}
                      onChange={e => {
                        const val = parseFloat(e.target.value) || 0;
                        setActiveEditingTerritory({ ...activeEditingTerritory, x: val });
                        updateTerritory(activeEditingTerritory.id, { x: val });
                      }}
                      className="w-14 sm:w-16 bg-[#F8F5EC] border border-[#EAE9E3] rounded-lg px-1 py-1 text-center text-xs font-bold"
                    />
                    <span>Y:</span>
                    <input
                      type="number"
                      step="0.005"
                      min="0"
                      max="1"
                      value={activeEditingTerritory.y}
                      onChange={e => {
                        const val = parseFloat(e.target.value) || 0;
                        setActiveEditingTerritory({ ...activeEditingTerritory, y: val });
                        updateTerritory(activeEditingTerritory.id, { y: val });
                      }}
                      className="w-14 sm:w-16 bg-[#F8F5EC] border border-[#EAE9E3] rounded-lg px-1 py-1 text-center text-xs font-bold"
                    />
                  </div>
                </>
              )}

              <button
                onClick={() => {
                  const id = addTerritoryMarker('politics', 0.5, 0.5);
                  const created = territories.find(t => t.id === id);
                  if (created) setActiveEditingTerritory(created);
                }}
                className="px-3 py-1.5 rounded-xl bg-[#F8F5EC] hover:bg-[#EAE9E3] border border-[#EAE9E3] text-xs font-bold text-[#253451] flex items-center gap-1 transition"
              >
                <Plus className="w-3.5 h-3.5 text-[#EF956F]" />
                <span>Tambah</span>
              </button>

              <button
                onClick={() => setIsEditMode(false)}
                className="px-4 py-1.5 rounded-xl bg-[#253451] hover:bg-[#1C273D] text-white font-extrabold text-xs uppercase tracking-wider transition shadow-xs"
              >
                Simpan & Selesai
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
