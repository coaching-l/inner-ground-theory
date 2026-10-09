import { describe, expect, it } from 'vitest';
import { createEntry, normalizeEntry } from './entry';
import type { Entry } from './types';

describe('normalizeEntry', () => {
  it('以前の形（強さが1つだけ）の記録は、選んでいた感情すべてにその強さを付ける', () => {
    const old = createEntry() as Entry & { step1: Record<string, unknown> };
    const { intensities: _drop, ...step1 } = old.step1;
    const legacy = { ...old, step1: { ...step1, emotions: ['悔しさ', '不安'], intensity: 4 } };
    const entry = normalizeEntry(JSON.parse(JSON.stringify(legacy)));
    expect(entry.step1.intensities).toEqual({ 悔しさ: 4, 不安: 4 });
    expect('intensity' in entry.step1).toBe(false);
  });

  it('以前の形で強さが未選択なら、強さは空のまま', () => {
    const old = createEntry();
    const { intensities: _drop, ...step1 } = old.step1;
    const legacy = { ...old, step1: { ...step1, emotions: ['悔しさ'], intensity: null } };
    expect(normalizeEntry(JSON.parse(JSON.stringify(legacy))).step1.intensities).toEqual({});
  });

  it('新しい形の記録はそのまま読み込む', () => {
    const e = createEntry();
    e.step1.emotions = ['悔しさ', '不安'];
    e.step1.intensities = { 悔しさ: 5 };
    expect(normalizeEntry(JSON.parse(JSON.stringify(e))).step1.intensities).toEqual({ 悔しさ: 5 });
  });
});
