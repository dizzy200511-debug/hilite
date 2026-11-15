import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, HashRouter } from 'react-router-dom';
import { AuthProvider } from './auth/AuthProvider';
import { ToastProvider } from './components/ui';
import App from './App';
import '@fontsource-variable/hanken-grotesk';
import './styles/app.css';

// The Windows app loads files from disk, so it uses hash URLs. The website uses normal paths.
const Router = __DESKTOP__ ? HashRouter : BrowserRouter;

// Apply the saved theme before first paint to avoid a flash.
try {
  const t = localStorage.getItem('hilite:theme');
  const dark = t === 'dark' || ((!t || t === 'auto') && window.matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
} catch { /* ignore */ }

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Router>
      <AuthProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </AuthProvider>
    </Router>
  </StrictMode>,
);
