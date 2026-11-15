/// <reference types="vite/client" />
declare const __DESKTOP__: boolean;
interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
  readonly VITE_SITE_URL?: string;
}
interface HiliteDesktop {
  platform: string;
  version: string;
  openExternal(url: string): void;
  onAuthCallback(cb: (url: string) => void): void;
  notify(title: string, body: string): void;
  setTimer(text: string | null): void;
  onUpdate(cb: (state: { status: string; version?: string; percent?: number }) => void): void;
  installUpdate(): void;
  getStartWithWindows(): Promise<boolean>;
  setStartWithWindows(on: boolean): void;
}
interface Window { hiliteDesktop?: HiliteDesktop }
