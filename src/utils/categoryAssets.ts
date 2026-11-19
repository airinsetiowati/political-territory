import { TerritoryCategory } from '../types/game';

// Direct imports so Vite bundles and hashes them for production
import politicsImg from '../../map/Politics.jpeg';
import industryImg from '../../map/Industry.jpeg';
import educationImg from '../../map/Education.jpeg';
import healthcareImg from '../../map/Healthcare.jpeg';
import agricultureImg from '../../map/Agriculture.jpeg';
import waterImg from '../../map/Water.jpeg';
import tourismImg from '../../map/Tourism.jpeg';
import forestImg from '../../map/Forest.jpeg';
import originalBoardMapImg from '../../map/web.png';

export const ORIGINAL_BOARD_MAP = originalBoardMapImg;

export const CATEGORY_LOGOS: Record<TerritoryCategory, string> = {
  politics: politicsImg,
  industry: industryImg,
  education: educationImg,
  healthcare: healthcareImg,
  agriculture: agricultureImg,
  water: waterImg,
  tourism: tourismImg,
  forest: forestImg,
};

export const CATEGORY_NAMES: Record<TerritoryCategory, string> = {
  politics: 'Politics',
  industry: 'Industry',
  education: 'Education',
  healthcare: 'Healthcare',
  agriculture: 'Agriculture',
  water: 'Water',
  tourism: 'Tourism',
  forest: 'Forest',
};

export function getCategoryLogo(category: TerritoryCategory): string {
  return CATEGORY_LOGOS[category] || politicsImg;
}
