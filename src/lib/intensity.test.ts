import { describe, expect, it } from 'vitest';
import { levelOf, orderEmotions, setLevel } from './intensity';

describe('levelOf', () => {
  it('選んだ強さを返し、未選択なら undefined', () => {
    expect(levelOf({ 悔しさ: 4 }, '悔しさ')).toBe(4);
    expect(levelOf({ 悔しさ: 4 }, '不安')).toBeUndefined();
  });

  it('書き足した感情の名前が組み込みの名前と重なっても誤らない', () => {
    expect(levelOf({}, 'constructor')).toBeUndefined();
    expect(levelOf({}, 'toString')).toBeUndefined();
    expect(levelOf(setLevel({}, '__proto__', 3), '__proto__')).toBe(3);
  });

  it('保存データが壊れていたら無視する', () => {
    const broken = JSON.parse('{"a":0,"b":7,"c":"4"}');
    expect(levelOf(broken, 'a')).toBeUndefined();
    expect(levelOf(broken, 'b')).toBeUndefined();
    expect(levelOf(broken, 'c')).toBeUndefined();
  });
});

describe('setLevel', () => {
  it('ほかの感情の強さを変えずに、1つだけ付け替え・外しができる', () => {
    const levels = setLevel(setLevel({}, '悔しさ', 5), '不安', 2);
    expect(levels).toEqual({ 悔しさ: 5, 不安: 2 });
    expect(setLevel(levels, '悔しさ', null)).toEqual({ 不安: 2 });
    expect(levels).toEqual({ 悔しさ: 5, 不安: 2 });
  });
});

describe('orderEmotions', () => {
  it('用意した感情はチップの並びに、書き足した感情はそのあとに並べる', () => {
    expect(orderEmotions(['悔しさ', '情けなさ', '不安', '置いていかれた感じ'])).toEqual([
      '不安',
      '悔しさ',
      '情けなさ',
      '置いていかれた感じ',
    ]);
  });
});
