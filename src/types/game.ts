export type PlayerColor = 'red' | 'blue' | 'green' | 'yellow';

export type TerritoryCategory = 
  | 'politics' 
  | 'industry' 
  | 'education' 
  | 'healthcare' 
  | 'agriculture' 
  | 'water' 
  | 'tourism' 
  | 'forest';

export interface TerritoryBonus {
  id: string;
  sourceCardCode: string;
  sourceTitle: string;
  incomeBonus: number;
  pointBonus: number;
  description: string;
  durationCycles?: number;
  remainingCycles?: number;
  isPermanent?: boolean;
}

export interface Territory {
  id: string;
  code: string; // e.g., 'POL-01', 'IND-01'
  name: string;
  category: TerritoryCategory;
  basePoints: number;
  claimCost: number;
  baseIncome: number;
  x: number; // 0.0 to 1.0 relative to map image width
  y: number; // 0.0 to 1.0 relative to map image height
  ownerId: string | null;
  claimedAtRound: number | null;
  claimedAtTime?: string;
  customImage?: string;
  activeBonuses: TerritoryBonus[];
}

export interface Player {
  id: string; // 'red', 'blue', 'green', 'yellow'
  name: string;
  color: PlayerColor;
  budget: number; // Government Budget (GB)
  victoryPoints: number;
  territoryIds: string[];
  activeOpportunities: ActiveOpportunity[];
  activeMissions: ActiveMission[];
  avatar?: string;
  customLogo?: string;
}

export interface ActiveOpportunity {
  id: string;
  code: string;
  title: string;
  recurringGB: number;
  remainingCycles: number; // 0 for permanent
  isPermanent: boolean;
  targetCategory?: TerritoryCategory;
  targetTerritoryId?: string;
  targetTerritoryName?: string;
  activatedAtRound: number;
  description: string;
}

export interface ActiveMission {
  id: string;
  code: string;
  title: string;
  conditionType: 'own_category_count' | 'own_territory_count' | 'reach_income' | 'reach_gb' | 'diverse_categories' | 'custom';
  targetCategory?: TerritoryCategory;
  targetCount?: number;
  targetValue?: number;
  rewardPoints: number;
  rewardGB: number;
  status: 'active' | 'completed' | 'failed' | 'expired';
  activatedAtRound: number;
  description: string;
  progressPercent: number;
}

export interface PolicyCard {
  id: string;
  code: string;
  name: string;
  category: TerritoryCategory | 'free_choice';
  isFreeChoice: boolean;
  targetTerritoryId?: string; // matched territory ID
  claimCost: number;
  image: string;
  isUsed: boolean;
  usedByPlayerId?: string;
  usedAtRound?: number;
  isReusable: boolean;
}

export interface CrisisOption {
  id: 'A' | 'B' | 'C';
  text: string;
  costGB: number;
  rewardGB: number;
  pointChange: number;
  incomeChange?: number;
  description: string;
}

export interface CrisisCard {
  id: string;
  code: string; // e.g. CRS-01
  title: string;
  description: string;
  image: string;
  options: CrisisOption[];
  declineOption: {
    text: string;
    costGB: number;
    rewardGB: number;
    pointChange: number;
    description: string;
  };
  isUsed: boolean;
  usedByPlayerId?: string;
  selectedOption?: 'A' | 'B' | 'C' | 'DECLINE';
  usedAtRound?: number;
  isReusable: boolean;
}

export interface MissionCard {
  id: string;
  code: string; // e.g. MIS-01
  title: string;
  description: string;
  image: string;
  conditionType: 'own_category_count' | 'own_territory_count' | 'reach_income' | 'reach_gb' | 'diverse_categories' | 'custom';
  targetCategory?: TerritoryCategory;
  targetCount?: number;
  targetValue?: number;
  rewardPoints: number;
  rewardGB: number;
  status: 'available' | 'active' | 'completed' | 'failed';
  assignedPlayerId?: string;
  isUsed: boolean;
  isReusable: boolean;
}

export interface OpportunityCard {
  id: string;
  code: string; // e.g. OPP-01
  title: string;
  description: string;
  image: string;
  costGB: number;
  immediateGB: number;
  immediatePoints: number;
  recurringGB: number;
  durationCycles: number; // 0 = permanent
  isPermanent: boolean;
  targetCategory?: TerritoryCategory;
  isUsed: boolean;
  assignedPlayerId?: string;
  isReusable: boolean;
}

export type LogType = 
  | 'claim' 
  | 'gb_change' 
  | 'point_change' 
  | 'economic_round' 
  | 'crisis' 
  | 'mission_activated' 
  | 'mission_completed' 
  | 'opportunity' 
  | 'game_control'
  | 'development'
  | 'dice_roll';

export interface DiceRollLog {
  id: string;
  playerId: string;
  playerName: string;
  playerColor: PlayerColor;
  value: number; // 1 to 6
  round: number;
  turn: number;
  timestamp: string;
}

export type TurnPhase = 'waiting_roll' | 'rolling' | 'claim_pending' | 'claim_completed';

export interface DiceState {
  currentValue: number | null; // Last roll value (1-6)
  isRolling: boolean;
  rollingPlayerId?: string | null; // Player ID currently rolling during animation
  lastRolledByPlayerId: string | null;
  lastRolledAtRound: number | null;
  lastRolledAtTurn?: number | null;
  hasRolledThisTurn: boolean;
  turnPhase?: TurnPhase;
  history: DiceRollLog[];
}

export interface GameLog {
  id: string;
  timestamp: string;
  round: number;
  playerId?: string;
  playerName?: string;
  playerColor?: PlayerColor;
  type: LogType;
  description: string;
  gbChange?: number;
  pointChange?: number;
  territoryId?: string;
  cardCode?: string;
  diceValue?: number;
}

export interface GameSettings {
  status: 'setup' | 'active' | 'paused' | 'ended';
  gameTitle?: string;
  economicIntervalSeconds: number; // e.g., 300 for 5m
  timerRemainingSeconds: number;
  isTimerRunning: boolean;
  currentRound: number;
  currentTurn?: number; // Overall turn number
  activePlayerId?: string; // Player ID whose turn is active
  diceState?: DiceState; // Dice system state
  turnLimit: number; // 0 for unlimited
  startingVP?: number;
  availableDecks?: {
    policy: boolean;
    crisis: boolean;
    mission: boolean;
    opportunity: boolean;
  };
  defaultStartingGB: Record<number, number>; // 2: 25, 3: 20, 4: 15
  boardMapImage: string;
  policyBackImage: string;
  eventBackImage: string;
  logoImage?: string;
  soundEnabled: boolean;
}

export interface EconomyConfig {
  politics: { basePoints: number; claimCost: number; baseIncome: number };
  industry: { basePoints: number; claimCost: number; baseIncome: number };
  education: { basePoints: number; claimCost: number; baseIncome: number };
  healthcare: { basePoints: number; claimCost: number; baseIncome: number };
  agriculture: { basePoints: number; claimCost: number; baseIncome: number };
  water: { basePoints: number; claimCost: number; baseIncome: number };
  tourism: { basePoints: number; claimCost: number; baseIncome: number };
  forest: { basePoints: number; claimCost: number; baseIncome: number };
}

export interface IncomeDistributionSummary {
  round: number;
  distributions: {
    playerId: string;
    playerName: string;
    playerColor: PlayerColor;
    baseIncome: number;
    opportunityIncome: number;
    totalReceived: number;
    newBalance: number;
  }[];
}
