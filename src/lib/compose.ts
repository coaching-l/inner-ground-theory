// 回答から文章を組み立てる（つながりの一文・受容の一文・セッション準備シート）

import { STEP3_COPY } from '../content/app';
import { DOMAIN_BY_ID } from '../content/domains';
import { INTENSITY_LABELS } from '../content/reactions';
import { levelOf } from './intensity';
import { SIGNS } from '../content/signs';
import type { Entry } from './types';

/** 前後の空白と、文末の句点・感嘆符を取り除く（「」の中に入れるため） */
export function clean(text: string): string {
  return text.trim().replace(/[。．.！!]+$/u, '').trim();
}

/** ["a"] → a / ["a","b"] → aとb / ["a","b","c"] → a、b、c */
export function joinJa(items: string[]): string {
  if (items.length <= 2) return items.join('と');
  return items.join('、');
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  }).format(new Date(iso));
}

export function draftUnderstanding(entry: Entry): string {
  const { step1, step2, step3 } = entry;
  const lines: string[] = [];

  const event = clean(step1.event);
  if (event && step1.emotions.length) {
    lines.push(`「${event}」という出来事で、私は${joinJa(step1.emotions)}を感じた。`);
  } else if (event) {
    lines.push(`「${event}」という出来事で、私の心が動いた。`);
  } else if (step1.emotions.length) {
    lines.push(`私は${joinJa(step1.emotions)}を感じた。`);
  }

  const thoughts = clean(step1.thoughts);
  if (thoughts) lines.push(`頭の中では「${thoughts}」という言葉が繰り返されていた。`);

  const parts = step2.domains.map((id) => {
    const insight = clean(step2.insights[id] ?? '');
    const name = DOMAIN_BY_ID[id].name;
    return insight ? `${name}（${insight}）` : name;
  });
  if (parts.length) lines.push(`その背景には、${joinJa(parts)}が関わっていたのかもしれない。`);

  const protect = clean(step3.protect);
  if (protect) lines.push(`あの反応は、${protect}を守ろうとしていたのだと思う。`);

  return lines.join('\n');
}

/** 利用者が書き直していればそれを、まだなら下書きを返す */
export function understandingText(entry: Entry): string {
  return entry.step3.understandingEdited ? entry.step3.understanding : draftUnderstanding(entry);
}

export function acceptanceSentence(entry: Entry): string {
  const { step3 } = entry;
  if (step3.acceptMode === 'notyet') return STEP3_COPY.notYetSentence;
  if (step3.acceptMode === 'accept') {
    const body = clean(step3.acceptText);
    if (body) return `${STEP3_COPY.acceptPrefix}${body}${STEP3_COPY.acceptSuffix}`;
  }
  return '';
}

/** 悔しさ（強い）のように、強さがあれば添える */
export function withIntensity(emotion: string, level: number | undefined): string {
  return level ? `${emotion}（${INTENSITY_LABELS[level]}）` : emotion;
}

function item(label: string, value: string): string[] {
  const v = value.trim();
  return v ? [`■ ${label}`, v, ''] : [];
}

/** ガイド第9章「セッション準備・振り返りシート」の形でテキストにする */
export function buildSessionSheet(entry: Entry): string {
  const { step1, step2, step3, summary } = entry;
  const out: string[] = ['【内的土壌 セッション準備シート】', `記入日：${formatDate(entry.createdAt)}`, ''];

  out.push('A．現在のテーマ', '');
  out.push(...item('今回扱いたい出来事（事実）', step1.event));
  out.push(...item('どう受け取ったか（解釈）', step1.interpretation));
  const feel: string[] = [];
  if (step1.emotions.length) {
    feel.push(`感情：${step1.emotions.map((e) => withIntensity(e, levelOf(step1.intensities, e))).join('、')}`);
  }
  if (step1.body.length) feel.push(`身体：${step1.body.join('、')}`);
  out.push(...item('感じていること・身体の反応', feel.join('\n')));
  out.push(...item('頭の中で繰り返している考え', step1.thoughts));
  out.push(...item('とった行動・とりたかった行動', step1.action));
  out.push(...item('本当はどうしたいと思っているか', step1.wish));

  out.push('B．関係していそうな自己知識の領域', '');
  const signs = SIGNS.filter((s) => step2.signs.includes(s.id)).map((s) => `・${s.text}`);
  out.push(...item('当てはまったサイン', signs.join('\n')));
  if (step2.domains.length) {
    out.push(`■ 今回、特に深めたい領域：${step2.domains.map((id) => DOMAIN_BY_ID[id].name).join('、')}`);
    for (const id of step2.domains) {
      const domain = DOMAIN_BY_ID[id];
      out.push(`［${domain.name}］`);
      const insight = (step2.insights[id] ?? '').trim();
      if (insight) out.push(`気づき：${insight}`);
      for (const [q, a] of Object.entries(step2.answers[id] ?? {})) {
        if (a.trim()) out.push(`Q．${q}`, `A．${a.trim()}`);
      }
    }
    out.push('');
  }

  out.push('C．理解と受容', '');
  out.push(...item('何を守ろうとしていたか', step3.protect));
  for (const [q, a] of Object.entries(step3.answers)) {
    out.push(...item(q, a));
  }
  out.push(...item('今回理解できたこと', understandingText(entry)));
  const accept = [acceptanceSentence(entry), step3.acceptMode === 'notyet' ? step3.notYetNote : '']
    .filter((s) => s.trim())
    .join('\n');
  out.push(...item('受け入れたい現在の自分', accept));
  out.push(...item('次に気づきたいサイン', summary.nextSign));
  out.push(...item('セッションで話したいこと', summary.coachNote));

  return out.join('\n').replace(/\n{3,}/g, '\n\n').trim() + '\n';
}
