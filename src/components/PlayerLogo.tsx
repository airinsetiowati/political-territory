import React from 'react';
import { Player, PlayerColor } from '../types/game';

export interface PlayerLogoProps {
  player: Player;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'full';
  className?: string;
  showBadge?: boolean;
}

export const PLAYER_COLOR_THEMES: Record<PlayerColor, {
  name: string;
  primary: string;
  secondary: string;
  ring: string;
  border: string;
  gradient: string;
  shadow: string;
  badgeBg: string;
  badgeText: string;
  dotColor: string;
}> = {
  red: {
    name: 'Merah',
    primary: '#DC2626',
    secondary: '#991B1C',
    ring: '#EF4444',
    border: '#FFFFFF',
    gradient: 'from-[#EF4444] via-[#DC2626] to-[#991B1B]',
    shadow: 'shadow-red-950/50',
    badgeBg: 'bg-[#991B1B]',
    badgeText: 'text-white',
    dotColor: '#EF4444',
  },
  blue: {
    name: 'Biru',
    primary: '#2563EB',
    secondary: '#1E40AF',
    ring: '#3B82F6',
    border: '#FFFFFF',
    gradient: 'from-[#3B82F6] via-[#2563EB] to-[#1E40AF]',
    shadow: 'shadow-blue-950/50',
    badgeBg: 'bg-[#1E40AF]',
    badgeText: 'text-white',
    dotColor: '#3B82F6',
  },
  green: {
    name: 'Hijau',
    primary: '#059669',
    secondary: '#065F46',
    ring: '#10B981',
    border: '#FFFFFF',
    gradient: 'from-[#10B981] via-[#059669] to-[#065F46]',
    shadow: 'shadow-emerald-950/50',
    badgeBg: 'bg-[#065F46]',
    badgeText: 'text-white',
    dotColor: '#10B981',
  },
  yellow: {
    name: 'Kuning',
    primary: '#D97706',
    secondary: '#92400E',
    ring: '#F59E0B',
    border: '#FFFFFF',
    gradient: 'from-[#F59E0B] via-[#D97706] to-[#92400E]',
    shadow: 'shadow-amber-950/50',
    badgeBg: 'bg-[#92400E]',
    badgeText: 'text-white',
    dotColor: '#F59E0B',
  },
};

/**
 * Extracts a concise player display symbol:
 * E.g., "Player 1" -> "1", "Pemain 2" -> "2", "Airi" -> "A"
 */
export function getPlayerDisplaySymbol(player: Player): string {
  const match = player.name.match(/\d+/);
  if (match) return match[0];
  return player.name.trim().charAt(0).toUpperCase() || 'P';
}

export const PlayerLogo: React.FC<PlayerLogoProps> = ({
  player,
  size = 'full',
  className = '',
  showBadge = true,
}) => {
  const theme = PLAYER_COLOR_THEMES[player.color] || PLAYER_COLOR_THEMES.red;
  const symbol = getPlayerDisplaySymbol(player);
  const logoImage = player.customLogo || player.avatar;

  const sizeClasses = {
    xs: 'w-4 h-4',
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    full: 'w-full h-full',
  }[size];

  return (
    <div
      className={`relative aspect-square rounded-full select-none shrink-0 flex items-center justify-center ${sizeClasses} ${className}`}
      style={{
        backgroundColor: theme.primary,
      }}
      title={`${player.name} (${theme.name})`}
    >
      {/* 100% Solid Opaque Backing Disc to completely block map graphics underneath */}
      <div 
        className={`w-full h-full rounded-full border-2 border-white shadow-md flex items-center justify-center relative overflow-hidden bg-gradient-to-br ${theme.gradient}`}
        style={{
          boxShadow: '0 3px 8px rgba(0, 0, 0, 0.45)',
        }}
      >
        {logoImage ? (
          <img
            src={logoImage}
            alt={player.name}
            className="w-full h-full object-cover rounded-full select-none pointer-events-none"
            draggable={false}
          />
        ) : (
          /* Official Board Game Pawn Seal */
          <div className="w-full h-full flex flex-col items-center justify-center relative">
            <svg
              viewBox="0 0 24 24"
              className="w-[66%] h-[66%] drop-shadow-sm select-none pointer-events-none"
              fill="white"
              aria-hidden="true"
            >
              {/* Pawn head */}
              <circle cx="12" cy="5.5" r="3.2" />
              {/* Pawn neck & body */}
              <path d="M8.5 10.5C8.5 9.5 10 9 12 9s3.5.5 3.5 1.5c0 1.8-.8 3.5-1.5 5h-4c-.7-1.5-1.5-3.2-1.5-5z" />
              {/* Pawn base */}
              <path d="M6 19.5c0-1.2 1.5-2.2 6-2.2s6 1 6 2.2c0 .8-.8 1.5-1.8 1.5H7.8c-1 0-1.8-.7-1.8-1.5z" />
            </svg>

            {/* Embedded identifier on token base */}
            {showBadge && (
              <span
                className="absolute bottom-[8%] left-1/2 -translate-x-1/2 font-display font-black text-[30%] leading-none text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)] pointer-events-none tracking-tighter"
                style={{ fontSize: '32%' }}
              >
                {symbol}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Subtle outer metallic/colored bevel ring */}
      <div 
        className="absolute inset-0 rounded-full border border-black/15 pointer-events-none" 
      />
    </div>
  );
};
