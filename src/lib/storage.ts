// 端末内（localStorage）への保存
// 外部には一切送信しません。ブラウザのデータを消すと記録も消えます。

import { normalizeEntry } from './entry';
import type { Entry } from './types';

const ENTRIES_KEY = 'inner-ground-note:entries:v1';
const WELCOMED_KEY = 'inner-ground-note:welcomed:v1';

export function isStorageAvailable(): boolean {
  try {
    const k = '__ign_test__';
    window.localStorage.setItem(k, '1');
    window.localStorage.removeItem(k);
    return true;
  } catch {
    return false;
  }
}

export function loadEntries(): Entry[] {
  try {
    const raw = window.localStorage.getItem(ENTRIES_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((e): e is Entry => typeof e === 'object' && e !== null && typeof (e as Entry).id === 'string')
      .map((e) => normalizeEntry(e));
  } catch {
    return [];
  }
}

export function saveEntries(entries: Entry[]): boolean {
  try {
    window.localStorage.setItem(ENTRIES_KEY, JSON.stringify(entries));
    return true;
  } catch {
    return false;
  }
}

export function clearEntries(): void {
  try {
    window.localStorage.removeItem(ENTRIES_KEY);
  } catch {
    // 保存できない環境では何もしない
  }
}

export function hasWelcomed(): boolean {
  try {
    return window.localStorage.getItem(WELCOMED_KEY) === '1';
  } catch {
    return false;
  }
}

export function markWelcomed(): void {
  try {
    window.localStorage.setItem(WELCOMED_KEY, '1');
  } catch {
    // 保存できない環境では毎回表示される
  }
}
