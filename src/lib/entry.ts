import type { Entry, EntryStatus } from './types';

function newId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function createEntry(status: EntryStatus = 'exploring', now = new Date()): Entry {
  const iso = now.toISOString();
  return {
    id: newId(),
    createdAt: iso,
    updatedAt: iso,
    status,
    lastStep: 1,
    step1: {
      event: '',
      interpretation: '',
      emotions: [],
      intensity: null,
      body: [],
      thoughts: '',
      action: '',
      wish: '',
    },
    step2: { signs: [], domains: [], answers: {}, insights: {} },
    step3: {
      protect: '',
      answers: {},
      understandingEdited: false,
      understanding: '',
      acceptMode: null,
      acceptText: '',
      notYetNote: '',
    },
    summary: { nextSign: '', coachNote: '', feeling: null },
  };
}

/** 保存データが古い形でも壊れないよう、足りない項目を補う */
export function normalizeEntry(raw: Partial<Entry> & { id: string }): Entry {
  const base = createEntry(raw.status ?? 'exploring', new Date(raw.createdAt ?? Date.now()));
  return {
    ...base,
    ...raw,
    step1: { ...base.step1, ...raw.step1 },
    step2: { ...base.step2, ...raw.step2 },
    step3: { ...base.step3, ...raw.step3 },
    summary: { ...base.summary, ...raw.summary },
  };
}

export function hasStep1Content(entry: Entry): boolean {
  const s = entry.step1;
  return Boolean(s.event.trim() || s.thoughts.trim() || s.emotions.length || s.interpretation.trim());
}
