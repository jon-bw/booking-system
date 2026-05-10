import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);

const DEFAULT_THEME = {
  colors: {
    background: '#0a0a0a',
    surface: '#111111',
    text: '#E8E8E8',
    textMuted: '#6b7280',
    border: '#333333',
    accent: '#5B9BF6',
    accentHover: '#7BB3F8',
    destructive: '#D71921',
  },
  fonts: {
    display: 'Doto, sans-serif',
    body: 'Space Grotesk, sans-serif',
    mono: 'Space Mono, monospace',
  },
  buttonStyle: 'pill',
  borderRadius: '999px',
  mode: 'dark',
};

export function ThemeProvider({ tenantSlug, children }) {
  const [theme, setTheme] = useState(DEFAULT_THEME);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tenantSlug) return;
    setLoading(true);
    fetch(`/api/tenants/${tenantSlug}/theme`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.data) {
          const merged = { ...DEFAULT_THEME, ...data.data };
          merged.colors = { ...DEFAULT_THEME.colors, ...(data.data.colors || {}) };
          merged.fonts = { ...DEFAULT_THEME.fonts, ...(data.data.fonts || {}) };
          setTheme(merged);
          applyCSSTheme(merged);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [tenantSlug]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, loading }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

function applyCSSTheme(t) {
  const root = document.documentElement;
  const c = t.colors || {};
  const f = t.fonts || {};
  root.style.setProperty('--bg', c.background);
  root.style.setProperty('--surface', c.surface);
  root.style.setProperty('--text', c.text);
  root.style.setProperty('--text-muted', c.textMuted);
  root.style.setProperty('--border', c.border);
  root.style.setProperty('--accent', c.accent);
  root.style.setProperty('--accent-hover', c.accentHover || c.accent);
  root.style.setProperty('--destructive', c.destructive);
  root.style.setProperty('--font-display', f.display);
  root.style.setProperty('--font-body', f.body);
  root.style.setProperty('--font-mono', f.mono);
  root.style.setProperty('--radius', t.borderRadius);
}
