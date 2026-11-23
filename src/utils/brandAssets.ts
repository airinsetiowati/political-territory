// Official brand assets.
// Imported through Vite so the emitted URL automatically follows the
// configured `base` path (works on localhost and GitHub Pages subfolders).
import logoImg from '../../logo game/logo.png';

export const BRAND_LOGO = logoImg;

const BASE_URL = import.meta.env.BASE_URL || '/';
const normalizedBase = BASE_URL.endsWith('/') ? BASE_URL : `${BASE_URL}/`;

// Stable, base-aware copy emitted to dist/game-assets/logo.png.
// This is the same proven path used by the working Play Game header.
export const BRAND_LOGO_STABLE = `${normalizedBase}game-assets/logo.png`;
