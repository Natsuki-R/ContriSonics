const THEME_STORAGE_KEY = "contrisonics-theme";

export function ThemeScript() {
  const code = `(() => {
  try {
    const stored = window.localStorage.getItem('${THEME_STORAGE_KEY}');
    const isValid = stored === 'light' || stored === 'dark' || stored === 'system';
    const theme = isValid ? stored : 'system';
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const resolved = theme === 'system' ? systemPrefersDark : theme;
    const root = document.documentElement;
    if (resolved === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    root.dataset.theme = resolved;
    try { root.style.colorScheme = resolved; } catch (error) { /* noop */ }
  } catch (error) {
    // ignore
  }
})();`;

  return <script dangerouslySetInnerHTML={{ __html: code }} suppressHydrationWarning />;
}

export default ThemeScript;
