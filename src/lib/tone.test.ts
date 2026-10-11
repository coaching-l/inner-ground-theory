import { describe, expect, it } from 'vitest';
import { inferTone, keepAnswered, pick, splitQuestions, toneOf } from './tone';

describe('inferTone / toneOf', () => {
  it('選んだ感情から出来事の種類を判断する', () => {
    expect(inferTone([])).toBeNull();
    expect(inferTone(['悔しさ', '不安'])).toBe('negative');
    expect(inferTone(['感謝', '充実感'])).toBe('positive');
    expect(inferTone(['不安', 'ワクワク'])).toBe('mixed');
    expect(inferTone(['書き足した感情'])).toBeNull();
  });

  it('利用者が選んだ種類を優先する', () => {
    expect(toneOf({ tone: 'positive', emotions: ['悔しさ'] })).toBe('positive');
    expect(toneOf({ tone: null, emotions: ['悔しさ'] })).toBe('negative');
  });
});

describe('pick', () => {
  const v = { negative: 'N', positive: 'P', neutral: 'X' };
  it('両方ある・未選択のときは、どちらにも合う文言を使う', () => {
    expect(pick(v, 'negative')).toBe('N');
    expect(pick(v, 'positive')).toBe('P');
    expect(pick(v, 'mixed')).toBe('X');
    expect(pick(v, null)).toBe('X');
  });
});

describe('splitQuestions', () => {
  const sets = { negative: ['n1', 'n2'], positive: ['p1', 'n2'], extra: ['e1'] };
  it('うれしかった出来事では、その問いを先に出し、ほかの問いも残す', () => {
    expect(splitQuestions(sets, 'positive')).toEqual({ featured: ['p1', 'n2'], more: ['n1', 'e1'] });
  });
  it('それ以外では、いつもの問いを先に出し、うれしかった出来事の問いは「ほかの問い」に回す', () => {
    expect(splitQuestions(sets, 'negative')).toEqual({ featured: ['n1', 'n2'], more: ['e1', 'p1'] });
    expect(splitQuestions(sets, null)).toEqual({ featured: ['n1', 'n2'], more: ['e1', 'p1'] });
  });
});

describe('keepAnswered', () => {
  it('種類を変える前に答えていた問いも残す', () => {
    const variants = { negative: ['a', 'b'], positive: ['c'], neutral: ['a', 'c'] };
    expect(keepAnswered(['c'], variants, { a: '答え', b: ' ' })).toEqual(['c', 'a']);
  });
});
