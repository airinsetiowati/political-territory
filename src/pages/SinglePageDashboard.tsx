import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { DiceSection } from '../components/DiceSection';
import { MapBoardSection } from '../components/MapBoardSection';
import { EconomicTimerSection } from '../components/EconomicTimerSection';
import { PlayerOverviewSection } from '../components/PlayerOverviewSection';
import { EventCardCenter, EventTab } from '../components/EventCardCenter';
import { GameHistorySection } from '../components/GameHistorySection';
import { DashboardNavbar } from '../components/DashboardNavbar';

export const SinglePageDashboard: React.FC = () => {
  useGame();

  const [eventTab, setEventTab] = useState<EventTab>('policy');

  return (
    <div className="min-h-screen bg-[#F0ECE1] text-[#253451] flex flex-col font-sans select-none overflow-x-clip">
      {/* =========================================================================
          A. HEADER PERMAINAN (Responsive Navbar: Mobile 3-Tier, Tablet 2-Row, Desktop 1-Row)
         ========================================================================= */}
      <DashboardNavbar />

      {/* =========================================================================
          MAIN GAME BODY
         ========================================================================= */}
      <main className="flex-1 w-full max-w-[1600px] mx-auto px-3 sm:px-5 lg:px-6 py-3.5 sm:py-4 space-y-4">

        {/* =========================================================================
            B. ROW UTAMA: PEMAIN, EKONOMI & EVENT CARD CENTER (KIRI 5) | MAP & DADU (KANAN 7)
           ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">

          {/* SISI KIRI: PEMAIN, EKONOMI & EVENT CARD CENTER */}
          <div className="lg:col-span-5 w-full flex flex-col gap-3.5 min-w-0">
            <PlayerOverviewSection />
            <EconomicTimerSection />
            <EventCardCenter activeTab={eventTab} onTabChange={setEventTab} />
          </div>

          {/* SISI KANAN / UTAMA: MAP WILAYAH, SISTEM DADU & RIWAYAT PERMAINAN */}
          <div className="lg:col-span-7 w-full flex flex-col gap-3.5 min-w-0">
            <MapBoardSection />
            <DiceSection />
            <GameHistorySection />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#EAE9E3] bg-white py-3 px-4 text-center text-[11px] text-[#253451]/55 font-medium">
        POLITICAL TERRITORY — Official Physical Board Game Companion
      </footer>
    </div>
  );
};

export default SinglePageDashboard;
