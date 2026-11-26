import React from 'react';
import { Player, Territory } from '../types/game';
import { CATEGORY_NAMES } from '../utils/categoryAssets';
import { CategoryLogo } from './CategoryLogo';
import { PlayerLogo, PLAYER_COLOR_THEMES } from './PlayerLogo';

interface TerritoryClaimMarkerProps {
  territory: Territory;
  owner: Player | null;
  isHovered: boolean;
  isEditing?: boolean;
  isEditMode?: boolean;
  showLabel?: boolean;
  markerWidthPercent?: number;
  onClick: (e: React.MouseEvent) => void;
  onMouseDown?: (e: React.MouseEvent) => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

/**
 * Territory marker strictly centered at (territory.x * 100%, territory.y * 100%)
 * relative to the rendered map image bounds. Uses a concentric ownership ring
 * and a compact centered player pawn seal so ownership is unmistakable without
 * hiding the underlying territory circle.
 */
export const TerritoryClaimMarker: React.FC<TerritoryClaimMarkerProps> = ({
  territory,
  owner,
  isHovered,
  isEditing = false,
  isEditMode = false,
  showLabel = false,
  markerWidthPercent = 4.6,
  onClick,
  onMouseDown,
  onMouseEnter,
  onMouseLeave,
}) => {
  const ownerTheme = owner ? (PLAYER_COLOR_THEMES[owner.color] || PLAYER_COLOR_THEMES.red) : null;
  const customAvatar = owner?.customLogo || owner?.avatar;

  return (
    <div
      onMouseDown={onMouseDown}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={`absolute territory-marker pointer-events-auto cursor-pointer -translate-x-1/2 -translate-y-1/2 aspect-square ${
        isEditing || isHovered ? 'z-40' : owner ? 'z-30' : 'z-20'
      }`}
      style={{
        left: `${territory.x * 100}%`,
        top: `${territory.y * 100}%`,
        width: `${markerWidthPercent}%`,
      }}
      title={`${territory.name} • ${CATEGORY_NAMES[territory.category]}${owner ? ` [${owner.name}]` : ' [Belum Dikuasai]'}`}
    >
      <div
        className={`w-full h-full transition-transform duration-150 ${
          isEditing ? 'scale-125' : isHovered ? 'scale-110' : ''
        }`}
      >
        {owner && ownerTheme ? (
          <div
            className={`w-full h-full relative rounded-full border-[2.5px] transition-all duration-150 ${
              isEditMode ? 'cursor-move' : ''
            }`}
            style={{
              borderColor: ownerTheme.primary,
              backgroundColor: `${ownerTheme.primary}1A`,
              boxShadow: `0 0 0 1.5px rgba(255,255,255,0.95), 0 2px 6px rgba(0,0,0,0.3)${
                isEditMode ? ', 0 0 0 5px rgba(244,206,112,0.55)' : ''
              }`,
            }}
          >
            {/* Centered compact player pawn seal directly on the territory claim point */}
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[44%] h-[44%] rounded-full ring-[1.5px] ring-white shadow-sm flex items-center justify-center overflow-hidden pointer-events-none"
              style={{ backgroundColor: ownerTheme.primary }}
            >
              {customAvatar ? (
                <img
                  src={customAvatar}
                  alt={owner.name}
                  className="w-full h-full object-cover rounded-full select-none pointer-events-none"
                  draggable={false}
                />
              ) : (
                <svg
                  viewBox="0 0 24 24"
                  className="w-[72%] h-[72%] drop-shadow-2xs select-none pointer-events-none"
                  fill="white"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="5.5" r="3.2" />
                  <path d="M8.5 10.5C8.5 9.5 10 9 12 9s3.5.5 3.5 1.5c0 1.8-.8 3.5-1.5 5h-4c-.7-1.5-1.5-3.2-1.5-5z" />
                  <path d="M6 19.5c0-1.2 1.5-2.2 6-2.2s6 1 6 2.2c0 .8-.8 1.5-1.8 1.5H7.8c-1 0-1.8-.7-1.8-1.5z" />
                </svg>
              )}
            </div>
          </div>
        ) : (
          <div
            className={`w-full h-full rounded-full transition-all duration-150 ${
              isEditMode
                ? 'cursor-move ring-2 ring-[#F4CE70] bg-[#F4CE70]/20'
                : 'hover:ring-2 hover:ring-amber-400 hover:bg-amber-400/15 active:scale-95'
            }`}
          />
        )}
      </div>

      {/* Hover Tooltip */}
      {isHovered && !isEditMode && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 rounded-xl bg-[#253451] text-white shadow-xl pointer-events-none z-50 whitespace-nowrap animate-in fade-in zoom-in-95 duration-150 flex flex-col items-center">
          <div className="flex items-center gap-1.5 text-xs font-black">
            {owner ? (
              <div className="w-3.5 h-3.5 rounded-full shrink-0 overflow-hidden">
                <PlayerLogo player={owner} size="full" showBadge={false} />
              </div>
            ) : (
              <div className="w-3.5 h-3.5 rounded-full shrink-0 overflow-hidden">
                <CategoryLogo category={territory.category} size="full" />
              </div>
            )}
            <span>{territory.name}</span>
          </div>
          <div className="text-[10px] text-amber-300 font-mono mt-0.5">
            +{territory.baseIncome} GB/cy • +{territory.basePoints} VP • {owner ? owner.name : 'Belum Dikuasai'}
          </div>
          <div className="w-2 h-2 bg-[#253451] rotate-45 absolute -bottom-1 left-1/2 -translate-x-1/2" />
        </div>
      )}

      {/* Optional Territory Name Label */}
      {showLabel && !isHovered && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 px-1.5 py-0.5 rounded-md bg-white/95 border border-[#EAE9E3] text-[9px] font-bold text-[#253451] whitespace-nowrap shadow-soft-sm pointer-events-none max-w-[95px] truncate z-20">
          {territory.name}
        </div>
      )}
    </div>
  );
};
