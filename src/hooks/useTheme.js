import { useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';

export function useTheme() {
  const saved = useLiveQuery(async () => (await db.settings.get('theme'))?.value, []);

  const theme = saved
    ?? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  async function setTheme(value) {
    localStorage.setItem('theme', value);
    await db.settings.put({ key: 'theme', value });
  }

  return [theme, setTheme];
}
