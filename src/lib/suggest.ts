// STEP2：サインとSTEP1の言葉から、関係していそうな領域の「仮説」を出す
// AIは使わず、content/signs.ts のルールだけで決まります。

import { DOMAINS, type DomainId } from '../content/domains';
import { KEYWORD_HINTS, SIGNS, STRONG_EMOTION_THRESHOLD, SUGGESTION_COUNT } from '../content/signs';
import type { Step1Data } from './types';

export interface DomainSuggestion {
  domain: DomainId;
  score: number;
  reasons: string[];
}

/** 出来事（事実）は他人の言葉を含みやすいので、キーワードは本人の反応からだけ拾う */
function reactionText(step1: Step1Data): string {
  return [step1.interpretation, step1.thoughts, step1.action, step1.wish].join('\n');
}

export function suggestDomains(step1: Step1Data, signIds: string[]): DomainSuggestion[] {
  const scores = new Map<DomainId, DomainSuggestion>();
  const add = (domain: DomainId, points: number, reason: string) => {
    const cur = scores.get(domain) ?? { domain, score: 0, reasons: [] };
    cur.score += points;
    if (!cur.reasons.includes(reason)) cur.reasons.push(reason);
    scores.set(domain, cur);
  };

  for (const sign of SIGNS) {
    if (!signIds.includes(sign.id)) continue;
    for (const [domain, weight] of Object.entries(sign.weights) as [DomainId, number][]) {
      add(domain, weight, `チェックしたサイン：${sign.text}`);
    }
  }

  const text = reactionText(step1);
  for (const hint of KEYWORD_HINTS) {
    if (hint.pattern.test(text)) add(hint.domain, 1, hint.reason);
  }

  if (step1.intensity !== null && step1.intensity >= STRONG_EMOTION_THRESHOLD) {
    add('emotions', 1, '感情の強さが「強い」以上でした');
  }

  const order = new Map(DOMAINS.map((d, i) => [d.id, i]));
  return [...scores.values()]
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score || order.get(a.domain)! - order.get(b.domain)!)
    .slice(0, SUGGESTION_COUNT);
}
