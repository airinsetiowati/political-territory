import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { 
  Player, 
  Territory, 
  PolicyCard, 
  CrisisCard, 
  MissionCard, 
  OpportunityCard, 
  GameLog, 
  GameSettings, 
  EconomyConfig,
  IncomeDistributionSummary,
  PlayerColor,
  TerritoryCategory,
  ActiveOpportunity,
  TerritoryBonus,
  DiceState,
  DiceRollLog
} from '../types/game';
import { 
  DEFAULT_TERRITORIES, 
  DEFAULT_POLICY_CARDS, 
  DEFAULT_CRISIS_CARDS, 
  DEFAULT_MISSION_CARDS, 
  DEFAULT_OPPORTUNITY_CARDS, 
  DEFAULT_SETTINGS, 
  INITIAL_PLAYERS,
  DEFAULT_ECONOMY 
} from '../data/defaultGameData';
import { 
  getLocalState, 
  saveLocalState, 
  clearSessionState, 
  getImageFromDB, 
  saveImageToDB, 
  getAllImagesFromDB,
  gameSyncChannel,
  broadcastGameEvent
} from '../services/storageService';
import { soundEffects } from '../services/audioService';

interface GameContextType {
  // State
  players: Player[];
  territories: Territory[];
  policyCards: PolicyCard[];
  crisisCards: CrisisCard[];
  missionCards: MissionCard[];
  opportunityCards: OpportunityCard[];
  logs: GameLog[];
  settings: GameSettings;
  economyConfig: EconomyConfig;
  latestIncomeSummary: IncomeDistributionSummary | null;
  activeModal: string | null;
  activeModalData: any;
  undoAvailable: boolean;

  // Actions
  setPlayers: (players: Player[]) => void;
  updatePlayer: (id: string, updates: Partial<Player>) => void;
  adjustPlayerBudget: (playerId: string, delta: number, reason: string) => void;
  adjustPlayerVP: (playerId: string, delta: number, reason: string) => void;
  addPlayer: (name: string, color: PlayerColor) => boolean;
  removePlayer: (id: string) => void;

  startGame: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  endGame: () => void;
  resetGame: () => void;

  // Economic Timer
  triggerEconomicRound: () => void;
  resetEconomicTimer: () => void;
  setEconomicInterval: (seconds: number) => void;
  closeIncomeSummary: () => void;

  // Territory & Claims
  claimTerritory: (playerId: string, territoryId: string, cardCode: string) => { success: boolean; message: string };
  revokeTerritoryClaim: (territoryId: string, refundGB?: boolean) => { success: boolean; message: string };
  assignTerritoryOwner: (territoryId: string, newOwnerId: string | null) => void;
  updateTerritory: (territoryId: string, updates: Partial<Territory>) => void;
  addTerritoryMarker: (category: TerritoryCategory, x: number, y: number) => string;
  deleteTerritoryMarker: (territoryId: string) => void;

  // Events & Cards
  verifyCardCode: (code: string) => { 
    type: 'policy' | 'crisis' | 'mission' | 'opportunity' | 'not_found';
    card?: PolicyCard | CrisisCard | MissionCard | OpportunityCard;
    isUsed?: boolean;
  };
  resolveCrisis: (crisisId: string, playerId: string, optionId: 'A' | 'B' | 'C' | 'DECLINE') => { success: boolean; message: string };
  activateMission: (missionId: string, playerId: string) => { success: boolean; message: string };
  completeMission: (missionId: string, playerId: string) => { success: boolean; message: string };
  activateOpportunity: (opportunityId: string, playerId: string, targetTerritoryId?: string) => { success: boolean; message: string };

  // Admin CRUD & Config
  updatePolicyCard: (id: string, updates: Partial<PolicyCard>) => void;
  updateCrisisCard: (id: string, updates: Partial<CrisisCard>) => void;
  updateMissionCard: (id: string, updates: Partial<MissionCard>) => void;
  updateOpportunityCard: (id: string, updates: Partial<OpportunityCard>) => void;
  resetDeckCards: (deckType: 'policy' | 'crisis' | 'mission' | 'opportunity') => void;
  updateCardImage: (deckType: 'policy' | 'crisis' | 'mission' | 'opportunity', cardId: string, dataUrl: string) => Promise<void>;
  updateEconomyConfig: (updates: Partial<EconomyConfig>) => void;
  updateGameSettings: (updates: Partial<GameSettings>) => void;

  // Modals & UI
  openModal: (modalName: string, data?: any) => void;
  closeModal: () => void;
  undoLastAction: () => void;
  toggleSound: () => void;

  // Asset uploads
  setCustomMapImage: (dataUrl: string) => Promise<void>;
  setCustomCardBack: (type: 'policy' | 'event', dataUrl: string) => Promise<void>;

  // Dice System & Turn Management
  activePlayer: Player;
  diceState: DiceState;
  rollDice: (playerId?: string) => Promise<number>;
  nextTurn: () => void;
  setActiveTurnPlayer: (playerId: string) => void;
  exportGameState: () => string;
  importGameState: (jsonStr: string) => boolean;

  // Helper calculations
  calculatePlayerIncome: (player: Player) => { baseIncome: number; territoryBonusIncome: number; opportunityIncome: number; totalIncome: number };
  calculatePlayerVictoryPoints: (player: Player) => { territoryVP: number; opportunityVP: number; missionVP: number; totalVP: number };
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial persistent state
  const [players, setPlayersState] = useState<Player[]>(() => getLocalState('pt_players', INITIAL_PLAYERS));
  const [territories, setTerritoriesState] = useState<Territory[]>(() => {
    const stored = getLocalState<Territory[]>('pt_territories', DEFAULT_TERRITORIES);
    return stored.map(s => {
      const def = DEFAULT_TERRITORIES.find(d => d.id === s.id);
      return def ? { ...s, x: def.x, y: def.y } : s;
    });
  });
  const [policyCards, setPolicyCardsState] = useState<PolicyCard[]>(() => getLocalState('pt_policy_cards', DEFAULT_POLICY_CARDS));
  const [crisisCards, setCrisisCardsState] = useState<CrisisCard[]>(() => getLocalState('pt_crisis_cards', DEFAULT_CRISIS_CARDS));
  const [missionCards, setMissionCardsState] = useState<MissionCard[]>(() => getLocalState('pt_mission_cards', DEFAULT_MISSION_CARDS));
  const [opportunityCards, setOpportunityCardsState] = useState<OpportunityCard[]>(() => getLocalState('pt_opp_cards', DEFAULT_OPPORTUNITY_CARDS));
  const [logs, setLogsState] = useState<GameLog[]>(() => getLocalState('pt_logs', []));
  const [settings, setSettingsState] = useState<GameSettings>(() => getLocalState('pt_settings', DEFAULT_SETTINGS));
  const [economyConfig, setEconomyConfigState] = useState<EconomyConfig>(() => getLocalState('pt_economy', DEFAULT_ECONOMY));

  const DEFAULT_DICE_STATE: DiceState = {
    currentValue: null,
    isRolling: false,
    lastRolledByPlayerId: null,
    lastRolledAtRound: null,
    hasRolledThisTurn: false,
    history: [],
  };
  const [diceState, setDiceState] = useState<DiceState>(() => getLocalState('pt_dice', DEFAULT_DICE_STATE));

  const [latestIncomeSummary, setLatestIncomeSummary] = useState<IncomeDistributionSummary | null>(null);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [activeModalData, setActiveModalData] = useState<any>(null);

  // Active turn player resolution
  const activePlayer = players.find(p => p.id === (settings.activePlayerId || players[0]?.id)) || players[0] || INITIAL_PLAYERS[0];

  // Undo history stack
  const [undoHistory, setUndoHistory] = useState<any[]>([]);

  // Sound sync
  useEffect(() => {
    soundEffects.enabled = settings.soundEnabled;
  }, [settings.soundEnabled]);

  // Real-time multi-tab & multiplayer sync
  useEffect(() => {
    if (!gameSyncChannel) return;

    const handleSyncMessage = (event: MessageEvent) => {
      const data = event.data;
      if (!data || !data.type) return;

      if (data.type === 'DICE_START_ROLL') {
        setDiceState(prev => ({ ...prev, isRolling: true }));
        soundEffects.playDiceRoll();
      } else if (data.type === 'DICE_ROLLED') {
        if (data.payload?.diceState) {
          setDiceState(data.payload.diceState);
          soundEffects.playDiceLand();
        }
      } else if (data.type === 'TURN_CHANGED') {
        if (data.payload?.activePlayerId) {
          setSettingsState(s => ({
            ...s,
            activePlayerId: data.payload.activePlayerId,
            currentTurn: data.payload.currentTurn,
          }));
          setDiceState(prev => ({ ...prev, hasRolledThisTurn: false, isRolling: false }));
        }
      }
    };

    if (gameSyncChannel) {
      gameSyncChannel.addEventListener('message', handleSyncMessage);
    }

    const handleStorageEvent = (e: StorageEvent) => {
      if (e.key === 'pt_dice' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          setDiceState(parsed);
        } catch {}
      } else if (e.key === 'pt_settings' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          setSettingsState(parsed);
        } catch {}
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorageEvent);
    }

    return () => {
      if (gameSyncChannel) {
        gameSyncChannel.removeEventListener('message', handleSyncMessage);
      }
      if (typeof window !== 'undefined') {
        window.removeEventListener('storage', handleStorageEvent);
      }
    };
  }, []);

  // Load custom images from IndexedDB if available
  useEffect(() => {
    (async () => {
      const customMap = await getImageFromDB('custom_map');
      if (customMap) {
        setSettingsState(s => ({ ...s, boardMapImage: customMap }));
      }
      const customPolBack = await getImageFromDB('policy_back');
      if (customPolBack) {
        setSettingsState(s => ({ ...s, policyBackImage: customPolBack }));
      }
      const customEvtBack = await getImageFromDB('event_back');
      if (customEvtBack) {
        setSettingsState(s => ({ ...s, eventBackImage: customEvtBack }));
      }
      const allImgs = await getAllImagesFromDB();
      if (allImgs && Object.keys(allImgs).length > 0) {
        setPolicyCardsState(prev => prev.map(c => allImgs[`card_${c.id}`] ? { ...c, image: allImgs[`card_${c.id}`] } : c));
        setCrisisCardsState(prev => prev.map(c => allImgs[`card_${c.id}`] ? { ...c, image: allImgs[`card_${c.id}`] } : c));
        setMissionCardsState(prev => prev.map(c => allImgs[`card_${c.id}`] ? { ...c, image: allImgs[`card_${c.id}`] } : c));
        setOpportunityCardsState(prev => prev.map(c => allImgs[`card_${c.id}`] ? { ...c, image: allImgs[`card_${c.id}`] } : c));
      }
    })();
  }, []);

  // Save states to LocalStorage
  useEffect(() => saveLocalState('pt_players', players), [players]);
  useEffect(() => saveLocalState('pt_territories', territories), [territories]);
  useEffect(() => saveLocalState('pt_policy_cards', policyCards), [policyCards]);
  useEffect(() => saveLocalState('pt_crisis_cards', crisisCards), [crisisCards]);
  useEffect(() => saveLocalState('pt_mission_cards', missionCards), [missionCards]);
  useEffect(() => saveLocalState('pt_opp_cards', opportunityCards), [opportunityCards]);
  useEffect(() => saveLocalState('pt_logs', logs), [logs]);
  useEffect(() => saveLocalState('pt_settings', settings), [settings]);
  useEffect(() => saveLocalState('pt_economy', economyConfig), [economyConfig]);
  useEffect(() => saveLocalState('pt_dice', diceState), [diceState]);

  // Snapshot for undo
  const takeSnapshot = () => {
    const snapshot = {
      players: JSON.parse(JSON.stringify(players)),
      territories: JSON.parse(JSON.stringify(territories)),
      policyCards: JSON.parse(JSON.stringify(policyCards)),
      crisisCards: JSON.parse(JSON.stringify(crisisCards)),
      missionCards: JSON.parse(JSON.stringify(missionCards)),
      opportunityCards: JSON.parse(JSON.stringify(opportunityCards)),
      logs: JSON.parse(JSON.stringify(logs)),
      settings: JSON.parse(JSON.stringify(settings)),
      diceState: JSON.parse(JSON.stringify(diceState)),
    };
    setUndoHistory(prev => [snapshot, ...prev.slice(0, 9)]);
  };

  const undoLastAction = () => {
    if (undoHistory.length === 0) return;
    const [previous, ...rest] = undoHistory;
    setPlayersState(previous.players);
    setTerritoriesState(previous.territories);
    setPolicyCardsState(previous.policyCards);
    setCrisisCardsState(previous.crisisCards);
    setMissionCardsState(previous.missionCards);
    setOpportunityCardsState(previous.opportunityCards);
    setLogsState(previous.logs);
    setSettingsState(previous.settings);
    if (previous.diceState) setDiceState(previous.diceState);
    setUndoHistory(rest);
    soundEffects.playClick();
  };

  // Add Log Entry
  const addLog = (
    type: GameLog['type'],
    description: string,
    extra?: Partial<GameLog>
  ) => {
    const entry: GameLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      round: settings.currentRound,
      type,
      description,
      ...extra,
    };
    setLogsState(prev => [entry, ...prev]);
  };

  // Calculations (Centralized Economic & VP System)
  const calculatePlayerIncome = (player: Player) => {
    // 1. Territory base income & specific territory bonuses
    const ownedTerrs = territories.filter(t => t.ownerId === player.id);
    let baseIncome = 0;
    let territoryBonusIncome = 0;

    ownedTerrs.forEach(t => {
      const catConfig = economyConfig[t.category];
      const terrBase = catConfig ? catConfig.baseIncome : t.baseIncome;
      baseIncome += terrBase;

      const bonusSum = (t.activeBonuses || []).reduce((bSum, b) => bSum + (b.incomeBonus || 0), 0);
      territoryBonusIncome += bonusSum;
    });

    // 2. General Opportunity recurring income (only cards without targetTerritoryId to prevent duplicate counting)
    const generalOpportunityIncome = (player.activeOpportunities || []).reduce((sum, opp) => {
      if (opp.targetTerritoryId) return sum; // Already accounted for in territory activeBonuses
      return sum + (opp.recurringGB || 0);
    }, 0);

    const totalOpportunityIncome = territoryBonusIncome + generalOpportunityIncome;
    const totalIncome = baseIncome + totalOpportunityIncome;

    return {
      baseIncome,
      territoryBonusIncome,
      opportunityIncome: totalOpportunityIncome,
      totalIncome
    };
  };

  const calculatePlayerVictoryPoints = (player: Player) => {
    const ownedTerrs = territories.filter(t => t.ownerId === player.id);
    let territoryVP = ownedTerrs.reduce((sum, t) => {
      const catConfig = economyConfig[t.category];
      const bonusVP = (t.activeBonuses || []).reduce((bSum, b) => bSum + (b.pointBonus || 0), 0);
      return sum + (catConfig ? catConfig.basePoints : t.basePoints) + bonusVP;
    }, 0);

    return {
      territoryVP,
      opportunityVP: 0,
      missionVP: 0,
      totalVP: player.victoryPoints + territoryVP // player.victoryPoints stores cumulative bonuses & penalties
    };
  };

  // Economic Timer Countdown
  const isDistributingRef = useRef(false);
  const triggerRef = useRef<() => void>(() => {});

  // Keep triggerRef synced with triggerEconomicRound on every render
  useEffect(() => {
    triggerRef.current = triggerEconomicRound;
  });

  useEffect(() => {
    if (settings.status !== 'active' || !settings.isTimerRunning) return;

    const interval = setInterval(() => {
      setSettingsState(prev => {
        if (prev.status !== 'active' || !prev.isTimerRunning) return prev;

        if (prev.timerRemainingSeconds <= 1) {
          // Trigger economic distribution safely once per round expiry
          if (!isDistributingRef.current) {
            isDistributingRef.current = true;
            setTimeout(() => {
              if (triggerRef.current) {
                triggerRef.current();
              }
              isDistributingRef.current = false;
            }, 50);
          }
          return {
            ...prev,
            timerRemainingSeconds: prev.economicIntervalSeconds
          };
        }
        return {
          ...prev,
          timerRemainingSeconds: prev.timerRemainingSeconds - 1
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [settings.status, settings.isTimerRunning, settings.economicIntervalSeconds]);

  // Economic Round Distribution (Single Centralized Income Processing)
  const triggerEconomicRound = () => {
    takeSnapshot();
    soundEffects.playEconomicIncome();

    const currentRound = settings.currentRound;
    const nextRound = currentRound + 1;

    // Calculate every payout from the current snapshot once, outside of React
    // state updaters. This keeps the summary exact (StrictMode double-invokes
    // updaters, which previously duplicated entries) and credits income once.
    const payouts = players.map(player => {
      const income = calculatePlayerIncome(player);
      const distribution: IncomeDistributionSummary['distributions'][number] = {
        playerId: player.id,
        playerName: player.name,
        playerColor: player.color,
        baseIncome: income.baseIncome,
        opportunityIncome: income.opportunityIncome,
        totalReceived: income.totalIncome,
        newBalance: player.budget + income.totalIncome,
      };
      return { playerId: player.id, income, distribution };
    });
    const payoutByPlayerId = new Map(payouts.map(payout => [payout.playerId, payout]));
    const summaryDistributions: IncomeDistributionSummary['distributions'] = payouts.map(payout => payout.distribution);

    // 1. Distribute income to all players and decrement player-level active opportunities
    setPlayersState(prevPlayers => {
      return prevPlayers.map(player => {
        const payout = payoutByPlayerId.get(player.id);
        if (!payout) return player;

        // Decrement remaining cycles on active opportunities
        const updatedOpps = (player.activeOpportunities || []).map(opp => {
          if (opp.isPermanent) return opp;
          return { ...opp, remainingCycles: opp.remainingCycles - 1 };
        }).filter(opp => opp.isPermanent || opp.remainingCycles > 0);

        return {
          ...player,
          budget: player.budget + payout.income.totalIncome,
          activeOpportunities: updatedOpps,
        };
      });
    });

    // 2. Decrement remaining cycles on territory active bonuses
    setTerritoriesState(prevTerrs => {
      return prevTerrs.map(t => {
        if (!t.activeBonuses || t.activeBonuses.length === 0) return t;
        const updatedBonuses = t.activeBonuses.map(b => {
          if (b.isPermanent || b.remainingCycles === undefined || b.remainingCycles <= 0) return b;
          return { ...b, remainingCycles: b.remainingCycles - 1 };
        }).filter(b => b.isPermanent || b.remainingCycles === undefined || b.remainingCycles > 0);
        return {
          ...t,
          activeBonuses: updatedBonuses
        };
      });
    });

    // 3. Check mission condition fulfillments
    setMissionCardsState(prevMissions => {
      return prevMissions.map(mis => {
        if (mis.status === 'active' && mis.assignedPlayerId) {
          const player = players.find(p => p.id === mis.assignedPlayerId);
          if (player) {
            let satisfied = false;
            if (mis.conditionType === 'own_category_count' && mis.targetCategory && mis.targetCount) {
              const count = territories.filter(t => t.ownerId === player.id && t.category === mis.targetCategory).length;
              if (count >= mis.targetCount) satisfied = true;
            } else if (mis.conditionType === 'reach_income' && mis.targetValue) {
              const inc = calculatePlayerIncome(player);
              if (inc.totalIncome >= mis.targetValue) satisfied = true;
            }
          }
        }
        return mis;
      });
    });

    // 4. Log the event with payout breakdown
    const payoutSummaryText = summaryDistributions
      .map(d => `${d.playerName}: +${d.totalReceived} GB (Saldo: ${d.newBalance} GB)`)
      .join(' | ');

    addLog(
      'economic_round',
      `Siklus Ekonomi Putaran #${currentRound} selesai! Pendapatan GB dibagikan: ${payoutSummaryText}. Memulai Putaran #${nextRound}.`,
      { round: currentRound }
    );

    // 5. Update settings: next round, reset timer
    setSettingsState(s => ({
      ...s,
      currentRound: nextRound,
      timerRemainingSeconds: s.economicIntervalSeconds,
    }));

    // 6. Set latest income summary for the modal
    setLatestIncomeSummary({
      round: currentRound,
      distributions: summaryDistributions,
    });
  };

  const resetEconomicTimer = () => {
    soundEffects.playClick();
    setSettingsState(s => ({ ...s, timerRemainingSeconds: s.economicIntervalSeconds }));
    addLog('game_control', 'Economic timer reset to full interval.');
  };

  const setEconomicInterval = (seconds: number) => {
    setSettingsState(s => ({
      ...s,
      economicIntervalSeconds: seconds,
      timerRemainingSeconds: seconds
    }));
  };

  const closeIncomeSummary = () => {
    setLatestIncomeSummary(null);
  };

  // Game Control Actions
  const startGame = () => {
    if (players.length < 2) return;
    takeSnapshot();
    soundEffects.playClaim();

    // 1. Initialize fresh temporary session: clean territory ownership
    setTerritoriesState(DEFAULT_TERRITORIES.map(t => ({
      ...t,
      ownerId: null,
      claimedAtRound: null,
      claimedAtTime: undefined,
      activeBonuses: [],
    })));

    // 2. Reset policy cards usage
    setPolicyCardsState(DEFAULT_POLICY_CARDS.map(c => ({
      ...c,
      isUsed: false,
      usedByPlayerId: undefined,
      usedAtRound: undefined,
    })));

    // 3. Reset crisis cards
    setCrisisCardsState(DEFAULT_CRISIS_CARDS.map(c => ({
      ...c,
      isUsed: false,
      usedByPlayerId: undefined,
      selectedOption: undefined,
      usedAtRound: undefined,
    })));

    // 4. Reset mission cards
    setMissionCardsState(DEFAULT_MISSION_CARDS.map(m => ({
      ...m,
      status: 'available',
      assignedPlayerId: undefined,
      isUsed: false,
    })));

    // 5. Reset opportunity cards
    setOpportunityCardsState(DEFAULT_OPPORTUNITY_CARDS.map(o => ({
      ...o,
      isUsed: false,
      assignedPlayerId: undefined,
    })));

    // 6. Reset timer, turns, and activate
    const intervalSecs = settings.economicIntervalSeconds || 300;
    const initialActivePlayerId = players[0]?.id || 'red';
    setSettingsState(s => ({
      ...s,
      status: 'active',
      isTimerRunning: true,
      timerRemainingSeconds: intervalSecs,
      currentRound: 1,
      currentTurn: 1,
      activePlayerId: initialActivePlayerId,
    }));

    // Reset dice state
    setDiceState({
      currentValue: null,
      isRolling: false,
      lastRolledByPlayerId: null,
      lastRolledAtRound: null,
      hasRolledThisTurn: false,
      history: [],
    });

    // 7. Clear old logs and start fresh match log
    setLogsState([
      {
        id: `log-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        round: 1,
        type: 'game_control',
        description: `Pertandingan resmi dimulai dengan ${players.length} pemain (${players.map(p => `${p.name} [${p.color.toUpperCase()}: ${p.budget} GB]`).join(', ')}). Build, Govern, Prosper!`,
      }
    ]);
  };

  const pauseGame = () => {
    soundEffects.playClick();
    setSettingsState(s => ({ ...s, isTimerRunning: false }));
    addLog('game_control', 'Timer pertandingan dijeda oleh host.');
  };

  const resumeGame = () => {
    soundEffects.playClick();
    setSettingsState(s => ({ ...s, isTimerRunning: true }));
    addLog('game_control', 'Timer pertandingan dilanjutkan oleh host.');
  };

  const endGame = () => {
    takeSnapshot();
    soundEffects.playMissionComplete();
    setSettingsState(s => ({ ...s, status: 'ended', isTimerRunning: false }));
    addLog('game_control', 'Pertandingan diakhiri. Menghitung peringkat akhir dan pemenang.');
    openModal('END_GAME');
  };

  const resetGame = () => {
    soundEffects.playClick();
    // 1. Clear temporary browser session storage completely
    clearSessionState();

    // 2. Clear players back to initial setup players with default GB and 0 VP
    const defaultGb = 20;
    setPlayersState(INITIAL_PLAYERS.map(p => ({
      ...p,
      budget: defaultGb,
      victoryPoints: 0,
      territoryIds: [],
      activeOpportunities: [],
      activeMissions: [],
    })));

    // 3. Clear territory ownership
    setTerritoriesState(DEFAULT_TERRITORIES.map(t => ({
      ...t,
      ownerId: null,
      claimedAtRound: null,
      claimedAtTime: undefined,
      activeBonuses: [],
    })));

    // 4. Clear used Policy Cards
    setPolicyCardsState(DEFAULT_POLICY_CARDS.map(c => ({
      ...c,
      isUsed: false,
      usedByPlayerId: undefined,
      usedAtRound: undefined,
    })));

    // 5. Clear used Crisis Cards
    setCrisisCardsState(DEFAULT_CRISIS_CARDS.map(c => ({
      ...c,
      isUsed: false,
      usedByPlayerId: undefined,
      selectedOption: undefined,
      usedAtRound: undefined,
    })));

    // 6. Clear active Missions
    setMissionCardsState(DEFAULT_MISSION_CARDS.map(m => ({
      ...m,
      status: 'available',
      assignedPlayerId: undefined,
      isUsed: false,
    })));

    // 7. Clear active Opportunities
    setOpportunityCardsState(DEFAULT_OPPORTUNITY_CARDS.map(o => ({
      ...o,
      isUsed: false,
      assignedPlayerId: undefined,
    })));

    // 8. Clear Game History
    setLogsState([]);

    // 9. Reset settings & stop timer, return to Game Setup
    setSettingsState({
      ...DEFAULT_SETTINGS,
      status: 'setup',
      isTimerRunning: false,
      currentRound: 1,
      timerRemainingSeconds: DEFAULT_SETTINGS.economicIntervalSeconds,
    });
    setDiceState(DEFAULT_DICE_STATE);
    setLatestIncomeSummary(null);
    setUndoHistory([]);
    closeModal();
  };

  // Player Management
  const addPlayer = (name: string, color: PlayerColor): boolean => {
    if (players.length >= 4) return false;
    if (players.some(p => p.color === color)) return false;
    takeSnapshot();
    const defaultGb = settings.defaultStartingGB[players.length + 1] || 20;
    const newPlayer: Player = {
      id: color,
      name: name.trim() || `Player ${players.length + 1}`,
      color,
      budget: defaultGb,
      victoryPoints: 0,
      territoryIds: [],
      activeOpportunities: [],
      activeMissions: [],
    };
    setPlayersState(prev => [...prev, newPlayer]);
    soundEffects.playClick();
    return true;
  };

  const removePlayer = (id: string) => {
    if (players.length <= 2 && settings.status === 'active') return;
    takeSnapshot();
    setPlayersState(prev => prev.filter(p => p.id !== id));
    // Release any territories owned by this player
    setTerritoriesState(prev => prev.map(t => t.ownerId === id ? { ...t, ownerId: null } : t));
    soundEffects.playClick();
  };

  const updatePlayer = (id: string, updates: Partial<Player>) => {
    takeSnapshot();
    setPlayersState(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const adjustPlayerBudget = (playerId: string, delta: number, reason: string) => {
    takeSnapshot();
    const player = players.find(p => p.id === playerId);
    if (!player) return;
    const newBudget = Math.max(0, player.budget + delta);
    setPlayersState(prev => prev.map(p => p.id === playerId ? { ...p, budget: newBudget } : p));
    addLog(
      'gb_change',
      `Manual GB adjustment for ${player.name}: ${delta >= 0 ? '+' : ''}${delta} GB (${reason || 'Host Adjustment'}). New balance: ${newBudget} GB.`,
      {
        playerId,
        playerName: player.name,
        playerColor: player.color,
        gbChange: delta
      }
    );
    soundEffects.playClick();
  };

  const adjustPlayerVP = (playerId: string, delta: number, reason: string) => {
    takeSnapshot();
    const player = players.find(p => p.id === playerId);
    if (!player) return;
    const newVP = player.victoryPoints + delta;
    setPlayersState(prev => prev.map(p => p.id === playerId ? { ...p, victoryPoints: newVP } : p));
    addLog(
      'point_change',
      `Manual VP adjustment for ${player.name}: ${delta >= 0 ? '+' : ''}${delta} VP (${reason || 'Host Adjustment'}).`,
      {
        playerId,
        playerName: player.name,
        playerColor: player.color,
        pointChange: delta
      }
    );
    soundEffects.playClick();
  };

  // Territory Claim Logic
  const claimTerritory = (playerId: string, territoryId: string, cardCode: string): { success: boolean; message: string } => {
    takeSnapshot();
    const player = players.find(p => p.id === playerId);
    if (!player) return { success: false, message: 'Pemain yang dipilih tidak valid.' };

    const territory = territories.find(t => t.id === territoryId);
    if (!territory) return { success: false, message: 'Wilayah yang dipilih tidak valid.' };

    // 1. Territory ownership validation
    if (territory.ownerId) {
      const currentOwner = players.find(p => p.id === territory.ownerId);
      return { 
        success: false, 
        message: `Wilayah "${territory.name}" sudah dikuasai oleh pemain ${currentOwner?.name || territory.ownerId.toUpperCase()}!` 
      };
    }

    // 2. Policy card lookup & normalization
    const cleanInput = cardCode.trim().toUpperCase();
    const normalize = (s: string) => s.replace(/[\s\-_]/g, '').toUpperCase();
    const inputNorm = normalize(cleanInput);

    let card = policyCards.find(c => {
      if (c.code.toUpperCase() === cleanInput) return true;
      if (normalize(c.code) === inputNorm) return true;
      const cDigits = c.code.match(/\d+/)?.[0];
      const inputDigits = cleanInput.match(/\d+/)?.[0];
      const cPrefix = c.code.replace(/[\d\-_]/g, '').toUpperCase();
      const inputPrefix = cleanInput.replace(/[\d\-_]/g, '').toUpperCase();
      if (cPrefix === inputPrefix && cDigits && inputDigits && parseInt(cDigits, 10) === parseInt(inputDigits, 10)) {
        return true;
      }
      return false;
    });

    // Handle wildcard matching (e.g. WTR-ANY, WATER-ANY, SBS-ANY)
    if (!card && (cleanInput.includes('ANY') || cleanInput.startsWith('ANY'))) {
      const catOrPrefix = cleanInput.replace(/[^A-Z]/g, '').replace('ANY', '');
      card = policyCards.find(c => {
        if (c.isUsed && !c.isReusable) return false;
        if (catOrPrefix === 'SBS' || catOrPrefix === 'FREE') return c.isFreeChoice || c.category === 'free_choice';
        if (catOrPrefix === 'WTR' || catOrPrefix === 'WATER') return c.category === 'water';
        if (catOrPrefix === 'POL' || catOrPrefix === 'POLITICS') return c.category === 'politics';
        if (catOrPrefix === 'IND' || catOrPrefix === 'INDUSTRY') return c.category === 'industry';
        if (catOrPrefix === 'EDN' || catOrPrefix === 'EDUCATION') return c.category === 'education';
        if (catOrPrefix === 'CRE' || catOrPrefix === 'HEALTHCARE') return c.category === 'healthcare';
        if (catOrPrefix === 'AGR' || catOrPrefix === 'AGRICULTURE') return c.category === 'agriculture';
        if (catOrPrefix === 'TRM' || catOrPrefix === 'TOU' || catOrPrefix === 'TOURISM') return c.category === 'tourism';
        if (catOrPrefix === 'RST' || catOrPrefix === 'FOR' || catOrPrefix === 'FOREST') return c.category === 'forest';
        return c.category === territory.category;
      });
    }

    // 3. Card validity check
    if (!card) {
      return { success: false, message: `Kartu Policy dengan kode "${cleanInput}" tidak ditemukan dalam deck kartu.` };
    }

    // 4. Card reuse check
    if (card.isUsed && !card.isReusable) {
      return { success: false, message: `Kartu Policy "${card.code}" sudah digunakan sebelumnya dan tidak dapat dipakai lagi!` };
    }

    // 5. Category compatibility check (Critical requirement)
    const isCategoryCompatible = card.isFreeChoice || card.category === 'free_choice' || card.category === territory.category;
    if (!isCategoryCompatible) {
      return {
        success: false,
        message: `Kartu Tidak Kompatibel! Kartu "${card.code}" adalah kategori "${card.category.toUpperCase()}", tidak dapat digunakan untuk mengklaim wilayah "${territory.category.toUpperCase()}" (${territory.name}).`
      };
    }

    // 6. Claim cost & GB balance check
    const catConfig = economyConfig[territory.category];
    const claimCost = catConfig?.claimCost ?? territory.claimCost;
    const basePoints = catConfig?.basePoints ?? territory.basePoints;
    const baseIncome = catConfig?.baseIncome ?? territory.baseIncome;

    if (player.budget < claimCost) {
      return {
        success: false,
        message: `Saldo Government Budget tidak mencukupi! ${player.name} memiliki ${player.budget} GB, namun biaya klaim wilayah adalah ${claimCost} GB.`
      };
    }

    // 7. Execute Claim!
    soundEffects.playClaim();

    // 1. Deduct cost & add territory to player
    setPlayersState(prev => prev.map(p => {
      if (p.id === playerId) {
        return {
          ...p,
          budget: p.budget - claimCost,
          territoryIds: [...p.territoryIds, territoryId],
        };
      }
      return p;
    }));

    // 2. Mark territory as claimed
    setTerritoriesState(prev => prev.map(t => {
      if (t.id === territoryId) {
        return {
          ...t,
          ownerId: playerId,
          claimedAtRound: settings.currentRound,
          claimedAtTime: new Date().toLocaleTimeString(),
        };
      }
      return t;
    }));

    // 3. Mark policy card as used
    setPolicyCardsState(prev => prev.map(c => {
      if (c.id === card!.id) {
        return {
          ...c,
          isUsed: true,
          usedByPlayerId: playerId,
          usedAtRound: settings.currentRound,
        };
      }
      return c;
    }));

    // 4. Record in Game History
    addLog(
      'claim',
      `${player.name} berhasil mengklaim ${territory.name} (${territory.category.toUpperCase()}) seharga ${claimCost} GB menggunakan kartu ${card.code}. Base +${basePoints} VP, +${baseIncome} GB/siklus.`,
      {
        playerId,
        playerName: player.name,
        playerColor: player.color,
        gbChange: -claimCost,
        pointChange: basePoints,
        territoryId,
        cardCode: card.code,
      }
    );

    return {
      success: true,
      message: `Berhasil mengklaim ${territory.name}! Terpotong ${claimCost} GB (+${basePoints} VP).`
    };
  };

  const revokeTerritoryClaim = (territoryId: string, refundGB: boolean = false): { success: boolean; message: string } => {
    takeSnapshot();
    const territory = territories.find(t => t.id === territoryId);
    if (!territory) return { success: false, message: 'Territory not found.' };
    if (!territory.ownerId) return { success: false, message: 'Territory is not currently claimed.' };

    const oldOwnerId = territory.ownerId;
    const player = players.find(p => p.id === oldOwnerId);
    const refundAmount = refundGB ? territory.claimCost : 0;

    // Remove territory from player
    setPlayersState(prev => prev.map(p => {
      if (p.id === oldOwnerId) {
        return {
          ...p,
          budget: p.budget + refundAmount,
          territoryIds: p.territoryIds.filter(id => id !== territoryId)
        };
      }
      return p;
    }));

    // Reset territory ownership
    setTerritoriesState(prev => prev.map(t => {
      if (t.id === territoryId) {
        return {
          ...t,
          ownerId: null,
          claimedAtRound: null,
          claimedAtTime: undefined,
          activeBonuses: []
        };
      }
      return t;
    }));

    // If a policy card was marked used for this territory, free it
    setPolicyCardsState(prev => prev.map(c => {
      if (c.targetTerritoryId === territoryId && c.usedByPlayerId === oldOwnerId) {
        return {
          ...c,
          isUsed: false,
          usedByPlayerId: undefined,
          usedAtRound: undefined
        };
      }
      return c;
    }));

    addLog(
      'claim',
      `Territory "${territory.name}" claim by ${player?.name || oldOwnerId} was revoked${refundAmount > 0 ? ` (refunded ${refundAmount} GB)` : ''}.`,
      {
        playerId: oldOwnerId,
        playerName: player?.name,
        playerColor: player?.color,
        gbChange: refundAmount > 0 ? refundAmount : undefined,
        territoryId,
      }
    );

    soundEffects.playClick();
    return { success: true, message: `Revoked claim on ${territory.name}.` };
  };

  const assignTerritoryOwner = (territoryId: string, newOwnerId: string | null) => {
    takeSnapshot();
    const terr = territories.find(t => t.id === territoryId);
    if (!terr) return;
    const oldOwnerId = terr.ownerId;
    const oldPlayer = players.find(p => p.id === oldOwnerId);
    const newPlayer = players.find(p => p.id === newOwnerId);

    // Update territory
    setTerritoriesState(prev => prev.map(t => {
      if (t.id === territoryId) {
        return {
          ...t,
          ownerId: newOwnerId,
          claimedAtRound: newOwnerId ? (t.claimedAtRound || settings.currentRound) : null,
          claimedAtTime: newOwnerId ? (t.claimedAtTime || new Date().toLocaleTimeString()) : undefined,
        };
      }
      return t;
    }));

    // Update players territoryIds
    setPlayersState(prev => prev.map(p => {
      if (p.id === oldOwnerId && oldOwnerId !== newOwnerId) {
        return { ...p, territoryIds: p.territoryIds.filter(id => id !== territoryId) };
      }
      if (p.id === newOwnerId && !p.territoryIds.includes(territoryId)) {
        return { ...p, territoryIds: [...p.territoryIds, territoryId] };
      }
      return p;
    }));

    addLog(
      'claim',
      newOwnerId 
        ? `Territory "${terr.name}" manually assigned to ${newPlayer?.name || newOwnerId} by Host.`
        : `Territory "${terr.name}" ownership cleared (unclaimed) by Host.`,
      {
        playerId: newOwnerId || oldOwnerId || undefined,
        playerName: newPlayer?.name || oldPlayer?.name,
        playerColor: newPlayer?.color || oldPlayer?.color,
        territoryId
      }
    );
    soundEffects.playClick();
  };

  const updateTerritory = (territoryId: string, updates: Partial<Territory>) => {
    takeSnapshot();
    setTerritoriesState(prev => prev.map(t => t.id === territoryId ? { ...t, ...updates } : t));
  };

  const addTerritoryMarker = (category: TerritoryCategory, x: number, y: number): string => {
    takeSnapshot();
    const config = economyConfig[category] || { basePoints: 5, claimCost: 3, baseIncome: 1 };
    const id = `terr-custom-${Date.now()}`;
    const newTerritory: Territory = {
      id,
      code: `NEW-${Math.floor(100 + Math.random() * 900)}`,
      name: `Custom ${category.toUpperCase()} Zone`,
      category,
      basePoints: config.basePoints,
      claimCost: config.claimCost,
      baseIncome: config.baseIncome,
      x: Math.max(0.02, Math.min(0.98, x)),
      y: Math.max(0.02, Math.min(0.98, y)),
      ownerId: null,
      claimedAtRound: null,
      activeBonuses: [],
    };
    setTerritoriesState(prev => [...prev, newTerritory]);
    soundEffects.playClick();
    return id;
  };

  const deleteTerritoryMarker = (territoryId: string) => {
    takeSnapshot();
    setTerritoriesState(prev => prev.filter(t => t.id !== territoryId));
    soundEffects.playClick();
  };

  // Code Verification
  const verifyCardCode = (rawCode: string) => {
    const cleanInput = rawCode.trim().toUpperCase();
    const normalize = (s: string) => s.replace(/[\s\-_]/g, '').toUpperCase();
    const inputNorm = normalize(cleanInput);

    const matchCode = (cardCode: string) => {
      if (cardCode.toUpperCase() === cleanInput) return true;
      if (normalize(cardCode) === inputNorm) return true;
      const cDigits = cardCode.match(/\d+/)?.[0];
      const inputDigits = cleanInput.match(/\d+/)?.[0];
      const cPrefix = cardCode.replace(/[\d\-_]/g, '').toUpperCase();
      const inputPrefix = cleanInput.replace(/[\d\-_]/g, '').toUpperCase();
      if (cPrefix === inputPrefix && cDigits && inputDigits && parseInt(cDigits, 10) === parseInt(inputDigits, 10)) {
        return true;
      }
      return false;
    };

    // Check policy cards
    const pol = policyCards.find(c => matchCode(c.code));
    if (pol) {
      return { type: 'policy' as const, card: pol, isUsed: pol.isUsed };
    }

    // Check crisis cards
    const cri = crisisCards.find(c => matchCode(c.code));
    if (cri) {
      return { type: 'crisis' as const, card: cri, isUsed: cri.isUsed };
    }

    // Check mission cards
    const mis = missionCards.find(c => matchCode(c.code));
    if (mis) {
      return { type: 'mission' as const, card: mis, isUsed: mis.isUsed };
    }

    // Check opportunity cards
    const opp = opportunityCards.find(c => matchCode(c.code));
    if (opp) {
      return { type: 'opportunity' as const, card: opp, isUsed: opp.isUsed };
    }

    return { type: 'not_found' as const };
  };

  // Crisis Resolution
  const resolveCrisis = (crisisId: string, playerId: string, optionId: 'A' | 'B' | 'C' | 'DECLINE'): { success: boolean; message: string } => {
    takeSnapshot();
    const crisis = crisisCards.find(c => c.id === crisisId);
    if (!crisis) return { success: false, message: 'Crisis card not found.' };
    const player = players.find(p => p.id === playerId);
    if (!player) return { success: false, message: 'Player not found.' };

    if (crisis.isUsed && !crisis.isReusable) {
      return { success: false, message: `Crisis card ${crisis.code} has already been used!` };
    }

    let costGB = 0;
    let rewardGB = 0;
    let pointChange = 0;
    let choiceText = '';

    if (optionId === 'DECLINE') {
      costGB = crisis.declineOption.costGB || 0;
      rewardGB = crisis.declineOption.rewardGB || 0;
      pointChange = crisis.declineOption.pointChange || 0;
      choiceText = `DECLINE ALL: ${crisis.declineOption.text}`;
    } else {
      const opt = crisis.options.find(o => o.id === optionId);
      if (!opt) return { success: false, message: 'Invalid option selected.' };
      costGB = opt.costGB || 0;
      rewardGB = opt.rewardGB || 0;
      pointChange = opt.pointChange || 0;
      choiceText = `Option ${optionId}: ${opt.text}`;
    }

    const netGB = rewardGB - costGB;
    // Check if player has enough GB to pay
    if (costGB > 0 && player.budget < costGB) {
      return {
        success: false,
        message: `Insufficient Government Budget! ${player.name} needs ${costGB} GB, but only has ${player.budget} GB.`
      };
    }

    soundEffects.playCrisisAlert();

    // Update player
    setPlayersState(prev => prev.map(p => {
      if (p.id === playerId) {
        return {
          ...p,
          budget: Math.max(0, p.budget + netGB),
          victoryPoints: p.victoryPoints + pointChange,
        };
      }
      return p;
    }));

    // Mark card used
    setCrisisCardsState(prev => prev.map(c => {
      if (c.id === crisisId) {
        return {
          ...c,
          isUsed: true,
          usedByPlayerId: playerId,
          selectedOption: optionId,
          usedAtRound: settings.currentRound,
        };
      }
      return c;
    }));

    addLog(
      'crisis',
      `${player.name} resolved ${crisis.title} (${crisis.code}) selecting ${choiceText}. GB: ${netGB >= 0 ? '+' : ''}${netGB}, VP: ${pointChange >= 0 ? '+' : ''}${pointChange}.`,
      {
        playerId,
        playerName: player.name,
        playerColor: player.color,
        gbChange: netGB,
        pointChange,
        cardCode: crisis.code,
      }
    );

    return {
      success: true,
      message: `Crisis "${crisis.title}" resolved! Applied: GB ${netGB >= 0 ? '+' : ''}${netGB}, VP ${pointChange >= 0 ? '+' : ''}${pointChange}.`
    };
  };

  // Mission Activation & Completion
  const activateMission = (missionId: string, playerId: string): { success: boolean; message: string } => {
    takeSnapshot();
    const mission = missionCards.find(m => m.id === missionId);
    if (!mission) return { success: false, message: 'Mission card not found.' };
    const player = players.find(p => p.id === playerId);
    if (!player) return { success: false, message: 'Player not found.' };

    if (mission.isUsed && !mission.isReusable) {
      return { success: false, message: 'Mission card has already been claimed/used!' };
    }

    soundEffects.playOpportunity();

    setMissionCardsState(prev => prev.map(m => {
      if (m.id === missionId) {
        return {
          ...m,
          status: 'active',
          assignedPlayerId: playerId,
          isUsed: true,
        };
      }
      return m;
    }));

    // Add to player active missions
    const newActiveMission = {
      id: mission.id,
      code: mission.code,
      title: mission.title,
      conditionType: mission.conditionType,
      targetCategory: mission.targetCategory,
      targetCount: mission.targetCount,
      targetValue: mission.targetValue,
      rewardPoints: mission.rewardPoints,
      rewardGB: mission.rewardGB,
      status: 'active' as const,
      activatedAtRound: settings.currentRound,
      description: mission.description,
      progressPercent: 0,
    };

    setPlayersState(prev => prev.map(p => {
      if (p.id === playerId) {
        return {
          ...p,
          activeMissions: [...(p.activeMissions || []), newActiveMission],
        };
      }
      return p;
    }));

    addLog(
      'mission_activated',
      `${player.name} activated Mission "${mission.title}" (${mission.code}).`,
      {
        playerId,
        playerName: player.name,
        playerColor: player.color,
        cardCode: mission.code,
      }
    );

    return {
      success: true,
      message: `Mission "${mission.title}" activated for ${player.name}!`
    };
  };

  const completeMission = (missionId: string, playerId: string): { success: boolean; message: string } => {
    takeSnapshot();
    const mission = missionCards.find(m => m.id === missionId);
    if (!mission) return { success: false, message: 'Mission not found.' };
    const player = players.find(p => p.id === playerId);
    if (!player) return { success: false, message: 'Player not found.' };

    soundEffects.playMissionComplete();

    // Reward player
    setPlayersState(prev => prev.map(p => {
      if (p.id === playerId) {
        const updatedMissions = (p.activeMissions || []).map(m => {
          if (m.id === missionId) return { ...m, status: 'completed' as const, progressPercent: 100 };
          return m;
        });
        return {
          ...p,
          budget: p.budget + mission.rewardGB,
          victoryPoints: p.victoryPoints + mission.rewardPoints,
          activeMissions: updatedMissions,
        };
      }
      return p;
    }));

    // Update mission card
    setMissionCardsState(prev => prev.map(m => {
      if (m.id === missionId) {
        return { ...m, status: 'completed' };
      }
      return m;
    }));

    addLog(
      'mission_completed',
      `MISSION COMPLETED: ${player.name} completed "${mission.title}"! Received +${mission.rewardPoints} VP and +${mission.rewardGB} GB.`,
      {
        playerId,
        playerName: player.name,
        playerColor: player.color,
        gbChange: mission.rewardGB,
        pointChange: mission.rewardPoints,
        cardCode: mission.code,
      }
    );

    return {
      success: true,
      message: `Mission completed! Awarded +${mission.rewardPoints} VP and +${mission.rewardGB} GB to ${player.name}.`
    };
  };

  // Opportunity Activation
  const activateOpportunity = (
    opportunityId: string, 
    playerId: string,
    targetTerritoryId?: string
  ): { success: boolean; message: string } => {
    takeSnapshot();
    const opp = opportunityCards.find(o => o.id === opportunityId);
    if (!opp) return { success: false, message: 'Kartu Opportunity tidak ditemukan.' };
    const player = players.find(p => p.id === playerId);
    if (!player) return { success: false, message: 'Pemain tidak ditemukan.' };

    if (opp.isUsed && !opp.isReusable) {
      return { success: false, message: 'Kartu Opportunity ini sudah digunakan sebelumnya!' };
    }

    if (opp.costGB > 0 && player.budget < opp.costGB) {
      return {
        success: false,
        message: `Saldo GB tidak mencukupi! ${player.name} memerlukan ${opp.costGB} GB untuk mengaktifkan kartu ini, tetapi hanya memiliki ${player.budget} GB.`
      };
    }

    // 1. Validation for category-specific Opportunity (Logo Wilayah)
    let targetTerritory: Territory | undefined;
    if (opp.targetCategory) {
      if (!targetTerritoryId) {
        return {
          success: false,
          message: `Kartu ini memiliki logo kategori ${opp.targetCategory.toUpperCase()}. Anda wajib memilih satu wilayah milik Anda dengan kategori yang sama!`
        };
      }
      targetTerritory = territories.find(t => t.id === targetTerritoryId);
      if (!targetTerritory) {
        return { success: false, message: 'Wilayah sasaran yang dipilih tidak ditemukan.' };
      }
      if (targetTerritory.ownerId !== playerId) {
        return {
          success: false,
          message: `Wilayah "${targetTerritory.name}" bukan milik ${player.name}! Kartu hanya boleh diterapkan pada 1 wilayah milik pemain sendiri.`
        };
      }
      if (targetTerritory.category !== opp.targetCategory) {
        return {
          success: false,
          message: `Kategori wilayah "${targetTerritory.name}" (${targetTerritory.category.toUpperCase()}) tidak cocok dengan logo kartu (${opp.targetCategory.toUpperCase()})!`
        };
      }
    }

    soundEffects.playOpportunity();

    // 2. Financial & VP changes
    const netImmediateGB = (opp.immediateGB || 0) - opp.costGB;
    const immediateVP = opp.immediatePoints || 0;
    const isPerm = opp.isPermanent || opp.durationCycles === 0;

    // 3. Create active opportunity record
    const newActiveOpp: ActiveOpportunity = {
      id: `${opp.id}-${Date.now()}`,
      code: opp.code,
      title: opp.title,
      recurringGB: opp.recurringGB || 0,
      remainingCycles: isPerm ? 0 : opp.durationCycles,
      isPermanent: isPerm,
      targetCategory: opp.targetCategory,
      targetTerritoryId: targetTerritory?.id,
      targetTerritoryName: targetTerritory?.name,
      activatedAtRound: settings.currentRound,
      description: opp.description,
    };

    // 4. Update player state
    setPlayersState(prev => prev.map(p => {
      if (p.id === playerId) {
        return {
          ...p,
          budget: p.budget + netImmediateGB,
          victoryPoints: p.victoryPoints + immediateVP,
          activeOpportunities: (opp.recurringGB > 0 || isPerm || targetTerritory)
            ? [...(p.activeOpportunities || []), newActiveOpp]
            : (p.activeOpportunities || []),
        };
      }
      return p;
    }));

    // 5. If card targeted a single territory, attach bonus to ONLY that single territory
    if (targetTerritory) {
      setTerritoriesState(prev => prev.map(t => {
        if (t.id === targetTerritory!.id) {
          const newBonus: TerritoryBonus = {
            id: `bonus-${opp.id}-${Date.now()}`,
            sourceCardCode: opp.code,
            sourceTitle: opp.title,
            incomeBonus: opp.recurringGB || 0,
            pointBonus: 0,
            description: `Opportunity: ${opp.title}`,
            durationCycles: opp.durationCycles,
            remainingCycles: isPerm ? 0 : opp.durationCycles,
            isPermanent: isPerm,
          };
          return {
            ...t,
            activeBonuses: [...(t.activeBonuses || []), newBonus],
          };
        }
        return t;
      }));
    }

    // 6. Mark card as used
    setOpportunityCardsState(prev => prev.map(o => {
      if (o.id === opportunityId) {
        return {
          ...o,
          isUsed: true,
          assignedPlayerId: playerId,
        };
      }
      return o;
    }));

    // 7. Add log to Game History
    const targetDesc = targetTerritory 
      ? ` pada 1 wilayah: "${targetTerritory.name}" (${opp.targetCategory?.toUpperCase()})` 
      : ' (Skala Umum Seluruh Wilayah Pemain)';

    let effectSummary = `Biaya: ${opp.costGB > 0 ? `-${opp.costGB} GB` : '0 GB'}, VP: +${immediateVP}`;
    if (opp.recurringGB > 0) {
      effectSummary += `, Pendapatan: +${opp.recurringGB} GB/putaran (${isPerm ? 'Permanen' : `${opp.durationCycles} putaran`})`;
    }

    addLog(
      'opportunity',
      `${player.name} menggunakan Opportunity "${opp.title}" (${opp.code})${targetDesc}. ${effectSummary}.`,
      {
        playerId,
        playerName: player.name,
        playerColor: player.color,
        gbChange: netImmediateGB,
        pointChange: immediateVP,
        cardCode: opp.code,
        territoryId: targetTerritory?.id,
      }
    );

    return {
      success: true,
      message: `Opportunity "${opp.title}" berhasil diaktifkan untuk ${player.name}${targetDesc}! Saldo GB ${netImmediateGB >= 0 ? '+' : ''}${netImmediateGB}, VP +${immediateVP}.`
    };
  };

  // Modals
  const openModal = (modalName: string, data?: any) => {
    setActiveModal(modalName);
    setActiveModalData(data || null);
    soundEffects.playClick();
  };

  const closeModal = () => {
    setActiveModal(null);
    setActiveModalData(null);
  };

  const toggleSound = () => {
    const nextVal = !settings.soundEnabled;
    setSettingsState(s => ({ ...s, soundEnabled: nextVal }));
    soundEffects.enabled = nextVal;
    if (nextVal) soundEffects.playClick();
  };

  // Admin CRUD
  const updatePolicyCard = (id: string, updates: Partial<PolicyCard>) => {
    takeSnapshot();
    setPolicyCardsState(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const updateCrisisCard = (id: string, updates: Partial<CrisisCard>) => {
    takeSnapshot();
    setCrisisCardsState(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const updateMissionCard = (id: string, updates: Partial<MissionCard>) => {
    takeSnapshot();
    setMissionCardsState(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const updateOpportunityCard = (id: string, updates: Partial<OpportunityCard>) => {
    takeSnapshot();
    setOpportunityCardsState(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const resetDeckCards = (deckType: 'policy' | 'crisis' | 'mission' | 'opportunity') => {
    takeSnapshot();
    if (deckType === 'policy') {
      setPolicyCardsState(prev => prev.map(c => ({ ...c, isUsed: false, usedByPlayerId: undefined, usedAtRound: undefined })));
    } else if (deckType === 'crisis') {
      setCrisisCardsState(prev => prev.map(c => ({ ...c, isUsed: false, usedByPlayerId: undefined, selectedOption: undefined, usedAtRound: undefined })));
    } else if (deckType === 'mission') {
      setMissionCardsState(prev => prev.map(c => ({ ...c, status: 'available', assignedPlayerId: undefined, isUsed: false })));
    } else if (deckType === 'opportunity') {
      setOpportunityCardsState(prev => prev.map(c => ({ ...c, isUsed: false, assignedPlayerId: undefined })));
    }
    addLog('game_control', `Reset ${deckType.toUpperCase()} deck cards to available.`);
    soundEffects.playClick();
  };

  const updateCardImage = async (deckType: 'policy' | 'crisis' | 'mission' | 'opportunity', cardId: string, dataUrl: string) => {
    takeSnapshot();
    await saveImageToDB(`card_${cardId}`, dataUrl);
    if (deckType === 'policy') {
      setPolicyCardsState(prev => prev.map(c => c.id === cardId ? { ...c, image: dataUrl } : c));
    } else if (deckType === 'crisis') {
      setCrisisCardsState(prev => prev.map(c => c.id === cardId ? { ...c, image: dataUrl } : c));
    } else if (deckType === 'mission') {
      setMissionCardsState(prev => prev.map(c => c.id === cardId ? { ...c, image: dataUrl } : c));
    } else if (deckType === 'opportunity') {
      setOpportunityCardsState(prev => prev.map(c => c.id === cardId ? { ...c, image: dataUrl } : c));
    }
    soundEffects.playClick();
  };

  const updateEconomyConfig = (updates: Partial<EconomyConfig>) => {
    takeSnapshot();
    setEconomyConfigState(prev => ({ ...prev, ...updates }));
  };

  const updateGameSettings = (updates: Partial<GameSettings>) => {
    takeSnapshot();
    setSettingsState(prev => ({ ...prev, ...updates }));
  };

  // Image assets
  const setCustomMapImage = async (dataUrl: string) => {
    takeSnapshot();
    await saveImageToDB('custom_map', dataUrl);
    setSettingsState(s => ({ ...s, boardMapImage: dataUrl }));
  };

  const setCustomCardBack = async (type: 'policy' | 'event', dataUrl: string) => {
    takeSnapshot();
    const key = type === 'policy' ? 'policy_back' : 'event_back';
    await saveImageToDB(key, dataUrl);
    setSettingsState(s => ({
      ...s,
      [type === 'policy' ? 'policyBackImage' : 'eventBackImage']: dataUrl
    }));
  };

  // Dice System & Turn Management
  const rollDice = async (playerId?: string): Promise<number> => {
    if (settings.status !== 'active') {
      throw new Error('Pertandingan belum aktif. Silakan mulai game terlebih dahulu.');
    }

    if (diceState.isRolling) {
      return diceState.currentValue || 1;
    }

    const currentActive = players.find(p => p.id === (settings.activePlayerId || players[0]?.id)) || players[0] || INITIAL_PLAYERS[0];
    if (playerId && playerId !== currentActive.id) {
      throw new Error(`Bukan giliran Anda. Giliran saat ini milik ${currentActive.name} (${currentActive.color.toUpperCase()}).`);
    }

    if (diceState.hasRolledThisTurn) {
      throw new Error(`${currentActive.name} sudah melempar dadu pada giliran ini. Silakan oper giliran ke pemain berikutnya.`);
    }

    takeSnapshot();

    // 1. Enter rolling animation state
    setDiceState(prev => ({ ...prev, isRolling: true }));
    broadcastGameEvent({
      type: 'DICE_START_ROLL',
      payload: { playerId: currentActive.id }
    });
    soundEffects.playDiceRoll();

    // 2. High-entropy cryptographically secure random number generator (1 to 6)
    const randomBuffer = new Uint32Array(1);
    if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
      window.crypto.getRandomValues(randomBuffer);
    } else {
      randomBuffer[0] = Math.floor(Math.random() * 0xFFFFFFFF);
    }
    const rollValue = (randomBuffer[0] % 6) + 1;

    // 3. Animation duration delay (850ms) to allow dice roll animation to play out
    await new Promise(resolve => setTimeout(resolve, 850));

    const currentTurnNum = settings.currentTurn || 1;
    const currentRoundNum = settings.currentRound || 1;

    const newLog: DiceRollLog = {
      id: `dice-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      playerId: currentActive.id,
      playerName: currentActive.name,
      playerColor: currentActive.color,
      value: rollValue,
      round: currentRoundNum,
      turn: currentTurnNum,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    };

    const updatedDiceState: DiceState = {
      currentValue: rollValue,
      isRolling: false,
      lastRolledByPlayerId: currentActive.id,
      lastRolledAtRound: currentRoundNum,
      hasRolledThisTurn: true,
      history: [newLog, ...(diceState.history || [])].slice(0, 50),
    };

    setDiceState(updatedDiceState);
    saveLocalState('pt_dice', updatedDiceState);

    broadcastGameEvent({
      type: 'DICE_ROLLED',
      payload: {
        diceState: updatedDiceState,
        rollLog: newLog,
      }
    });

    addLog('dice_roll', `${currentActive.name} melempar dadu dan mendapatkan angka [${rollValue}] pada Giliran #${currentTurnNum}.`, {
      playerId: currentActive.id,
      playerName: currentActive.name,
      playerColor: currentActive.color,
      diceValue: rollValue,
    });

    soundEffects.playDiceLand();
    return rollValue;
  };

  const nextTurn = () => {
    if (players.length === 0) return;
    takeSnapshot();
    const currentActiveId = settings.activePlayerId || players[0]?.id;
    const currentIndex = players.findIndex(p => p.id === currentActiveId);
    const nextIndex = (currentIndex + 1) % players.length;
    const nextPlayer = players[nextIndex];
    const nextTurnNum = (settings.currentTurn || 1) + 1;

    setSettingsState(s => ({
      ...s,
      activePlayerId: nextPlayer.id,
      currentTurn: nextTurnNum,
    }));

    const updatedDiceState: DiceState = {
      ...diceState,
      hasRolledThisTurn: false,
      isRolling: false,
    };
    setDiceState(updatedDiceState);
    saveLocalState('pt_dice', updatedDiceState);

    broadcastGameEvent({
      type: 'TURN_CHANGED',
      payload: {
        activePlayerId: nextPlayer.id,
        currentTurn: nextTurnNum,
      }
    });

    addLog('game_control', `Giliran #${nextTurnNum}: Sekarang giliran ${nextPlayer.name} (${nextPlayer.color.toUpperCase()}).`);
    soundEffects.playClick();
  };

  const setActiveTurnPlayer = (playerId: string) => {
    const target = players.find(p => p.id === playerId);
    if (!target) return;
    takeSnapshot();
    const turnNum = settings.currentTurn || 1;

    setSettingsState(s => ({
      ...s,
      activePlayerId: target.id,
    }));

    const updatedDiceState: DiceState = {
      ...diceState,
      hasRolledThisTurn: false,
      isRolling: false,
    };
    setDiceState(updatedDiceState);
    saveLocalState('pt_dice', updatedDiceState);

    broadcastGameEvent({
      type: 'TURN_CHANGED',
      payload: {
        activePlayerId: target.id,
        currentTurn: turnNum,
      }
    });

    addLog('game_control', `Host mengatur giliran aktif ke ${target.name} (${target.color.toUpperCase()}).`);
    soundEffects.playClick();
  };

  // Export / Import
  const exportGameState = (): string => {
    return JSON.stringify({
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      players,
      territories,
      policyCards,
      crisisCards,
      missionCards,
      opportunityCards,
      logs,
      settings,
      economyConfig,
      diceState,
    }, null, 2);
  };

  const importGameState = (jsonStr: string): boolean => {
    try {
      const data = JSON.parse(jsonStr);
      if (!data.players || !data.territories) return false;
      takeSnapshot();
      if (data.players) setPlayersState(data.players);
      if (data.territories) setTerritoriesState(data.territories);
      if (data.policyCards) setPolicyCardsState(data.policyCards);
      if (data.crisisCards) setCrisisCardsState(data.crisisCards);
      if (data.missionCards) setMissionCardsState(data.missionCards);
      if (data.opportunityCards) setOpportunityCardsState(data.opportunityCards);
      if (data.logs) setLogsState(data.logs);
      if (data.settings) setSettingsState(data.settings);
      if (data.economyConfig) setEconomyConfigState(data.economyConfig);
      if (data.diceState) setDiceState(data.diceState);
      addLog('game_control', 'Imported game state from backup file.');
      return true;
    } catch (e) {
      console.error('Import failed', e);
      return false;
    }
  };

  return (
    <GameContext.Provider value={{
      players,
      territories,
      policyCards,
      crisisCards,
      missionCards,
      opportunityCards,
      logs,
      settings,
      economyConfig,
      latestIncomeSummary,
      activeModal,
      activeModalData,
      undoAvailable: undoHistory.length > 0,

      // Turn & Dice
      activePlayer,
      diceState,
      rollDice,
      nextTurn,
      setActiveTurnPlayer,

      setPlayers: setPlayersState,
      updatePlayer,
      adjustPlayerBudget,
      adjustPlayerVP,
      addPlayer,
      removePlayer,

      startGame,
      pauseGame,
      resumeGame,
      endGame,
      resetGame,

      triggerEconomicRound,
      resetEconomicTimer,
      setEconomicInterval,
      closeIncomeSummary,

      claimTerritory,
      revokeTerritoryClaim,
      assignTerritoryOwner,
      updateTerritory,
      addTerritoryMarker,
      deleteTerritoryMarker,

      verifyCardCode,
      resolveCrisis,
      activateMission,
      completeMission,
      activateOpportunity,

      updatePolicyCard,
      updateCrisisCard,
      updateMissionCard,
      updateOpportunityCard,
      resetDeckCards,
      updateCardImage,
      updateEconomyConfig,
      updateGameSettings,

      openModal,
      closeModal,
      undoLastAction,
      toggleSound,

      setCustomMapImage,
      setCustomCardBack,
      exportGameState,
      importGameState,

      calculatePlayerIncome,
      calculatePlayerVictoryPoints,
    }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
