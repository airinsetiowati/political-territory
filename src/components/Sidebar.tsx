import React, { useState } from 'react';
import { 
  Home, 
  MapPin, 
  Trophy, 
  Layers, 
  Target, 
  History, 
  Settings, 
  Flag, 
  Sparkles, 
  ShieldAlert, 
  Building2, 
  SlidersHorizontal, 
  Clock, 
  Coins, 
  ChevronDown, 
  ChevronUp, 
  X,
  Compass
} from 'lucide-react';
import { useGame } from '../context/GameContext';
import { BrandLogo } from './BrandLogo';

interface SidebarProps {
  currentPage: string;
  onSelectPage: (page: string) => void;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  currentPage, 
  onSelectPage,
  isMobileOpen = false,
  onMobileClose
}) => {
  const { 
    settings, 
    players, 
    territories, 
    missionCards, 
    opportunityCards,
    crisisCards,
    policyCards,
    openModal 
  } = useGame();

  const [isToolsExpanded, setIsToolsExpanded] = useState(false);

  const activeMissionsCount = players.reduce((sum, p) => sum + (p.activeMissions || []).filter(m => m.status === 'active').length, 0);
  const activeOppsCount = players.reduce((sum, p) => sum + (p.activeOpportunities || []).length, 0);
  const readyCrisesCount = crisisCards.filter(c => !c.isUsed).length;
  const claimedTerritoriesCount = territories.filter(t => t.ownerId !== null).length;
  const availablePolicyCount = policyCards.filter(c => !c.isUsed).length;

  const handleNavClick = (pageId: string) => {
    onSelectPage(pageId);
    if (onMobileClose) onMobileClose();
  };

  // 7 Primary Navigation Items as requested
  const primaryNavItems = [
    { id: 'dashboard', label: 'Home', icon: Home },
    { id: 'map', label: 'Map', icon: Compass, badge: `${claimedTerritoriesCount}/40` },
    { id: 'scoreboard', label: 'Players', icon: Trophy },
    { id: 'policy_cards', label: 'Cards', icon: Layers, badge: `${availablePolicyCount} avl` },
    { id: 'missions', label: 'Missions', icon: Target, badge: (activeMissionsCount + activeOppsCount) > 0 ? (activeMissionsCount + activeOppsCount) : undefined },
    { id: 'history', label: 'History', icon: History },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  // Secondary host shortcuts to ensure 100% feature preservation
  const secondaryTools = [
    { id: 'claim', label: 'Claim Territory', icon: Flag },
    { id: 'territories', label: 'Territory List', icon: Building2 },
    { id: 'crisis', label: 'Crisis Desk', icon: ShieldAlert, badge: readyCrisesCount > 0 ? readyCrisesCount : undefined },
    { id: 'events', label: 'Event Archive', icon: Sparkles },
    { id: 'opportunities', label: 'Opportunities', icon: Sparkles },
    { id: 'setup', label: 'Game Setup', icon: Settings },
    { id: 'admin_cards', label: 'Card & Asset Admin', icon: SlidersHorizontal },
  ];

  const formatTimer = () => {
    const mins = Math.floor(settings.timerRemainingSeconds / 60);
    const secs = settings.timerRemainingSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div 
          onClick={onMobileClose}
          className="fixed inset-0 bg-[#253451]/50 backdrop-blur-sm z-40 lg:hidden animate-in fade-in duration-200"
        />
      )}

      {/* Main Sidebar Panel */}
      <aside className={`
        fixed lg:static top-0 bottom-0 left-0 z-50
        w-64 bg-white border-r border-[#EAE9E3] flex flex-col h-screen shrink-0 select-none shadow-soft-md transition-transform duration-300
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Brand Header */}
        <div className="p-4 border-b border-[#EAE9E3] bg-[#F8F5EC]/70 relative">
          {/* Mobile close button */}
          <button
            onClick={onMobileClose}
            className="lg:hidden absolute top-3.5 right-3 text-[#253451]/70 hover:text-[#253451] p-1.5 rounded-xl hover:bg-white transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <BrandLogo
              alt="Political Territory"
              className="h-10 w-auto rounded-xl shrink-0"
              draggable={false}
            />
            <div>
              <h1 className="font-display font-extrabold text-sm tracking-tight text-[#253451] leading-tight">
                POLITICAL TERRITORY
              </h1>
              <p className="text-[10px] font-bold tracking-wider text-[#EF956F] uppercase">
                Board Game Companion
              </p>
            </div>
          </div>

          {/* Mini Live Match Status Card */}
          <div className="mt-3.5 pt-2.5 border-t border-[#EAE9E3] flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${
                settings.status === 'active' ? 'bg-[#73B77A] animate-pulse' :
                settings.status === 'paused' ? 'bg-[#F4CE70]' :
                settings.status === 'ended' ? 'bg-[#EF4444]' : 'bg-slate-400'
              }`} />
              <span className="font-bold text-[#253451] capitalize text-[11px] tracking-wide">
                {settings.status === 'active' ? `Round #${settings.currentRound}` : settings.status}
              </span>
            </div>

            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white border border-[#EAE9E3] text-[#253451] text-[11px] font-mono font-bold">
              <Clock className="w-3.5 h-3.5 text-[#F4CE70]" />
              <span>{formatTimer()}</span>
            </div>
          </div>
        </div>

        {/* Scrollable Navigation Area */}
        <div className="flex-1 overflow-y-auto px-3 py-3.5 space-y-4">
          {/* Primary Navigation */}
          <div>
            <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-[#253451]/50">
              Navigation
            </div>
            <nav className="space-y-1">
              {primaryNavItems.map(item => {
                const Icon = item.icon;
                const isActive = currentPage === item.id || 
                  (item.id === 'policy_cards' && currentPage === 'events') ||
                  (item.id === 'missions' && currentPage === 'opportunities');

                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-[#253451] text-white shadow-soft-sm'
                        : 'text-[#253451]/80 hover:bg-[#F8F5EC] hover:text-[#253451]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-[#F4CE70]' : 'text-[#253451]/60'}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                        isActive ? 'bg-white/20 text-white' : 'bg-[#EAE9E3] text-[#253451]'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Secondary Shortcuts (Quick Tabletop Tools) */}
          <div className="pt-2 border-t border-[#EAE9E3]">
            <button
              onClick={() => setIsToolsExpanded(!isToolsExpanded)}
              className="w-full flex items-center justify-between px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#253451]/60 hover:text-[#253451] transition"
            >
              <span>Quick Tabletop Tools</span>
              {isToolsExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {isToolsExpanded && (
              <nav className="space-y-1 mt-1 animate-in fade-in duration-150">
                {secondaryTools.map(item => {
                  const Icon = item.icon;
                  const isActive = currentPage === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition ${
                        isActive
                          ? 'bg-[#F4CE70]/40 text-[#253451] font-bold'
                          : 'text-[#253451]/70 hover:bg-[#F8F5EC] hover:text-[#253451]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="w-3.5 h-3.5 text-[#253451]/50" />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-[#EF956F]/20 text-[#253451]">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            )}
          </div>
        </div>

        {/* Footer: Quick Player Roster & Adjust Button */}
        <div className="p-3 border-t border-[#EAE9E3] bg-[#F8F5EC]/60">
          <div className="flex items-center justify-between text-[10px] font-extrabold uppercase tracking-wider text-[#253451]/70 mb-2 px-1">
            <span className="flex items-center gap-1.5">
              <span>Players</span>
              <span className="px-1.5 py-0.2 rounded-full bg-white text-[#253451] border border-[#EAE9E3]">
                {players.length}
              </span>
            </span>
            <button
              onClick={() => openModal('MANUAL_ADJUSTMENT')}
              className="text-[#253451] hover:text-[#EF956F] flex items-center gap-1 font-bold text-[10px] bg-white px-2 py-0.5 rounded-lg border border-[#EAE9E3] shadow-xs transition"
              title="Manually Adjust GB or VP"
            >
              <SlidersHorizontal className="w-3 h-3" />
              <span>Adjust</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            {players.map(p => {
              const bgBorder = 
                p.color === 'red' ? 'bg-red-50 border-red-200 text-red-900' :
                p.color === 'blue' ? 'bg-blue-50 border-blue-200 text-blue-900' :
                p.color === 'green' ? 'bg-emerald-50 border-emerald-200 text-emerald-900' :
                'bg-amber-50 border-amber-200 text-amber-900';

              const dotBg = 
                p.color === 'red' ? 'bg-[#EF4444]' :
                p.color === 'blue' ? 'bg-[#3B82F6]' :
                p.color === 'green' ? 'bg-[#10B981]' : 'bg-[#F59E0B]';

              return (
                <div 
                  key={p.id}
                  onClick={() => openModal('MANUAL_ADJUSTMENT', { playerId: p.id })}
                  className={`p-2 rounded-xl border flex flex-col justify-between cursor-pointer hover:shadow-xs transition ${bgBorder}`}
                  title="Klik untuk adjust GB atau VP pemain"
                >
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2.5 h-2.5 rounded-full ${dotBg} shadow-xs shrink-0`} />
                    <span className="font-extrabold text-[11px] truncate text-[#253451]">{p.name}</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-mono font-bold mt-1.5 pt-1 border-t border-black/5">
                    <span className="text-[#253451]">{p.budget} <span className="font-sans font-normal text-[9px] text-[#253451]/60">GB</span></span>
                    <span className="text-[#253451]">{p.victoryPoints} <span className="font-sans font-normal text-[9px] text-[#253451]/60">VP</span></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </aside>
    </>
  );
};
