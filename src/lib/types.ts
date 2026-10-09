import type { DomainId } from '../content/domains';

/** quick: 記録のみ / exploring: 探索中 / done: 完了 */
export type EntryStatus = 'quick' | 'exploring' | 'done';

/** 1〜3: 各STEP / 4: まとめ */
export type StepNo = 1 | 2 | 3 | 4;

export type Feeling = 'clearer' | 'same' | 'heavy';

export interface Step1Data {
  event: string;
  interpretation: string;
  emotions: string[];
  /** 感情ごとの強さ（1〜5）。キーは感情の名前。未選択の感情は入らない */
  intensities: Record<string, number>;
  body: string[];
  thoughts: string;
  action: string;
  wish: string;
}

export interface Step2Data {
  signs: string[];
  domains: DomainId[];
  /** 領域ごとの回答。キーは問いの文 */
  answers: Partial<Record<DomainId, Record<string, string>>>;
  insights: Partial<Record<DomainId, string>>;
}

export interface Step3Data {
  protect: string;
  /** キーは問いの文 */
  answers: Record<string, string>;
  /** false のあいだは、回答から組み立てた下書きをそのまま使う */
  understandingEdited: boolean;
  understanding: string;
  acceptMode: 'accept' | 'notyet' | null;
  acceptText: string;
  notYetNote: string;
}

export interface SummaryData {
  nextSign: string;
  coachNote: string;
  feeling: Feeling | null;
}

export interface Entry {
  id: string;
  createdAt: string;
  updatedAt: string;
  status: EntryStatus;
  lastStep: StepNo;
  step1: Step1Data;
  step2: Step2Data;
  step3: Step3Data;
  summary: SummaryData;
}
