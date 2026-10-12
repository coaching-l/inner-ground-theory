// 出来事の種類（引っかかった／うれしかった／両方）に合わせて、問いの言葉を切り替える

import { TENSE_EMOTIONS, WARM_EMOTIONS } from '../content/reactions';
import type { Step1Data, Tone, Variants } from './types';

/** 選んだ感情から出来事の種類を判断する。書き足した感情は判断に使わない */
export function inferTone(emotions: string[]): Tone | null {
  const warm = emotions.some((e) => WARM_EMOTIONS.includes(e));
  const tense = emotions.some((e) => TENSE_EMOTIONS.includes(e));
  if (warm && tense) return 'mixed';
  if (warm) return 'positive';
  if (tense) return 'negative';
  return null;
}

/** 利用者が選んだ種類を優先し、選んでいなければ感情から判断する */
export function toneOf(step1: Pick<Step1Data, 'tone' | 'emotions'>): Tone | null {
  return step1.tone ?? inferTone(step1.emotions);
}

/** まとめの案内（この先の進め方・繰り返したいこと・分かち合いたいことの欄・シートの見出し）に使う種類。
 *  「セッションで無理に扱わなくてよい」は本人が「うれしかった」を選んだときだけ案内するため、
 *  種類を選んでいなければ、感情から「引っかかった」と判断できるときだけそれを使い、ほかは「両方ある」と同じ扱いにする */
export function guidanceToneOf(step1: Pick<Step1Data, 'tone' | 'emotions'>): Tone | null {
  if (step1.tone) return step1.tone;
  return inferTone(step1.emotions) === 'negative' ? 'negative' : null;
}

/** 種類に合う文言を選ぶ。両方ある・判断できないときは、どちらにも合う文言 */
export function pick<T>(variants: Variants<T>, tone: Tone | null): T {
  if (tone === 'negative') return variants.negative;
  if (tone === 'positive') return variants.positive;
  return variants.neutral;
}

/** 種類に合う問いを先に出し、ほかの問いは「ほかの問い」に回す。
 *  引っかかった出来事のときは、うれしかった出来事を前提にした問いは出さない */
export function splitQuestions(
  sets: { negative: string[]; positive: string[]; extra?: string[] },
  tone: Tone | null,
): { featured: string[]; more: string[] } {
  const featured = tone === 'positive' ? sets.positive : sets.negative;
  const rest = [
    ...(tone === 'positive' ? sets.negative : []),
    ...(sets.extra ?? []),
    ...(tone === 'mixed' || tone === null ? sets.positive : []),
  ];
  return { featured, more: [...new Set(rest)].filter((q) => !featured.includes(q)) };
}

/** 出来事の種類を変える前に答えていた問いも、消えずに表示されるように残す
 *  （書き直すために答えを一度消しても、問いが消えないよう「答えたことがあるか」で判断する） */
export function keepAnswered(questions: string[], variants: Variants<string[]>, answers: Record<string, string>): string[] {
  const others = [...variants.negative, ...variants.positive, ...variants.neutral].filter(
    (q) => !questions.includes(q) && Object.hasOwn(answers, q),
  );
  return [...questions, ...new Set(others)];
}
