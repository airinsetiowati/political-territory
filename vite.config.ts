import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

function gameAssetsPlugin(): Plugin {
  let base = '/';

  const setupMiddlewares = (server: any) => {
    server.middlewares.use((req: any, res: any, next: any) => {
      const decodedUrl = decodeURIComponent(req.url || '');
      // Vite serves the app under `base` (e.g. /political-territory/), while
      // asset URLs may arrive with or without that prefix. Strip it so the
      // same middleware works on localhost, preview and GitHub Pages.
      const normalizedUrl =
        base !== '/' && decodedUrl.startsWith(base)
          ? '/' + decodedUrl.slice(base.length)
          : decodedUrl;

      if (normalizedUrl.startsWith('/game-assets/')) {
        const subPath = normalizedUrl.replace('/game-assets/', '');
        let filePath = '';
        
        if (subPath === 'logo' || subPath === 'logo.png') {
          filePath = path.resolve('logo game/logo.png');
        } else if (subPath === 'map' || subPath === 'web.png' || subPath === 'map/web.png') {
          filePath = fs.existsSync(path.resolve('map/web.png')) ? path.resolve('map/web.png') : path.resolve('web.png');
        } else if (subPath === 'budget') {
          filePath = path.resolve('GOVERNMENT BUDGET.jpeg');
        } else if (subPath === 'policy-back') {
          filePath = path.resolve('policy card/belakang policy card.png');
        } else if (subPath === 'event-back') {
          filePath = path.resolve('event/belakang event card.png');
        } else if (subPath.startsWith('category/') || subPath.startsWith('map/')) {
          const catFile = subPath.replace(/^(category|map)\//, '');
          filePath = path.resolve('map', catFile);
          if (!fs.existsSync(filePath) && fs.existsSync(path.resolve('map'))) {
            const files = fs.readdirSync(path.resolve('map'));
            const matched = files.find(f => f.toLowerCase() === catFile.toLowerCase() || f.toLowerCase() === `${catFile}.jpeg`.toLowerCase());
            if (matched) filePath = path.resolve('map', matched);
          }
        }
        else if (subPath.startsWith('policy/')) {
          filePath = path.resolve('policy card', subPath.replace('policy/', ''));
        } else if (subPath.startsWith('crisis/')) {
          filePath = path.resolve('event/crisis', subPath.replace('crisis/', ''));
        } else if (subPath.startsWith('mission/')) {
          const reqFile = subPath.replace('mission/', '');
          filePath = path.resolve('event/mission', reqFile);
          if (!fs.existsSync(filePath)) {
            const alt = reqFile.includes('mission') ? reqFile.replace('mission', 'misson') : reqFile.replace('misson', 'mission');
            if (fs.existsSync(path.resolve('event/mission', alt))) {
              filePath = path.resolve('event/mission', alt);
            }
          }
        } else if (subPath.startsWith('opportunity/')) {
          filePath = path.resolve('event/opportunity', subPath.replace('opportunity/', ''));
        }

        if (filePath && fs.existsSync(filePath)) {
          const ext = path.extname(filePath).toLowerCase();
          const mime = ext === '.png' ? 'image/png' : ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' : 'application/octet-stream';
          res.setHeader('Content-Type', mime);
          res.setHeader('Cache-Control', 'public, max-age=3600');
          fs.createReadStream(filePath).pipe(res);
          return;
        }
      }

      // Local state persistence API
      if (req.url === '/api/save-state' && req.method === 'POST') {
        let body = '';
        req.on('data', (chunk: any) => { body += chunk; });
        req.on('end', () => {
          try {
            fs.writeFileSync(path.resolve('game-state-backup.json'), body, 'utf8');
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true }));
          } catch (err: any) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: err.message }));
          }
        });
        return;
      }

      if (req.url === '/api/load-state' && req.method === 'GET') {
        const p = path.resolve('game-state-backup.json');
        if (fs.existsSync(p)) {
          res.setHeader('Content-Type', 'application/json');
          fs.createReadStream(p).pipe(res);
        } else {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(null));
        }
        return;
      }

      next();
    });
  };

  return {
    name: 'game-assets-plugin',
    configResolved(config) {
      base = config.base;
    },
    closeBundle() {
      try {
        const distAssetsDir = path.resolve('dist/game-assets');
        const copyRecursive = (srcDir: string, destDir: string) => {
          if (!fs.existsSync(srcDir)) return;
          fs.mkdirSync(destDir, { recursive: true });
          for (const item of fs.readdirSync(srcDir)) {
            const s = path.join(srcDir, item);
            const d = path.join(destDir, item);
            if (fs.statSync(s).isDirectory()) {
              copyRecursive(s, d);
            } else {
              fs.copyFileSync(s, d);
            }
          }
        };

        if (fs.existsSync(path.resolve('dist'))) {
          fs.mkdirSync(distAssetsDir, { recursive: true });
          copyRecursive(path.resolve('map'), path.join(distAssetsDir, 'category'));
          copyRecursive(path.resolve('map'), path.join(distAssetsDir, 'map'));
          if (fs.existsSync(path.resolve('logo game/logo.png'))) {
            fs.copyFileSync(path.resolve('logo game/logo.png'), path.join(distAssetsDir, 'logo.png'));
          }
          if (fs.existsSync(path.resolve('GOVERNMENT BUDGET.jpeg'))) {
            fs.copyFileSync(path.resolve('GOVERNMENT BUDGET.jpeg'), path.join(distAssetsDir, 'budget.jpeg'));
          }
          if (fs.existsSync(path.resolve('policy card/belakang policy card.png'))) {
            fs.copyFileSync(path.resolve('policy card/belakang policy card.png'), path.join(distAssetsDir, 'policy-back.png'));
          }
          if (fs.existsSync(path.resolve('event/belakang event card.png'))) {
            fs.copyFileSync(path.resolve('event/belakang event card.png'), path.join(distAssetsDir, 'event-back.png'));
          }
          copyRecursive(path.resolve('policy card'), path.join(distAssetsDir, 'policy'));
          copyRecursive(path.resolve('event/crisis'), path.join(distAssetsDir, 'crisis'));
          copyRecursive(path.resolve('event/mission'), path.join(distAssetsDir, 'mission'));
          copyRecursive(path.resolve('event/opportunity'), path.join(distAssetsDir, 'opportunity'));
        }
      } catch (err) {
        console.warn('Failed to copy static assets to dist/game-assets:', err);
      }
    },
    configureServer(server) {
      setupMiddlewares(server);
    },
    configurePreviewServer(server) {
      setupMiddlewares(server);
    }
  };
}

export default defineConfig({
  base: '/political-territory/',
  plugins: [react(), gameAssetsPlugin()],
  server: {
    port: 3000,
    host: true,
    watch: {
      // Game art is served through the middleware above, so there is no need
      // to watch these folders. Skipping them also avoids EBUSY crashes on
      // Windows when an image file is locked by another process.
      ignored: [
        '**/logo game/**',
        '**/map/**',
        '**/policy card/**',
        '**/event/**',
        '**/dist/**',
        '**/*.png',
        '**/*.jpeg',
        '**/*.jpg'
      ]
    }
  }
});
