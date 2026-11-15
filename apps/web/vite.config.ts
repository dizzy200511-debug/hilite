import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { buildExamPages } from './src/seo/examPages';

/** Static exam-date pages, sitemap.xml and robots.txt for the website (not the Windows app). */
function examPages(site: string): Plugin {
  const pathToFile = (url: string) => (url === '/exam-dates' ? 'exam-dates.html' : /^\/exam-dates\/[a-z0-9-]+$/.test(url) ? url.slice(1) + '.html' : url.slice(1));
  return {
    name: 'hilite-exam-pages',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = (req.url || '').split('?')[0];
        if (!/^\/(exam-dates(\/[a-z0-9.-]+)?|sitemap\.xml|robots\.txt)$/.test(url)) return next();
        const css = ['/node_modules/@fontsource-variable/hanken-grotesk/index.css', '/src/styles/app.css'];
        const file = buildExamPages({ css, site }).find((f) => f.fileName === pathToFile(url));
        if (!file) return next();
        const type = file.fileName.endsWith('.js') ? 'text/javascript' : file.fileName.endsWith('.xml') ? 'application/xml' : file.fileName.endsWith('.txt') ? 'text/plain' : 'text/html';
        res.setHeader('Content-Type', type + '; charset=utf-8');
        res.end(file.source);
      });
    },
    generateBundle(_, bundle) {
      const entry = Object.values(bundle).find((c) => c.type === 'chunk' && c.isEntry);
      const css = entry && entry.type === 'chunk' ? [...(entry.viteMetadata?.importedCss ?? [])].map((f) => '/' + f) : [];
      for (const f of buildExamPages({ css, site })) this.emitFile({ type: 'asset', fileName: f.fileName, source: f.source });
    },
  };
}

export default defineConfig(({ mode }) => {
  const desktop = mode === 'desktop';
  const site = (loadEnv(mode, process.cwd(), 'VITE_').VITE_SITE_URL || 'https://hilite.study').replace(/\/$/, '');
  return {
    plugins: [react(), ...(desktop ? [] : [examPages(site)])],
    base: desktop ? './' : '/',
    define: { __DESKTOP__: JSON.stringify(desktop) },
    build: {
      outDir: desktop ? '../desktop/app' : 'dist',
      emptyOutDir: true,
      sourcemap: false,
    },
  };
});
