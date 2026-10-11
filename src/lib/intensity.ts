// 感情ごとの強さ（1〜5）の読み書きと、感情の並び順

import { INTENSITY_LABELS, TENSE_EMOTIONS, WARM_EMOTIONS } from '../content/reactions';
import type { Tone } from './types';

/** 感情の強さを読む。書き足した感情の名前が組み込みの名前（constructor など）と重なっても、保存データが壊れていても誤らない */
export function levelOf(levels: Record<string, number>, emotion: string): number | undefined {
  if (!Object.hasOwn(levels, emotion)) return undefined;
  const level = levels[emotion];
  return typeof level === 'number' && Object.hasOwn(INTENSITY_LABELS, level) ? level : undefined;
}

/** 感情の強さを1つ変える。null なら外す */
export function setLevel(levels: Record<string, number>, emotion: string, level: number | null): Record<string, number> {
  const rest = Object.entries(levels).filter(([e]) => e !== emotion);
  return Object.fromEntries(level === null ? rest : [...rest, [emotion, level]]);
}

/** 用意した感情はチップと同じ並びに、書き足した感情はそのあとに、書き足した順で並べる。
 *  うれしかった出来事のときは、あたたかい・明るい感情のグループを先に出す（チップの並びと同じ） */
export function emotionGroupsInOrder(tone: Tone | null): string[][] {
  return tone === 'positive' ? [WARM_EMOTIONS, TENSE_EMOTIONS] : [TENSE_EMOTIONS, WARM_EMOTIONS];
}

export function orderEmotions(emotions: string[], tone: Tone | null = null): string[] {
  const preset = emotionGroupsInOrder(tone).flat();
  return [...preset.filter((e) => emotions.includes(e)), ...emotions.filter((e) => !preset.includes(e))];
}
