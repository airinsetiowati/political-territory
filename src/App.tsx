import React from 'react';
import { GameProvider, useGame } from './context/GameContext';
import { SetupPage } from './pages/SetupPage';
import { SinglePageDashboard } from './pages/SinglePageDashboard';

import { EconomicRoundModal } from './components/EconomicRoundModal';
import { QuickCardEntryModal } from './components/QuickCardEntryModal';
import { TerritoryDetailModal } from './components/TerritoryDetailModal';
import { CrisisModal } from './components/CrisisModal';
import { OpportunityModal } from './components/OpportunityModal';
import { MissionModal } from './components/MissionModal';
import { EndGameModal } from './components/EndGameModal';
import { GameSettingsModal } from './components/GameSettingsModal';
import { ManualAdjustmentModal } from './components/ManualAdjustmentModal';

const AppContent: React.FC = () => {
  const { settings } = useGame();

  return (
    <div className="min-h-screen bg-[#F0ECE1] text-[#253451] font-sans antialiased selection:bg-[#F4CE70] selection:text-[#253451]">
      {settings.status === 'setup' ? (
        <SetupPage onStartGame={() => {}} />
      ) : (
        <SinglePageDashboard />
      )}

      {/* Global Interactive Modals for Centralized Operations */}
      <EconomicRoundModal />
      <QuickCardEntryModal />
      <TerritoryDetailModal />
      <CrisisModal />
      <OpportunityModal />
      <MissionModal />
      <EndGameModal />
      <GameSettingsModal />
      <ManualAdjustmentModal />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <GameProvider>
      <AppContent />
    </GameProvider>
  );
};

export default App;
