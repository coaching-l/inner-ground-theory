import { describe, expect, it } from 'vitest';
import { acceptanceSentence, buildSessionSheet, clean, draftUnderstanding, joinJa, understandingText } from './compose';
import { createEntry } from './entry';
import type { Entry } from './types';

function sample(): Entry {
  const e = createEntry('exploring', new Date('2026-10-09T10:00:00+09:00'));
  e.step1 = {
    ...e.step1,
    event: '会議で企画に「詰めが甘い」と言われた。',
    interpretation: '能力を否定されたと感じた',
    emotions: ['悔しさ', '不安'],
    intensity: 4,
    body: ['胸が苦しい・ざわざわする'],
    thoughts: 'やっぱり自分は詰めが甘い',
  };
  e.step2 = {
    signs: ['should'],
    domains: ['beliefs', 'selfConcept'],
    answers: { beliefs: { 'この状況で、何を当然だと思っていますか': '企画は最初から完璧であるべき' } },
    insights: { beliefs: '「最初から完璧でなければ」という前提があった' },
  };
  e.step3 = { ...e.step3, protect: 'チームからの信頼', acceptMode: 'accept', acceptText: '期待に応えようとして、自分を追い込みやすい' };
  return e;
}

describe('clean / joinJa', () => {
  it('文末の句点を取り除く', () => {
    expect(clean(' 言われた。 ')).toBe('言われた');
  });
  it('日本語らしく並べる', () => {
    expect(joinJa(['悔しさ'])).toBe('悔しさ');
    expect(joinJa(['悔しさ', '不安'])).toBe('悔しさと不安');
    expect(joinJa(['悔しさ', '不安', '焦り'])).toBe('悔しさ、不安、焦り');
  });
});

describe('draftUnderstanding', () => {
  it('回答から「つながりの一文」を組み立てる', () => {
    expect(draftUnderstanding(sample())).toBe(
      [
        '「会議で企画に「詰めが甘い」と言われた」という出来事で、私は悔しさと不安を感じた。',
        '頭の中では「やっぱり自分は詰めが甘い」という言葉が繰り返されていた。',
        'その背景には、ビリーフ（「最初から完璧でなければ」という前提があった）と自己概念が関わっていたのかもしれない。',
        'あの反応は、チームからの信頼を守ろうとしていたのだと思う。',
      ].join('\n'),
    );
  });

  it('何も書いていなければ空になる', () => {
    expect(draftUnderstanding(createEntry())).toBe('');
  });

  it('書き直した後は、書き直した文を使う', () => {
    const e = sample();
    expect(understandingText(e)).toBe(draftUnderstanding(e));
    e.step3.understandingEdited = true;
    e.step3.understanding = '自分の言葉で書いた理解';
    expect(understandingText(e)).toBe('自分の言葉で書いた理解');
  });
});

describe('acceptanceSentence', () => {
  it('受け止めてみる場合', () => {
    expect(acceptanceSentence(sample())).toBe('今の私には、期待に応えようとして、自分を追い込みやすいという側面がある。');
  });
  it('まだ受け入れられない場合も、そのまま言葉にする', () => {
    const e = sample();
    e.step3.acceptMode = 'notyet';
    expect(acceptanceSentence(e)).toBe('まだ受け入れられない。そう感じている自分がいる。');
  });
  it('未選択なら空', () => {
    expect(acceptanceSentence(createEntry())).toBe('');
  });
});

describe('buildSessionSheet', () => {
  it('ガイド第9章のA・B・Cの順にまとめ、空欄の項目は出さない', () => {
    const sheet = buildSessionSheet(sample());
    const a = sheet.indexOf('A．現在のテーマ');
    const b = sheet.indexOf('B．関係していそうな自己知識の領域');
    const c = sheet.indexOf('C．理解と受容');
    expect(a).toBeGreaterThan(0);
    expect(b).toBeGreaterThan(a);
    expect(c).toBeGreaterThan(b);
    expect(sheet).toContain('感情：悔しさ、不安（強さ：強い）');
    expect(sheet).toContain('■ 今回、特に深めたい領域：ビリーフ、自己概念');
    expect(sheet).toContain('A．企画は最初から完璧であるべき');
    expect(sheet).toContain('今の私には、期待に応えようとして、自分を追い込みやすいという側面がある。');
    expect(sheet).not.toContain('本当はどうしたいと思っているか');
    expect(sheet).not.toMatch(/\n{3,}/);
  });
});
