// Card Assets Registry using Vite's eager glob imports
// This guarantees that every physical card artwork is bundled and hashed for production!

import defaultEventBack from '../../event/belakang event card.png';
import defaultPolicyBack from '../../policy card/belakang policy card.png';

// Eager glob imports for all categories
const crisisModules = import.meta.glob('../../event/crisis/*.png', { eager: true, import: 'default' }) as Record<string, string>;
const missionModules = import.meta.glob('../../event/mission/*.png', { eager: true, import: 'default' }) as Record<string, string>;
const oppModules = import.meta.glob('../../event/opportunity/*.png', { eager: true, import: 'default' }) as Record<string, string>;
const policyModules = import.meta.glob('../../policy card/*.png', { eager: true, import: 'default' }) as Record<string, string>;

export const EVENT_CARD_BACK = defaultEventBack;
export const POLICY_CARD_BACK = defaultPolicyBack;

export function getCrisisImageUrl(num: number | string): string {
  const targetKey = `../../event/crisis/crisis (${num}).png`;
  return crisisModules[targetKey] || `/game-assets/crisis/crisis (${num}).png`;
}

export function getMissionImageUrl(num: number | string): string {
  // Notice physical asset spelling: "misson (num).png"
  const targetKey = `../../event/mission/misson (${num}).png`;
  return missionModules[targetKey] || `/game-assets/mission/misson (${num}).png`;
}

export function getOpportunityImageUrl(num: number | string): string {
  const targetKey = `../../event/opportunity/opportunity (${num}).png`;
  return oppModules[targetKey] || `/game-assets/opportunity/opportunity (${num}).png`;
}

export function getPolicyImageUrl(categoryOrName: string, num: number | string): string {
  // Category capitalized: "Politics (1).png", "bebas pilih (1).png"
  let fileName = `${categoryOrName} (${num}).png`;
  if (categoryOrName.toLowerCase() === 'free_choice' || categoryOrName.toLowerCase() === 'bebas pilih') {
    fileName = `bebas pilih (${num}).png`;
  }
  const targetKey = `../../policy card/${fileName}`;
  return policyModules[targetKey] || `/game-assets/policy/${fileName}`;
}

export function getCardAsset(imagePath: string | undefined, defaultBack: string = EVENT_CARD_BACK): string {
  if (!imagePath) return defaultBack;
  if (imagePath.startsWith('data:')) return imagePath;

  // Crisis matching
  const crisisMatch = imagePath.match(/crisis\s*\(([0-9]+)\)/i);
  if (crisisMatch) return getCrisisImageUrl(crisisMatch[1]);

  // Mission matching
  const missionMatch = imagePath.match(/misso?n\s*\(([0-9]+)\)/i);
  if (missionMatch) return getMissionImageUrl(missionMatch[1]);

  // Opportunity matching
  const oppMatch = imagePath.match(/opportunity\s*\(([0-9]+)\)/i);
  if (oppMatch) return getOpportunityImageUrl(oppMatch[1]);

  // Bebas pilih matching
  const sbsMatch = imagePath.match(/bebas\s*pilih\s*\(([0-9]+)\)/i);
  if (sbsMatch) return getPolicyImageUrl('bebas pilih', sbsMatch[1]);

  // Standard policy matching
  const polMatch = imagePath.match(/([a-zA-Z]+)\s*\(([0-9]+)\)/i);
  if (polMatch) {
    const cat = polMatch[1].charAt(0).toUpperCase() + polMatch[1].slice(1).toLowerCase();
    return getPolicyImageUrl(cat, polMatch[2]);
  }

  return imagePath;
}
