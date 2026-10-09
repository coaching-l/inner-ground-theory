import { describe, expect, it } from 'vitest';
import { createEntry } from './entry';
import { suggestDomains } from './suggest';

function step1(patch: Partial<ReturnType<typeof createEntry>['step1']> = {}) {
  return { ...createEntry().step1, ...patch };
}

describe('suggestDomains', () => {
  it('手がかりがなければ候補は出さない', () => {
    expect(suggestDomains(step1(), [])).toEqual([]);
  });

  it('チェックしたサインの領域を、理由つきで候補にする', () => {
    const result = suggestDomains(step1(), ['should']);
    expect(result[0].domain).toBe('beliefs');
    expect(result[0].reasons[0]).toContain('「〜すべき」');
  });

  it('本人の言葉に含まれる表現も手がかりにする', () => {
    const result = suggestDomains(step1({ thoughts: 'やっぱり自分は詰めが甘い。もっと完璧にしなければ' }), []);
    const ids = result.map((r) => r.domain);
    expect(ids).toContain('selfConcept');
    expect(ids).toContain('beliefs');
  });

  it('「〜しなければよかった」は後悔なので、ビリーフの手がかりにしない', () => {
    expect(suggestDomains(step1({ thoughts: 'あんなこと言わなければよかった' }), [])).toEqual([]);
  });

  it('出来事（事実）の欄に書いた他人の言葉は手がかりにしない', () => {
    const result = suggestDomains(step1({ event: '部長に「もっと早く報告すべきだ」と言われた' }), []);
    expect(result).toEqual([]);
  });

  it('感情が強いときは「感情」を候補に加える', () => {
    const result = suggestDomains(step1({ emotions: ['怒り', '不安'], intensities: { 怒り: 5, 不安: 2 } }), []);
    expect(result.map((r) => r.domain)).toEqual(['emotions']);
    expect(result[0].reasons).toEqual(['「怒り」の強さが「強い」以上でした']);
  });

  it('どの感情も強くなければ「感情」は候補にしない', () => {
    expect(suggestDomains(step1({ emotions: ['怒り', '不安'], intensities: { 怒り: 3, 不安: 1 } }), [])).toEqual([]);
  });

  it('点数の高い順に最大3つまで返す', () => {
    const result = suggestDomains(step1({ thoughts: '仕方ない' }), ['carry', 'cant-ask', 'should', 'compare']);
    expect(result).toHaveLength(3);
    expect(result[0].domain).toBe('relationships');
    for (let i = 1; i < result.length; i++) {
      expect(result[i - 1].score).toBeGreaterThanOrEqual(result[i].score);
    }
  });
});
